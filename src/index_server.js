const express = require("express")
const env = require("dotenv")
const mongoose = require("mongoose")
const cors = require("cors")
const app = express();
const path = require("path")
env.config();

const PORT = process.env.PORT || 8080;

//routing
const userRoutes=require("./Routes/UserRoutes")
const CategoryRoutes=require("./Routes/CategoryRoutes") 
const ProductRoutes=require("./Routes/ProductRoutes");
const CartRoutes=require("./Routes/CartRoutes");
 
//database connection
mongoose.connect(process.env.ATLAS_URI,{
    useCreateIndex:"true",
    useNewUrlParser:"true",
    useUnifiedTopology:"true"
}) 
mongoose.connection.on("connected",(error,res)=>{
    if(error) console.log("Error in connection");
    else console.log("mongoose connection completed");
})
 
app.use(cors()) 
app.use(express.json())//middleware between server and client
app.use('/public',express.static(path.join(__dirname,"uploads")))//to expose the folder in the browser
app.use('/api',userRoutes)
app.use('/api',CategoryRoutes)
app.use('/api',ProductRoutes)
app.use('/api',CartRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})