export class Player {
    static playerNum = 0;
    constructor(userConfig) {
        Player.playerNum++;
        this.name = userConfig.name;
        this.#password = userConfig.password;
        this.side = userConfig.side;
        this.gameKey = userConfig.gameKey;
        this.storageEnabled = userConfig.storageEnabled;
        this.ships = ships[userConfig.side];

        this.health.damage = userConfig.health.damage || 0;
        this.shots = userConfig.shots || {hits:[],misses:[]};
        userConfig.board ?? loadBoardState(); // ! Write this

        
    }

    #password;

    
    board = {};

    health = {
        self: this,
        damage: 0,
        dec(num) {this.damage++},
        get() {return self.ships.points - this.damage}
    }

    updateHistory() {
        if (this.storageEnabled) {
            const user = JSON.parse(localStorage.getItem(this.username));
            ['shots','ships'].forEach(item=>{user.games[this.gameKey][this[item]] = this[item]});
        }
    }
}