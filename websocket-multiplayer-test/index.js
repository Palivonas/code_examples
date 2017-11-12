const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');
const randomColor = require('randomcolor');

const app = express();

app.use('/static', express.static('static'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/static/index.html');
});

const server = http.createServer(app);
const wss = new WebSocket.Server({server});

const players = [];
let playerCount = 0;

function updatePlayer (player) {
    send(player, 'playerList', players);
}

function updateOthers (self) {
    for (const player of players.filter(player => player != self)) {
        updatePlayer(player)
    }
}

function updateEveryone () {
    for (const player of players) {
        updatePlayer(player);
    }
}

function send (player, type, message) {
    player.ws.send(JSON.stringify({
        type: type,
        message: message
    }));
}

wss.on('connection', function (ws) {
    ++playerCount;
    let name = decodeURIComponent(ws.upgradeReq.url).substring(1);
    if (players.find(player => player.name === name)) {
        name += ' ' + playerCount;
    }
    const player = {
        position : {
            x: (playerCount + 1) * 10,
            y: (playerCount + 1) * 10
        },
        name: name,
        color: randomColor({
            luminosity: 'light'
        })
    };
    Object.defineProperty(player, 'ws', {
        enumerable: false,
        value: ws
    });
    players.push(player);
    console.log(`${player.name} connected`);

    ws.on('message', function (message) {
        // console.log(`${player.name} moved ${message}`);
        player.position = JSON.parse(message);
        updateOthers(player);
    });

    ws.on('close', () => {
        console.log(`${player.name} disconnected`);
        players.splice(players.indexOf(player), 1);
        updateEveryone();
    });
    
    send(player, 'yourName', player.name);

    updateEveryone();
});

server.listen(5000, '0.0.0.0', function () {
    console.log('Listening on %d', server.address().port);
});