import { nav } from "../../nav_dev.js";nav();
import { config } from "../../game/battleship/config.js";
import { story } from "../../assets/story/createStory.js";

const promptWrapperEl = document.getElementById('prompt-wrapper');
const promptTextEl = document.getElementById('prompt-text');
const titleEl = promptTextEl.children[0];
const subtitleEl = promptTextEl.children[1];
const narrativeEl = promptTextEl.children[2];
const imageEl = document.querySelector('img');
const promptOptionsEl = document.getElementById('prompt-options');
const continueBtn = document.getElementById('continue');

const random = (array) => array[Math.floor(Math.random() * array.length)];
Array.prototype.randomIDX = function() {return this[Math.floor(Math.random() * this.length)]};

// let playerState = JSON.parse(sessionStorage.getItem('player'));
let response, gotoNext;
let handleWinCondition = 0;
let handleLooseCondition = false;
const playerState = {
    winner:'bot',
    narrative: {goto:'part6',
        part2: {winner: 'user', option: 'A'},
        path: {duty:1,courage:10}
    }
}
document.getElementById('new-outcome').addEventListener('click',handleOutcomes);
render(playerState.narrative.goto, playerState.winner);
// console.log(story[playerState.narrative.goto][playerState.winner].title)

// TODO: Put the lore on the title screen.

function render(goto, winner) {
    gotoNext = `part${Number(goto.split('')[4]) + 1}`;
    let useTitle, useNarrarive, useOutcome, usePrompts;
    switch (goto) {
        case 'intro': useTitle = story[goto].title; gotoNext = 'part0';
        case 'part1': useNarrarive = story[goto].narrative[0]; break;
        case 'part2': break;
        case 'part3': { 
            if (playerState.winner === 'user') {
                if (playerState.narrative.part2.winner === 'user' && playerState.narrative.part2.option ==="D") {
                    useNarrarive = story[goto][winner].narrative[1];
                    usePrompts = story[goto][winner].altPrompts
                } else {
                    useNarrarive = story[goto][winner].narrative[0]
                };
            } else if (playerState.winner === 'bot') {
                if (playerState.narrative.part2.winner === 'user') {
                    if (playerState.narrative.part2.option ==="D") {
                        useNarrarive = story[goto][winner].narrative[1] 
                    } else {
                        useNarrarive = story[goto][winner].narrative[0]
                    }; 
                } else if (playerState.narrative.part2.winner === 'bot') {
                    useNarrarive = story[goto][winner].narrative[2]
                }; 
            }; 
        } break;
        case 'part4': break;
        case 'part5': break;
        case 'part6': {handleWinCondition =  playerState.winner==='user' ? 1 : 100;
            tallyPath() === 'courage'
            ? useOutcome = 1
            : useOutcome = 0
        } break;
    }

    titleEl.innerHTML = useTitle || story[goto][winner].title;
    narrativeEl.innerHTML = useNarrarive || story[goto][winner].narrative.randomIDX();
    imageEl.src = story[goto][winner].image || '';

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

    if (handleWinCondition===2) {handleTextResponse(e,prompt); return;}
    // if (handleWinCondition>100) {handleDefeat(e,prompt); return;}
    
    const curry = (e) => handleOutcomes(e,useOutcome);
    prompt.outcomes.length > 0
    ? continueBtn.addEventListener('click', curry)
    : exitPrompt();
}

function handleOutcomes(e,useOutcome) {
    playerState.narrative[gotoNext] = response;
    continueBtn.removeEventListener('click', handleOutcomes);
    continueBtn.addEventListener('click', exitPrompt);
    subtitleEl.innerHTML = "Outcome";
    narrativeEl.innerHTML = response.outcomes[useOutcome] || response.outcomes.randomIDX();
    console.log("playerState",playerState)
}

function handleTextResponse(e,prompt) {
    playerState.narrative[gotoNext] = response;
    continueBtn.removeEventListener('click', handleOutcomes);
    continueBtn.addEventListener('click', exitPrompt);
    subtitleEl.innerHTML = "Your Response";
    narrativeEl.innerHTML = `<p>"prompt.prompt"</p><p.<em>Type your response in the box. . .</em></p>`;
    const text = document.createElement('input');
        text.setAttribute('type','paragraph');
        text.id = 'winner-response';
        text.placeholder = prompt.prompt;
        text.style.backgroundColor = '#000124';
        text.style.paddingLeft = '6px';
        text.style.border = 'none';
        let key = e.target.id.replace('for','replace');
        document.querySelector(`div#${key}`).replaceWith(text);
}

function tallyPath(option) {
    switch (option) {
        case 'add': {
            if (response.path === 'courage') story.narrative.path.courage++;
            if (response.path === 'duty') story.narrative.path.duty++;
            return true;
        } break;
        default: {
            if (playerState.narrative.path.courage > playerState.narrative.path.duty) 
                return 'courage';
            else return 'duty';
        }
    }
}

function exitPrompt() {
    promptWrapperEl.innerHTML = 'loading...';
    
    // sessionStorage.setItem('player', JSON.stringify(playerState));
}