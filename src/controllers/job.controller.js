import JobModel from "../models/jobs.model.js";

export default class jobController{
    static getJobs(req, res){ 
        res.render('jobListings');
    }

    static getPostJob(req, res){ 
        res.render('jobListings');
    }

    static postJob(req,res){
        const {jobcategory, jobdesignation, joblocation, companyname, salary, applyby, skillsrequired, numberofopenings, jobposted, applicants} = req.body;
        if(!JobModel.add(jobcategory, jobdesignation, joblocation, companyname, salary, applyby, skillsrequired, numberofopenings, jobposted, applicants)){
            
        } else{

        }
    }

    static getJobs(req, res){ 
        res.render('jobListings');
    }
}