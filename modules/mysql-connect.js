require('dotenv').config();

const mysql = require('mysql2');
const pool = mysql.createPool({
host: 'localhost',
user: 'root',
password: '',
database: 'fteam',
waitForConnections: true,
connectionLimit: 5, // 最大連線數
queueLimit: 0 //不給排隊
});
module.exports = pool.promise(); // 滙出 promise pool