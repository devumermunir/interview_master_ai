require("dotenv").config()
const express = require("express")
const path = require("path")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")




const app = express()
const publicDir = path.join(__dirname, "../public")
const defaultOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://interview-master-ai.onrender.com"
]

const allowedOrigins = [
    ...defaultOrigins,
    ...(process.env.CLIENT_ORIGIN
        ? process.env.CLIENT_ORIGIN.split(",").map(o => o.trim().replace(/\/$/, ""))
        : [])
]

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
};
app.use(cors(corsOptions))
app.use(express.static(publicDir))
app.use(express.json())
app.use(cookieParser())
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

app.get("*name", (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"))
})






module.exports = app