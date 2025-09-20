import { body } from "express-validator";

const candidateRegisterValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid"),
        body("name")
            .trim()
            .notEmpty()
            .withMessage("Name is Required")
            .isLength({min: 3})
            .withMessage("Username must be at least 3 characters long"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password should not be empty")
    ]
}

const candidateLoginValidator = () => {
    return [
        body("email")
            .isEmail()
            .withMessage("Email is required"),
        body("password")
            .notEmpty()
            .withMessage("Password is required")
    ]
}

const candidateChangeCurrentPasswordValidator = () => {
    return [
        body("oldPassword")
            .notEmpty()
            .withMessage("Old Password is required"),
        body("newPassword")
            .notEmpty()
            .withMessage("New Message is required")
    ]
}

const candidateForgetPasswordValidator = () => {
    return [
        body("email")
            .notEmpty()
            .withMessage("Email cannot be empty")
            .isEmail()
            .withMessage("Email is invalid")
    ]
}

const candidateResetForgotPasswordValidator = () => {
    return [
        body("newPassword")
            .notEmpty()
            .withMessage("Password is required")
    ]
}

const recruiterRegisterValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid"),
        body("name")
            .trim()
            .notEmpty()
            .withMessage("Name is Required")
            .isLength({min: 3})
            .withMessage("Username must be at least 3 characters long"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password should not be empty"),
        body("company")
            .trim()
            .notEmpty()
            .withMessage("Company is required")
    ]
}

const recruiterLoginValidator = () => {
    return [
        body("email")
            .isEmail()
            .withMessage("Email is required"),
        body("password")
            .notEmpty()
            .withMessage("Password is required")
    ]
}

const recruiterChangeCurrentPasswordValidator = () => {
    return [
        body("oldPassword")
            .notEmpty()
            .withMessage("Old Password is required"),
        body("newPassword")
            .notEmpty()
            .withMessage("New Message is required")
    ]
}

const recruiterForgetPasswordValidator = () => {
    return [
        body("email")
            .notEmpty()
            .withMessage("Email cannot be empty")
            .isEmail()
            .withMessage("Email is invalid")
    ]
}

const recruiterResetForgotPasswordValidator = () => {
    return [
        body("newPassword")
            .notEmpty()
            .withMessage("Password is required")
    ]
}

export { candidateRegisterValidator , candidateLoginValidator , candidateChangeCurrentPasswordValidator , candidateForgetPasswordValidator , candidateResetForgotPasswordValidator};
export { recruiterRegisterValidator , recruiterLoginValidator , recruiterChangeCurrentPasswordValidator , recruiterForgetPasswordValidator , recruiterResetForgotPasswordValidator};