import { ships } from "./ships_store.js"
export default class Ships {
    constructor(config) {
        this.side = config.side || 'starfleet';
        this.useOffset = config.useOffset || true;
        Object.values(ships[config.side]).forEach(obj => {
            const ship = Object(ship);
            ship['instance'] = this;
            ship['area'] = this.area.bind(ship);
            ship['offset'] = this.offset.bind(ship);
            ship.weapons.forEach(weapon => {
                weapon['fire'] = this.weapons['weapon'].fire.bind(ship)
            })
        })
    }

    // SHIP METHODS
    area(){return this.sillhouette.flat().filter(c=>c==1).length}
    offset(){return this.instance.useOffset ? Math.floor(this.width / 2) : 0}
}