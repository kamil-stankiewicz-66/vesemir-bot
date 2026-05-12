require('dotenv').config();

const Discord = require('discord.js');

const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent
    ]
});

const funcs = require('./function.js');
const data = require('./data.js');
const chat_manager = require('./chat_manager.js');




//awake

client.once('clientReady', async () => 
{
    client.user.setActivity('Dba o siedliszcze', {type: Discord.ActivityType.Listening});

    //say hello to users
    const channel = await client.channels.fetch(data.channels.general);
    channel.send(funcs.getRandom(data.quotes));

    //log
    console.log('vesemirbot is online');
});




//update

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
        await message.reply(funcs.getRandom(data.quotes));
    }
    

    //move

    const generalChannel = await client.channels.fetch(data.channels.general);
    const linksChannel = await client.channels.fetch(data.channels.links);
    const mediaChannel = await client.channels.fetch(data.channels.media);
    const filesChannel = await client.channels.fetch(data.channels.files);

    let moved = false;

    if (message.channel != linksChannel &&
        await chat_manager.moveLinks(message, linksChannel))
    {
        moved = true;
    }

    if (message.channel != mediaChannel &&
        await chat_manager.moveFilesByType(message, mediaChannel, data.mediaTypes))
    {
        moved = true;
    }

    if (message.channel != filesChannel &&
        await chat_manager.moveFilesExceptType(message, filesChannel, data.mediaTypes))
    {
        moved = true;
    }

    if (moved)
    {
        await message.reply(funcs.getRandom(data.quotesBadChannelReaction));
        await message.delete();

        const cleanedContent = chat_manager.removeLinks(message.content);
        if (cleanedContent.length > 0)
        {
            await generalChannel.send(
            {
                content: `${message.author}: "*${cleanedContent}*"`
            });
        }
    }
});




//end of file
client.login(process.env.TOKEN);