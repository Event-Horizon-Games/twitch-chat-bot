const theDate = new Date();

client.on("subscription", (channel, username, method, message, userstate) => {
    if (theDate.getMonth() === 8) {
        //SUBTEMBER SUB SUBprise 
        client.say(channel, `Clap ${username} Clap SUBprise Clap Yup, that's a GIGA SUB SUBprise Clap`);
    }
    else {
        client.say(channel, `${username} OMG THANK YOU FOR THE SUB. YOU ARE THE BEST AND DON'T LET ANYONE TELL YOU DIFFERENT!`);
    }
});

client.on("resub", (channel, username, months, message, userstate, methods) => {
    if (userstate["msg-param-should-share-streak"]) {
        client.say(channel, `Would you look at that, ${username} renewed their sub for a ${months} month. That's GIGA cool.`);
    }
    else {
        client.say(channel, `${username} OMG THANK YOU FOR THE SUB. YOU ARE THE BEST AND DON'T LET ANYONE TELL YOU DIFFERENT!`);
    }
});