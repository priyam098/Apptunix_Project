const express = require('express');
const app = express();
const mongoose = require('mongoose');
const connection = require('./connection')
const userServices = require('./Services/user');
const multer = require('multer')
// const path = require('path');
// let upload = multer({dest:'uploads/'});
let storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'uploads/');
        // cb(null, path.join(__dirname, 'uploads/'));
    },
    filename: (req,file,cb)=>{
        cb(null, file.originalname);
    }
});
let upload = multer({storage:storage},{})

app.use(express.static('uploads'));
app.use(express.json());
connection.connect();

app.get('/findUser',userServices.authenticateToken,userServices.findUser);
app.get('/profile',userServices.authenticateToken,userServices.profile);


app.post('/fields',upload.fields([{name:"avatar",maxcount:3},{name:"gallery",maxcount:8}]),userServices.fields);
app.post('/bulk',upload.array('fileName',6),userServices.bulk);
app.post('/single',upload.single('fileName'),userServices.single);
app.post('/login',userServices.login);
app.post('/signup',upload.single('fileName'),userServices.signup);
app.post('/updateAll',userServices.updateAll);
app.post('/update',userServices.authenticateToken,userServices.update);

app.delete('/deleteDoc',userServices.authenticateToken,userServices.deleteDoc);
app.delete('/deleteMany',userServices.deleteMany);

app.patch('/chargeWallet',userServices.authenticateToken,userServices.chargeWallet);
app.patch('/unchargeWallet',userServices.authenticateToken,userServices.unchargeWallet);

app.listen(3000);