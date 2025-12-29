import { remap } from "../../engine/utils/math.js";

export default class Board {
	static boardNumber = 0;
	constructor(root, targetingEl,  boardConfig, options) {
		Board.boardNumber++;
		boardConfig?.cells && (this.#restore = true);

        this.root = root;
		this.targetingEl = targetingEl;
		this.follow = options?.follow || false;
		this.enableTargeting = options?.enableTargeting || false;
		this.boardNumber = Board.boardNumber;
		this.shipToPlace = null;
		this.cells = boardConfig?.cells || {};
		this.activeCells = boardConfig?.activeCells || [];
	};


    // STATIC
	static colRow = [['A', 1], ['B', 2], ['C', 3], ['D', 4], ['E', 5], ['F', 6], ['G', 7], ['H', 8], ['I', 9], ['J', 10], ['K', 11], ['L', 12], ['M', 13], ['N', 14], ['O', 15], ['P', 16], ['Q', 17], ['R', 18], ['S', 19], ['T', 20], ['U', 21], ['V', 22], ['W', 23], ['X', 24], ['Y', 25], ['Z', 26]];
	static dev_mode = false;

	// PRIV
	#restore;

	// OBJ
	cells = {};
	placedShips = {};
	status = {mode:'init'};

	// VAR
	hoverCells = [];
	activeCells = [];
	pointerCell;
	shipToPlace;
	donePlacingShip;
	shipRotation = 0;
	bracketOffset;

	// INIT
	async render() { new Promise((resolve) => {
		this.targetingEl.innerHTML = `
		<section class="targeting-system">
			<div class="crosshairs xhv hide"></div>
			<div class="crosshairs xhh hide"></div>
			<svg class="targeting-disc hide" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 157.06 155.27"><defs><style>.cls-1{fill:none;stroke:#f9c31b;stroke-miterlimit:10;stroke-width:4px;}.cls-2{fill:aqua;}</style></defs><g id="Layer_1-2">
				<path class="cls-2" d="M128.76,77.63c0-6.89-1.39-13.45-3.91-19.42,0-.02-.01-.03-.02-.05-2.57-6.06-6.3-11.52-10.91-16.08L151.35,5.05l4.42,4.89c1.46,1.61,1.71,3.97.62,5.85-5.11,8.86-19.24,33.32-19.24,33.32,4.23,8.62,6.61,18.3,6.61,28.52,0,10.23-2.38,19.91-6.61,28.53l19.24,33.32c1.09,1.88.83,4.25-.62,5.86l-4.42,4.89-37.43-37.03c4.61-4.56,8.34-10.01,10.91-16.08,0-.02.01-.03.02-.05,2.52-5.97,3.91-12.54,3.91-19.42M144.21,113.38c5.82-10.62,9.14-22.8,9.14-35.74s-3.31-25.12-9.13-35.74l-2.38,4.06c4.81,9.53,7.51,20.29,7.51,31.68s-2.7,22.13-7.5,31.65l2.36,4.1ZM28.3,77.54c0,6.89,1.39,13.45,3.91,19.42,0,.02.01.03.02.05,2.57,6.06,6.3,11.52,10.91,16.08L5.72,150.12l-4.42-4.89c-1.46-1.61-1.71-3.98-.62-5.86l19.24-33.32c-4.22-8.62-6.61-18.3-6.61-28.53,0-10.23,2.38-19.91,6.61-28.52,0,0-14.13-24.47-19.24-33.32-1.09-1.88-.83-4.24.62-5.85l4.42-4.89,37.43,37.03c-4.61,4.56-8.34,10.01-10.91,16.08,0,.02-.01.03-.02.05-2.52,5.97-3.91,12.54-3.91,19.42M15.22,109.19c-4.8-9.52-7.5-20.28-7.5-31.65s2.71-22.14,7.51-31.68l-2.38-4.06c-5.82,10.62-9.13,22.8-9.13,35.74s3.31,25.12,9.14,35.74l2.36-4.1Z"/><path class="cls-1" d="M147.59,1.47l-32.8,30.12c-9.93-7.78-22.44-12.42-36.03-12.42-13.59,0-26.1,4.64-36.03,12.42,0,0-33.26-29.7-33.26-29.7M148.05,153.37s-33.26-29.7-33.26-29.7c-9.93,7.78-22.44,12.42-36.03,12.42s-26.1-4.64-36.03-12.42l-32.8,30.12M78.76,27.63c-27.61,0-50,22.39-50,50s22.39,50,50,50,50-22.39,50-50-22.39-50-50-50Z"/>
			</g></svg>
			<div class="targeting-brackets hide">
				<div class="bracket-node"><span></span></div>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -107 1014.17 1014.17"><g>
					<path d="M800,769.2h106.91c5.55,0,10.04-4.5,10.04-10.04v-49.55h97.21v80.35c0,5.55-4.5,10.04-10.04,10.04h-89.17s-114.95,0-114.95,0v-30.8ZM800,30.8h106.91c5.55,0,10.04,4.5,10.04,10.04v49.55h97.21V10.04c0-5.55-4.5-10.04-10.04-10.04h-89.17s-114.95,0-114.95,0v30.8ZM990.65,107.45h-75.7v585.09h75.7V107.45ZM214.17,800H10.04c-5.55,0-10.04-4.5-10.04-10.04v-80.35h97.21s0,49.55,0,49.55c0,5.55,4.5,10.04,10.04,10.04h106.91v30.8ZM214.17,0h-114.95s-89.17,0-89.17,0C4.5,0,0,4.5,0,10.04v80.35s97.21,0,97.21,0v-49.55c0-5.55,4.5-10.04,10.04-10.04h106.91s0-30.8,0-30.8ZM23.52,692.55h75.7s0-585.09,0-585.09H23.52s0,585.09,0,585.09Z"/>
				</g></svg>
			</div>
		</section>`
		this.root.innerHTML = `
		<div class="Board">
			<header></header>
			<aside class="left" style="grid-area:m-rows-l;"></aside>
			<section class="Board-grid-container"></section>
			<aside class="right" style="grid-area:m-rows-r;"></aside>
			<footer></footer>
		</div>`;

		// (INIT)
		this.target = this.root.querySelector(`.Board`);
		this.container = this.root.querySelector(`.Board-grid-container`);
		this.header = this.root.querySelector(`.Board header`);
		this.footer = this.root.querySelector(`.Board footer`);
		this.left = this.root.querySelector(`.Board aside.left`);
		this.right = this.root.querySelector(`.Board aside.right`);
		this.letters = [this.header, this.footer];
		this.numbers = [this.left, this.right];
		this.targeting = this.targetingEl.querySelector(`section.targeting-system`);
		this.brackets = this.targetingEl.querySelector(`.targeting-brackets`);
		this.disc = this.targetingEl.querySelector(`.targeting-disc`);
		this.crosshairs = this.targetingEl.querySelectorAll(`.crosshairs`);
		this.crosshairV = this.targetingEl.querySelector(`.xhv`);
		this.crosshairH = this.targetingEl.querySelector(`.xhh`);
		this.bracketNode = this.targetingEl.querySelector(`.bracket-node > span`);
		
		this.createBoard();

		document.addEventListener('keypress', this.handleKeyPress.bind(this));
		this.root.addEventListener('mousemove',this.handleMouseMove.bind(this));

		this.brackets['xpos'] = window.innerWidth / 2;
		this.brackets['ypos'] = window.innerHeight / 2;
		this.bracketNode.innerHTML = `${this.brackets.xpos},${this.brackets.ypos}`;
		this.disc['xpos'] = window.innerWidth / 2; 
		this.disc['ypos'] = window.innerHeight / 2;
		this.crosshairV['xpos'] = window.innerWidth / 2;
		this.crosshairH['ypos'] = window.innerHeight / 2;

		this.update();
		resolve(console.log("Create Board number", this.boardNumber)) }); 
	}

	createBoard() {
		console.log("BUILD BOARD FOR ", Board.boardNumber, this.#restore)
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
			row.classList.add(`board-row`);
			Board.colRow.forEach((c, k) => {
				const el = document.createElement('div');
				let key = `${String(i + 1).padStart(2, '0')}${String(k + 1).padStart(2, '0')}`;
				el.id = key;
				el.classList.add(`${Board.colRow[i][0]}${c[1]}`);
				el.classList.add('cell', 'hover-cell');
				row.appendChild(el);
				if (this.#restore) {
					this.cells[key].committedCell && el.classList.add('committedCell');
					this.cells[key].hit && el.classList.add('hitCell');
					this.cells[key].miss && el.classList.add('missCell');
					this.cells[key]['target'] = el;
				} else {this.cells[key] = {target:el}}
			});
			this.container.appendChild(row);
		}
	}

    // FUNC
    mode(option) {
        option && (this.status.mode = option);
		console.log("Board "+this.boardNumber+" Mode Set:", option);
        switch (option) {
            case 'place-ships': {
				this.target.addEventListener('click', this.placeShip.bind(this));
				this.brackets.classList.remove('hide');
			} break;
			case 'targeting': {
				this.activeCells = [];
				this.follow = true; 
				this.disc.classList.remove('hide');
				this.crosshairs.forEach(el=>el.classList.remove('hide'));
				// this.brackets.classList.remove('hide');
				this.target.addEventListener('click', this.placeShot.bind(this));
				this.mode('subspace');
			} break;
			case 'static': {
				this.target.removeEventListener('click', this.placeShip.bind(this));
				Object.values(this.cells).forEach(cell => {
					if (cell.committedCell) cell.target.classList.add('committedCell')});
				this.brackets.classList.add('hide');
				this.disc.classList.add('hide');
				this.crosshairs.forEach(el=>el.classList.add('hide'));
			} break;
			case 'subspace': { 
				Object.values(this.cells).forEach(cell => {
				if (cell.committedCell) cell.target.classList.remove('committedCell') })
			} break;
			case 'toggle-subspace': { 
				Object.values(this.cells).forEach(cell => {
				if (cell.committedCell) cell.target.classList.toggle('committedCell') })
			} break;
			default: {return this.status.mode}
        }
    }

	// EVENT HANDLERS
	handleMouseMove(e) {
		const hoverOver = document.elementsFromPoint(e.clientX,e.clientY);
		if (hoverOver.includes(this.target)) {
			if (this.follow) {
				this.pointerCell ?? (this.pointerCell = hoverOver[0]);
				this.targeting.classList.remove('hide');
				this.disc.xpos = e.clientX;
				this.disc.ypos = e.clientY;
				this.crosshairV.xpos = e.clientX;
				this.crosshairH.ypos = e.clientY;
				this.bracketNode.innerHTML = hoverOver[0].classList[0]; /*`M:${e.clientX},${e.clientY}<br>B:${this.brackets.xpos},${this.brackets.ypos}`;*/
				this.brackets.xpos = remap(e.clientX, 0, window.innerWidth, this.bracketOffset[0], this.bracketOffset[1]);
				this.brackets.ypos = remap(e.clientY, -50, window.innerHeight, window.innerHeight*0.2, window.innerHeight*0.85);
			};
			if (this.shipToPlace && hoverOver[0]!==this.pointerCell) this.hoverSillhouette(hoverOver);
		} else if (!hoverOver.includes(Board)) {
			this.targeting.classList.add('hide');
			this.cleanCellResidue && this.doCleanCellResidue();
		}
		this.update();
	}

	setBracketOffset(direction) {
		switch (direction) {
			case 'left': this.bracketOffset = [window.innerWidth*0.28, window.innerWidth*0.86]; break;
			case 'right': this.bracketOffset = [window.innerWidth*0.28, window.innerWidth*0.86]; break;
		}
	}

	handleKeyPress(e) {
    	e.preventDefault();
    	switch (e.key) {
			case ' ': {this.follow = !this.follow} break;
			case 'c': {this.crosshairs.forEach(el=>el.classList.toggle('hide'))} break;
			case 'b': {this.brackets.classList.toggle('hide')} break;
			case 'd': {this.disc.classList.toggle('hide')} break;
			case 'r': {this.shipRotation -= 90; this.shipRotation < 0 && (this.shipRotation = 360)} break;
			case 'x': {if (this.mode()==='place-ships') {this.shipToPlace = null; this.doCleanCellResidue()}} break;
			case 's': {this.root.classList.contains('active-board') && this.mode('toggle-subspace')} break;
		}
	}

	cast(ship,num,rotation,i,k) {
		switch (rotation) {
			case 0: {return String( num + ((100 * i) + (k - ship.offset(90))) ).padStart(4,'0');} break;
			case 90: {return String( num + ((100 * k) + (i - ship.offset(90))) ).padStart(4,'0');} break;
			case 180: {return String( num + ((100 * - i) + (k - ship.offset(90))) ).padStart(4,'0');} break;
			case 270: {return String( num + ((100 * k) + (ship.offset(90)) - i) ).padStart(4,'0');} break;
			default: {return String( num + ((100 * k) + (i - ship.offset(0))) ).padStart(4,'0');}
		}
	}

	hoverSillhouette(hoverOver) {
		this.pointerCell = hoverOver[0];
		this.cleanCellResidue = true;
		this.hoverCells.forEach(h=>{ 
			h.target.classList.remove(`hoverCell`); 
			h.target.classList.remove(`impededCell`);
		});
		this.activeCells.forEach(a=>a.target.classList.remove(`impededCell`));
		this.hoverCells = [];
		const ship = this.shipToPlace;
		try {hoverOver[0].id} catch (err) {console.trace("What is: cell? (Board: 203)",hoverOver)};
		let cell = hoverOver[0].id;
		// console.log("What is: this?",this);
		// console.log("What is: shipToPlace?", Object.values(this)[6]);
		this.shipToPlace.sillhouette.forEach((row,i)=> {
			row.forEach((c,k)=>{
				if (c==1) {
					const alter = this.cells[this.cast(this.shipToPlace, Number(cell), this.shipRotation, i,k)];
					try {
					if (alter.target.classList.contains(`committedCell`)) {
						alter.target.classList.add(`impededCell`)
						this.hoverCells.push(alter)
					} else {
						alter.target.classList.add(`hoverCell`);
						this.hoverCells.push(alter);
					}} catch (err) {this.hoverCells.forEach(c=>c.target.classList.add(`impededCell`));}
				};
			})
		});
		return(this.hoverCells);
	}

	setShipToPlace(ship,resolve) {
		this.shipToPlace = ship; 
		this.donePlacingShip = resolve;
		console.log("ship recieved:", ship);
	}

    placeShip(e) {
		if (!this.shipToPlace) return;
		let ship = this.shipToPlace;
		const stagedCells = [];
		let alter;
		if (e.target.classList.contains(`cell`)) {
            const cell = e.target.id;
            ship.sillhouette.forEach((row,i) => {
                row.forEach((c,k)=>{
                    if (c==1) {
						alter = this.cells[this.cast(ship, Number(cell), this.shipRotation, i,k)];
						try {
							if (alter.target.classList.contains(`committedCell`)) {
								alter.target.classList.add(`forbiddenCell`)
								stagedCells.push(alter);
							} else {
								stagedCells.push(alter);
							}
						} catch (err) {
							throw new Error("Out of bounds!"+alter); 
						}
					};
                })
            })
		};
		if (stagedCells.length > 1 && stagedCells.every(c=>!c.target.classList.contains(`forbiddenCell`))) {
			stagedCells.forEach(c=>c.target.classList.add(`committedCell`));
			stagedCells.forEach(c=>c['committedCell'] = true);
			this.activeCells.push(); //!
			console.log("Cells Pushed!", stagedCells); //!
			this.shipToPlace['location'] = [e.target.id, stagedCells];
			this.placedShips[this.shipToPlace.name] = this.shipToPlace;
			this.shipToPlace = null;
			this.donePlacingShip();
			this.doCleanCellResidue();
			return true;
		} else {
			console.log("Cells Rejected!",stagedCells.some(c=>c.target.classList.contains(`forbiddenCell`))); 
			this.doCleanCellResidue();
			return false;
		}; //!
		
	}

	signal = {
		data:null,
		resolve:null,
		reject:null,
		set(resolve,reject){
			this.resolve=resolve;
			this.reject=reject;
			console.log("signal recieved:", this.resolve, this.reject)
		},
		clear(){['data','resolve','reject']
			.forEach(i=>i=null) }
	}

	placeItem = {
		item:null,
		resolve:null,
		reject:null,
		data:null,
		count:0,
		self:this,
		next(max,data){this.count===max && this.done(data)},
		done(data){this.resolve(data); this.clear()},
		abort(data){this.reject(data); this.clear()},
		clear() {['item','resolve','reject','data'].forEach(i=>this[i] = null); this.count=0},
		set(item,resolve,reject,data) {
			['item','resolve','reject','data']
				.forEach((a,i)=>this[a] = arguments[i]);
			console.log("item recieved:", item);
		}
	}

	placeShot(e) {
		if (!e.target.classList.contains('cell')) return;
		if (this.placeItem.item.remaining === this.placeItem.item.max)
				return this.placeItem.abort(this.placeItem.count);

		if (this.placeItem.item && !e.target.classList.contains('targetedCell')) {
			this.placeItem.count++;
			this.signal.resolve(this.placeItem.count, this.placeItem.item);
			e.target.classList.add('targetedCell');
			e.target.setAttribute('weapon', this.placeItem.item);
			e.target.setAttribute('originCell', this.placeItem.data);
			this.activeCells.push(this.cells[e.target.id]);
			console.log("Shot Placed on ", e.target.id);
		} else {
			const weapon = e.target.getAttribute('weapon');
			this.placeItem.count--;
			this.signal.reject(this.placeItem.count, weapon);
			e.target.classList.remove('targetedCell');
			e.target.removeAttribute('weapon');
			e.target.removeAttribute('originCell');
			this.activeCells.splice(indexOf(e.target.id), 1);
			console.log("Shot Removed from ", e.target.id);
		}
		return this.placeItem.next(this.placeItem.item.max, true);
	}

	async handleFire(ships, resolve) {
		const delay = () => new Promise((geaux)=>setTimeout(()=>geaux(),600));
		for (let cell of activeCells) {
			const weapon = cell.getAttribute('weapon');
			const originCell = cell.getAttribute('originCell');
			const originBoardNum = this.boardNumber===1 ? 2 : 1; 
			weapon.fire(originBoardNum, originCell, cell, ships);
			await delay();
		};
		resolve();
	}

    update() {
        this.brackets.style.left = this.brackets.xpos + 'px';
        this.brackets.style.top = this.brackets.ypos + 'px';
        this.disc.style.left = this.disc.xpos + 'px';
        this.disc.style.top = this.disc.ypos + 'px';
        this.crosshairV.style.left = this.crosshairV.xpos + 'px';
        this.crosshairH.style.top = this.crosshairH.ypos + 'px';
    }

	cleanCellResidue = false;
	doCleanCellResidue() { Object.values(this.activeCells).forEach(c => {
		c.target.classList.contains(`impededCell`) && c.target.classList.remove(`impededCell`);
		c.target.classList.contains(`hoverCell`) && c.target.classList.remove(`hoverCell`);
		c.target.classList.contains(`forbiddenCell`) && c.target.classList.remove(`forbiddenCell`);
		this.cleanCellResidue = false;
	})
	};
};