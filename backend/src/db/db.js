const mongoose = require("mongoose")




async function ConnectDB() {
    try {
        await mongoose.connect(process.env["MONGO_BD_URL"])
        console.log("Database connected")
    } catch (error) {
        console.log(error)
    }
}




module.exports = ConnectDB