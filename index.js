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




//awake

client.once('clientReady', async () => 
{
    client.user.setActivity('Dba o siedliszcze', {type: Discord.ActivityType.Playing});

    //say hello to users
    const channel = await client.channels.fetch(data.channels.general);
    channel.send(funcs.getRandom(character.quotes));

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
        await message.reply(funcs.getRandom(character.quotes));
    }
    

    //chat managment
    await messageFilter(message);
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
        await message.reply(funcs.getRandom(character.quotesBadChannelReaction));
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