const cron = require('node-cron');




//state holder

const niceDayState = {
    isUsed: false,
    isScheduled: false,
};




//schedule state reset

cron.schedule('0 4 * * *', () =>
{
    niceDayState.isUsed = false;
    niceDayState.isScheduled = false;
},
{
    timezone: 'Europe/Warsaw'
});




//helpers

function containsNiceDay(text)
{
    const normalized = text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    return normalized.includes('milego dnia') ||        
        normalized.includes('milego dzionka') ||
        normalized.includes('dobrego dnia') ||
        normalized.includes('milego popoludnia') ||
        normalized.includes('milego wieczoru') ||
        normalized.includes('milej nocy') ||
        normalized.includes('milego weekendu') ||
        normalized.includes('udanego weekendu') ||
        normalized.includes('dobrego weekendu') ||
        normalized.includes('milej soboty') ||
        normalized.includes('milej niedzieli') ||
        normalized.includes('milego poniedzialku') ||
        normalized.includes('milego wtorku') ||
        normalized.includes('milej srody') ||
        normalized.includes('milego czwartku') ||
        normalized.includes('milego piatku') ||
        normalized.includes('milego piatunia') ||
        normalized.includes('milego tygodnia');
}

function getRandomDelay(minResponseDelay, maxResponseDelay)
{
    const minutes = Math.floor(Math.random() * (maxResponseDelay - minResponseDelay + 1)) + minResponseDelay;

    return minutes * 60 * 1000;
}




//main function

async function handleNiceDay(message, minResponseDelay, maxResponseDelay)
{
    if (niceDayState.isUsed)
    {
        return false; //unlock other reply options
    }

    if (niceDayState.isScheduled)
    {
        return true; //lock other reply options
    }

    if (!containsNiceDay(message.content))
    {
        return false; //unlock other reply options
    }


    const delay = getRandomDelay(minResponseDelay, maxResponseDelay);
    replyOnDelay(message, delay);

    niceDayState.isScheduled = true;


    return true; //lock other reply options
}

async function replyOnDelay(message, delay)
{
    await sleep(delay);
    await message.channel.send('Miłego dnia');

    niceDayState.isUsed = true;
}

function sleep(ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}





//end of file

module.exports = {
    handleNiceDay
};