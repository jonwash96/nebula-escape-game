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
        while (this.active) { count++; count>=20 && (this.active = false);
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
        winner:null,
        storyModePlayer:'user||opp',
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
    activeBoard:null,
    turn:null,
    opponent:null,
    update:null,
};

let settings = {
    switchUserModal:false,
    switchUserModalValue: () => {return settings.switchUserModal ? 3 : 1},
    switchUserPw:true,
    dimBrackets:false,
    recoveryMode:true,
    devToggleOppSubspace:true,
};

const tutorial = {
    howToPlace:[false,"To place a weapon, pick one from your ships panel and then place it on the board. You must place 5 shots per turn, and some ships run out of ammo before 5."],
}


// DOM
const headerEl = document.getElementById('game-status-header');

const p1 = {
    which:'player1',
    status:null,
    config:null,
    boardEl: document.getElementById('p1-board'),
    infoPanel: {
        target: document.getElementById('p1-summary-text-overlay'),
        list: document.querySelector('#p1-summary-text-overlay ul'),
        data: [],
        add(node) {typeof node==='string' && this.data.push(node);
                   this.list.appendChild(actions.createInfoPanelNode(node)) },
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
    which:'player2',
    status:null,
    config:null,
    boardEl: document.getElementById('p2-board'),
    infoPanel: {
        target: document.getElementById('p2-summary-text-overlay'),
        list: document.querySelector('#p2-summary-text-overlay ul'),
        data: [],
        add(node) {typeof node==='string' && this.data.push(node);
                   this.list.appendChild(actions.createInfoPanelNode(node)) },
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
    recoveryMode: {
        target: document.getElementById('dev_recover'),
        function: () => mode('recovery')
    },
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
        title: document.querySelector('#db-info-modal h1'),
        subhead: document.querySelector('#db-info-modal h2'),
        l3: document.querySelector('#db-info-modal h5'),
        text: document.querySelector('#db-info-modal p'),
        element: document.querySelector('#db-info-modal div:nth-of-type(1)'),
        button: document.querySelector('#db-info-modal .btn-block button:nth-child(1)'),
        newGameBtn: document.querySelector('#db-info-modal .btn-block button:nth-child(2)'),
        listen() { this.button.addEventListener('click', this.function);
                   this.newGameBtn.addEventListener('click', this.beginNewGame) },
        beginNewGame() {saveState('full'); window.location = '../index.html'},
        function() {modals.info.target.close()},
        show(config,newGame) {
            Array.from(this.target.children).forEach(child => {
                child.classList.remove('hide') 
            });
            this.title.innerHTML = config.title || 'null';
            this.subhead.innerHTML = config.subhead || 'null';
            this.l3.innerHTML = config.l3 || 'null';
            this.text.innerHTML = config.text || 'null';
            config.element && this.element.appendChild(config.element);
            this.button.textContent = config.button || 'Ok';
            newGame && this.newGameBtn.classList.remove('hide');
            if (typeof config.action==='function') {
                const action = () => {
                    config.action();
                    this.button.removeEventListener('click', this.curry) 
                };
                    this.button.addEventListener('click', action);
            }
            this.element.textContent==='dom node(s)' && this.element.classList.add('hide');
            Array.from(this.target.children).forEach(child => {
                child.textContent==='null' && child.classList.add('hide') });
            this.target.showModal();
        },
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
                const val = settings.switchUserModal ? 3 : 1;
                this.count===val && (exit = true);
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
    pause: {
        target: document.getElementById('pause-menu'),
        settings: document.querySelectorAll('#pause-menu ul li input'),
        quitGameBtn: document.querySelector('#pause-menu .btn-block button:nth-child(1)'),
        playBtn: document.querySelector('#pause-menu .btn-block button:nth-child(2)'),
        count: 0,
        listen() {buttons.pause.addEventListener('click', modals.pause.show.bind(modals.pause))},
        quitGame() { this.count++;
            count===0 && (this.quitGameBtn.textContent = "Quit Game");
            count===1 && (this.quitGameBtn.textContent = "Press 2X more");
            count===2 && (this.quitGameBtn.textContent = "Press 1X more");
            count===3 && (window.location = "../index.html");
        },
        playGame(option) { this.count = 0;
            document.querySelectorAll('#pause-menu ul li input').forEach(item=>{
                switch (item.id) {
                    case 'setting-switch-user-modal': {settings.switchUserModal = item.checked} break;
                    case 'setting-switch-user-password': {settings.switchUserPw = item.checked} break;
                    case 'setting-dim-brackets': {settings.dimBrackets = item.checked; 
                        Array.from(document.querySelectorAll('.db-bracket')).forEach(bracket => {
                            if (item.checked) {bracket.classList.add('dim')
                            } else {bracket.classList.remove('dim')};
                        })
                    } break;
                    case 'setting-recovery-mode': {settings.recoveryMode = item.checked;
                        if (item.checked) {
                            buttons.recoveryMode.target.textContent = "dev_recoveryMode";
                            buttons.recoveryMode.target.addEventListener('click', buttons.recoveryMode.function);
                            buttons.recoveryMode.target.classList.add('active');
                        } else {
                            buttons.recoveryMode.target.textContent = "";
                            buttons.recoveryMode.target.removeEventListener('click', buttons.recoveryMode.function);
                            buttons.recoveryMode.target.classList.remove('active');
                        }
                    } break;
                    case 'setting-opp-subspace': {settings.devToggleOppSubspace = item.checked;
                        if (item.checked) {
                            buttons.devToggleOppSubspace.target.textContent = "dev_opponent_Subspace";
                            buttons.devToggleOppSubspace.target.addEventListener('click', buttons.devToggleOppSubspace.action);
                            buttons.devToggleOppSubspace.target.classList.add('active');
                        } else {
                            buttons.devToggleOppSubspace.target.textContent = "";
                            buttons.devToggleOppSubspace.target.removeEventListener('click', buttons.devToggleOppSubspace.action);
                            buttons.devToggleOppSubspace.target.classList.remove('active');
                        }

                    } break;
                }
                option ?? saveState('full');
                this.target.close();
            })
        },
        show() {
            mode('pause');
            this.target.showModal();
            this.quitGameBtn.addEventListener('click',modals.pause.quitGame.bind(modals.pause));
            this.playBtn.addEventListener('click',modals.pause.playGame.bind(modals.pause));
        }
    }
}

const narrativeStatus = {
    target: document.querySelector('#db-controls-grid .center'),
    parts: () => Object.entries(state.narrative.storyModePlayer.player.narrative).filter(arr=>arr[0].match(/part\d/)),
    render() {

        const color = (data) => {
            console.log("@narrativeStatus data", data);
            console.log("@narrativeStatus winner", data.winner, data.winner==='user');
            console.log("@narrativeStatus path", data.response.path, data.response.path==='duty');
            let color;
            switch (data.winner) {
                case 'user': {color = data.response.path==='courage' ? 'red' : 'blue'} break;
                case 'opp': {color = data.response.path==='duty' ? 'steelblue' : 'cyan'} break;
                default: {color = 'sdblue'}
            }
            return color;
        }
        this.parts().forEach(([part,data])=> {
            const item = document.createElement('div');
                item.classList.add('status-list-item');
                item.id = part;
                item.title = data.response.prompt.replace(/\&.+;/, "'");
            const pill = document.createElement('div');
                pill.classList.add('pill', color(data));
                pill.textContent = part.slice(-1);
                item.appendChild(pill);
            const title = document.createElement('span');
                title.classList.add('title');
                title.textContent = data.title;
                item.appendChild(title);
            const response = document.createElement('span');
                response.classList.add('response');
                response.innerHTML = data.response.prompt.length>60 
                    ? data.response.prompt.slice(0,60)+"..."
                    : data.response.prompt;
                item.appendChild(response)
            const opt = document.createElement('span');
                opt.classList.add('opt');
                opt.textContent = data.response.option;
                item.appendChild(opt);
            this.target.appendChild(item);
        })
    }
}

const notify = {
    root: document.getElementById('notification'),
    target: document.querySelector('#notification div'),
    text: document.querySelector('#notification span'),
    gameLogo: document.getElementById('db-logotype'),
    async show(content,resolve) {
        this.text.innerHTML = content;
        this.gameLogo.classList.add('hide');
        this.target.classList.remove('hide')
        this.target.classList.add('show-notify');
        await delay(3000);
        resolve && resolve();
        this.target.classList.add('hide-notify');
        await delay(3000);
        this.target.classList.remove('show-notify','hide-notify')
        this.target.classList.add('hide')
        this.gameLogo.classList.remove('hide');
    }
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
    createInfoPanelNode(node)  {
        const info = document.createElement('li');
        info.classList.add('info-list-node');
        info.innerHTML = node;
        return info;
    },
    refreshInfoPanels() {[p1,p2].forEach(px=>{px.infoPanel.data.forEach(node => {
            px.infoPanel.list.appendChild(this.createInfoPanelNode(node))
    }) })},
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

    state.returnFromNarrative && [p1,p2].forEach(pz=>pz.board.mode('subspace'));
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
                Array.from(px.shipsPanelShips.children)
                .forEach(ship => {
                    ship.classList.remove('clickable');
                    ship.removeEventListener('click', placeShipsClick)
                });
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

async function autoLoadShips(px) {
    const keys = Object.keys(px.ships);
    const allShips = px.ships;
    for (let i = 0; i < keys.length; i++) {
        console.log("ITERATOR", i, "allShips", allShips.length);//!
        const ship = allShips[keys[i]];
        if (!allShips[keys[i]].location) {
            await new Promise((resolve,reject) => {
                setTimeout(()=>px.board.placeItem.set(ship,resolve,reject),50);
            });
            px.shipsPanel.querySelector(`#${ship.name}`).classList.add('placed-ship');
            console.log("Ship's placement location", ship); //!
        }
    }
    if (px.name !== "BOT") {
        px.shipsPanelBtn.classList.replace('blue', 'red');
        px.shipsPanelBtn.textContent = "Done";
        px.shipsPanelBtn.removeEventListener('click', autoLoadShipsCurry);
        px.shipsPanelBtn.addEventListener('click', readyPlayerX);
    }
    console.log("All Ships Placed. Awaiting opponent place ships.");
}

async function seekNDestroyLoop() {
    await new Promise((resolve) => {
        readyPlayerX = () => {console.log("@targeting:ReadyPlayerX:Resolve");resolve(mode('attack'))};
        buttons.fire.addEventListener('click',readyPlayerX);
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

    await checkGameState();

    saveState('full');
    return switchPlayer(mode,'targeting');
}

const weapons = {
    count:0,
    max:5,
    prev:[],
    active:false,
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
        } else { 
                e.target.classList.add('selected-weapon');
            console.log(e.target);
            state.turn.targetingPanel.target.querySelectorAll('.selected-weapon')
                .forEach(weapon=>weapon!==e.target 
                    && weapon.classList.remove('selected-weapon') );
        };
    
        const originCell = () => {
            const player = state.turn.player; 
            console.log("Player's Ships @ weapon.set > originCell()", player.ships);
            const id = player.ships[shipName].location[0];
            return player.board.cells[id];
        };
    
        const handleColor = (option,data) => {
            console.log("handleColor("+option+data+")");
            console.log(data);
            switch (option) {
                case 'maxed-weapon': this.prev[this.prev.length -1].target.classList.add('maxed-weapon'); 
                    console.log("@handleColor maxed-weapon case triggered")
                break;
                case 'removed': e.target.classList.add('selected-weapon'); break;
                default: weapon().remaining===0
                    ? e.target.classList.replace('selected-weapon', 'depleated-weapon')
                    : e.target.classList.remove('selected-weapon');
            }
        };

        const updateInfo = (weapon) => {
                this.prev[this.prev.length -1].target.setAttribute('data-before', weapon.max - this.count)
        }
    
        const checkDone = (option, weapon) => {
            console.log("checkDone("+option+", "+weapon+")");
            const self = this;
            switch (option) {
                case 'add': {this.count++; typeof weapon.remaining==='number' && weapon.remaining--;
                } break;
                case 'remove': { this.count--; typeof weapon.remaining==='number' && weapon.remaining++;

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
            (weapon)=>{checkDone('add',weapon);updateInfo(weapon)},
            (weapon,option)=>{checkDone('remove',weapon);handleColor(option);updateInfo(weapon)},
            state.activeBoard
        ); signal.send();
        
        await new Promise((resolve,reject) => {
            console.log("Weapon Sent:",weapon(),originCell())
            this.active = true;
            const onResolve = (data,option) => { handleColor(option,data); resolve() };
            const onReject = (data,option) => { handleColor(option,data); reject() };
            state.activeBoard.placeItem.set(weapon(), onResolve, onReject, originCell());
        });

        signal.deactivate();
        this.active = false;
        console.log("Weapon Max Reached for turn.")
    },
}

async function handleFire() {
    weapons.count = 0;
    state.activeBoard.signal.clear();
    const count = [0,0];

    await new Promise((resolve) => {
            state.opponent.board.handleFire(state.opponent.ships, resolve) 
    }).then(result =>{ result.forEach(array => {
        const color = array[0]==='Hit' ? 'dgreen' : 'cwhite';
        const num = array[0]==='Hit' ? '+1' : '-1';
        const textNode = `<div class="pill ${color}"></div>${array[0]} on cell ${array[1].name}. <span>${num}</span>`;
        state.turn.infoPanel.add(textNode);
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
    buttons.switchUser.addEventListener('click', ()=>{new Promise((resolve)=>{
        modals.switchUser.show(resolve)}).then(()=>{setActiveBoard(state.turn);switchPlayer();mode('targeting')})});
    buttons.toggleSubspace.target.addEventListener('click', buttons.toggleSubspace.action);
    buttons.pause.addEventListener('click', buttons.pause.show);

    // EVENT HANDLERS
    document.addEventListener('mousemove', (e) => {
        // handleMouseMove(e)
        const elements = document.elementsFromPoint(e.clientX,e.clientY);
        // console.log(elements)//!
        if (elements.includes(p1.shipsPanel) 
            | elements.includes(p2.shipsPanel) 
            | elements.includes(p1.statusPanel) 
            | elements.includes(p2.statusPanel) 
            | elements.includes(p1.infoPanel.target)
            | elements.includes(p2.infoPanel.target)
            | elements.includes(buttons.dbControlsGrid)) {
            document.querySelector('main').style.pointerEvents = 'none';
        } else {
            document.querySelector('main').style.pointerEvents = 'all';}
    });

    // INIT PLAYER SPECIFFIC ITEMS
    [p1,p2].forEach(px => {
        px.infoPanel.target.querySelector('h3').textContent = px.player.name;
        px.infoPanel.target.querySelector('p').textContent = px.player.userName;
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
        px.targetingPanel.target.classList.add(px.player.side);
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
                Object.values(ship.weapons).reverse().forEach(weapon => {
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
    getState('profiles'); init(); getState('gameState'); getState('settings');
    mode('pause');
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
    console.log("Return from Narrative?", state.returnFromNarrative);
};




// DATA
function getState(option) {
    console.log("getState("+option+")");
    switch (option) {
        case 'gameMode': {return sessionStorage.getItem('gameMode')}; break;
        case 'storyModePlayer': {return sessionStorage.getItem('storyModePlayer')} break;
        case 'gameKey': {return sessionStorage.getItem('gameKey')} break;
        case 'settings': {settings = JSON.parse(sessionStorage.getItem('settings')); modals.pause.playGame(true)} break;
        case 'full': getState('profiles'); getState('gameState'); getState('settings'); break;

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
            narrativeStatus.render();
            console.log("POSTSTATE",state);
            function GameState(gameState) { console.log("Reconstruct GameState Object");
                this.gameKey = gameState?.state?.gameKey || getState('gameKey');
                this.mode = gameState?.mode || getState('gameMode');
                this.turn = gameState?.state?.turn?.player?.name===p1.player.name ? p1 : p2 || p1;
                this.activeBoard = gameState?.state?.activeBoard?.boardNumber===p1.board.boardNumber ? p1.board : p2.board ?? p2.board;
                this.opponent = gameState?.state?.opponent?.player?.name===p1.player.name ? p1 : p2 ?? p2;
                this.turnsTaken = gameState?.state?.turnsTaken || {player1:[0,0], player2:[0,0]};
                this.update = Date.now();
                this.returnFromNarrative = gameState?.returnFromNarrative || true;
                this.narrative = {
                    winner: gameState?.state?.narrative.winner || 'user',
                    storyModePlayer: getState('storyModePlayer')==='player1' ? p1 : p2 || null,
                    goto: gameState.state?.narrative.goto || 'firstBlood',
                    firstBlood: gameState?.state?.narrative.firstBlood || false,
                    firstSunkenShip: gameState?.state?.narrative.firstSunkenShip || false,
                    turningPoint: gameState?.state?.narrative.turningPoint || false,
                    victoryInSight: gameState?.state?.narrative.victoryInSight || false,
                    winGame: gameState?.state?.narrative.winGame || false,
                    multiAchievement: gameState?.state?.narrative.multiAchievement || []
                };
                this.winner = gameState?.state?.winner || null;
                this.looser = gameState?.state?.looser || null;
                this.gameover = gameState?.state?.gameover || null;
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
            sessionStorage.setItem('settings', JSON.stringify(settings));
            console.log("saveState done.")
        } break;

        case 'profiles': {sessionStorage.setItem('player1', p1.player.PlayerState('str'));
                          sessionStorage.setItem('player2', p2.player.PlayerState('str'));
        } break;
        case 'settings': {sessionStorage.setItem('settings', JSON.stringify(settings))} break;
        case 'gameState': sessionStorage.setItem('gameState', JSON.stringify({state,infoPanels:actions.getPlayerInfoPanels()})); break
        case 'gameMode': sessionStorage.setItem('gameMode', data); break;
    }
}




// MANAGEMENT
async function mode(option,px,py,data) {
    console.log("Dashboard Mode Set:", option, px, data);
    // let usr = !px?.player.name === 'BOT'
    if (!state?.turn && data===false) getState('gameState');
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
            state.returnFromNarrative = false;
            await placeShips();
        }; break;

        case 'ready': { px.status = 'ready';
            state.activeBoard.mode('subspace');
            state.turn = state.turn===p1 ? p2 : p1;
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
            try {state.turn.player} catch {boot()};
            saveState('full', 'targeting');
            headerEl.innerHTML = `<strong>${state.turn.player.name}</strong> Is Targeting`;
            console.log("ALL STATE AT TARGETING", p1,p2,state);
            console.log("@targeting mode disable subspace")
            setActiveBoard(state.opponent, 'targeting', 'subspace', 'static', 'disable-subspace');
            state.returnFromNarrative = false;
            state.multiAchievement = [];
            state.turn.targetingPanel.activate();
            console.log("targeting environment set.");
            !tutorial.howToPlace[0] && notify.show(tutorial.howToPlace[1]);
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

        case 'goto-narrative': {saveState('full'); window.location = "./narrative.html"} break;
        
        case 'summary': { 
            boot();
            headerEl.innerHTML = `Game Over. ${state.winner} Wins!`;
            state.returnFromNarrative = false;
            state.multiAchievement = [];
            setActiveBoard(state.winner===p1.player.name?p1:p2, 'static','disable-subspace', 'static','disable-subspace');
            buttons.fire.addEventListener('click', ()=>checkGameState('summary'));
            buttons.fire.textContent = "view Game Summary";
            buttons.switchUser.textContent = "New Game"
            buttons.switchUser.addEventListener('click', ()=>window.location = "../index.html")
            buttons.enable('fire');
            buttons.disable('switchUser');
        } break;

        case 'pause': {
            document.querySelector('#setting-switch-user-modal').checked = settings.switchUserModal;
            document.querySelector('#setting-switch-user-password').checked = settings.switchUserPw;
            document.querySelector('#setting-dim-brackets').checked = settings.dimBrackets;
            document.querySelector('#setting-opp-subspace').checked = settings.devToggleOppSubspace;
        } break;
        
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

async function checkGameState(multiAchievement,MAGoto) { console.log("checkGameState()", state.narrative.goto);
    const condition = multiAchievement || MAGoto || state.narrative.goto;
    const smp = getState('storyModePlayer') ? true : false;
    const message =  smp
        ? "Press Ok to continue to the narrative."
        : "Press Ok to return to the game";
    const roundWinner = state.turn.which===getState('storyModePlayer')
        ? state.narrative.winner = 'user'
        : state.narrative.winner = 'opp';
    const logo = state.turn.player.side==='starfleet'
        ? '../../assets/svg/Starfleet_badge_illustration_2.svg'
        : '../../assets/svg/borg_insignia.svg'

    switch (condition) {
        case 'firstBlood': {
                if (Object.values(state.turn.player.hits).length > 0) {
                    state.narrative.winner = roundWinner;
                    state.narrative.firstBlood = true; 
                    state.narrative.goto = 'firstSunkenShip';
                    state.turn.infoPanel.add(`<div class="pill gold"></div><strong>First Blood Achieved</strong><img src="${logo}">`);
                    checkGameState('firstSunkenShip');
                    saveState('full');
                    await new Promise((resolve) => {
                        modals.info.show({
                            title: "First Blood",
                            subhead: `${state.turn.player.name} strikes the first hit!`,
                            text: message,
                            action: resolve
                        });
                    });
                } else return false;
            } break;

        case 'firstSunkenShip': { 
            Object.values(state.opponent.player.ships).forEach(ship => {
                if (ship.hits.length===ship.area()) {state.narrative.firstSunkenShip = true}; 
            });
            if (multiAchievement) {return state.multiAchievement.push('firstSunkenShip')};
            if (state.narrative.firstSunkenShip) {
                state.narrative.winner = roundWinner;
                state.narrative.firstSunkenShip = true;
                state.narrative.goto = 'turningPoint';
                state.turn.infoPanel.add(`<div class="pill gold"></div><strong>Sink First Ship Achieved</strong><img src="${logo}">`);
                checkGameState('turningPoint');
                checkGameState('victoryInSight');
                saveState('full');
                await new Promise((resolve) => {
                    modals.info.show({
                        title: "First Sunken Ship",
                        subhead: `${state.turn.player.name} sinks the first ship!`,
                        text: message,
                        action: resolve
                    });
                });
                mode('goto-narrative');
            } else return false;
        } break;

        case 'turningPoint': {            
            const reduction = Object.values(state.opponent.ships).reduce((acc,ship) => {
                if (ship.hits.length===ship.area()) acc++;
                return acc;
            },0);
            if (multiAchievement) {return state.multiAchievement.push('turningPoint')};
            if (reduction == 3) {
                state.narrative.winner = roundWinner;
                state.narrative.goto = 'victoryInSight';
                state.narrative.turningPoint = true;
                state.turn.infoPanel.add(`<div class="pill gold"></div><strong>Turning Point Achieved</strong><img src="${logo}">`);
                checkGameState('victoryInSight');
                checkGameState('winGame');
                saveState('full');
                await new Promise((resolve) => {
                    modals.info.show({
                        title: "Turning Point",
                        subhead: `${state.turn.player.name} gains the upper hand!`,
                        l3: "You've sunk 3/5 of your opponent's ships!",
                        text: message,
                        action: resolve
                    });
                });
            } else return false;
        } break;

        case 'victoryInSight': {
            const reduction = Object.values(state.opponent.ships).reduce((acc,ship) => {
                if (ship.hits.length===ship.area()) acc++;
                return acc;
            },0);
            if (multiAchievement) {return state.multiAchievement.push('victoryInSight')};
            if (reduction == 4) {
                state.narrative.winner = roundWinner;
                state.narrative.goto = 'winGame';
                state.narrative.victoryInSight = true;
                state.turn.infoPanel.add(`<div class="pill gold"></div><strong>Victory In sight Achieved</strong><img src="${logo}">`);
                checkGameState('winGame');
                saveState('full');
                if (roundWinner==='user') {
                    await new Promise((resolve) => {
                        modals.info.show({
                            title: "Victory In Sight",
                            subhead: `${state.turn.player.name} has the enemy on their knees!`,
                            l3: "Only 1 more ship remains. You're on your way to victory!",
                            text: message,
                            action: resolve
                        });
                    });
                } else {
                    await new Promise((resolve) => {
                        modals.info.show({
                            title: "Event Horizon",
                            subhead: `${state.turn.player.name} has ${state.opponent.player.name} on their knees!`,
                            l3: "The future looks grim. Will you make a comeback?",
                            text: message,
                            action: resolve
                        });
                    });
                }
            } else return false;
        } break;
        
        case 'winGame': {
            const reduction = Object.values(state.opponent.ships).reduce((acc,ship) => {
                if (ship.hits.length===ship.area()) acc++;
                return acc;
            },0);
            if (multiAchievement) {return state.multiAchievement.push('winGame')};
            if (reduction == 5) {
                state.narrative.winner = roundWinner;
                state.winner = state.turn.player.name;
                state.looser = state.opponent.name;
                state.narrative.goto = 'summary';
                state.narrative.winGame = true;
                state.mode = 'summary';
                state.turn.infoPanel.add(`<div class="pill ored"></div><strong></strong>Game Winner!</strong><img src="${logo}">`);
                saveState('full', 'summary');
                if (roundWinner==='user') {
                    await new Promise((resolve) => {
                        modals.info.show({
                            title: `Congratulations ${state.turn.player.name}`,
                            subhead: "You've Won the Game!",
                            text: smp ? message : "Press Ok to view a game summary",
                            action: resolve
                        });
                    });
                } else {
                    await new Promise((resolve) => {
                        modals.info.show({
                            title: `${state.turn.player.name} Takes the Victory`,
                            subhead:  `${state.opponent.player.name} has lost`,
                            l3: "Better Luck next time!",
                            text: smp ? message : "Press Ok to view a game summary",
                            action: resolve
                        });
                    });
                }
            } else return false;
        } break;

        case 'summary': {
            if (state.narrative.winGame) {
                state.gameover = true;
                saveState('full');
                function compileGameSummary() {
                    const ul = document.createElement('ul');
                        ul.classList.add('gameSummary');
                    for (let i=0; i<Math.max(p1.infoPanel.data.length,p2.infoPanel.data.length); i++) {
                        const li1 = document.createElement('li');
                            li1.innerHTML = `<strong>${p1.player.name}:</strong> ${p1.infoPanel.data[i]}`
                        const li2 = document.createElement('li');
                            li2.innerHTML = `<strong>${p2.player.name}:</strong>  ${p2.infoPanel.data[i]}`
                        ul.appendChild(li1);
                        ul.appendChild(li2);
                    }
                    return ul;
                }
                await new Promise((resolve) => {
                    modals.info.show({
                        title: `Game Summary`,
                        subhead: `${state.winner} Won`,
                        l3: `${state.looser} Lost`,
                        element: compileGameSummary(),
                        action: resolve
                    });
                });
            } else return false;
        } break;
    }

    //TODO: Any time a ship is sunk, something should happen

    if (!MAGoto) {
        if (state.multiAchievement.length > 0) {
            for (let i=0; i<state.multiAchievement.length; i++) {
                await checkGameState(null,state.multiAchievement[i])
            }
        };
        if (smp && !state.gameover) {
            switchPlayer();
            saveState('gameState');
            mode('goto-narrative');
        } else return true;
    }
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