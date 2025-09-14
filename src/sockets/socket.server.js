const { Server } = require("socket.io");
const cookie = require('cookie')
const jwt = require('jsonwebtoken')
const userModel = require('../models/user.model')
const aiService = require('../services/ai.service')
const messageModel = require('../models/message.model')
const {createMemory, queryMemory} = require("../services/vector.service");
const { text } = require("express");

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
            // console.log(messagePayLoad)

            /* Message Payload = {chat:chadId, content: message text} */

            const message = await messageModel.create({
                chat:messagePayLoad.chat,
                user:socket.user._id,
                content:messagePayLoad.content,
                role:"user"
            })

            const vectors = await aiService.generateVector(messagePayLoad.content)
            // console.log("vectors generated : ",vectors)

            await createMemory({
                vectors,
                messageId:message._id,
                metadata:{
                    chat:messagePayLoad.chat,
                    user:socket.user._id,
                    text:messagePayLoad.content
                }
            })

            const memory = await queryMemory({
                queryVector:vectors,
                limit:3,
                metadata:{}
            })
            // console.log(memory)

            const chatHistory = (await messageModel.find({
                chat:messagePayLoad.chat
            }).sort({createdAt : -1}).limit(20).lean()).reverse()    // by this our short term memory can remember only last 20 messages

            const stm = chatHistory.map(item=>{
                return {
                    role:item.role,
                    parts: [{text:item.content}]
                }
            })

            const ltm = [{
                role:"system",
                parts:[{
                    text: 
                    `
                    these are some previous messeges from the chat, use them to generate a response
                    ${memory.map(items=>{items.metadata.text}).join("\n")}
                    `
                }]
            }]

            console.log(ltm,stm)

            const response = await aiService.generateResponse([...ltm, ...stm])

           const responseMessage =  await messageModel.create({
                chat:messagePayLoad.chat,
                user:socket.user._id,
                content:response,
                role:"model"
            })

            const responseVector = await aiService.generateVector(response)

            await createMemory({
                vectors: responseVector,
                messageId:responseMessage._id,
                metadata:{
                    chat:messagePayLoad.chat,
                    user:socket.user._id,
                    text:response
                }
            })

            socket.emit("ai-response",{
                content:response,
                chat:messagePayLoad.chat
            })
        })

        // socket.on("disconnect")
    })

}

module.exports = initSocketServer