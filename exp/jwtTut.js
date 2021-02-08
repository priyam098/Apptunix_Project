const express = require('express');
const app = express();
const jwt = require('jsonwebtoken')
const config = require('../config/dev')
const mongoose = require('mongoose')
const connection = require('../connection')
const schema = require('../Model/index')
connection.connect();
app.use(express.json());
const joi = require('joi')
const joiValidSignUp = joi.object({
    Fname: joi.string().min(3).required(),
    Lname: joi.string().min(3).required(),
    age: joi.required(),
    password: joi.string().min(4).required(),
    email: joi.string().email().lowercase().required()
});
const joiValidLogin = joi.object({
    password: joi.string().min(4).required(),
    email: joi.string().email().lowercase().required()
});

app.get('/profile',authenticateToken,async (req,res)=>{
    console.log(req.user);
    try{
    console.log(await schema.userModel.findById(req.user._id));
    res.send(await schema.userModel.findById(req.user._id))
    }
    catch (err) {console.log(err);}
})
app.post('/update',authenticateToken,async (req,res)=>{
    console.log(req.dataObj);
    const filter = req.dataObj._id;
    console.log(filter);
    const update1 = await schema.userModel.findOneAndUpdate({_id:filter}, req.body,{new:true},(err, employee) =>{
        if (err) {
            console.log(err);
            throw err;
        }
        else {
            res.send('record updated sucessfully ' + employee);
            console.log(update1);
        }
    })
})
app.post('/login1',async(req,res)=>{
    try{
    const email = req.body.email;
    const password = req.body.password;
    const dataObj1 = await schema.userModel.findOne({email:email})

    console.log(dataObj1);
    const accessToken = jwt.sign({_id:dataObj1._id}, config.ACCESS_TOKEN_SECRET);
    res.json({accessToken : accessToken});
    }
    catch(err)
    {
        console.log(err);
    }
})
function authenticateToken(req,res,next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log(authHeader.split(' ')[1]);
    if(!token) res.sendStatus(401);
    jwt.verify(token,config.ACCESS_TOKEN_SECRET,(err,dataObj)=>{
        if(err) return res.sendStatus(403)
        req.dataObj = dataObj;
        next();
    })
}   
app.listen(3000);
