import { validationResult } from 'express-validator';

// Generic validator middleware factory
// rules: array of express-validator rules (already attached/run by caller)
// onError: function(req, res, errors) -> handles rendering error response
export const runValidation = (onError) => async (req, res, next) => {
    // run validations should already have been executed by express-validator rules
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        if (typeof onError === 'function') return onError(req, res, errors.array());
        // default: send first error as plain text
        return res.status(400).send(errors.array()[0].msg);
    }
    return next();
};

export default runValidation;
