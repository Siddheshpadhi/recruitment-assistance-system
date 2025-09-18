import mongoose , { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto"
const candidateSchema = new Schema(
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
        resumeUrl: {
            type: String,
        },
        password: {
            type: String,
            required: [true , "Password is required"]
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
            type: Date
        }
    } , {
        timestamps: true //createdAt or updatedAt
    }
);

//prehook for save
candidateSchema.pre("save" , async function (next) {
    if(!this.isModified("password")) return next(); //password field is not modified
    this.password = await bcrypt.hash(this.password , 10);
    next();
})

//write methods in Schema
candidateSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password , this.password); //returns true or false whether same or not
};

//jwt access token
candidateSchema.methods.generateAccessToken = async function() {
    console.log(process.env.ACCESS_TOKEN_EXPIRY);
    const token = jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
    )
    return token;
}
//jwt refresh token
candidateSchema.methods.generateRefreshToken = async function() {
    console.log(process.env.REFRESH_TOKEN_EXPIRY);
    const token = jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
    )
    return token;
}
//jwt without data token
candidateSchema.methods.generateTemporaryToken = function() {
    
    const unHashedToken = crypto.randomBytes(20).toString("hex");


    const hashedToken = crypto
                .createHash("sha256")
                .update(unHashedToken)
                .digest("hex");


    const tokenExpiry = Date.now() + (20*60*1000); //20 mins
    return {unHashedToken , hashedToken , tokenExpiry};
}
export const Candidate = mongoose.model('candidate' , candidateSchema);