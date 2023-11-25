//! TO RUN THE BOT: npm start

require('dotenv').config();
const tmi = require('tmi.js');
const mysql = require('mysql');

// global var to use with sql queries
var sqlError = null;
// name of the sql database
var sqlDatabase = process.env.DATABASE_NAME;
// name of table in the database were saving things to
var sqlTable = 'userinfo';
// status of commands
var commandDisabledList = {};
//* Commands list here
var commandList = ['usage', 'enable', 'disable', 'hey', 'cum', 'announce', 'quote', 'weather', 'whoisme', 'strange', 'color', 'colors', 'songtest', 'roll'];
//* Excluded commands list (to ignore commands for other bots)
var excludedCommandList = ['boss', 'basketball', 'permit', 'nopixel', 'turbo', 'ads', 'emotes'];
var usernameColors = ['Blue', 'BlueViolet', 'CadetBlue', 'Chocolate', 'Coral', 'DodgerBlue', 'Firebrick', 'GoldenRod', 'Green', 'HotPink', 'OrangeRed', 'Red', 'SeaGreen', 'SpringGreen', 'YellowGreen']
var previousMessage;

// create DB connection
var db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: sqlDatabase
});

// Connect to DB
db.connect(function(err) {
    if (err) throw err;
    console.log('Connected to database!');
});

// Create the channels to join list
const channelsString = process.env.TWITCH_CHANNELS;
const channelsArray = channelsString.replace(' ', '').split(',');

// create the twitch tmi client
global.client = new tmi.Client({
    options: { debug: true, messagesLogLevel: "info"},
    connection: {
        reconnect: true,
        secure: true
    },

    identity: {
        username: `${process.env.TWITCH_USERNAME}`,
        password: `${process.env.TWITCH_OAUTH}`
    },

    channels: channelsArray
});

client.connect().catch(console.error);

const quotes = require('./modules/quotes.js');
const weather = require('./modules/weather.js');
const subs = require('./modules/subs.js');
const spotify = require('./modules/spotify.js');

client.on('join', (channel, username, self) => {
    if (self) {
        client.say(channel, `MrDestructoid I now control this chat. MrDestructoid`);
    }
});

