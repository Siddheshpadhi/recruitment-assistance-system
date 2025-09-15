import {ApiResponse} from "../utils/api-response.js"
import { wrapAsync } from "../utils/wrapAsync.js"
// export const healthCheck = (req , res) => {
//     try {
//         res.status(200).json(
//             new ApiResponse(200 , {message : "Server is running"})
//         );
//     } catch (error) {
//         console.log(error);
//     }
// }

export const healthCheck = wrapAsync(async (req , res) => {
    res.status(200).json(
        new ApiResponse(200 , {message: "Server is running"})
    );
})