import app from "./app";
import { connectDB } from "./config/db";

app.listen(3000,async()=>{
    console.log('Server is running on port 3000');
    await connectDB();
}) 