client.on('message', (channel, tags, message, self) => {
    // Ignores chat messages from the bot
    if (self) return;

    // Get the first character (which is the prefix)
    const messagePrefix = message.charAt(0);
    // The command is the firt word of the message minus the first character
    const command = message.split(' ')[0].slice(1).toLowerCase();
    // Rest of the message is the input minues the command
    const restOfMessage = message.split(' ').slice(1).join(' ');

    // Ignore message if it does not contain the bot's prefix
    if (!(messagePrefix === `${process.env.TWITCH_PREFIX}`)) {
        // Does not have the bot's prefix in the first character; IGNORE
        //console.log('not a command');
        cumProtection(channel, message);
        selfDefense(channel, message, tags.username)
        return;
    }

    const sender = tags.username;

    if (isCommandDisabled(command)) {
        client.say(channel, `@${sender} Command: ${command} is currently disabled.`);
        return;
    }

    if (isCommandExcluded(command)) {
        return;
    }

    switch (command) {
        //! ANY USER INPUT TOUCHING THE DB NEEDS TO BE CLEANED mysql.escape()
        case 'commands':
            client.say(channel, `@${sender} the commands available for this channel are: ${commandList.join(', ')}`);
            break;

        case 'usage':
            if (restOfMessage) {
                const splitMessage = restOfMessage.split(' ');
                if (splitMessage.length > 1) {
                    // sent something like !usage blah blah
                    client.say(channel, `@${sender} Too many parameters. Usage: ${getUsageInfo(command)}`);
                }
                else {
                    // sent only one parameter good
                    client.say(channel, `@${sender} Usage of command ${splitMessage[0]}: ${getUsageInfo(splitMessage[0])}`);
                }
            }
            else {
                // sent only !usage
                client.say(channel, `@${sender} Must supply a command. Usage: ${getUsageInfo(command)}`);
            }
            break;

        case 'enable':
            if (restOfMessage) {
                const splitMessage = restOfMessage.split(' ');
                if (splitMessage.length > 1) {
                    // sent something like !enable sdfsdfsd sdfsdsd
                    client.say(channel, `@${sender} Too many parameters. Usage: ${getUsageInfo(command)}`);
                }
                else {
                    // sent only one parameter good
                    if(isCommandDisabled(splitMessage[0])) {
                        if(isValidCommand(splitMessage[0])) {
                            enableCommand(splitMessage[0]);
                            client.say(channel, `@${sender} ${splitMessage[0]} has been enabled.`);
                        }
                        else {
                            client.say(channel, `@${sender} ${splitMessage[0]} is not a valid command.`);
                        }
                    }
                    else {
                        client.say(channel, `@${sender} Command: ${splitMessage[0]} is already enabled.`);
                    }
                }
            }
            else {
                // sent only !enable
                client.say(channel, `@${sender} Must supply a command. Usage: ${getUsageInfo(command)}`);
            }
            break;

        case 'disable':
            if (restOfMessage) {
                const splitMessage = restOfMessage.split(' ');
                if (splitMessage.length > 1) {
                    // sent something like !disable sdfsdfsd sdfsdsd
                    client.say(channel, `@${sender} Too many parameters. Usage: ${getUsageInfo(command)}`);
                }
                else {
                    // sent only one parameter good
                    if(!isCommandDisabled(splitMessage[0])) {
                        if(isValidCommand(splitMessage[0])) {
                            if(splitMessage[0] === 'commands' || splitMessage[0] === 'enable' || splitMessage[0] === 'disable' || splitMessage[0] === 'usage') {
                                client.say(channel, `@${sender} Command: ${splitMessage[0]} can not be disabled.`);
                            }
                            else {
                                disableCommand(splitMessage[0]);
                                client.say(channel, `@${sender} ${splitMessage[0]} has been disabled.`);
                            }
                        }
                        else {
                            client.say(channel, `@${sender} ${splitMessage[0]} is not a valid command.`);
                        }
                    }
                    else {
                        client.say(channel, `@${sender} Command: ${splitMessage[0]} is already disabled.`);
                    }
                }
            }
            else {
                // sent only !enable
                client.say(channel, `@${sender} Must supply a command. Usage: ${getUsageInfo(command)}`);
            }
            break;

        case 'hey':
            client.say(channel, `@${sender} What's up yo!`);
            break;

        case 'cum':
            if (restOfMessage) {
                const splitMessage = restOfMessage.split(' ');
                if (splitMessage.length > 1) {
                    // Entered more than one command
                    client.say(channel, `@${sender} We're sorry, but you can't cum on more than one person. Usage of ${command}: ${getUsageInfo(command)}`);
                }
                else {
                    // Direct cum onto someone
                    // increment sender cums
                    // increment target's cum ons
                    var target = splitMessage[0];
                    if (target.charAt(0) === '@') {
                        // Remove leading @ to clean input for database
                        target = target.slice(1);
                    }

                    incrementUserCums(sender, channel).then((result) => {
                        if (result !== -1) {
                            // succesfully cummed on chat
                            client.say(channel, `borpaSpin @${sender} just cummed right on ${target}! borpaSpin They have cummed a total of ${result} times. borpaSpin`);
                        }
                        else {
                            client.say(channel, `Sorry @${sender}, we couldn't handle your cum right now. There may be a problem with the database.`);
                            return;
                        }
                    });
                    incrementUserCumOns(target, channel).then((result) => {
                        if (result !== -1) {
                            // has successfully been cummed on
                            client.say(channel, `borpaSpin @${target} has now been cummed on ${result} times! borpaSpin`);
                        }
                        else {
                            client.say(channel, `Sorry @${sender}, we couldn't handle your cum right now. There may be a problem with the database.`);
                        }
                    });
                }
            }
            else {
                // nothing but command. just increment this user's cums
                incrementUserCums(sender, channel).then((result) => {
                    if (result !== -1) {
                        // succesfully cummed on chat
                        client.say(channel, `borpaSpin @${sender} just cummed on chat! borpaSpin They have cummed a total of ${result} times. borpaSpin`);
                    }
                    else {
                        client.say(channel, `Sorry @${sender}, we couldn't handle your cum right now. There may be a problem with the database.`);
                    }
                });
            }
            break;

        case 'announce':
            client.say(channel, `/announce @${sender} wants to say that \"${restOfMessage}\"`);
            break;

        case 'quote':
            if (restOfMessage) {
                quotes.GetQuoteByAuthor(channel, sender, restOfMessage);
            }
            else {
                quotes.GetRandomQuote(channel, sender);
            }
            break;

        case 'weather':
            const splitMessage = restOfMessage.split(' ');

            if(splitMessage.length === 1) {
                const city = splitMessage[0];
                weather.GetWeather(channel, sender, city);
            }
            else {
                const city = splitMessage[0];
                const country = splitMessage.slice(1).join(' ');
                weather.GetWeather(channel, sender, city, country);
            }

            break;

        case 'songtest':
            spotify.GetSpotifySong();
            break;

        case 'strange':
            const splitted = restOfMessage.split(' ');

            if(splitted.length === 1) {
                const randNum = Math.floor(Math.random() * 100) + 1;
                client.say(channel, `HUH ${sender} is ${randNum}% strange right now! HUH`);
            }

            break;

        case 'colors':
            client.say(channel, `@${sender} The valid colors for the bot's username are: ${usernameColors.join(', ')}`);
            break;

        case 'color':
            changeUsernameColor(channel, sender, restOfMessage);
            break;

        case 'roll':
            const splitParams = restOfMessage.split(' ');
            if(splitParams.length !== 2) {
                client.say(channel, `@${sender} Incorrect usage for the roll command.`);
                break;
            }

            const numDie = Number(splitParams[0]);
            const maxSides = Number(splitParams[1]);

            const firstRand = Math.floor(Math.random() * maxSides) + 1;
            var rollString = firstRand;

            if (numDie > 1) {
                for (let i = 0; i < numDie - 1; i++) {
                    const thisRand = Math.floor(Math.random() * maxSides) + 1;
                    rollString += ` | ${thisRand}`;
                }
            }

            client.say(channel, `@${sender} ${rollString}`);

            break;

        case 'whoisme':
            client.say(channel, `@${sender} MrDestructoid I am a bot made by GravityBZK. Beep Boop. MrDestructoid Ignore me if I mess up I'm trying my best. MrDestructoid`);
            break;

        default:
            //client.say(channel, `@${sender} the command ${command} was not found. Use !commands to see a list of all commands for this bot.`);
    }
});

