import Player from "../../game/Player.js";
import BOT from "../../../engine/BOT.js";
import { config } from "../../game/config.js";
import { remap } from "../../../engine/utils/math.js";
import { ships } from "../../../game/ships.js";
import { nav } from "../../nav_dev.js";nav();

// const targetingSystem = document.getElementById('load-targeting-System');
let activeProjection;
const status = {mode:'init'};
let domSet = false;
let winner;

const headerEl = document.getElementById('game-status-header');

const p1 = {
    status:null,
    config:null,
    boardEl: document.getElementById('p1-board'),
    gameSummaryPanel: document.getElementById('p1-summary-text-overlay'),
    shipsPanel: document.getElementById('p1-ships-text-overlay'),
    shipsPanelShips: document.querySelector('#p1-ships-text-overlay .ships'),
    statusPanel: document.getElementById('p1-status-text-overlay'),
    shipsPanelBtn: document.getElementById('p1-ships-btn'),
}

const p2 = {
    status:null,
    config:null,
    boardEl: document.getElementById('p2-board'),
    gameSummaryPanel: document.getElementById('p2-summary-text-overlay'),
    shipsPanel: document.getElementById('p2-ships-text-overlay'),
    shipsPanelShips: document.querySelector('#p2-ships-text-overlay .ships'),
    statusPanel: document.getElementById('p2-status-text-overlay'),
    shipsPanelBtn: document.getElementById('p2-ships-btn'),
}

const buttons = {
    dbControlsGrid: document.getElementById('db-controls-grid'),
    fire: document.getElementById('btn-fire'),
    focusPlayer: document.getElementById('btn-focus-player'),
    focusEnemy: document.getElementById('btn-focus-enemy'),
    fullBoard: document.getElementById('btn-full-board'),
    pause: document.getElementById('btn-pause'),
    orient: document.getElementById('btn-orient'),
    switchUser: document.getElementById('btn-switch-user'),
    turnTimer: {
        target: document.getElementById('turn-timer'),
        start() {
            this.reset();
            this.target.textContent = config.turnTimer;
        },
        reset() {this.target.textContent = '00:00.00'},
    },
}

let autoLoadShipsCurry = () => {};
let readyPlayerX = () => {};

async function placeShipsClick(e) {
    const which = e.target.getAttribute('owner').match('p1') ? p1 : p2;
    if (e.target.classList.contains('ship')) {
        const ship = which.player.ships[e.target.id];
        if (!ship.location) {
            await new Promise((resolve,reject) => {
                which.board.setShipToPlace(ship,resolve,reject);
            });
            e.target.classList.add('brkt-placed-ship');
            console.log("Ship's placement location:", which.board.cells[ship.location[0]].classList[0])
        }
        if (Object.values(which.player.ships).every(ship=>ship.location)) {
            which.shipsPanelBtn.classlist.replace('blue', 'red');
            which.shipsPanelBtn.textContent = "Done";
            which.shipsPanelBtn.removeEventListener('click', autoLoadShipsCurry);
            which.shipsPanelBtn.addEventListener('click', readyPlayerX);
        }
    }
}

async function autoLoadShips(player) {
    const allShips = Object.values(player.player.ships);
    for (let i = 0; i < allShips.length; i++) {
        console.log("ITERATOR", i, "allShips", allShips.length)
        if (!allShips[i].location) {
            await new Promise((resolve,reject) => {
                setTimeout(()=>player.board.setShipToPlace(allShips[i],resolve,reject), 50);
            });
            console.log("Ship's placement location", allShips[i]);
        }
    }
    if (player.name !== "BOT") {
        player.shipsPanelBtn.classList.replace('blue', 'red');
        player.shipsPanelBtn.textContent = "Done";
        player.shipsPanelBtn.removeEventListener('click', autoLoadShipsCurry);
        player.shipsPanelBtn.addEventListener('click', readyPlayerX);
    }
    console.log("All Ships Placed. Awaiting opponent place ships.");
}

async function placeShips() {
    let usr = true;
    for (let player of [p1,p2]) {
        setActiveBoard(player);
        if (player.player.name==='BOT') {usr = false};
        headerEl.textContent = `${player.player.name} Place Ships`;
        usr && Array.from(player.shipsPanelShips.children)
            .forEach(ship=>{
                ship.classList.add('clickable');
                ship.addEventListener('click', placeShipsClick)
            });
        await new Promise(resolve => {
            player.board.mode('place-ships');
            usr && player.targetingEnabled && enableTargeting();
            player.status = 'place-ships';
            usr && player.shipsPanelBtn.classList.add('blue');
            usr && (player.shipsPanelBtn.textContent = "Auto");
            usr && player.shipsPanelBtn.classList.remove('hide');
            usr && player.shipsPanelBtn.classList.add('clickable');
            readyPlayerX = () => {usr && player.shipsPanelBtn.classList.toggle('hide'); 
                resolve(mode('ready',player))};
            usr && (autoLoadShipsCurry = (e) => autoLoadShips(player,e));
            usr && player.shipsPanelBtn.addEventListener('click', autoLoadShipsCurry);
            if (!usr) {player.player.mode('place-ships',{readyPlayerX, player})};
        });
    }
}

function gotoNarrative() {
    window.location = "http://127.0.0.1:5500/screens/narrative/narrative.html"
}

function setActiveBoard(player) {
    console.log("setActiveBoard("+player+")")
    player.board.root.classList.add('active-board');
    player.board.boardNumber === 1
        ? p2.board.root.classList.remove('active-board')
        : p1.board.root.classList.remove('active-board');
}


