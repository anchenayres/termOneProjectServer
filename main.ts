import express, { Express } from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import cors from 'cors';
import bcrypt from 'bcryptjs';

//Import Models
import { Inventory, InventoryModel } from "./models/inventory";
import { UserModel } from "./models/user";
import { Blend, BlendModel } from "./models/blend";
import { Ingredient } from "./models/ingredient";


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



// app.get("/inventory/category/:Africa", async (req, res) => {
//     const inventory = req.params

//     const category = await BlendModel.find().populate("inventory.category").exec();

//     res.send(inventory);
// })





// const newData = inventory.filter(function(category) {
//     if (!category.tags) {
//       return
//     }
//     return category.tags.includes("");
//   });
//   console.log(newData);



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
// app.post('/blend/create', async (req, res) => {
//     const blendData = [
//      ]

//     for (const blend of blendData) {
//         await BlendModel.create(blend);
//     }
//     res.send({success: true});
// })

//get all of my blends
app.get("/blend", async (req, res) => {
    try {
        const blend = await BlendModel.find().populate("ingredients.inventoryId").exec();

        //endpoint to craft blend (check if enough items to craft blend, hide button if not blendable)

        const blendWithAvailability =  await Promise.all(
            blend.map(async (blend) => {
                //1. loop through each blend
                const ingredient = blend.ingredients;
                let craftable = true;
    
                //2. loop through each ingredient to check availability
                for (const ingredients of ingredient!) {
                    //2.1 get inventory data for each ingredient
                    const inventory = await InventoryModel.findById(ingredients.inventoryId).exec();
                    //2.2 get amount available
                    const availability = inventory!.availability
                    //2.3 check availability
                    if(!availability || availability < ingredients.amountNeeded!){
                        craftable = false;
                        break;
                    }
                }
                //3. return the blend with new craftable property
                return { ...blend.toObject(), craftable }
            })

        )

        console.log(blendWithAvailability)
        //4. respond new blend
        res.send(blendWithAvailability)
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Internal server error"})
        }
})

//endpoint to craft blend (check if enough items)
app.post('/blend/craft', async (req, res) => {

    try {
        const { blendId } = req.body;

        const blend = await BlendModel.findById(blendId).exec();

        if(blend){ //check if recipe been found
            blend.availability!++ //incrementing blending amount
            blend.save()
    
            //UPDATE INVENTORY AMOUNT
            const ingredients = blend.ingredients!
            for(const ingredient of ingredients) {
                const inventoryId = ingredient.inventoryId
                const inventory = await InventoryModel.findById(inventoryId).exec();
                if(inventory) {
                    inventory.availability! -=ingredient.amountNeeded! //remove the amount that was needed
                    await inventory.save()
                }
            }
    
        }



        res.send({success: true})
    } catch (err) {
        console.log(err)
        res.status(500).send({error: err});
    }
})




//listener
app.listen(port, () => {
    console.log("[server: Server running at http://localhost:" + port);
})

