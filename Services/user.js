const userSchema = require('../Model/index')
const bcrypt = require('bcryptjs');
const joi = require('joi');
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
    console.log(req.body);
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
                // console.log('password mismatch')
            } else {
                return res.status(200).json({
                    status: false,
                    message: 'login sucessful'
                })
                // console.log("login sucessful")
            }
            // if (err) {
            //     res.send({ status: 400, message: "wrong password" })
            //     console.log(err);
            // }

            // else res.send({ status: 200, message: "login sucessful" })
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
        const password = await bcrypt.hash(req.body.password, 10);
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
        const result = await joiValid.validateAsync(req.body);
        console.log("result", result);
        const dataAdded = await userSchema.userModel.create(dataObj);

        console.log(dataAdded);

        res.send(dataAdded);
    } catch (error) {
        console.log(error);
        res.send('signUp: failed');
    }

};
const update = async (req, res) => {
    const filter = { _id: req.body._id }
    try {
        const update = {
            Fname: req.body.Fname,
            Lname: req.body.Lname,
            age: req.body.age,
            password: await bcrypt.hash(req.body.password, 10),
            email: req.body.email
        }
        const update1 = await userSchema.userModel.findOneAndUpdate(filter, update, (err, employee) => {
            if (err) {
                console.log(err);
                throw err;
            }
            else {
                res.send('record updated sucessfully ' + employee);
                console.log(update1);
            }
        })
    }
    catch (err) {
        console.log(err);
    }
}
const findUser = async (req, res) => {
    const user = await userSchema.userModel.find({ _id: req.body._id })
    if (user) { res.send('user found ' + user) };
}

module.exports.login = login;
module.exports.signup = signup;
module.exports.update = update;
module.exports.findUser = findUser;
