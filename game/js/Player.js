import Ships from "./Ships.js";
import Board from "..Board.js";

export default class Player {
    static playerNum = 0;
    constructor(userConfig, boardEl, targetingEl, options) {
        Player.playerNum++;
        this.name = userConfig.name ;
        this.playerNum = Player.playerNum;
        console.log("Construct new Player: ("+Player.playerNum+") With: ",userConfig)
        this.storageEnabled = userConfig.storageEnabled;
        this.username = userConfig.username;
        userConfig.password && (this.password = userConfig.password);
        this.side = userConfig.side;
        this.gameKey = userConfig.gameKey;
        this.games = userConfig.games;

        this.board = new Board(boardEl, targetingEl, userConfig.board, options);
        this.board.render();
        this.shipsConstructor = new Ships(userConfig);
        this.ships = this.shipsConstructor.ships;
        this.storyMode = userConfig.storyMode;
        this.narrative = userConfig.narrative;

        this.update = userConfig.update || Date.now();
        this.score = userConfig.score || 0;
        this.hits = userConfig.hits || [];
        this.misses = userConfig.misses || [];
        this.damage['health'] = userConfig.health
            || Object.values(this.ships).reduce((accumulator,ship) =>{
                accumulator += ship.area() },0);
        
        console.log("PLAYER number", this.playerNum, "created");
    }

    // OBJ
    damage = {
        health: 0,
        hits: () => Object.values(this.ships).map(ship =>
            ship.location.filter(cell=>cell.getAttribute('hit'))),
        dec(num) {this.damage++},
        get() {return this.player.score - this.damage.health}
    }

    // CONSTRUCTORS
    Profile() {
        let item;
        const profile = {};
        for (item of ['name','username','password','storageEnabled']) {
            profile[item] = this[item] };
        return profile;
    }
        
    PlayerState(option) {
        let item;
        const playerState = {};

        for (item of ['name','username','password','storageEnabled']) {
            playerState[item] = this[item] 
        };
        for (item of ['gameKey','update','side','games','hits','misses','health','score','narrative','board','ships']) {
            if (item==='health') {playerState['health'] = this.damage.health;
            } else {playerState[item] = this[item]} 
        };
        
        if (option==='str') return JSON.stringify(playerState);
        return playerState;
    }
}