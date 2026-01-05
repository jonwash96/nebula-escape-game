const menu = document.getElementById('menu');
const startMenuOptions = document.querySelector('#start-menu div');
const loadMenuOptions = document.querySelector('#load-menu div');
const registration = document.getElementById('registration-modal');
const modalUserNnumber = document.querySelector('.modal-user-number');
const settingsPanel = document.getElementById('settings-panel');
const storyModeSetting = document.getElementById('settings-storyMode');

let numPlayers = 0;
let playerNum = 0;

document.addEventListener('click', (e) => {
    switch (e.target.textContent) {
        case 'Start': startMenuOptions.classList.toggle('expand'); break;
        case '1_Player': notify.show(); break
        case '2_Player': numPlayers = 2; playerNum++; registration.classList.toggle('hide'); console.log(numPlayers, playerNum); break;
        case 'Load': loadMenuOptions.classList.toggle('expand'); break;
        case 'Controls': controls.show(); break;
        case 'Browser': notify.show(); break;
        case 'Game Setup': settingsPanel.classList.toggle('hide'); break;
        case 'Gameplay': gameplay.show(); break;
        case 'Clear': localStorage.clear(); sessionStorage.clear(); break;
    }
    if (e.target.id==='settings-turnTimer') {notify.show()}
    modalUserNnumber.textContent = `Player # ${playerNum}/${numPlayers}`
    if (numPlayers===2 && storyModeSetting.checked) {document.getElementById('story-mode-notify').style.display = 'inline'}
})

const notify = {
    root: document.getElementById('notification'),
    target: document.querySelector('#notification div'),
    text: document.querySelector('#notification span'),
    delay: (ms) => new Promise((geaux)=>setTimeout(()=>geaux(),ms)),
    async show() {
        this.target.classList.add('show-notify');
        await this.delay(1000);
        this.target.classList.add('hide-notify');
        await this.delay(2000);
        this.target.classList.remove('show-notify','hide-notify')
    }
}

const gameplay = {
    target: document.getElementById('gameplay-modal'),
    title: document.querySelector('#gameplay-modal h1'),
    text: document.querySelector('#gameplay-modal article'),
    close: document.querySelector('#gameplay-modal .btn-block button:nth-child(1)'),
    controls: document.querySelector('#gameplay-modal .btn-block button:nth-child(2)'),
    begin: document.querySelector('#gameplay-modal .btn-block button:nth-child(3)'),
    listen() { this.close.addEventListener('click', this.function);
               this.controls.addEventListener('click', this.function2);
               this.begin.addEventListener('click', this.function3) },
    function() {gameplay.target.close()},
    function2() {gameplay.target.close();controls.target.showModal()},
    function3() {gameplay.target.close();begin2PlayerGame()},
    show() {this.target.showModal()},
};

const controls = {
    target: document.getElementById('controls-modal'),
    title: document.querySelector('#controls-modal h1'),
    text: document.querySelector('#controls-modal section'),
    close: document.querySelector('#controls-modal .btn-block button:nth-child(1)'),
    gameplay: document.querySelector('#controls-modal .btn-block button:nth-child(2)'),
    begin: document.querySelector('#controls-modal .btn-block button:nth-child(3)'),
    listen() { this.close.addEventListener('click', this.function);
               this.gameplay.addEventListener('click', this.function2);
               this.begin.addEventListener('click', this.function3) },
    function() {controls.target.close()},
    function2() {controls.target.close();gameplay.target.showModal()},
    function3() {controls.target.close();begin2PlayerGame()},
    show() {this.target.showModal()},
};

function begin1PlayerGame() {
    numPlayers = 1; playerNum++; registration.classList.toggle('hide'); 
    console.log(numPlayers, playerNum)
}
function begin2PlayerGame() {
    numPlayers = 2; playerNum++; registration.classList.toggle('hide'); 
    console.log(numPlayers, playerNum)
}

gameplay.listen();
controls.listen();