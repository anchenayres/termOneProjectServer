import express, { Express } from "express";
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app: Express = express();

//middleware
app.use(cors()); //avoid cors error
app.use(express.json()); //to get our params from body

//declare variables
const port = process.env.PORT;

//endpoints
app.get("/", (req, res) => {
    res.send("Working Server");
})

