import { Router } from "express";
import { getCandidate } from "../controllers/auth.controllers.js"; 
import { verifyJWTCandidate } from "../ middlewares/auth.middlewares.js";
import { applyForJob, getAllJobListings, getSpecificJobDetails, updateCandidate } from "../controllers/candidate.controller.js";

const router = Router();

router.route("/profile").get(verifyJWTCandidate , getCandidate);
router.route("/profile/:recruiterId").post(verifyJWTCandidate , updateCandidate);
router.route("/jobs").get(verifyJWTCandidate , getAllJobListings);
router.route("/jobs/:jobId").get(verifyJWTCandidate , getSpecificJobDetails);
router.route("/jobs/:jobId").post(verifyJWTCandidate , applyForJob); //Till to apply for the job