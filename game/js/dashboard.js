import Player from "./Player.js";
import BOT from "./BOT.js";
import { nav } from "../../nav_dev.js";nav();

// BUS
class Signal {
    constructor(resolver,rejector,destination) {
        this.resolver = resolver;
        this.rejector = rejector;
        this.destination = destination;
        this.active = false;
    }
    async send() { const self = this; this.active = true; let count = 0;
        while (this.active) { count++; count>=30 && (this.active = false);
            await new Promise((resolve,reject) => { console.log("Send Signal. . .")
                const onResolve = (...args) => {console.log("@Signal:Resolved");resolve(self.resolver(...args))};
                const onReject = (...args) => {console.log("@Signal:Rejected");reject(self.rejector(...args))};
                this.destination.signal.set(onResolve,onReject);
            })
        }
    }
    deactivate() {this.active = false}
}


// OBJ
let state = {
    mode:null,
    gameKey:null,
    narrative: {
        goto:'firstBlood',
        shipsPlaced:false, 
        firstBlood:false, 
        firstSunkenShip:false, 
        turningPoint:false, 
        victoryInSight:false, 
        winGame:false,
    },
    turnsTaken: {
        player1: [0,0], /*[turns taken, turns taken since last hit]*/
        player2: [0,0],
    },
    winner:null,
    activeBoard:null,
    turn:null,
    opponent:null,
    update:null,
};


// DOM
const headerEl = document.getElementById('game-status-header');



const p1 = {
    status:null,
    config:null,
    boardEl: document.getElementById('p1-board'),
    infoPanel: {
        target: document.getElementById('p1-summary-text-overlay'),
        data: []
    },
    targetingSystemEl: document.getElementById('p1-load-targeting-system'),
    shipsPanel: document.getElementById('p1-ships-text-overlay'),
    shipsPanelShips: document.querySelector('#p1-ships-text-overlay .ships'),
    shipsPanelBtn: document.getElementById('p1-ships-btn'),
    statusPanel: document.getElementById('p1-status-text-overlay'),
    targetingPanel: {
        target: document.querySelector('#p1-status-text-overlay .targeting-panel'),
        action: null,    
        activate(){try {
            this.target.addEventListener('click', this.action);
            this.target.classList.remove('hide');
        } catch (err) {console.error(console.trace(err))}
        },
        deactivate(){try {
            this.target.removeEventListener('click', this.action);
            this.target.classList.add('hide');
        } catch (err) {console.error(console.trace(err))}
        },
    }
}

