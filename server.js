// MergingGame Player Sync Server
// A minimal HTTP server for cross-device player data sync
// Zero dependencies — uses only Node.js built-in http + fs

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3014;
const DATA_DIR = '/app/data';
const PLAYERS_FILE = path.join(DATA_DIR, 'players.json');

// Ensure data directory and file exist
fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(PLAYERS_FILE)) {
    fs.writeFileSync(PLAYERS_FILE, '{}', 'utf8');
}

function readPlayers() {
    try {
        return JSON.parse(fs.readFileSync(PLAYERS_FILE, 'utf8'));
    } catch (e) {
        return {};
    }
}

function writePlayers(data) {
    fs.writeFileSync(PLAYERS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (e) {
                resolve(null);
            }
        });
        req.on('error', reject);
    });
}

function sendJSON(res, statusCode, data) {
    const json = JSON.stringify(data);
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(json);
}

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        sendJSON(res, 200, {});
        return;
    }

    if (pathname === '/api/players') {
        if (req.method === 'GET') {
            // Return all players
            const players = readPlayers();
            sendJSON(res, 200, { players });
        } else if (req.method === 'POST') {
            // Save players (merge incoming with existing)
            const body = await parseBody(req);
            if (!body || !body.players) {
                sendJSON(res, 400, { error: 'No players data' });
                return;
            }
            const existing = readPlayers();
            const incoming = body.players;

            // Merge: incoming overwrites existing for each player
            const merged = { ...existing };
            for (const name of Object.keys(incoming)) {
                if (!merged[name]) {
                    merged[name] = incoming[name];
                } else {
                    // Merge properties, keep the highest wordIndex
                    merged[name] = { ...merged[name], ...incoming[name] };
                    if (incoming[name].wordIndex != null && existing[name].wordIndex != null) {
                        merged[name].wordIndex = Math.max(
                            existing[name].wordIndex,
                            incoming[name].wordIndex
                        );
                    }
                }
            }

            writePlayers(merged);
            sendJSON(res, 200, { success: true });
        } else {
            sendJSON(res, 405, { error: 'Method not allowed' });
        }
    } else {
        sendJSON(res, 404, { error: 'Not found' });
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`MergingGame sync server running on port ${PORT}`);
});
