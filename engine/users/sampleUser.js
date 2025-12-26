const userName = {
    username:'string',
    password:'string',
    storageEnabled:'bool',
    games: {
        'gameKey(playerState)': {
            gameKey:'number',
            update:'unix timestring',
            opponent:'[{bot}||username||name,gameKey]',
            side:'string',
            ships:'object',
            hits:'array',
            misses:'array',
            score:'number',
            damage: {
                hits:'array',
                health:'number',
            },
            narrative: {
                goto:'string',
                gotoNext:'string',
                winner:'string',
                'part1-6': {winner: 'user|bot', option: 'A-D'},
                path: {duty:'number', courage:'number'},
            }
        },
    },
    config:  {
        boardDisplayConfig:'array',
        storyMode:'bool'
    }
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