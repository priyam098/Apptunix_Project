const mongoose = require('mongoose'); 
const Schema = mongoose.Schema;
const user = new Schema({
Fname:{
    type: String,
    required : true 
},
Lname:{
    type : String,
    required: true
},
email:{
    type: String,
    required : true 
},
password:{
    type: String,
    required: true
},
phone: {
    type:Number,
    required: false
},
date : {
    type : Date,
    required: false
},
age : {
    type : Number,
    required: true
},
wallet :{
    type: Number,
    default:0
}
});

module.exports = mongoose.model('user',user); 