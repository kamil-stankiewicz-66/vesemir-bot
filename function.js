function getRandom(array)
{
    return array[Math.floor(Math.random() * array.length)];
}

function getRndInt(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function log(map)
{
    if (map == null)
    {
        return 'null';
    }

    return Object.entries(map)
        .map(([key, value]) => `${key} = ${value}`)
        .join('\n');
}

function removeBotMentions(message, client)
{
    let content = message.content;

    content = content.replace(
        new RegExp(`<@!?${client.user.id}>`, 'g'),
        ''
    );

    const botMember = message.guild.members.me;

    botMember.roles.cache.forEach(role =>
    {
        content = content.replace(
            new RegExp(`<@&${role.id}>`, 'g'),
            ''
        );
    });

    return content.trim();
}


//end of file
module.exports = {
    getRandom,
    log,
    removeBotMentions
};