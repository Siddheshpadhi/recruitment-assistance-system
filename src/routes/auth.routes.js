import { Router } from "express";
import { loginCandidate, registerCandidate , logoutCandidate, getCandidate, verifyEmail, refreshAccessToken, resendVerificationEmail, forgotPasswordRequest, resetForgetPassword, changeCurrentPassword, registerRecruiter, loginRecruiter, forgotPasswordRequestForRecruiter, resetForgetPasswordForRecruiter, logoutRecruiter, resendVerificationEmailForRecruiter, changeCurrentPasswordForRecruiter} from "../controllers/auth.controllers.js"
import { validate } from "../ middlewares/validator.middlewares.js";
import { candidateForgetPasswordValidator, candidateLoginValidator, candidateRegisterValidator, candidateResetForgotPasswordValidator , recruiterRegisterValidator , recruiterLoginValidator , recruiterChangeCurrentPasswordValidator , recruiterForgetPasswordValidator , recruiterResetForgotPasswordValidator} from "../validators/index.js";
import { verifyJWTCandidate , verifyJWTRecruiter } from "../ middlewares/auth.middlewares.js";
const router = Router();
//candidateRegisterValidator is not a middleware it just validates and sends an array of errors
//validate is a middleware which processes the errors with validationResult method and if there are errors then it is throwing an apiError
//not secure 
router.route("/candidate/register").post(candidateRegisterValidator() ,validate ,registerCandidate);
router.route("/candidate/login").post(candidateLoginValidator() ,validate ,loginCandidate);
router.route("/candidate/verify-email/:verificationToken").get(verifyEmail);
router.route("/candidate/refresh-token").post(refreshAccessToken);
router.route("/candidate/forgot-password").post(candidateForgetPasswordValidator() , validate , forgotPasswordRequest);
router.route("/candidate/reset-password/:resetPasswordToken").post(candidateResetForgotPasswordValidator() , validate , resetForgetPassword );


//protection and embedded candidate object in request :: secure
router.route("/candidate/logout").post(verifyJWTCandidate ,logoutCandidate);
router.route("/candidate/resend-verify-email").post(verifyJWTCandidate ,resendVerificationEmail);
router.route("/candidate/change-password").post(verifyJWTCandidate , changeCurrentPassword);


//not secure 
router.route("/recruiter/register").post(recruiterRegisterValidator() ,validate ,registerRecruiter);
router.route("/recruiter/login").post(recruiterLoginValidator() ,validate ,loginRecruiter);
router.route("/recruiter/verify-email/:verificationToken").get(verifyEmail);
router.route("/recruiter/refresh-token").post(refreshAccessToken);
router.route("/recruiter/forgot-password").post(recruiterForgetPasswordValidator() , validate , forgotPasswordRequestForRecruiter);
router.route("/recruiter/reset-password/:resetPasswordToken").post(recruiterChangeCurrentPasswordValidator() , validate , resetForgetPasswordForRecruiter );


//protection and embedded candidate object in request :: secure
router.route("/recruiter/logout").post(verifyJWTRecruiter ,logoutRecruiter);
router.route("/recruiter/resend-verify-email").post(verifyJWTRecruiter ,resendVerificationEmailForRecruiter);
router.route("/recruiter/change-password").post(verifyJWTRecruiter , changeCurrentPasswordForRecruiter);

router.route("/")

export default router;
