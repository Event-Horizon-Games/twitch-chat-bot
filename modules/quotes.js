const request = require('request');
const quoteApiUrl = 'https://api.quotable.io';

function GetQuote() {
    let quote;
    let author;

    request(`${quoteApiUrl}/random`, { json: true }, (err, res, body) => {
        if (err) { return console.log(err); }
        quote = body.content;
        author = body.author;
    });

    //TODO i think we need to use promises and stuff
    return `\"${quote}\" - ${author}`
}

module.exports = { GetQuote };