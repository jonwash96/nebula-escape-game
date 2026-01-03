import { nav } from "../../nav_dev.js";nav();
import { story } from "../../assets/story/story.js";

const promptWrapperEl = document.getElementById('prompt-wrapper');
const promptTextEl = document.getElementById('prompt-text');
const titleEl = promptTextEl.children[0];
const subtitleEl = promptTextEl.children[1];
const narrativeEl = promptTextEl.children[2];
const imageEl = document.querySelector('img');
const promptOptionsEl = document.getElementById('prompt-options');
const continueBtn = document.getElementById('continue');

// DEV MODE // Advanced users may use this to explore the app or reference a speciffic chapter
const devMode = true;
document.getElementById('reset-storage').addEventListener('click',resetPlayerState);
document.getElementById('new-outcome').addEventListener('click',handleOutcomes);
document.getElementById('back-to-bridge').addEventListener('click', exitStoryMode);
const devModeBtns = document.querySelectorAll('.goto');
devModeBtns.forEach(el=>el.title = "dev-mode dissabled");
document.getElementById('toggle-dev-mode-1').addEventListener('click', (e) => {
    const enableDevMode = () => devModeBtns.forEach(el=> {
        el.addEventListener('click', e=> {
            player.narrative.goto = e.target.id.replace('goto-', '');
            sessionStorage.setItem('player', JSON.stringify(player));
            console.log(e.target.id);
            window.location.reload();
    }); el.title = el.id});
    document.getElementById('toggle-dev-mode-2').addEventListener('click',enableDevMode);
    setTimeout(()=>document.getElementById('toggle-dev-mode-2').removeEventListener('click',enableDevMode), 5000)
});

Array.prototype.randomIDX = function() {return this[Math.floor(Math.random() * this.length)]};

let storyModePlayer, player;
let response, gotoNext;
let handleWinCondition = 0;

try {storyModePlayer = sessionStorage.getItem('storyModePlayer')
    player = JSON.parse(sessionStorage.getItem(storyModePlayer));
    if (player.narrative == null) throw new Error("Error getting player state. Resolving. . .")
    console.log("PlayerState succcess");
    console.log(player.narrative);
} 
catch (err) {
    console.warn(err)
    if (err.message.includes('storyModePlayer is not defined')) {
        window.location = "../screens/dashboard/dashboard.html"}
    player = {
    winner:'user',
    narrative: {goto:'intro',
        path: {duty:0,courage:0}
    }
}}

render(player.narrative.goto, player.winner);

// TODO: Put the lore on the title screen.

function render(goto, winner) {
    let useTitle, useNarrarive, useOutcome, usePrompts;
    switch (goto) {
        case 'intro': {
            winner = 'user';
            sessionStorage.setItem('gameMode', 'place-ships')
            document.querySelector('h3').innerHTML = '';
            useNarrarive = story[goto].narrative[0];
            useTitle = story[goto].title;
            continueBtn.classList.add('active');
            continueBtn.addEventListener('click', exitStoryMode)
            setTimeout(()=>continueBtn.classList.replace('sdblue', 'red'), 30000);
        } break;
        case 'part1': {
            winner = 'user'; 
            sessionStorage.setItem('gameMode', 'begin-game')
        } break;
        case 'part2': break;
        case 'part3': { 
            if (player.winner === 'user') {
                if (player.narrative.part2.winner === 'user' &&
                  player.narrative.part2.option ==="D") {
                    useNarrarive = story[goto][winner].narrative[1];
                    usePrompts = story[goto][winner].altPrompts
                } else {
                    useNarrarive = story[goto][winner].narrative[0]
                };
            } 
            else if (player.winner === 'bot') {
                if (player.narrative.part2.winner === 'user') {
                    if (player.narrative.part2.option ==="D") {
                        useNarrarive = story[goto][winner].narrative[1] 
                    } else {
                        useNarrarive = story[goto][winner].narrative[0]
                    }; 
                } else if (player.narrative.part2.winner === 'bot') {
                    useNarrarive = story[goto][winner].narrative[2]
                }; 
            }; 
        } break;
        case 'part4': break;
        case 'part5': break;
        case 'part6': {handleWinCondition =  player.winner==='user' ? 1 : 100;
            document.querySelector('h3').textContent = "Which Do You Choose?"
            tallyPath() === 'courage'
            ? useOutcome = 1
            : useOutcome = 0
        } break;
    }

    if (goto !== 'intro') {gotoNext = `part${Number(goto.split('')[4]) + 1}`;
    } else {gotoNext = 'part1'};

    titleEl.innerHTML = useTitle || story[goto][winner].title;
    narrativeEl.innerHTML = useNarrarive || story[goto][winner].narrative.randomIDX();
    // imageEl.src = story[goto][winner].image || '';

    goto!=='intro' &&
    (usePrompts || story[goto][winner].prompts).forEach(prompt => {
        const option = document.createElement('div');
            option.classList.add('pill','cyan');
            option.textContent = prompt.option;
            option.setAttribute('id',`for-${prompt.option}`);
        const promptContent = document.createElement('div');
            promptContent.classList.add('option-text');
            promptContent.innerHTML = prompt.prompt;
            promptContent.setAttribute('id',`replace-${prompt.option}`);
        const radio = document.createElement('input');
            radio.setAttribute('type','radio');
            radio.setAttribute('name','prompt-response');
            radio.setAttribute('id',`prompt-${prompt.option}`);
        const label = document.createElement('label');
            label.setAttribute('for',`prompt-${prompt.option}`);
            label.appendChild(option);
            label.appendChild(promptContent);
            label.setAttribute('id',`for-${prompt.option}`);
        const li = document.createElement('li');
            li.appendChild(radio);
            li.appendChild(label);
            li.setAttribute('id',`for-${prompt.option}`);
            new Promise((resolve) => {
                const curry = (e) => {
                    handleWinCondition++;
                    li.removeEventListener('click', curry);
                    resolve(handleResponse(e,prompt,useOutcome))
                }
                li.addEventListener('click', curry);
            });
        promptOptionsEl.appendChild(li);
    });
}

