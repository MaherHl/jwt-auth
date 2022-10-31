const router = require('express').Router();
const {check, validationResult}= require('express-validator');
const { users } = require('../db');
const bcrypt = require('bcrypt')

const JWT = require('jsonwebtoken')




router.post('/signup',[
    check("email","please provide a valid email")
        .isEmail(),
    check("password","please provide a password greater than 6 characthers")
        .isLength({
            min:6
        })
],async(req,res)=>{
    const {email,password}= req.body
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({
           errors: errors.array()
        })
    }
    // validate doesn't already exist
     let user = users.find((user)=>{
        return user.email=== email
     })
    if(user){
       return res.status(400).json({
            "errors":[{
                "msg":"this user already exist"
            }]
        })
    }
    const HaschPassword = await bcrypt.hash(password,10)
    users.push({
        email,
        password:HaschPassword
    })

   const token = await JWT.sign({
    email
   },"super secret code",{
    expiresIn:3600000
   })
    res.json({
        token
    })
})

router.post('/login',async(req,res)=>{
    const{email,password}= req.body
    let user = users.find((user)=>{
        return user.email=== email
    })
    if(!user){
        return res.status(400).json({
            "errors":[{
                "msg":"invalid credentials"
            }]
        })
    }
  let isMatch= await  bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(400).json({
                "errors":[{
                    "msg":"invalid credentials"
                }]
            })
        }
        const token = await JWT.sign({
            email
           },"super secret code",{
            expiresIn:3600000
           })
            res.json({
                token
            })
})

router.get('/all',(req,res)=>{
 res.json(users)

})
  





module.exports= router