import UserModel from "../models/users.model.js"

export default class userController{
    getRegister(req,res){
        res.render("register")
    }
    
    postRegister(req,res){
        console.log(req.body);
        const {name, email, mobile, password} = req.body;
        UserModel.add(name,email,mobile,password);
        res.render("login");
    }

    getLogin(req,res){
        res.render("login");
    }

    postLogin(req,res){
        const {email, password} = req.body;
        const user = UserModel.isValidUser(email, password);

        if(!user){
            return res.render("login");
        }
        res.render("jobListings");  
    }
}