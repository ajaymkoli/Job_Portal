import { body } from 'express-validator';
import runValidation from './validator.middleware.js';

// Define rules externally so they can be reused if needed
export const registrationRules = [
    body('name').notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('Please enter a valid email address.'),
    body('mobile').isMobilePhone().withMessage('Please enter a valid mobile number.'),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s:]).{8,}$/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol.'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match.');
        }
        return true;
    })
];

// Use runValidation with an onError handler that renders the register view
const validateRegistration = runValidation((req, res, errors) => {
    return res.render('register', { errorMessage: errors[0].msg });
});

export default validateRegistration;