var express = require('express');
var router = express.Router();
const userIsLoggedIn = require("../middlewares/auth-mid").userIsLoggedIn
const Task = require('../models/task');
const User = require('../models/user')

router.use((req, res, next) => userIsLoggedIn(req, res, next));

//MIDDLEWARE A SACO
// router.use((req,res,next) =>{
//     if(req.session.currentUser){
//         next();
//     }
//     else{
//         res.redirect('/auth/login');
//     }
// })
//********************************* */

router.get("/create-task", (req, res, next) => {
    //el get solo tiene que renderizar la vista
    console.log('hola')
    res.render("private/create-task")
})

router.post("/create-task", async (req, res, next) => {
    const { name, description } = req.body

    const newTask = await Task.create({ name, description })
    console.log('new task is :', newTask);

    const userId = req.session.currentUser._id

    await User.updateOne({ _id: userId }, { $push: { tasks: newTask._id } })

    res.render("private/create-task", { message: "created successfully" })

})


router.get('/profile', (req, res, nex) => {
    const userId = req.session.currentUser._id
    console.log('usuario', userId);
    User
        .findById(userId)
        .populate("tasks")
        .then(user => {
             //console.log(user);
            res.render('private/profile', {user})
        }
        )
})
// router.get('/users', (req, res, nex) => {

// });

// hacemos delete de las tareas
router.post('/:id/profile', (req,res,next) => {
    console.log();
    Task
    .findByIdAndRemove(req.params.id)
    .then (()=>{res.redirect('/profile')})
    .catch (err => next (err))
});

module.exports = router;