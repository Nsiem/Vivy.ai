const { Client, Intents } = require('discord.js');
const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES );
const client = new Client({ intents: myIntents });
const dotenv = require('dotenv')
dotenv.config()

client.once('ready', () => {
	console.log('Ready!');
});

client.on("messageCreate", (message) => {
    if (message.content == "!ping"){
        message.channel.send("PONG")
    } else {
        return
    }
});

client.login(process.env.TOKEN)