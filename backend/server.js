
const app = require("./src/app")
const ConnectDB = require("./src/db/db")









ConnectDB()


app.listen(process.env['PORT'], () => {
    console.log(`Server is running on port ${process.env['PORT']}`)
})