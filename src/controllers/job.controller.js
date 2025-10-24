import JobModel from "../models/jobs.model.js";
import ApplicantsModel, { applicants } from "../models/applicants.model.js";
import path from 'path';
import fs from 'fs';

export default class JobController {

    getAllJobs(req, res) {
        // Search and pagination support
        const q = (req.query.q || '').toLowerCase().trim();
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 6; // cards per page

        let all = JobModel.getAllJobs();
        if (q) {
            all = all.filter(job => {
                const inTitle = (job.jobdesignation || '').toLowerCase().includes(q);
                const inCompany = (job.companyname || '').toLowerCase().includes(q);
                const inLocation = (job.joblocation || '').toLowerCase().includes(q);
                const inSkills = (Array.isArray(job.skillsrequired) ? job.skillsrequired.join(' ') : (job.skillsrequired || '')).toLowerCase().includes(q);
                return inTitle || inCompany || inLocation || inSkills;
            });
        }

        const total = all.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        const normalizedPage = Math.min(Math.max(1, page), totalPages);
        const start = (normalizedPage - 1) * pageSize;
        const paged = all.slice(start, start + pageSize);

        return res.render('jobListings', { jobs: paged, q: q, currentPage: normalizedPage, totalPages: totalPages });
    }

    getPostJob(req, res) {
        // If there's an id param, we are editing - re-use same view
        const id = req.params && req.params.id;
        if (id) {
            const job = JobModel.getJobById(id);
            if (!job) return res.status(404).send('Job not found');
            // Only poster can edit
            const userEmail = req.session ? req.session.userEmail : null;
            if (!userEmail || job.posterEmail !== userEmail) return res.status(403).send('Forbidden');
            return res.render('postjob', { job });
        }
        // Always pass `job` (null) so EJS can safely reference it
        return res.render('postjob', { job: null });
    }

