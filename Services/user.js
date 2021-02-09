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
    email: joi.string().email().lowercase().required(),
    image : joi.string()
});
const joiValidLogin = joi.object({
    password: joi.string().min(4).required(),
    email: joi.string().email().lowercase().required()
});
const single = async (req,res)=>{
    try{
        res.send({file:req.file,image:`http://localhost:3000/${req.file.filename}`});
    }catch(err){
        res.send(err);
    }
}
const bulk = async (req,res)=>{
    try{
        let imagex;
        // console.log('>>>>.',req.files);
        let obj = req.files.map(cv => `http://localhost:3000/${cv.filename}`);
        // req.files.map(cv => {imagex=`http://localhost:3000/${cv.filename}`});
        console.log(imagex);
        console.log(obj);
        res.send({files:req.files,images:obj})  
    }
    catch(err){
        res.send(err)
    }
}
const fields = async(req,res)=>{
    try{
        console.log(req.body);
        res.send(req.files);
        
    }
    catch(err){
        res.send(err);
    }
}
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

                const accessToken = jwt.sign({_id:existUser._id}, config.ACCESS_TOKEN_SECRET);
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
const profile = async (req,res)=>{
    console.log("hello");
    console.log(req.dataObj._id);
    try{
    const result = await userSchema.userModel.findById({_id:req.dataObj._id}).lean()
    // console.log({...result});
    // console.log("resy",result);
    // result["compute"] = 20;
    console.log(result.image);
    res.send({UserProfile:result,ProfilePic:`http://localhost:3000/${result.image}`})
    }
    catch (err) {
        res.send(console.log(err));
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
        if(req.file){
            req.body.image = req.file.filename;
        
           }

        const dataObj = {
            Fname: Fname,
            Lname: Lname,
            age: age,
            password: password,
            email: email,
            phone: phone,
            image:req.body.image
        };
        console.log(dataObj);
        await joiValidSignUp.validateAsync(req.body);
        console.log("validation sucessfull");
        const existUser = await userSchema.userModel.findOne({email:email})
        console.log('existing user:'+ existUser);
        if(!existUser){
        const dataAdded = await userSchema.userModel.create(dataObj);
        console.log(dataAdded);
        const accessToken = jwt.sign({_id : dataAdded._id},config.ACCESS_TOKEN_SECRET)
        res.send({accessToken:accessToken,status:200,message:"SignUp sucessful"});
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
            res.send('record updated sucessfully ' + employee);
            console.log(employee);
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
const updateAll = async(req, res)=>{
    try{
        const result = await userSchema.userModel.updateMany({},req.body)
        res.send("records updated")
        }
    catch(err){
        res.send({status:400,message:"updation failed"});
    }
}
const deleteDoc = async(req,res)=>{
    try{
    const query = req.dataObj._id;
    console.log(query);
    const result = await userSchema.userModel.deleteOne({_id:query},(err,result)=>{
        if(result) res.send({status:200,message:"Document deleted"});
        res.send({status:400,message:"error"})
    })
    console.log(result);
    }
    catch(err) {res.send({error:err})};   
}
const deleteMany = async(req,res)=>{
    // console.log(req.body);
    try{
        if(await (await userSchema.userModel.find(req.body)).length !=0){
    await userSchema.userModel.deleteMany(req.body,(err,result)=>{
        if(result){
            res.send({status:200,message:"successful"})
        }
        else{
            res.send("error")
        }
    }) }
    else{
        res.send({error:"enter valid query"})
    }
}
    catch(err){
        res.send({error:err});
    }
}
const chargeWallet = async(req,res)=>{
    try{
    const id =req.dataObj._id;
    const record = await userSchema.userModel.findOne({_id:id})
    const existingBalance = record.wallet;
    const valToBeAdded = req.body.valToBeAdded;
    const newBalance = existingBalance + valToBeAdded;
    await userSchema.userModel.findOneAndUpdate({_id:id},{wallet:newBalance},{new:true},(err,result)=>{
        if(err) res.send("error")
        else{   
            res.send({status:200,message:"Balance Updated"})
        }
    })}
    catch(err){
              res.send({error:err});
    }
}
const unchargeWallet = async (req,res)=>{
    try{
    const id =req.dataObj._id;
    const record = await userSchema.userModel.findOne({_id:id})
    const existingBalance = record.wallet;
    const valToBeDeducted = req.body.valToBeDeducted;
    const newBalance = existingBalance - valToBeDeducted;
    await userSchema.userModel.findOneAndUpdate({_id:id},{wallet:newBalance},{new:true},(err,result)=>{
        if(err) res.send("error")
        else{
            res.send({status:200,message:"Balance Updated"})
        }
    })
}
    catch(err){
        res.send({error:err});
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
module.exports.fields = fields;
module.exports.bulk = bulk;
module.exports.single = single;
module.exports.login = login;
module.exports.profile = profile;
module.exports.signup = signup;
module.exports.update = update;
module.exports.findUser = findUser;
module.exports.updateAll = updateAll;
module.exports.deleteDoc = deleteDoc;
module.exports.deleteMany = deleteMany;
module.exports.chargeWallet = chargeWallet;
module.exports.unchargeWallet = unchargeWallet;
module.exports.authenticateToken = authenticateToken;