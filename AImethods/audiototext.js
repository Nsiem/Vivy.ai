const axios = require('axios')

const dotenv = require('dotenv')
dotenv.config({path: '../.env'})
//process.env.ASSEMBLYAPIKEY



const assembly = axios.create({ baseURL: "https://api.assemblyai.com/v2",
    headers: {
        authorization: `${process.env.ASSEMBLYAPIKEY}`,
        "content-type": "application/json",
    },
});

const audioURL = 'https://cdn.assemblyai.com/upload/2977798d-f84c-4418-8d98-0edb2c15778c'

assembly
    .post("/transcript", {
        audio_url: `${audioURL}`
    })
    .then((res) => console.log(res.data))
    .catch((err) => console.error(err))