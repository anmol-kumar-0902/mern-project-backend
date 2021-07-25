const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    userName:{
        type:String,
        required:true,
        trim:true,
        min:5,
        unique:true,
        index:true,
        lowercase:true
    },
    email:{
        type:String,
        trim:true,
        rquired:true,
        unique:true,
        lowercase:true
    },
    hash_passowrd:{
        type:String,
        required:true,
        min:6,
    },
    contactNumber:{
        type:String,
        required:true,
        unique:true,
        trim:true,
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    },
    profilePicture:{type:String},


},{timestamps:true})

userSchema.virtual('password')
.set(function(password){
this.hash_passowrd=bcrypt.hashSync(password,10);
});

userSchema.methods={ 
    authenticate:function(password){
        return bcrypt.compareSync(password,this.hash_passowrd);
    }
}

module.exports=mongoose.model("User", userSchema)