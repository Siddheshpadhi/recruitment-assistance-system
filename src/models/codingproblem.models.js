import mongoose , { Schema } from "mongoose";
import { Question } from "./question.models.js";

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
            },
            hidden: {
                type: Boolean,
                required: true,
                default: false
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

export const CodingProblem = Question.discriminator("coding" , codingproblemSchema);