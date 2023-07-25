require("dotenv").config();
const Express = require("express");
const mongoose = require("mongoose");
const User = require("./model/userModel");
const {genSalt , hash , compare} = require("bcrypt");
const CryptoJS = require("crypto-js");


const app = Express();
app.use(Express.json());
app.use(Express.urlencoded({extended:true}))

const users = {
    name: "GowthamKumar",
    email : "burlegowthamofficial@gmail.com",
    phone : "6302843248",
    password : "mongodbpassword"
}
mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.abkkb1u.mongodb.net/`)




app.post("/register", async (req,res) => {
    try {
        const UserData = await User.find({email : req.body.email});
        if(UserData.length) {
            throw new Error ("Email already registered")
        }
        const userDataP = await User.find({phone:req.body.phone});
        if(userDataP.length) {
            throw new Error ("phone number already registered")
        }
        const {password} = req.body;
        const salt = await genSalt();
        const hashedpass = await hash(password,salt);
        const data = await User.create({
            ...req.body,
            password:hashedpass
        });
        res.send(data)
    } catch (error) {
        console.log(error);
        res.send({error:error.message})
    }
});

app.post("/login", async(req,res) => {
    try{
        const {email,password} = req.body;
        const userData = await User.find({email});
        if(!userData.length) throw new Error("Email not Found");
        const {password:hashedpass,_id}=userData[0];
        const checkPass = await compare(password,hashedpass);
        if(!checkPass) throw new Error("Wrong Credentials");
        const token = CryptoJS.AES.encrypt(JSON.stringify({
            email,
            userId: _id
        }),"some random key eg. ghfsdghfashgfdqw").toString() // used for encryption and decryption...
        res.send({
            userId: _id,
            email,
            token,
        })

    } catch(error) {
        console.log(error);
        res.send({error:error.message})
    }
})


app.listen(4000, ()=> console.log("The Data Is Protected and running at 4000 km/s"))