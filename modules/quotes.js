const request = require('request');
const quoteApiUrl = 'https://api.quotable.io';

function GetQuote(client, channel, sender) {
    let quote;
    let author;

    request(`${quoteApiUrl}/random`, { json: true }, (err, res, body) => {
        if (err) { return console.log(err); }
        quote = body.content;
        author = body.author;

        client.say(channel, `@${sender} \"${quote}\" - ${author}.`);
    });
}

function GetQuoteByAuthor(client, channel, sender, author) {
    let cleanAuthor = author.trim().replace(' ', '-');

    request(`${quoteApiUrl}/random?author=${cleanAuthor}`, { json: true }, (err, res, body) => {
        if (err) { return console.log(err); }
        const quote = body.content;
        const authorAPI = body.author;

        client.say(channel, `@${sender} \"${quote}\" - ${authorAPI}.`);
    });
}

module.exports = { GetQuote, GetQuoteByAuthor };