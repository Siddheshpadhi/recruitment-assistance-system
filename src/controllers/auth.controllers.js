import {Candidate} from "../models/candidate.models.js";
import { Recruiter } from "../models/recruiter.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { wrapAsync } from "../utils/wrapAsync.js";
import { ApiError } from "../utils/api-error.js";
import { emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail } from "../utils/mail.js";
import crypto from "crypto"
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const candidate = await Candidate.findById(userId);
        if(!candidate) {
            const recruiter = await Recruiter.findById(userId);
            const accessToken = await recruiter.generateAccessToken();
            const refreshToken = await recruiter.generateRefreshToken();
            recruiter.refreshToken = refreshToken;
            await recruiter.save({validateBeforeSave: false});
            return {accessToken , refreshToken};
        } 
        const accessToken = await candidate.generateAccessToken();
        const refreshToken = await candidate.generateRefreshToken();
        candidate.refreshToken = refreshToken;
        await candidate.save({validateBeforeSave: false});
        return {accessToken , refreshToken};
    } catch(error) {
        throw new ApiError(500 , `Something went wrong while generating access and refresh token ${error}`);
    }
}


//For Candidates
const registerCandidate = wrapAsync(async (req , res) => {
    const {email , name , password } = req.body;

    const existingUser = await Candidate.findOne(
        {email}
    );

    if(existingUser) {
        throw new ApiError(409 , "Candidate with email already exists",[])
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
                `${req.protocol}://${req.get("host")}/api/v1/auth/candidate/verify-email/${unHashedToken}`,
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
    const { verificationToken } = req.params;
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
                new ApiResponse(
                    200,
                    {
                        isEmailVerified: true
                    },
                    "Email is Verified"
                )
            );
});

const resendVerificationEmail = wrapAsync(async (req , res) => {
    let candidate = await Candidate.findOne({email: req.candidate?.email});
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
            `${req.protocol}://${req.get("host")}/api/v1/auth/candidate/verify-email/${unHashedToken}`
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
});

const forgotPasswordRequest = wrapAsync(async (req , res) => {
    let {email} = req.body;

    const candidate = await Candidate.findOne({email});
    if(!candidate) throw new ApiError(404 , "Email does not exists");

    let {unHashedToken , hashedToken , tokenExpiry} = candidate.generateTemporaryToken(candidate._id);
    candidate.forgotPasswordToken = hashedToken;
    candidate.forgotPasswordExpiry = tokenExpiry;

    await candidate.save({validateBeforeSave: true});

    await sendEmail({
        email: candidate?.email,
        subject: "Reset Password for Account",
        mailgenContent: forgotPasswordMailgenContent(
            candidate?.name,
            `${req.protocol}://${req.get("host")}/api/v1/auth/candidate/reset-password/${unHashedToken}`
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
                "Email has been sent for reset password"
            )
        );
});

const resetForgetPassword = wrapAsync(async (req , res) => {
    const { resetPasswordToken } = req.params;
    const { newPassword } = req.body;
    if(!resetPasswordToken) throw new ApiError(404 , "Token is not present");
    const hashedToken = crypto
                            .createHash("sha256")
                            .update(resetPasswordToken)
                            .digest("hex")
    let candidate = await Candidate.findOne({
                forgotPasswordToken: hashedToken,
                forgotPasswordExpiry: {$gt : Date.now()}
    });
    if(!candidate) throw new ApiError(404 , "Candidate is not found");
    candidate.forgotPasswordToken = undefined;
    candidate.forgotPasswordExpiry = undefined;
    candidate.password = newPassword;

    await candidate.save({validateBeforeSave: false});
    return res
            .status(201)
            .json(
                new ApiResponse(
                    200 , "Password Reset Successfully" 
                )
            );
})

const changeCurrentPassword = wrapAsync(async (req , res) => {
    const { oldPassword , newPassword } = req.body;
    const candidate = await Candidate.findOne({email: req.candidate?.email});
    if(!candidate) throw new ApiError(404 , "Login Session is Expired");
    const isPasswordValid = await candidate.isPasswordCorrect(oldPassword);
    if(!isPasswordValid) throw new ApiError(400 , "Password is not correct");
    candidate.password = newPassword;
    return res  
            .status(200)
            .json(
                new ApiResponse(200 , "Current Password is changed")
            );
});

//For Recruiter
const registerRecruiter = wrapAsync(async (req , res) => {
    const {email , name , password , company} = req.body;

    const existingUser = await Recruiter.findOne(
        {email}
    );

    if(existingUser) {
        throw new ApiError(409 , "Recruiter with email already exists",[])
    }

    const recruiter = await Recruiter.create({
        email,
        password,
        name,
        company,
        isEmailVerified: false,
    });
    //temporary hash token for email verification
    const {unHashedToken , hashedToken , tokenExpiry} = recruiter.generateTemporaryToken();

    recruiter.emailVerificationToken = hashedToken;
    recruiter.emailVerificationExpiry = tokenExpiry;

    await recruiter.save({validateBeforeSave: false});
    await sendEmail(
        {
            email:recruiter?.email,
            subject: "Please verify your email",
            mailgenContent: emailVerificationMailgenContent(
                recruiter.name,
                `${req.protocol}://${req.get("host")}/api/v1/auth/recruiter/verify-email/${unHashedToken}`,
            )
        }
    );
    const createdRecruiter = await Recruiter.findById(recruiter._id).select(
        "-password -refreshToken -emailVerificationExpiry -emailVerificationToken"
    );
    if(!createdRecruiter) {
        throw new ApiError(500 , "Something went wrong while registering a candidate");
    }
    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                {recruiter: createdRecruiter},
                "Recruiter registered successfully and verification email has been sent on your email"
            )
        );
});

