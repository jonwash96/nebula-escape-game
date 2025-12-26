import { ships } from "./ships.js";
import Board from "../../components/board/Board.js";

export default class Player {
    static playerNum = 0;
    constructor(userConfig, boardEl, options) {
        Player.playerNum++;
        console.log("Construct new Player: ("+Player.playerNum+") With: ",userConfig)
        this.storageEnabled = userConfig.storageEnabled;
        this.name = userConfig.name;
        this.side = userConfig.side;
        this.gameKey = userConfig.gameKey;
        this.ships = userConfig.ships || Object(ships[userConfig.side]);
        this.storyMode = userConfig.storyMode;
        this.games = userConfig.games || Object(userConfig.games);

        this.lastUpdate = userConfig.lastUpdate || Date.now();
        this.board = new Board(boardEl, userConfig.board, options);
        this.score = userConfig.score || 0;
        this.hits = userConfig.hits || [];
        this.misses = userConfig.misses || [];
        this.damage['health'] = userConfig.damage?.health || 0;

        if (userConfig.storageEnabled === true) {
            this.username = userConfig.username;
            this.password = userConfig.password;
        }
    }

    // OBJ
    damage = {
        health: 0,
        hits: () => Object.values(this.ships).map(ship=>ship.location.filter(cell=>cell.getAttribute('hit'))),
        dec(num) {this.damage++},
        get() {return this.player.score - this.damage.health}
    }
    
    // FUNC
    updateHistory(option) {

        if (this.storageEnabled) {
            let user = {};
            try {
                user = JSON.parse(localStorage.getItem(this.username));
                user['games'] ?? (user['games'] = {});

                ['board','score','hits','misses','damage']
                    .forEach(item=>{ user.games[this.gameKey][item] = this[item] });
                
                user.update = Date.now();
                
                switch (option) {
                    case 'Narrative-force': {user.games[this.gameKey].narrative = this.narrative} break;
                    case 'ships': {user.games[this.gameKey].ships = this.ships} break;
                }
    
                localStorage.setItem(this.username, JSON.stringify(user));
            } catch (err) {
                const errorSafeKey = `${this.username}_errorSafeBAK_${Date.now()}`;
                console.error("ERROR! updateHistory() for "+this.username+"Saving Safe Backup as", errorSafeKey, err);
                localStorage.setItem(errorSafeKey, JSON.stringify(user));
                sessionStorage.setItem('useErrorSafe', errorSafeKey);
            }
        }
    }
}