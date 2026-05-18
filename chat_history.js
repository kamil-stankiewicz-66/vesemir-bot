const limited_queue = require('./limited_queue.js');

const history = new limited_queue(10);

function addEntry(message)
{
    history.add(`${message.author}: ${message.content}`);
}

function getText()
{
    return history.getItems().join('\n');
}

module.exports = {
    addEntry,
    getText
};