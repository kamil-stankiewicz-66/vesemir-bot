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
                    name: 'show_dynamic_vars',
                    value: 'show_dynamic_vars'
                }
            )
            .addChoices(
                {
                    name: 'show_nice_day_vars',
                    value: 'show_nice_day_vars',
                }
            )
            .addChoices(
                {
                    name: 'reset_nice_day_vars',
                    value: 'reset_nice_day_vars',
                }
            )
            .addChoices(
                {
                    name: 'show_good_night_vars',
                    value: 'show_good_night_vars',
                }
            )
            .addChoices(
                {
                    name: 'reset_good_night_vars',
                    value: 'reset_good_night_vars',
                }
            )
            .addChoices(
                {
                    name: 'say_line_neutral',
                    value: 'say_line_neutral'
                }
            )
            .addChoices(
                {
                    name: 'say_line_aggressive',
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

        .addBooleanOption(option => option
            .setName('nice_day_module')
            .setDescription('Włącza lub wyłącza pisanie <Miłego dnia>')
            .setRequired(false)
        )

        .addBooleanOption(option => option
            .setName('good_night_module')
            .setDescription('Włącza lub wyłącza pisanie <Dobranoc>')
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