const loginRecruiter = wrapAsync(async (req , res) => {
    const {email , password} = req.body;

    if(!email) {
        throw new ApiError(400 , "Email is required");
    }

    const existedRecruiter = await Recruiter.findOne( {email} );
    if(!existedRecruiter) {
        throw new ApiError(400 , "Recruiter does not exists");
    }

    const isPasswordValid = await existedRecruiter.isPasswordCorrect(password);

    if(!isPasswordValid) {
        throw new ApiError(400 , "Invalid Password");
    }

    const {accessToken , refreshToken} = await generateAccessAndRefreshTokens(existedRecruiter._id);

    const loggedInRecruiter = await Recruiter.findById(existedRecruiter._id).select(
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
                recruiter: loggedInRecruiter,
                accessToken,
                refreshToken
            }, "User logged in successfully")
        )

})  

const logoutRecruiter = wrapAsync(async (req , res) => {
    await Recruiter.findByIdAndUpdate(
        req.recruiter._id,
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
                new ApiResponse(201 , {} ,"Recruiter has logged out")
            )
});

const getRecruiter = wrapAsync(async (req , res) => {
    return res
            .status(200)
            .json(
                new ApiResponse(201 , req.recruiter , "Recruiter Data Fetched!")
            );
});

const verifyEmailForRecruiter = wrapAsync(async (req , res) => {
    const { verificationToken } = req.params;
    if(!verificationToken) {
        throw new ApiError(400 , "Email verification token is unsuccessful");
    }
    const hashedToken = crypto
                            .createHash("sha256")
                            .update(verificationToken)
                            .digest("hex")

    const recruiter = await Recruiter.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: {$gt: Date.now()}
    })
    if(!recruiter) throw new ApiError(401 , "Token is invalid or expired");
    recruiter.emailVerificationToken = undefined;
    recruiter.emailVerificationExpiry = undefined;
    recruiter.isEmailVerified = true;
    await recruiter.save({validateBeforeSave: false});
    return res
            .status(201)
            .json(
                new ApiResponse(
                    200,
                    {
                        isEmailVerified: true
                    },
                    "Email is Verified"
                )
            );
});

const resendVerificationEmailForRecruiter = wrapAsync(async (req , res) => {
    let recruiter = await Recruiter.findOne({email: req.recruiter?.email});
    if(!recruiter) throw new ApiError(404 , "Recruiter is not found");
    if(recruiter.isEmailVerified === true) throw new ApiError(404 , " Recruiter is already verified");
    const {unHashedToken , hashedToken , tokenExpiry} = recruiter.generateTemporaryToken();
    recruiter.emailVerificationToken = hashedToken;
    recruiter.emailVerificationExpiry = tokenExpiry;
    await recruiter.save({validateBeforeSave: false});

    await sendEmail({
        email: recruiter?.email,
        subject: "Please Verify Your Email",
        mailgenContent: emailVerificationMailgenContent(
            recruiter.name,
            `${req.protocol}://${req.get("host")}/api/v1/auth/recruiter/verify-email/${unHashedToken}`
        )
    });
    const loggedInRecruiter = await Recruiter.findById(recruiter._id).select(
        "-password -refreshToken -emailVerificationExpiry -emailVerificationToken"
    );
    if(!loggedInRecruiter) {
        throw new ApiError(500 , "Something went wrong while resending email");
    }
    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                {recruiter: loggedInRecruiter},
                "Verification email has been resent on your email"
            )
        );
});

