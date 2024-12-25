//  nodeon server.js 터미널창에서 경로에 맞추어 실행하기!

const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');

// CORS 설정 활성화
app.use(cors());

// 정적 파일 제공 
app.use(express.static(path.join(__dirname, 'public')));

// 서버 포트 설정
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});