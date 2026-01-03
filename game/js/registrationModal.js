const target = document.getElementById('registration-modal');
const submitBtn = document.getElementById('submit');
const cancelBtn = document.getElementById('cancel');

submitBtn.addEventListener('click',userSetupManager);
cancelBtn.addEventListener('click', (e)=>{
    target.classList.toggle('hide');
    numPlayers = 0;
    playerNum = 0;
    target.querySelectorAll('input').forEach(input => {
        if (!input.id.includes('settings')) input.value = ''; input.checked = false;
    });
});

!localStorage.getItem('games') && localStorage.setItem('games', JSON.stringify({created:Date.now()}));
!localStorage.getItem('profiles') && localStorage.setItem('profiles', JSON.stringify({created:Date.now()}));

let gameKey;
let holdForErrors = 0;
const players = [];

const BotConfig = {
    name:'BOT',
    username:'BOT',
    storageEnabled:false,
    gameKey:null,
    opponent:null,
    side:'enemy',
    config: {
        storyMode:false,
        useOffset: true,
        turnTimer: '00:03.00',
        boardSize: 26,
    }
}

// HELPER FUNCTIONS
const createNewNarrative = () => Object({
    goto:'intro',
    winner:'user',
    path: {duty:0, courage:0},
})

const savePreviouseGameState = () => {
    if (localStorage.getItem('currentGame')) {
        const games = JSON.parse(localStorage.getItem('games'));
        const previousGame = JSON.parse(localStorage.getItem('currentGame'));
        games[previousGame.gameKey] = previousGame
        return true;
    } else return false;
}

const createNewUser = (userConfig,profiles) => {
    profiles && (profiles[userConfig.username] = new Profile(
            userConfig.name,
            userConfig.username,
            userConfig.password));
    userConfig['narrative'] = createNewNarrative();
    userConfig['gameState'] = 'in-progress';
    userConfig['opponent'] = null;
    return Object(userConfig);
}

function Profile(name,username,password) {
    this.name = name;
    this.username = username;
    this.password = password;
    this.games = [];
}

function Game(player1,player2, gameKey) {
    this.player1 = player1;
    this.player2 = player2;
    this.state = {
        mode:'init',
        gameKey:gameKey,
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
        player1: [0,0],
        player2: [0,0],
    },
    winner:null,
    activeBoard:null,
    turn:null,
    opponent:null,
    }
}

// FUNC
function handleUserSetupSubmit() {
    gameKey = gameKey || Date.now();
    const result = { gameKey };
    target.querySelectorAll('input').forEach(input => {
        switch (input.id) {
            case 'modal-player-name': {result['name'] = input.value !== '' ? input.value : "User"+playerNum} break;
            case 'modal-username': {result['username'] = input.value !== '' ? input.value : result.name} break;
            case 'modal-password': {result['password'] = input.value !== '' ?  input.value : null} break;
            case 'modal-choose-starfleet': {input.checked && (result['side'] = 'starfleet')} break;
            case 'modal-choose-enemy': {input.checked && (result['side'] = 'enemy')} break;
        }
    });
    settingsPanel.querySelectorAll('input').forEach(input => {
        switch (input.id) {
            case 'settings-storageEnabled': {result['storageEnabled'] = result.password ? input.checked : false} break;
            case 'settings-storyMode': {result['storyMode'] = input.checked} break;
            case 'settings-turnTimer': {input.checked && (result['turnTimer'] = document.querySelector('input[type=number]').value)} break;
            case 'settings-useRightSide': {result['useRightSide'] = input.checked} break;
            case 'settings-useOffset': {result['useOffset'] = input.checked} break;
        }
    });
    !result.side && (result['side'] = 'starfleet');
    return result;
}

function userSetupManager(e) {
    modalUserNnumber.textContent = `Player # ${playerNum}/${numPlayers}`
    playerNum===1 && sessionStorage.clear();
    const userConfig = handleUserSetupSubmit();
    const profiles = JSON.parse(localStorage.getItem('profiles'));
    let userExists; try {userexists = profiles[userConfig.username]} catch {null};

    if (userConfig.storageEnabled && userExists && userExists.password === userConfig.password) {
        userExists.games.push(gameKey);
        userConfig.name = userExists.name;
        players.push(createNewUser(userConfig));
    } else if (userConfig.storageEnabled && userExists && userExists.password !== userConfig.password) {
        const message = `<em>User Exists but Password is incorrect. Please choose a different username or check your password. After 2 more attempts, you'll automatically be issued a new username with the password you entered. Check the dev console to manage storage. (Tools &lt; Toggle Developer Tools)</em>`
        if (holdForErrors !== 3) {
            holdForErrors++; 
            document.getElementById('incorrect-password').innerHTML = message;
            return
        };

        let num = 1;
        while (num <= 10) {
            if (localStorage.getItem(`userConfig.username${num}`)) {break} else {num++};
        };
        userConfig.username = `userConfig.username${num}`;
        players.push(createNewUser(userConfig,profiles));
    } else {
        players.push(createNewUser(userConfig,profiles));
    }

    if (userConfig.storyMode) { console.log("Handle Set storymodeplayer")
        if (numPlayers===1) 
            {if (!userConfig.useRightSide) {sessionStorage.setItem('storyModePlayer','player1');
            } else {sessionStorage.setItem('storyModePlayer', 'player2')};
        };
        if (numPlayers===2) 
            if (playerNum===2 && !sessionStorage.getItem('storyModePlayer')) {
                sessionStorage.setItem('storyModePlayer', 'player2')
            } else {console.log("STORYMODE PLAYER SET");sessionStorage.setItem('storyModePlayer', 'player1')};
    };

    target.querySelectorAll('input').forEach(input => {
        if (!input.id.includes('settings')) input.value = ''; input.checked = false;
    });

    if (playerNum===numPlayers) {
        savePreviouseGameState();
        localStorage.setItem('currentGame', JSON.stringify(new Game(...players, gameKey)));

        sessionStorage.setItem('gameKey', gameKey);

        if (numPlayers===1) {
            if (userConfig.useRightSide) {
                sessionStorage.setItem(`player2`, JSON.stringify(userConfig));
                sessionStorage.setItem(`player1`, JSON.stringify(BotConfig));
            } else {
                sessionStorage.setItem('player1', JSON.stringify(userConfig));
                sessionStorage.setItem('player2', JSON.stringify(BotConfig));
            };
        } else {
            players.forEach((player,i) => {
                sessionStorage.setItem(`player${i + 1}`, JSON.stringify(player))
            })
        }
        sessionStorage.setItem('gameMode', 'init');
        window.location = "./screens/dashboard/dashboard.html"
    };
    playerNum++;
} 