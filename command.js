const {REST, Routes, SlashCommandBuilder} = require('discord.js');
require('dotenv').config();

const commands = [
    new SlashCommandBuilder()
        .setName('vesemir')
        .setDescription('Sterowanie Vesemirem')

        .addStringOption(option => option
            .setName('action')
            .setDescription('Co chcesz zrobić?')
            .setRequired(false)
            .addChoices(
                {
                    name: 'Pokaż stan parametrów.',
                    value: 'show_vars'
                }
            )
            .addChoices(
                {
                    name: 'Powiedz neutralną kwestię.',
                    value: 'say_line_neutral'
                }
            )
            .addChoices(
                {
                    name: 'Powiedz negatywną kwestię.',
                    value: 'say_line_aggressive'
                }
            )
        )

        .addBooleanOption(option => option
            .setName('message_segregate')
            .setDescription('Włącza lub wyłącza segregowanie wiadomości na różne kanały.')
            .setRequired(false)
        )

        .addBooleanOption(option => option
            .setName('reply_when_wrong_channel')
            .setDescription('Włącza lub wyłącza odpowiadanie na wiadomość, która została wysłana na zły kanał.')
            .setRequired(false)
        )

        .addBooleanOption(option => option
            .setName('delete_when_wrong_channel')
            .setDescription('Włącza lub wyłącza usuwanie wiadomości, która została wysłana na zły kanał.')
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

    console.log('log: commands deployed');
}

deployCommands();