function handleResponse(e,prompt,useOutcome) {
    response = prompt;
    player.narrative[player.narrative.goto] = {
        winnner:player.winner,
        option:response.option,
        prompt, response
    };

    if (handleWinCondition===2) {handleTextResponse(e,prompt); return;}
    
    continueBtn.classList.replace('sdblue', 'red');
    continueBtn.classList.add('active');
    const curry = (e) => handleOutcomes(e,useOutcome);
    if (prompt.outcomes.length > 0) {
        continueBtn.addEventListener('click', curry);
    } else continueBtn.addEventListener('click', exitStoryMode);
}

function handleOutcomes(e,useOutcome) {
    continueBtn.removeEventListener('click', handleOutcomes);
    continueBtn.addEventListener('click', exitStoryMode);
    subtitleEl.innerHTML = "Outcome";
    narrativeEl.innerHTML = response.outcomes[useOutcome] || response.outcomes.randomIDX();
    console.log("player",player)
}

function handleTextResponse(e,prompt) {
    player.narrative[player.narrative.goto] = response;
    continueBtn.removeEventListener('click', handleOutcomes);
    continueBtn.addEventListener('click', exitStoryMode);
    subtitleEl.innerHTML = "Your Response";
    narrativeEl.innerHTML = `<p>"${prompt.prompt}"</p><p.<em>Type your response in the box. . .</em></p>`;
    const text = document.createElement('input');
        text.setAttribute('type','paragraph');
        text.id = 'winner-response';
        text.placeholder = prompt.prompt;
        text.style.backgroundColor = '#000124';
        text.style.color = 'white';
        text.style.paddingLeft = '6px';
        text.style.border = 'none';
        let key = e.target.id.replace('for','replace');
        document.querySelector(`div#${key}`).replaceWith(text);
}

function tallyPath(option) {
    switch (option) {
        case 'add': {
            if (!player.goto==='intro') {
                if (response.path === 'courage') player.narrative.path.courage++;
                if (response.path === 'duty') player.narrative.path.duty++;
            return true;
            }
        } break;
        default: {
            if (player.narrative.path.courage > player.narrative.path.duty) 
                return 'courage';
            else return 'duty';
        }
    }
}

function exitStoryMode() {
    promptWrapperEl.innerHTML = 'loading...';
    devMode && (player.winner = 'user');

    const tally = tallyPath('add');

    player.narrative.goto = gotoNext;
    player.narrative.path[tallyPath()]+1;
    player.update = Date.now();
    if (!player.narrative.goto==='intro') {
    player.narrative[player.narrative.goto] = 
        {winner:player.winner, option:response.option};
    };
    sessionStorage.setItem(storyModePlayer, JSON.stringify(player));

    const currentGame = JSON.parse(localStorage.getItem('currentGame'));
    if (!player.narrative.goto==='intro') {
        currentGame[storyModePlayer].narrative[player.narrative.goto] = 
            {winner:player.winner, option:response.option};
    };
    localStorage.setItem('currentGame', JSON.stringify(currentGame));
    
    devMode && window.location.reload();
    window.location = "../dashboard/dashboard.html"
}

function resetPlayerState() {
    sessionStorage.removeItem('storyModePlayer');
    console.log("PlayerState reset.", 
        JSON.parse(sessionStorage.getItem('storyModePlayer'))
    )
}