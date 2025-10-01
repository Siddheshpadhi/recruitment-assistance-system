import express from "express"
import cors from "cors"
const app = express();

//basic express configurations
app.use(express.json({ limit: "16kb"}));
app.use(express.urlencoded({ extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());
//basic cors configurations
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET" , "POST" , "PUT" , "PATCH" , "DELETE" , "OPTIONS"],
    allowedHeaders: ["Content-Type" , "Authorization"]
}))

//import the routes

import healthCheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import recruiterRouter from "./routes/recruiter.routes.js"
import cookieParser from "cookie-parser";
app.use("/api/v1/healthcheck" , healthCheckRouter);
app.use("/api/v1/auth" , authRouter);
app.use("/api/v1/recruiter" , recruiterRouter);
app.get("/" , (req , res) => {
    console.log("request received");
    res.send("Home Route to Recruitment");
})

export default app;