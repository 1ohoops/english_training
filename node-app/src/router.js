const express = require('express')
const multer = require('multer')
const mailer = require('./mailer')
const { db, db_create, db_get_book_words, db_executor, all_db_executor } = require('./db')
const fs = require('fs')
const { F_mail_massage, R_mail_massage } = require('./message')
const { file_url } = require('./config')
const router = express.Router()

router.post('/L',async (req,res)=>{
    let data = req.body;
    let sql = `select account,password from user where account = ${ data.account }`;
    let result = await db(sql);
    if(!result){
        res.send({
            success : false,
            info : '账号不存在'
        })
    }
    else{
        if( result.password === data.password ){
            res.send({
                success : true,
                info : '登陆成功'
            })
        }
        else{
            res.send({
                success : false,
                info : '密码错误'
            })
        }
    }
})

router.post('/R',async (req,res)=>{
    let data = req.body;
    let verification = R_mail_massage[data.mail];
    if( !verification || verification != data.verification ){
        res.send({
            success : false,
            info : '验证码不正确'
        })
    }
    else{
        let sql = `select account from user where mail = '${ data.mail }'`;
        let result = await db( sql ).catch((err)=>{
            console.log(err);
        })
        if(result){
            res.send({
                success : false,
                info : '邮箱已被注册'
            })
        }
        else{
            sql = `select account from user where account = '${ data.account }'`;
            result = await db( sql ).catch((err)=>{
                console.log(err);
            })
            if(result){
                res.send({
                    success : false,
                    info : '账号已存在'
                })
            }
            else{
                sql = `insert into user ( account, password, mail ) values ( '${ data.account }', '${ data.password }', '${ data.mail }' )`;
                db( sql )
                .then(()=>{
                    fs.mkdirSync(file_url + '\\user\\' + data.account)
                    db_create(data.account)
                    .then(()=>{
                        res.send({
                            success : true,
                            info : '注册成功'
                        })
                    })
                    .catch((err)=>{
                        fs.rmdir(file_url + '\\user\\' + data.account,(err)=>{
    
                        })
                        res.send({
                            success : false,
                            info : '注册失败，请稍后重试'
                        })
                    })
                })
                .catch((err)=>{
                    res.send({
                        success : false,
                        info : '注册失败，请稍后重试'
                    })
                })
            }
        }
    }
})

router.post('/F',(req,res)=>{
    let data = req.body;
    let verification = F_mail_massage[data.account].num;
    if( !verification || verification !== data.verification ){
        res.send({
            success : false,
            info : '验证码不正确'
        })
    }
    else{
        let sql = `update user set password = '${ data.password }' where account = '${ data.account }'`;
        db( sql )
        .then(()=>{
            res.send({
                success : true,
                info : '修改成功'
            })
        })
        .catch(()=>{
            res.send({
                success : false,
                info : '修改失败，请稍后重试'
            })
        })
    }
})

router.post('/get_V',async (req,res)=>{
    let data = req.body;
    let num = Math.floor(Math.random()*9000+1000);
    let to;
    if( data.type === '注册' ){
        to = data.mail;
        R_mail_massage[to] = String(num);
        setTimeout(()=>{
            delete  R_mail_massage.to
        },300000)
    }
    else{
        let sql = `select account,mail from user where account = ${ data.account }`;
        let result = await db(sql)
        if( !result ){
             res.send(false)
             return;
        }
        else{
            to = result.mail;
            F_mail_massage[result.account] = {
                num : String(num),
                mail : to
            };
            setTimeout(()=>{
                delete F_mail_massage[result.account]
            },300000)
        }
    }
    mailer( to, num )
    .then(()=>{
        res.send(true)
    })
    .catch(()=>{
        res.send(false)
    })
})

//-------------------------------page

router.post('/user_page/img_update',multer().single('img'),(req,res)=>{
    let { buffer, originalname } = req.file;
    let { account } = req.body

    originalname = account + '.page_img.' + originalname.split('.').slice(-1)

    fs.writeFile(`${ file_url }\\user\\${ account }\\${ originalname }`,buffer,(err)=>{
        if(err){
            res.sendStatus(404)
        }else{
            res.sendStatus(200)
        }
    })
})

