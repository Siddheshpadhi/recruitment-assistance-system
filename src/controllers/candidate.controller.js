import { Candidate } from "../models/candidate.models";
import { wrapAsync } from "../utils/wrapAsync";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import { Job } from "../models/job.models";



const updateCandidate = wrapAsync(async (req , res) => {
        const candidateId = req.params;
                const newCandidateDetails = req.body;
                if(!newCandidateDetails) throw new ApiError(404 , "Invalid User");
                const updateCandidateDetails = await Candidate.findByIdAndUpdate(candidateId , newCandidateDetails).select("-password -refreshtoken -emailVerificationToken -emailVerificationExpiry");
                if(!updateCandidateDetails) throw new ApiError(400 , "Something went wrong while Updating Candidate");
                return res
                        .status(200)
                        .json(
                            new ApiResponse(201 ,
                                {candidate: updateCandidateDetails},
                                "User Details are Updated Successfully!!!"
                             )
                        );
    
});

const getAllJobListings = wrapAsync(async (req , res) => {
    const jobs = await Job.find({}).select(
        "-description -recruiterId -candidatesApplied -selectedQuestions"
    );

    if(!jobs) throw new ApiError(500 , "No jobs found");
    return res
            .status(200)
            .json(
                new ApiResponse(200 , jobs , "All jobs are listed")
            );

});

const getSpecificJobDetails = wrapAsync(async (req , res) => {
    const {jobId} = req.params;
    const job = await Job.findById(jobId).select(
        "-selectedQuestions -candidatesApplied"
    );
    if(!job) throw new ApiError(400 , "Job details are not found");
    return res      
            .status(200)
            .json(
                new ApiResponse(200 , job , "Job details Fetched")
            );
});

const applyForJob = wrapAsync(async (req , res) => {
    const candidate = req.candidate;
    const retrievedCandidate = await Candidate.findById(candidate._id);
    if(!retrievedCandidate) throw new ApiError(400 , "Invalid Access");
    if(!retrievedCandidate.resumeUrl) throw new ApiError(400 , "Please attach your resume!!!");
    const { jobId } = req.params;
    const job = await Job.findById(jobId).select(
        "-selectedQuestions"
    );
    if(!job) throw new ApiError(404 , "Invalid Job");
    job.candidatesApplied.push(retrievedCandidate._id);
    await job.save({validateBeforeSave: false});
    const updatedJob = await Job.findById(jobId).select(
        "-selectedQuestions -candidatesApplied"
    );
    if(!updatedJob) throw new ApiError(400 , "Something went wrong while retrieving the job details");

    return res  
            .status(200)
            .json(
                new ApiResponse(200 , updatedJob , "You have Applied for the job role")
            )
});


export {updateCandidate , applyForJob};