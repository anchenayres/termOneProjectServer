import express, { Express } from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app: Express = express();

//middleware
app.use(cors()); //avoid cors error
app.use(express.json()); //to get our params from body

//declare variables
const port = process.env.PORT || 3000;
const clusterUrl = process.env.CLUSTER;

//establish our mongodb connection
mongoose.set('strictQuery', false);
mongoose.connect(clusterUrl!).then(() => {
    console.log("Connected Successfully")
}).catch((error) => {
    console.log(error.message)
});

//endpoints
app.get("/", (req, res) => {
    res.send("Working Server");
})

//listener
app.listen(port, () => {
    console.log("[server: Server running at http://localhost:" + port);
})

