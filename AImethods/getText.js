const axios = require("axios");

const dotenv = require('dotenv')
dotenv.config({path: '../.env'})
//process.env.ASSEMBLYAPIKEY
  
const assembly = axios.create({
    baseURL: "https://api.assemblyai.com/v2",
    headers: {
        authorization: `${process.env.ASSEMBLYAPIKEY}`,
        "content-type": "application/json",
    },
});
const transcriptID = 'o0kilbhsq3-8032-423a-b292-f30e44a351ab'

assembly
    .get(`/transcript/${transcriptID}`)
    .then((res) => console.log(res.data))
    .catch((err) => console.error(err));