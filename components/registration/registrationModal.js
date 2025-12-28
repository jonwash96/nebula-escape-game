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

const savePreviouseGameState = (userObject) => {
    const items = ['gameKey','gameState', 'update', 'opponent', 'side', 'hits', 'misses', 'score', 'damage', 'narrative'];
    const gameState = {};
    for (let item of items) {item && (gameState[item] = userObject[item])};
    gameState['ships'] = {};
    for (let ship of userObject.ships) {
        gameState.ships[ship.name] = {
            'sillhouette': ship.sillhouette,
            'location': ship.location,
            'weapons': {}
        };
        for (let weapon of ship.weaponweapons) {
            gameState.ships[ship.name].weapons[weapon] = userObject.ships[ship.name].weapons[weapon].remaining
        }
    }
    return Object(gameState);
}

const createNewUser = (userConfig) => {
    userConfig['narrative'] = createNewNarrative();
    userConfig['games'] = {};
    userConfig['gameState'] = 'in-progress';
    userConfig['opponent'] = null;
    return Object(userConfig);
}

// FUNC
function handleUserSetupSubmit() {
    gameKey = gameKey || Date.now();
    const result = { gameKey, config: {} };
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
    const userConfig = handleUserSetupSubmit();
    const userExists = JSON.parse(localStorage.getItem(userConfig.username));

    if (userConfig.storageEnabled && userExists && userExists.password === userConfig.password) {
        if (userExists.gameState) {
            userExists.games[userExists.gamekey] = savePreviouseGameState(userExists);
            const items = ['gameKey','gameState', 'update', 'opponent', 'ships', 'side', 'hits', 'misses', 'score', 'damage', 'narrative'];
            for (let item of items) {delete userConfig[item]}
        };
        userConfig.name = userExists.name;
        userConfig.games = userExists.games;
        userConfig['narrative'] = createNewNarrative();
        players.push(userConfig);
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
        players.push(createNewUser(userConfig));
    } else {
        players.push(createNewUser(userConfig));
    }

    if (userConfig.storyMode) {
        const item = {user:userConfig.username, location:(userConfig.storageEnabled ? 'local' : 'session')};
        numPlayers===1 && sessionStorage.setItem('storyModePlayer', JSON.stringify(item))
        numPlayers===2 && !sessionStorage.getItem('storyModePlayer') && sessionStorage.setItem('storyModePlayer', JSON.stringify(item))
    }

    target.querySelectorAll('input').forEach(input => {
        if (!input.id.includes('settings')) input.value = ''; input.checked = false;
    });

    if (playerNum===numPlayers) {
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