const p2 = {
    status:null,
    config:null,
    boardEl: document.getElementById('p2-board'),
    infoPanel: {
        target: document.getElementById('p2-summary-text-overlay'),
        data: []
    },
    targetingSystemEl: document.getElementById('p2-load-targeting-system'),
    shipsPanel: document.getElementById('p2-ships-text-overlay'),
    shipsPanelShips: document.querySelector('#p2-ships-text-overlay .ships'),
    shipsPanelBtn: document.getElementById('p2-ships-btn'),
    statusPanel: document.getElementById('p2-status-text-overlay'),
    targetingPanel: {
        target: document.querySelector('#p2-status-text-overlay .targeting-panel'),
        action: null,
        activate(){try {
            this.target.addEventListener('click', this.action);
            this.target.classList.remove('hide');
        } catch (err) {console.error(console.trace(err))}
        },
        deactivate(){try {
            this.target.removeEventListener('click', this.action);
            this.target.classList.add('hide');
        } catch (err) {console.error(console.trace(err))}
        },
    }
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
        bypassMessage: "Press the button 2X more to bypass",
        count: 0,
        listen(curry) {this.target.children[4].children[0].addEventListener('click', curry)},
        takeKeypress(e){this.target.children[3].value += e.key},
        curry: () => {}, 
        show(resolve) {
            this.count = 0;
             mode('keyboard',p1,p2,'default');
            this.curry = (e) => {console.log("@SwitchUserModal:Resolved");modals.switchUser.action(resolve)};
            this.listen(this.curry);
            this.target.showModal();
            this.target.children[1].textContent = state.turn?.player?.name || '';
            if (state.turn?.player?.password) {
                this.target.children[2].textContent = this.passwordUserMessage;
                this.target.children[3].style.display = 'block';
            } else {
                this.target.children[2].textContent = this.noPasswordUserMessage;
                this.target.children[3].style.display = 'none';
            }
        },
        action(resolve) { let exit = false;
            if (state.turn?.player?.password) {
                if (this.target.children[3].value === state?.turn?.player?.password) {
                    this.target.children[3].value = '';
                    exit = true;
                } else {
                    this.count++; console.log("@switchUser:count:", this.count);
                    this.target.children[2].style.color = "#f66";
                    this.target.children[2].textContent = "Password Incorrect! Please retry."
                    this.count===2 && (this.target.children[2].textContent = this.bypassMessage);
                    this.count===4 && (exit = true);
                }
            } else {
                this.count++;
                this.count===3 && (exit = true);
            };

            if (exit) { this.count = 0;
                this.target.children[4].children[0].removeEventListener('click', this.curry);
                this.target.children[2].style.color = 'white';
                mode('keyboard',p1,p2,'dashboard');
                this.curry = () => {};
                resolve(this.target.close());
            }
        },
    },
    instance: {
        target: document.getElementById('db-instance-modal'),
        title: document.querySelector('#db-instance-modal .title'),
        subhead: document.querySelector('#db-instance-modal .subhead'),
        message: document.querySelector('#db-instance-modal .message'),
        button: document.querySelector('#db-instance-modal button'),
        function() {mode('keyboard',p1,p2,'dashboard')},
        action: () => {},
        count:0,
        listen() {this.button.addEventListener('click', this.function)},
        show(config,options) {
             mode('keyboard',p1,p2,'default');
            this.options?.resetCount && (this.count = 0);
            ['title', 'subhead', 'message', 'button']
                .forEach(item=>config[item] && (this[item].innerHTML = config[item]))
            this.action = config.action || this.target.close();
            console.log("@instanceModal typeof action", typeof this.action);
            typeof this.action==='function' && this.button.addEventListener('click',this.action);
            this.target.showModal();
        },
    },
    dev: {
        target: document.getElementById('dev-instance-modal'),
        title: document.querySelector('#dev-instance-modal .title'),
        subhead: document.querySelector('#dev-instance-modal .subhead'),
        message: document.querySelector('#dev-instance-modal .message'),
        input: document.querySelectorAll('#dev-instance-modal input'),
        button: document.querySelector('#dev-instance-modal button:nth-child(1)'),
        button2: document.querySelector('#dev-instance-modal button:nth-child(2)'),
        guide: "Listener is near RUN, action is set in mode(revovery)",
        function(){p1.board.enableKeyboard ? mode('keyboard',p1,p2,'dashboard') : mode('keyboard',p1,p2,'default')},
        action: null,
        count:0,
        listen() {this.button.addEventListener('click', this.action)},
        show(config,options) {
             mode('keyboard',p1,p2,'default');
            this.options?.resetCount && (this.count = 0);
            ['title', 'subhead', 'message', 'button'].forEach(item=>
                    config[item] && (this[item].innerHTML = config[item]));
            this.action = config.action || this.target.close();
            this.button2.addEventListener('mouseup', ()=>this.function)
            typeof config.action==='function' && this.button.addEventListener('click',this.action);
            this.target.showModal();
        },
    },

}

const actions = {
    activateTargetingPanel(px) {
        px.targetingPanel.target.addEventListener('click', weapons.set.bind(weapons));
        px.targetingPanel.target.classList.remove('hide');
    },
    deactivateTargetingPanel(px) { console.log(px)
        px.targetingPanel.target.removeEventListener('click', weapons.set.bind(weapons));
        px.targetingPanel.target.classList.add('hide');
    },
    getPlayerInfoPanels: () => Object({p1:p1.infoPanel.data, p2:p2.infoPanel.data}),
    refreshInfoPanels() {[p1,p2].forEach(px=>px.infoPanel.data.forEach(textNode => {
        const info = document.createElement('li');
            info.classList.add('info-list-node');
            info.innerHTML = textNode;
            px.infoPanel.target.appendChild(info);
    }))},
}




