import { body, validationResult } from 'express-validator';

const validateRegistration = async (req, res, next) => {
    // 1. Rules for validation.
    const rules = [
        body('name').notEmpty().withMessage('Name is required.'),
        body('email').isEmail().withMessage('Please enter a valid email address.'),
        body('mobile').isMobilePhone().withMessage('Please enter a valid mobile number.'),,
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

    // 2. Run those rules.
    await Promise.all(
        rules.map((rule) => rule.run(req))
    );

    // 3. Check if there are any errors.
    const validationErrors = validationResult(req);

    // 4. If errors exist, return the error message.
    if (!validationErrors.isEmpty()) {
        return res.render('register', {
            errorMessage: validationErrors.array()[0].msg,
        });
    }
    next();
};

export default validateRegistration;