import { Candidate } from "../models/candidate.models.js";
import { wrapAsync } from "../utils/wrapAsync.js";
import { ApiError } from "../utils/api-error.js";
import jwt from "jsonwebtoken";
import { json } from "express";

export const verifyJWT = wrapAsync(async (req , res , next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
    if(!token) {
        throw new ApiError(401 , "unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET);
        const candidate = await Candidate.findById(decodedToken?._id).select(
            "-password -emailVerificationToken -emailVerificationExpiry -refreshToken "
        );
        if(!candidate) throw new ApiError(401 , "Invalid Access Token");

        req.candidate = candidate;
        next();
    } catch (error) {
        throw new ApiError(401 , "Invalid Access Token")
    }
})
