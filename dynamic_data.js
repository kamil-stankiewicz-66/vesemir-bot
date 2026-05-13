const dynamicData = {
    messageSegregate: true,
    replyWhenWrongChannel: true,
    deleteWhenWrongChannel: true
};

function log()
{
    return Object.entries(dynamicData)
        .map(([key, value]) => `${key} = ${value}`)
        .join('\n');
}

module.exports = {
    dynamicData,
    log
};