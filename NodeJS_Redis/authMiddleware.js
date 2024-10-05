// authMiddleware.js
function authMiddleware(req, res, next) {

  if ( true ) {
    next();
  } else {

  
    const authHeader = req.headers['authorization'];
  
    if (!authHeader) {
      return res.status(401).send('Authorization header is missing');
    }
  
    // Bearer 토큰 방식: "Bearer <token>"
    const token = authHeader.split(' ')[1];
  
    // 여기에 실제 토큰 검증 로직을 추가합니다.
    // 예시에서는 단순히 토큰 값이 'mysecrettoken'인지 확인합니다.
    if (token === 'mysecrettoken') {
      next();  // 인증 성공 시 다음 미들웨어로 넘어감
    } else {
      res.status(403).send('Invalid token');
    }
  }
  }
  
  module.exports = authMiddleware;
  