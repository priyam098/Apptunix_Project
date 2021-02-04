const express = require('express');
const app = express();
const mongoose = require('mongoose');
const connection = require('./connection')
const userServices = require('./Services/user');
app.use(express.json());
connection.connect();

app.post('/login',userServices.login);
app.post('/signup',userServices.signup);
app.post('/update',userServices.update);
app.get('/findUser',userServices.findUser);

app.listen(3000);
