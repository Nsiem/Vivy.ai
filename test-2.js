
const Discord = require('discord.js');
const ffmpeg = require('ffmpeg');
const fs = require('fs');
var wavConverter = require('wav-converter');
var path = require('path');
const fetch = require('node-fetch');
const url = 'https://api.assemblyai.com/v2/upload';
const endpoint = "https://api.assemblyai.com/v2/transcript";

const {
	prefix,
    token,
    type
} = require('./config.json');

const client = new Discord.Client({ intents: ['GUILD_VOICE_STATES', 'GUILD_MESSAGES', 'GUILDS'] });
client.login(token);

client.once('ready', () => {
    console.log('Ready!');
   });
   client.once('reconnecting', () => {
    console.log('Reconnecting!');
   });
   client.once('disconnect', () => {
    console.log('Disconnect!');
});

client.on('message', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    if (message.content.startsWith(`${prefix}join`)) {
        var connection = join(message);
        return;
    }
    else if (message.content.startsWith(`${prefix}listen`)){
        listen(message);
        return;
    }
    else if (message.content.startsWith(`${prefix}leave`)){
        leave(message);
        return;
    }
    else{
        message.channel.send("learn how to type loser");
    }
})

async function listen (message){

    var connection =  await message.member.voice.channel.join();
    if(message.guild.voice.channel){
        var user = message.member;
        console.log("starting");
        message.channel.send("starting");
        const audio = connection.receiver.createStream(user, { mode: 'pcm', end: 'silence' });
        const writer = audio.pipe(fs.createWriteStream('./user_audio.pcm'));
    
        writer.on("finish", () => {
            message.channel.send("done!");
            var pcmData = fs.readFileSync(path.resolve(__dirname, './user_audio.pcm'));
            var wavData = wavConverter.encodeWav(pcmData, {
                numChannels: 1,
                sampleRate: 100000,
                byteRate: 800
            });
            fs.writeFileSync(path.resolve(__dirname, './user_audio.wav'), wavData);

            //var uLink = upload("./user_audio.wav");
            //sleep(50000);
            transcribe("https://cdn.assemblyai.com/upload/e5c310bd-d067-4cb8-9ec5-17bae8ba2488");
        });
    }
    else{
        message.channel.send("not in a vc");
    }
}
async function leave (message){

    const args = message.content.split(" ");
    const vc = message.member.voice.channel;
    try{
        vc.leave();
    }
    catch (e){
        console.log(e);
        return message.channel.send(e);
    }
}

async function join (message){

    const args = message.content.split(" ");
    const vc = message.member.voice.channel;
    const allowed = vc.permissionsFor(message.client.user);

    if (!allowed.has("CONNECT") || !allowed.has("SPEAK")) {
        return message.channel.send(
          "no no no"
        );
    }
    else{
        try{
            var connection = await vc.join();

        }
        catch (e){
            console.log(e);
            return message.channel.send(err);
        }
    }
    return connection;
}
async function upload(audioPath){

    fs.readFile(audioPath, (err, data) => {
        if (err) {
          return console.log(err);
        }
      
        const params = {
          headers: {
            "authorization": "0008c9eef0324cac9ca02bf4d7bc6072",
            "Transfer-Encoding": "chunked"
          },
          body: data,
          method: 'POST'
        };
      
        fetch(url, params)
          .then(response => response.json())
          .then(data => {
                return data['upload_url'];
          })
          .catch((error) => {
            console.error(`Error: ${error}`);
          });
      });
}
async function transcribe(tUrl){

    const data = {
        "audio_url": tUrl
      };
      
      const params = {
        headers: {
          "authorization": "0008c9eef0324cac9ca02bf4d7bc6072",
          "content-type": "application/json",
        },
        body: JSON.stringify(data),
        method: "POST"
      };
      
      fetch(url, params)
        .then(response => response.json())
        .then(data => {
          console.log('Success:', data);
          console.log('ID:', data['id']);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}