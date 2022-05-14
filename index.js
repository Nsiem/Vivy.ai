const { Client, Intents, BaseGuild, BaseGuildVoiceChannel } = require('discord.js');
const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES );
const client = new Client({ intents: myIntents });
var wavConverter = require('wav-converter');
const dotenv = require('dotenv')
dotenv.config()

const axios = require('axios')
const fs = require('fs')

client.once('ready', () => {
	console.log('Ready!');
});

const upload = axios.create({
    baseURL: "https://api.assemblyai.com/v2",
    headers: {
        authorization: `${process.env.ASSEMBLYAPIKEY}`,
        "content-type": "application/json",
        "transfer-encoding": "chunked",
    },
});

const assembly = axios.create({ baseURL: "https://api.assemblyai.com/v2",
    headers: {
        authorization: `${process.env.ASSEMBLYAPIKEY}`,
        "content-type": "application/json",
    },
});

client.on('message', async message => {
    if (message.content == "!start") {
        listen(message)
        return
    }
})

function uploadfunc(data, msg) {
    upload
    .post("/upload", data)
    .then((res) =>  {
        assemblyAIfunc(res.data["upload_url"], msg)
    })
    .catch((err) => console.error(err))
}

function assemblyAIfunc(uploadID, msg) {
    assembly
    .post("/transcript", {
        audio_url: `${uploadID}`
    })
    .then((res) => {
        setTimeout(() => {
            gettranscript(res.data["id"], msg)
        }, 15000)
    }) 
    .catch((err) => console.error(err));
}

function gettranscript(transcriptID, msg) {
    assembly
    .get(`/transcript/${transcriptID}`)
    .then((res) => {
        console.log(res.data)
        msg.channel.send(`${res.data["text"]}`)
    })
    .catch((err) => console.error(err));
}


async function listen (message) {
    var connection =  await message.member.voice.channel.join();
    if(message.guild.voice.channel){


        var user = message.member;
        
        message.channel.send("I'm listening...");
        setTimeout(() => {

        }, 700)

        const audio = connection.receiver.createStream(user, { mode: 'pcm', end: 'silence' });
        const writer = audio.pipe(fs.createWriteStream('./audioclip/user_audio_clip.pcm'));
    
        writer.on("finish", () => {
            console.log("done")
            var pcmData = fs.readFileSync('./audioclip/user_audio_clip.pcm');
            var wavData = wavConverter.encodeWav(pcmData, {
                numChannels: 1,
                sampleRate: 100000,
                byteRate: 800
            });
            fs.writeFileSync('./audioclip/user_audio_clip.wav', wavData)
            fs.readFile('./audioclip/user_audio_clip.wav', (err, data) => {
                if (err) return console.error(err);
                uploadfunc(data, message)
            })
        })
    }
    else{
        message.channel.send("You must be in a voice channel!");
    }
}

client.login(process.env.TOKEN)