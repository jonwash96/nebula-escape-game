# Pseudo Code

## Plan
- My plan is to make a 2D classic-esque version, designed in the style of 24th? 23rd? century Starfleet GUI.
- I will focus on creating a more computer-like GUI, something like what Warf would see when targeting enemy ships.
- Different views will appear in windows that shrink to different sizes or are hidden, depending on what should be in view at any given time.
- Main windows will include the following:
    - **Grid view** to set up user's board & for targeting the enemy's ships.
    - **Ships Panel** for viewing all ships and assessing damage.
    - **Expanded Ship Panel** For a closer inspection of a ship. Used for viewing information on what weapons the ship has, and how much damage it has.
    - **Settings UI** For user & gameplay config.
    - **Info UI** Ship-status style alert-modal/HUD for interacting with the decision prompts.

---

## AI bot Logic
*This is a lot to read, it gets juicier near the code blocks below*
- Take random shots within playable area
- When a hit is made, bot is x% more likely to target that same area
- The user will have access to some similar statistical data (if enabled), especially in regard to the discovery of celestial objects by line-of-sight weapons, because spaceships are smart.

**Discovery mode vs Target mode**
- The bot begins the game in discovery mode, taking random shots to discover where pieces are, and using only the types of shots that make strategic sense (non-revealing).
    - After a certain number of turns with no hit, the bot will take a revealing shot to advance gameplay.
- An evolving heat-map of probabilities is used for the bot to determine the likelihood of a piece being on a given square.
- As soon as a hit is made, the heat map is updated making all squares in its immediate proximity more likely to have a piece of ship on it. These probabilities are updated as the bot discovers the shape of the ship at a given location.
    - This method does not iterate over the entire board, but only generates localized probabilities.
    - Given the billions of possibilities at the beginning of a game, generalized approaches aren't realistic until several ships have been discovered.
    - I'm currently researching into algorithms to implement, as well as more data-driven approaches that would take into account human nature by using ML techniques to generate heat maps based on a data-set of many actual game setups. This is for now theoretical, as I haven't found such a dataset, and it wouldn't be very accurate for my game, since it is based on a different grid that includes obstacles (celestial objects) with differently shaped, 2D ships. But I do intend to build my game with this in mind, so that I have the ability to add it in with a future update. (The real challenge will be not getting consumed by this rabbit hole!).
        - I will also need to research the ethics and implications of data collection so I can implement data-collection into my game and actually create this dataset for it.
- The bot uses pattern recognition and hit-proximity to determine how good a shot is, and to be more or less likely to attack the same area again.
    - **Pattern Recognition:** compares hits with the shapes of ships (similar to the tic-tac-toe logic)
    - **Hit-proximity:** If 2 shots are within a certain distance from one another, (the size of a given ship, compared with ships still in play), then that is likely to be a ship. The bot will continuously guess which ship it is based on pattern recognition, and take additional shots according to its best guess of the ship's orientation. 
    - If a regular torpedo is able to hit a target that a laser or burst shot couldn't, then there is a celestial body of unknown size impeding direct line of sight, and only torpedos can attack it..
    - There is a certain point for each type of ship where it becomes obvious whether it is that ship or not, and the bot will take shots following that logic.
    - The bot will also need to perform time management calculations & decision making. Ships in this game can't move around, so immediately sinking a ship might be more of a waste of time than it would be to stay in discovery mode for longer to discover more ships, and then focus on sinking all ships at known locations.
    - Certain types of shots reveal the location of the ship that fired it, (lasers and spreading-burst-shots by trajectory), so the bot will have to use these strategically.
    - The computer can compute these trajectories with complete accuracy, while the UI will only show the user a fuzzy representation of the trajectories. Thus, easier settings will make the bot dumber and less likely to target a ship based on these kinds of shots.

**Placing the pieces**
- As far as I know, this will be completely random. Only further research will determine whether there's a better approach to this that takes game difficulty into account.

