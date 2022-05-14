const { Client, Intents, BaseGuild, BaseGuildVoiceChannel } = require('discord.js');
const {AudioPlayerStatus, joinVoiceChannel, createAudioPlayer, createAudioResource} = require('@discordjs/voice')
const { Configuration, OpenAIApi } = require("openai");
const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES );
const client = new Client({ intents: myIntents });
var wavConverter = require('wav-converter');
const dotenv = require('dotenv')
dotenv.config()

const tts = require('./tts.js')
const axios = require('axios')
const fs = require('fs')
var flag = true
var chatlog = "The following is a conversation with an AI named Vivy. The AI is interesting, creative, clever, intelligent, and very friendly.\n\nHuman: Hello, who are you?\nAI: Hi I'm an AI named Vivy!\n"

const configuration = new Configuration({apiKey: process.env.OPENAI_API_KEY})
const openai = new OpenAIApi(configuration)

client.once('ready', () => {
	console.log('Ready!');
});

//structure to upload audio to assemblyAI
const upload = axios.create({
    baseURL: "https://api.assemblyai.com/v2",
    headers: {
        authorization: `${process.env.ASSEMBLYAPIKEY}`,
        "content-type": "application/json",
        "transfer-encoding": "chunked",
    },
});

//Structure to get transcription from assemblyAI
const assembly = axios.create({ baseURL: "https://api.assemblyai.com/v2",
    headers: {
        authorization: `${process.env.ASSEMBLYAPIKEY}`,
        "content-type": "application/json",
    },
});


//uploads audio file to assemblyAI
function uploadfunc(data, msg) {
    upload
    .post("/upload", data)
    .then((res) =>  {
        assemblyAIfunc(res.data["upload_url"], msg)
    })
    .catch((err) => console.error(err))
}

//starts proccess of audio to text with assemblyAI
function assemblyAIfunc(uploadID, msg) {
    assembly
    .post("/transcript", {
        audio_url: `${uploadID}`
    })
    .then((res) => {
        GETloop(res.data["id"], msg)
    }) 
    .catch((err) => console.error(err));
}

//get transcript function
function gettranscript(transcriptID, msg) {
    assembly
    .get(`/transcript/${transcriptID}`)
    .then((res) => {
        if(res.data["text"] != null) {
            if(flag != false) {
                console.log(`${res.data["text"]}`)
                msg.channel.send(`Human: ${res.data["text"]}`)
                updateChatlog("human", res.data["text"])
                Vivy(msg)
            }
            flag = false
        }
        

    })
    .catch((err) => console.error(err));
}

//loop to continue getting transcript until found
function GETloop(transcriptID, msg) {
    gettranscript(transcriptID, msg)
    console.log(flag)
    if (flag == false) {
        setTimeout(() => {
            flag = true
        }, 500)
        return
    } else {
        setTimeout(() => {
        GETloop(transcriptID, msg)
    }, 2000)
    }
}

function updateChatlog(src, text) {
    if (src == "human") {
        chatlog += 'Human: ' + text + '\n'
    } else if (src == "ai") {
        chatlog += 'AI: ' + text + '\n'
    }
    console.log(text)
}

function Vivy(msg) {
    openai.createCompletion("text-curie-001", {
        prompt: chatlog,
        temperature: 0.9,
        max_tokens: 150,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0.6,
        stop: [" Human:", " AI:"],
      }).then((response) => {
            tts.quickStart(response.data["choices"][0]["text"].substring(3))
            updateChatlog("ai", response.data["choices"][0]["text"])
            msg.channel.send(response.data["choices"][0]["text"])
            setTimeout(() => {
                VivySpeak(msg)
            }, 1500)
            
      })
}

async function VivySpeak(msg) {
    const voiceChannel = msg.member.voice.channel

    const connection = await voiceChannel.join();
	connection.play('output.mp3');
}




//base discord messaging prompt, starts entire code
client.on('message', async message => {
    if (message.content == "!start") {
        listen(message)
        return
    } else if (message.content == "!test") {
        VivySpeak(message)
        return
    }
})


//Main listen function, starts listening to discord voice
async function listen (message) {
    var connection =  await message.member.voice.channel.join();
    if(message.guild.voice.channel){


        var user = message.member;
        
        message.channel.send("I'm listening...");

        const audioConnection = connection.receiver.createStream(user, { mode: 'pcm', end: 'silence' });
        const audioWriter = audioConnection.pipe(fs.createWriteStream('./audioclip/user_audio_clip.pcm'));
    
        audioWriter.on("finish", () => {
            console.log("done")
            var pcmAudio = fs.readFileSync('./audioclip/user_audio_clip.pcm');
            var wavAudio = wavConverter.encodeWav(pcmAudio, {
                numChannels: 1,
                sampleRate: 100000,
                byteRate: 800
            });
            fs.writeFileSync('./audioclip/user_audio_clip.wav', wavAudio)
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