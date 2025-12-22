const target = document.getElementById('registration-modal');
const submitBtn = document.getElementById('submit');
submitBtn.addEventListener('click',userSetupManager);

function handleUserSetupSubmit() {
    const gameKey = new Date.now();
    const result = {gameKey:gameKey, storageEnabled:false};
    target.querySelectorAll('input').forEach(input => {
        switch (input.id) {
            case 'modal-player-name': {result['name'] = input.value !== '' ? input.value : "player"+this.player} break;
            case 'modal-username': {input.value !== '' && (result['username'] = input.value)} break;
            case 'modal-password': {input.value !== '' && (result['password'] = input.value)} break;
            case 'modal-choose-starfleet': {input.checked && (result['side'] = 'starfleet')} break;
            case 'modal-choose-enemy': {input.checked && (result['side'] = 'enemy')} break;
            default: {}
        }
    });
    !result.side && (result['side'] = 'starfleet');
    return result;
}

function userSetupManager(e) {
    const userConfig = handleUserSetupSubmit();
    const userExists = JSON.parse(localStorage.getItem(userConfig.username));

    if (userExists && userExists.password === userConfig.password) {
        userConfig.storageEnabled = true;
        userConfig.name = userExists.username;
        userExists.games[userConfig.gameKey] = userConfig;
        localStorage.set(userExists.username, userExists);
    } else if (userExists && userExists.password !== userConfig.password) {
        userConfig.storageEnabled = true;
        let num = 1; let search = true;
        while (search) {
            localStorage.getItem(`userConfig.username${num}`) ? search = false : num++;
        };
        userConfig.username = `userConfig.username${num}`;
        const newUser = {
            username:userConfig.username,
            password:userConfig.password,
            games: {}
        };
        newUser.games[userConfig.gameKey] = userConfig;
        localStorage.set(newUser.username, newUser);
    };

    sessionStorage.set('player', userConfig);

    const player = new Player(userConfig);
}