import { remap } from "../../../engine/utils/math.js";
import { ships } from "../../../game/battleship/ships.js";


export default class Board {
	static boardNumber = 1;
	constructor(root, targeting, options) {
        this.root = root;
		this.targetingSystem = targeting || null;
		this.follow = options?.follow || true;
		this.enableTargeting = options?.enableTargeting || false;
		// this.#hoverCells = [];
		this.shipToPlace = '';
		// Board.boardNumber++;
		console.log("Create Board number", Board.boardNumber);
	};


    // STATIC
	static colRow = [['A', 1], ['B', 2], ['C', 3], ['D', 4], ['E', 5], ['F', 6], ['G', 7], ['H', 8], ['I', 9], ['J', 10], ['K', 11], ['L', 12], ['M', 13], ['N', 14], ['O', 15], ['P', 16], ['Q', 17], ['R', 18], ['S', 19], ['T', 20], ['U', 21], ['V', 22], ['W', 23], ['X', 24], ['Y', 25], ['Z', 26]];
	
	// PUBLUC
	cells = {};
	placedShips = {};
	status = {
        mode:'init'
    };

	// PRIVATE
	#hoverCells = [];
	#activeCells = [];
	#pointerCell;
	

	async render() { new Promise((resolve,reject) => {
		this.root.innerHTML = `
		<section class="targeting-system${Board.boardNumber}">
			<div class="crosshairs${Board.boardNumber} xhv${Board.boardNumber} hide${Board.boardNumber}"></div>
			<div class="crosshairs${Board.boardNumber} xhh${Board.boardNumber} hide${Board.boardNumber}"></div>
			<svg class="targeting-disc${Board.boardNumber} hide${Board.boardNumber}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 157.06 155.27"><defs><style>.cls-1{fill:none;stroke:#f9c31b;stroke-miterlimit:10;stroke-width:4px;}.cls-2{fill:aqua;}</style></defs><g id="Layer_1-2">
				<path class="cls-2" d="M128.76,77.63c0-6.89-1.39-13.45-3.91-19.42,0-.02-.01-.03-.02-.05-2.57-6.06-6.3-11.52-10.91-16.08L151.35,5.05l4.42,4.89c1.46,1.61,1.71,3.97.62,5.85-5.11,8.86-19.24,33.32-19.24,33.32,4.23,8.62,6.61,18.3,6.61,28.52,0,10.23-2.38,19.91-6.61,28.53l19.24,33.32c1.09,1.88.83,4.25-.62,5.86l-4.42,4.89-37.43-37.03c4.61-4.56,8.34-10.01,10.91-16.08,0-.02.01-.03.02-.05,2.52-5.97,3.91-12.54,3.91-19.42M144.21,113.38c5.82-10.62,9.14-22.8,9.14-35.74s-3.31-25.12-9.13-35.74l-2.38,4.06c4.81,9.53,7.51,20.29,7.51,31.68s-2.7,22.13-7.5,31.65l2.36,4.1ZM28.3,77.54c0,6.89,1.39,13.45,3.91,19.42,0,.02.01.03.02.05,2.57,6.06,6.3,11.52,10.91,16.08L5.72,150.12l-4.42-4.89c-1.46-1.61-1.71-3.98-.62-5.86l19.24-33.32c-4.22-8.62-6.61-18.3-6.61-28.53,0-10.23,2.38-19.91,6.61-28.52,0,0-14.13-24.47-19.24-33.32-1.09-1.88-.83-4.24.62-5.85l4.42-4.89,37.43,37.03c-4.61,4.56-8.34,10.01-10.91,16.08,0,.02-.01.03-.02.05-2.52,5.97-3.91,12.54-3.91,19.42M15.22,109.19c-4.8-9.52-7.5-20.28-7.5-31.65s2.71-22.14,7.51-31.68l-2.38-4.06c-5.82,10.62-9.13,22.8-9.13,35.74s3.31,25.12,9.14,35.74l2.36-4.1Z"/><path class="cls-1" d="M147.59,1.47l-32.8,30.12c-9.93-7.78-22.44-12.42-36.03-12.42-13.59,0-26.1,4.64-36.03,12.42,0,0-33.26-29.7-33.26-29.7M148.05,153.37s-33.26-29.7-33.26-29.7c-9.93,7.78-22.44,12.42-36.03,12.42s-26.1-4.64-36.03-12.42l-32.8,30.12M78.76,27.63c-27.61,0-50,22.39-50,50s22.39,50,50,50,50-22.39,50-50-22.39-50-50-50Z"/>
			</g></svg>
			<div class="targeting-brackets${Board.boardNumber} hide${Board.boardNumber}">
				<div class="bracket-node${Board.boardNumber}"><span></span></div>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -107 1014.17 1014.17"><g>
					<path d="M800,769.2h106.91c5.55,0,10.04-4.5,10.04-10.04v-49.55h97.21v80.35c0,5.55-4.5,10.04-10.04,10.04h-89.17s-114.95,0-114.95,0v-30.8ZM800,30.8h106.91c5.55,0,10.04,4.5,10.04,10.04v49.55h97.21V10.04c0-5.55-4.5-10.04-10.04-10.04h-89.17s-114.95,0-114.95,0v30.8ZM990.65,107.45h-75.7v585.09h75.7V107.45ZM214.17,800H10.04c-5.55,0-10.04-4.5-10.04-10.04v-80.35h97.21s0,49.55,0,49.55c0,5.55,4.5,10.04,10.04,10.04h106.91v30.8ZM214.17,0h-114.95s-89.17,0-89.17,0C4.5,0,0,4.5,0,10.04v80.35s97.21,0,97.21,0v-49.55c0-5.55,4.5-10.04,10.04-10.04h106.91s0-30.8,0-30.8ZM23.52,692.55h75.7s0-585.09,0-585.09H23.52s0,585.09,0,585.09Z"/>
				</g></svg>
			</div>
		</section>
		<div class="Board${Board.boardNumber}">
			<header></header>
			<aside class="left${Board.boardNumber}" style="grid-area:m-rows-l;"></aside>
			<section class="Board-grid-container${Board.boardNumber}"></section>
			<aside class="right${Board.boardNumber}" style="grid-area:m-rows-r;"></aside>
			<footer></footer>
		</div>`;

		// INIT
		this.target = this.root.querySelector(`.Board${Board.boardNumber}`);
		this.container = this.root.querySelector(`.Board-grid-container${Board.boardNumber}`);
		this.header = this.root.querySelector(`.Board${Board.boardNumber} header`);
		this.footer = this.root.querySelector(`.Board${Board.boardNumber} footer`);
		this.left = this.root.querySelector(`.Board${Board.boardNumber} aside.left${Board.boardNumber}`);
		this.right = this.root.querySelector(`.Board${Board.boardNumber} aside.right${Board.boardNumber}`);
		this.letters = [this.header, this.footer];
		this.numbers = [this.left, this.right];
		this.targeting = this.root.querySelector(`section.targeting-system${Board.boardNumber}`);
		this.brackets = this.root.querySelector(`.targeting-brackets${Board.boardNumber}`);
		this.disc = this.root.querySelector(`.targeting-disc${Board.boardNumber}`);
		this.crosshairs = this.root.querySelectorAll(`.crosshairs${Board.boardNumber}`);
		this.crosshairV = this.root.querySelector(`.xhv${Board.boardNumber}`);
		this.crosshairH = this.root.querySelector(`.xhh${Board.boardNumber}`);
		this.bracketNode = this.root.querySelector(`.bracket-node${Board.boardNumber} > span`);
		
		this.createBoard();
		document.addEventListener('keypress', this.handleKeyPress.bind(this));
		this.root.addEventListener('mousemove',this.handleMouseMove.bind(this));

		this.brackets['xpos'] = window.innerWidth / 2;
		this.brackets['ypos'] = window.innerHeight / 2;
		this.enableTargeting && this.brackets.classList.toggle(`hide${Board.boardNumber}`);
		this.disc['xpos'] = window.innerWidth / 2;
		this.disc['ypos'] = window.innerHeight / 2;
		this.enableTargeting && this.disc.classList.toggle(`hide${Board.boardNumber}`);
		this.crosshairV['xpos'] = window.innerWidth / 2;
		this.crosshairH['ypos'] = window.innerHeight / 2;
		this.enableTargeting && this.crosshairs.forEach(el=>el.classList.toggle(`hide${Board.boardNumber}`));

		this.update();
		resolve(console.log("done.", Board.boardNumber)) }); 
	}

