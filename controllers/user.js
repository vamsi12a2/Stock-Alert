var express = require('express')
var router = express.Router()
var bcrypt = require('bcrypt-nodejs')
var path = require('path')
var jwt = require('jwt-simple')
var Login = require('../models/Login')
var config = require('../config')

router.get("/", function(req, res, err) {
  console.log("called / using GET")
  return res.render("index.html")
});

router.post("/session",function(req,res,err){
    console.log("called /session using POST")
    var username = req.body.username
    var password = req.body.password
    Login.findOne({username:username}).select('password').
    exec(function(err,user){
      if(err){
        console.log(err)
        return next(err)
      }
      if(!user){
        console.log("user not found")
        return res.sendStatus(401)
      }
      bycrpt.compare(password,user.password,function(err,valid){
        if(err){
          console.log(err)
          return next(err)
        }
        if(!valid){
          console.log("password incorrect")
          return res.sendStatus(401);
        }
        var token = jwt.encode({username:user.username},config.secret)
        console.log("authenication success..")
        return res.json(token)
      })
    })
})



router.get('/user',function(req,res,err){

  if(!req.headers['x-auth']){
    console.log("invalid user")
    return res.sendStatus(401)
  }
  var user = jwt.decode(req.headers['x-auth'],config.secret)
  Login.findOne({username:user.username}).exec(function(err,user){
    if(err){
      console.log(err)
      return next(err)
    }
    if(!user){
      console.log("user not found")
      return res.sendStatus(401)
    }
    console.log("login success..")
    return res.json(user.username)
  })
})


router.post('/user',function(req,res,err){

  var user = new Login({username:req.body.username,password:req.body.password})
  user.save(function(err){
    if(err){
      console.log(err)
      return next(err)
    }
  })
  console.log("registration success..")
  return res.sendStatus(201)
})
module.exports = router
