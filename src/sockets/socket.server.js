const { Server } = require("socket.io");
const cookie = require('cookie')
const jwt = require('jsonwebtoken')
const userModel = require('../models/user.model')

function initSocketServer(httpServer){

    const io = new Server(httpServer,{})

    // socketio middlewares

    io.use(async(socket,next)=>{

        const cookies = cookie.parse(socket.handshake.headers?.cookie || "")

        if(!cookies.token){
            next(new Error("Authentication error no token provided."))
        }
        console.log("socket connection cookies :",cookies)

        try{
            
            const decoded = jwt.verify(cookies.token,process.env.JWT_SECRET)

            const user = await userModel.findById(decoded.id)

            socket.user = user;
            next()
            
        }catch(err){
            next(new Error("Authentication Error: Invalid token"))
        }

    })

    io.on("connection",(socket)=>{
        // console.log("user connected : ",socket.user)
        // console.log("New socket connection :",socket.id)

        socket.on("ai-message",async(messagePayLoad)=>{
            console.log(messagePayLoad)
        })

        // socket.on("disconnect")
    })

}

module.exports = initSocketServer