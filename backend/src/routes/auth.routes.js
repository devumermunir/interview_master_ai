const express = require("express")
const authController = require("../controllers/auth.controllers")
const multer = require("multer")
const authRouter = express.Router()

const upload = multer({ storage: multer.memoryStorage() })

authRouter.post("/register", upload.single("image"), authController.userRegister
)
authRouter.post("/login", authController.userLogin)
authRouter.get("/get-me", authController.getMe)
authRouter.get("/logout", authController.userLogout)
module.exports = authRouter