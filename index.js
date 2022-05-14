const { Client, Intents, BaseGuild, BaseGuildVoiceChannel } = require('discord.js');
const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES );
const client = new Client({ intents: myIntents });
const dotenv = require('dotenv')
dotenv.config()

const fs = require('fs')

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', async message => {
    if (message.content == "!start") {
        listen(message)
        return
    }
})


async function listen (message) {
    var connection =  await message.member.voice.channel.join();
    if(message.guild.voice.channel){
        var user = message.member;
        
        message.channel.send("I'm listening...");
        const audio = connection.receiver.createStream(user, { mode: 'pcm', end: 'silence' });
        const writer = audio.pipe(fs.createWriteStream('./audioclip/user_audio_clip.pcm'));
    
        writer.on("finish", () => {
            console.log("done")
        });
    }
    else{
        message.channel.send("You must be in a voice channel!");
    }
}

client.login(process.env.TOKEN)