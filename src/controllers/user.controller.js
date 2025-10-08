import UserModel from "../models/users.model.js"

export default class UserController{
    getRegister(req,res){
        res.render("register", {errorMessage:null})
    }
    
    postRegister(req,res){
        // console.log(req.body);
        const {name, email, mobile, password} = req.body;
        if(!UserModel.add(name,email,mobile,password)){
                return res.render('register', {errorMessage:"User already exists with this email or mobile number."});
        } else{
            res.render("login", {successMessage: "Registered successfully. Please login."});
        }
    }

    getLogin(req,res){
        res.render("login", {errorMessage:null});
    } 

    postLogin(req,res){
        const {email, password} = req.body;
        const user = UserModel.isValidUser(email, password);
        const userDetails = UserModel.getUser(email,password);
        if(!user){
            return res.render("login", {errorMessage: "Please check your email or password. If not registered, please register."});
        }else{
            req.session.userEmail = user.email;
            return res.render("jobListings", {loginMessage: `Welcome ${userDetails.name}`, userEmail: req.session.userEmail});
        }
    }

    logout(req, res){
        req.session.destroy((err) => {
            if(err){
                console.log(err);
            } else{
                res.redirect('/login');
            }
        });
    }
}