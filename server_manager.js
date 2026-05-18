//cleaner

function removeLinks(content)
{
    return content.replace(/https?:\/\/[^\s]+/g, '').trim();
}




//moveto info message

function createMovedHeader(message)
{
    return `od ${message.author}, przeniesione z kanalu ${message.channel}:`;
}

function makeQuoteStyle(content)
{
    if (content.length > 0)
    {
        return `"*${content}*"`;
    }
    else
    {
        return ``;
    }
}




//get elements from message

function getLinks(content)
{
    const links = content.match(/https?:\/\/[^\s]+/g) || [];
    return [...new Set(links)];
}

function getFilesByTypes(message, types)
{
    const files = [];

    for (const attachment of message.attachments.values())
    {
        for (const type of types)
        {
            if (attachment.contentType?.startsWith(type + '/'))
            {
                files.push(attachment.url);
                break;
            }
        }
    }

    return [...new Set(files)];
}

function getFilesExceptTypes(message, types)
{
    const files = [];

    for (const attachment of message.attachments.values())
    {
        const excluded = types.some(type =>
            attachment.contentType?.startsWith(type + '/')
        );

        if (!excluded)
        {
            files.push(attachment.url);
        }
    }

    return [...new Set(files)];
}




//move to

async function moveLinks(message, links, targetChannel)
{
    if (links.length == 0)
    {
        return false;
    }

    try
    {
        await targetChannel.send(
        {
            content: `${createMovedHeader(message)}\n${makeQuoteStyle(removeLinks(message.content))}\n${links.join('\n')}`
        });

        return true;
    }
    catch (error)
    {
        console.error('<error> moveLinks');
        console.error(error);

        return false;
    }
}

async function moveFiles(message, files, targetChannel)
{
    if (files.length == 0)
    {
        return false;
    }

    try
    {
        await targetChannel.send(
        {
            content: `${createMovedHeader(message)}\n${makeQuoteStyle(removeLinks(message.content))}`,
            files: files
        });

        return true;
    }
    catch (error)
    {
        console.error('<error> moveFiles');
        console.error(error);

        return false;
    }
}





//end of file
module.exports = {
    removeLinks,
    getLinks,
    getFilesByTypes,
    getFilesExceptTypes,
    moveLinks,
    moveFiles
};