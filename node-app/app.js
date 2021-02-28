const express = require('express')
const mysql = require('mysql')
const app = express()
const router = require('./src/router')
const bodyParser = require('body-parser')
const port = 4000;
// const fs = require('fs')
// const path = require('path')
// const axios = require('axios');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()) 
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    if (req.method == 'OPTIONS') {
        res.send(200);
    }
    else {
        next();
    }
});
app.use('/',router)

app.listen(port)
