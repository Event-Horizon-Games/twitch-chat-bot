const axios = require("axios");

// ================= CONFIG =================
const PANDASCORE_TOKEN = process.env.PANDASCORE_TOKEN;
const CHANNEL = process.env.TWITCH_CHANNELS?.split(",")[0].trim();

const FAST_GAMES = ["cs2", "valorant"];
const SLOW_GAMES = ["dota-2", "league-of-legends"];

const POLL_INTERVAL = 30000;
const SLOW_CHAT_INTERVAL = 5 * 60 * 1000;

const TRACKED_TEAMS = [
    "Team Liquid",
    "Sentinels",
    "G2 Esports",
    "Natus Vincere",
];
// ==========================================

const lastState = {};
const lastSlowChatPost = {};

async function getMatches(game) {
    try {
        const res = await axios.get("https://api.pandascore.co/matches", {
            headers: {
                Authorization: `Bearer ${PANDASCORE_TOKEN}`,
            },
            params: {
                "filter[videogame]": game,
                "filter[status]": "running,finished",
                per_page: 100,
            },
        });
        return res.data;
    } catch (err) {
        console.error(`PandaScore error for ${game}:`, err.response?.data || err.message);
        return [];
    }
}

function extractState(match, game) {
    return {
        id: `${game}_${match.id}`,
        game,
        teamA: match.opponents?.[0]?.opponent?.name || "TBD",
        teamB: match.opponents?.[1]?.opponent?.name || "TBD",
        scoreA: match.results?.[0]?.score ?? 0,
        scoreB: match.results?.[1]?.score ?? 0,
        status: match.status,
    };
}

function gameLabel(game) {
    return {
        "cs2": "CS2",
        "valorant": "VAL",
        "dota-2": "DOTA2",
        "league-of-legends": "LoL",
    }[game] || game;
}

function isTrackedTeam(state) {
    return TRACKED_TEAMS.some(team =>
        state.teamA.toLowerCase().includes(team.toLowerCase()) ||
        state.teamB.toLowerCase().includes(team.toLowerCase())
    );
}

function hasScoreOrStatusChanged(prev, current) {
    if (!prev) return current.status === "running";
    return (
        prev.scoreA !== current.scoreA ||
        prev.scoreB !== current.scoreB ||
        prev.status !== current.status
    );
}

function formatScore(state) {
    return `[${gameLabel(state.game)}] ${state.teamA} ${state.scoreA} - ${state.scoreB} ${state.teamB} (${state.status})`;
}

function handleLifecycle(prev, current) {
    if (!isTrackedTeam(current)) return null;

    if ((!prev || prev.status !== "running") && current.status === "running") {
        return `MATCH START: ${current.teamA} vs ${current.teamB} [${gameLabel(current.game)}]`;
    }

    if (prev?.status === "running" && current.status === "finished") {
        return `FINAL: ${current.teamA} ${current.scoreA} - ${current.scoreB} ${current.teamB} [${gameLabel(current.game)}]`;
    }

    return null;
}

async function pollGame(game, isSlowGame) {
    const matches = await getMatches(game);
    const now = Date.now();

    for (const match of matches) {
        const current = extractState(match, game);
        const prev = lastState[current.id];

        const lifecycleMsg = handleLifecycle(prev, current);
        if (lifecycleMsg) {
            global.client.say(CHANNEL, lifecycleMsg);
        }

        if (isSlowGame) {
            if (current.status === "running") {
                const lastPost = lastSlowChatPost[current.id] || 0;
                if (now - lastPost >= SLOW_CHAT_INTERVAL) {
                    global.client.say(CHANNEL, `[${gameLabel(game)} UPDATE] ${current.teamA} ${current.scoreA} - ${current.scoreB} ${current.teamB}`);
                    lastSlowChatPost[current.id] = now;
                }
            }
        } else {
            if (hasScoreOrStatusChanged(prev, current)) {
                global.client.say(CHANNEL, formatScore(current));
            }
        }

        lastState[current.id] = current;
    }
}

async function pollAllGames() {
    for (const game of FAST_GAMES) await pollGame(game, false);
    for (const game of SLOW_GAMES) await pollGame(game, true);
}

function handleEsportsCommand(channel, message) {
    const gameMap = {
        "!cs2": "cs2",
        "!valorant": "valorant",
        "!dota": "dota-2",
        "!lol": "league-of-legends",
    };

    const game = gameMap[message.toLowerCase()];
    if (!game) return false;

    getMatches(game).then(matches => {
        const running = matches.filter(m => m.status === "running");
        if (!running.length) {
            global.client.say(channel, `No live ${gameLabel(game)} matches right now.`);
            return;
        }
        const state = extractState(running[0], game);
        global.client.say(channel, formatScore(state));
    });

    return true;
}

function start() {
    setInterval(pollAllGames, POLL_INTERVAL);
    pollAllGames();
}

module.exports = { start, handleEsportsCommand };
