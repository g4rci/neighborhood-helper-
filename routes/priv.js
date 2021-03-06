var express = require('express');
var router = express.Router();
const userIsLoggedIn = require("../middlewares/auth-mid").userIsLoggedIn
const Task = require('../models/task');
const User = require('../models/user');
const uploadCloud = require('../config/cloudinary')

router.use((req, res, next) => userIsLoggedIn(req, res, next));

router.get("/create-task", (req, res, next) => {
    //el get solo tiene que renderizar la vista
    res.render("private/create-task")
})

router.post("/create-task", async (req, res, next) => {
    const { name, description } = req.body
    const creator = req.session.currentUser._id
    const newTask = await Task.create({ name, creator, description, assigned: null})
    

    const userId = req.session.currentUser._id

    await User.updateOne({ _id: userId }, { $push: { tasks: newTask._id } })

    res.render("private/create-task", { message: "created successfully" })

})


router.get('/profile', (req, res, nex) => {
    const userId = req.session.currentUser._id
    User
        .findById(userId)
        //.populate("tasks")
        
        .populate({path:'tasks', populate:{path:'assigned'}})
        .populate({path:'requests', populate:{path:'creator'}})
        .then(user => {
            //console.log(user.tasks[0].assigned)
            res.render('private/profile', {user})
        })
});

router.post('/notifications', (req, res, next) =>{
    const userId = req.session.currentUser._id
    req.session.currentUser.notifications = 0
    User
    .findOneAndUpdate(userId,{$set: {notifications: 0}},{new:true})
    .then(()=>{
        res.redirect('/profile')
    })
})


router.get('/users' , (req, res, next) => {
    User.find({_id:{$ne: req.session.currentUser._id} } )
        .populate("tasks")
        .then(allUsers => {
        res.render('private/users', {allUsers})
    })
});

router.get('/:id/task-details', (req, res, next) => {
    const taskId = req.params.id

    Task
    .findById(taskId)
    .then(task => {
        res.render('private/task-details', task)
    })
    
})

//Edit profile
router.post('/:id/edit-profile',uploadCloud.single('picture'), async (req, res, next) => {
    const { name, email, direction} = req.body;
    const profilePicture = req.file ? req.file.secure_url : req.session.currentUser.picture;
    //console.log(req.file);
    await User.update({_id: req.params.id}, {name, email, direction, picture: profilePicture},{new:true})
    res.redirect('/profile');
});

//  router.post('/:id/edit-profile',uploadCloud.single('picture'), async (req, res, next) => {
//     User.findOne({_id: req.session.currentUser._id})
//     .then((user) => {
//       actuallyUser = user;
//       const {name, email, direction} = req.body;
//       const photo_user = req.file ? req.file.secure_url : currentUser.picture;
//       User.findOneAndUpdate({_id: req.query.user_id},{$set: {name, email, direction, picture: photo_user}},{new:true})
//         .then(() =>
//         res.redirect('/profile'))
//         .catch((err) => next(err));
//     })
//     .catch((error) => {
//       console.log(error);
//     })
//   });

router.get('/:id/edit-profile' , async (req, res, next) => {
    const editProfile = await User.findById(req.params.id)
    res.render('private/edit-profile', editProfile)
});



//cojemos la task de otro usuario y nos la adjudicamos a nuestra key requests
router.post('/:id/users', (req, res, next) => {
    const userId = req.session.currentUser._id
    const taskId = req.params.id
        User
        .findByIdAndUpdate(userId, {$push:{'requests': taskId}},{new: true})
        .then((user) => {
            console.log('user with updated request', user)
        Task
        .findByIdAndUpdate(taskId,{'assigned': userId},{new: true})
        .then((updatedTask)=>{
            console.log('task with updated assign', updatedTask)
            const creatorId = updatedTask.creator
            User.findByIdAndUpdate(creatorId, {$inc:{notifications:+1}},{new: true})
            .then((user)=>{
                console.log(user)
                res.redirect('/profile')
            })
        })
        .catch (err => next(err))
        })
        
});
    

// hacemos delete de las tareas
router.post('/:id/profile', (req,res,next) => {
    console.log('en Profile')
    Task
     .findById(req.params.id)
     .then ((task)=>{
         const id = task.creator
        console.log('task:', task);
        User
        .findByIdAndUpdate({'_id': id}, {$pull: {tasks: task._id}})
        .then((task)=>{
            console.log('borrado:',task)
        })
     })
        User
        .findByIdAndUpdate({'_id': req.session.currentUser._id}, {$pull: {requests:req.params.id}})
        .then((request)=>{
            console.log('borrado de request:',request)
        })
     Task
        .findByIdAndRemove(req.params.id)
        .then ((task)=>{
            //console.log('the following task has been removed: '+ task)
            res.redirect('/profile')
        .catch (err => next (err))
    })
});


router.post('/:id/edit', async (req, res, next) => {
    const { name, description } = req.body;
    console.log('req.bodu de tasks: ', req.body)
    await Task.update({_id: req.params.id}, {name, description})
    res.redirect('/profile');
});

router.get('/:id/edit' , async (req, res, next) => {
    const editTask = await Task.findById(req.params.id)
    res.render('private/edit', editTask)
});



module.exports = router;