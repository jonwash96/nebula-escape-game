import Ships from "../../components/Ships/ships.js";
import Board from "../../components/board/Board.js";

export default class BOT {
    constructor(botConfig, boardEl, options) {
        this.name = 'BOT';
        this.username = 'BOT';
        this.difficulty = botConfig.difficulty;
        this.side = botConfig.side || 'enemy';
        this.gameKey = botConfig.gameKey;
        this.shipsClass = new Ships(botConfig);
        this.ships = this.shipsClass.ships;
        
        this.board = new Board (boardEl, botConfig.board, options);
        this.board.mode('enable-bot-board');
    }

    score = 0;
    hits = [];
    misses = [];

    damage = {
        health: 0,
        hits: () => Object.values(this.ships).map(ship=>ship.location.filter(cell=>cell.getAttribute('hit'))),
        dec(num) {this.damage++},
        get() {return this.player.score - this.damage.health}
    }

    status = {mode:null}

    mode(option, data) {
        this.status.mode = option;
        const self = this;
        console.log("BOT Mode Set:", option, data);
        switch (option) {
            case 'place-ships': {this.placeShips(data)} break;
            case 'discovery': {} break;
            case 'strategic-discovery': {} break;
            case 'hunt': {} break;
            case 'im-a-teapot': {} break;
            case 'deception': {} break; 
            default: return this.status.mode;
        }
    }

    async placeShips(data) {
        for (let ship of Object.values(this.ships)) {
            try {
                await new Promise((resolve,reject) => {
                    this.board.setShipToPlace(ship, ()=>null, ()=>null)

                    const gen = (max,raise=0) => String(Math.floor((Math.random() * max) + raise)).padStart(2,'0');
                    const orientations = [0,90,180,270];
                    const randomCell = () => `${gen(26,1)}${gen(26,1)}`;
                    const randomOrientation = () => orientations[Number(gen(4))];
                    this.board.shipRotation = randomOrientation(); 
                    
                    let count = 0;
                    let hoverCells, cell;
                    while (count < 100) {
                        const random = randomCell();
                        cell = this.board.cells[random];
                        // console.log("Cell ID to place: ",random, cell) //!
                        hoverCells = this.board.hoverSillhouette([cell.target])
                        // console.log("HOVERCELLS", hoverCells) //!
                        const impeded = hoverCells.some(cell=>cell.target.classList.contains('impededCell')) ? true : false;
                        const outOfBounds = hoverCells.length < ship.area();
                        if (!impeded && !outOfBounds) {
                            // console.log("Try place cells:", hoverCells) //!
                            resolve( this.board.placeShip({target:cell.target}) )
                        } else count++;
                    } reject("count: "+count);
                })
            } catch (err) {console.error(err)}
        }
        data.readyPlayerX();
    }
}
