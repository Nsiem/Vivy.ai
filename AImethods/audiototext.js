const axios = require('axios')

const dotenv = require('dotenv')
dotenv.config({path: '../.env'})
//process.env.ASSEMBLYAPIKEY

const getText = require('./getText')



const assembly = axios.create({ baseURL: "https://api.assemblyai.com/v2",
    headers: {
        authorization: `${process.env.ASSEMBLYAPIKEY}`,
        "content-type": "application/json",
    },
});

//const audioURL = 'https://cdn.assemblyai.com/upload/8491bcf9-d5d2-4048-a8fa-1970741ae1a2'

function transcribeAudio(audioURL) {
    assembly
    .post("/transcript", {
        audio_url: `${audioURL}`
    })
    .then((res) => {
        const transcriptID = res.data["id"]
        return transcriptID
    })
    .catch((err) => console.error(err))
}


module.exports = { transcribeAudio }