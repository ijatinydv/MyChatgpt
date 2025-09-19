const mongoose = require('mongoose')

const connectToDB = async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("connected to mongodb")
    }catch(err){
        console.log("Error connecting to MONGODB :",err)
    }
}

module.exports = connectToDB