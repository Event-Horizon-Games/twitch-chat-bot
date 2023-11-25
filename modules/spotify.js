require('dotenv').config();

var spotifyPlayerURL = "https://api.spotify.com/v1/me/player/currently-playing";
var spotifyTokenURL = "https://accounts.spotify.com/api/token"

const client_id = process.env.SPOTIFY_CLIENTID;
const client_secret = process.env.SPOTIFY_CLIENTSECRET;
const refresh_token = process.env.SPOTIFY_AUTHCODE;

const getAccessToken = async () => {
    const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");
    const response = await fetch(spotifyTokenURL, {
        method: "POST",
        headers: {
            Authorization: `Basic ${basic}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: querystring.stringify({
            grant_type: "refresh_token",
            refresh_token,
        }),
    });
    
    console.log(response.json());
    return response.json();
};

const getNowPlaying = async (client_id, client_secret, refresh_token) => {
    const { access_token } = await getAccessToken(
        client_id,
        client_secret,
        refresh_token
    );
    return fetch(spotifyPlayerURL, {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
};

async function getNowPlayingItem(client_id, client_secret, refresh_token) {
    const response = await getNowPlaying(client_id, client_secret, refresh_token);
    if (response.status === 204 || response.status > 400) {
        console.log(`ERROR: ${response.statusText}`);
        return false;
    }
    const song = await response.json();
    const albumImageUrl = song.item.album.images[0].url;
    const artist = song.item.artists.map((_artist) => _artist.name).join(", ");
    const isPlaying = song.is_playing;
    const songUrl = song.item.external_urls.spotify;
    const title = song.item.name;
    
    return {
        albumImageUrl,
        artist,
        isPlaying,
        songUrl,
        title,
    };
}

async function GetSpotifySong() {
    const info = await getNowPlayingItem(client_id, client_secret, refresh_token);
    console.log(info);
}

module.exports = { GetSpotifySong } 