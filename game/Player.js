import Ships from "../../components/Ships/ships.js";
import Board from "../../components/board/Board.js";

export default class Player {
    static playerNum = 0;
    constructor(userConfig, boardEl, targetingEl, options) {
        Player.playerNum++;
        console.log("Construct new Player: ("+Player.playerNum+") With: ",userConfig)
        this.storageEnabled = userConfig.storageEnabled;
        this.name = userConfig.name ;
        this.username = userConfig.username;
        !userConfig.password ?? (this.password = userConfig.password);
        this.side = userConfig.side;
        this.gameKey = userConfig.gameKey;
        this.shipsClass = new Ships(userConfig);
        this.ships = this.shipsClass.ships;
        console.log('PLAYER SHIPS: ', this.ships)
        this.storyMode = userConfig.storyMode;
        this.narrative = userConfig.narrative;
        this.games = userConfig.games;

        this.update = userConfig.update || Date.now();
        this.board = new Board(boardEl, targetingEl, userConfig.board, options);
        this.score = userConfig.score || 0;
        this.hits = userConfig.hits || [];
        this.misses = userConfig.misses || [];
        this.damage['health'] = userConfig.damage?.health || 0;

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