const User = require("../models/user");


module.exports.renderSignUpForm =  (req,res)=>{
    res.render("users/signup.ejs");
};


module.exports.signup = async (req,res)=>{
    try{
        let {username,email,password} = req.body;
        const newUser= new User({email,username});
        const registerdUser= await User.register(newUser,password);
        console.log(registerdUser);
        req.login(registerdUser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success", "User was registerd!");
            res.redirect(req.session.redirectUrl);   
        });  
    }
    catch(e){
        req.flash("error",e.message);
        res.redirect("/signUp");
    }
};

module.exports.renderLoginForm =  (req,res)=>{
    res.render("users/login.ejs");
};

module.exports.login = async(req,res)=>{
    req.flash("You are Logged in");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","You are Logged out!");
        res.redirect("/listings");
    });
};