router.get('/user_page/img_get', (req,res)=>{
    var query = req.query;
    fs.readdir(`${ file_url }\\user\\${ query.account }`,(err,files)=>{
        if(err){
            res.sendStatus(404)
        }
        else{
            for( let i = 0;i < files.length; i++){
                if( files[i].split('.')[1] === 'page_img' ){
                    fs.readFile(`${ file_url }\\user\\${ query.account }\\${ files[i] }`,(err, data)=>{
                        if(err)  res.sendStatus(404)
                        else res.send(data)
                    })
                    return;
                }
            }
            res.sendStatus(404)
        }
    })
})

//-----------------------------words

router.post('/user_page/words/get_words', (req,res)=>{
    let { account, books } = req.body;
    let tasks = []
    for( let i of books ){
        let sql = `select value from user_${ account }.user_setting where key_name = '${ i }_all'`;
        tasks.push(db_get_book_words(sql))
        sql = `select value from user_${ account }.user_setting where key_name = '${ i }_learned'`;
        tasks.push(db_get_book_words(sql))
    }
    tasks.push(
        db_get_book_words(`select value from user_${ account }.user_setting where key_name = 'day_words_target'`)
    )
    tasks.push(
        db_get_book_words(`select count(*) from user_${ account }.review`)
    )
    Promise.all(tasks)
    .then((result)=>{
        books.push('day_words_target', 'review')
        let send_back = []
        for( let i = 0, j =0; i < books.length ; i++, j++ ){
            if( i == books.length - 2) {
                send_back.push([ books[i], result[j].value ])
            }
            else if( i == books.length - 1 ){
                send_back.push([ books[i], result[j]['count(*)'] ])
            }
            else{
                send_back.push([ books[i]+'_all', result[j++].value ])
                send_back.push([ books[i]+'_learned', result[j].value ])
            }
        }
        res.send(send_back)
    })
    .catch((err)=>{
        res.sendStatus(404)
    })
})

router.get('/user_page/words/change_target',(req, res)=>{
    let { account, value } = req.query
    let sql = `update user_setting set value = '${ value }' where key_name = 'day_words_target'`;
    db(sql, 'user_'+ account )
    .then(()=>{
        res.sendStatus(200)
    })
    .catch((err)=>{
        console.log(err)
        res.sendStatus(400)
    })
})

router.get('/user_page/words/get_start',(req, res)=>{
    let { account, name, target } = req.query
    Promise.all([
        db_executor(`select * from ${ name } limit ${ target }`, 'user_'+ account ),
        db_executor(`select * from review`, 'user_'+ account )
    ])
    .then((result)=>{
        res.send(result)
    })
    .catch((err)=>{
        console.log(err)
        res.sendStatus(400)
    })
})

router.get('/user_page/words/add_collect',(req, res)=>{
    let { account, word, path } = req.query
    let book = path.split('-')[0]
    let sql = `select word from user_${ account }.words_store where word = '${ word }'`;
    all_db_executor(sql)
    .then((result)=>{
        if(result.length > 0 ){
            res.sendStatus(200)
        }
        else{
            sql = `insert into user_${ account }.words_store select * from words.${ book } where word = '${ word }'`;
            all_db_executor(sql)
            .then((result)=>{
                res.send(result)
            })
            .catch((err)=>{
                console.log(err)
                res.sendStatus(400)
            })
        }
    })
    .catch(()=>{
        res.sendStatus(400)
    })
})

router.get('/user_page/words/word_learned',(req, res)=>{
    let { account, word, path } = req.query
    let book = path.split('-')[0]
    Promise.all([
        db_executor(`insert into ${ book }_learned select * from ${ book } where word = '${ word }'`, `user_${ account }`),
        db_executor(`insert into review select * from ${ book } where word = '${ word }'`, `user_${ account }`),
        db_executor(`update user_setting set value=value + 1 where key_name = '${book}_learned'`, `user_${ account }`)
    ])
    .then(()=>{
        Promise.all([
            db_executor(`delete from ${ book } where word = '${ word }'`, `user_${ account }`),
        ])
        .then((result)=>{
            res.sendStatus(200)
        })
        .catch((err)=>{
            console.log(err)
            res.sendStatus(400)
        })
    })
    .catch((err)=>{
        console.log(err)
        res.sendStatus(400)
    })
})

