var express = require('express');
var router = express.Router();
const userIsLoggedIn = require("../middlewares/auth-mid").userIsLoggedIn
const Task = require('../models/task');
const User = require('../models/user')

router.use((req, res, next) => userIsLoggedIn(req, res, next));

router.get("/create-task", (req, res, next) => {
    //el get solo tiene que renderizar la vista
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
    User
        .findById(userId)
        .populate("tasks")
        .populate("requests")
        .then(user => {
             //console.log(user);
            
            res.render('private/profile', {user})
        })
});


router.get('/users' , (req, res, next) => {
    User.find()
        .populate("tasks")
        .then(allUsers => {
        res.render('private/users', {allUsers})
    })
});

router.get('/:id/task-details', (req, res, next) => {
    const taskId = req.params.id
    console.log(taskId)
    Task
    .findById(taskId)
    .then(task => {
        res.render('private/task-details', task)
    })
    
})
//cojemos la task de otro usuario y nos la adjudicamos a nuestra key requests
router.post('/:id/users', (req, res, nex) => {
    const userId = req.session.currentUser._id
    const taskId = req.params.id
    console.log(userId);
    
    console.log('tarea', taskId);
    User
        .findById(userId)
        .updateOne({requests: taskId})
        .then(() => {
            res.redirect('/profile')
        })
});



// hacemos delete de las tareas
router.post('/:id/profile', (req,res,next) => {;
    Task
    .findByIdAndRemove(req.params.id)
    .then (()=>{res.redirect('/profile')})
    .catch (err => next (err))
});

router.post('/:id/edit', async (req, res, next) => {
    const { name, description } = req.body;
    console.log(req.body.id)
    await Task.update({_id: req.params.id}, {name, description})
    res.redirect('/profile');
});

router.get('/:id/edit' , async (req, res, next) => {
    const editTask = await Task.findById(req.params.id)
    res.render('private/edit', editTask)
});



module.exports = router;