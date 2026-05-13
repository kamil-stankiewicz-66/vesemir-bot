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
    console.log('vesemirbot is online');
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

    if (interaction.commandName == 'vesemir')
    {
        const logs = [];


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


        //send log to chat
        if (logs.length > 0)
        {
            await interaction.reply(logs.join('\n'));
        }
    }
});

client.on("messageCreate", async (message) => 
{
    //skip bots message

    if (message.author.bot)
    {
        return;
    }


    //just ping

    if (message.content == 'ping vesemir')
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




//end of file
client.login(process.env.TOKEN);