var express = require('express');
var router = express.Router();
const crypto = require('crypto');

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
const isLoggedin = require('../utils/isLoggedin');
const jwt = require('jsonwebtoken');

require('dotenv').config();

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
  try{
    const connection = await pool.getConnection();
    const [results, metaData] = await connection.query('SELECT * FROM USER_TB');
    connection.release();
    res.json({ status: 200, arr: results}); //REST 규칙에 의거 20X Brothers (성공규칙들)
  } 
  catch(err){
    console.log(err);
    res.json({status: 500, msg: 'Server Error!'});
  }  
});

//join
router.post('/', async (req, res, next) => {
  try{
    const email = req.body.email;
    const pwd = req.body.pwd;
    const salt = (await crypto.randomBytes(64)).toString('base64');   //base64는 encoding
    const hashedPwd = (crypto.pbkdf2Sync(pwd, salt, 100000, 64, 'SHA512')).toString('base64');
    const connection = await pool.getConnection();
    await connection.query('INSERT INTO USER_TB(email, hashed_pwd, pwd_salt) VALUES(?, ?, ?)', [email, hashedPwd, salt]);
    connection.release();
    res.json({ status: 201, msg: 'Joined Successfully'});
  } 
  catch(err){
    console.log(err);
    res.json({status: 500, msg: 'Server Error!'});
  }
});

//sign in
router.post('/login', async (req, res, next) => {
  try{
    const email = req.body.email;
    const pwd = req.body.pwd;
    const connection = await pool.getConnection();
    const [users] = await connection.query('SELECT * FROM USER_TB WHERE email=?', [email]);
    connection.release();
    if(users.length === 0){
      return res.json({ staus: 401, msg: 'no matched email'});
    }
    const user = users[0];
    const hashedPwd = (crypto.pbkdf2Sync(pwd, user.pwd_salt, 100000, 64, 'SHA512')).toString('base64');
    if(hashedPwd !== user.hashed_pwd){
      return res.json({status: 401, msg: 'Invalid Password!'});
    }
    const token = jwt.sign({id: user.id}, process.env.JWT_SECRET);
    //res.cookie('token', token, { httpOnly: true, secure: true})
    res.json({ status: 201, token: token, msg: 'Signed Successfully'});
  } 
  catch(err){
    console.log(err);
    res.json({status: 500, msg: 'Server Error!'});
  }
});

//token 인증
//router.get 함수 내에는 n개의 async함수가 있을 수 있다. next인자가 그것을 말해준다. 이를 미들웨어라고 불러준다.
router.get('/me/profile', isLoggedin, async (req, res, next) => {
  try{
    const connection = await pool.getConnection();
    const [results, metaData] = await connection.query('SELECT * FROM USER_TB WHERE id = ?', [req.userId]);
    connection.release();
    res.json({ status: 200, arr: results});
  } 
  catch(err){
    console.log(err);
    res.json({status: 500, msg: 'Server Error!'});
  }  
});

module.exports = router;
