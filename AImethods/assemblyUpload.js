const axios = require('axios')
const fs = require("fs")

const dotenv = require('dotenv')
dotenv.config({path: '../.env'})
//process.env.ASSEMBLYAPIKEY

const assembly = axios.create({
    baseURL: "https://api.assemblyai.com/v2",
    headers: {
        authorization: `${process.env.ASSEMBLYAPIKEY}`,
        "content-type": "application/json",
        "transfer-encoding": "chunked",
    },
});
const file = "../audioclip/user_audio_clip.pcm";
fs.readFile(file, (err, data) => {
    if (err) return console.error(err);

    assembly
        .post("/upload", data)
        .then((res) => console.log(res.data))
        .catch((err) => console.error(err))
})

