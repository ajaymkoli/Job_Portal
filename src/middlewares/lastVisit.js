import JobModel from '../models/jobs.model.js';
import { applicants } from '../models/applicants.model.js';
import UserModel from '../models/users.model.js';

export default function lastVisit(req, res, next) {
    res.locals.userEmail = req.session.userEmail;
    // Expose last visit stored in session (if any), then update it for next request
    res.locals.lastVisit = req.session.lastVisit || null;
    req.session.lastVisit = new Date().toLocaleString();

    // Build a small profile summary for logged-in recruiter
    if (req.session && req.session.userEmail) {
        const email = req.session.userEmail;
        const user = UserModel.getUserByEmail ? UserModel.getUserByEmail(email) : null;
        const allJobs = JobModel.getAllJobs() || [];
        const postedJobs = allJobs.filter(j => j.posterEmail === email);
        const postedJobsCount = postedJobs.length;
        const totalApplicants = postedJobs.reduce((sum, j) => {
            return sum + applicants.filter(a => a.jobId == j.id).length;
        }, 0);

        const jobsSummary = postedJobs.map(j => ({ id: j.id, title: j.jobdesignation, applicantsCount: applicants.filter(a => a.jobId == j.id).length }));

        res.locals.profile = {
            email,
            name: user ? user.name : null,
            postedJobsCount,
            totalApplicants,
            jobs: jobsSummary,
        };
    } else {
        res.locals.profile = null;
    }

    next();
}