    getJobDetails(req, res) {
        const id = req.params.id;
        if (!JobModel.getJobById(id)) {
            return res.status(401).send('Job not found');
        } else {
            return res.render('jobdetails', { job: JobModel.getJobById(id) });
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

        // Use session user email as poster if available
        const posterEmail = req.session ? req.session.userEmail : null;
        let postJob = JobModel.add(jobcategory, jobdesignation, joblocation, companyname, salary, applyby, skillsArray, numberofopenings, jobdescription, posterEmail);

        if (postJob) {
            // redirect to jobs so pagination/search state is clean
            return res.redirect('/jobs');
        } else {
            return res.render("postjob", { errorMessage: "Job posting failed. Please try again." });
        }
    }

    updateJob(req, res) {
        const id = req.params.id;
        const job = JobModel.getJobById(id);
        if (!job) {
            return res.status(404).send('Job not found');
        }

        const userEmail = req.session ? req.session.userEmail : null;
        if (!userEmail || job.posterEmail !== userEmail) {
            return res.status(403).send('Forbidden: You do not have permission to update this job.');
        }

        // Parse skills field similar to postJob
        let { jobcategory, jobdesignation, joblocation, companyname, salary, applyby, skillsrequired, numberofopenings, jobdescription } = req.body;
        let skillsArray;
        if (Array.isArray(skillsrequired)) {
            skillsArray = skillsrequired;
        } else if (typeof skillsrequired === 'string') {
            if (skillsrequired.trim().startsWith('[')) {
                try { skillsArray = JSON.parse(skillsrequired); } catch (e) { skillsArray = []; }
            } else {
                skillsArray = skillsrequired.split(',').map(s => s.trim()).filter(s => s.length > 0);
            }
        } else skillsArray = [];

        const updates = { jobcategory, jobdesignation, joblocation, companyname, salary, applyby, skillsrequired: skillsArray, numberofopenings, jobdescription };
        JobModel.updateById(id, updates);
        return res.redirect('/jobs');
    }

    // Delete a job (only poster can delete)
    deleteJob(req, res) {
        const id = req.params.id;
        const job = JobModel.getJobById(id);
        if (!job) return res.status(404).send('Job not found');

        const userEmail = req.session ? req.session.userEmail : null;
        if (!userEmail || job.posterEmail !== userEmail) {
            return res.status(403).send('Forbidden: You do not have permission to delete this job.');
        }

        // Delete the job from in-memory store
        JobModel.deleteById(id);
        return res.redirect('/jobs');
    }

    // Applicant submission for a job
    // First middleware: save applicant and call next (email middleware will run afterwards)
    applyToJob(req, res, next) {
        const jobId = req.params.id;
        const job = JobModel.getJobById(jobId);
        if (!job) {
            return res.status(404).send('Job not found');
        }

        // Multer stores uploaded file (if any) on req.file
        const { fullName, email, mobile } = req.body;
        // Very simple validation
        if (!fullName || !email) {
            // On fail, re-render job details with error
            return res.render('jobdetails', { job, errorMessage: 'Name and email are required to apply.' });
        }

        // Normalize applicant contact info
        const applicantEmail = String(email || '').trim().toLowerCase();
        const applicantMobileRaw = mobile ? String(mobile).trim() : null;
        const normalizePhone = (s) => (s ? String(s).replace(/\D/g, '') : null);
        const applicantMobile = normalizePhone(applicantMobileRaw);

        // If the logged-in user is the poster, or the applicant email equals the poster email, prevent applying
        const sessionUser = req.session ? req.session.userEmail : null;
        if ((sessionUser && job.posterEmail && sessionUser.toLowerCase() === String(job.posterEmail).toLowerCase()) || (job.posterEmail && applicantEmail === String(job.posterEmail).toLowerCase())) {
            // If a file was uploaded, remove it since application is rejected
            if (req.file && req.file.filename) {
                try {
                    const uploadsDir = path.join(process.cwd(), 'uploads', 'resumes');
                    const full = path.join(uploadsDir, req.file.filename);
                    if (fs.existsSync(full)) fs.unlinkSync(full);
                } catch (e) {
                    console.error('Error removing uploaded resume for blocked application', e);
                }
            }
            return res.render('jobdetails', { job, errorMessage: 'You cannot apply to a job you posted.' });
        }

        // Prevent duplicate application: same email or same mobile for the same job
        const already = applicants.find(a => String(a.jobId) === String(jobId) && (String(a.email || '').toLowerCase() === applicantEmail || (applicantMobile && a.contact && normalizePhone(a.contact) === applicantMobile)));
        if (already) {
            // remove uploaded file if any
            if (req.file && req.file.filename) {
                try {
                    const uploadsDir = path.join(process.cwd(), 'uploads', 'resumes');
                    const full = path.join(uploadsDir, req.file.filename);
                    if (fs.existsSync(full)) fs.unlinkSync(full);
                } catch (e) {
                    console.error('Error removing uploaded resume for duplicate application', e);
                }
            }
            return res.render('jobdetails', { job, errorMessage: 'You have already applied for this job using the same email or mobile number.' });
        }

        // Handle resume file if uploaded
        let resumepath = null;
        try {
            if (req.file && req.file.filename) {
                // Save only filename; files live in uploads/resumes (protected)
                resumepath = req.file.filename;
            }
        } catch (e) {
            console.error('Error processing uploaded file', e);
        }

        const newApplicant = new ApplicantsModel(applicants.length + 1, Number(jobId), fullName.trim(), applicantEmail, applicantMobileRaw ? applicantMobileRaw.trim() : null, resumepath);
        applicants.push(newApplicant);

        // Update job applicants count
        job.applicants = applicants.filter(a => a.jobId == jobId).length;

        // Attach data for downstream middleware (email sender and final renderer)
        req.newApplicant = newApplicant;
        req.job = job;

        // don't end response here; let next middleware act (send email, then render)
        return next();
    }

    // Final response renderer after email middleware
    applyResponse(req, res) {
        const job = req.job || JobModel.getJobById(req.params.id);
        return res.render('jobdetails', { job, successMessage: 'Application submitted successfully.' });
    }

    // Recruiter: view applicants for a job (only poster can view)
    getApplicants(req, res) {
        const jobId = req.params.id;
        const job = JobModel.getJobById(jobId);
        if (!job) {
            return res.status(404).send('Job not found');
        }

        // Check logged in user
        const userEmail = req.session ? req.session.userEmail : null;
        if (!userEmail) {
            return res.render('login', { errorMessage: 'Please login to view applicants.' });
        }

        // Only poster can view applicants
        if (job.posterEmail !== userEmail) {
            return res.status(403).send('Forbidden: You do not have permission to view applicants for this job.');
        }

        // Filter applicants for this job and add pagination
        const allApplicants = applicants.filter(a => a.jobId == jobId);
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const total = allApplicants.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        const normalizedPage = Math.min(Math.max(1, page), totalPages);
        const start = (normalizedPage - 1) * pageSize;
        const pagedApplicants = allApplicants.slice(start, start + pageSize);

        return res.render('applicants', { applicants: pagedApplicants, job, currentPage: normalizedPage, totalPages });
    }

    // GET /myjobs - list jobs posted by the logged-in recruiter
    getMyJobs(req, res) {
        const userEmail = req.session ? req.session.userEmail : null;
        if (!userEmail) return res.redirect('/login');

        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 6;

        const all = JobModel.getAllJobs().filter(j => j.posterEmail === userEmail);
        const total = all.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        const normalizedPage = Math.min(Math.max(1, page), totalPages);
        const start = (normalizedPage - 1) * pageSize;
        const paged = all.slice(start, start + pageSize);

        return res.render('myjobs', { jobs: paged, currentPage: normalizedPage, totalPages });
    }

    // Protected download for resume - only job poster (recruiter) can download
    downloadResume(req, res) {
        const appId = req.params.id;
        const applicant = applicants.find(a => String(a.id) === String(appId));
        if (!applicant) return res.status(404).send('Applicant not found');

        const job = JobModel.getJobById(applicant.jobId);
        if (!job) return res.status(404).send('Job not found');

        const userEmail = req.session ? req.session.userEmail : null;
        if (!userEmail || job.posterEmail !== userEmail) {
            return res.status(403).send('Forbidden: You do not have permission to download this resume.');
        }

        if (!applicant.resumepath) return res.status(404).send('No resume available');

        const uploadsDir = path.join(process.cwd(), 'uploads', 'resumes');
        const full = path.join(uploadsDir, applicant.resumepath);
        if (!fs.existsSync(full)) return res.status(404).send('Resume file not found');

        return res.download(full, applicant.resumepath, (err) => {
            if (err) console.error('Error sending resume', err);
        });
    }
}

const jobs = [];