require('dotenv').config();
const CountryCodes = require('../country_codes.json');

const weatherToken = process.env.OPENWEATHER_TOKEN;

async function GetWeather(client, channel, sender, city, country) {
    var countryCode = "";

    if (country) {
        countryCode = GetCountryCode(country);
        if (!(countryCode)) {
            client.say(channel, `@${sender} Unable to get the code for "${country}". Check https://datahub.io/core/country-list/r/0.html for a list of valid country names.`);
            return;
        }
    }

    fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city},${countryCode}&appid=${weatherToken}`)
        .then((response) => response.json())
        .then((data) => {
            let lon, lat;
            for (var daBody of data) {
                lon = daBody.lon;
                lat = daBody.lat;
            }
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${weatherToken}`)
            .then((response) => response.json())
            .then((data) => {
                const temp = data.main.temp;
                const apiCity = data.name;
                const apiCountryId = data.sys.country;

                // \u00B0 is the degree symbol
                client.say(channel, `@${sender} It is currently ${temp}\u00B0F in ${apiCity}, ${apiCountryId}.`);
            })
            .catch((error) => {
                client.say(channel, `@${sender} An error occured with the command.`);
                console.log(error);
            });
        })
        .catch((error) => {
            client.say(channel, `@${sender} An error occured with the command.`);
            console.log(error);
        });
}

module.exports = { GetWeather }

function GetCountryCode(country) {
    for (var jsonCountry of CountryCodes) {
        if (jsonCountry.Name.toLowerCase() === country.toLowerCase()) {
            return jsonCountry.Code;
        }
    }
}