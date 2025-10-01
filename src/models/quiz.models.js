import mongoose , {Schema} from "mongoose";
import { Question } from "./question.models.js";

const quizSchema = new Schema(
    {
        options: {
            type: [String],
            validate: {
                validator: function(value) {
                    return value.length === 4;
                },
                message: props => `Quiz Questions must have exactly 4 options, but got ${props.value.length}`
            },
            required: true
        },
        correctAnswer: {
            type: String,
            required: true,
            validate: {
                validator: function(value) {
                    return this.options.includes(value);
                },
                message: props => `Answer ${props.value} must have one of the provided options`
            } 
        }
    }
);

export const Quiz = Question.discriminator("quiz" , quizSchema);