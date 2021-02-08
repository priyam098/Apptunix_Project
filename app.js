const express = require('express');
const app = express();
const mongoose = require('mongoose');
const connection = require('./connection')
const userServices = require('./Services/user');
app.use(express.json());
connection.connect();

app.post('/login',userServices.login);
app.get('/profile',userServices.authenticateToken,userServices.profile);
app.post('/signup',userServices.signup);
app.post('/updateAll',userServices.updateAll);
app.post('/update',userServices.authenticateToken,userServices.update);
app.delete('/deleteDoc',userServices.authenticateToken,userServices.deleteDoc);
app.delete('/deleteMany',userServices.deleteMany);
app.get('/findUser',userServices.authenticateToken,userServices.findUser);
app.patch('/chargeWallet',userServices.authenticateToken,userServices.chargeWallet);
app.patch('/unchargeWallet',userServices.authenticateToken,userServices.unchargeWallet);

app.listen(3000);
