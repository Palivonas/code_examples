let savedName = localStorage.getItem('name') || '';
const playerName = prompt("Enter your name:", savedName) || "John Doe";
localStorage.setItem('name', playerName);
const socket = new WebSocket(`ws://${document.domain}:${document.location.port || 80}/${playerName}`);

let players = [];
const blocks = {};
let name;
let self;
const gameContainer = document.getElementById('container');
let touchSupported = false;
let mouseIsDown = false;

// socket.onopen = (event) => {
//     console.log('Connected');
// };

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'playerList') {
        players = data.message;
        self = getSelf();
        updateGame();
    }
    if (data.type === 'yourName') {
        name = data.message;
    }
};

function updateServer () {
    socket.send(JSON.stringify(self.position));
}

function updateGame () {
    for (const player of players) {
        let block = blocks[player.name];
        if (!blocks[player.name]) {
            block = document.createElement('div');
            block.setAttribute('class', 'player');
            block.style.background = player.color;
            block.innerHTML = player.name;

            blocks[player.name] = block;
            gameContainer.appendChild(block);
        }
        block.style.top = player.position.y;
        block.style.left = player.position.x;
    }
    for (const name in blocks) {
        if (blocks.hasOwnProperty(name)) {
            if (!players.find(player => player.name === name)) {
                blocks[name].remove();
                delete blocks[name];
            }
        }
    }
}

function getSelf () {
    return players.find(player => player.name === name);
}

function move (x, y) {
    setPosition(self.position.x + x, self.position.y + y);
}

function setPosition (x, y) {
    self.position.x = x;
    self.position.y = y;
    updateGame();
    updateServer();
}

const keysToDirections = {
    KeyW: {x: 0, y: -1},
    KeyS: {x: 0, y: 1},
    KeyA: {x: -1, y: 0},
    KeyD: {x: 1, y: 0}
};

document.body.addEventListener('keypress', event => {
    const direction = keysToDirections[event.code];
    if (!direction) {
        return;
    }
    move(direction.x * 5, direction.y * 5);
});

document.body.addEventListener('mousedown', () => {
    mouseIsDown = true;
    if (!touchSupported) {
        setPosition(event.pageX - 35, event.pageY - 35);
    }
});

document.body.addEventListener('mouseup', () => {
    mouseIsDown = false;
});

document.body.addEventListener('mousemove', event => {
    if (!touchSupported && mouseIsDown) {
        setPosition(event.pageX - 35, event.pageY - 35);
    }
});

document.body.addEventListener('touchstart', event => {
    if (!touchSupported) {
        touchSupported = true;
    }
    setPosition(event.touches[0].pageX - 35, event.touches[0].pageY - 35);
});

document.body.addEventListener('touchmove', event => {
    setPosition(event.touches[0].pageX - 35, event.touches[0].pageY - 35);
});