// FUNC
let autoLoadShipsCurry = () => {};
let readyPlayerX = () => {};
const delay = (ms) => new Promise((geaux)=>setTimeout(()=>geaux(),ms));

async function switchPlayer(callback, data) {
    console.log("Switch Player", callback, data);

    state.turn = state.turn===p1 ? p2 : p1;
    state.opponent = state.opponent===p1 ? p2 : p1;
    await new Promise(resolve=>modals.switchUser.show(resolve));

    callback && callback(data);
    
    return console.log("Players switched.", state.turn, state.opponent);
}

function setActiveBoard(pX, activeBoardMode, option1, otherBoardMode, option2) {
    console.log("setActiveBoard("+pX.player.name+" ("+pX.player.playerNum+"))") //!
    const [px,py,offset] = pX.player.playerNum===1 ? [p1,p2,'left'] : [p2,p1,'right'];

    state.activeBoard = px.board;
    px.board.mode(activeBoardMode, option1);
    px.board.target.classList.add('active-mode');
    px.board.setBracketOffset(offset);
    
    py.board.target.classList.remove('active-mode');
    py.board.mode(otherBoardMode, option2);
}

async function placeShips() {
    for (let px of [p1,p2]) {
        const usr = px.player.name!=='BOT';
        setActiveBoard(px, 'place-ships', null, 'static', 'subspace');
        headerEl.innerHTML = `<strong>${px.player.name}</strong> Placing Ships`;
        
        state.turn = px;
        px.status = 'place-ships';
        if (usr) {
            Array.from(px.shipsPanelShips.children)
                .forEach(ship => {
                    ship.classList.add('clickable');
                    ship.addEventListener('click', placeShipsClick)
                });
            px.shipsPanelBtn.classList.add('blue');
            px.shipsPanelBtn.textContent = "Auto";
            px.shipsPanelBtn.classList.remove('hide');
            px.shipsPanelBtn.classList.add('clickable');
        };

        await new Promise(resolve => {
            readyPlayerX = () => {
                console.log("@PlaceShips readyPlayerX resovlve");
                usr && px.shipsPanelBtn.classList.toggle('hide'); 
                resolve(mode('ready',px))
            };
            autoLoadShipsCurry = (e) => autoLoadShips(px,e);
            usr && px.shipsPanelBtn.addEventListener('click', autoLoadShipsCurry);
            try{!usr && px.player.mode('place-ships',{readyPlayerX, px})}
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

async function seekNDestroyLoop() {
    // mode('targeting', state.turn, state.opponent);

    await new Promise((resolve) => {
        readyPlayerX = () => {console.log("@targeting:ReadyPlayerX:Resolve");resolve(mode('attack'))};
        buttons.fire.addEventListener('mouseup',readyPlayerX);
    });

    mode('attack', state.turn, state.opponent);

    await new Promise((resolve) => {
        modals.instance.show({
            title:"Attack Set", 
            message:`${state.turn.player.name}'s board is now in subspace mode.<br>When both players are ready to view the screen,<br>Press 'Attack'.`, 
            button:"Attack", 
            action:()=>{modals.instance.target.close();resolve()}
        });
    });

    await handleFire();

    // checkGameState(); // On exit, set mode to status.goto

    saveState('full', 'targeting');
    return switchPlayer(mode,'targeting');
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
        console.log("weapons.set("+e.target.title+")");
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
            console.log("Player's Ships @ weapon.set > originCell()", player.ships);
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
            console.log("checkDone("+option+", "+weapon+")");
            const self = this;
            switch (option) {
                case 'add': {this.count++; typeof weapon.remaining==='number' && weapon.remaining--;
                } break;
                case 'remove': { this.count--; typeof weapon.remaining==='number' && weapon.remaining++; weapons.set(self.prev.pop())
                    console.log("THIS IS PREV AT READ", self.prev); 
                } break;
            }

            if (this.count===this.max) { buttons.enable('fire'); handleColor();
                Array.from(state.turn.targetingPanel.target.children).forEach(weapon => {
                    weapon.classList.remove('maxed-weapon')
                })
            } else {buttons.disable('fire')};
            console.log("Placed:", this.count, " Allowed:", weapon.max, " Remaining:",weapon.remaining)
        };

        const signal = 
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

        signal.deactivate();
        console.log("Weapon Max Reached for turn.")
    },
}

async function handleFire() {
    weapons.count = 0;
    state.activeBoard.signal.clear();
    const count = [0,0];

    await new Promise((resolve) => {
        state.turn===p1
            ? p2.board.handleFire(p2.player.ships, resolve) 
            : p1.board.handleFire(p1.player.ships, resolve);
    }).then(result => { result.forEach(array => {
        const info = document.createElement('li');
            info.classList.add('info-list-node');
            const textNode = `<div class="pill"></div>${array[0]} on cell ${array[1].name}. <span>+1</span>`;
            info.innerHTML = textNode;
            state.turn.infoPanel.target.appendChild(info);
            state.turn.infoPanel.data.push(textNode);
        console.log(result);
        if (array[0]==='Hit') {count[0]++; state.turn.player.hits.push(array[1]);
        } else {count[1]++; state.turn.player.misses.push(array[1])};
    }); });

    console.log("Turns taken", state.turnsTaken)
    const player = state.turn===p1 ? 'player1' : 'player2';
    if (count[0]===0) {state.turnsTaken[player][1]++ 
    } else {state.turnsTaken[player][1] = 0};

    headerEl.innerHTML = `<strong>${state.turn.player.name}</strong> got ${count[0]} hit${count[0].length!=1 && "s"} & ${count[1]} miss${count[0].length!=1 && "es"}!`;
    await delay(3000);
    return console.log('Done Firing')
}


// INIT
function init() {
    const start = Date.now();
    let bot = false;
    // CREATE CLASSES
    if (p1.config.name === "BOT") {
        bot = true;
        p1.player = new BOT(p1.config, p1.boardEl,{follow:false,enableTargeting:false});
        p1.board = p1.player.board;
        p1.ships = p1.player.ships;
    } else {
        p1.player = new Player(p1.config, p1.boardEl, p1.targetingSystemEl, {follow:true,enableTargeting:true});
        p1.board = p1.player.board;
        p1.ships = p1.player.ships;
    }
    if (p2.config.name === "BOT") {
        bot = true;
        p2.player = new BOT(p2.config, p2.boardEl,{follow:false,enableTargeting:false});
        p2.board = p2.player.board;
        p2.ships = p2.player.ships;
    } else {
        p2.player = new Player(p2.config, p2.boardEl, p2.targetingSystemEl, {follow:true,enableTargeting:true});
        p2.board = p2.player.board;
        p2.ships = p2.player.ships;
    }

    delete p1.config;
    delete p2.config;

    // SETUP DOM
    console.log("Setup DOM");

    !bot && (buttons.switchUser.textContent = 'Switch User');
    !bot && buttons.switchUser.classList.add('clickable');

    // EVENT LISTENERS
    for (let modal in modals) {modal!=='switchUser' && modals[modal].listen()};
    buttons.switchUser.addEventListener('click', modals.switchUser.show.bind(modals.switchUser));
    buttons.toggleSubspace.target.addEventListener('click', buttons.toggleSubspace.action);

    buttons.devToggleOppSubspace.target.addEventListener('click', buttons.devToggleOppSubspace.action);

    // EVENT HANDLERS
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

    // INIT PLAYER SPECIFFIC ITEMS
    [p1,p2].forEach(px => {
        px.infoPanel.target.innerHTML = `<h3>${px.player.name}</h3>${px.player.username || ''}`;
        // BUILD SHIPS ON Dashboard
        px.shipsPanelShips.classList.add(px.player.side)
        Object.values(px.ships).forEach(ship => {
            const wrapper = document.createElement('div');
                wrapper.innerHTML = ship.projection;
                wrapper.id = ship.name;
                wrapper.title = ship.name;
                wrapper.classList.add('ship');
                wrapper.setAttribute('owner', px===p1 ? 'p1' : 'p2');
                px.shipsPanelShips.appendChild(wrapper);
        });
        
        // BUILD TARGETING PANEL
        px.targetingPanel.action = weapons.set.bind(weapons);
        px.targetingPanel.target.classList.add(px.player.side)
        Object.values(px.player.ships).forEach(ship => {
            const row = document.createElement('div');
                row.classList.add('targeting-group');
            const shipWrapper = document.createElement('div');
                shipWrapper.innerHTML = ship.projection;
                shipWrapper.id = ship.name;
                shipWrapper.title = ship.name;
                shipWrapper.classList.add('ship');
                shipWrapper.setAttribute('owner', px===p1 ? 'p1' : 'p2');
            const weapons = document.createElement('div');
                weapons.classList.add('weapons');
                Object.values(ship.weapons).forEach(weapon => {
                    const get = (item) => px.player.shipsConstructor.getWeaponSymbol(item);
                    const img = document.createElement('div')
                        img.innerHTML = get(weapon.name);
                        img.setAttribute('title', weapon.name);
                        img.setAttribute('for', ship.name);
                        img.classList.add('weapon-symbol');
                        weapons.appendChild(img);
                })
                row.appendChild(shipWrapper)
                row.appendChild(weapons);
                px.targetingPanel.target.appendChild(row);
                px.targetingPanel.target.classList.add('hide');
        });

        px.boardEl.classList.toggle('rotate');
    
        // HANDLE EVENTS PER-PLAYER
        buttons.orient.addEventListener('click', (e)=>px.boardEl.classList.toggle('rotate'));
    });

    const end = Date.now()
    return console.log("INITIALIZATION SEQUENCE COMPLETE\n Time Taken: ", (end - start), "ms");
};

function boot() { console.log("BOOT GAME");
    getState('profiles'); init(); getState('gameState');
    let count = 111;
        p1.player.name && (count += 100);
        p2.player.name && (count += 10);
        state.gameKey && (count += 1);
    if (count===222) {console.log("BOOT GAME SUCCESS!", p1,p2,state);
    } else {
        count -= 100 && count < 100 && console.error("BOOT ERROR! player1 Failed to load",p1);
        count -=10 && count < 10 && console.error("BOOT ERROR! player2 Failed to load",p2);
        count -=1 && count < 1 && console.error("BOOT ERROR! No gameKey detected on state Object",state);
    }
};


// DATA
function getState(option) {
    // if (option==='gameState' && (Date.now() - state.update < 2000)) {return(console.warn("gameState request too soon!"))}
    console.log("getState("+option+")");
    switch (option) {
        case 'gameMode': {return sessionStorage.getItem('gameMode')}; break;
        case 'storyModePlayer': {return sessionStorage.getItem('storyModePlayer')} break;
        case 'gameKey': {return sessionStorage.getItem('gameKey')} break;
        case 'full': getState('profiles'); getState('gameState'); break;

        case 'profiles': {
            p1.config = JSON.parse(sessionStorage.getItem('player1'));
            p2.config = JSON.parse(sessionStorage.getItem('player2'));
        } break;

        case 'gameState': {
            const object = JSON.parse(sessionStorage.getItem('gameState')); 
            state = new GameState(object);
            p1.infoPanel.data = object.infoPanels.p1;
            p2.infoPanel.data = object.infoPanels.p2;
            actions.refreshInfoPanels();
            console.log("POSTSTATE",state);
            function GameState(gameState) { console.log("Reconstruct GameState Object");
                this.gameKey = gameState?.state?.gameKey || getState('gameKey');
                this.mode = gameState?.mode || getState('gameMode');
                this.turn = gameState?.state?.turn?.player?.name===p1.player.name ? p1 : p2 || p1;
                this.activeBoard = gameState?.state?.activeBoard?.boardNumber===p1.board.boardNumber ? p1.board : p2.board ?? p2.board;
                this.opponent = gameState?.state?.opponent?.player?.name===p1.player.name ? p1 : p2 ?? p2;
                this.turnsTaken = gameState?.state?.turnsTaken || {player1:[0,0], player2:[0,0]};
                this.update = Date.now();
            };
            ((state.turn===p1 || state.turn===p2) && state.gameKey) && console.log("GameState Successfully Restored");
            return state;
        } break;

        case 'reconstruct': {
            getState('profiles'); 
            p1.shipsPanelShips.innerHTML = '';
            p2.shipsPanelShips.innerHTML = '';
            p1.infoPanel.target.innerHTML = '';
            p2.infoPanel.target.innerHTML = '';
            p1.targetingPanel.target.innerHTML = '';
            p2.targetingPanel.target.innerHTML = '';
            init();
            getState('gameState');
        } break;
    }
}

function saveState(option,data=true) {
    const useErrorSafe = sessionStorage.getItem('useErrorSafe');
    headerEl.textContent = "Saving. . .";
    switch (option) {
        case 'full': { console.log("SaveState full. Players storageEnabled?", p1.player.storageEnabled, p2.player.storageEnabled);
            if (typeof data==='string') saveState('gameMode', data);
            const getCurrentGame = () => Object({
                gameKey:state.gameKey,
                gameState:state,
                infoPanels:actions.getPlayerInfoPanels(),
                player1:p1.player.PlayerState(),
                player2:p2.player.PlayerState()
            });
            if (p1.player.storageEnabled || p2.player.storageEnabled) {
                localStorage.setItem('currentGame', JSON.stringify(getCurrentGame()));
            };
            sessionStorage.setItem('player1', p1.player.PlayerState('str'));
            sessionStorage.setItem('player2', p2.player.PlayerState('str'));
            sessionStorage.setItem('gameState', JSON.stringify({state,infoPanels:actions.getPlayerInfoPanels()}));
            !data && sessionStorage.setItem('gameMode', state.mode);
            console.log("saveState done.")
        } break;

        case 'profiles': {sessionStorage.setItem('player1', p1.player.PlayerState('str'));
                          sessionStorage.setItem('player2', p2.player.PlayerState('str'));
        } break;
        case 'gameState': sessionStorage.setItem('gameState', JSON.stringify({state,infoPanels:actions.getPlayerInfoPanels()})); break
        case 'gameMode': sessionStorage.setItem('gameMode', data); break;
    }
}


// MANAGEMENT
async function mode(option,px,py,data) {
    console.log("Dashboard Mode Set:", option, px, data);
    // let usr = !px?.player.name === 'BOT'
    if (!state.turn && data===false) getState('gameState');
    state.mode = option;

    switch (option) {
        case 'init': {
            getState('profiles');
            init();
            state.gameKey = p1.player.gameState;
            state.activeBoard = p1.board;
            state.turn = p1;
            state.opponent = p2;
            p1.player.opponent = p2.player.username;
            p2.player.opponent = p1.player.username;
            sessionStorage.setItem('gameHasInitialized', true);
            saveState('full', 'place-ships');
            getState('storyModePlayer')
                ? mode('goto-narrative',p1)
                : mode('place-ships',p1);
        } break;

        case 'place-ships': {
            getState('storyModePlayer') && boot();
            await placeShips();
        }; break;

        case 'ready': { px.status = 'ready';
            state.activeBoard.mode('subspace');
            await new Promise(resolve=>modals.switchUser.show(resolve));
            saveState('profiles');
            if (p1.status === 'ready' && p2.status === 'ready') {
                [p1.board,p2.board].forEach(b=>{b.activeCells=[];b.mode('subspace')});
                saveState('full', 'begin-game');
                getState('storyModePlayer')
                    ? mode('goto-narrative',p1)
                    : mode('begin-game',p1);
                console.log("ready done.")
            };
        } break;

        case 'begin-game': { headerEl.innerHTML = "loading. . .";
            getState('storyModePlayer') && boot();
            [p1.board,p2.board].forEach(b=>{b.activeCells=[];b.mode('subspace')});
            state.turn = p1; state.opponent = p2;
            mode('targeting', p1,p2)
            console.log("begin-game done.");
        } break;

        case 'targeting': {
            saveState('gameMode', 'targeting');
            headerEl.innerHTML = `<strong>${state.turn.player.name}</strong> Is Targeting`;
            console.log("ALL STATE AT TARGETING", p1,p2,state);
            setActiveBoard(state.opponent, 'targeting', 'subspace', 'static', 'subspace');
            state.turn.targetingPanel.activate();
            console.log("targeting environment set.");
            seekNDestroyLoop();
        } break;

        case 'attack': { console.log("Attack Mode", state.turn.player.name);
            saveState('full');
            buttons.disable('fire');
            buttons.fire.removeEventListener('click', readyPlayerX)
            console.log("STATE CHECK", p1,p2,state);
            console.log("Who's turn @attack?", state.turn);
            headerEl.innerHTML = `<strong>${state.turn.player.name}</strong> Is Attacking`;
            state.turn.board.mode('subspace'); state.opponent.board.mode('static');
            state.turn.targetingPanel.deactivate();
            state.turn===p1 ? state.turnsTaken.player1[0]++ : state.turnsTaken.player2[0]++
            console.log("attack done.")
        } break;

        case 'safeSpace': { //! NOT SET UP
            headerEl.textContent = "Safe Space. Press Take Turn to take turn";
            buttons.switchUser.activate({
                text: `Take Turn<br><strong>${state.turn.player.name}</strong>`,
                action(){mode(getState('gameMode'))}
            })
        } break;

        case 'goto-narrative': {saveState('full'); window.location = "http://127.0.0.1:5500/screens/narrative/narrative.html"} break;
        
        case 'pause': {} break;
        case 'summary': {} break;
        case 'keyboard': {
            switch (data) {
                case 'default': [px,py].forEach(pz=>pz.board.enableKeyboard=true); break;
                case 'dashboard': [px,py].forEach(pz=>pz.board.enableKeyboard=false); break;
            }
        } break;
        case 'recovery': {
            modals.dev.show({
                title:"dev recovery mode",
                subhead:"Enter A command below",
                button: "eval",
                action(){modals.dev.input[0].value!=='' && eval(modals.dev.input[0].value);
                        modals.dev.input[1].value!=='' && console.log(eval(modals.dev.input[1].value))}
            });
        } break;

        default: return state.mode;
    }
    console.log("end.")
    return 0;
}

//TODO: TEST & MV->FUNC
function checkGameState() {
    console.log("################ GAMESTATE ##################");
    [p1,p2].forEach(px=>{
        console.log(`[|]${px.player.name}: hits`, px.player.hits)
        console.log(`[|]${px.player.name}: misses`, px.player.misses)
        console.log(`[|]${px.player.name}: health`, px.player.damage.health)
    })

    console.log("First Blood condition Result",
        "Reducer: ", eval( [p1.player.hits,p2.player.hits].reduce((acc,current) => {
                    acc += Object.values(current).length },0) ),
        "Logic: ",  !state.firstBlood
    )
    console.log("firstSunkenShip condition Result",
        "Hits length Matches area?: ", eval( [Object.values(p1.player.ships),Object.values(p2.player.ships)].forEach(px => {
                px.forEach(ship => {if (ship.hits.length === ship.area()) {console.log(ship.hits.length)}})}) )
    )
    console.log("turningPoint condition Result",
        "Reducer: ", eval( [Object.values(p1.player),Object.values(p2.player)]
                .reduce((acc,px) => px.ships.forEach(ship => {
                    if (ship.hits.length === ship.area()) acc[px.name]++
                }), {[p1.player.name]:0,[p2.player.name]:0}) )
    )
    console.log("victoryInSight condition Result",
        "Reducer: ", eval( [Object.values(p1.player),Object.values(p2.player)]
                .reduce((acc,px) => px.ships.forEach(ship => {
                    if (ship.hits.length === ship.area()) acc[px.name]++
                }), {[p1.player.name]:0,[p2.player.name]:0}) )
    )
    console.log("winner condition Result",
        "Reducer: ", eval( [Object.values(p1.player),Object.values(p2.player)]
                .reduce((acc,px) => px.ships.forEach(ship => {
                    if (ship.hits.length === ship.area()) acc[px.name]++
                }), {[p1.player.name]:0,[p2.player.name]:0}) )
    )
    console.log("################### END #####################")

    // switch (state.goto) {
    //     case 'firstBlood': {
    //             if ( [p1.player.hits,p2.player.hits].reduce((acc,current) => {
    //                 acc += Object.values(current).length },0)
    //             > 1 && !state.firstBlood ) {
    //                 state.winner = state.turn;
    //                 state.firstBlood = true; 
    //                 state.goto = 'firstSunkenShip';
    //                 saveState('full');
    //                 mode('goto-narrative') }
    //         } break;
    //     case 'firstSunkenShip': {
    //         [Object.values(p1.player.ships),Object.values(p2.player.ships)].forEach(px => {
    //             px.forEach(ship => {
    //                 if (ship.hits.length === ship.area()) {
    //                     state.winner = state.turn;
    //                     state.firstSunkenShip = true;
    //                     state.goto = 'turningPoint';
    //                     saveState('full');
    //                     mode('goto-narrative');
    //                 }
    //             })
    //         })
    //     } break;
    //     case 'turningPoint': {
    //         const reduction = [Object.values(p1.player),Object.values(p2.player)]
    //             .reduce((acc,px) => px.ships.forEach(ship => {
    //                 if (ship.hits.length === ship.area()) acc[px.name]++
    //             }), {[p1.player.name]:0,[p2.player.name]:0});
    //         if (Object.values(reduction).some(result=>result>2)) {
    //             state.winner = state.turn;
    //             state.turningPoint = true;
    //             state.goto = 'victoryInSight';
    //             saveState('full');
    //             mode('goto-narrative');
    //         }
    //     } break;
    //     case 'victoryInSight': {
    //         const reduction = [Object.values(p1.player),Object.values(p2.player)]
    //             .reduce((acc,px) => px.ships.forEach(ship => {
    //                 if (ship.hits.length === ship.area()) acc[px.name]++
    //             }), {[p1.player.name]:0,[p2.player.name]:0});
    //         if (Object.values(reduction).some(result=>result>3)) {
    //             state.winner = state.turn;
    //             state.victoryInSight = true;
    //             state.goto = 'winner';
    //             saveState('full');
    //             mode('goto-narrative');
    //         }
    //     } break;
    //     case 'winGame': {
    //         const reduction = [Object.values(p1.player),Object.values(p2.player)]
    //             .reduce((acc,px) => px.ships.forEach(ship => {
    //                 if (ship.hits.length === ship.area()) acc[px.name]++
    //             }), {[p1.player.name]:0,[p2.player.name]:0});
    //         if (Object.values(reduction).some(result=>result===5)) {
    //             state.winner = state.turn;
    //             state.winGame = true;
    //             state.goto = 'summary';
    //             saveState('full');
    //             winGame();
    //             mode('goto-narrative');
    //         }
    //     } break;
    // }
}




// ER-R
var recoveryCounter = 0;
async function handleFailToLoad(err) {
    console.warn("GAME FAILED TO LOAD! Resolving. . .",err);
    if (recoveryCounter===2) {throw new Error("Recovery Limit Reached!")};
    try { recoveryCounter++; boot(); mode(getState('gameMode'))
    } catch (err) {
        console.error(err);
        try {
            if (sessionStorage.getItem('recovery-error') && recoveryCounter===2) {
                recoveryCounter = 0;
                throw new Error("Game recovery Error! Please start a new game.",err);
            } else {
                sessionStorage.setItem('recovery-error', Date.now());
                
                recover();
            }
        } catch (err) {throw new Error(err)}
    }
}

document.getElementById('dev_recover').addEventListener('click', ()=>mode('recovery'));

document.addEventListener('keypress', (e)=>{if (!p1.board.enableKeyboard && e.key=='z')recover(true)});
function recover(e) {
    if(e) {sessionStorage.removeItem('recovery-error');recoveryCounter=0;}
    else{recoveryCounter++;}
    getState('reconstruct');
    console.log("##################### POST-RECOVERY-REPORT #####################");
    console.log("PLAYERS: ", p1,p2);
    console.log("STATE: ", state);
    mode(getState('gameMode'), p1);
}



// RUN
var gameHasInitialized = sessionStorage.getItem('gameHasInitialized');
if (gameHasInitialized) {
    console.log("Game Has Been Initialized; Load")
    try {console.log("Set Mode Success!"); mode(getState('gameMode'));
    } catch {boot(); console.log("BEGIN",state.turn); mode(getState('gameMode'), state.turn)};
} else {console.log("Game Has Not Been Initialized; Initializing. . ."); mode(getState('gameMode',null,false))}