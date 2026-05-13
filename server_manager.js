//links

function getLinks(content)
{
    const links = content.match(/https?:\/\/[^\s]+/g) || [];
    return [...new Set(links)];
}

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




//files

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

async function moveLinks(message, targetChannel)
{
    const links = getLinks(message.content);

    if (links.length == 0)
    {
        return false;
    }

    await targetChannel.send(
    {
        content:`${createMovedHeader(message)}\n${makeQuoteStyle(removeLinks(message.content))}\n${links.join('\n')}`
    });

    return true;
}

async function moveFilesByType(message, targetChannel, types)
{
    const files = getFilesByTypes(message, types);

    if (files.length == 0)
    {
        return false;
    }

    await targetChannel.send(
    {
        content: `${createMovedHeader(message)}\n${makeQuoteStyle(removeLinks(message.content))}`,
        files: files
    });

    return true;
}

async function moveFilesExceptType(message, targetChannel, types)
{
    const files = getFilesExceptTypes(message, types)

    if (files.length == 0)
    {
        return false;
    }
    
    await targetChannel.send(
    {
        content: `${createMovedHeader(message)}\n${makeQuoteStyle(removeLinks(message.content))}`,
        files: files
    });

    return true;
}





//end of file
module.exports = {
    getLinks,
    removeLinks,
    getFilesByTypes,
    getFilesExceptTypes,
    moveLinks,
    moveFilesByType,
    moveFilesExceptType
};