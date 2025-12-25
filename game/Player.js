import { ships } from "./ships.js";
import Board from "../../components/board/Board.js";

export default class Player {
    static playerNum = 0;
    constructor(userConfig, boardEl, options) {
        Player.playerNum++;
        console.log(userConfig.storageEnabled)
        this.#storageEnabled = userConfig.storageEnabled || false;
        this.name = userConfig.name;
        this.side = userConfig.side;
        this.gameKey = userConfig.gameKey;
        this.ships = Object(ships[userConfig.side]);
        this.storyMode = userConfig.storyMode;
        if (userConfig.storageEnabled) {
            this.username = userConfig.username;
            this.#password = userConfig.password;
        }

        this.board = new Board(boardEl, options)
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
        hits: () => Object.values(this.ships).map(ship=>ship.location.filter(cell=>cell.getAttribute('hit'))),
        dec(num) {this.damage++},
        get() {return this.player.score - this.damage.health}
    }

    narrative = {
        goto:'string',
        gotoNext:'string',
        winner:'string',
        path: {duty:0, courage:0},
    }
    
    // FUNC
    updateHistory(option) {
        if (this.#storageEnabled) {
            let user = {};
            try {
                user = JSON.parse(localStorage.getItem(this.username));
                [board,score,hits,misses,damage]
                    .forEach(item=>{ user.games[this.gameKey][this[item]] = this[item] });
                
                switch (option) {
                    case 'Narrative-force': {user.games[this.gameKey].narrative = this.narrative} break;
                }
    
                localStorage.setItem(this.username, user);
            } catch (err) {
                const errorSafeKey = `${this.username}_errorSafeBAK_${Date.now()}`;
                console.error("ERROR! updateHistory() for "+this.username+"Saving Safe Backup as", errorSafeKey, err);
                localStorage.setItem(errorSafeKey, JSON.stringify(user));
                sessionStorage.setItem('useErrorSafe', errorSafeKey);
            }
        }
    }
}