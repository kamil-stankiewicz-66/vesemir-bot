require('dotenv').config();

const channels = {
    general: process.env.CHID_GENERAL,
    media: process.env.CHID_MEDIA,
    files: process.env.CHID_FILES,
    links: process.env.CHID_LINKS
};

const mediaTypes = [
    'image', 
    'video',
    'audio'
];


//end of file
module.exports = {
    channels,
    mediaTypes
};