const userName = {
    username:'string',
    password:'string',
    gameState: 'in-progress|win|loose',
    gameKey:'number',
    update:'unix timestring',
    opponent:'[{bot}||username||name,gameKey]',
    side:'string',
    ships:'object',
    hits:'array',
    misses:'array',
    score:'number',
    damage: {
        health:'number',
    },
    boardDisplayConfig:'array',
    storageEnabled:'bool',
    storyMode:'bool',
    turnTimer:'string',
    useRightSide:'bool',
    useOffset:'bool',
    narrative: {
        goto:'string',
        winner:'string',
        'part1-6': {winner: 'user|bot', option: 'A-D', response:'string'},
        path: {duty:'number', courage:'number'},
    },
    games/*previous*/: {
        'gameKey(playerState)': {
            gameKey:'number',
            gameState: 'in-progress|win|loose',
            update/*completed|frozen*/:'unix timestring',
            opponent:'[{bot}||username||name,gameKey]',
            side:'string',
            ships:{'name':['sillhouette']},
            hits:'array',
            misses:'array',
            score:'number',
            damage: {
                hits:'array'/*from opponent's hits object*/,
                health:'number',
            },
            narrative: {
                winner:'string',
                'part1-6': {winner: 'user|bot', option: 'A-D'},
                path: {duty:'number', courage:'number'},
            }
        },
    },
}

const p2UserConfig = {
    username:'McKenna',
    password:'string',
    storageEnabled:false,
    games: {
        '1766444398210':{
            gameKey:1766444398210,
            update:1766444398210,
            opponent:null,
            side:'starfleet',
        },
    },
    confing:  {
        boardDisplayConfig:[],
        storyMode:true,
        useOffset: true,
        turnTimer: '02:00.00',
        boardSize: 26,
        useStorage:false,
    }
}