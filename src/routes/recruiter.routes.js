import { getRecruiter } from "../controllers/auth.controllers.js";
import { verifyJWTRecruiter } from "../ middlewares/auth.middlewares.js";
import { Router } from "express";
import { contactCandidate, deleteJobPosting, getQuestions, postJobListing, seeQuestion, startTheAssessment, updateJobListing, updateRecruiter, viewLeaderboard } from "../controllers/recruiter.controller.js";

const router = Router();

router.route("/profile").post(verifyJWTRecruiter , getRecruiter);
router.route("/profile/:recruiterId").post(verifyJWTRecruiter , updateRecruiter);
router.route("/jobs").get(verifyJWTRecruiter , postJobListing);
router.route("/jobs/:jobId").post(verifyJWTRecruiter , updateJobListing);
router.route("/jobs/:jobId").delete(verifyJWTRecruiter , deleteJobPosting);
router.route("/jobs/:jobId/questions").get(verifyJWTRecruiter , getQuestions);//type of the question mentioned in request
router.route("/jobs/:jobId/questions/:questionId").get(verifyJWTRecruiter , seeQuestion);
router.route("/jobs/:jobId/assessment").post(verifyJWTRecruiter , startTheAssessment);//Not yet ready
router.route("/jobs/:jobId/leaderboard").get(verifyJWTRecruiter , viewLeaderboard);
router.route("/jobs/:jobId/:candidateId").get(verifyJWTRecruiter , contactCandidate);

export default router;
