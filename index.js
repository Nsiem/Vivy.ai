const { Client, Intents, BaseGuild, BaseGuildVoiceChannel } = require('discord.js');
const {AudioPlayerStatus, joinVoiceChannel, createAudioPlayer, createAudioResource} = require('@discordjs/voice')
const { Configuration, OpenAIApi } = require("openai");
const getMP3Duration = require('get-mp3-duration')
const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES );
const client = new Client({ intents: myIntents });
var wavConverter = require('wav-converter');
const dotenv = require('dotenv')
dotenv.config()

const tts = require('./tts.js')
const axios = require('axios')
const fs = require('fs')
var retryCount = 12
var chatlog = "The following is a conversation with an AI named Vivy. The AI is interesting, creative, clever, intelligent, friendly, and MOST IMPORTANTLY loves to sing for people.\n\nHuman: Hello, who are you?\nAI: Hi I'm an AI named Vivy!\n"

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
        gettranscript(res.data["id"], msg)
    }) 
    .catch((err) => console.error(err));
}

//get transcript function
function gettranscript(transcriptID, msg) {
    assembly
    .get(`/transcript/${transcriptID}`)
    .then((res) => {
        if(res.data["text"] != null) {
            if(res.data["text"] == "good bye." || res.data["text"] == "Good bye." || res.data["text"] == "goodbye." || res.data["text"] == "Goodbye.") {
                msg.channel.send('```ini\n[Vivy]: It was nice to talk to you, goodbye!```')
                VivySpeak(msg, true)
                msg.channel.stopTyping()
                return
            }
            msg.channel.send("```" + `arm\n${msg.author.username}: ` + `${res.data["text"]}` + "```")
            updateChatlog("human", res.data["text"])
            Vivy(msg)
            retryCount = 10
        } else {
            if(retryCount <= 0) {
                msg.channel.send("*Vivy didn't catch that*")
                setTimeout(() => {
                    retryCount = 10
                    listen(msg)
                }, 1500)
            } else {
               setTimeout(() => {
                console.log("Retrying GET")
                retryCount -= 1
                gettranscript(transcriptID, msg)
            }, 2000) 
            }
            
        }

        
    })
    .catch((err) => console.error(err));
}

//updates chatlog which is the prompt for vivy
function updateChatlog(src, text) {
    if (src == "human") {
        chatlog += "Human: " + text + '\n'
    } else if (src == "ai") {
        chatlog += text.replace(/\n/g, '') + '\n'
    }
}

//sends prompt to vivy and receives her response
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
            msg.channel.send("```ini\n[Vivy] " + response.data["choices"][0]["text"].substring(3) + "```")
            setTimeout(() => {
                VivySpeak(msg, false)
            }, 1500)
            
      })
}

//gives Vivy a voice!
async function VivySpeak(msg, goodbye) {
    msg.channel.stopTyping()

    const voiceChannel = msg.member.voice.channel

    const connection = await voiceChannel.join();

    if(goodbye) {
        connection.play('goodbye.mp3')
        setTimeout(() => {
            msg.member.voice.channel.leave()
        }, 3000)
        
        return
    }

	connection.play('output.mp3');

    const audioBuffer = fs.readFileSync('./output.mp3')
    const duration = getMP3Duration(audioBuffer) + 1000
     
    console.log(duration)

    setTimeout(() => {
        listen(msg)
    }, duration)

    
}




//base discord messaging prompt, starts entire code
client.on('message', async message => {
    if (message.content == "!start") {
        setTimeout(() => {
            listen(message)
        }, 1000)
        
        return
    }
})


//Main listen function, starts listening to discord voice
async function listen (message) {
    var connection =  await message.member.voice.channel.join()
    if(message.guild.voice.channel){
        const yourturn = await message.channel.send("**(Your turn to speak)**")

        var user = message.member
        
        const audioConnection = connection.receiver.createStream(user, { mode: 'pcm', end: 'silence' })
        const audioWriter = audioConnection.pipe(fs.createWriteStream('./audioclip/user_audio_clip.pcm'))
    
        audioWriter.on("finish", () => {
            console.log("done")
            message.channel.startTyping()
            yourturn.delete({timeout: 700})
            var pcmAudio = fs.readFileSync('./audioclip/user_audio_clip.pcm')
            var wavAudio = wavConverter.encodeWav(pcmAudio, {
                numChannels: 1,
                sampleRate: 100000,
                byteRate: 800
            });
            fs.writeFileSync('./audioclip/user_audio_clip.wav', wavAudio)
            fs.readFile('./audioclip/user_audio_clip.wav', (err, data) => {
                if (err) return console.error(err)
                uploadfunc(data, message)
                
            })
        })
    }
    else{
        message.channel.send("You must be in a voice channel!")
    }
}

client.login(process.env.TOKEN)