
const { check, validationResult } = require('express-validator');

exports.validateSignupRequest = [
    check('name')
    .notEmpty()
    .withMessage('Name is required'),
    check('email')
    .isEmail()
    .withMessage('Valid Email is required'),
    check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 character long'),
    check('contactNumber')
    .isLength({min:10})
    .withMessage('Please enter a valid number')
];

exports.validateSigninRequest = [
    check('email')
    .isEmail()
    .withMessage('Valid Email is required'),
    check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 character long'),
    
];

exports.isRequestValidated = (req, res, next) => {
    const errors = validationResult(req);//it returns the array of errors while validating
    if(errors.array().length > 0){
        return res.status(400).json({ error: errors.array()[0].msg })
    }
    next();
}