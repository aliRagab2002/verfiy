require ('dotenv').config()
const express = require("express")
const cors = require("cors")
const bodyParser = require('body-parser');
const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const userRoutes = require('./routes/user.route')
app.use('/api',userRoutes)


const mongoose = require("mongoose");
const url = process.env.MONGO_URL

mongoose.connect(url).then(() => {
    console.log('mongodb connect success')
})










app.listen(process.env.PORT || 5000,()=>{
    console.log('listening on port: 5000' )
})