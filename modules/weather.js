require('dotenv').config();
const axios = require('axios');
const CountryCodes = require('../country_codes.json');

const weatherToken = process.env.OPENWEATHER_TOKEN;

async function GetWeather(channel, sender, city, country) {
    var countryCode = "";

    if (country) {
        countryCode = GetCountryCode(country);
        if (!countryCode) {
            global.client.say(channel, `@${sender} Unable to get the code for "${country}". Check https://datahub.io/core/country-list/r/0.html for a list of valid country names.`);
            return;
        }
    }

    try {
        const geoRes = await axios.get(`http://api.openweathermap.org/geo/1.0/direct`, {
            params: { q: `${city},${countryCode}`, appid: weatherToken }
        });

        const geoData = geoRes.data;
        if (!geoData.length) {
            global.client.say(channel, `@${sender} Could not find "${city}". Check the spelling and try again.`);
            return;
        }

        const { lat, lon } = geoData[0];

        const weatherRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: { lat, lon, units: 'imperial', appid: weatherToken }
        });

        const { temp } = weatherRes.data.main;
        const apiCity = weatherRes.data.name;
        const apiCountryId = weatherRes.data.sys.country;

        global.client.say(channel, `@${sender} It is currently ${temp}°F in ${apiCity}, ${apiCountryId}.`);
    } catch (error) {
        global.client.say(channel, `@${sender} An error occurred with the command.`);
        console.error(error);
    }
}

function GetCountryCode(country) {
    for (var jsonCountry of CountryCodes) {
        if (jsonCountry.Name.toLowerCase() === country.toLowerCase()) {
            return jsonCountry.Code;
        }
    }
}

module.exports = { GetWeather };
