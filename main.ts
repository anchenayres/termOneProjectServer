import express, { Express } from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import cors from 'cors';
import bcrypt from 'bcryptjs';

//Import Models
import { InventoryModel } from "./models/inventory";
import { UserModel } from "./models/user";
import { Blend } from "./models/blend";


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

//AUTH ENDPOINTS
app.post("/user/signup", async (req, res) => {

    try {

        let { username, password, role } = req.body
        //Hash password
        password = await bcrypt.hash(password, 10)
        //Create new user
        const user = await UserModel.create({ username, password, role })

        res.json(user);

    } catch (error) {
        res.status(400).json({error});
    }
})

app.post("/user/login", async (req, res) => {
    try {

        //Get variables
        const { username, password } = req.body
        //Check does this user exist
        const user = await UserModel.findOne({ username: username })

        if(user) {
            //check if password matches if user exists
            const result = await bcrypt.compare( password,user.password! );
            //if the result is true
            if(result) {
                //optional: JWT token
                res.json({success: true})
            } else {
                res.status(400).json({error: "Invalid Password"});
            }

        } else {
            res.status(400).json({error: "User does not exist"})
        }

    } catch (error) {
        res.status(400).json({error});
    }

})


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

//Blend data handling - post endpoint for recipes (BLENDS) - comment out when done
//used to poplulate database
app.post('/blend/create', async (req, res) => {
    const blendData = [
        {
            image: "assets/background.png",
            name: "Hammer",
            description: "Use me to nail things.",
            amount: 0,
            ingredients: [
                {inventoryId: "", amountNeeded: ""}
            ]
        },
        {
            image: "assets/background.png",
            name: "Saw",
            description: "Use me to make one thing.",
            amount: 0,
            ingredients: []
        }

    ]
})





//listener
app.listen(port, () => {
    console.log("[server: Server running at http://localhost:" + port);
})

