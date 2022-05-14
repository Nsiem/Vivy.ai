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
//const transcriptID = 'o0k3jms050-0940-4166-923b-91a6c7a2b259'

function getText(transcriptID) {
    assembly
    .get(`/transcript/${transcriptID}`)
    .then((res) => {return res.data})
    .catch((err) => console.error(err));
}

module.exports = {getText}