/**
 *  Increments the number of cums for a given user.
 *  @async
 *  @param  {string}    username   The username to increment
 *  @return {number}               The current number of cums for the user | -1 if an error occurs
 */
async function incrementUserCums(username) {
    try {
        const query = `SELECT * FROM ${sqlTable} WHERE username=${mysql.escape(username)}`;
        const userInfo = await queryDB(query);
        var currentCums;

        if (userInfo[0]) {
            // The user already exists; just update cums
            const userCums = userInfo[0].cums;
            currentCums = userCums + 1;
            const updateQuery = `UPDATE ${sqlTable} SET cums=${currentCums} WHERE username=${mysql.escape(username)}`;
            await queryDB(updateQuery);
        }
        else {
            // The user is not in the database, create with one cums
            currentCums = 1
            const createQuery = `INSERT INTO ${sqlTable} (username, cums) VALUES (${mysql.escape(username)}, ${currentCums})`;
            await queryDB(createQuery);
        }

        return currentCums;
    }
    catch (error) {
        console.log(error);
        return -1;
    }
}

/**
 *  Increments the number of cummedOn for a given user.
 *  @async
 *  @param  {string}    username   The username to increment
 *  @return {number}               The current number of cummedOn for the user | -1 if an error occurs
 */
async function incrementUserCumOns(username) {
    try {
        const query = `SELECT * FROM ${sqlTable} WHERE username=${mysql.escape(username)}`;
        const userInfo = await queryDB(query);
        var currentCumOns;

        if (userInfo[0]) {
            // The user already exists; just update cums
            const userCumOns = userInfo[0].cummedOn;
            currentCumOns = userCumOns + 1;
            const updateQuery = `UPDATE ${sqlTable} SET cummedOn=${currentCumOns} WHERE username=${mysql.escape(username)}`;
            await queryDB(updateQuery);
        }
        else {
            // The user is not in the database, create with one cums
            currentCumOns = 1
            const createQuery = `INSERT INTO ${sqlTable} (username, cummedOn) VALUES (${mysql.escape(username)}, ${currentCumOns})`;
            await queryDB(createQuery);
        }

        return currentCumOns;
    }
    catch (error) {
        console.log(error);
        return -1;
    }
}

