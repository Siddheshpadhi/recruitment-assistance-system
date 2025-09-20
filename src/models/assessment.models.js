import mongoose , { Schema } from "mongoose";
import { Candidate } from "./candidate.models.js";
import { Job } from "./job.models.js";
import { CodingProblem } from "./codingproblem.models.js";
import { Quiz } from "./quiz.models.js";
import { Question } from "./question.models.js";
const assessmentSchema = new Schema(
    {
        candidatesApplied: {
            type: [Schema.Types.ObjectId],
            ref: "candidate",
            default: []
        },
        jobId: {
            type: Schema.Types.ObjectId,
            ref: "job"
        },
        answers: [
            {
                questionId: { 
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "question",
                    required: true
                },
                
                // For aptitude/quiz
                selectedOption: {
                    type: String
                },

                // For coding problems
                submittedCode: {
                    type: String 
                },
                codeLanguage: {
                    type: String 
                },

                // about the aptitude given
                isCorrect: {
                    type: Boolean 
                },
                score: {
                    type: Number 
                }
            }
        ],
        finalScore: {
            aptitude: {
                type: Number,
                default: 0 
            },
            quiz: {
                type: Number,
                default: 0 
            },
            coding: {
                type: Number,
                default: 0 
            },
            total: {
                type: Number,
                default: 0 
            },
        },
        submittedAt: {
                type: Date,
                default: Date.now()
        }
    }, {
        timestamps: true
    }
)

export const Assessment = mongoose.model("assessment" , assessmentSchema);