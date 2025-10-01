import mongoose , { Schema } from "mongoose";
const assessmentSchema = new Schema({
  candidateId: { 
    type: Schema.Types.ObjectId, 
    ref: "Candidate", 
    required: true 
  },

  jobId: { 
    type: Schema.Types.ObjectId, 
    ref: "Job", 
    required: true 
  },

  answers: [
    {
      question: { type: Schema.Types.ObjectId, ref: "Question" }, 
      
      // For MCQ
      selectedOption: String,  

      // For Coding
      code: String,             
      language: String,         
      output: String,           

      // Result fields
      isCorrect: Boolean,
      obtainedScore: { type: Number, default: 0 }
    }
  ],

  finalScore: { type: Number, default: 0 },

  submittedAt: { type: Date, default: Date.now }
} ,{ timestamps: true });

export const Assessment = mongoose.model("assessment" , assessmentSchema);