// INIT
async function init() {
    let bot = false;
console.log(p1.config)
console.log(p2.config)
    // CREATE CLASSES
    p1.player = new Player(p1.config, p1.boardEl, {follow:false,enableTargeting:false});
    p1.board = p1.player.board;
    await p1.board.render();
    if (p2.config.name === "BOT") {
        bot = true;
        p2.player = new BOT(p2.config, p2.boardEl,{follow:false,enableTargeting:false});
        p2.board = p2.player.board;
        await p2.board.render();
    } else {
        p2.player = new Player(p2.config, p2.boardEl,{follow:false,enableTargeting:false});
        p2.board = p2.player.board;
        await p2.board.render();
    }
    console.log(p1.player)
    console.log(p2.player)

    // REFF DOM
    console.log("Setup DOM");
    !bot && (buttons.switchUser.textContent = 'Switch User');
    buttons.orient.classList.add('clickable');
    !bot && buttons.switchUser.classList.add('clickable');

    // INIT PLAYER SPECIFFIC ITEMS
    [p1,p2].forEach(player => {
        // BUILD SHIPS
        player.shipsPanelShips.classList.add(player.player.side)
        Object.values(player.player.ships).forEach(ship => {
            const wrapper = document.createElement('div');
                wrapper.innerHTML = ship.projection;
                wrapper.id = ship.name;
                wrapper.title = ship.name;
                wrapper.classList.add('ship');
                wrapper.setAttribute('owner', player===p1 ? 'p1' : 'p2');
                player.shipsPanelShips.appendChild(wrapper);
        });
    
        // HANDLE EVENTS
        buttons.orient.addEventListener('click', (e)=>player.boardEl.classList.toggle('rotate'));
        document.addEventListener('mousemove', (e) => {
            // handleMouseMove(e)
            const elements = document.elementsFromPoint(e.clientX,e.clientY);
            // console.log(elements)//!
            if (elements.includes(p1.shipsPanel) 
                | elements.includes(p2.shipsPanel) 
                | elements.includes(buttons.dbControlsGrid)) {
                document.querySelector('main').style.pointerEvents = 'none';
            } else {document.querySelector('main').style.pointerEvents = 'all';}
        });
    });
    console.log("Init Done");
    return domSet = true;
};

function getState(option) {
    switch (option) {
        case 'gameMode': {return sessionStorage.getItem('gameMode')}; break;
        case 'storyModePlayer': {return sessionStorage.getItem('storyModePlayer')}
        case 'init-profiles': {
            p1.config = JSON.parse(sessionStorage.getItem('player1'));
            p2.config = JSON.parse(sessionStorage.getItem('player2'));
        } break;
        case 'profiles': {
            const player1 = JSON.parse(sessionStorage.getItem('player1'))
            const player2 = JSON.parse(sessionStorage.getItem('player2'))
            if (player1.location === 'local') {
                p1.config = JSON.parse(localStorage.getItem(player1.user));
            } else {p1.config = JSON.parse(sessionStorage.getItem(player1.user));}
            if (player2.location === 'local') {
                p2.config = JSON.parse(localStorage.getItem(player2.user));
            } else {p2.config = JSON.parse(sessionStorage.getItem(player2.user));}
        } break;
    }
}

function saveState(player, option) {
    const useErrorSafe = sessionStorage.getItem('useErrorSafe');
    headerEl.textContent = "Saving. . .";
    switch (option) {
        case 'full': { console.log("SaveState full", p1.player.storageEnabled, p2.player.storageEnabled)
            if (p1.player.storageEnabled) {
                localStorage.setItem(p1.player.username, JSON.stringify(p1.player))
            } else {sessionStorage.setItem(p1.player.username, JSON.stringify(p1.player))}
            if (p2.player.storageEnabled) {
                localStorage.setItem(p2.player.username, JSON.stringify(p2.player))
            } else {sessionStorage.setItem(p2.player.username, JSON.stringify(p2.player))}
        } break;
        case 'player-lookup': {
            sessionStorage.setItem( 'player1', JSON.stringify({user:p1.config.username, location:p1.config.storageEnabled ? 'local' : 'session'}) );
            sessionStorage.setItem( 'player2', JSON.stringify({user:p2.config.username, location:p2.config.storageEnabled ? 'local' : 'session'}) );
            delete p1.config;
            delete p2.config;
        }
    }
}

// MODE
async function mode(option,player,data) {
    // !domSet && setupDom();
    console.log("Dashboard Mode Set:", option, player?.username, data);
    let usr = !player?.player.name === 'BOT'
    status.mode = option;

    switch (option) {
        case 'init': {
            getState('init-profiles');
            await init();
            saveState([p1,p2],'full');
            saveState([p1,p2],'player-lookup');
            getState('storyModePlayer')
                ? gotoNarrative()
                : mode('place-ships');
        } break;
        case 'place-ships': {
            getState('profiles');
            await init();
            placeShips();
        }; break;
        case 'ready': { player.status = 'ready'; 
            if (p1.status === 'ready' && p2.status === 'ready') {
                [p1,p2].forEach(p=>saveState('full'));
                if (getState('storyModePlayer')) gotoNarrative();
                    else mode('begin-game');
            };
        } break;
        case 'begin-game': {
            [p1,p2].forEach(player=>player.status = 'play');
            setActiveBoard(p1);
            mode('attack',p1);
        } break;
        case 'attack': {} break;
        case 'story': {} break;
        case 'pause': {} break;

        default: return status.mode;
    }
}

// RUN
mode(getState('gameMode'));