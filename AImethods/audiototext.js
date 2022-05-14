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

const audioURL = 'https://cdn.assemblyai.com/upload/eec4e566-07de-4211-a181-13406d499b9d'

assembly
    .post("/transcript", {
        audio_url: `${audioURL}`
    })
    .then((res) => console.log(res.data))
    .catch((err) => console.error(err))