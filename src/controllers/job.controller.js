import JobModel from "../models/jobs.model.js";

export default class JobController {

    getAllJobs(req, res) {
        return res.render('jobListings', { jobs: JobModel.getAllJobs() });
    }

    getPostJob(req, res) {
        return res.render('postjob');
    }

    getJobDetails(req, res) {
        const id = req.params.id;
        if(!JobModel.getJobById(id)){
            return res.status(401).send('Job not found');
        } else{
            return res.render('jobdetails', {job: JobModel.getJobById(id)});
        }
    }

    postJob(req, res) {
        const { jobcategory, jobdesignation, joblocation, companyname, salary, applyby, skillsrequired, numberofopenings, jobdescription } = req.body;
        // Parse JSON string of skillsrequired back to Javascript array
        // Always convert skillsrequired to an array
        let skillsArray;
        if (Array.isArray(skillsrequired)) {
            skillsArray = skillsrequired;
        } else if (typeof skillsrequired === 'string') {
            if (skillsrequired.trim().startsWith('[')) {
                try {
                    skillsArray = JSON.parse(skillsrequired);
                } catch (e) {
                    skillsArray = [];
                }
            } else {
                skillsArray = skillsrequired.split(',').map(s => s.trim()).filter(s => s.length > 0);
            }
        } else {
            skillsArray = [];
        }

        let postJob = JobModel.add(jobcategory, jobdesignation, joblocation, companyname, salary, applyby, skillsArray, numberofopenings, jobdescription);

        if (postJob) {
            return res.render("jobListings", { successMessage: "Job posted successfully.", jobs: JobModel.getAllJobs() });
        } else {
            return res.render("postjob", { errorMessage: "Job posting failed. Please try again." });
        }
    }
}

const jobs = [];