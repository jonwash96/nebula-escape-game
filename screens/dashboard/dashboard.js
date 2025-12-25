import Player from "../../game/Player.js";
import BOT from "../../../engine/BOT.js";
import { config } from "../../game/config.js";
import { remap } from "../../../engine/utils/math.js";
import { ships } from "../../../game/ships.js";
import { nav } from "../../nav_dev.js";nav();

// const targetingSystem = document.getElementById('load-targeting-System');
let activeProjection;
const status = {mode:'place-ships'};
let p1UserConfig, p2UserConfig;

const headerEl = document.getElementById('game-status-header');

const p1 = {
    status:null,
    boardEl: document.getElementById('p1-board'),
    gameSummaryPanel: document.getElementById('p1-summary-text-overlay'),
    shipsPanel: document.getElementById('p1-ships-text-overlay'),
    shipsPanelShips: document.querySelector('#p1-ships-text-overlay .ships'),
    statusPanel: document.getElementById('p1-status-text-overlay'),
    shipsPanelBtn: document.getElementById('p1-ships-btn'),
}

const p2 = {
    status:null,
    boardEl: document.getElementById('p2-board'),
    gameSummaryPanel: document.getElementById('p2-summary-text-overlay'),
    shipsPanel: document.getElementById('p2-ships-text-overlay'),
    shipsPanelShips: document.querySelector('#p2-ships-text-overlay .ships'),
    statusPanel: document.getElementById('p2-status-text-overlay'),
    shipsPanelBtn: document.getElementById('p2-ships-btn'),
    ships: {
        enterprise: document.querySelector('#enterprise'),
        titan: document.querySelector('#titan'),
        wallenberg: document.querySelector('#wallenberg'),
        lasirena: document.querySelector('#lasirena'),
        shuttle: document.querySelector('#shuttle')
    },
    projections: {
        enterprise: document.querySelector('#enterprise-projection'),
        titan: document.querySelector('#titan-projection'),
        wallenberg: document.querySelector('#wallenberg-projection'),
        lasirena: document.querySelector('#lasirena-projection'),
        shuttle: document.querySelector('#shuttle-projection')
    },
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
                setTimeout(()=>player.board.setShipToPlace(allShips[i],resolve,reject).bind(player.board), 50);
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
            readyPlayerX = () => resolve(mode('ready',player));
            usr && (autoLoadShipsCurry = (e) => autoLoadShips(player,e));
            usr && player.shipsPanelBtn.addEventListener('click', autoLoadShipsCurry);
            if (!usr) {player.player.mode('place-ships',{readyPlayerX, player})};
        });
    }
}

function saveState(player, option) {
    const useErrorSafe = sessionStorage.getItem('useErrorSafe');
    headerEl.textContent = "Saving. . .";
    player.player.updateHistory();

    if (option === 'init') {
        if (useErrorSafe) alert("STORAGE ERROR DETECTED! Please Check the dev console for more info. (Tools > Toggle Developer Tools)");
        const playerState = {
            winner:'user',
            narrative: { goto:'intro',
                path: {duty:0,courage:0} }
        };
        sessionStorage.setItem('storyModePlayer', playerState);
    }
}

function gotoNarrative() {
    window.location = "http://127.0.0.1:5500/screens/narrative/narrative.html"
}

function getState(option) {
    switch (option) {
        case 'init': {
            p1UserConfig = JSON.parse(localStorage.getItem('player1'));
            p2UserConfig = JSON.parse(localStorage.getItem('player2'));
        } break;
        case 'storyModePlayer': {return localStorage.getItem('storyModePlayer')}
    }
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
    // LOAD CONFIG
    getState('init');

    // CREATE CLASSES
    p1.player = new Player(p1UserConfig, p1.boardEl, {follow:false,enableTargeting:false});
    p1.board = p1.player.board;
    await p1.board.render();
    if (p2UserConfig.name === "BOT") {
        p2.player = new BOT(p2UserConfig, p2.boardEl,{follow:false,enableTargeting:false});
        p2.board = p2.player.board;
        await p2.board.render();
    } else {
        p2.player = new Player(p2UserConfig, p2.boardEl,{follow:false,enableTargeting:false});
        p2.board = p2.player.board;
        await p2.board.render();
    }
    
    // REFF DOM
    buttons.switchUser.textContent = 'done';
    buttons.orient.classList.add('clickable');
    buttons.switchUser.classList.add('clickable');

    // INIT PLAYER SPECIFFIC ITEMS
    [p1,p2].forEach(player => {
        // BUILD SHIPS
        player.shipsPanelShips.classList.add(player.player.side)
        Object.values(player.player.ships).forEach(ship => {
            const wrapper = document.createElement('div');
                wrapper.innerHTML = ship.projection;
                wrapper.id = ship.name;
                wrapper.classList.add('ship');
                wrapper.setAttribute('owner', player===p1 ? 'p1' : 'p2');
                player.shipsPanelShips.appendChild(wrapper);
        });
    
        // HANDLE EVENTS
        buttons.orient.addEventListener('click', (e)=>player.boardEl.classList.toggle('rotate'));
        document.addEventListener('mousemove',(e)=>{
            // handleMouseMove(e)
            const elements = document.elementsFromPoint(e.clientX,e.clientY);
            // console.log(elements)//!
            if (elements.includes(p1.shipsPanel) 
                | elements.includes(p2.shipsPanel) 
                | elements.includes(buttons.dbControlsGrid)) {
                document.querySelector('main').style.pointerEvents = 'none';
            } else {document.querySelector('main').style.pointerEvents = 'all';}
        });
    })

    // SET MODE
    mode('place-ships');
}

// MODE
async function mode(option,player,data) {
    console.log("Dashboard Mode Set:", option, player?.username, data);
    status.mode = option;
    switch (option) {
        case 'init': {await init();}
        case 'place-ships': {placeShips()} break;
        case 'ready': { player.status = 'ready'; 
            if (p1.status === 'ready' && p2.status === 'ready') {
                if (getState('storyModePlayer')) {
                    player.board.mode('static');
                    saveState(player);
                    player.player.storyMode && gotoNarrative();
                } else mode('begin-game');
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

mode('init');



