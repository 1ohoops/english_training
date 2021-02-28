const fs = require('fs')
const path = require('path')
const mysql = require('mysql');
const { user, password } = require('./config')

let words_db = ['cet_4', 'cet_6', 'tem_4', 'tem_8'];

function create_connect(){
  return new Promise((resolve, reject)=>{
    let db = mysql.createConnection({
      host: 'localhost',
      port: '3300',
      user,
      password
    })
    db.connect((err)=>{
      if(err) reject();
      else resolve(db);
    })
  })
}

function db( sql, database = 'words'){
  return new Promise((resolve,reject)=>{
    var connection = mysql.createConnection({
      host: 'localhost',
      port: '3300',
      user,
      password,
      database
    })
    connection.connect((err)=>{
      if(err){
        connection.end();
        resolve();
      }
    })
    connection.query(sql, (err, rows, fields)=>{
      connection.end()
      if(err) reject(err);
      else resolve(rows[0]);
    })
  })
}

function db_create( account ){
  function promise_tasks(db, account, i){
    return new Promise((resolve, reject)=>{
      db.query(`create table user_${ account }.${ i } select * from words.${ i }`,(err)=>{
        if(err) reject();
        else resolve();
      })
    })
  }

  function promise_tasks_copy(db, account, i){
    return new Promise((resolve, reject)=>{
      db.query(`create table user_${ account }.${ i }_learned like words.${ i }`,(err)=>{
        if(err) reject();
        else resolve();
      })
    })
  }

  function books_words_num(db, account, i){
    return new Promise((resolve, reject)=>{
      db.query(`select count(*) from words.${ i }`,(err, rows, fields)=>{
        if(err) reject();
        else{
          let tasks = [];
          for(let j=0; j<2; j++){
            if(j){
              tasks.push(new Promise((resolve,reject)=>{
                db.query(`insert into user_${ account }.user_setting (key_name , value) values ( '${ i }_all' , ${ rows[0]['count(*)'] })`,
                (err)=>{
                  if(err) reject()
                  else resolve()
                })
              }))
            }
            else{
              tasks.push(new Promise((resolve,reject)=>{
                db.query(`insert into user_${ account }.user_setting (key_name , value) values ( '${ i }_learned' , 0)`,
                (err)=>{
                  if(err) reject()
                  else resolve()
                })
              }))
            }
          }
          Promise.all(tasks)
          .then(()=>resolve())
          .catch(()=>reject())
        }
      })
    })
  }

  return new Promise((resolve, reject)=>{
    create_connect().then((db)=>{
      let sql = `create database user_${ account }`;
      db.query(sql,async (err, result)=>{
        if(err){
          console.log(err)
          reject()
        }
        else {
          let tasks=[];
          for(let i of words_db){
            tasks.push(promise_tasks(db, account, i))
            tasks.push(promise_tasks_copy(db, account, i))
          }
          tasks.push(new Promise((resolve, reject)=>{
            db.query(`create table user_${ account }.words_store like words.cet_4`,(err)=>{
              if(err) reject();
              else resolve();
            })
          }))
          tasks.push(new Promise((resolve, reject)=>{
            db.query(`create table user_${ account }.review like words.cet_4`,(err)=>{
              if(err) reject();
              else resolve();
            })
          }))
          tasks.push(new Promise((resolve, reject)=>{
            db.query(`create table user_${ account }.user_setting (key_name varchar(255), value int)`,(err)=>{
              if(err) reject();
              else resolve();
            })
          }))
          tasks.push(new Promise((resolve, reject)=>{
            db.query(`insert into user_${ account }.user_setting (key_name , value) values ( 'day_words_target' , 20 )`,(err)=>{
              if(err) reject();
              else resolve();
            })
          }))
          for( let i of words_db ){
            tasks.push(
              books_words_num(db , account, i)
            )
          }
          Promise.all(tasks)
          .then(()=>{
            db.end();
            resolve();
          })
          .catch(()=>{
            db.query(`drop database user_${ account }`,(err, result)=>{

            })
            db.query(`delete from words.user where account = ${ account }`,(err, result)=>{
              
            })
            db.end();
            reject();
          })
        }
      })
    })
    .catch(()=>{
      reject();
    })
  })
}

function db_get_book_words(sql){
  return new Promise((resolve, reject)=>{
    create_connect()
    .then((db)=>{
      db.query(sql, (err, rows, fields)=>{
        if(err) reject();
        else{
          resolve(rows[0]);
        }
        db.end();
      })
    })
  })
}

function db_executor( sql, database = 'words'){
  return new Promise((resolve,reject)=>{
    var connection = mysql.createConnection({
      host: 'localhost',
      port: '3300',
      user,
      password,
      database
    })
    connection.connect((err)=>{
      if(err){
        connection.end();
        resolve();
      }
    })
    connection.query(sql, (err, rows, fields)=>{
      connection.end()
      if(err) reject(err);
      else resolve(rows);
    })
  })
}

function all_db_executor(sql){
  return new Promise((resolve, reject)=>{
    create_connect()
    .then((db)=>{
      db.query(sql, (err, rows, fields)=>{
        if(err) reject(err)
        else{
          resolve(rows);
        }
        db.end();
      })
    })
  })
}

module.exports = { db, db_create, db_get_book_words, db_executor, all_db_executor }