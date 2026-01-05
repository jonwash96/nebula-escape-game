import { ships } from "./ships_store.js"
import { rayIntersect,cellDistance,parse } from "./math.js";

export default class Ships {
    ships = {};
    constructor(userConfig) {
        this.useOffset = (userConfig.ships?.useOffset ?? userConfig.useOffset) || true;
        Object.values(ships[userConfig.side]).forEach(templateShip => {
            const ship = Object.create(templateShip);
            for (let key in templateShip) {ship[key] = templateShip[key]}

            if (userConfig.ships) {
                if (userConfig.ships[templateShip.name].location) {
                    const existing =  userConfig.ships[templateShip.name].location;
                    ship['location'] = existing;
                    ship.location[1] = Ships.rebuildCellArray(existing[1], userConfig.board.cells);
                }
                if (userConfig.ships[templateShip.name].hits) {
                    const existing =  userConfig.ships[templateShip.name].hits;
                    ship['hits'] = Ships.rebuildCellArray(existing, userConfig.board.cells);
                } else {ship['hits'] = []};
            }

            ship['useOffset'] = userConfig.useOffset;
            ship['area'] = Ships.area.bind(ship);
            ship['offset'] = Ships.offset.bind(ship);

            Object.entries(ship.weapons).forEach(([name,weapon]) => {
                weapon['name'] = Ships.weapons[name].name;
                weapon['max'] = Ships.weapons[name].max;
                weapon['info'] = Ships.weapons[name].info;
                weapon['fire'] = Ships.weapons[name].fire.bind(ship);
            })
            this.ships[ship.name] = ship;
        })
    }

    // SHIP METHODS
    static area(){return this.sillhouette.flat().filter(c=>c==1).length}
    static offset(){return this.useOffset ? Math.floor(this.width / 2) : 0}
    static rebuildCellArray = (arr,cells) => arr.map(cell=>cells[cell.key]);
    getWeaponSymbol = (weapon) => Ships.weapons[weapon].symbol;

