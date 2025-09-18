import mongoose , { Schema } from "mongoose";

const questionSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        type: {
            type: String,
            required: true,
            enum: ["coding" , "quiz" , "aptitude"]
        },
        difficulty: {
            type: String,
            enum: ["easy" , "medium" , "hard"],
            default: "medium"
        },
        createdBy: {
                type: String,
                enum: ["system"],
                default: "system"
        },
        visibility: {
            type: String,
            enum: ["public"],
            default: "public"
        }
    } , {
        discriminatorKey: "type" , collection: "questions"
    }
);

export const Question = mongoose.model("question" , questionSchema);