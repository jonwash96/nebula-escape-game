export const ships = {
    starfleet: {
        enterprise: {
            sillhouette: [[0,1,0],[1,1,1],[0,1,0],[1,1,1],[1,0,1],[1,0,1]],
            width:3,
            height:6,
            area(){return this.sillhouette.flat().filter(c=>c==1).length},
            offset(){return config.useOffset ? Math.floor(this.width / 2) : 0}
        },
        titan: {
            sillhouette: [[0,1,0],[1,1,1],[0,1,0],[1,1,1],[1,1,1],[1,0,1],[1,0,1]],
            width:3,
            height:7,
            area(){return this.sillhouette.flat().filter(c=>c==1).length},
            offset(){return config.useOffset ? Math.floor(this.width / 2) : 0}
        },
        laSirena: {
            sillhouette: [[0,1,0],[1,1,1]],
            width:3,
            height:2,
            area(){return this.sillhouette.flat().filter(c=>c==1).length},
            offset(){return config.useOffset ? Math.floor(this.width / 2) : 0}
        },
        wallenberg: {
            sillhouette: [[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0],[1,1,1,1,1],[0,1,0,1,0]],
            width:5,
            height:5,
            area(){return this.sillhouette.flat().filter(c=>c==1).length},
            offset(){return config.useOffset ? Math.floor(this.width / 2) : 0}
        },
        shuttle: {
            sillhouette: [[1],[1]],
            width:1,
            height:2,
            area(){return this.sillhouette.flat().filter(c=>c==1).length},
            offset(){return config.useOffset ? Math.floor(this.width / 2) : 0}
        }
    },
    enemy: {
        borgCube: {
            sillhouette: [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
            width:5,
            height:5,
            area(){return this.sillhouette.flat().filter(c=>c==1).length},
            offset(){return config.useOffset ? Math.floor(this.width / 2) : 0}
        },
        birdOfPrey: {
            sillhouette: [[1,0,1,0,1],[1,1,1,1,1],[0,1,1,1,0],[0,0,1,0,0]],
            width:5,
            height:4,
            area(){return this.sillhouette.flat().filter(c=>c==1).length},
            offset(){return config.useOffset ? Math.floor(this.width / 2) : 0}
        },
        marsShuttle: {
            sillhouette: [[0,1,0],[1,1,1],[0,1,0]],
            width:3,
            height:3,
            area(){return this.sillhouette.flat().filter(c=>c==1).length},
            offset(){return config.useOffset ? Math.floor(this.width / 2) : 0}
        },
        snakehead: {
            sillhouette: [[1],[1]],
            width:1,
            height:2,
            area(){return this.sillhouette.flat().filter(c=>c==1).length},
            offset(){return config.useOffset ? Math.floor(this.width / 2) : 0}
        }
    }
}

const template = {
    sillhouette: [],
    width/*int*/,
    height/*int*/,
    area(){return this.sillhouette.flat().filter(c=>c==1).length},
    offset(){return config.useOffset ? Math.floor(this.width / 2) : 0},
    weapons,
    damage,
    info
}