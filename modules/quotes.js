const quoteApiUrl = 'https://api.quotable.io';

async function GetRandomQuote(channel, sender) {
    fetch(`${quoteApiUrl}/random`)
        .then((response) => response.json())
        .then((data) => {
            const quote = data.content;
            const authorAPI = data.author;

            client.say(channel, `@${sender} \"${quote}\" - ${authorAPI}.`);
        })
        .catch((error) => {
            client.say(channel, `@${sender} An error occured with the command.`);
            console.log(error);
        });
}

async function GetQuoteByAuthor(channel, sender, author) {
    let cleanAuthor = author.trim().replace(' ', '-');

    fetch(`${quoteApiUrl}/random?author=${cleanAuthor}`)
        .then((response) => response.json())
        .then((data) => {
            if (data.statusCode === 404) {
                client.say(channel, `@${sender} ${data.statusMessage}`);
                return
            }

            const quote = data.content;
            const authorAPI = data.author;

            client.say(channel, `@${sender} \"${quote}\" - ${authorAPI}.`);
        })
        .catch((error) => {
            client.say(channel, `@${sender} An error occured with the command.`);
            console.log(error);
        });
}

module.exports = { GetRandomQuote, GetQuoteByAuthor };