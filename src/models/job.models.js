import mongoose , {Schema} from "mongoose";
import { Recruiter } from "./recruiter.models.js";
import { Candidate } from "./candidate.models.js";
import { Assessment } from "./assessment.models.js";

const jobSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        recruiterId: {
            type: Schema.Types.ObjectId,
            ref: "recruiter"
        },
        candidatesApplied: [
            {
                type: Schema.Types.ObjectId,
                ref: "candidate"
            }
        ],
        assessmentId: {
            type: Schema.Types.ObjectId,
            ref: Assessment
        },
        
    }, {
        timestamps: true
    }
)

export const Job = mongoose.model("job" , jobSchema);