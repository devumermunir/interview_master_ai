const userModel = require("../models/user.model")

const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const { uploadImg } = require("../services/storage.service")



const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
}

async function userRegister(req, res) {
    try {
        const { name, username, email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            })
        }

        const userName = name || username || ""
        const file = req.file
        let url = ""
        if (file) {
            url = await uploadImg(file)
        }

        const normalizedEmail = email.trim().toLowerCase()
        const isUserExist = await userModel.findOne({ email: normalizedEmail })
        if (isUserExist) {
            return res.status(409).json({
                success: false,
                message: "User already exist",
            })
        }

        const hash = await bcrypt.hash(password, 10)

        const result = await userModel.create({
            name: userName,
            email: normalizedEmail,
            password: hash,
            image: url
        })

        const token = jwt.sign({ id: result._id }, process.env['JWT_SECRET'], { expiresIn: "7d" })
        res.cookie("token", token, COOKIE_OPTIONS)
        res.status(201).json({
            success: true,
            message: "user created successfully",
            user: {
                id: result._id,
                _id: result._id,
                name: result.name,
                email: result.email,
                image: result.image
            }
        })
    } catch (error) {
        console.error("userRegister error:", error)
        res.status(500).json({
            success: false,
            message: "Internal server error during registration",
            error: error.message
        })
    }
}

async function userLogin(req, res) {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            })
        }

        const normalizedEmail = email.trim().toLowerCase()
        const isUserExist = await userModel.findOne({ email: normalizedEmail })
        if (!isUserExist) {
            return res.status(404).json({
                success: false,
                message: "User Not Found",
            })
        }

        const user = isUserExist
        const isPasswordMatch = await bcrypt.compare(password, user.password)

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Incorrect Password"
            })
        }
        const token = jwt.sign({ id: user._id }, process.env['JWT_SECRET'], { expiresIn: "7d" })
        res.cookie("token", token, COOKIE_OPTIONS)
        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user: {
                id: user._id,
                _id: user._id,
                name: user.name,
                email: user.email,
                image: user.image,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }
        })
    } catch (error) {
        console.error("userLogin error:", error)
        res.status(500).json({
            success: false,
            message: "Internal server error during login",
            error: error.message
        })
    }
}

/**
 * @route GET /api/auth/get-me
 * @description Get current logged in user
 * @access Private
 */
async function getMe(req, res) {
    const token = req.cookies.token
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }
    try {
        const decodedToken = jwt.verify(token, process.env['JWT_SECRET'])
        const { id } = decodedToken

        const user = await userModel.findById(id).select("-password")
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        res.status(200).json({
            success: true,
            message: "User profile fetched successfully",
            user: user,
            data: user
        })
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "invalid token",
            error: error.message
        })
    }
}


async function userLogout(req, res) {
    res.clearCookie("token", COOKIE_OPTIONS)
    res.status(200).json({
        success: true,
        message: "User logged out successfully",
    })
}


module.exports = { userRegister, userLogin, userLogout, getMe }