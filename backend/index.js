const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const dotenv = require("dotenv").config()


const app = express()
app.use(cors())
app.use(express.json({limit : "10mb"}))

 const PORT = process.env.PORT || 8080

//mongodb connection

mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log("connect to Database"))
    .catch((err)=>console.log(err))

//schema
const userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: {
        type: String,
        unique : true
    },
    password: String,
    confirmPassword: String,
    image : String
})

//
const userModel = mongoose.model("user", userSchema)



//Api
app.get("/",(req,res) => {
   res.send("server is starting")
})
//sign up 
app.post("/signup",async (req,res)=>{
    console.log(req.body)
    const { email } = req.body
    
   
userModel.findOne({ email: email },)
    .then(result => {
        console.log(result);

        if (result) {
            res.send({ message: "Email ID is already registered", alert : false });
        }
      
         else {
            const data = new userModel(req.body);
            return data.save();
        }
    })
    .then(savedData => {
        res.send({ message: "Successfully signed up", alert : true });
    })
    .catch(error => {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    });
    

})
//api login
app.post("/login", (req, res) => {
    console.log(req.body)
    const { email } = req.body
    
    userModel.findOne({ email: email })
        .then(result => {
            
      
            const dataSend = {
       _id : result._id,
        firstName: result.firstName ,
        lastName: result.lastName,
       email: result.email,
       image : result.image
         }
           console.log(dataSend);
            if (result) {
                res.send({ message: "login is successfully", alert: true, data : dataSend });
            }
            //cette condition ça functionne pas un erreur can't reading _id => can't reading data
            else {
                res.send({ message: "Email is not available, please sign up", alert: false});
            }
        })
})

//product section

const schemaProdect = mongoose.Schema({

    name: String,
    category: String,
    image: String,
    price: Number,
    description: String
});

const productModel = mongoose.model("product", schemaProdect)



//save product in data
//api :

app.post("/uploadProduct", async(req, res) => {
    console.log(req.body)

const data =  await productModel(req.body);
  const dateSave = await data.save();

    res.send({ message: "upload successfully" })
})

//get product
app.get("/product", async(req, res) => {
    const data = await productModel.find({})
    res.send(JSON.stringify(data))
})
app.listen(PORT,()=>console.log("server is starting at port : " + PORT))