	createBoard() {
		for (let i = 0; i < 26; i++) {
			this.numbers.forEach(self => {
				const el = document.createElement('div');
				el.textContent = Board.colRow[i][0];
				self.appendChild(el);
			});

			this.letters.forEach(self => {
				const el = document.createElement('div');
				el.textContent = Board.colRow[i][1];
				self.appendChild(el);
			});

			const row = document.createElement('div');
			row.classList.add(`board-row${Board.boardNumber}`);
			Board.colRow.forEach((c, k) => {
				const el = document.createElement('div');
				let key = `${String(i + 1).padStart(2, '0')}${String(k + 1).padStart(2, '0')}`;
				el.id = key;
				el.classList.add(`${c[0]}${i + 1}`);
				el.classList.add(`cell${Board.boardNumber}`);
				row.appendChild(el);
				this.cells[key] = el;
			});
			this.container.appendChild(row);
		}
	}

    // METHODS
    mode(option) {
        this.status.mode = option;
        switch (option) {
            case 'place-ships': {
				this.target.addEventListener('click', this.placeShip.bind(this));
			} break;
			case 'static': {this.target.removeEventListener('click', this.placeShip.bind(this))} break;
        }
    }

	// EVENT HANDLERS
	handleMouseMove(e) {
		const hoverOver = document.elementsFromPoint(e.clientX,e.clientY);
		if (this.follow && hoverOver.includes(this.target)) {
			this.#pointerCell ?? (this.#pointerCell = hoverOver[0]);
			this.targeting.classList.remove(`hide${Board.boardNumber}`);
			this.targeting.classList.add(`show${Board.boardNumber}`);
			this.disc.xpos = e.clientX;
			this.disc.ypos = e.clientY;
			this.crosshairV.xpos = e.clientX;
			this.crosshairH.ypos = e.clientY;
			this.bracketNode.textContent = hoverOver[0].classList;
			if (this.status.mode === 'place-ships') {
				(hoverOver[0]!==this.#pointerCell) && this.hoverSillhouette(hoverOver);
				this.brackets.xpos = remap(e.clientX, 0, window.innerWidth, window.innerWidth*0.10, window.innerWidth*0.9);
				this.brackets.ypos = remap(e.clientY, 0, window.innerHeight, window.innerHeight*0.1, window.innerHeight*0.90);
			}
		} else if (!hoverOver.includes(Board)) {
			this.targeting.classList.remove(`show${Board.boardNumber}`);
			this.targeting.classList.add(`hide${Board.boardNumber}`);
			this.cleanCellResidue && this.doCleanCellResidue();
		}
		this.update();
	}

	handleKeyPress(e) {
    	e.preventDefault();
    	switch (e.key) {
			case ' ': {this.follow = !this.follow} break;
			case 'c': {this.crosshairs.forEach(el=>el.classList.toggle(`hide${Board.boardNumber}`))} break;
			case 'b': {this.brackets.classList.toggle(`hide${Board.boardNumber}`)} break;
			case 'd': {this.disc.classList.toggle(`hide${Board.boardNumber}`)} break;
		}
	}

	hoverSillhouette(hoverOver) {
		this.#pointerCell = hoverOver[0];
		this.cleanCellResidue = true;
		this.#hoverCells.forEach(h=>{ 
			h.classList.remove(`hoverCell${Board.boardNumber}`); 
			h.classList.remove(`impededCell${Board.boardNumber}`) 
		});
		this.#activeCells.forEach(a=>a.classList.remove(`impededCell${Board.boardNumber}`));
		this.#hoverCells = [];
		const ship = this.shipToPlace;console.log("this.shipToPlace")
		let cell = hoverOver[0].id;
		ship.sillhouette.forEach((row,i)=>{
			row.forEach((c,k)=>{
				const idx = (num) => String( num + ((100 * i) + (k - ship.offset())) ).padStart(4,'0'); // INCREMENT 4 DIGIT CELL KEY FROM CLICKED
				if (c==1) {
					const alter = this.cells[idx(Number(cell))];
					try {
					if (alter.classList.contains(`committedCell${Board.boardNumber}`)) {
						alter.classList.add(`impededCell${Board.boardNumber}`)
					} else {
						alter.classList.add(`hoverCell${Board.boardNumber}`);
						this.#hoverCells.push(alter);
					}} catch (err) {this.#hoverCells.forEach(c=>c.classList.add(`impededCell${Board.boardNumber}`));}
				};
			})
		});
	}

