const userSchema = require('../Model/index')
const bcrypt = require('bcryptjs');
const joi = require('joi');
const config = require('../config/dev')
const jwt = require('jsonwebtoken')


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
const login = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    console.log('req.body:'+req.body);
    try {
        const result = await joiValidLogin.validateAsync(req.body);
        if (!email || !password) res.json('enter correct details');//
        const existUser = await userSchema.userModel.findOne({ email: email })
        console.log(existUser);

        bcrypt.compare(password, existUser.password, function (err, isMatch) {
            if (!isMatch) {
                return res.status(400).json({
                    status: false,
                    message: 'password mismatch'
                })
            } else {
                // console.log(dataObj1);
                const accessToken = jwt.sign({_id:existUser._id}, config.ACCESS_TOKEN_SECRET);
                // res.json({accessToken : accessToken});
                return res.status(200).json({
                    accessToken : accessToken,
                    status: true,
                    message: 'login sucessful'
                })
            }
        })
    }
    catch (err) {
        console.log(err);
        res.send({ status: 400, message: "login failed" });
    }
};

const signup = async (req, res) => {
    try {
        const Fname = req.body.Fname;
        const Lname = req.body.Lname;
        const age = req.body.age;
        console.log("before hash");
        const password = await bcrypt.hash(req.body.password, 10);
        console.log('after hash');
        const email = req.body.email;
        const phone = req.body.phone;

        const dataObj = {
            Fname: Fname,
            Lname: Lname,
            age: age,
            password: password,
            email: email,
            phone: phone
        };
        console.log(dataObj);
        const result = await joiValidSignUp.validateAsync(req.body);
        console.log("validation sucessfull");
        const existUser = await userSchema.userModel.findOne({email:email})
        console.log('existing user:'+ existUser);
        if(!existUser){
        const dataAdded = await userSchema.userModel.create(dataObj);
        res.send({status:200,message:"SignUp sucessful"});
        }
        else res.json({status:400,messagr:"EmailId already exist"});
    } catch (error) {
        console.log(error);
        res.send({status:400,message:"SignUp failed"});
    }

};
const update = async (req, res) => {
    try {
        console.log(req.dataObj);
        const filter = req.dataObj._id;
        console.log(filter);
        const update1 = await userSchema.userModel.findOneAndUpdate({_id:filter}, req.body,{new:true},(err, employee) =>{
        if (err) {
            console.log(err);
            throw err;
        }
        else {
            res.send('record updated sucessfully ' + update1);
            console.log(update1);
        }
    })
       
    }
    catch (err) {
        console.log(err);
    }
}
const findUser = async (req, res) => {
    try{
    const userId = req.dataObj._id;
    const user = await userSchema.userModel.findOne({ _id:userId })
    if (user) res.send({status:200,message:"user found"}) 
    else res.json({status:400,message:"User does not exist"});
    }
    catch(err){
        console.log(err);
        res.json({status:400,message:"error"})
    }
}

const authenticateToken = (req,res,next)=>{
    const authHeader = req.headers['authorization'];
    console.log(authHeader);
    const token = authHeader && authHeader.split(' ')[1];
    console.log(authHeader.split(' ')[1]);
    if(!token) res.sendStatus(401);
    jwt.verify(token,config.ACCESS_TOKEN_SECRET,(err,dataObj)=>{
        if(err) return res.sendStatus(403)
        req.dataObj = dataObj;
        next();
    })
}   

module.exports.login = login;
module.exports.signup = signup;
module.exports.update = update;
module.exports.findUser = findUser;
module.exports.authenticateToken = authenticateToken;