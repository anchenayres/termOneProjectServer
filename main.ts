import express, { Express } from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import cors from 'cors';
import bcrypt from 'bcryptjs';


//Import Models
import { Inventory, InventoryModel } from "./models/inventory";
import { Africa, AfricaModel } from "./models/africa";
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
                    let availability 
                    if (inventory?.availability) {
                     availability = inventory!.availability
                     console.log(inventory.title)

                    } else {
                        console.log(inventory)
                    }
                    // console.log(availability)
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

app.post('/blend/create', async (req, res) => {
    const blendData = [
        {
            image: "assets/light2.webp",
            name: "Freshness in a Bag",
            description: "Lemongrass undertones with a fruity acidity",
            availability: 0,
            ingredients: [
                {inventoryId: "6437aefbe9a1cb2df64acf72", amountNeeded: 30},
                {inventoryId: "6437ae95e9a1cb2df64acf6e", amountNeeded: 55},
            ]
        },
        {
            image: "assets/light2.webp",
            name: "Oh So Sweet",
            description: "Contradicting taste of honey with a bitter undertone",
            availability: 0,
            ingredients: [
                {inventoryId: "6437ae26e9a1cb2df64acf6a", amountNeeded: 15},
                {inventoryId: "6437ad8fe9a1cb2df64acf66", amountNeeded: 86},
            ]
        },
        {
            image: "assets/light2.webp",
            name: "Wake Me Up",
            description: "Enjoyable as pure black coffee with fruity undertones",
            availability: 0,
            ingredients: [
                {inventoryId: "6437ad39e9a1cb2df64acf62", amountNeeded: 60},
                {inventoryId: "6437acd6e9a1cb2df64acf5e", amountNeeded: 10},
            ]
        },
        {
            image: "assets/light2.webp",
            name: "Rest in Peace",
            description: "Decafinated with earthy, creamy undertones",
            availability: 0,
            ingredients: [
                {inventoryId: "6437ac92e9a1cb2df64acf5a", amountNeeded: 46},
                {inventoryId: "6437abcde9a1cb2df64acf51", amountNeeded: 47},
            ]
        },
        {
            image: "assets/light2.webp",
            name: "You've Got Company",
            description: "Chocolate and nutty delight with fruity acidity",
            availability: 0,
            ingredients: [
                {inventoryId: "6437ab58e9a1cb2df64acf4a", amountNeeded: 74},
                {inventoryId: "6437a9bbe9a1cb2df64acf3e", amountNeeded: 10},
            ]
        },
        ]
        for(const blend of blendData){
            await BlendModel.create(blend);
        }
        res.send({success: true});
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
    } catch (error) {
        console.log(error)
        res.status(500).send({error: error});
    }
})

//africa
app.get("/africa", async (req, res) => {
    const { id } = req.body;
    const { category } = req.body;

    const categoryValue = "Africa"
    
    const africa = await AfricaModel.find({categry:categoryValue})
    res.send(africa);
})

//view all
// app.get("/africa", async (req, res) => {
    
//     const {africaId} = req.body;

//     const category = "Africa"

//     const africa = await AfricaModel.findById(africaId).exec();
//     res.send(africa);
//     console.log(category)
// }
// )

// app.get("/africa", async (req, res) => {
    
//     try{
//         const africa = await AfricaModel.find().populate("category.africaId").exec();

//        const africaAvailable = await Promise.all(
//         africa.map(async (africa)=>{
//             const category = africa.category;

//             for(const af of category!){
//                 const africa = await AfricaModel.findById(af).exec();
//                 let avail
//                 if(africa?.category){
//                     avail = africa!.category
//                     console.log(category)
//                 } else {
//                     console.log(africa)
//                 }
//             }
//         })
//        ) 

//     }catch(error)  {
//         console.log(error)
//     }
// }
// )



// for (const ingredients of ingredient!) {
//     //2.1 get inventory data for each ingredient
//     const inventory = await InventoryModel.findById(ingredients.inventoryId).exec();
//     //2.2 get amount available
//     let availability 
//     if (inventory?.availability) {
//      availability = inventory!.availability
//      console.log(inventory.title)

//     } else {
//         console.log(inventory)
//     }
//     // console.log(availability)
//     //2.3 check availability
//     if(!availability || availability < ingredients.amountNeeded!){
//         craftable = false;
//         break;
        
//     }


        


//add a new item
app.post("/africa", async (req, res) => {
    const {image, title, category, description, availability} = req.body;

    const africa = await AfricaModel.create({image, title, category, description, availability});
    res.send(africa);
    
})


//listener
app.listen(port, () => {
    console.log("[server: Server running at http://localhost:" + port);
})

