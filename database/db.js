const mongoose = require('mongoose')    
mongoose.connect('mongodb://127.0.0.1:27017/donerRequestt').then(()=>{
    console.log('DB connection established');
}).catch(err=> console.log('DB connection err',err))