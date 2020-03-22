var express = require('express');
var router = express.Router();


router.get("/create-task", (req, res, next) =>{
    //el get solo tiene que renderizar la vista
    console.log('hola')
    res.render("private/create-task")
})

router.post("/create-task", async (req, res, next)=>{
    
    const {name, description} = req.body

    const newTask = await Task.create({name, description})

    const userId = req.session.currentUser._id

    await User.updateOne({_id: userId}, { $push: {todoTask: newTask._id} })
    
    res.render("private/create-task", {message:"created successfully"})

})

module.exports = router;