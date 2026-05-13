require('dotenv').config();

const Discord = require('discord.js');

const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent
    ]
});

//modules
const funcs = require('./function.js');
const data = require('./data.js');
const character = require('./character.js');
const server_manager = require('./server_manager.js');
const dynamic_data = require('./dynamic_data');




//awake

client.once('clientReady', async () => 
{
    updateAcivity()

    //say hello to users
    const channel = await client.channels.fetch(data.channels.general);
    channel.send(funcs.getRandom(character.quotes));

    //log
    console.log('log: vesemir-bot is online');
});

function updateAcivity()
{
    if (dynamic_data.messageSegregate)
    {
        client.user.setActivity('Dba o siedliszcze', {type: Discord.ActivityType.Playing});
    }
    else
    {
        client.user.setActivity('Opoczywa', {type: Discord.ActivityType.Listening});
    }
}




//update

client.on('interactionCreate', async (interaction) =>
{
    if (!interaction.isChatInputCommand())
    {
        return;
    }

    if (interaction.commandName != 'vesemir')
    {
        return;
    }


    //logs array
    const logs = [];


    //cmd action
    const action = interaction.options.getString('action');

    if (action == 'show_vars')
    {
        logs.push(dynamic_data.log());
    }
    else if (action == 'say_line_neutral')
    {
        logs.push(funcs.getRandom(character.quotes));
    }
    else if (action == 'say_line_aggressive')
    {
        logs.push(funcs.getRandom(character.quotesWrongChannelReaction));
    }


    //cmd message_segregate
    const _messageSegregate = interaction.options.getBoolean('message_segregate');

    if (_messageSegregate != null)
    {
        dynamic_data.messageSegregate = _messageSegregate;

        logs.push(`message_segregate = ${dynamic_data.messageSegregate}`);

        updateAcivity();
    }


    //cmd reply_when_wrong_channel
    const _replyWhenWrongChannel = interaction.options.getBoolean('reply_when_wrong_channel');

    if (_replyWhenWrongChannel != null)
    {
        dynamic_data.replyWhenWrongChannel = _replyWhenWrongChannel;

        logs.push(`reply_when_wrong_channel = ${dynamic_data.replyWhenWrongChannel}`);
    }


    //cmd delete_when_wrong_channel
    const _deleteWhenWrongChannel = interaction.options.getBoolean('delete_when_wrong_channel');

    if (_deleteWhenWrongChannel != null)
    {
        dynamic_data.deleteWhenWrongChannel = _deleteWhenWrongChannel;

        logs.push(`delete_when_wrong_channel = ${dynamic_data.deleteWhenWrongChannel}`);
    }



    //send log to chat
    if (logs.length > 0)
    {
        await interaction.reply(logs.join('\n'));
    }
    else
    {
        const _lines = [...character.quotes, ...character.quotesWrongChannelReaction];
        await interaction.reply(funcs.getRandom(_lines));
    }
});

client.on("messageCreate", async (message) => 
{
    //skip bots message
    if (message.author.bot)
    {
        return;
    }


    //answer for replies
    const _isReplied = await isThisReplied(message);
    if (_isReplied ||
        message.mentions.users.has(client.user.id) || //tag
        message.content == 'ping vesemir' //just ping
    )
    {
        await message.reply(funcs.getRandom(character.quotes));
    }
    

    //chat managment
    if (dynamic_data.messageSegregate)
    {
        await messageFilter(message);
    }
});

async function messageFilter(message)
{
    const generalChannel = await client.channels.fetch(data.channels.general);
    const linksChannel = await client.channels.fetch(data.channels.links);
    const mediaChannel = await client.channels.fetch(data.channels.media);
    const filesChannel = await client.channels.fetch(data.channels.files);

    let moved = false;

    if (message.channel != linksChannel &&
        await server_manager.moveLinks(message, linksChannel))
    {
        moved = true;
    }

    if (message.channel != mediaChannel &&
        await server_manager.moveFilesByType(message, mediaChannel, data.mediaTypes))
    {
        moved = true;
    }

    if (message.channel != filesChannel &&
        await server_manager.moveFilesExceptType(message, filesChannel, data.mediaTypes))
    {
        moved = true;
    }

    if (moved)
    {
        if (dynamic_data.replyWhenWrongChannel)
        {
            await message.reply(funcs.getRandom(character.quotesWrongChannelReaction));
        }

        if (dynamic_data.deleteWhenWrongChannel)
        {
            await message.delete();

            const cleanedContent = server_manager.removeLinks(message.content);
            if (cleanedContent.length > 0)
            {
                await generalChannel.send(
                {
                    content: `${message.author}: "*${cleanedContent}*"`
                });
            }
        }
    }
}

async function isThisReplied(message)
{
    if (!message.reference?.messageId)
    {
        return false;
    }

    try
    {
        const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
        
        return repliedMessage.author.id == client.user.id;
    }
    catch (error)
    {
        return false;
    }
}





//web

const express = require('express');

const app = express();

app.get('/', (req, res) =>
{
    res.send('VesemirBot is alive');
});

app.get('/health', (req, res) =>
{
    res.status(200).send('OK');
});

const port = process.env.PORT || 3000;

app.listen(port, () =>
{
    console.log(`Health server running on port ${port}`);
});





//end of file
client.login(process.env.TOKEN);