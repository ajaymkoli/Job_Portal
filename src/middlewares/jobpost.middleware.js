import { body } from 'express-validator';
import runValidation from './validator.middleware.js';

export const jobPostRules = [
    body('jobcategory').notEmpty().withMessage('Job category is required.'),
    body('jobdesignation').notEmpty().withMessage('Job designation is required.'),
    body('companyname').notEmpty().withMessage('Company name is required.'),
    body('joblocation').notEmpty().withMessage('Job location is required.'),
    body('salary').notEmpty().withMessage('Salary is required.'),
    body('applyby').notEmpty().withMessage('Apply-by date is required.'),
    body('numberofopenings').isInt({ min: 1 }).withMessage('Number of openings must be at least 1.'),
    body('skillsrequired').notEmpty().withMessage('Please add at least one skill.'),
    body('jobdescription').notEmpty().withMessage('Job description is required.'),
];

const validateJobPost = runValidation((req, res, errors) => {
    // Re-render postjob with the first error
    return res.render('postjob', { errorMessage: errors[0].msg, job: req.body });
});

export default validateJobPost;
