
export class Game {
    constructor(config,players) {
        if (config.players===1) {
            this.p1 = new Bot();
            this.p2 = new Player(players[0]);
            this.gamekey = players[0].gamekey;
            this.mode = intro;
            this.currentPlayer = this.p1;
        }
    }

    // OPERATION
    placeShips() {
        this.mode = 'place-ships';
        this.player.board.mode('place-ships');
        this.dashboard.mode('place-ships');
        this.dashboard[currentPlayer].shipsPanel.addEventListener('click', this.dashboard.selectShips.bind(dashboard));
        this.dashboard.ships.forEach(s=>s.classList.add('clickable'));
    }
}

// PLACE SHIPS