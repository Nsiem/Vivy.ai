const { Client, Intents, BaseGuild, BaseGuildVoiceChannel } = require('discord.js');
const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES );
const client = new Client({ intents: myIntents });
const dotenv = require('dotenv')
dotenv.config()

const {AudioPlayerStatus, joinVoiceChannel, createAudioPlayer, createAudioResource} = require('@discordjs/voice')
const fs = require('fs')

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

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping') {
		await interaction.reply('Pong!');
	} else if (commandName === 'server') {
		await interaction.reply('Server info.');
	} else if (commandName === 'user') {
		await interaction.reply('User info.');
	} else if (commandName === 'play') {
        const voiceChannelID = 974871209718214666
        const voiceChannel = BaseGuildVoiceChannel
        const guildID = process.env.GUILDID
        
        const player = createAudioPlayer()

        player.on(AudioPlayerStatus.Playing, () => {
            console.log("Audio player is playing!")
        })

        const resource = createAudioResource('test.mp3')
        player.play(resource)

        const connection = joinVoiceChannel({
            channelId: interaction.member.voice.channelId,
            guildId: guildID,
            adapterCreator: interaction.guild.voiceAdapterCreator
        });

        const subscription = connection.subscribe(player)

        if(subscription) {
            setTimeout(() => subscription.unsubscribe(), 15000)
        }
        

        

    }
});

client.login(process.env.TOKEN)