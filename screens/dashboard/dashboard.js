import Player from "../../game/Player.js";
import BOT from "../../../engine/BOT.js";
import { nav } from "../../nav_dev.js";nav();
import { rayIntersect,cellDistance,parse } from "../../engine/utils/math.js";

// BUS
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
const state = {
    mode:null,
    gameKey:null,
    gameState: {
        goto:'firstBlood',
        shipsPlaced:false, 
        firstBlood:false, 
        firstSunkenShip:false, 
        turningPoint:false, 
        victoryInSight:false, 
        winGame:false,
        turnsTaken: {
            player1: [0,0], /*[turns taken, turns taken since last hit]*/
            player2: [0,0],
        },
    },
    winner:null,
    activeBoard:null,
    turn:null,
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
            this.target.children[1].textContent = state.turn?.player?.name;
            if (state.turn?.player?.password) {
                this.target.children[2].textContent = this.passwordUserMessage;
                this.target.children[3].style.display = 'block';
            } else {
                this.target.children[2].textContent = this.noPasswordUserMessage;
                this.target.children[3].style.display = 'none';
            }
        },
        action(e) {
            if (state.turn?.player?.password) {
                if (this.target.children[3].value === state?.turn?.player?.password) {
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
    },
    instance: {
        target: document.getElementById('db-instance-modal'),
        title: document.querySelector('#db-instance-modal .title'),
        subhead: document.querySelector('#db-instance-modal .subhead'),
        message: document.querySelector('#db-instance-modal .message'),
        button: document.querySelector('#db-instance-modal button'),
        action: null,
        count:0,
        listen() {this.button.addEventListener('click', this.action)},
        show(config,options) {
            this.options?.resetCount && (this.count = 0);
            ['title', 'subhead', 'message', 'button']
                .forEach(item=>config[item] && (this[item].innerHTML = config[item]))
            this.action = config.action || this.target.close();
            typeof this.action==='function' && this.button.addEventListener('click',this.action);
            this.target.showModal();
        },
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
    toggleSubspace: {
        target: document.getElementById('toggle-subspace'),
        text(msg) { msg 
            ? this.target.innerHTML = msg 
            : this.target.textContent = "Toggle Subspace";
        },
        action: (e)=>{buttons.toggleSubspace.default()},
        default() {state.turn.board.mode('toggle-subspace')}
    },
    devToggleOppSubspace: {
        target: document.getElementById('dev_toggle-opp-subspace'),
        text(msg) { msg 
            ? this.target.innerHTML = msg 
            : this.target.textContent = "devToggleOppSubspace";
        },
        action: (e)=>{buttons.devToggleOppSubspace.default()},
        default() {state.activeBoard.mode('toggle-subspace')}
    },
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

function gotoNarrative() {
    window.location = "http://127.0.0.1:5500/screens/narrative/narrative.html"
}

function setActiveBoard(player, activeBoardMode, option1, otherBoardMode, option2) {
    console.log("setActiveBoard("+player.player.name+" ("+player.player.playerNum+"))") //!
    const [px,py,offset] = player.player.playerNum===1 ? [p1,p2,'left'] : [p2,p1,'right'];

    state.activeBoard = px.board;
    px.board.mode(activeBoardMode, option1);
    px.board.target.classList.add('active-mode');
    px.board.setBracketOffset(offset);
    
    py.board.target.classList.remove('active-mode');
    py.board.mode(otherBoardMode, option2);
}

async function placeShips() {
    for (let player of [p1,p2]) {
        const usr = player.player.name!=='BOT';
        setActiveBoard(player, 'place-ships', null, 'static', 'subspace');
        headerEl.innerHTML = `<strong>${player.player.name}</strong> Placing Ships`;
        
        state.turn = player;
        player.status = 'place-ships';
        if (usr) {
            Array.from(player.shipsPanelShips.children)
                .forEach(ship => {
                    ship.classList.add('clickable');
                    ship.addEventListener('click', placeShipsClick)
                });
            player.shipsPanelBtn.classList.add('blue');
            player.shipsPanelBtn.textContent = "Auto";
            player.shipsPanelBtn.classList.remove('hide');
            player.shipsPanelBtn.classList.add('clickable');
        };

        await new Promise(resolve => {
            readyPlayerX = () => {
                usr && player.shipsPanelBtn.classList.toggle('hide'); 
                resolve(mode('ready',player))
            };
            autoLoadShipsCurry = (e) => autoLoadShips(player,e);
            usr && player.shipsPanelBtn.addEventListener('click', autoLoadShipsCurry);
            try{!usr && player.player.mode('place-ships',{readyPlayerX, player})}
            catch{null};
        });
    }
}

async function placeShipsClick(e) {
    if (!e.target.classList.contains('ship')) return;

    const ship = state.turn.ships[e.target.id];
    if (!ship.location) {
        await new Promise((resolve) => {
            state.activeBoard.placeItem.set(ship,resolve);
        });
        e.target.classList.add('placed-ship');
        console.log("Ship's placement location:", state.activeBoard.cells[ship.location[0]].target.classList[0]) //!
    }
    if (Object.values(state.turn.player.ships).every(ship=>ship.location)) {
        state.turn.shipsPanelBtn.classlist.replace('blue', 'red');
        state.turn.shipsPanelBtn.textContent = "Done";
        state.turn.shipsPanelBtn.removeEventListener('click', autoLoadShipsCurry);
        state.turn.shipsPanelBtn.addEventListener('click', readyPlayerX);
    }
}

async function autoLoadShips(player) {
    const keys = Object.keys(player.ships);
    const allShips = player.ships;
    for (let i = 0; i < keys.length; i++) {
        console.log("ITERATOR", i, "allShips", allShips.length);//!
        const ship = allShips[keys[i]];
        if (!allShips[keys[i]].location) {
            await new Promise((resolve,reject) => {
                setTimeout(()=>player.board.placeItem.set(ship,resolve,reject),50);
            });
            player.shipsPanel.querySelector(`#${ship.name}`).classList.add('placed-ship');
            console.log("Ship's placement location", ship); //!
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

const weapons = {
    count:0,
    max:5,
    prev:[],
    weapon() {
        const playerWeapons =  state.turn.player.ships[this.shipName()].weapons;
        const weaponName = this.evt.target.title;
        return playerWeapons[weaponName];
    },
    async set(e) {
        console.log("weapons.set("+JSON.stringify(e.target,null,2)+")");
        try {if (!e.target.classList.contains('weapon-symbol')) return;
        } catch (err) {if (err.message.includes("Cannot read properties of undefined")) return}

        const shipName = e.target.getAttribute('for');

        const weapon = () => {
            const playerWeapons =  state.turn.player.ships[shipName].weapons;
            const weaponName = e.target.title;
            return playerWeapons[weaponName];
        };
        
        if (weapon().remaining===0) return;
        this.prev.push(e);
        console.log("THIS IS PREV AT WRITE", this.prev);

        if (e.target.classList.contains('selected-weapon')) {
            e.target.classList.remove('selected-weapon');
            state.activeBoard.placeItem.clear();
            return;
        } else {e.target.classList.add('selected-weapon')};
    
        const originCell = () => {
            const player = state.turn.player; 
            console.log(player.ships)
            const id = player.ships[shipName].location[0];
            return player.board.cells[id];
        };
    
        const handleColor = (option) => {
            console.log("handleColor()");
            switch (option) {
                case 'maxed-weapon': e.target.classList.add('maxed-weapon'); break;
                case 'removed': e.target.classList.add('selectedWeapon'); break;
                default: weapon().remaining===0
                    ? e.target.classList.replace('selected-weapon', 'depleated-weapon')
                    : e.target.classList.remove('selected-weapon');
            }
        };
    
        const checkDone = (option, weapon) => {
            console.log("checkDone()");
            const self = this;
            switch (option) {
                case 'add': {this.count++; typeof weapon.remaining==='number' && weapon.remaining--;
                } break;
                case 'remove': { this.count--; weapon.remaining++; weapons.set(self.prev.pop())
                    console.log("THIS IS PREV AT READ", self.prev); 
                } break;
            }

            if (this.count===this.max) { buttons.enable('fire'); handleColor();
                Array.from(state.turn.targetingPanel.children).forEach(weapon => {
                    weapon.classList.remove('maxed-weapon')
                })
            } else {buttons.disable('fire')};
            console.log("Placed: ", this.count, "Allowed: ", weapon.max, "Remaining: ",weapon.remaining)
        };

        new Signal(
            (weapon)=>checkDone('add',weapon),
            (weapon,option)=>{checkDone('remove',weapon);handleColor(option)},
            state.activeBoard
        ).send();
        
        await new Promise((resolve,reject) => {
            console.log("Weapon Sent:",weapon(),originCell())
            const onResolve = () => { handleColor(true); resolve() };
            const onReject = () => { handleColor(); reject() };
            state.activeBoard.placeItem.set(weapon(), onResolve, onReject, originCell());
        });
        console.log("Weapon Max Reached for turn.")
    },
}

async function handleFire() {
    weapons.count = 0;
    state.activeBoard.signal.clear();
    await new Promise((resolve) => {
        state.turn===p1 
            ? p2.board.handleFire(p2.player.ships, resolve) 
            : p1.board.handleFire(p1.player.ships, resolve);
    })
}


// INIT
async function init() {
    const start = Date.now();
    let bot = false;
    // CREATE CLASSES
    if (p1.config.name === "BOT") {
        bot = true;
        p1.player = new BOT(p1.config, p1.boardEl,{follow:false,enableTargeting:false});
        p1.board = p1.player.board;
        p1.ships = p1.player.ships;
    } else {
        p1.player = new Player(p1.config, p1.boardEl, loadTargetingSystem, {follow:false,enableTargeting:true});
        p1.board = p1.player.board;
        p1.ships = p1.player.ships;
    }
    if (p2.config.name === "BOT") {
        bot = true;
        p2.player = new BOT(p2.config, p2.boardEl,{follow:false,enableTargeting:false});
        p2.board = p2.player.board;
        p2.ships = p2.player.ships;
    } else {
        p2.player = new Player(p2.config, p2.boardEl, loadTargetingSystem, {follow:false,enableTargeting:true});
        p2.board = p2.player.board;
        p2.ships = p2.player.ships;
    }

    // SETUP DOM
    console.log("Setup DOM");
    !bot && (buttons.switchUser.textContent = 'Switch User');
    buttons.orient.classList.add('clickable');
    !bot && buttons.switchUser.classList.add('clickable');

    // EVENT LISTENERS
    for (let modal in modals) {modals[modal].listen()};
    buttons.switchUser.addEventListener('click', modals.switchUser.show.bind(modals.switchUser));
    buttons.toggleSubspace.target.addEventListener('click', buttons.toggleSubspace.action);
    buttons.fire.addEventListener('click',()=>mode('attack'));

    buttons.devToggleOppSubspace.target.addEventListener('click', buttons.devToggleOppSubspace.action);

    // INIT PLAYER SPECIFFIC ITEMS
    [p1,p2].forEach(player => {
        player.gameSummaryPanel.innerHTML = player.player.name;
        // BUILD SHIPS ON Dashboard
        player.shipsPanelShips.classList.add(player.player.side)
        Object.values(player.ships).forEach(ship => {
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

        player.boardEl.classList.toggle('rotate')
    
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
    const end = Date.now()
    return console.log("INITIALIZATION SEQUENCE COMPLETE\n Time Taken: ", (end - start), "ms");
};


// DATA
function getState(option) {
    switch (option) {
        case 'gameMode': {return sessionStorage.getItem('gameMode')}; break;
        case 'storyModePlayer': {return sessionStorage.getItem('storyModePlayer')}
        case 'init-profiles': {
            p1.config = JSON.parse(sessionStorage.getItem('player1'));
            p2.config = JSON.parse(sessionStorage.getItem('player2'));
        } break;
        case 'profiles': {
            const player1 = JSON.parse(sessionStorage.getItem('player1'));
            const player2 = JSON.parse(sessionStorage.getItem('player2'));

            if (player1.location === 'local') {
                p1.config = JSON.parse(localStorage.getItem(player1.user));
            } else {p1.config = JSON.parse(sessionStorage.getItem(player1.user))};

            if (player2.location === 'local') {
                p2.config = JSON.parse(localStorage.getItem(player2.user));
            } else {p2.config = JSON.parse(sessionStorage.getItem(player2.user))};

            const gameState = JSON.parse(sessionStorage.getItem('gameState'));
            for (let key in gameState) {state[key] = gameState[key]}
        } break;
    }
}

function saveState(option,data) {
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
            sessionStorage.setItem('gameState', JSON.stringify(state));
            data && saveState('gameState', state.mode);
        } break;
        case 'player-lookup': {
            sessionStorage.setItem( 'player1', JSON.stringify({user:p1.config.username, location:p1.config.storageEnabled ? 'local' : 'session'}) );
            sessionStorage.setItem( 'player2', JSON.stringify({user:p2.config.username, location:p2.config.storageEnabled ? 'local' : 'session'}) );
            delete p1.config;
            delete p2.config;
        } break;
        case 'gameMode': sessionStorage.setItem('gameMode', data);
    }
}

// MANAGEMENT
async function mode(option,player,data) {
    console.log("Dashboard Mode Set:", option, player?.username, data);
    // let usr = !player?.player.name === 'BOT'
    state.mode = option;

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
            await placeShips();
        }; break;

        case 'ready': { player.status = 'ready';
            // GFS.diff.save('place-ships',player.player.playerNum,'place-ships,[player.board,player.ships]);
            if (p1.status === 'ready' && p2.status === 'ready') {
                [p1.board,p2.board].forEach(b=>{b.activeCells=[];b.mode('subspace')});
                saveState('full');
                getState('storyModePlayer')
                    ? gotoNarrative()
                    : mode('begin-game');
            };
        } break;

        case 'begin-game': { headerEl.innerHTML = "loading. . .";
            getState('profiles');
            await init();
            [p1.board,p2.board].forEach(b=>{b.activeCells=[];b.mode('subspace')});
            mode('targeting',p1,p2);
        } break;

        case 'targeting': { headerEl.innerHTML = `<strong>${player.player.name}</strong> Is Targeting`;
            state.turn = player; console.log("turn", state.turn.player)
            setActiveBoard(data, 'targeting', 'dissable-subspace', 'static', 'subspace');
            player.targetingPanel.addEventListener('click', weapons.set.bind(weapons));

            // await testPhaser();
        } break;

        case 'attack': { headerEl.innerHTML = `<strong>${state.turn.player.name}</strong> Is Attacking`;
            saveState('full');
            if (state.turn===p1) {p1.board.mode('subspace'); p2.board.mode('static');
            } else {p2.board.mode('subspace'); p1.board.mode('static')};
            // player.targetingPanel.removeEventListener('click', weapons.set.bind(weapons))
            await new Promise((resolve) => {
                modals.instance.show({
                    title:"Attack Set", 
                    message:`${state.turn.player.name}'s board is now in subspace mode.<br>When both players are ready to view the screen,<br>Press 'Attack'.`, 
                    button:"Attack", 
                    action:()=>{modals.instance.target.close();resolve()}
                });
            });
            await handleFire();
            // board does fire routine
            // this.handlefire shows results & status message, then returns here
            // Disable targeting panel
            // saveState('gameMode', 'switch-player');
            
            // checkGameState(); // On exit, set mode to status.goto
        } break;
        case 'switch-player': {}
        case 'story': {} break;
        case 'pause': {} break;
        case 'summary': {} break;

        default: return state.mode;
    }
}

//TODO: TEST & MV->FUNC
function checkGameState() {
    console.log("################ GAMESTATE ##################");
    [p1,p2].forEach(px=>{
        console.log(`${px.player.name}: hits`, px.player.hits)
        console.log(`${px.player.name}: misses`, px.player.misses)
        console.log(`${px.player.name}: health`, px.player.damage.health)
    })

    console.log("First Blood condition Result",
        "Reducer: ", [p1.player.hits,p2.player.hits].reduce((acc,current) => {
                    acc += Object.values(current).length },0),
        "Logic: ",  !state.firstBlood
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

    switch (state.goto) {
        case 'firstBlood': {
                if ( [p1.player.hits,p2.player.hits].reduce((acc,current) => {
                    acc += Object.values(current).length },0)
                > 1 && !state.firstBlood ) {
                    state.winner = state.turn;
                    state.firstBlood = true; 
                    state.goto = 'firstSunkenShip';
                    saveState('full');
                    gotoNarrative(/*part2*/) }
            } break;
        case 'firstSunkenShip': {
            [Object.values(p1.player.ships),Object.values(p2.player.ships)].forEach(player => {
                player.forEach(ship => {
                    if (ship.hits.length === ship.area()) {
                        state.winner = state.turn;
                        state.firstSunkenShip = true;
                        state.goto = 'turningPoint';
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
                state.winner = state.turn;
                state.turningPoint = true;
                state.goto = 'victoryInSight';
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
                state.winner = state.turn;
                state.victoryInSight = true;
                state.goto = 'winner';
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
                state.winner = state.turn;
                state.winGame = true;
                state.goto = 'summary';
                saveState('full');
                winGame();
                gotoNarrative(/*Q's Riddle*/);
            }
        } break;
    }
}

async function testPhaser() {
    console.log('##########################################################');
    [p1,p2].forEach(px=>px.board.mode('dissable-subspace'));
    const delay=()=>new Promise((resolve)=>setTimeout(()=>resolve(),45))

    const input = {
        originBoard:null,
        targetBoard:null,
        originCell: '1821',
        targetCell: '1208',
        testCell: '1109'
    };
    await new Promise((resolve,reject)=>{
        headerEl.textContent = "set originCell";
        document.addEventListener('keypress', (e)=>{e.key==='q' && reject()})
        let count = 0;
        document.querySelector('main').addEventListener('click', (e)=>{
            if (!e.target.classList.contains('cell')) return;
            const elements = document.elementsFromPoint(e.clientX,e.clientY)
            // console.log(elements)
            if (count===0 && elements.includes(p1.board.target)) {input.originBoard = 1; input.targetBoard = 2; console.log("BOARD 1 CLICKED", elements)};
            if (count===0 && elements.includes(p2.board.target)) {input.originBoard = 2; input.targetBoard = 1;console.log("BOARD 2 CLICKED", elements)};
            switch (count) {
                case 0: {input.originCell = e.target.id; count++; headerEl.textContent = "set targetCell"}; break;
                case 1: {input.targetCell = e.target.id; count++; headerEl.textContent = "set testCell"}; break;
                case 2: {input.testCell = e.target.id; count++; headerEl.textContent = "Calculating. . ."}; break;
            }
            e.target.classList.add('targetedCell');
            if (count === 3) resolve();
        });
    });
    // console.log("SENT: ", input.originBoard, input.originCell, input.targetCell, input.testCell)
    const call = rayIntersect(input.targetBoard, input.targetCell, input.originCell, input.testCell);
    // if (call) {cells[input.testCell].target.classList.add('hitCell',  'phaseCannon')
    // } else cells[input.testCell].target.classList.add('missCell',  'phaseCannon')
    
    let cells =  p1.board.cells; let cell;
    for (cell in cells) {
        if (rayIntersect(input.targetBoard, input.originCell, input.targetCell, cell)) {
            cells[cell].target.classList.add('hitCell',  'phaseCannon');
            await delay();
        }
        if (rayIntersect(input.targetBoard, input.targetCell, input.originCell, cell)) {
            cells[cell].target.setAttribute('style','border:2px solid yellow');
        }
        if (input.targetBoard===1) {
            cells[input.testCell].target.classList.remove('hitCell');
            cells[input.testCell].target.classList.add('impededCell');
            cells[input.targetCell].target.classList.replace('hitCell', 'targetedCell');
        } else {cells[input.originCell].target.classList.replace('hitCell', 'missCell');}
    }

    cells =  p2.board.cells;
    for (cell in cells) {
        if (rayIntersect(input.originBoard, input.originCell, input.targetCell, cell)) {
            cells[cell].target.classList.add('hitCell',  'phaseCannon');
            await delay();
        }
        if (rayIntersect(input.origin, input.targetCell, input.originCell, cell)) {
            cells[cell].target.setAttribute('style','border:2px solid yellow');
        }
        if (input.targetBoard===2) {
            cells[input.testCell].target.classList.remove('hitCell');
            cells[input.testCell].target.classList.add('impededCell');
            cells[input.targetCell].target.classList.replace('hitCell', 'targetedCell');
        } else {cells[input.originCell].target.classList.replace('hitCell', 'missCell');}
    }

    headerEl.textContent = call;

    if (input.targetBoard===1) {
        cells =  Object.values(p1.ships).map(ship=>ship.location[1]).flat();
        for (cell of cells) { 
            if (rayIntersect(input.targetBpard, input.originCell, input.targetCell, cell.key)) {
                cell.target.classList.replace('hitCell',  'impededCell')
            }
        }
    } else {
        cells =  Object.values(p2.ships).map(ship=>ship.location[1]).flat();
        for (cell of cells) {
            if (rayIntersect(input.targetBpard, input.originCell, input.targetCell, cell.key)) {
                cell.target.classList.replace('hitCell',  'impededCell')
            }
        }
        
    }
}

// RUN
mode(getState('gameMode'));