**Marking Hits & Calculating probability**
- When a square is hit, the bot saves a reference to that square as an object in a **hitMap** object.
- It then tests the possibility of all remaining ships being placed in all (or maybe just most) possible configurations intersecting that hit point, taking into account impossible configurations based on other hits. This is how the heat map is generated. Each possible intersection increases the possibility of a piece occupying a given square. Further hits make the map more accurate, and a delta between the likelihood between nearby squares shifts these values.
    - There is a **hitMap** object and a **shipObjects** array:
        - A **hitObject** stores information about the following:
            - The game state when the hit was made
            - Its own discrete heat map
            - A reference to ship objects once significant info about their location is known, based on a reduced set of possible locations for it.
        - The heat map is generated in 2 steps:
            - **First** is by generating a localized heat map for each hit.
                - Fuzzy Heat Map: Until a certain threshold, this is done by using the rectangular bounding boxes of each ship in both possible orientations (h&v), to map out a region of possible intersections. Impossible areas of that region are then masked out by comparing data from nearby heat maps and board bounds.
                - Once a certain threshold of likihood becomes true, this binary map becomes a more nuanced, alpha-mask/heat-map.
                    - At this point, more detailed scans including the actual shape of ships is used.
                    - This is necessary because ships in Nebula Escape are 2D concave polygons, not 1D convex like in traditional Battleship. Before a certain threshold of possibility, I think it would be needlessly expensive to map these complex shapes. Only further R&D will tell.
                - Sample logic for this first step goes something like this:
                    - ```plain text
                      EVENT(a hit is made, location is *key*);
                      
                      FN generateLocalizedHeatmap(*key*)) => {
                        VAR maxPossibleConvexRadius = [~12 coordinates representing max-possible distance of largest ship from *key* in the cardinal directions];
                        update previous *var with: FN maskOutImpossibleRegions(*var, *boardBounds*);
                        
                        FN determineRelationToNearbyHits(*{hitMap}*, *[maxPossibleConvexRadius]*) => {
                          FOR all hits in *{hitMap}* => {
                            IF *hit coordinates intersect *[maxPossibleConvexRadius]*; THEN
                            VAR thisHitIsSameShip = calc(cartesian distance * (1+num of points in between?) * 100); // == Proability
                            && add *var to {...*key.alpha*, { *hit:[*var, {ref to hitObj}, {gamestate}] }}
                          }
                        };
                        }
                      }
                      ```
            - **Second** is by creating a unified heat map including the data from each hitObject's heat map.
                - I think doing it this way will make it easier to update heat maps and iterate over them, since only a region of squares would have to be mapped over instead of the entire board. Sample logic for this goes something like this:
                    - ```javascript
                      const heatMap = {
                        hits: [/*all localized heatMaps {key.alpha}*/], // The global hitMap
                        zones: {/*coordinates of board zones*/ 
                          'a00d00a04d04': {
                            temp: Number(/* sum of all {key.alpha.hit[0]} + num of hits in zone */)}, // [0]=probabilityOfnearbyHitsBeingSameShip
                      }
                      ```
## Probe Mode
- A hit is made in Discovery mode; Switch to Probe mode for next shot.
- At least 1 of the immediate 8 surrounding squares must result in another hit.
- To discover the size & direction of the ship intersecting this square; a square in each of the 4 cardinal directions at the average cartesian distance of all ship lengths & widths can be probed. The cost is 4 shots, aka 1 turn.
- If such a probe shot returns a result; then 1 of 2 possibilities is true:
    - A ship with a silhouette that can intersects these 2 points at a given orientation is placed there. OR
    - 2 ships are placed near to eachother.
- Otherwise, the probe shot does not return a result; thus it must be a ship that is smaller than the average cartesian distance.
- In the case of a positive result, another probe shot targeting coordinates calibrated to determine which case is true based on heat map data will create a more precise map.
- If the chances of it being 1 ship and not 2 are higher than the contrary; Then log this hitObject data to the shipObject.
- If the number of ships that could be located separately at each point is less than 3(/5); then add the hitObject data to that ships' likelyLocations array.
- I will have to test this more and do some strategy-based research to determine the reasoning for whether the bot should stay in probe mode or revert back to discovery mode on the following shot.
- A Sample ship object might look something like this
- ```javascript
  const shipName = {
    sillhouette: [['1|0', '1|0'] /* array representing the sillhouette of the ship and hits to each position */],
    boundingBox: String('a00d00a04d04') || ['xy1','xy2'], /* a string representing the box that can be drawn around a ship */,
    info: {/* an object containing info such as firepower and size */},
    likelyLocations: {hitCoord: [Number(/*probability*/), {/*ref to hitObject*/}}
  }
  ```