    static weapons = {
        photonTorpedo: {
            name: "photonTorpedo",
            symbol: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 459.23 316.56"><g><path d="M161.79,128.82c-.18-.05-.89-.85-.75-.99l12.96-5.03-.07-1.62-20.08-25.37-2.3-3.94,41.73,3.02,1.69-.85L184.51,0l72.2,51.43,14.95-34.45,19.06,38.49L368.32,0l-9.49,87.88,37.46-4.99-23.46,36.65,86.4,38.98-80.19,35.69,22.74,30.47-43.45-2.99,9.98,94.86-71.68-51.45-15.22,34.98-18.75-38.97-78.15,55.44,9.92-87.09-1.2-.8-36.7,5,23.88-36.2-19.39-8.74c-.15-.16.65-.99.75-.99h55.94l.51.99-6.75,10.49,12.48-1.49-6.49,62.41,54.19-38.89,7.25,13.92c.95.71,4.52-9.81,4.95-10.78.2-.47-.29-.9.76-.68l51.22,36.92-6.99-66.91,14.71.98.77-1.21c-1-1.48-7.75-8.59-6.96-9.73l57.42-25.24-61.43-28c-.24-1.1,7.7-10.34,8-12.45.11-.81.03-.83-.73-.73-3.75.51-7.5,1.15-11.27,1.48l6.49-62.91-54.68,39.46-6.76-13.49c-.84-.17-1.01.22-1.42.82-1.5,2.18-2.24,6.94-3.67,9.31-.29.47-.42,1.01-1.12.85l-50.71-36.94,6.95,66.09c-.35,1.24-6.27.9-7.73.83-2.29-.11-5.17-.62-7.46-1.02l-.51.99,4.01,5-.5,1h-50.45ZM19.86,139.11v38.64h218.41v-38.64H19.86ZM242.27,139.11v38.64h13.69v-38.64h-13.69ZM0,139.11v38.64h15.86v-38.64H0ZM280.34,140.9h0c-6.7-1.08-13.53-1.65-20.37-1.74v38.56c6.85-.1,13.67-.66,20.37-1.74h0c17.41-5.2,17.41-29.86,0-35.07Z"/></g></svg>`,
            max: 5,
            info: () => `<li>Select a target on the enemy's board and fire.</li><li>Photon torpedos navigate around obstacles to hit the desired target, exploding there if ti doesn't contact a ship.`,
            fire(originBoardNum, originCell, targetCell, opponentShips) {
                const unhitCells = Object.values(opponentShips).map(ship=>ship.location[1].filter(cell=>!cell.hit));
                if (targetCell.committedCell) {
                    return Ships.weapons.handleHit(targetCell, {originCell, type:'photonTorpedo'}, opponentShips)
                } else {return Ships.weapons.handleMiss(targetCell, {originCell, type:'photonTorpedo'})}
            }
        },
        phaseCannon: {
            name: "phaseCannon",
            symbol: `<svg id="Layer_2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 625.94 420.21"><g id="Layer_3"><path d="M142.71,324.43s24.31-28.16,46.78-29.1c0,0,34.96,7.89,93.49,56.54,0,0-21.08,11.66-15.63,28.24,0,0-66.46,15.05-112.83,2.52,0,0,19.2-8.48,12.08-36.26-6.56-25.58-23.89-21.95-23.89-21.95ZM151.59,380.54c-7.76,2.34-18.3-10.53-19.69-25.76-2.31-25.41,8.75-27.48,8.75-27.48,0,0,16.99-3.61,22.19,20.08,5.4,24.63-8.47,32.33-11.25,33.17ZM160.89,347.8c-3.57-16.27-12.69-18.7-17.82-18.7-1.23,0-2,.15-2.01.16-.09.02-9.24,2.42-7.16,25.34,1.22,13.42,9.64,24.22,15.8,24.22.46,0,.9-.06,1.32-.19.16-.05,15.36-5.82,9.87-30.82ZM210.1,389.7l-8.98.9s16.08,10.98,37.04,18.79c0,0,13.28,6.22,13.28-1.67l1.35,8.35h15.69l-2.94-6.34,14.71-.15s19.61,14.28,28.09,9.73,17.1-18.55,17.1-18.55c0,0-29.97-12.75-42.88-14.9,0,0-2.84.37-8.09,2.4l-2.9-4.77s-19.68,6.2-61.47,6.2ZM358.42,257.6s9.2,3.13,14.83,18.02l31.56-4s17.49,5,19.84,30.78-25.08,43.35-25.08,43.35l22.75-4.33s6.49-1.23,7.98,2.45-.06,7.75-4.42,9.18-40.59,7.77-40.59,7.77c0,0,1.66,9.81-.92,17.66l59.97-14.88s-5.93-13.36-4.24-31.04,8.8-57.26-15.64-71.89-40.03-23.84-55.81-16.81c0,0-2.41-.05-10.22,13.74ZM385.11,317.71l-11.81,15.82,6.75,12.48,7.53-.6s30.08-6.18,33.01-33.22-15.6-38-15.6-38l-31.12,4c6.87,11.9,11.24,39.52,11.24,39.52ZM384.8,239.73s60.64,12.02,60.83,52.88-7.46,46.64,1.11,69.92l61.89-12.22s-19.96-6.52-19.96-22.91,2.78-116.58,2.78-116.58l-92.79,24.46-.81,2.86-13.07,1.58ZM526.15,291.65s-10.2,12.02-11.77,16.37c-9.5,26.31,8.85,40.82,8.85,40.82,0,0,6.38,5.04,15.21,2.98s27.36-10.31,27.36-10.31c0,0-20.63-6.62-20.99-17.64s1.24-20.98,3.87-32.8l-2.88-1.64.79-1.59-20.44,3.81ZM564.51,237.21s-6.46,8.87-5.31,21.48c0,0,.58,4.92,5.4,7.41l16.21-8.14,12.96,18.84,15.76-4.29s-13.02-5.6-19.8-18.86,0-22.09,0-22.09l10.86-9.31-9.27-1.97-10.67,20.37-16.13-3.43ZM491,191.55l-88.94,30.9s-11.07,8.66-10.19,10.56,6.06,1.15,6.06,1.15l93.06-25.03s.61-8.59,0-17.58ZM444.13,206.21l21.7-7.35s-1.57-24.67-4.56-48.09c0,0-.57-2.86-9.49-2.8s-9.98,5.08-9.98,5.08l2.34,53.16ZM436.24,135.5l1.35,17.83s2.02-5.95,15.19-7.51,16.2,7.42,16.2,7.42l-2.37-18.39s-5.76-4.48-15.64-4.06-14.73,4.71-14.73,4.71ZM434.67,135.09s5.68-6.19,17.13-6.34,16.38,5.17,16.38,5.17l2.13,19.41s7.88-3.26,15.32-10.74c5.07-5.1-5.93-13.14-18.69-16.61-5.96-1.62-12.08-1.68-16.72-1.83-14.55-.45-30.67,7.76-33.61,15.04s19.64,13.33,19.64,13.33l-1.57-17.43ZM449.86,122.61c31.67-.89,37.95,14.24,37.95,14.24L483.85,0l-71.93,8.67,4.6,128.09s.73-13.23,33.35-14.14ZM579.84,327.59c-4.86,13.2-13.63,12.69-13.63,12.69,0,0-17.39-2.91-20.4-16.41-2.4-10.77,1.4-19.44,4.03-31.26l26.76,10.62c2.82,2.09,8.1,11.15,3.24,24.36ZM574.79,318.53c0-5.5-3.84-9.97-8.58-9.97s-8.58,4.46-8.58,9.97,3.84,9.97,8.58,9.97,8.58-4.46,8.58-9.97ZM609.73,235.3c-5.18,0-9.38,5.39-9.38,12.04s4.2,12.04,9.38,12.04,9.38-5.39,9.38-12.04-4.2-12.04-9.38-12.04ZM590.31,218.95l-10.88,19.26-14.36-2.04s-31.15-32.51-37.66-38c-6.51-5.48-7.57-18.91-3.86-25.33,3.71-6.42,21.36-12.21,21.36-12.21,16.39,9.46,45.4,58.31,45.4,58.31ZM553.13,176.6c0-3.14-2.55-5.69-5.69-5.69s-5.69,2.55-5.69,5.69,2.55,5.69,5.69,5.69,5.69-2.55,5.69-5.69ZM512.08,307c-10.26,28.43,10.56,44.11,10.56,44.11l1.18,1.23c-33.38-5.5-31.16-26.1-31.16-26.1,1.98-66.33,1.78-122.38.59-134.78-1.19-12.4-12.83-21.11-12.83-21.11l7.52-9.73,17.3-9.99,16.31,20.5c-5.11,19.08,5.11,28.32,5.11,28.32,4.19,53.77,11.77,87.98,11.77,87.98l-14.33,1.91s-10.34,12.96-12.03,17.66ZM510.56,163.79c0-2.3-1.86-4.16-4.16-4.16s-4.16,1.86-4.16,4.16,1.86,4.16,4.16,4.16,4.16-1.86,4.16-4.16ZM389.36,232.55c-2.76,3.26,6.95,4.01,6.95,4.01l-17.4,2.41v-12.07s-8.23-6.06-8.23-6.06c0,0-2.14-6.4.26-13.38,2.41-6.98,16.76-4.11,16.76-4.11l11.75,14.22-1.33,5.39s-6.02,6.32-8.78,9.57ZM389.31,209.8c0-2.29-1.86-4.15-4.15-4.15s-4.15,1.86-4.15,4.15,1.86,4.15,4.15,4.15,4.15-1.86,4.15-4.15ZM561.56,269.16l-14.08,19.76,7.57,3.62,21.48,9.02,16.39-23.27-12.41-18.89-18.95,9.77ZM603.2,222.74c-2.86.58-15.69,8.92-15.69,21s16.78,28.17,26.6,28.17,11.84-13.95,11.84-26.02-13.12-25.1-22.74-23.15ZM421.55,343.21c-.73,0-1.37.13-1.92.36l-41.77,7.5,1.77,9.37,43.69-7.86c2.92-.45,5.04-2.68,5.04-5.36s-3.89-4.02-6.81-4.02ZM158.79,349.26c.32.08.54-.05.66-.39l.75-7.04,1.42,2.82c1.57,3.34,2.01,6.91,2.28,9.55l-2,2.39-3.48.7-.3.18-2.76,7.6-.61-9.27c-.02-.24-.16-.4-.41-.48-.2-.04-.38.03-.52.21l-3.51,5.85-5.68-2.94c-.23-.08-.43-.03-.6.15l-.16,10.55-7.2-7.43c-.18-.14-.37-.17-.57-.08l-3.59,14.06-5.64-13.59c-.24-.13-.47-.1-.66.09l-7.61,9.81-4.63-9.44c-.14-.24-.34-.33-.6-.27l-11.72,17.97-7.12-10.9c-.12-.18-.3-.26-.55-.22l-3.31,7.56-2.58-5.59c-.15-.23-.36-.31-.62-.23l-6.96,9.81-.38-7.45c-.07-.27-.22-.42-.45-.44l-13.32,8.66-6.39-3.32c-.18-.08-.35-.06-.51.04l-.2.58,4.04,12.83-10.41-11.6c-.22-.05-.4.03-.55.24l-4.15,8.42-1.85-7.84c-.16-.31-.39-.41-.69-.31l-11.17,15.11-2.94-9.87c-.07-.21-.22-.34-.47-.37l-8.33,7.91-4.94-4.58-4.12,4.68-2.52-5.86c-.12-.19-.28-.28-.47-.27-.22.02-.37.12-.46.31l-1.54,4.77-2.26-1.89c-.15-.1-.3-.13-.44-.09l-3.46,3.68-2.55-15.33,6.87,4.94c.24.04.43-.05.57-.28l1.79-4.55,8.36,3.39c.23-.04.37-.17.43-.39l1.41-9.24,11.65,2.46,5.25-6.99,9.76,3.99c.13.05.27.04.41-.02.23-.15.32-.35.26-.59l-3.89-15.19,12.37,13.15c.32,0,.5-.17.55-.5l-.45-7.01,6.8,4.62c.23.01.4-.08.51-.27l2.63-6.04,10.6,3.63c.17.06.33.02.5-.11l-3.26-10.26,18.11,8.2c.32-.05.48-.23.49-.56l-1.52-8.4,7.79,6.56c.16.12.32.15.48.1l4.4-14.78.67,13.38c.01.24.15.4.42.48.2.04.37-.03.51-.2l4.69-7.58,15.47,2.81c.16.02.3-.02.41-.11.19-.17.24-.37.15-.61l-4.09-7.56,12.84,7.11c.3-.02.47-.2.5-.53l-.78-6.81,6.02,6.79c.14.15.32.2.54.15l1.79-14.58h.01s16.75,11.97,16.75,11.97ZM210.1,245.94h0s0,0,0,0h0s0,0,0,0M379.91,353.71s9.89,22.42-8.81,39.24c-18.69,16.81-44.65,6.49-44.65,6.49l-54-20.27s-2.43-8.28,2.22-15.39c4.64-7.1,14.76-11.45,14.76-11.45,0,0-53.08-44.82-93.41-58.14,0,0-5.46-2.71-21.43-2.71,0,0,76.54-30.08,126.96-39.27,50.41-9.19,66.36,18.43,66.36,18.43,0,0,9.93,18.23,14.7,47.02l-1.06-1.84-13.62,18.49,11.99,19.42ZM248.28,282.61l58.23-14.28c2.25-1.04,3.31-2.8,3.2-5.27-.53-2.67-2.03-4.18-4.5-4.54l-.57-.03c-.4,0-.81.05-1.21.15l-58.23,14.28c-1.3.55-2.23,1.44-2.79,2.67-.49,1.47-.58,2.56-.29,3.28.79,2.46,2.44,3.76,4.95,3.89.4,0,.81-.05,1.21-.15ZM341.48,292.3c1.11-.27,1.97-.58,2.58-.93.94-.55,1.76-1.16,2.45-1.83.5-.26,1.27-1.41,2.3-3.45.68-1.57.82-3.69.44-6.36-1.84-4.95-5.14-7.48-9.9-7.61h-.01c-.86.02-1.58.09-2.14.23l-58.2,12.49c-1.11.27-1.97.58-2.58.93-1.88,1.1-3.27,2.44-4.17,4.04-.45.8-.78,1.66-.98,2.58-.3,2.41-.33,3.94-.1,4.57.66,2.26,1.68,4.04,3.07,5.36.69.66,1.48,1.19,2.35,1.61l1.38.54c.97.3,2.02.49,3.17.55.56.02,1.28-.06,2.15-.23l58.2-12.49ZM350.46,344.43c0-9.49-7.69-17.18-17.18-17.18s-17.18,7.69-17.18,17.18,7.69,17.18,17.18,17.18,17.18-7.69,17.18-17.18ZM333.28,331.52c-7.14,0-12.92,5.78-12.92,12.92s5.78,12.92,12.92,12.92,12.92-5.78,12.92-12.92-5.78-12.92-12.92-12.92Z"/></g></svg>`,
            max: 4,
            info: () => `<li>Location Revealing</li><li>Set a target(s) point anywhere on the enemy's board & fire a shot. The phaseCannon will hit the first thing it comes in contact with</li><li>Does not hit your own ships</li>`,
            fire(originBoardNum, originCell, targetCell, opponentShips) {
                const unhitCells = Object.values(opponentShips).map(ship=>ship.location[1].filter(cell=>!cell.hit)).flat(1);
                const intersects = [];
                console.log("Map Opponent Ship", Object.values(opponentShips).map(ship=>ship))
                unhitCells.forEach(cell=>{
                    if (rayIntersect(originBoardNum, originCell.target.id, targetCell.target.id, cell.target.id)) 
                        intersects.push(cell);
                });
                if (unhitCells.length === 0) return "Miss! The Phase Cannon did not hit any targets."
    
                const origin = parse(originCell.target.id);
                const closest = intersects.reduce((best, cell) => {
                    // Heavily-Guided AI-Generated Reducer
                    const p = parse(cell.target.id);
                    const dist = Math.hypot(p.row - origin.row, p.col - origin.col);
                    if (!best) {return { cell, row: p.row, dist }}
                    // Primary: lowest row
                    if (p.row < best.row) {return { cell, row: p.row, dist }}
                    // Tie-breaker: same row → closest distance
                    if (p.row === best.row && dist < best.dist) {
                        return { cell, row: p.row, dist: d };
                    }
                    return best;
                }, null)?.cell;
    
                return Ships.weapons.handleHit(closest, {originCell, type: 'phaseCannon'}, opponentShips);
            }
        },
        handleHit(targetCell, obj, ships) { // obj = {originCell, type:'photonTorpedo'}
            targetCell['hit'] = obj;
            targetCell.target.classList.remove('targetedCell');
            targetCell.target.classList.add('hitCell');
            targetCell.target.classList.add(obj.type);
            for (let ship in ships) {
                ships[ship].location[1].forEach(cell => {
                    if (cell.key===targetCell.key) {
                        ships[ship].hits.push(targetCell) };
                });
            }
            console.log(`Target Hit! (${targetCell.target.classList[0]})`);
            return ['Hit', targetCell];
        },
        handleMiss(targetCell, obj) {
            targetCell['miss'] = obj;
            targetCell.target.classList.remove('targetedCell');
            targetCell.target.classList.add('missCell');
            targetCell.target.classList.add(obj.type);
            console.log(`Target Miss! (${targetCell.target.classList[0]}))`);
            return ['Miss', targetCell];
        }
    }
}
