const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const dotenv = require("dotenv").config()
const bcrypt = require("bcrypt")
const bcryptSalt = bcrypt.genSalt(10)

const app = express()
app.use(cors())
app.use(express.json({limit : "40mb"}))

const PORT = process.env.PORT || 5000 
app.get("/",(req,res)=>{
    res.send("Server is running")
})
//schema
const userSchema = new mongoose.Schema({
    name: {type : String, required: true, unique:true},
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
  });
  
  userSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.passwordHash);
  };
  const plaintextPassword = 'password123';
const hashedPassword = '$2b$10$S5i9BhZNMw5q4YXK7I2hbejiU4o/1l0h3pAJ3FVcz/8GOELgCQf7W';

bcrypt.compare(plaintextPassword, hashedPassword, (err, result) => {
  if (err) {
    // Handle the error
    console.error(err);
  } else {
    // result will be true if the plaintext password matches the hashed password
    if (result) {
      console.log('Password matches');
    } else {
      console.log('Password does not match');
    }
  }
});
//
const userModel = mongoose.model('User', userSchema);
module.exports = userModel;

//mongo db connection
console.log(process.env.MONGODB_URL)
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_URL)
.then(()=>console.log("Connected to Database"))
.catch((err)=>console.log(err))

//register api
app.post('/register', async (req, res) => {
    const { email, password ,name} = req.body;
    try {
      const existingUser = await userModel.findOne({ email,name });
      if (existingUser) {
        return res.send({ message: 'Email already registered', alert: false });
      }
  
      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = new userModel({ email,name, passwordHash });
      await newUser.save();
      return res.send({ message: 'Registration is Successful', alert: true });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: 'Internal server error', alert: false });
    }
  });
  
// Login api
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await userModel.findOne({ email: email }).exec();
      if (user) {
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (passwordMatch) {
          const dataSend = {
            name: user.name,
            email: user.email,
          };
          res.status(200).send({ message: "Login is Successful", alert: true, data: dataSend });
        } else {
          res.status(500).send({ message: "Invalid email or password", alert: false });
        }
      } else {
        res.send({ message: "Email is not Registered, Please SignUp", alert: false });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Internal server error", alert: false });
    }
  });
  //Place Api
  const schemaPlayers = mongoose.Schema({
    title : String,
        DOB : String,
        age : String,
        address :String,
        photos : [String],
        videolink : String,
        jersey : String,
        club : String,
        perks : [String],
        category : String,
        description : String,
        goals:String,
        assists: String,
        appearances: String,
        redcard: String,
        yellowcard: String,
  })
  const PlayerModel = mongoose.model("players",schemaPlayers)
  //upload product in db
  app.post("/uploadPlayer",async(req,res)=>{ 
    console.log(req.body)
    const data = await PlayerModel(req.body)
    const datasave = await data.save()
     res.send({message : "Player Data has been Uploaded"})
 }) 
 
 //displaying the product on frontend
 app.get("/soccer",async(req,res)=>{
     const data = await PlayerModel.find({})
     res.send(JSON.stringify(data))
 })
 
app.listen(PORT,()=> console.log("Server is running at :" + PORT))