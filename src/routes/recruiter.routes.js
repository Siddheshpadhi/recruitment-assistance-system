import { getRecruiter } from "../controllers/auth.controllers.js";
import { verifyJWTRecruiter } from "../ middlewares/auth.middlewares.js";
import { Router } from "express";
import { updateRecruiter } from "../controllers/recruiter.controller.js";

const router = Router();

router.route("/profile").get(getRecruiter);
router.route("/profile/:recruiterId").post(verifyJWTRecruiter , updateRecruiter);
router.route("/jobs").get(verifyJWTRecruiter)
router.route("/jobs").post(verifyJWTRecruiter);

export default router;