async function changeUsernameColor(channel, sender, color) {
    if (usernameColors.includes(color)) {
        client.color(color)
        .then((data) => {
            // data returns [color]
        }).catch((err) => {
            console.log(err);
        });

        client.say(channel, `@${sender} The bot's username color has been changed to ${color}.`);
    }
    else {
        client.say(channel, `@${sender} The color provided is not a valid color for the bot's username. Type !color for available colors.`);
    }
}

function cumProtection(channel, message) {
    if (previousMessage === 'c' && message === 'u') {
        client.say(channel, `NOPERS Tssk`);
    }
    else {
        previousMessage = message;
    }
}

function selfDefense(channel, message, sender) {
    const splitted = message.split(' ');

    if(splitted.length === 2) {
        if (splitted[0] === 'EventHorizonBOT' || splitted[0] === '@EventHorizonBOT') {
            if (splitted[1] === 'PeepoFinger') {
                client.say(channel, `${sender} PeepoFinger`);
            }
        }
    }
}

/**
 *  Executes a query and returns the result
 *  @param      {string}    query   the query to execute on the database
 *  @returns    {Promise}           promise containing the execution
 */
function queryDB(query) {
    return new Promise((resolve, reject) => {
        db.query(query + ';', (err, result) => {
            if (err) {
                sqlError = err;
                console.log('Error while communicating with database: ' + err);
                return reject();
            }

            console.log('Query: \"' + query + '\" executed successfully.');
            return resolve(result);
        });
    });
}

/**
 *  Disables a given command
 *  @param      {string}    command     The command to disable
 */
function disableCommand(command) {
    commandDisabledList[command] = true;
}

/**
 *  Enables a given command
 *  @param      {string}    command     The command to disable
 */
function enableCommand(command) {
    commandDisabledList[command] = false;
}

/**
 *  Returns whether or not a commmand is currently disabled
 *  @param      {string}    command     The command to get status for
 *  @returns    {boolean}               True - command is currently DISABLED | False - command is currently ENABLED
 */
function isCommandDisabled(command) {
    updateCommandDisabledList();
    return commandDisabledList[command];
}

function isCommandExcluded(command) {
    return excludedCommandList.includes(command);
}

/**
 *  Updates the disabled list to have all commands in it, with them defaulting to enabled.
 */
function updateCommandDisabledList() {
    commandList.forEach((command) => {
        if(!(command in commandDisabledList)) {
            commandDisabledList[command] = false;
        }
    });
}

/**
 *  Checks if a command is a valid command for the bot
 *  @param      {string}    command     The commmand to check
 *  @returns    {boolean}               True - the command is valid | False - the command is not valid
 */
function isValidCommand(command) {
    return commandList.includes(command);
}

/**
 *  Returns a string containing the usage info on a command
 *  @param      {string}    command     the string form of the command
 *  @returns                            The string usage sentence of the given commmand.
 */
function getUsageInfo(command) {
    switch (command) {
        case 'commands':
            return "Gets a list of the bot's commands. Usage: \"!commands\"";

        case 'usage':
            return "Returns the usage info for a command. Usage: !usage <(string) command>. Example: \"!usage commands\"";

        case 'hey':
            return "Says a friendly hello to whatever kind chatter greets the bot. Usage: !hey";

        case 'cum':
            return "Cums on all of chat or a specific user. Usage: !cum (<username>). Example: !cum | or | !cum @gravitybzk.";

        case 'announce':
            return "Sends an announcement to chat from the user with the message that's sent. Usage: !announce <message>. Example: !announce hello everyone";

        default:
            return "No usage. Unknown command!";
    }
}

process.stdin.resume();

//! This was being called too early and closing the connection
// referenced from here: https://stackoverflow.com/questions/14031763/doing-a-cleanup-action-just-before-node-js-exits
function exitHandler(options) {
    //Close the connection to the database
    db.end((err) => {
        if (err) {
            console.log(`Error closing connection: ${err}`);
            console.log(`Could not close connection to database.`);
            return;
        }

        console.log('Database connection successfully closed.');
    });

    if (options.exit) {
        process.exit();
    }
}

process.on('exit', exitHandler.bind(null));
process.on('SIGINT', exitHandler.bind(null, {exit:true}));