---

## Other Game Logic
- placeShips, orientShips
- takeShot
    - Laser, Torpedo, Burst-shot, Spreading-burst-shot
- checkHit, handleHit
    - loadPromptBasedOnGameState
        - handlePromptInput
            - changeGameState | saveData
- autoChangeGUIViewBasedOnGameState | handleGUIEvent

---

## Gameplay & Rules
- *Modified Salvo rules*
- ### Ships
    - **Starfleet**
        - Enterprise D (10/8)
        - Titan (10/8)
        - La Sirena — Kaplan F17 (6)
        - Wallenberg Class (4)
        - Mars Shuttle (2)
    - **Enemy**
        - Borg Cube (25)
        - Romulan Bird-of-Prey (8)
        - Romulan Warbird (6)
        - Diamond Mars attack ships (4)
        - Snakehead (2)
- **Grid Size:** 24X24

---

# Preliminary Research
- Game type: 2 player Strategy type guessing game.
- "Shots" are called each turn
- The game dates back to WW-I as a pencil & paper game, and was published as a pad-and-pencil game in the '30s
- It was released as a plastic board game by Milton Bradley in 1967
- The games true origins date back to the late 19th century with parallels being drawn to a similar game called Basilinda, and is said to have been played by pre WW-I Russian soldiers.
- Salvo was the first commercial version of the game, developed in the world's capital of capitalism, the USA, in 1931 by Starex co.
    - In the Salvo edition, players target up to 5 separate squares at a time for a simultaneous attack, with other similar rules.
    - The Salvo version is an advanced variant in the modern Milton Bradley version.
- The first digital version of the game was produced by Milton Bradley in 1977, pioneering microprocessor-based toy games. (Designed by Dennis Wyman & Bing McCoy)
- In 2008, a new version was released, featuring hexagonal tiles, and islands where captured man figures could be placed, and ships could be placed only around the islands.
- The 2012 Action/Sci-Fi film "Battleship", featuring Liam Neeson & Rehanna is based on the original 1967 version.
- Battleship was one of the earliest games to be produced as a computer game, initially for the Z80 Compucolor in 1979.
- A variation of the game allows players to move one of their ships to a new, uncalled location every fourth or fifth move.

## Historical Video Versions
- [Battleships 1987 Atari ST](https://www.youtube.com/watch?v=ps-bvy5o_Bk) and [Battleship 1993 NES](https://www.youtube.com/watch?v=NS_tgD5TuO8) both have 2 main gameplay views
    - The Grid screen where you place your pieces and attack enemy pieces
    - The __Action__ screen where you have an FPS view of your shots being fired at enemy ships in the water. The positions of the ships don't mean anything, but if one of the shots you fired hits an enemy ship, then it shows that hit making contact with the ship it hit.
- Though I don't fully understand how its played, [Super Battleship (SNES : 1993) Mindscape](https://www.youtube.com/watch?v=EMG5YCdJTxo) is basically the same, but ditches the persistent grid and opts for a pop-up grid representing where boats can move to.
- [Battleship for PCs 1996](https://www.youtube.com/watch?v=P3cuzUu3R_k) Features a persistent isometric grid of the players and their opponents' grid, and the background changes to a dramatic 3D graphic of a ship being hit
- [Battleship: Surface Thunder (2000) - PC ](https://www.youtube.com/watch?v=e1K6_MLa-vQ) Is a Navigational game where you drive a ship through a river and shoot at land based and sea based turrets.
- [Battleship for PS3 2012](https://www.youtube.com/playlist?list=PL6qWbgudoedwa2hnN5b5H3mzVnaABZsuE) is a fully immersive 3D FPS RPG.
- [2P Battleship for PS4 2016](https://www.youtube.com/watch?v=Rgt1qKhIiBQ) is a modern 3D classic Battleship game. It has a single ui where the video of the sips being destroyed appear in a viewport at the top of the screen, Info about each users ships appear on consoles flanking left and right, side-by side 3D water cubes with 2D game grids in the middle, and a points counter and timer separating the video and grid displays in the middle of the screen.
