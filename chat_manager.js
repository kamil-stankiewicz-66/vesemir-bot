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

async function moveLinks(message, linksChannel)
{
    const links = getLinks(message.content);

    if (links.length == 0)
    {
        return false;
    }

    await linksChannel.send(
    {
        content:`${createMovedHeader(message)}\n"*${removeLinks(message.content)}*"\n${links.join('\n')}`
    });

    return true;
}

async function moveFilesByType(message, imagesChannel, types)
{
    const files = getFilesByTypes(message, types);

    if (files.length == 0)
    {
        return false;
    }

    await imagesChannel.send(
    {
        content: `${createMovedHeader(message)}\n"*${removeLinks(message.content)}*"`,
        files: files
    });

    return true;
}

async function moveFilesExceptType(message, filesChannel, types)
{
    const files = getFilesExceptTypes(message, types)

    if (files.length == 0)
    {
        return false;
    }
    
    await filesChannel.send(
    {
        content: `${createMovedHeader(message)}\n"*${removeLinks(message.content)}*"`,
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