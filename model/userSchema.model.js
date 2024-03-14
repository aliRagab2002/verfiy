const mongoose = require("mongoose")
const validator = require('validator')

const userSchema = new mongoose.Schema({
name:{
    type:String,
    required:true,
    trim:true,
    max:64
},
email: {
    type:String,
    required:true,
    unique:true,
    trim:true,
    max:64
},
password: {
    type:String,
    required:true,

},

verified : {
    type:Boolean
}
// isVerified: {type:Boolean, required:true,minLength:3,maxLength:1024},
// emailToken: {type:String},


});


const User = mongoose.model("users",userSchema)

module.exports=User