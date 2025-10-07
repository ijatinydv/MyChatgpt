const chatModel = require('../models/chat.model')
const messageModel = require('../models/message.model')

async function createChat(req,res) {
    const {title} = req.body;

    const user = req.user;

    const chat = await chatModel.create({
        user:user._id,
        title
    })

    res.status(201).json({
        message:"chat created successfully",
        chat:{
            _id:chat._id,
            title:chat.title,
            lastActivity:chat.lastActivity,
            user:chat.user
        }
    })
}

async function getAllChats(req, res) {
    const user = req.user;
    
    const chats = await chatModel.find({
        user: user._id
    }).sort({ lastActivity: -1 });
    
    res.status(200).json({
        chats: chats.map(chat => ({
            _id: chat._id,
            title: chat.title,
            lastActivity: chat.lastActivity,
            user: chat.user
        }))
    });
}

async function getMessages(req, res) {
    const { chatId } = req.params;
    const user = req.user;
    
    // Verify the chat belongs to the user
    const chat = await chatModel.findOne({
        _id: chatId,
        user: user._id
    });
    
    if (!chat) {
        return res.status(404).json({
            message: "Chat not found"
        });
    }
    
    const messages = await messageModel.find({
        chat: chatId
    }).sort({ createdAt: 1 });
    
    res.status(200).json({
        messages: messages.map(msg => ({
            _id: msg._id,
            content: msg.content,
            role: msg.role,
            createdAt: msg.createdAt
        }))
    });
}

async function updateChat(req, res) {
    const { chatId } = req.params;
    const { title } = req.body;
    const user = req.user;
    
    try {
        const chat = await chatModel.findOneAndUpdate(
            { _id: chatId, user: user._id },
            { title, lastActivity: Date.now() },
            { new: true }
        );
        
        if (!chat) {
            return res.status(404).json({
                message: "Chat not found"
            });
        }
        
        res.status(200).json({
            message: "Chat updated successfully",
            chat: {
                _id: chat._id,
                title: chat.title,
                lastActivity: chat.lastActivity
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating chat",
            error: error.message
        });
    }
}

async function deleteChat(req, res) {
    const { chatId } = req.params;
    const user = req.user;
    
    try {
        const chat = await chatModel.findOneAndDelete({
            _id: chatId,
            user: user._id
        });
        
        if (!chat) {
            return res.status(404).json({
                message: "Chat not found"
            });
        }
        
        // Also delete all messages in this chat
        await messageModel.deleteMany({ chat: chatId });
        
        res.status(200).json({
            message: "Chat deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting chat",
            error: error.message
        });
    }
}

module.exports = {
    createChat,
    getAllChats,
    getMessages,
    updateChat,
    deleteChat
}