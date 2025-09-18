import mongoose , { Schema } from "mongoose";

const codingproblemSchema = new Schema(
    {
        title: {
            type: String ,
            required: true ,
            unique: true ,
            trim: true ,
        },
        description: {
            type: String , 
            required: true ,
        },
        testCases: {
            type: Object,
            input: {
                type: String
            },
            output: {
                type: String
            }
        },
        Constraints: {
            type: String,
        },
        starterCode: {
            type: Object
        },
        timeLimit: {
            type: Number
        }

    }
)

export const CodingProblem = mongoose.model("problem" , codingproblemSchema);