    placeShip(e) {
		let ship = this.shipToPlace;
		const stagedCells = [];
		let alter;
		if (e.target.classList.contains(`cell${Board.boardNumber}`)) {
            const cell = e.target.id;
            ship.sillhouette.forEach((row,i)=>{
                row.forEach((c,k)=>{
                    const idx = (num) => String( num + ((100 * i) + (k - ship.offset())) ).padStart(4,'0'); // INCREMENT 4 DIGIT CELL KEY FROM CLICKED
                    if (c==1) {
						alter = this.cells[idx(Number(cell))];
						if (alter.classList.contains(`committedCell${Board.boardNumber}`)) {
							alter.classList.add(`forbiddenCell${Board.boardNumber}`)
							stagedCells.push(alter);
						} else {
							console.log("+active", alter); //!
							stagedCells.push(alter);
						}
					};
                })
            })
		};
		if (stagedCells.every(c=>!c.classList.contains(`forbiddenCell${Board.boardNumber}`))) {
			stagedCells.forEach(c=>c.classList.add(`committedCell${Board.boardNumber}`));
			console.log("Cells Pushed!", stagedCells); //!
			this.#activeCells.push(...stagedCells); 
			this.shipToPlace[location] = [e.target.id,stagedCells];
			this.placedShips[this.shipToPlace.name] = this.shipToPlace;
		} else {console.log("Cells Rejected!",stagedCells.some(c=>c.classList.contains(`forbiddenCell${Board.boardNumber}`)))}; //!
		stagedCells.forEach(c=>{
			c.classList.remove(`forbiddenCell${Board.boardNumber}`);
			c.classList.remove(`impededCell${Board.boardNumber}`);
			c.classList.remove(`hoverCell${Board.boardNumber}`)
		});
	}

	setShipToPlace(ship) {this.shipToPlace = ship; console.log("board recieved:", ship)};

    update() {
        this.brackets.style.left = this.brackets.xpos + 'px';
        this.brackets.style.top = this.brackets.ypos + 'px';
        this.disc.style.left = this.disc.xpos + 'px';
        this.disc.style.top = this.disc.ypos + 'px';
        this.crosshairV.style.left = this.disc.xpos + 'px';
        this.crosshairH.style.top = this.disc.ypos + 'px';
    }

	cleanCellResidue = false
	doCleanCellResidue() { Object.values(this.cells).forEach(c => {
		c.classList.contains(`impededCell${Board.boardNumber}`) && c.classList.remove(`impededCell${Board.boardNumber}`);
		c.classList.contains(`hoverCell${Board.boardNumber}`) && c.classList.remove(`hoverCell${Board.boardNumber}`);
		this.cleanCellResidue = false;
	})};
};