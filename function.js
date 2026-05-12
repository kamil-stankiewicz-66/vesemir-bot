function getRandom(array)
{
    return array[Math.floor(Math.random() * array.length)];
}


//end of file
module.exports = {
    getRandom
};