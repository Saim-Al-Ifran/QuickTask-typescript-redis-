import app from "./app";
import { connectDB } from "./config/db";

const PORT = process.env.PORT || 3000;

app.listen(PORT,async()=>{
    console.log('Server is running on port 3000');
    await connectDB();
}) 