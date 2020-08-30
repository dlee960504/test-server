var express = require('express');
var router = express.Router();

//이 부분은 ../util/mysql.js 로써 모듈화 됐음
/*

//mySQL 연결하기
const mysql = require('mysql2/promise');
let connection

//mysql.createConnection({
const pool = mysql.createPool({
  host: 'test-db.cif9zldlu9sr.ap-northeast-2.rds.amazonaws.com',
  user:'admin',
  password:'deer3337',
  database:'SCHOOL'
})
*/

//module화된 createPool
const pool = require('../utils/mysql');

/*
.then((results) => {
  connection = results;
})
*/

/* API라고 불린다*/
router.get('/', async (req, res, next) => {

  /*
  //SQL connection 및 callback 함수
  connection.query('SELECT * FROM USER_TB', (err, results) => {
    const firstUser = results[0];
    const userID = firstUser.id;
    connection.query('SELECT * FROM REPORT_TB WHERE user_id = ?', [userID], (err2, result2) => {
      res.json({ status: 200, arr: result2});
    });
    //res.json({ status: 200, arr: results});
  })
  //먼저 실행된다. 응답이 올 때 까지 기다리므로
  //res.json({})
  
  //SQL Promise
  connection.query('SELECT * FROM USER_TB')
  .then((result) => {
    retrun connection.query('new query');
  })
  */

  //Async Await
  const connection = await pool.getConnection();
  const [results, metaData] = await connection.query('SELECT * FROM USER_TB');
  connection.release();
  res.json({ status: 200, arr: results});
});

module.exports = router;
