const axios = require('axios');

let cachedToken = null;
let expiresAt = 0;

async function getAppAccessToken() {
    if (cachedToken && Date.now() < expiresAt) {
        return cachedToken;
    }

    const res = await axios.post('https://id.twitch.tv/oauth2/token', null, {
        params: {
            client_id: process.env.TWITCH_CLIENT_ID,
            client_secret: process.env.TWITCH_CLIENT_SECRET,
            grant_type: 'client_credentials'
        }
    });

    cachedToken = res.data.access_token;
    // refresh 5 minutes before actual expiry
    expiresAt = Date.now() + (res.data.expires_in - 300) * 1000;

    return cachedToken;
}

module.exports = { getAppAccessToken };
