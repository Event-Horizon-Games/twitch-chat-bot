require('dotenv').config();

const quoteApiUrl = 'https://api.quotable.io';

const weatherToken = process.env.OPENWEATHER_TOKEN;

async function GetWeather(client, channel, sender, city, country) {

}

async function GetLatLong(city, country) {
    let response = await request(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${weatherToken}`);
}