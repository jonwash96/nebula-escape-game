import Player from "../../game/Player.js";
import BOT from "../../../engine/BOT.js";
import { nav } from "../../nav_dev.js";nav();

// MINI-MODS
class Signal {
    constructor(resolver,rejector,destination) {
        this.resolver = resolver;
        this.rejector = rejector;
        this.destination = destination;
    }
    send() { const self = this;
        new Promise((resolve,reject) => { console.log("Send Signal", this.resolver, this,this.rejector, this.destination)
        const onResolve = (...args) => resolve(self.resolver(...args));
        const onReject = (...args) => reject(self.rejector(...args));
        this.destination.signal.set(onResolve,onReject);
        })
        // .then(()=>this.send())
    }
}

// OBJ
let status = {
    mode:null,
    gameKey:null,
    shipsPlaced:false, firstBlood:false, firstSunkenShip:false, turningPoint:false, victoryInSight:false, winGame:false,
    winner:null,
    goto:'firstBlood',
    activeBoard:null,
    turn:null,
    turnsTaken: {
        player1: [0,0], /*[turns taken, turns taken since last hit]*/
        player2: [0,0],
    },
};

// DOM
const headerEl = document.getElementById('game-status-header');
const loadTargetingSystem = document.getElementById('load-targeting-system');

const modals = {
    info: {
        target: document.getElementById('db-info-modal'),
        listen() {this.target.children[3].children[0].addEventListener('click', ()=>this.action())},
        show() {this.target.showModal()},
        action() {this.target.close()}
    },
    switchUser: {
        target: document.getElementById('db-switch-user-modal'),
        passwordUserMessage: "Enter your password to take your turn",
        noPasswordUserMessage: "Press the button 3X to take your turn",
        count: 0,
        listen() {this.target.children[4].children[0].addEventListener('click', ()=>this.action())},
        show() {
            this.count = 0;
            this.target.showModal();
            this.target.children[1].textContent = status.turn?.player?.name;
            if (status.turn?.player?.password) {
                this.target.children[2].textContent = this.passwordUserMessage;
                this.target.children[3].style.display = 'block';
            } else {
                this.target.children[2].textContent = this.noPasswordUserMessage;
                this.target.children[3].style.display = 'none';
            }
        },
        action(e) {
            if (status.turn?.player?.password) {
                if (this.target.children[3].value === status?.turn?.player?.password) {
                    this.target.close();
                } else {
                    this.target.children[2].style.color = "#f66";
                    this.target.children[2].textContent = "Password Incorrect! Please retry."
                }
            } else {
                this.count === 2 && this.target.close() && (this.count = 0);
                this.count++;
            }
        }
    }

}

const p1 = {
    status:null,
    config:null,
    boardEl: document.getElementById('p1-board'),
    gameSummaryPanel: document.getElementById('p1-summary-text-overlay'),
    shipsPanel: document.getElementById('p1-ships-text-overlay'),
    shipsPanelShips: document.querySelector('#p1-ships-text-overlay .ships'),
    shipsPanelBtn: document.getElementById('p1-ships-btn'),
    statusPanel: document.getElementById('p1-status-text-overlay'),
    targetingPanel: document.querySelector('#p1-status-text-overlay .targeting-panel'),
}

const p2 = {
    status:null,
    config:null,
    boardEl: document.getElementById('p2-board'),
    gameSummaryPanel: document.getElementById('p2-summary-text-overlay'),
    shipsPanel: document.getElementById('p2-ships-text-overlay'),
    shipsPanelShips: document.querySelector('#p2-ships-text-overlay .ships'),
    shipsPanelBtn: document.getElementById('p2-ships-btn'),
    statusPanel: document.getElementById('p2-status-text-overlay'),
    targetingPanel: document.querySelector('#p2-status-text-overlay .targeting-panel'),
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
    toggleSubspace: document.getElementById('toggle-subspace'),
    turnTimer: {
        target: document.getElementById('turn-timer'),
        start() {
            this.reset();
            this.target.textContent = config.turnTimer;
        },
        reset() {this.target.textContent = '00:00.00'},
    },
    enable(button){this[button].classList.replace('disabled', 'active')},
    disable(button){this[button].classList.replace('active', 'disabled')},
}

// FUNC
let autoLoadShipsCurry = () => {};
let readyPlayerX = () => {};

