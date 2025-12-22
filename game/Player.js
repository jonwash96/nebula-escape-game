export class Player {
    static playerNum = 0;
    constructor(userConfig) {
        Player.playerNum++;
        this.name = userConfig.name;
        this.#password = userConfig.password;
        this.side = userConfig.side;
        this.gameKey = userConfig.gameKey;
        this.#storageEnabled = userConfig.storageEnabled;
        this.ships = {...ships[userConfig.side]};
    }

    // PRIV
    #password;
    #opponent;
    #storageEnabled;
    #lastUpdate;

    // VAR
    board;
    score = 0;
    hits = [];
    misses = [];

    // OBJ
    damage = {
        player: this,
        health: 0,
        hits: [],
        dec(num) {this.damage++},
        get() {return this.player.score - this.damage}
    }

    narrative = {
        goto:'string',
        gotoNext:'string',
        winner:'string',
        path: {duty:0, courage:0},
    }
    
    // FUNC
    updateHistory() {
        if (this.#storageEnabled) {
            const user = JSON.parse(localStorage.getItem(this.username));
            [board,score,hits,misses,damage,narrative]
            .forEach(item=>{
                user.games[this.gameKey][this[item]] = this[item]});
        }
    }
}