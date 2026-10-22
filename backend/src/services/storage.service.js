const imagekit = require("@imagekit/nodejs")


const client = new imagekit({
    // publicKey: process.env["IMAGE_KIT_KEY"],
    privateKey: process.env["IMAGE_KIT_PRIVATE_KEY"],
    urlEndpoint: process.env["IMAGE_KIT_URL_ENDPOINT"],
})



async function uploadImg(file) {
    const result = await client.upload.single({
        file: file.buffer.toString("base64"),
        fileName: file.originalname,
        folder: "profile_images"
    })
    return result?.url || result?.filePath || ""
}



module.exports = { uploadImg }