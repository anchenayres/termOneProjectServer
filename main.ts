import express, { Express } from "express";
import dotenv from 'dotenv';
import cors from 'cors';


//TODO: Import our Typegoose and Mongoose to connect to db
dotenv.config();

const app: Express = express();

//middleware
app.use(cors()); //avoid cors error
app.use(express.json()); //to get our params from body

//declare variables
const port = process.env.PORT || 3000;

//endpoints
app.get("/", (req, res) => {
    res.send("Working Server");
})

//listener
app.listen(port, () => {
    console.log("[server: Server running at http://localhost:" + port);
})

