import Ships from "../../components/Ships/ships.js";
import Board from "../../components/board/Board.js";

export default class Player {
    static playerNum = 0;
    constructor(userConfig, boardEl, targetingEl, options) {
        Player.playerNum++;
        this.playerNum = Player.playerNum;
        console.log("Construct new Player: ("+Player.playerNum+") With: ",userConfig)
        this.storageEnabled = userConfig.storageEnabled;
        this.name = userConfig.name ;
        this.username = userConfig.username;
        !userConfig.password ?? (this.password = userConfig.password);
        this.side = userConfig.side;
        this.gameKey = userConfig.gameKey;
        this.games = userConfig.games;

        this.board = new Board(boardEl, targetingEl, userConfig.board, options);
        this.board.render();
        this.shipsClass = new Ships(userConfig);
        this.ships = this.shipsClass.ships;
        this.storyMode = userConfig.storyMode;
        this.narrative = userConfig.narrative;

        this.update = userConfig.update || Date.now();
        this.score = userConfig.score || 0;
        this.hits = userConfig.hits || [];
        this.misses = userConfig.misses || [];
        this.damage['health'] = userConfig.damage?.health 
            || Object.values(this.ships).reduce((accumulator,ship) =>{
                accumulator += ship.area() },0);
        
        console.log("PLAYER number", this.playerNum, "created")
    }

    // OBJ
    damage = {
        health: 0,
        hits: () => Object.values(this.ships).map(ship=>ship.location.filter(cell=>cell.getAttribute('hit'))),
        dec(num) {this.damage++},
        get() {return this.player.score - this.damage.health}
    }
}