async function placeShipsClick(e) {
    const which = e.target.getAttribute('owner').match('p1') ? p1 : p2;
    if (e.target.classList.contains('ship')) {
        const ship = which.player.ships[e.target.id];
        if (!ship.location) {
            await new Promise((resolve) => {
                which.board.setShipToPlace(ship,resolve);
            });
            e.target.classList.add('brkt-placed-ship');
            console.log("Ship's placement location:", which.board.cells[ship.location[0]].target.classList[0])
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
    const keys = Object.keys(player.player.ships);
    const allShips = player.player.ships;
    for (let i = 0; i < keys.length; i++) {
        console.log("ITERATOR", i, "allShips", allShips.length)
        if (!allShips[keys[i]].location) {
            await new Promise((resolve,reject) => {
                setTimeout(()=>player.board.setShipToPlace(allShips[keys[i]],resolve,reject), 50);
            });
            allShips[keys[i]].classList.add('brkt-placed-ship');
            console.log("Ship's placement location", allShips[keys[i]]);
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
    for (let player of [p1,p2]) {
        let usr = true;
        setActiveBoard(player, 'place-ships', 'static');
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

function setActiveBoard(player,activeBoardMode, otherBoardMode) {
    console.log("setActiveBoard("+player.name+")")
    player.board.root.classList.add('active-board');
    activeBoardMode && player.board.mode(activeBoardMode)

    if (player.board.boardNumber === 1) {
        p2.board.root.classList.remove('active-board');
        otherBoardMode && p2.board.mode(otherBoardMode);
        p1.board.setBracketOffset('left');
        status.activeBoard = p1.board;
    } else {
        p1.board.root.classList.remove('active-board');
        otherBoardMode && p1.board.mode(otherBoardMode);
        p2.board.setBracketOffset('right');
        status.activeBoard = p2.board;
    }
}

const weapons = {
    count:0,
    max:5,
    evt:null,
    shipName() {return this.evt.target.getAttribute('for')},
    weapon() {
        const playerWeapons =  status.turn.player.ships[this.shipName()].weapons;
        const weaponName = this.evt.target.title;
        return playerWeapons[weaponName];
    },
    async set(e) {
        console.log("weapons.set("+e+")");
        if (!e.target.classList.contains('weapon-symbol')) return;
        // this.evt = e; 

        const shipName = e.target.getAttribute('for');

        const weapon = () => {
            const playerWeapons =  status.turn.player.ships[shipName].weapons;
            const weaponName = e.target.title;
            return playerWeapons[weaponName];
        };
        
        if (weapon().remaining===0) return;

        if (e.target.classList.contains('selected-weapon')) {
            e.target.classList.remove('selected-weapon');
            return;
        } else {e.target.classList.add('selected-weapon')};
    
        const originCell = () => {
            const player = status.turn.player; 
            const id = player.ships[shipName].location[0];
            return player.board.cells[id];
        };
    
        const handleColor = (weaponMaxed) => {
            console.log("handleColor()");
            weaponMaxed && e.target.classList.add('maxed-weapon');
            weapon().remaining===0
                ? e.target.classList.replace('selected-weapon', 'depleated-weapon')
                : e.target.classList.remove('selected-weapon');
        };
    
        const checkDone = (option, count, weapon) => {
            console.log("checkDone()");
            console.log("weapon remaining: ", weapon.remaining);
            switch (option) {
                case 'add': { this.count++; 
                    typeof weapon.remaining==='number' && (weapon.remaining--);
                    if (this.count===this.max) { buttons.enable('fire'); handleColor();
                        Array.from(status.turn.targetingPanel.children).forEach(weapon => {
                            weapon.classList.remove('maxed-weapon')
                        })
                    };
                    console.log("Placed: ", this.count, "Allowed: ", weapon.max, "Remaining: ",weapon.remaining)
                } break;
                case 'remove': {this.count--; weapon.remaining++} break;
            }
        };

        new Signal(
            (count,weapon)=>checkDone('add',count,weapon),
            (count,weapon)=>checkDone('remove',count,weapon),
            status.activeBoard
        ).send();
        
        await new Promise((resolve,reject) => {
            console.log("Promise Snet:",weapon(),originCell())
            const onResolve = () => { handleColor(true); resolve() };
            const onReject = () => { handleColor(); reject() };
            status.activeBoard.placeItem.set(weapon(), onResolve, onReject, originCell());
        });
        console.log("Weapon Max Reached for turn.")
    }
}

async function handleFire() {
    weapons.count = 0;
    await new Promise((resolve) => {
        mode('fire'); // Handle subspace
        status.turn = p1 
            ? p2.board.handeFire(p2.player.ships, resolve) 
            : p1.board.handeFire(p1.player.ships, resolve);
    })
}


// INIT
async function init() {
    let bot = false;
    // CREATE CLASSES
    if (p1.config.name === "BOT") {
        bot = true;
        p1.player = new BOT(p1.config, p1.boardEl,{follow:false,enableTargeting:false});
        p1.board = p1.player.board;
        await p1.board.render();
    } else {
        p1.player = new Player(p1.config, p1.boardEl, loadTargetingSystem, {follow:false,enableTargeting:true});
        p1.board = p1.player.board;
        await p1.board.render();
    }
    if (p2.config.name === "BOT") {
        bot = true;
        p2.player = new BOT(p2.config, p2.boardEl,{follow:false,enableTargeting:false});
        p2.board = p2.player.board;
        await p2.board.render();
    } else {
        p2.player = new Player(p2.config, p2.boardEl, loadTargetingSystem, {follow:false,enableTargeting:true});
        p2.board = p2.player.board;
        await p2.board.render();
    }

    // REFF DOM
    console.log("Setup DOM");
    !bot && (buttons.switchUser.textContent = 'Switch User');
    buttons.orient.classList.add('clickable');
    !bot && buttons.switchUser.classList.add('clickable');

    // EVENT LISTENERS
    for (let modal in modals) {modals[modal].listen()};
    buttons.switchUser.addEventListener('click', modals.switchUser.show.bind(modals.switchUser));
    buttons.toggleSubspace.addEventListener('click', ()=>{
        status.turn === p1
            ? p1.board.mode('toggle-subspace')
            : p2.board.mode('toggle-subspace');
    });
    buttons.fire.addEventListener('click', handleFire);

    // INIT PLAYER SPECIFFIC ITEMS
    [p1,p2].forEach(player => {
        player.gameSummaryPanel.innerHTML = player.player.name;
        // BUILD SHIPS ON Dashboard
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
        
        // BUILD TARGETING PANEL
        player.targetingPanel.classList.add(player.player.side)
        Object.values(player.player.ships).forEach(ship => {
            const row = document.createElement('div');
                row.classList.add('targeting-group');
            const shipWrapper = document.createElement('div');
                shipWrapper.innerHTML = ship.projection;
                shipWrapper.id = ship.name;
                shipWrapper.title = ship.name;
                shipWrapper.classList.add('ship');
                shipWrapper.setAttribute('owner', player===p1 ? 'p1' : 'p2');
            const weapons = document.createElement('div');
                weapons.classList.add('weapons');
                Object.values(ship.weapons).forEach(weapon => {
                    const get = (item) => player.player.shipsClass.getWeaponSymbol(item);
                    const img = document.createElement('div')
                        img.innerHTML = get(weapon.name);
                        img.setAttribute('title', weapon.name);
                        img.setAttribute('for', ship.name);
                        img.classList.add('weapon-symbol');
                        weapons.appendChild(img);
                })
                row.appendChild(shipWrapper)
                row.appendChild(weapons);
                player.targetingPanel.appendChild(row);
        });
    
        // HANDLE EVENTS
        buttons.orient.addEventListener('click', (e)=>player.boardEl.classList.toggle('rotate'));
        document.addEventListener('mousemove', (e) => {
            // handleMouseMove(e)
            const elements = document.elementsFromPoint(e.clientX,e.clientY);
            // console.log(elements)//!
            if (elements.includes(p1.shipsPanel) 
                | elements.includes(p2.shipsPanel) 
                | elements.includes(p1.statusPanel) 
                | elements.includes(p2.statusPanel) 
                | elements.includes(buttons.dbControlsGrid)) {
                document.querySelector('main').style.pointerEvents = 'none';
            } else {document.querySelector('main').style.pointerEvents = 'all';}
        });
    });
    console.log("Init Done");
    return;
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
            } else {p1.config = JSON.parse(sessionStorage.getItem(player1.user))};
            if (player2.location === 'local') {
                p2.config = JSON.parse(localStorage.getItem(player2.user));
            } else {p2.config = JSON.parse(sessionStorage.getItem(player2.user))};
            status = JSON.parse(sessionStorage.getItem('gameState'));
        } break;
    }
}

function saveState(option) {
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
            sessionStorage.setItem('gameState', JSON.stringify(status))
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
    console.log("Dashboard Mode Set:", option, player?.username, data);
    // let usr = !player?.player.name === 'BOT'
    status.mode = option;

    switch (option) {
        case 'init': {
            getState('init-profiles');
            await init();
            saveState('full');
            saveState('player-lookup');
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
                saveState('full');
                getState('storyModePlayer')
                ? gotoNarrative()
                : mode('place-ships');
            };
        } break;
        case 'begin-game': { headerEl.innerHTML = "loading. . .";
            getState('profiles');
            await init();
            status.mode = 'play';
            [p1,p2].forEach(player=>player.status = 'play');
            mode('targeting',p1,p2);
        } break;
        case 'targeting': { headerEl.innerHTML = player.player.name+" Is Targeting"
            status.turn = player; console.log("turn", status.turn.player)
            setActiveBoard(data.player, 'targeting', 'static');
            player.targetingPanel.addEventListener('click', weapons.set.bind(weapons))
        } break;
        case 'attack': { headerEl.innerHTML = player.player.name+" Is Attacking"
            
        } break;
        case 'story': {} break;
        case 'pause': {} break;
        case 'summary': {} break;

        default: return status.mode;
    }
}

function checkGameState() {
    console.log("################ GAMESTATE ##################")
    console.log("First Blood condition Result",
        "Reducer: ", [p1.player.hits,p2.player.hits].reduce((acc,current) => {
                    acc += Object.values(current).length },0),
        "Logic: ",  !status.firstBlood
    )
    console.log("firstSunkenShip condition Result",
        "Hits length Matches area?: ", [Object.values(p1.player.ships),Object.values(p2.player.ships)].forEach(player => {
                player.forEach(ship => {if (ship.hits.length === ship.area()) {console.log(ship.hits.length)}})})
    )
    console.log("turningPoint condition Result",
        "Reducer: ", [Object.values(p1.player),Object.values(p2.player)]
                .reduce((acc,player) => player.ships.forEach(ship => {
                    if (ship.hits.length === ship.area()) acc[player.name]++
                }), {[p1.player.name]:0,[p2.player.name]:0})
    )
    console.log("victoryInSight condition Result",
        "Reducer: ", [Object.values(p1.player),Object.values(p2.player)]
                .reduce((acc,player) => player.ships.forEach(ship => {
                    if (ship.hits.length === ship.area()) acc[player.name]++
                }), {[p1.player.name]:0,[p2.player.name]:0})
    )
    console.log("winner condition Result",
        "Reducer: ", [Object.values(p1.player),Object.values(p2.player)]
                .reduce((acc,player) => player.ships.forEach(ship => {
                    if (ship.hits.length === ship.area()) acc[player.name]++
                }), {[p1.player.name]:0,[p2.player.name]:0})
    )
    console.log("################### END #####################")
    return;

    switch (status.goto) {
        case 'firstBlood': {
                if ( [p1.player.hits,p2.player.hits].reduce((acc,current) => {
                    acc += Object.values(current).length },0)
                > 1 && !status.firstBlood ) {
                    status.winner = status.turn;
                    status.firstBlood = true; 
                    status.goto = 'firstSunkenShip';
                    saveState('full');
                    gotoNarrative(/*part2*/) }
            } break;
        case 'firstSunkenShip': {
            [Object.values(p1.player.ships),Object.values(p2.player.ships)].forEach(player => {
                player.forEach(ship => {
                    if (ship.hits.length === ship.area()) {
                        status.winner = status.turn;
                        status.firstSunkenShip = true;
                        status.goto = 'turningPoint';
                        saveState('full');
                        gotoNarrative(/*part3*/);
                    }
                })
            })
        } break;
        case 'turningPoint': {
            const reduction = [Object.values(p1.player),Object.values(p2.player)]
                .reduce((acc,player) => player.ships.forEach(ship => {
                    if (ship.hits.length === ship.area()) acc[player.name]++
                }), {[p1.player.name]:0,[p2.player.name]:0});
            if (Object.values(reduction).some(result=>result>2)) {
                status.winner = status.turn;
                status.turningPoint = true;
                status.goto = 'victoryInSight';
                saveState('full');
                gotoNarrative(/*turningPoint*/);
            }
        } break;
        case 'victoryInSight': {
            const reduction = [Object.values(p1.player),Object.values(p2.player)]
                .reduce((acc,player) => player.ships.forEach(ship => {
                    if (ship.hits.length === ship.area()) acc[player.name]++
                }), {[p1.player.name]:0,[p2.player.name]:0});
            if (Object.values(reduction).some(result=>result>3)) {
                status.winner = status.turn;
                status.victoryInSight = true;
                status.goto = 'winner';
                saveState('full');
                gotoNarrative(/*victoryInSight*/);
            }
        } break;
        case 'winGame': {
            const reduction = [Object.values(p1.player),Object.values(p2.player)]
                .reduce((acc,player) => player.ships.forEach(ship => {
                    if (ship.hits.length === ship.area()) acc[player.name]++
                }), {[p1.player.name]:0,[p2.player.name]:0});
            if (Object.values(reduction).some(result=>result===5)) {
                status.winner = status.turn;
                status.winGame = true;
                status.goto = 'summary';
                saveState('full');
                winGame();
                gotoNarrative(/*Q's Riddle*/);
            }
        } break;
    }
}

// RUN
mode(getState('gameMode'));