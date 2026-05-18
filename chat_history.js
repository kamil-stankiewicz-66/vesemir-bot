const limited_queue = require('./limited_queue.js');

const history = new limited_queue(10);

function addEntry(message, client)
{
    const authorName =
        message.member?.displayName ||
        message.author.username ||
        'unknown';

    const content = funcs
        .removeBotMentions(message, client)
        .trim();

    if (content.length == 0)
    {
        return;
    }

    history.add(`${authorName}: ${content}`);
}

function getText()
{
    return history.getItems().join('\n');
}

module.exports = {
    addEntry,
    getText
};