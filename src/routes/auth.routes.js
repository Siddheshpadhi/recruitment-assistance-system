import { Router } from "express";
import { loginCandidate, registerCandidate , logoutCandidate, getCandidate, verifyEmail, refreshAccessToken, resendVerificationEmail} from "../controllers/auth.controllers.js"
import { validate } from "../ middlewares/validator.middlewares.js";
import { candidateLoginValidator, candidateRegisterValidator} from "../validators/index.js";
import { verifyJWT } from "../ middlewares/auth.middlewares.js";
const router = Router();
//candidateRegisterValidator is not a middleware it just validates and sends an array of errors
//validate is a middleware which processes the errors with validationResult method and if there are errors then it is throwing an apiError
router.route("/register").post(candidateRegisterValidator() ,validate ,registerCandidate);
router.route("/login").post(candidateLoginValidator() ,validate ,loginCandidate);

//protection and embedded candidate object in request
router.route("/logout").post(verifyJWT ,logoutCandidate);
router.route("/").get(verifyJWT ,getCandidate);
router.route("/verify-email/:verificationToken").post(verifyEmail);
router.route("/resend-verify-email").post(verifyJWT ,resendVerificationEmail);
router.route("/refresh-token").post(refreshAccessToken);


router.route("/")

export default router;
