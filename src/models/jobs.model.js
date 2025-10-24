import { applicants } from "./applicants.model.js";
export default class JobModel {
    constructor(id, jobcategory, jobdesignation, joblocation, companyname, salary, applyby, skillsrequired, numberofopenings, jobdescription, jobposted, applicants, posterEmail) {
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
        this.posterEmail = posterEmail || null; // email of recruiter who posted the job
    }

    static add(jobcategory, jobdesignation, joblocation, companyname, salary, applyby, skillsrequired, numberofopenings, jobdescription, posterEmail) {
        const jobPosted = new Date().toLocaleString();
        const job = new JobModel(jobs.length + 1, jobcategory, jobdesignation, joblocation, companyname, salary, applyby, skillsrequired, numberofopenings, jobdescription, jobPosted, applicants.length, posterEmail);
        console.log(job);
        if (job) {
            jobs.push(job);
            return true;
        } else {
            return false;
        }
    }

    static getAllJobs() {
        return jobs;
    }

    static getJobById(id) {
        return jobs.find((p) => p.id == id);
    }
    static deleteById(id) {
        const idx = jobs.findIndex(j => j.id == id);
        if (idx !== -1) {
            jobs.splice(idx, 1);
            return true;
        }
        return false;
    }

    static updateById(id, updates = {}) {
        const j = jobs.find(x => x.id == id);
        if (!j) return false;
        // only update allowed fields
        const allowed = ['jobcategory', 'jobdesignation', 'joblocation', 'companyname', 'salary', 'applyby', 'skillsrequired', 'numberofopenings', 'jobdescription'];
        allowed.forEach(key => {
            if (typeof updates[key] !== 'undefined') j[key] = updates[key];
        });
        return true;
    }
}

const jobs = [];