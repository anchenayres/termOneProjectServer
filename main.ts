import express, { Express } from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import cors from 'cors';

//Import Models
import { InventoryModel } from "./models/inventory";


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
    console.log("Connected Successfully to MongoDB")
}).catch((error) => {
    console.log(error.message)
});

//endpoints - optional to have endpoints in a seperate route files
app.get("/", (req, res) => {
    res.send("Working Server");
})

//INVENTORY CRUD calls

//view all
app.get("/inventory", async (req, res) => {
    const inventory = await InventoryModel.find({});
    res.send(inventory);
})

//add a new item
app.post("/inventory", async (req, res) => {
    const {image, title, category, description, availability} = req.body;

    const inventory = await InventoryModel.create({image, title, category, description, availability});
    res.send(inventory);
})

//update availability
app.put("/inventory/:id", async (req, res) => {
    const { id } = req.params
    const { availability } = req.body;

    const inventory = await InventoryModel.findByIdAndUpdate(id, { availability }, {new: true})

    res.send(inventory);
})

//delete
app.delete("/inventory/:id", async (req, res) => {
    const { id } = req.params

    const inventory = await InventoryModel.findByIdAndDelete(id)

    res.send(inventory);
})



//listener
app.listen(port, () => {
    console.log("[server: Server running at http://localhost:" + port);
})

