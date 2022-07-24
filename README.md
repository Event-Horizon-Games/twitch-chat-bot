![Discord](https://img.shields.io/discord/443469615780200460?color=purple&label=Event%20Horizon%20Discord&logo=discord) ![GitHub](https://img.shields.io/github/license/event-horizon-games/twitch-chat-bot) ![GitHub release (latest by date)](https://img.shields.io/github/v/release/event-horizon-games/twitch-chat-bot) ![GitHub all releases](https://img.shields.io/github/downloads/Event-Horizon-Games/twitch-chat-bot/total)

[Join Our Discord!](https://discord.com/invite/FMp2zhT)
# Twitch Stream Bot

## Disclaimer

Some pretty shitty things can be done with bots, since they are simply Twitch users that can join any channel without permission from the streamer. I wish I didn't have to say this but it's needed. This applies to any bot someone creates, but since I'm creating this walkthrough I feel especially obligated to give this warning. **ONLY JOIN THE BOT TO A CHANNEL IN WHICH YOU HAVE EXPLICIT PERMISSION TO DO SO, OR KEEP IT IN YOUR OWN CHANNEL.** Please just use your common sense and use this for a fun side project and nothing more. Keep it focues on fun and making streams better, and don't use it as a weapon. I can't do a whole lot, but if I find someone uses my guide for nefarious purposes I'll do whatever I can to fuck them up. Also if a streamer on the recieving end finds this page please let me know so I can help how ever I can.

**Put simply, a chat bot is just a user so anyone dealing with a malicious bot can just ban it from their channel.**

## Required tools

**Install these before doing anything else!**

- [NodeJS](https://nodejs.org/en/download/)
- [MariaDB](https://mariadb.org/download/?t=mariadb&p=mariadb&r=10.6.8&os=windows&cpu=x86_64&pkg=msi&m=gigenet) *Use all default settings to include HeidiSQL*

<figure>
  <img src="https://i.imgur.com/pUhzR6l.png" alt="Image of Instructions" title="Proper Settings" width="60%"/>
  <figcaption><i>Download options should match the image above.</i></figcaption>
</figure>

***This 10.6 is the LTS version so there should be no differences no matter when you're reading this.***

I won't be teaching these tools here, but there is plenty of information out there as they are pretty standard tools. I will leave a link to the ones I used to get familiar. I recommened leaving every install on default, unless you know what you're doing. It will save trouble later on. Another important reminder is to remember what you set the user and pssword to for MariaDB. I made the mistake once of forgetting and it is not fun to fix. I think the common thing to do especially for a locally hosted DB is to set both to root. This will be inscure though so just be warned.

- A good guide for initial setup of MariaDB can be found [here](https://www.mariadbtutorial.com/getting-started/install-mariadb/).
- HeidiSQL provides basic instructions on how to connect to a MariaDB server [here](https://www.heidisql.com/help.php).
- Video instructions on how to create databases and tables in HeidiSQL can be viewed [here](https://www.youtube.com/watch?v=mRlXm04S_RY).

## Instructions

1. Create a new account for your bot *(you can technically use your own Twitch but not ideal)*
2. Obtain an OAUTH token for your bot's account from [here](https://twitchapps.com/tmi/).  *(Please note I don't necessarily endorse that site or know it's security but I know it works for me and others recommend it.)*
3. Clone or ownload the latest release version of this repo
4. Extract the release, and then any of the following steps will be done inside the release directory
5. Create a ***.env*** file containing the following information ***Don't use dashes in any name for your databases. I found that out the hard way. Use underscores instead.***

```text
TWITCH_USERNAME = <Name of the chatbot>
TWITCH_OAUTH = <The oauth token you generated earlier>
TWITCH_CHANNELS = <The name of the channel for the bot to join>
TWITCH_PREFIX = <The character you want your bot to recognize>
DATABASE_HOST = <Where you're database lives>
DATABASE_USER = <User to authenticate to the DB>
DATABASE_PASSWORD = <Password to authenticate to the DB>
```

NOTE: If you would like the bot to join multiple streams, in the `TWITCH_CHANNELS` make a comma-seperated list of each channel. For instance, if you would like the bot to join Stream1 and Stream2, the .env would look like `TWITCH_CHANNELS = Stream1, Stream2`

5. Inside *app.js* Insert your new commands as new case statements within the switch

```javascript
switch (command) {
    case 'yournewcommandhere':
        // Your command behavior
        break;
}
```

I will be adding commands that I feel add to my own personal stream. However, you can use them as reference, or delete them for all I care. Use it however best works for you.

6. Add the usage of your new command to the `getUsageInfo` function like this

```javascript
switch (command) {
    case 'yournewcommandhere':
      return "What your new command does. Usage: !yournewcommand <parameter1> <parameter2>. Example: \"!yournewcommand parameter1 parameter2\"";
}
```

7. Run your bot in the terminal or command line session using `node app.js`
