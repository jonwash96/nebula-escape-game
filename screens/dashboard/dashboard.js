import Board from "../components/board/Board.js";
import { config } from "../../game/battleship/config.js";
import { remap } from "../../../engine/utils/math.js";
import { ships } from "../../../game/battleship/ships.js";
import { nav } from "../../nav_dev.js";nav();

const targetingSystem = document.getElementById('load-targeting-System');
let activeProjection;

const dashboard = {
    p1: {
        boardEl: document.getElementById('p1-board'),
        gameSummaryPanel: document.getElementById('p1-summary-text-overlay'),
        shipsPanel: document.getElementById('p1-ships-text-overlay'),
        statusPanel: document.getElementById('p1-status-text-overlay'),
        placeShips(e) {
            if (e.target.classList.contains('ship')) {
                const projection = dashboard.projections[e.target.id];
                if (!activeProjection) {
                    activeProjection = projection;
                    projection.addEventListener('mousemove',handleMouseMove);
                    projection.classList.replace('hide','show');
                    projection.classList.add('project');
                } else {
                    activeProjection.classList.replace('show','hide');
                    activeProjection.removeEventListener('mousemove',handleMouseMove);
                    activeProjection.classList.remove('project');
                    activeProjection = null;
                } 
            }
        }
    },
    p2: {
        boardEl: document.getElementById('p2-board'),
        gameSummaryPanel: document.getElementById('p2-summary-text-overlay'),
        shipsPanel: document.getElementById('p2-ships-text-overlay'),
        statusPanel: document.getElementById('p2-status-text-overlay'),
        ships: {
            enterprise: document.querySelector('#enterprise'),
            titan: document.querySelector('#titan'),
            wallenberg: document.querySelector('#wallenberg'),
            lasirena: document.querySelector('#lasirena'),
            shuttle: document.querySelector('#shuttle')
        },
        projections: {
            enterprise: document.querySelector('#enterprise-projection'),
            titan: document.querySelector('#titan-projection'),
            wallenberg: document.querySelector('#wallenberg-projection'),
            lasirena: document.querySelector('#lasirena-projection'),
            shuttle: document.querySelector('#shuttle-projection')
        },
        placeShips(e) {
            if (e.target.classList.contains('ship')) {
                console.log(ships.starfleet[e.target.id]); //!
                const projection = dashboard.p2.projections[e.target.id];
                if (!activeProjection) {
                    activeProjection = projection;
                    projection.addEventListener('mousemove',handleMouseMove);
                    projection.classList.replace('hide','show');
                    projection.classList.add('project');
                } else {
                    activeProjection.classList.replace('show','hide');
                    activeProjection.removeEventListener('mousemove',handleMouseMove);
                    activeProjection.classList.remove('project');
                    activeProjection = null;
                }
                // this.board.setShipToPlace(player2.ships[e.target.id]);
                // const send = ships.starfleet[e.target.id];
                dashboard.p2.board.setShipToPlace(ships.starfleet[e.target.id]);
            }
        }
    },
    buttons: {
        fire: document.getElementById('btn-fire'),
        focusPlayer: document.getElementById('btn-focus-player'),
        focusEnemy: document.getElementById('btn-focus-enemy'),
        fullBoard: document.getElementById('btn-full-board'),
        pause: document.getElementById('btn-pause'),
        orient: document.getElementById('btn-orient'),
        switchUser: document.getElementById('btn-switch-user'),
        turnTimer: {
            target: document.getElementById('turn-timer'),
            start() {
                this.reset();
                this.target.textContent = config.turnTimer;
            },
            reset() {this.target.textContent = '00:00.00'},
        },
    }
}

function handleMouseMove(e) {
    const hoverOver = document.elementsFromPoint(e.clientX,e.clientY);
    switch (mode) {
        case 'place-ships': {
            brackets.classList.remove(`hide${Board.boardNumber}`);
            brackets.classList.add(`show${Board.boardNumber}`);
            projection.xpos = e.clientX;
            projection.ypos = e.clientY;
            if (follow && hoverOver.includes(game.player.board)) {
                brackets.xpos = remap(e.clientX, 0, window.innerWidth, window.innerWidth*0.10, window.innerWidth*0.9);
                brackets.ypos = remap(e.clientY, 0, window.innerHeight, window.innerHeight*0.1, window.innerHeight*0.90);
                disc.xpos = e.clientX;
                disc.ypos = e.clientY;
                crosshairV.xpos = e.clientX;
                crosshairH.ypos = e.clientY;
                bracketNode.textContent = hoverOver[0].classList;
            } else if (!hoverOver.includes(Board)) {
                this.targeting.classList.remove(`show${Board.boardNumber}`);
                this.targeting.classList.add(`hide${Board.boardNumber}`);
            }
        }
    }
}

async function init() {
    dashboard.p1['board'] = new Board(dashboard.p1.boardEl,targetingSystem,{follow:false,enableTargeting:false});
    await dashboard.p1.board.render();
    dashboard.p2['board'] = new Board(dashboard.p2.boardEl,targetingSystem,{follow:false,enableTargeting:false});
    await dashboard.p2.board.render();
    
    dashboard.buttons.switchUser.addEventListener('click',()=>p2.board.mode('static'));
    dashboard.buttons.switchUser.textContent = 'done';
    dashboard.buttons.orient.addEventListener('click', (e)=>dashboard.p2.boardEl.classList.toggle('rotate'));
    dashboard.buttons.orient.classList.add('clickable');
    dashboard.buttons.switchUser.classList.add('clickable');

    dashboard.p2.board.mode('place-ships');
    dashboard.p2.shipsPanel.addEventListener('click', dashboard.p2.placeShips); //!
    Object.values(dashboard.p2.ships).forEach(s=>s.classList.add('clickable'));

    document.addEventListener('mousemove',(e)=>{
        const elements = document.elementsFromPoint(e.clientX,e.clientY);
        // console.log(elements)//!
        if (elements.includes(dashboard.p2.shipsPanel)) {
            document.querySelector('main').style.pointerEvents = 'none';
        } else {document.querySelector('main').style.pointerEvents = 'all';}
    });

}; await init();