
const app = require("./src/app")
const ConnectDB = require("./src/db/db")




ConnectDB().then(() => {
    app.listen(process.env['PORT'] || 3000, () => {
        console.log(`Server is running on port ${process.env['PORT']}`)
    })
})
    .catch((err) => {
        console.log(err)
    })