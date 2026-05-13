function getRandom(array)
{
    return array[Math.floor(Math.random() * array.length)];
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


//end of file
module.exports = {
    getRandom,
    log
};