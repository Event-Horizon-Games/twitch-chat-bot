require('dotenv').config();
import CountryCodes from '../country_codes.json';

const quoteApiUrl = 'https://api.quotable.io';

const weatherToken = process.env.OPENWEATHER_TOKEN;

async function GetWeather(client, channel, sender, city, country) {
    fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${weatherToken}`)
        .then((response) => response.json())
        .then((data) => {
            
        })
        .catch((error) => {
            client.say(channel, `@${sender} An error occured with the command.`);
            console.log(error);
        });
}

module.exports = { GetWeather }

function GetCountryCode(country) {
    for (var jsonCountry in CountryCodes) {
        if (jsonCountry.Name === country) {
            return jsonCountry.Code;
        }
    }
}