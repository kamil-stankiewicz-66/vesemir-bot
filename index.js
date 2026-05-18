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
const dynamic_data = require('./dynamic_data.js');
const delayed_responder = require('./delayed_responder_instance.js');
const ai_responder = require('./ai_responder.js');
const chat_history = require('./chat_history.js');




//awake

client.once('clientReady', async () => 
{
    updateAcivity()

    try
    {
        //say hello to users
        const channel = await client.channels.fetch(data.channels.general);
        channel.send(funcs.getRandom(character.quotes));
    }
    catch
    {
        console.error(`<error> Channel ${data.channels.general} not found.`);
    }

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




//catch command

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


    //loading
    await interaction.deferReply();


    //logs array
    const logs = [];


    //cmd action
    const action = interaction.options.getString('action');

    //dynamic vars
    if (action == 'show_dynamic_vars')
    {
        logs.push(funcs.log(dynamic_data));
    }

    //nice day module
    else if (action == 'show_nice_day_vars')
    {
        logs.push(funcs.log(delayed_responder.niceDayResponder.getState()));
    }
    else if(action == 'reset_nice_day_vars')
    {
        delayed_responder.niceDayResponder.resetState();
        logs.push(funcs.log(delayed_responder.niceDayResponder.getState()));
    }

    //good night module
    else if (action == 'show_good_night_vars')
    {
        logs.push(funcs.log(delayed_responder.goodNightResponder.getState()));
    }
    else if(action == 'reset_good_night_vars')
    {
        delayed_responder.goodNightResponder.resetState();
        logs.push(funcs.log(delayed_responder.goodNightResponder.getState()));
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


    //cmd nice_day_module
    const _nicedayModule = interaction.options.getBoolean('nice_day_module');

    if (_nicedayModule != null)
    {
        dynamic_data.nicedayModule = _nicedayModule;

        logs.push(`nice_day_module = ${dynamic_data.nicedayModule}`);
    }

    //cmd good_night_module
    const _goodNightModule = interaction.options.getBoolean('good_night_module');

    if (_goodNightModule != null)
    {
        dynamic_data.goodNightModule = _goodNightModule;

        logs.push(`good_night_module = ${dynamic_data.goodNightModule}`);
    }



    //send log to chat
    if (logs.length > 0)
    {
        await interaction.editReply(logs.join('\n'));
    }
    else
    {
        const _lines = [...character.quotes, ...character.quotesWrongChannelReaction];
        await interaction.editReply(funcs.getRandom(_lines));
    }
});




//catch message

client.on("messageCreate", async (message) => 
{
    //add message to memory
    chat_history.addEntry(message);


    //skip bots message
    if (message.author.bot)
    {
        return;
    }


    //hard ping
    if (message.content == 'ping vesemir')
    {
        await message.reply(funcs.getRandom(character.quotes));
    }


    //delayed responders

    let niceDayFeedback = false;
    if (dynamic_data.nicedayModule)
    {
        niceDayFeedback = await delayed_responder.niceDayResponder.handle(message); //if true lock other options
    }

    let goodNightFeedback = false;
    if (dynamic_data.goodNightModule)
    {
        goodNightFeedback = await delayed_responder.goodNightResponder.handle(message); //if true lock other options
    }


    //answer for pings
    
    const isPingAllowed = !niceDayFeedback && !goodNightFeedback;

    if (isPingAllowed)
    {
        const isBotTagged = await isThisReplied(message) ||
            message.mentions.users.has(client.user.id) || //bots profile tagged
            message.guild.members.me.roles.cache.some(role => message.mentions.roles.has(role.id)); //bots role tagged

        if (isBotTagged)
        {
            await message.channel.sendTyping();

            //try get prompt
            const ans = await createRPGReply(message);
            
            if (ans.length > 0)
            {
                await message.reply(ans);
            }
            else
            {
                await message.reply('Hmm...');
            }
        }
    }


    //chat managment
    if (dynamic_data.messageSegregate)
    {
        await messageFilter(message);
    }
});

async function createRPGReply(message)
{
    //clear question
    const question = funcs.removeBotMentions(message, client).trim();

    if (question.length < 2)
    {
        //empty message
        return '';
    }

    const safeQuestion = question.slice(0, 1000);

    const historyText = chat_history
        .getText()
        .slice(0, 2000);

    const prompt = `Historia ostatnich wiadomości: ${historyText} 
    Pytanie użytkownika: ${safeQuestion}`;

    try
    {
        const ans = await ai_responder.ask(prompt);

        //empty ai response
        if (!ans || ans.trim().length == 0)
        {
            return 'Hmm...';
        }


        //ai
        return ans.trim();
    }
    catch (error)
    {
        console.error('<error> rpg_responder');
        console.error(error);

        
        //ai error
        return 'Hmm...';
    }
}

async function messageFilter(message)
{
    let generalChannel;
    let linksChannel;
    let mediaChannel;
    let filesChannel;

    try
    {
        generalChannel = await client.channels.fetch(data.channels.general);
        linksChannel = await client.channels.fetch(data.channels.links);
        mediaChannel = await client.channels.fetch(data.channels.media);
        filesChannel = await client.channels.fetch(data.channels.files);
    }
    catch (error)
    {
        console.error("<error> channel fetch");
        console.error(error);

        return;
    }


    const msgLinks = server_manager.getLinks(message.content);
    const msgMedia = server_manager.getFilesByTypes(message, data.mediaTypes);
    const msgFiles = server_manager.getFilesExceptTypes(message, data.mediaTypes);

    const hasLinks = msgLinks.length > 0;
    const hasMedia = msgMedia.length > 0;
    const hasFiles = msgFiles.length > 0;

    const isOnChannelLinks = message.channel.id == linksChannel.id;
    const isOnChannelMedia = message.channel.id == mediaChannel.id;
    const isOnChannelFiles = message.channel.id == filesChannel.id;

    const moveLinksAllowed = hasLinks && (!isOnChannelLinks || (hasMedia || hasFiles));
    const moveMediaAllowed = hasMedia && (!isOnChannelMedia || (hasLinks || hasFiles));
    const moveFilesAllowed = hasFiles && (!isOnChannelFiles || (hasMedia || hasLinks));
    

    if (moveLinksAllowed)
    {
        await server_manager.moveLinks(message, msgLinks, linksChannel);
    }

    if (moveMediaAllowed)
    {
        await server_manager.moveFiles(message, msgMedia, mediaChannel);
    }

    if (moveFilesAllowed)
    {
        await server_manager.moveFiles(message, msgFiles, filesChannel);
    }


    if (moveLinksAllowed || moveMediaAllowed || moveFilesAllowed)
    {
        if (dynamic_data.replyWhenWrongChannel)
        {
            await message.reply(funcs.getRandom(character.quotesWrongChannelReaction));
        }

        if (dynamic_data.deleteWhenWrongChannel)
        {
            try
            {
                await message.delete();
            }
            catch (error)
            {
                console.error("<error> message.delete");
                console.error(error);
            }

            const cleanedContent = server_manager.removeLinks(message.content);
            if (cleanedContent.length > 0)
            {
                try
                {
                    await generalChannel.send(
                    {
                        content: `${message.author}: "*${cleanedContent}*"`
                    });
                }
                catch (error)
                {
                    console.error('<error> generalChannel.send');
                    console.error(error);
                }
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