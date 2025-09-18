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
export { candidateRegisterValidator , candidateLoginValidator};