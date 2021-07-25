const express = require("express");
const router = express.Router();
const User = require('../Models/UserModel')
const jwt =require("jsonwebtoken");
const { requireSignIn } = require("../Common-MiddleWare/commonMiddleWare");
const { validateSignupRequest, isRequestValidated, validateSigninRequest } = require("../Validators/Validator");



router.post("/signin",validateSigninRequest,isRequestValidated,(req,res)=>{

    User.findOne({$or:[{email:req.body.email},{contactNumber:req.body.contactNumber}]})
    .exec((error,user)=>{
        if(error) return res.status(400).json({error});
        if(user){
            if(user.authenticate(req.body.password)){
                const token=jwt.sign({_id:user._id,role:user.role},process.env.JWT_KEY,{expiresIn:'365d'});
                const {
                   _id,role,name,email,contactNumber}=user;
                res.cookie('token',token,{expiresIn:'365d'});
                res.status(200).json({
                    token,
                    user:{
                        _id,role,name,email,contactNumber
                    }
                })     
            }else{
                res.status(400).json({msg:"Invalid Credentials !"})
            }


        }
        else{
            return res.status(400).json({msg:"Something went wrong !!"});
        }
    })



})
 
router.post("/signUp",validateSignupRequest,isRequestValidated,(req,res)=>{
    User.findOne({$or:[{email:req.body.email},{contactNumber:req.body.contactNumber}]})
    .exec((error,user)=>{ 
        // console.log(user);
        if(user) return res.status(400).json({
            msg:"User already exist"
        });

        const{
            name, 
            email,
            password,
            contactNumber,
            role
        }=req.body;
        const _user=new User({
            name,
            email,
            password,
            userName: Math.random().toString(),
            contactNumber,
            role
    });
    _user.save((error,data)=>{
        if(error) return res.status(400).json({msg:"something went wrong !!"});
        if(data) {
            return res.status(201).json({
                msg:"user created Sussessfully",
                name:req.body.name
            })
        }
    })

    })

})

router.post("/signOut",requireSignIn,(req,res)=>{
res.clearCookie('token'); 
res.status(200).json({
    msg:"Sign Out Successfully...!"
})
})


module.exports = router;