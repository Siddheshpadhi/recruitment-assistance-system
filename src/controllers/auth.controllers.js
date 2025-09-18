import {Candidate} from "../models/candidate.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { wrapAsync } from "../utils/wrapAsync.js";
import { ApiError } from "../utils/api-error.js";
import { emailVerificationMailgenContent, sendEmail } from "../utils/mail.js";
import crypto from "crypto"
import { validate } from "../ middlewares/validator.middlewares.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const candidate = await Candidate.findById(userId);
        const accessToken = await candidate.generateAccessToken();
        const refreshToken = await candidate.generateRefreshToken();
        candidate.refreshToken = refreshToken;
        await candidate.save({validateBeforeSave: false});
        return {accessToken , refreshToken};
    } catch(error) {
        throw new ApiError(500 , `Something went wrong while generating access and refresh token ${error}`);
    }
}

const registerCandidate = wrapAsync(async (req , res) => {
    const {email , name , password } = req.body;

    const existingUser = await Candidate.findOne(
        {email}
    );

    if(existingUser) {
        throw new ApiError(409 , "User with email already exists",[])
    }

    const candidate = await Candidate.create({
        email,
        password,
        name,
        isEmailVerified: false,
    });
    //temporary hash token for email verification
    const {unHashedToken , hashedToken , tokenExpiry} = candidate.generateTemporaryToken();

    candidate.emailVerificationToken = hashedToken;
    candidate.emailVerificationExpiry = tokenExpiry;

    await candidate.save({validateBeforeSave: false});
    await sendEmail(
        {
            email:candidate?.email,
            subject: "Please verify your email",
            mailgenContent: emailVerificationMailgenContent(
                candidate.name,
                `${req.protocol}://${req.get("host")}/api/v1/candidates/verify-email/${unHashedToken}`,
            )
        }
    );
    const createdCandidate = await Candidate.findById(candidate._id).select(
        "-password -refreshToken -emailVerificationExpiry -emailVerificationToken"
    );
    if(!createdCandidate) {
        throw new ApiError(500 , "Something went wrong while registering a candidate");
    }
    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                {candidate: createdCandidate},
                "Candidate registered successfully and verification email has been sent on your email"
            )
        );
});

const loginCandidate = wrapAsync(async (req , res) => {
    const {email , password} = req.body;

    if(!email) {
        throw new ApiError(400 , "Email is required");
    }

    const existedCandidate = await Candidate.findOne( {email} );
    if(!existedCandidate) {
        throw new ApiError(400 , "User does not exists");
    }

    const isPasswordValid = await existedCandidate.isPasswordCorrect(password);

    if(!isPasswordValid) {
        throw new ApiError(400 , "Invalid Password");
    }

    const {accessToken , refreshToken} = await generateAccessAndRefreshTokens(existedCandidate._id);

    const loggedInCandidate = await Candidate.findById(existedCandidate._id).select(
        "-password -refreshtoken -emailVerificationToken -emailVerificationExpiry"
    )

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200 , {
                candidate: loggedInCandidate,
                accessToken,
                refreshToken
            }, "User logged in successfully")
        )

})  

const logoutCandidate = wrapAsync(async (req , res) => {
    await Candidate.findByIdAndUpdate(
        req.candidate._id,
        {
            $set: {
                refreshToken: ""
            }
        },
        {
            new: true
        },
    );
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
            .status(200)
            .clearCookie("accessToken",options)
            .clearCookie("refreshToken",options)
            .json(
                new ApiResponse(201 , {} ,"Candidate has logged out")
            )
});

const getCandidate = wrapAsync(async (req , res) => {
    return res
            .status(200)
            .json(
                new ApiResponse(201 , req.candidate , "Candidate Data Fetched!")
            );
});

const verifyEmail = wrapAsync(async (req , res) => {
    const verificationToken = req.params;
    if(!verificationToken) {
        throw new ApiError(400 , "Email verification token is unsuccessful");
    }
    const hashedToken = crypto
                            .createHash("sha256")
                            .update(verificationToken)
                            .digest("hex")

    const candidate = await Candidate.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: {$gt: Date.now()}
    })
    if(!candidate) throw new ApiError(401 , "Token is invalid or expired");
    candidate.emailVerificationToken = undefined;
    candidate.emailVerificationExpiry = undefined;
    candidate.isEmailVerified = true;
    await candidate.save({validateBeforeSave: false});
    return res
            .status(201)
            .json(
                200,
                {
                    isEmailVerified: true
                },
                "Email is Verified"
            );
})

const resendVerificationEmail = wrapAsync(async (req , res) => {
    let candidate = await Candidate.findOne(req.candidate?.email);
    if(!candidate) throw new ApiError(404 , "Candidate is not found");
    if(candidate.isEmailVerified === true) throw new ApiError(404 , " Candidate is already verified");
    const {unHashedToken , hashedToken , tokenExpiry} = candidate.generateTemporaryToken();
    candidate.emailVerificationToken = hashedToken;
    candidate.emailVerificationExpiry = tokenExpiry;
    await candidate.save({validateBeforeSave: false});

    await sendEmail({
        email: candidate?.email,
        subject: "Please Verify Your Email",
        mailgenContent: emailVerificationMailgenContent(
            candidate.name,
            `${req.protocol}://${req.get("host")}/api/v1/candidates/verify-email/${unHashedToken}`
        )
    });
    const loggedInCandidate = await Candidate.findById(candidate._id).select(
        "-password -refreshToken -emailVerificationExpiry -emailVerificationToken"
    );
    if(!loggedInCandidate) {
        throw new ApiError(500 , "Something went wrong while registering a candidate");
    }
    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                {candidate: loggedInCandidate},
                "Verification email has been resent on your email"
            )
        );
});

const refreshAccessToken = wrapAsync(async (req , res) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!refreshToken) throw new ApiError(401 , "Unauthorized access");
    try {
        const decodedToken = jwt.verify(refreshToken , process.env.REFRESH_TOKEN_SECRET);
        const candidate = await Candidate.findById(decodedToken?._id);
        if(!candidate) throw new ApiError(401 , "Invalid refresh token");
        if(refreshToken !== candidate?.refreshToken) {
            throw new ApiError(401 , "Refresh token is expired");
        }

        const options = {
            httpOnly: true,
            secure: true
        };

        const {accessToken , refreshToken: newRefreshToken} = await generateAccessAndRefreshTokens(candidate?._id);
        candidate.refreshToken = newRefreshToken;
        await candidate.save();
        return res
                .status(200)
                .cookie("accessToken" , accessToken , options)
                .cookie("refreshToken" , newRefreshToken , options)
                .json(
                    new ApiResponse(201 , {
                        accessToken,refreshToken: newRefreshToken
                    } , "Access Token refreshed")
                )
    } catch (error) {
        throw new ApiError(404 , "Invalid Refresh Token");
    }
})
export { registerCandidate , loginCandidate , logoutCandidate , getCandidate, verifyEmail , resendVerificationEmail , refreshAccessToken};