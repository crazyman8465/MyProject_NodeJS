const CONST_REDIS_HOST_INFO = "redis://192.168.108.131:6379";
const Redis = require('redis');

class RedisClient {
  constructor() {
    if (!RedisClient.instance) {
      // Redis client instance가 없을 때 초기화
      this.client = Redis.createClient({
        url: CONST_REDIS_HOST_INFO, // Redis 서버의 URL 설정
        legacyMode: true // Redis v4 이상에서는 legacy 모드를 사용
      });

      // Redis 연결
      this.client.connect().catch((err) => {
        console.error('Redis connection error:', err); // Redis 연결 오류 발생 시 에러 출력
      });

      // Redis 에러 핸들링
      this.client.on('error', (err) => {
        console.error('Redis error:', err); // Redis 오류 발생 시 에러 출력
      });

      // 싱글톤 인스턴스 설정
      RedisClient.instance = this; // RedisClient.instance에 현재 인스턴스를 저장
    }

    // 싱글톤 인스턴스 반환
    return RedisClient.instance; // 항상 동일한 인스턴스를 반환
  }

  // Set key-value with optional expiration (TTL in seconds)
  async set(key, value, ttl = null) {
    try {
      await this.client.v4.set(key, value); // 주어진 key에 value 설정
      if (ttl) {
        await this.client.v4.expire(key, ttl); // TTL(유효 시간)이 주어지면 해당 key에 TTL 설정
      }
      console.log(`Key "${key}" set successfully.`); // 설정 성공 메시지 출력
    } catch (err) {
      console.error('Error setting key:', err); // 설정 중 에러 발생 시 에러 메시지 출력
    }
  }

  // Get value by key
  async get(key) {
    try {
      const value = await this.client.v4.get(key); // 주어진 key의 value 가져오기
      console.log(`Value for key "${key}":`, value); // 가져온 value 출력
      return value; // value 반환
    } catch (err) {
      console.error('Error getting key:', err); // 가져오는 중 에러 발생 시 에러 메시지 출력
    }
  }

  // Delete key
  async del(key) {
    try {
      await this.client.v4.del(key); // 주어진 key 삭제
      console.log(`Key "${key}" deleted.`); // 삭제 성공 메시지 출력
    } catch (err) {
      console.error('Error deleting key:', err); // 삭제 중 에러 발생 시 에러 메시지 출력
    }
  }

  // Check if key exists (returns 1 if exists, 0 otherwise)
  async exists(key) {
    try {
      const exists = await this.client.v4.exists(key); // 주어진 key의 존재 여부 확인
      console.log(`Key "${key}" exists:`, exists); // 존재 여부 출력
      return exists; // 존재 여부 반환 (1이면 존재, 0이면 존재하지 않음)
    } catch (err) {
      console.error('Error checking existence of key:', err); // 확인 중 에러 발생 시 에러 메시지 출력
    }
  }

  // Set TTL for a key (in seconds)
  async expire(key, ttl) {
    try {
      await this.client.v4.expire(key, ttl); // 주어진 key에 TTL 설정
      console.log(`TTL for key "${key}" set to ${ttl} seconds.`); // TTL 설정 성공 메시지 출력
    } catch (err) {
      console.error('Error setting TTL for key:', err); // TTL 설정 중 에러 발생 시 에러 메시지 출력
    }
  }

  // Get TTL for a key (returns remaining TTL in seconds)
  async getTTL(key) {
    try {
      const ttl = await this.client.v4.ttl(key); // 주어진 key의 TTL 가져오기
      console.log(`TTL for key "${key}":`, ttl); // TTL 출력
      return ttl; // TTL 반환
    } catch (err) {
      console.error('Error getting TTL for key:', err); // TTL 가져오는 중 에러 발생 시 에러 메시지 출력
    }
  }

  // Close Redis connection
  async close() {
    try {
      await this.client.quit(); // Redis 연결 종료
      console.log('Redis connection closed.'); // 연결 종료 성공 메시지 출력
    } catch (err) {
      console.error('Error closing Redis connection:', err); // 연결 종료 중 에러 발생 시 에러 메시지 출력
    }
  }
}

// RedisClient 싱글톤 인스턴스를 생성하여 모듈로 내보내기
const instance = new RedisClient();
Object.freeze(instance); // 인스턴스가 수정되지 않도록 설정

module.exports = instance; // 싱글톤 인스턴스 모듈로 내보내기