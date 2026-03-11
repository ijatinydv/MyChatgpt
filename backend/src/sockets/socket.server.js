const { Server } = require("socket.io");
const cookie = require('cookie')
const jwt = require('jsonwebtoken')
const userModel = require('../models/user.model')
const aiService = require('../services/ai.service')
const messageModel = require('../models/message.model')
const {createMemory, queryMemory} = require("../services/vector.service");

const SOCKET_RATE_LIMIT_WINDOW_MS = Number(process.env.SOCKET_RATE_LIMIT_WINDOW_MS || 60_000);
const SOCKET_RATE_LIMIT_MAX_REQUESTS = Number(process.env.SOCKET_RATE_LIMIT_MAX_REQUESTS || 5);

function checkSocketRateLimit(socket) {
    const now = Date.now();
    const timestamps = socket.requestTimestamps || [];
    const windowStart = now - SOCKET_RATE_LIMIT_WINDOW_MS;
    const validTimestamps = timestamps.filter((timestamp) => timestamp > windowStart);

    if (validTimestamps.length >= SOCKET_RATE_LIMIT_MAX_REQUESTS) {
        const retryAfterMs = validTimestamps[0] + SOCKET_RATE_LIMIT_WINDOW_MS - now;
        return {
            allowed: false,
            retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
            timestamps: validTimestamps
        };
    }

    validTimestamps.push(now);
    return { allowed: true, timestamps: validTimestamps };
}

function initSocketServer(httpServer){

    const io = new Server(httpServer,{
        cors: {
            origin: 'http://localhost:5173',
            methods: ["GET", "POST"],
            credentials: true,
            allowedHeaders: ["Content-Type"]
        }
    })

    console.log("Socket.IO server initialized with CORS for http://localhost:5173");

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
        socket.requestTimestamps = [];
 

        socket.on("ai-message",async(messagePayLoad)=>{
              //Message Payload = {chat:chatId, content: message text} 
            const socketRateLimit = checkSocketRateLimit(socket);
            socket.requestTimestamps = socketRateLimit.timestamps;

            if (!socketRateLimit.allowed) {
                socket.emit("ai-error", {
                    code: "SOCKET_RATE_LIMIT_EXCEEDED",
                    message: "Too many requests from this socket. Please retry shortly.",
                    retryAfterSeconds: socketRateLimit.retryAfterSeconds
                });
                return;
            }

            try {

            /* const message = await messageModel.create({
                chat:messagePayLoad.chat,
                user:socket.user._id,
                content:messagePayLoad.content,
                role:"user"
            })

            const vectors = await aiService.generateVector(messagePayLoad.content)
            // console.log("vectors generated : ",vectors)
            */

            // promise.all start both task at same time and wait till both complete to reduce execution time
            const [message, vectors] = await Promise.all([
                messageModel.create({
                    chat:messagePayLoad.chat,
                    user:socket.user._id,
                    content:messagePayLoad.content,
                    role:"user"
                }),
                aiService.generateVector(messagePayLoad.content),
            ])

            
            await createMemory({
                vectors,
                messageId:message._id,
                metadata:{
                    chat:messagePayLoad.chat,
                    user:socket.user._id,
                    text:messagePayLoad.content
                    }
                    })

            const [memory,chatHistory] = await Promise.all([
                queryMemory({
                    queryVector:vectors,
                    limit:3,
                    metadata:{
                        user:socket.user._id
                    }
                }),
                messageModel.find({
                    chat:messagePayLoad.chat
                }).sort({createdAt:-1}).limit(20).lean().then(messages => messages.reverse())
            ])

                    /*
                   const memory = await queryMemory({
                       queryVector:vectors,
                       limit:3,
                       metadata:{
                           user:socket.user._id
                       }
                   })
                   // console.log(memory)
                   

            const chatHistory = (await messageModel.find({
                chat:messagePayLoad.chat
            }).sort({createdAt : -1}).limit(20).lean()).reverse()    // by this our short term memory can remember only last 20 messages */

            const stm = chatHistory.map(item=>{
                return {
                    role:item.role,
                    parts: [{text:item.content}]
                }
            })

            const ltm = [{
                role:"user",
                parts:[{
                    text: 
                    `
                    these are some previous messeges from the chat, use them to generate a response
                    ${memory.map(item => item.metadata.text).join("\n")}
                    `
                }]
            }]

            // console.log(ltm,stm)

            const response = await aiService.generateResponse([...ltm, ...stm])

            socket.emit("ai-response",{
                content:response,
                chat:messagePayLoad.chat
            })

            const [responseMessage,responseVector] = await Promise.all([
                messageModel.create({
                    chat:messagePayLoad.chat,
                    user:socket.user._id,
                    content:response,
                    role:"model"
                }),
                aiService.generateVector(response)  
            ])

           /*const responseMessage =  await messageModel.create({
                chat:messagePayLoad.chat,
                user:socket.user._id,
                content:response,
                role:"model"
            })

            const responseVector = await aiService.generateVector(response)*/

            await createMemory({
                vectors: responseVector,
                messageId:responseMessage._id,
                metadata:{
                    chat:messagePayLoad.chat,
                    user:socket.user._id,
                    text:response
                }
            })
            } catch (error) {
                if (error?.isRateLimitError || error?.statusCode === 429 || error?.status === 429) {
                    socket.emit("ai-error", {
                        code: "AI_RATE_LIMIT_EXCEEDED",
                        message: error.message || "AI quota exceeded. Please retry after a short delay.",
                        retryAfterSeconds: error.retryAfterSeconds || 10
                    });
                    return;
                }

                console.error("Socket ai-message error:", error);
                socket.emit("ai-error", {
                    code: "AI_MESSAGE_FAILED",
                    message: "Unable to process your message right now. Please try again."
                });
            }

        })

        // socket.on("disconnect")
    }) 

}

module.exports = initSocketServer
