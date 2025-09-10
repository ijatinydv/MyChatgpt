const jwt = require('jsonwebtoken')
const userModel = require('../models/user.model')
const bcrypt = require('bcryptjs')

async function registerUser(req,res){
    const {fullName:{firstName,lastName},email,password} = req.body

    const isUserAlreadyExists = await userModel.findOne({email})

    if(isUserAlreadyExists){
        res.status(400).json({message:"User already registered"})
    }

    const hashPassword = await bcrypt.hash(password,10)
    
    const user = await userModel.create({
        email,
        password:hashPassword,
        fullName:{firstName,lastName}
    })

    const token = jwt.sign({id:user._id},process.env.JWT_SECRET)

    res.cookie('token',token)

    res.status(201).json({
        message:"user registered successfully",
        user:{
            email: user.email,
            _id: user._id,
            fullName:user.fullName
        }
    })

}

async function loginUser(req,res) {
    const {email,password} = req.body
    const user = await userModel.findOne({email})

    if(!user){
        return res.status(400).json({
            message:"Invalid email or password"
        })
    }

    const isPassordValid = await bcrypt.compare(password,user.password)

    if(!isPassordValid){
        return res.status(401).json({
            message:"Invalid email or password"
        })
    }

    const token = jwt.sign({id:user._id},process.env.JWT_SECRET)

    res.cookie('token',token)

    res.status(200).json({
        message:"user logged in sucessfully",
        user:{
            email:user.email,
            id:user._id,
            fullname:user.fullName
        }
    })
}

module.exports = {registerUser,loginUser}