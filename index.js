const { Client, Intents, BaseGuild, BaseGuildVoiceChannel } = require('discord.js');
const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES );
const client = new Client({ intents: myIntents });
const dotenv = require('dotenv')
dotenv.config()

const fs = require('fs')
const { DartVoiceManager } = require('dartjs')
const voiceManager = new DartVoiceManager(client)

client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'play') {
        voiceManager.join(interaction.member.voice.channelId).then(connection => {
            const receiver = connection.receiver.createStream(interaction.member, {
                mode: "opus",
                end: "silence"
            })
             const audiowriter = receiver.pipe(fs.createWriteStream('user_audio'))

            audiowriter.on("finish", () => {
                console.log("Done!")
            })
        })
    }
});

client.login(process.env.TOKEN)