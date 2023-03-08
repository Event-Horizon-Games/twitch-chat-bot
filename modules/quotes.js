const quoteApiUrl = 'https://api.quotable.io';

async function GetQuote(client, channel, sender) {
    let response = await fetch(`${quoteApiUrl}/random`);
    let body = response.json();
    let quote = body.content;
    let author = body.author;

    console.log(`body: ${body}`);

    client.say(channel, `@${sender} \"${quote}\" - ${author}.`);
}

async function GetQuoteByAuthor(client, channel, sender, author) {
    let cleanAuthor = author.trim().replace(' ', '-');

    fetch(`${quoteApiUrl}/random?author=${cleanAuthor}`)
        .then((response) => {
            let body = response.json();
            const quote = body.content;
            const authorAPI = body.author;
            console.log(body);

            client.say(channel, `@${sender} \"${quote}\" - ${authorAPI}.`);
        })
}

module.exports = { GetQuote, GetQuoteByAuthor };