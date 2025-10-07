const express = require('express')

const router = express.Router()
const authMiddleware = require('../middlewares/auth.middleware')
const chatController = require('../controllers/chat.controller')

router.post('/',authMiddleware.authUser,chatController.createChat)
router.get('/',authMiddleware.authUser,chatController.getAllChats)
router.get('/messages/:chatId',authMiddleware.authUser,chatController.getMessages)
router.patch('/:chatId',authMiddleware.authUser,chatController.updateChat)
router.delete('/:chatId',authMiddleware.authUser,chatController.deleteChat)

module.exports= router