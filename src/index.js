import dotenv from "dotenv";
import app from "./app.js";
dotenv.config({
    path: "./.env",
    debug: true
})
import connectDB from "./db/dbConnect.js";
const port = process.env.PORT || 3000;

let dbUrl = process.env.MONGO_URI;
connectDB(dbUrl)
    .then(() => {
            app.listen(port , () => {
                console.log(`Server is Listening to http://localhost:${port}`);
            })
    })
    .catch((err) => {
        console.log("Error in MongoDB Connection",err);
        process.exit(1);
    })