const refreshAccessTokenForRecruiter = wrapAsync(async (req , res) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!refreshToken) throw new ApiError(401 , "Unauthorized access");
    try {
        const decodedToken = jwt.verify(refreshToken , process.env.REFRESH_TOKEN_SECRET);
        const recruiter = await Recruiter.findById(decodedToken?._id);
        if(!recruiter) throw new ApiError(401 , "Invalid refresh token");
        if(refreshToken !== recruiter?.refreshToken) {
            throw new ApiError(401 , "Refresh token is expired");
        }

        const options = {
            httpOnly: true,
            secure: true
        };

        const {accessToken , refreshToken: newRefreshToken} = await generateAccessAndRefreshTokens(recruiter?._id);
        recruiter.refreshToken = newRefreshToken;
        await recruiter.save();
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
});

const forgotPasswordRequestForRecruiter = wrapAsync(async (req , res) => {
    let {email} = req.body;

    const recruiter = await Recruiter.findOne({email});
    if(!recruiter) throw new ApiError(404 , "Email does not exists");

    let {unHashedToken , hashedToken , tokenExpiry} = recruiter.generateTemporaryToken(recruiter._id);
    recruiter.forgotPasswordToken = hashedToken;
    recruiter.forgotPasswordExpiry = tokenExpiry;

    await recruiter.save({validateBeforeSave: true});

    await sendEmail({
        email: recruiter?.email,
        subject: "Reset Password for Account",
        mailgenContent: forgotPasswordMailgenContent(
            recruiter?.name,
            `${req.protocol}://${req.get("host")}/api/v1/auth/recruiter/reset-password/${unHashedToken}`
        )
    });
    
    const loggedInRecruiter = await Recruiter.findById(recruiter._id).select(
        "-password -refreshToken -emailVerificationExpiry -emailVerificationToken"
    );
    if(!loggedInRecruiter) {
        throw new ApiError(500 , "Something went wrong while registering a candidate");
    }
    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                {recruiter: loggedInRecruiter},
                "Email has been sent for reset password"
            )
        );
});

const resetForgetPasswordForRecruiter = wrapAsync(async (req , res) => {
    const { resetPasswordToken } = req.params;
    const { newPassword } = req.body;
    if(!resetPasswordToken) throw new ApiError(404 , "Token is not present");
    const hashedToken = crypto
                            .createHash("sha256")
                            .update(resetPasswordToken)
                            .digest("hex")
    let recruiter = await Recruiter.findOne({
                forgotPasswordToken: hashedToken,
                forgotPasswordExpiry: {$gt : Date.now()}
    });
    if(!recruiter) throw new ApiError(404 , "Candidate is not found");
    recruiter.forgotPasswordToken = undefined;
    recruiter.forgotPasswordExpiry = undefined;
    recruiter.password = newPassword;

    await recruiter.save({validateBeforeSave: false});
    return res
            .status(201)
            .json(
                new ApiResponse(
                    200 , "Password Reset Successfully" 
                )
            );
})

const changeCurrentPasswordForRecruiter = wrapAsync(async (req , res) => {
    const { oldPassword , newPassword } = req.body;
    const recruiter = await Recruiter.findOne({email: req.candidate?.email});
    if(!recruiter) throw new ApiError(404 , "Login Session is Expired");
    const isPasswordValid = await recruiter.isPasswordCorrect(oldPassword);
    if(!isPasswordValid) throw new ApiError(400 , "Password is not correct");
    recruiter.password = newPassword;
    return res  
            .status(200)
            .json(
                new ApiResponse(200 , "Current Password is changed")
            );
});
export { registerCandidate , loginCandidate , logoutCandidate , getCandidate, verifyEmail , resendVerificationEmail , refreshAccessToken , forgotPasswordRequest , resetForgetPassword , changeCurrentPassword};
export { registerRecruiter , loginRecruiter , logoutRecruiter , getRecruiter , verifyEmailForRecruiter , resendVerificationEmailForRecruiter , refreshAccessTokenForRecruiter , forgotPasswordRequestForRecruiter , resetForgetPasswordForRecruiter , changeCurrentPasswordForRecruiter}