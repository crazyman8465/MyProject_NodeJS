// responseHandler.js

// 성공 응답 처리 함수
function successResponse(res, statusCode, message) {
    res.status(statusCode).json({
      success: 1,
      data: message
    });
  }
  
  // 에러 응답 처리 함수
  function errorResponse(res, statusCode, errorMessage) {
    res.status(statusCode).json({
      success: 0,
      error: errorMessage
    });
  }
  
  module.exports = {
    successResponse,
    errorResponse
  };