import { Recruiter } from "../models/recruiter.models.js";
import { wrapAsync } from "../utils/wrapAsync.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { Job } from "../models/job.models.js";
import { Assessment } from "../models/assessment.models.js";
import { Question } from "../models/question.models.js";
import { Candidate } from "../models/candidate.models.js";


const updateRecruiter = wrapAsync(async (req , res) => {
        const recruiterId = req.params;
        const newRecruiterDetails = req.body;
        if(!newRecruiterDetails) throw new ApiError(404 , "Invalid User");
        const updateRecruiterDetails = await Recruiter.findByIdAndUpdate(recruiterId , newRecruiterDetails).select("-password -refreshtoken -emailVerificationToken -emailVerificationExpiry");
        if(!updateRecruiterDetails) throw new ApiError(400 , "Something went wrong while Updating Recruiter");
        return res
                .status(200)
                .json(
                    new ApiResponse(201 ,
                        {recruiter: updateRecruiterDetails},
                        "User Details are Updated Successfully!!!"
                     )
                );
});

const getJobListing = wrapAsync(async (req , res) => {
    const recruiter = req.recruiter;
    if(!recruiter) throw new ApiError(404 , "Invalid User Access");
    const jobsList = await Recruiter.findById(recruiter._id).populate("JobsPosted");
    return res
            .status(200)
            .json(
                new ApiResponse(201 , {JobsPosted : jobsList} , "Jobs are listed!!!")
            )
});

const postJobListing = wrapAsync(async (req , res) => {
    const recruiterDetails = req.recruiter;
    const receivedJobDetails = req.body;
    const recruiter = await Recruiter.findById(recruiterDetails._id);
    if(!recruiter) throw new ApiError(400 , "Recruiter is not found");
    const newJob = await Job.create({
        title: receivedJobDetails.title,
        description: receivedJobDetails.description,
        recruiterId: recruiter._id
    });
    if(!newJob) throw new ApiError(400 , "Unable to Create Job Listing");
    recruiter.JobsPosted.push(newJob._id);
    await newJob.save({validateBeforeSave: false});
    await recruiter.save({validateBeforeSave: false});
    return res
            .status(200)
            .json(
                new ApiResponse(
                    201 , {Job: newJob} , "Job is listed Successfully"
                )
            );
});

const updateJobListing = wrapAsync(async (req , res) => {
    const { jobId } = req.params;
    const updateJob = req.body;
    const job = await Job.findByIdAndUpdate(jobId , updateJob);
    if(!job) throw new ApiError(404 , "Job does not exists");
    return res
            .status(201)
            .json(
                new ApiResponse(200 , {job} , "Updated The Job Listing")
            );
});

const deleteJobPosting = wrapAsync(async (req , res) => {
    const recruiter = req.recruiter;
    const {jobId} = req.params;
    const unmodifiedRecruiter = await Recruiter.findByIdAndUpdate(recruiter._id, {$pull : {JobsPosted : jobId}});
    if(!unmodifiedRecruiter) throw new ApiError(500 , "Recruiter Job is not able to delete");
    const job = await Job.findByIdAndDelete(jobId);
    if(!job) throw new ApiError(500 , "Job does not get deleted");
    await unmodifiedRecruiter.save({validateBeforeSave: false});
    return res
            .status(200)
            .json(
                new ApiResponse(200 , {unmodifiedRecruiter , job} , "Job Listing is Deleted")
            );
});

const getQuestions = wrapAsync(async (req , res) => {
    const { type } = req.body;
    const questions = await Question.find({type});
    if(!questions) throw new ApiError(400 , "Invalid Question Type");
    return res
            .status(200)
            .json(
                new ApiResponse(200 , questions , "Questions are Fetched")
            );
})

const addQuestions = wrapAsync(async (req , res) => {
    const { jobId } = req.params;
    const { questions } = req.body;
    try {
        const job = await Job.findById(jobId);
        if(!job) throw new ApiError(404 , "Job is invalid");
        for(question of questions) job.selectedQuestions.push(question);
        await job.save({validateBeforeSave: false});
        return res  
                .status(200)
                .json(
                    200,
                    new ApiResponse(200 , {job} , "Questions added Successfully")
                );
    } catch (error) {
        throw new ApiError(404 , "Error Occured while adding questions");
    }
});

const viewLeaderboard = wrapAsync(async (req , res) => {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if(!job) throw new ApiError(400 , "Job does not exists");
    const assessments = await Assessment.find({jobId});
    for(assessment of assessments) {
        const candidateName = await Candidate.findById(assessment.candidateId).select("name");
        assessment.candidateName = candidateName; 
    }
    return res  
            .status(200)
            .json(
                new ApiResponse(200 , assessments , "Data of Candidates Result")
            );
});

const seeQuestion = wrapAsync(async (req , res) => {
    const { questionId } = req.params;
    const question = await Question.findById(questionId);
    if(!question) throw new ApiError(400 , "There is error in finding question");
    return res
            .status(200)
            .json(
                new ApiResponse(200 , question , "Question is Retrived")
            );

})

const contactCandidate = wrapAsync(async (req , res) => {
    const { jobId } = req.params;
    const { candidateId } = req.params || req.body;
    const candidate = await Candidate.findById(candidateId).select(
        "name  email  resumeUrl"
    );
    return res
            .status(200)
            .json(
                new ApiResponse(200 , candidate , "Candidate Data is fetched")
            );
});

const startTheAssessment = wrapAsync(async (req , res) => {
    const { jobId } = req.params;
    const recruiter = req.recruiter;  
    return res
            .status(200)
            .json(
                new ApiResponse(200 , "Assessment Started")
            );
    
});
export { updateRecruiter , getJobListing , postJobListing, updateJobListing , deleteJobPosting , getQuestions , addQuestions , viewLeaderboard , contactCandidate , seeQuestion , startTheAssessment};
