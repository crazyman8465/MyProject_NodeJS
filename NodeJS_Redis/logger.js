// logger.js

const isProduction = process.env.NODE_ENV === 'production';

// 일반 정보 로그 출력 함수
function logInfo(message) {
  if (!isProduction) {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
  }
}

// 디버그 로그 출력 함수
function logDebug(message) {
  if (!isProduction) {
    console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`);
  }
}

// 오류 로그 출력 함수
function logError(message) {
  console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
}

module.exports = {
  logInfo,
  logDebug,
  logError
};