router.get('/user_page/words/word_review_finish',(req, res)=>{
    let { account, word } = req.query
    db_executor(`delete from review where word = '${ word }'`, `user_${ account }`)
    .then(()=>{
        res.sendStatus(200)
    })
    .catch((err)=>{
        console.log(err)
        res.sendStatus(400)
    })
})

//-----------------------------------------------train

router.post('/user_page/train/get_words',(req, res)=>{
    let data = req.body
    let books = ['cet_4','cet_6','tem_4','tem_8']
    let book = books[Math.floor(Math.random()*4)]
    let tasks = []
    let num = Math.floor(data[book].all / 20)
    let start = Math.floor(Math.random()*num)
    for(let i=0; i<20 ;i++){
        let sql = `select * from ${ book } limit ${ start }, 1`
        start += Math.floor(Math.random()*num)
        tasks.push(db(sql))
    }
    Promise.all(tasks)
    .then((result)=>{
        res.send(result)
    })
    .catch((err)=>{ 
        console.log(err)
        res.sendStatus(400)
    })
})

router.get('/user_page/train/get_word_mp3',(req, res)=>{
    let { word, path, type } = req.query;
    let [book, dir] = path.split('-')
    let url
    if(type === 'word'){
        url = `${ file_url }\\${ book }\\${ dir }\\${ word }\\${ word }.mp3`
    }
    else{
        url = `${ file_url }\\${ book }\\${ dir }\\${ word }\\${ word }_sentence.mp3`
    }
    fs.readFile(url,(err, data)=>{
        if(err)  res.sendStatus(404)
        else res.send(data)
    })
})

//-----------------------------------------------my

router.get('/user_page/my/words_collect',(req, res)=>{
    let { account, start, num } = req.query
    let sql = 'select word,accent,mean_cn from words_store ' + (start == '0' ? 'limit 50' : `limit ${ start }, ${ num }`);
    db_executor(sql, 'user_'+ account )
    .then((result)=>{
        res.send(result)
    })
    .catch((err)=>{
        console.log(err)
        res.sendStatus(400)
    })
})

router.get('/user_page/my/book_words',(req, res)=>{
    let { account, type, name, start, num } = req.query
    name = type === 'learned'? name + '_' + type : name
    let sql = `select word,accent,mean_cn from ${ name } ` + (start == '0' ? 'limit 50' : `limit ${ start }, ${ num }`);
    db_executor(sql, 'user_'+ account )
    .then((result)=>{
        res.send(result)
    })
    .catch((err)=>{
        res.sendStatus(400)
    })
})

router.get('/user_page/words/get_word_message',(req, res)=>{
    let { account, type, word, name, part } = req.query;
    let sql
    if(type === 'books'){
        if(part == 'learned') sql = `select * from ${ name }_learned where word = '${ word }'`
        else sql = `select * from ${ name } where word = '${ word }'`
    }
    else{
        sql = `select * from words_store where word = '${ word }'`
    }
    db(sql, `user_${ account }`)
    .then((result)=>{
        res.send(result)
    })
    .catch(()=>{
        res.sendStatus(400)
    })
})

router.get('/user_page/words/get_word_img',(req, res)=>{
    let { word, name, path } = req.query;
    let [book, dir] = path.split('-')
    let url = `${ file_url }\\${ book }\\${ dir }\\${ word }\\${ name }`
    fs.readFile(url,(err, data)=>{
        if(err)  res.sendStatus(404)
        else res.send(data)
    })
})

router.get('/user_page/words/get_word_mp3',(req, res)=>{
    let { word, path, type } = req.query;
    let [book, dir] = path.split('-')
    let url
    if(type === 'word'){
        url = `${ file_url }\\${ book }\\${ dir }\\${ word }\\${ word }.mp3`
    }
    else{
        url = `${ file_url }\\${ book }\\${ dir }\\${ word }\\${ word }_sentence.mp3`
    }
    fs.readFile(url,(err, data)=>{
        if(err)  res.sendStatus(404)
        else res.send(data)
    })
})

module.exports = router