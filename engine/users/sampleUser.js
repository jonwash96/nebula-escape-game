const userName = {
    username:'string',
    password:'string',
    storageEnabled:'bool',
    games: {
        'gameKey(playerState)':{
            gameKey:'number',
            update:'unix timestring',
            opponent:'[{bot}||username||name,gameKey]',
            ships:'object',
            side:'string',
            hits:'array',
            misses:'array',
            score:'number',
            damage:{
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
    prefferences:  {
        boardDisplayConfig:'array',
        storyMode:'bool'
    }
}