const express = require('express');
const redisClient = require('./redisClient'); // RedisClient 싱글톤 인스턴스를 가져오기
const authMiddleware = require('./authMiddleware'); // 인증 미들웨어
const { successResponse, errorResponse } = require('./responseHandler'); // 공통 응답 모듈 가져오기
const cluster = require('cluster');
const os = require('os');
const { logInfo } = require('./logger'); // 공통 로거 모듈 가져오기

const app = express();
const PORT = process.env.PORT || 3000;
const ENABLE_LOGGING = process.env.ENABLE_LOGGING === 'true';

// JSON 요청 본문을 파싱하기 위한 미들웨어 설정
app.use(express.json());

// 모든 요청에 대한 로깅 미들웨어 추가 (옵션화)
if (ENABLE_LOGGING) {
  app.use((req, res, next) => {
    logInfo(`Worker ${process.pid} is handling request for ${req.method} ${req.url}`);
    next();
  });
}

// 모든 라우트에 인증 미들웨어 적용
app.use(authMiddleware);

// Set key-value pair in Redis
app.post('/set', async (req, res) => {
  const { key, value, ttl } = req.body;
  try {
    await redisClient.set(key, value, ttl); // Redis에 key-value 설정
    successResponse(res, 200, `Key "${key}" set successfully.`);
  } catch (err) {
    errorResponse(res, 500, 'Error setting key.'); // 에러 발생 시 응답
  }
});

// Get value by key from Redis
app.get('/get/:key', async (req, res) => {
  const { key } = req.params;
  try {
    const value = await redisClient.get(key); // Redis에서 key로 value 가져오기
    if (value) {
      successResponse(res, 200, { key, value });
    } else {
      errorResponse(res, 404, `Key "${key}" not found.`); // key가 없을 경우 응답
    }
  } catch (err) {
    errorResponse(res, 500, 'Error getting key.'); // 에러 발생 시 응답
  }
});

// Delete key from Redis
app.delete('/delete/:key', async (req, res) => {
  const { key } = req.params;
  try {
    await redisClient.del(key); // Redis에서 key 삭제
    successResponse(res, 200, `Key "${key}" deleted.`);
  } catch (err) {
    errorResponse(res, 500, 'Error deleting key.'); // 에러 발생 시 응답
  }
});

// Check if key exists in Redis
app.get('/exists/:key', async (req, res) => {
  const { key } = req.params;
  try {
    const exists = await redisClient.exists(key); // Redis에서 key의 존재 여부 확인
    successResponse(res, 200, { key, exists: exists === 1 });
  } catch (err) {
    errorResponse(res, 500, 'Error checking key existence.'); // 에러 발생 시 응답
  }
});

// Set TTL for a key in Redis
app.post('/expire', async (req, res) => {
  const { key, ttl } = req.body;
  try {
    await redisClient.expire(key, ttl); // Redis에서 key의 TTL 설정
    successResponse(res, 200, `TTL for key "${key}" set to ${ttl} seconds.`);
  } catch (err) {
    errorResponse(res, 500, 'Error setting TTL.'); // 에러 발생 시 응답
  }
});

// Get TTL for a key in Redis
app.get('/ttl/:key', async (req, res) => {
  const { key } = req.params;
  try {
    const ttl = await redisClient.getTTL(key); // Redis에서 key의 TTL 가져오기
    successResponse(res, 200, { key, ttl });
  } catch (err) {
    errorResponse(res, 500, 'Error getting TTL.'); // 에러 발생 시 응답
  }
});

// 멀티 프로세싱을 위한 클러스터 설정
if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  logInfo(`Master ${process.pid} is running`);
  logInfo(`Forking ${numCPUs} workers...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    logInfo(`Worker ${worker.process.pid} died. Forking a new worker...`);
    cluster.fork();
  });
} else {
  // 서버 시작
  app.listen(PORT, () => {
    logInfo(`Worker ${process.pid} is running on http://localhost:${PORT}`);
  });
}

// 로드밸런싱을 위한 게이트 API 구성
app.get('/health', (req, res) => {
  successResponse(res, 200, 'API Gateway is healthy.');
});

app.all('*', (req, res) => {
  errorResponse(res, 404, 'Endpoint not found.');
});