const express = require("express");
const cors = require("cors")
let user= require("./userModule");
let mongoose = require("mongoose")
let jwt = require("jsonwebtoken");
let jwt_key = "private"
const app = express();


app.use(cors())
app.use(express.json())


const isValid = (value) => {
    if (typeof value === "undefined" ||  value === null) return false
    if (typeof value === "string" && value.trim().length === 0) return false
    return true
  }

  app.get("/",(req,res)=>{
    return res.send("Good work")
  })

app.post("/register", async (req, res) => {
    try {
        let data = req.body;
        let {name,email,password} = data;
        if(Object.keys(data).length==0){
            return res.status(400).send("please provide your details")
        }
        if(!isValid(name)){
            return res.send({result:"please provide your name"})
        }
        if(!name.trim().match(/^[a-zA-Z ]{1,30}$/)){
            return res.send({result:"name only contain alphabet"})
        }
        if(!isValid(email)){
            return res.send({result:"please provide a password"})
        }
        if(!email.trim().match(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/)){
            return res.send({result:"please provide a valid email"})
        }
        if(!isValid(password)){
            return res.send({result:"please provide your password"})
        }
        if(!password.trim().match(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)){
            return res.send({result:"please provide a valid password"})
        }
        const isRegisterEmail = await user.findOne({ email: email })

        if (isRegisterEmail) return res.send({ result: "Email id already registered" })
        
        let insertData = await user.create(data);    
        let User = {
            "_id": insertData._id,
            "name": insertData.name,
            "email": insertData.email
        }
        jwt.sign(User,jwt_key,{expiresIn:"2h"},(err,token)=>{

            if(err){
                return res.status(400).send({result:"SOME INTERNAL SERVER ERROR OCCURRED, PLEASE TRY AFTER SOME TIME "})
            }
            return res.status(200).send({User,auth : token})

        })
    }
    catch (err) {
        return res.status(500).send(err)
    }
})


app.post("/login", async (req, res) => {
    try {
        let { email, password } = req.body;
        if(!isValid(email)){
            return res.send({result:"please provide a password"})
        }
        if(!email.trim().match(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/)){
            return res.send({result:"please provide a valid email"})
        }
        if(!isValid(password)){
            return res.send({result:"please provide your password"})
        }
        if(!password.trim().match(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)){
            return res.send({result:"please provide a valid password"})
        }
        if (!email) {
            return res.status(400).send("please provide email address")
        }
        if (!password) {
            return res.status(400).send("please provide password")
        }
        let User = await user.findOne(req.body).select("-password");
        if (User) {
            jwt.sign({User},jwt_key,{expiresIn:"2h"},(err,token)=>{

                if(err){
                    return res.status(400).send({result:"SOME INTERNAL SERVER ERROR OCCURRED, PLEASE TRY AFTER SOME TIME "})
                }
                return res.status(200).send({User,auth : token})

            })
            
        }
        else {
            return res.status(404).send({result:"user not found"})
        }
    }
    catch (err) {
        return res.status(500).send(err)
    }

})



mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://Suman-1432:Suman1432@cluster0.bkkfmpr.mongodb.net/auths",(err,val)=>{
    if(!err){
        console.log("mongo db is connected")
    }
})
app.listen(5000,(err,val)=>{
    if(!err){
        console.log("server is run in port no 3000")
    }
})