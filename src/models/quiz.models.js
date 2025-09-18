import mongoose , {Schema} from "mongoose";

const quizSchema = new Schema(
    {
        question: {
            type: String,
            required: true,
        },
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
        answer: {
            type: String,
            required: true,
            validate: {
                validator: function(value) {
                    return this.options.includes(v);
                },
                message: props => `Answer ${props.value} must have one of the provided options`
            } 
        }
    }
);

export const Quiz = mongoose.model("quiz" , quizSchema);