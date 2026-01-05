# Nebula Escape Game | Project Proposal
***A Star Trek Picard themed Battleship-like computer game written in Javascript***

## Inspiration

*Minor Spoiler alert! Star Trek Fans beware*
Nebula Escape is based on an episode of Star Trek Picard where Picard & Riker loose a space battle and find themselves sinking into a gravity well at the centre of a nebula. Riker is the captain and he's tasked with doing all that he can to keep the crew alive for as long as possible, despite the grim, seemingly fatal conditions. 

Amongst all the chaos, Dr. Crusher uses a powerful combination of her motherly intuition combined with her sharp analytical skills and discovers that the gravity source is actually pulsing waves of energy that the ship would be able ride like waves on an ocean, while also absorbing its radiation to recharge the core and power up the engines to get free. 

They're able to manage the recharge, restoring power to the ship and use the energy wave to build momentum and cary them away from the gravity well, but it's not over yet. They still need to chart a course through an asteroid field and destroy the ship to whom they'd initially lost the battle— The Shrike— prowling on the other side of the asteroid field. 

Eventually they make it through, immobilize the enemy ship, and warp back to friendly territories. 

---

## Project Idea

I want to create my game in such a way that it follows the essence of the above storyline. What I'm thinking is to build a Star Trek Picard themed Battleship game, implementing aspects of the story into the game play.

### Battleship
My goal is to build a Battleship game where the user plays against the computer.

- This will present quite a challenge, as I've never done this before, but I will be able to do it, even if it's a really dumb AI that's not even fun to play.
- Assuming I'm able to grasp the concept pretty quickly, I'll figure out how to calculate complexity and build in levels of difficulty, making the game actually fun.

### UI
A Star Trek Picard themed UI.

- This could be a month long project on its own to get right, but as the UI must take the backseat to this week long project, I'll settle for something that at least looks like it resembles the Design & UI from the show.
- I'll use mostly basic CSS to generate the styles, paired with SVGs for extra flourish where appropriate.

### Imagery
I haven't decided on how I want to approach this just yet, but I'll do one of the following:

- Manual photomanipulation (Photoshop) to create stylized imagery from screenshots that look better for a game.
- Images straight from the show.
- Use genAI to generate imagery.

### Narrative generation & Q's Riddle
- AI prompting
- I will use an LLM to generate several variations of what can happen at each prompt to keep the game interesting play after play.
    - I'm not experienced in using AI APIs in my work (and I can't help but think about the environmental impacts of unneccesary uses of AI), so I'll pre-generate the content and use a JSON file to store the data.

---

## Gameplay

### Narrative:
You are a Starfleet captain and you've found yourself in dire circumstances. You've just lost the previous battle, and are now sinking through a nebula toward a mysterious gravity source. You must make a series of difficult life or death decisions in an attempt to save the lives of your crew, or at least prolong them for as long as possible, holding out for the mere chance that another starfleet ship happens to receive one of your hails.

To do this, you must reflect on your past experiences reigning victorious in previous battles. The will to survive in this case is as much a mental challenge as it is an operational one.

**Intro:**
- A series of text-based input where you have to choose from a list of options what to do in certain scenarios.

**BattleShip:**
- You must reflect on previous battles to gain the strength to lead your crew in survival. Do you remember a battle you won, or one that you lost? Play Battleship to find out.
- Throughout the game, Every time you or the enemy lands a hit, you also receive information from your crew about the status of your ship in the moment. You must respond to a decision-prompt to remedy the situation.
    - If an enemy lands a hit, it's bad news.
    - If you land a hit, it's good news.
- The game is not won by winning Battleship; You must first win Battleship by sinking all of your enemy's ships to have a chance of escaping.
- *You get 3 attempts at Battleship (representing 3 memories of past battles).*

**Q's Riddle:**
- Once you've won Battleship, A Q appears and gives you a riddle you must solve (same concept as the decision-prompts).
- If you win Battleship and solve Q's riddle, then you escape the gravity well.
- *You get 1 attempt at Q's riddle.*

---

## Project Management

**Stage 0:**
- Gain Approval

**Stage 1:** 
- Preliminary Research
- Setup basic file structure/project Skeleton
- Gather code from related projects to pull from

**Stage 2:**
- Create a wireframe
- Create a storyboard

**Stage 3:**
- Create a basic style guide & generate CSS variables
- Build out core logic in js
- Build out basic DOM structure

**Stage 4:**
- Improve game logic and integrate
- Build AI logic
- By this point, I should be able to do the following on the CLI/Basic HTML input
    - Play through the story prompts
    - Play Battleship against the computer

**Stage 5:**
- Integrate logic into the DOM
- By the end of this stage, I should be able to play Battleship on a local server in the browser on my phone.

**Stage 6:**
- Improve AI
- Sexy it up a bit where possible/neccesary
- Polish code, create deployment version

**Stage 7:**
- User testing
- Find a friend to do beta testing

**Stage 8:**
- Assess feedback from friend
- Minor refactoring (if neccesary)