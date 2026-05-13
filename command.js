const {REST, Routes, SlashCommandBuilder} = require('discord.js');
require('dotenv').config();

const commands = [
    new SlashCommandBuilder()
        .setName('vesemir')
        .setDescription('Sterowanie Vesemirem')

        .addBooleanOption(option =>
            option
                .setName('message_segregate')
                .setDescription('Włącza lub wyłącza segregowanie wiadomości na różne kanały.')
                .setRequired(false)
        )

        .addBooleanOption(option =>
            option
                .setName('reply_when_wrong_channel')
                .setDescription('Włącza lub wyłącza odpowiadanie na usuwaną wiadomość.')
                .setRequired(false)
        )

        .toJSON()
];

const rest = 
    new REST({ version: '10' })
    .setToken(process.env.TOKEN);

async function deployCommands()
{
    await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        {
            body: commands
        }
    );

    console.log('Commands deployed');
}

deployCommands();