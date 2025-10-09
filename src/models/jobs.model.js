import {applicants} from "./applicants.model.js";
export default class JobModel {
    constructor(id, jobcategory, jobdesignation, joblocation, companyname, salary, applyby, skillsrequired, numberofopenings,jobdescription, jobposted, applicants){
        this.id = id;
        this.jobcategory = jobcategory;
        this.jobdesignation = jobdesignation;
        this.joblocation = joblocation;
        this.companyname = companyname;
        this.salary = salary;
        this.applyby = applyby;
        this.skillsrequired = skillsrequired;
        this.numberofopenings = numberofopenings;
        this.jobdescription = jobdescription;
        this.jobposted = jobposted;
        this.applicants = applicants;
    }

    static add(jobcategory, jobdesignation, joblocation, companyname, salary, applyby, skillsrequired, numberofopenings, jobdescription){
        const jobPosted = new Date().toLocaleString();
        const job = new JobModel(jobs.length + 1, jobcategory, jobdesignation, joblocation, companyname, salary, applyby, skillsrequired, numberofopenings, jobdescription, jobPosted, applicants.length);
        console.log(job);
        if(job){
            jobs.push(job);
            return true;
        } else{
            return false;
        }
    }

    static getAllJobs(){
        return jobs;
    }

    static getJobById(id){
        return jobs.find((p) => p.id == id);
    }
}

const jobs = [];