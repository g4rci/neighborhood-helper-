var express = require('express');
var router = express.Router();
var bcrypt = require("bcrypt");
var bcryptSalt = 10;

const User = require("../models/user");

router.get('/signup', (req,res,next)=>{
    res.render ('auth/signup');
})

router.post('/signup', (req,res,next)=>{

    const {name, email, password, repeatpassword, direction} = req.body;
    if(!name || !email || !password){
        res.render('auth/signup', {errormessage:'Please complete all the fields'} );
        return;
    }
    if(password !== repeatpassword){
        res.render('auth/signup', {errormessage:'Password do not match'} );
        return;
    }
    User 
    .findOne({email})
    .then (user=>{
        if(user){
            res.render('auth/signup', {errormessage: 'The email already exist'});
            return;
        }
        const salt = bcrypt.genSaltSync(bcryptSalt);
        const hashpass = bcrypt.hashSync(password, salt);
        User.create({name, email, 'password':hashpass, direction})
        .then((user)=>{
            req.session.currentUser = user;
            res.render('index')
        })
        .catch (err => console.log ('Error creating user: ' +err));
    })
    .catch (err => console.log ('Error finding the user on DataBase: ' +err))
})

router.get("/login", (req, res, next)=>{
    // renderizar las vistas de login
    res.render("log-in.hbs")
})
router.post("/login", (req, res, next)=>{
    const { username, password } = req.body;
    if(username === "" || password === ""){
        res.render("log-in", {errorMessage: "Please, fill all the fields"})
    }
    User.findOne({ username })
        .then(user => {
            if (!user) {
                res.render("log-in", {
                    errorMessage: "There is no user with that username"
                })
            }
            //bcrypt.compareSync(contraseñaNormal, contraseñaHassheda)
            if (bcrypt.compareSync(password, user.password)) {
                req.session.currentUser = user;
                res.redirect("/priv/")
            }
            else {
                res.render("log-in", {
                    errorMessage: "Incorrect password"
                })
            }
        })
        .catch(err => console.log("error finding the user: " + err))
})

module.exports = router;