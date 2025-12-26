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
const DefaultConfig = {
    username:'Default',
    password:'password',
    storageEnabled:false,
    gameKey:null,
    side:'starfleet',
    config:  {
        boardDisplayConfig:['default'],
        storyMode:true,
        useOffset: true,
        turnTimer: '00:00.00',
        boardSize: 26,
    }
}

let gameKey;

function handleUserSetupSubmit() {
    gameKey = gameKey || Date.now();
    const result = { gameKey };
    target.querySelectorAll('input').forEach(input => {
        switch (input.id) {
            case 'modal-player-name': {result['name'] = input.value !== '' ? input.value : "player"+playerNum} break;
            case 'modal-username': {input.value !== '' && (result['username'] = input.value)} break;
            case 'modal-password': {input.value !== '' && (result['password'] = input.value)} break;
            case 'modal-choose-starfleet': {input.checked && (result['side'] = 'starfleet')} break;
            case 'modal-choose-enemy': {input.checked && (result['side'] = 'enemy')} break;
        }
    });
    settingsPane.querySelectorAll('input').forEach(input => {
        switch (input.id) {
            case 'settings-storageEnabled': {result['storageEnabled'] = result.username ? input.checked : false} break;
            case 'settings-storyMode': {result['storyMode'] = input.checked} break;
            case 'settings-turnTimer': {input.checked && (result['turnTimer'] = document.querySelector('input[type=number]').value)} break;
        }
    });
    !result.side && (result['side'] = 'starfleet');
    return result;
}

const createNewGameState = (userConfig) => Object({
    gameKey,
    update:gameKey,
    side:userConfig.side,
    narrative: {
        goto:'intro',
        gotoNext:'part0',
        winner:'user',
        path: {duty:0, courage:0},
    }
})

function userSetupManager(e) {
    modalUserNnumber.textContent = `Player # ${playerNum}/${numPlayers}`
    const userConfig = handleUserSetupSubmit();
    const userExists = JSON.parse(localStorage.getItem(userConfig.username));

    if (userConfig.storageEnabled && userExists && userExists.password === userConfig.password) {
        userConfig.name = userExists.name;
        userExists.games[userConfig.gameKey] = createNewGameState(userConfig);
        localStorage.setItem(userExists.username, JSON.stringify(userExists));
    } else if (userConfig.storageEnabled && userExists && userExists.password !== userConfig.password) {
        let num = 1; let search = true;
        while (search) {
            if (num > 10) {console.error("Too many users with the same name. Please restart & choose a different username");
                break};
            localStorage.getItem(`userConfig.username${num}`) ? search = false : num++;
        };
        userConfig.username = `userConfig.username${num}`;
        const newUser = {
            username:userConfig.username,
            name:userConfig.name,
            password:userConfig.password,
            games: {}
        };
        newUser.games[userConfig.gameKey] = createNewGameState(userConfig);
        localStorage.setItem(newUser.username, JSON.stringify(newUser));
    };

    userConfig['games'] = {[userConfig.gameKey]: createNewGameState(userConfig)};

    if (userConfig.storyMode) {
        const item = {user:userConfig.username, location:(userConfig.storageEnabled ? 'local' : 'session')};
        numPlayers===1 && sessionStorage.setItem('storyModePlayer', JSON.stringify(item))
        numPlayers===2 && !sessionStorage.getItem('storyModePlayer') && sessionStorage.setItem('storyModePlayer', JSON.stringify(item))
    }

    target.querySelectorAll('input').forEach(input => {
        if (!input.id.includes('settings')) input.value = ''; input.checked = false;
    });

    sessionStorage.setItem(`player${playerNum}`, JSON.stringify(userConfig));

    if (playerNum===numPlayers) {
        if (numPlayers===1) {sessionStorage.setItem('player2', JSON.stringify(BotConfig));}
        sessionStorage.setItem('gameMode', 'init');
        window.location = "./screens/dashboard/dashboard.html"
    };
    playerNum++;
} 