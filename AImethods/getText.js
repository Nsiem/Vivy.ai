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
const transcriptID = 'o0k7twxj1t-5afc-4d27-8f81-6448419cac79'

assembly
    .get(`/transcript/${transcriptID}`)
    .then((res) => console.log(res.data))
    .catch((err) => console.error(err));