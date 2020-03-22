
function userIsLoggedIn (req, res, next){

    if (req.session.currentUser){
        return next()
    } 

    else {
        console.log("the user is not authenticated")
        res.render("auth/login", {errorMessage: "Please, register first."})
    }
}

module.exports = {userIsLoggedIn}
