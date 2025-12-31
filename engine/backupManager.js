export const GFS = {
    incrementals: [],
    differentials: [],
    major: [],
    inc: {
        save(local) {
            const result = { created:Date.now(), player1:{}, player2:{} };
            [p1.player,p2.player].forEach(Player => {
            for (let category of this.templates.incremental) {
                switch (category) {
                    case 'players': {GFS.templates.player.forEach(classItem => {
                        classItem.forEach(item => {
                            result[`player${Player.playerNum}`]['player'][classItem] 
                                = {[item]:Player[classItem][item]};
                    })})} break;
                    case 'gameState': {result['gameState'] = state} break;
                    case 'gameMode': {result['gameMode'] = state.mode} break;   
                    case 'dashboardState': {
                        const px = Player.playerNum===1 ? 'p1' : 'p2';
                        result['dashboardState'] = {
                        [px]: {
                            targetingPanel: document.querySelector(`#${px}-targeting-panel`).classNmae,
                            boardRotation: document.querySelector(`#${px}-board`).classList.contains('rotate'),
                            boardDisplayed: !document.querySelector(`#${px}-board`).classList.contains('hide')
                        }
                    }} break;
                    case 'location': window.location.href; break;
                }
            }});
            this.incrementals = JSON.parse(sessionStorage.getItem('GFS-incrementals'));
            this.incrementals.push(result);
            sessionStorage.setItem('GFS-incrementals', JSON.stringify(this.incrementals))
            local && localStorage.setItem('GFS-incrementals', JSON.stringify(this.incrementals))
        },
        restore() {},
    },
    templates: {
        player: {
            player: [
                "damage",
                "hits",
                "misses",
                "name",
                "narrative",
                "score",
                "update",
            ],
            board: [
                "cells", 
                "shipToPlace", 
                "status", 
                "targeting['className']",
            ],
            ships: [
                ["hits", "location"]
            ]
        },
        incremental: [
            "players",
            "gameState",
            "gameMode",
            "dashboardState",
            "location"
        ],
        differential: [
            "title",
            "playerNum",
            "gameMode",
            "changes",
        ],
        major: [
            "player1",
            "player2",
            "gameState",
            "gameMode",
            "dashboardState",
            "location"
        ]
    },
}
