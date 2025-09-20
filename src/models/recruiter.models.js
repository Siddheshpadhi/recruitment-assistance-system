import mongoose , { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { Job } from "./job.models.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
const recruiterSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true , "Password is required"]
        },
        company: {
            type: String,
            required: [true , "Company name is required"]
        },
        JobsPosted: { 
            type: [Schema.Types.ObjectId], 
            ref: "job", 
            default: []
        },
        isEmailVerified: { //Verified Or Not
            type: Boolean,
            default: false
        },
        refreshToken: { //JWT Token
            type: String
        },
        forgotPasswordToken: { //JWT Token
            type: String
        },
        forgotPasswordExpiry: { 
            type: Date
        },
        emailVerificationToken: { //url redirecting
            type: String
        },
        emailVerificationExpiry: {
            type: String
        }
    } , {
        timestamps: true //createdAt or updatedAt
    }
);

//prehook for save
recruiterSchema.pre("save" , async function (next) {
    if(!this.isModified("password")) return next(); //password field is not modified
    this.password = await bcrypt.hash(this.password , 10);
    next();
})

//write methods in Schema
recruiterSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password , this.password); //returns true or false whether same or not
};

//jwt access token
recruiterSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
    )
}
//jwt refresh token
recruiterSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
    )
}
//jwt without data token
recruiterSchema.methods.generateTemporaryToken = function() {
    
    const unHashedToken = crypto.randomBytes(20).toString("hex");


    const hashedToken = crypto
                .createHash("sha256")
                .update(unHashedToken)
                .digest("hex");


    const tokenExpiry = Date.now() + (20*60*1000); //20 mins
    return {unHashedToken , hashedToken , tokenExpiry};
}

export const Recruiter = mongoose.model('recruiter' , recruiterSchema);