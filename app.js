const menu = document.getElementById('menu');
const startMenuOptions = document.querySelector('#start-menu div');
const loadMenuOptions = document.querySelector('#load-menu div');
const registration = document.getElementById('registration-modal');
const modalUserNnumber = document.querySelector('.modal-user-number');
const settingsPane = document.getElementById('settings-pane');

let numPlayers = 0;
let playerNum = 0;

document.addEventListener('click', (e) => {
    // console.log(e.target.textContent)
    switch (e.target.textContent) {
        case 'Start': startMenuOptions.classList.toggle('expand'); break;
        case '1_Player': numPlayers = 1; playerNum++; registration.classList.toggle('hide');console.log(numPlayers, playerNum); break
        case '2_Player': numPlayers = 2; playerNum++; registration.classList.toggle('hide'); console.log(numPlayers, playerNum); break;
        case 'Load': loadMenuOptions.classList.toggle('expand'); break;
        case 'Rules': element.classList.toggle('expand'); break;
        case 'Game Setup': settingsPane.classList.toggle('hide'); break;
    }
    modalUserNnumber.textContent = `Player # ${playerNum}/${numPlayers}`
})
