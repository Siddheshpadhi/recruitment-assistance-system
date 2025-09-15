import mongoose from "mongoose";

const connectDB = async (dbUrl) => {
    try {
        console.log(typeof(dbUrl));
        await mongoose.connect(dbUrl);
        console.log("MongoDB connected");
    } catch(error) {
        console.error("MongoDB Connection Error" , error);
        process.exit(1);
    }
}

export default connectDB;