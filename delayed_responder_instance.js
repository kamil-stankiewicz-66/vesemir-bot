const DelayedPhraseResponder = require('./delayed_responder.js');

const niceDayResponder = new DelayedPhraseResponder({
    triggers: [
        'milego dnia',
        'milego dzionka',
        'dobrego dnia',
        'milego popoludnia',
        'milego wieczoru',
        'milej nocy',
        'milego weekendu',
        'udanego weekendu',
        'dobrego weekendu',
        'milej soboty',
        'milej niedzieli',
        'milego poniedzialku',
        'milego wtorku',
        'milej srody',
        'milego czwartku',
        'milego piatku',
        'milego piatunia',
        'milego tygodnia'
    ],
    response: 'Miłego dnia',
    minResponseDelay: 1,
    maxResponseDelay: 30,
    resetCron: '0 4 * * *'
});

// const goodNightResponder = new DelayedPhraseResponder({
//     triggers: [
//         'dobranoc',
//         'dobrej nocy',
//         'milej nocy',
//         'spokojnej nocy',
//         'kolorowych snow'
//     ],
//     response: 'Dobranoc',
//     minResponseDelay: 1,
//     maxResponseDelay: 15,
//     resetCron: '0 18 * * *'
// });

module.exports = {
    niceDayResponder
};