import mongoose , {Schema} from "mongoose";

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
            ref: "recruiter",
            required: true
        },
        candidatesApplied: {
                type: [Schema.Types.ObjectId],
                ref: "candidate",
                default: []
        },
        selectedQuestions: {
            type: [Schema.Types.ObjectId],
            ref: "Question"
        },
        tags: {
            type: [String],
            required: true
        }
        
    }, {
        timestamps: true
    }
)

export const Job = mongoose.model("job" , jobSchema);