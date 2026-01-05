import { remap } from "./math.js";

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
		this.placeItem.item = null;
		this.cells = boardConfig?.cells || {};
		this.activeCells = boardConfig?.activeCells || [];
	};


    // STATIC
	static colRow = [['A', 1], ['B', 2], ['C', 3], ['D', 4], ['E', 5], ['F', 6], ['G', 7], ['H', 8], ['I', 9], ['J', 10], ['K', 11], ['L', 12], ['M', 13], ['N', 14], ['O', 15], ['P', 16], ['Q', 17], ['R', 18], ['S', 19], ['T', 20], ['U', 21], ['V', 22], ['W', 23], ['X', 24], ['Y', 25], ['Z', 26]];
	static dev_mode = false;


	// PRIV
	#restore;


	// BUS
	signal = {
		data:null,
		resolve:null,
		reject:null,
		set(resolve,reject){
			this.resolve=resolve;
			this.reject=reject;
			console.log(". . .signal recieved:", this.resolve, this.reject)
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
		next(max,data,option){this.item.remaining===max && this.done(data,option)},
		done(data,option){this.resolve(data,option); this.clear()},
		abort(data){this.reject(data); this.clear()},
		clear() {['item','resolve','reject','data'].forEach(i=>this[i] = null); this.count=0},
		set(item,resolve,reject,data) {
			['item','resolve','reject','data']
				.forEach((a,i)=>this[a] = arguments[i]);
			console.log("item recieved:", item, data, resolve, reject);
		}
	}

	// OBJ
	cells = {};
	placedShips = {};
	status = {mode:'init'};


	// VAR
	hoverCells = [];
	activeCells = [];
	pointerCell;
	shipRotation = 0;
	bracketOffset;
	enableKeyboard = false;


	// INIT
	render() {
		this.targetingEl.innerHTML = `
		<section class="targeting-system hide">
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
		this.bracketNode = this.targetingEl.querySelector(`.bracket-node > span`);
		this.disc = this.targetingEl.querySelector(`.targeting-disc`);
		this.targetingDiscColorEl = this.targetingEl.querySelector('.targeting-disc .cls-2');
		
		this.createBoard();

		document.addEventListener('keypress', this.handleKeyPress.bind(this));
		// this.root.addEventListener('mousemove',this.handleMouseMove.bind(this));
		this.handleMouseMove = this.handleMouseMove.bind(this);
		this.placeShot =  this.placeShot.bind(this);
		this.placeShip = this.placeShip.bind(this);

		this.brackets['xpos'] = window.innerWidth / 2;
		this.brackets['ypos'] = window.innerHeight / 2;
		this.bracketNode.innerHTML = `${this.brackets.xpos},${this.brackets.ypos}`;
		this.disc['xpos'] = window.innerWidth / 2; 
		this.disc['ypos'] = window.innerHeight / 2;

		this.update();
		return(console.log("BOARD number", this.boardNumber, "created")) 
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
			row.classList.add(`board-row`);
			Board.colRow.forEach((c, k) => {
				const el = document.createElement('div');
				let key = `${String(i + 1).padStart(2, '0')}${String(k + 1).padStart(2, '0')}`;
				el.id = key;
				const name = `${Board.colRow[i][0]}${c[1]}`;
				el.classList.add(name);
				el.classList.add('cell', 'hover-cell');
				row.appendChild(el);
				if (this.#restore) {
					this.cells[key].committedCell && el.classList.add('committedCell');
					this.cells[key].hit && el.classList.add('hitCell');
					this.cells[key].miss && el.classList.add('missCell');
					this.cells[key]['target'] = el;
				} else {this.cells[key] = {key, name, target:el}}
			});
			this.container.appendChild(row);
		}
	}


    // MANAGEMENT
    mode(option,data,ctrl) {
        !ctrl && option && (this.status.mode = option);
        !ctrl && option && data && (this.status.mode = [option,data]);
		!ctrl && option && console.log("Board "+this.boardNumber+" Mode Set:", option, "with", data);

        switch (option) {
            case 'place-ships': {
				this.root.addEventListener('mousemove',this.handleMouseMove);
				this.target.addEventListener('click', this.placeShip);
				this.brackets.classList.remove('hide');
				Object.values(this.cells).forEach(cell => {
					if (cell.committedCell) cell.target.classList.add('committedCell')});
			} break;
			case 'targeting': {
				this.activeCells = [];
				this.follow = true; 
				this.disc.classList.remove('hide');
				this.root.addEventListener('mousemove',this.handleMouseMove);
				this.target.addEventListener('click', this.placeShot);
				this.mode('subspace');
			} break;
			case 'static': {
				this.root.removeEventListener('mousemove',this.handleMouseMove);
				this.target.removeEventListener('click', this.placeShip);
				this.target.removeEventListener('click', this.placeShot);
				this.targeting.classList.add('hide');
			} break;
			case 'subspace': {
				this.doCleanCellResidue('full');
				this.target.classList.add('subspace-mode');
				Object.values(this.cells).forEach(cell => {
					if (cell.committedCell) cell.target.classList.remove('committedCell')
				}); console.log("Subspace Enabled. Board "+this.boardNumber)
			} break;
			case 'disable-subspace': { 
				this.target.classList.remove('subspace-mode');
				Object.values(this.cells).forEach(cell => {
					if (cell.committedCell) cell.target.classList.add('committedCell') 
				}); this.doCleanCellResidue();
			} break;
			case 'toggle-subspace': { 
				this.target.classList.toggle('subspace-mode');
				Object.values(this.cells).forEach(cell => {
					if (cell.committedCell) cell.target.classList.toggle('committedCell') 
				}); this.doCleanCellResidue('full');
			} break;
			default: {return this.status.mode}
        }
		!ctrl && data && this.mode(data,null,true);
    }


	// EVENTS
	handleMouseMove(e) {
		const hoverOver = document.elementsFromPoint(e.clientX,e.clientY);
		if (hoverOver.includes(this.target)) {
			if (this.follow) {
				this.pointerCell ?? (this.pointerCell = hoverOver[0]);
				this.targeting.classList.remove('hide');
				this.disc.xpos = e.clientX;
				this.disc.ypos = e.clientY;
				this.bracketNode.innerHTML = hoverOver[0].classList[0]; 
				this.brackets.xpos = remap(e.clientX, this.bracketOffset[0][0], this.bracketOffset[0][1], this.bracketOffset[0][2], this.bracketOffset[0][3]);
				this.brackets.ypos = remap(e.clientY, this.bracketOffset[1][0], this.bracketOffset[1][1], this.bracketOffset[1][2], this.bracketOffset[1][3]);
			};
			if (this.mode()==='place-ships' && this.placeItem.item && hoverOver[0]!==this.pointerCell) this.hoverSillhouette(hoverOver);
		} else if (!hoverOver.includes(Board)) {
			this.targeting.classList.add('hide');
			this.cleanCellResidue && this.doCleanCellResidue();
		}
		this.update();
	}

	handleKeyPress(e) {
		if (this.enableKeyboard) return;
    	e.preventDefault();
    	switch (e.key) {
			case ' ': {this.follow = !this.follow} break;
			case 'c': {[this.disc,this.brackets].forEach(el=>el.classList.toggle('hide'))} break;
			case 'b': {this.brackets.classList.toggle('hide')} break;
			case 'd': {this.disc.classList.toggle('hide')} break;
			case 'r': {this.shipRotation -= 90; this.shipRotation < 0 && (this.shipRotation = 360)} break;
			case 'x': {if (this.mode()==='place-ships') {this.placeItem.item = null; this.doCleanCellResidue()}} break;
			case 's': {this.root.classList.contains('active-board') && this.mode('toggle-subspace')} break;
		}
	}


	// FUNC
	setBracketOffset(direction) {
		switch (direction) {
			case 'left': this.bracketOffset = [[-25, window.innerWidth, window.innerWidth/7, window.innerWidth*.7],
											   [50, window.innerWidth, window.innerWidth/7, window.innerWidth*.7]]; 
											    break;
			case 'right': this.bracketOffset = [[-50, window.innerWidth, window.innerWidth/3.7, window.innerWidth*.85],
												[50, window.innerHeight, window.innerHeight/3.9, window.innerHeight*.83]]; 
												break;
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
		const ship = this.placeItem.item;
		try {hoverOver[0].id} catch (err) {console.trace("What is: cell? (Board: 203)",hoverOver)};
		let cell = hoverOver[0].id;
		// console.log("What is: this?",this);
		// console.log("What is: placeItem.item?", Object.values(placeItem.item));
		this.placeItem.item.sillhouette.forEach((row,i)=> {
			row.forEach((c,k)=>{
				if (c==1) {
					const alter = this.cells[this.cast(this.placeItem.item, Number(cell), this.shipRotation, i,k)];
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

    placeShip(e) {
		if (!this.placeItem.item) return;
		let ship = this.placeItem.item;
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
			this.activeCells.push(...stagedCells); //!
			console.log("Cells Pushed!", stagedCells); //!
			this.placeItem.item['location'] = [e.target.id, stagedCells];
			this.placedShips[this.placeItem.item.name] = this.placeItem.item;
			this.placeItem.item = null;
			this.placeItem.done();
			this.doCleanCellResidue();
			return true;
		} else {
			console.log("Cells Rejected!",stagedCells.some(c=>c.target.classList.contains(`forbiddenCell`))); 
			this.doCleanCellResidue();
			return false;
		}; //!
		
	}

	placeShot(e) {
		try {console.log("placeItemtoPlace: ",this.placeItem.item);
		console.log("placeShot("+this.placeItem?.item.name+" on "+e.target.id+")");} catch {null}
		if (!e.target.classList.contains('cell')) {console.warn("placeShot() No classListFound");return};
		if (this.placeItem.item && this.placeItem.item.remaining === this.placeItem.item.max)
				return this.placeItem.abort(null,this.placeItem.item,'maxed-weapon');

		if (this.placeItem.item && !e.target.classList.contains('targetedCell')) {
			this.placeItem.count++;
			e.target.classList.add('targetedCell');
			this.cells[e.target.id]['weapon'] = this.placeItem.item;
			this.cells[e.target.id]['originCell'] = this.placeItem.data;
			this.activeCells.push(this.cells[e.target.id]);
			console.log("Shot Placed on ", e.target.id);
			this.signal.resolve(this.placeItem.item);
			this.targetingDiscColorEl.classList.add('targeting-disc-place');
			setTimeout(()=>this.targetingDiscColorEl.classList.remove('targeting-disc-place'),50);
			return this.placeItem.next(this.placeItem.item.max, this.placeItem.item, 'maxed-weapon');
		} else if (e.target.classList.contains('targetedCell')) {
			const weapon = this.cells[e.target.id].weapon;
			this.placeItem.count--;
			e.target.classList.remove('targetedCell');
			delete this.cells[e.target.id].weapon;
			delete this.cells[e.target.id].originCell;
			this.activeCells.splice(this.activeCells.findIndex(el=>el.key===e.target.id), 1);
			this.placeItem.item = weapon;
			console.log(weapon.name+" Removed from ", e.target.id);
			this.doCleanCellResidue();
			this.targetingDiscColorEl.classList.add('targeting-disc-remove');
			setTimeout(()=>this.targetingDiscColorEl.classList.remove('targeting-disc-remove'),50);
			this.signal.reject(weapon, 'removed');
		}
	}

	async handleFire(ships, resolve) {
		const result = [];
		const delay = () => new Promise((geaux)=>setTimeout(()=>geaux(),1000));
		console.log("Active Cells", this.activeCells)
		for (let cell of this.activeCells) {
			console.log("@handleFire", cell);
			const originBoardNum = this.boardNumber===1 ? 2 : 1; 
			console.log("Board "+this.boardNumber+" calls FIRE from "+cell.originCell.name+" with "+cell.weapon.name+". ("+cell.weapon.remaining+") Reamining shots")
			result.push( cell.weapon.fire(originBoardNum, cell.originCell, cell, ships) );
			await delay();
		};
		resolve(result);
	}

    update() {
        this.brackets.style.left = this.brackets.xpos + 'px';
        this.brackets.style.top = this.brackets.ypos + 'px';
        this.disc.style.left = this.disc.xpos + 'px';
        this.disc.style.top = this.disc.ypos + 'px';
    }

	cleanCellResidue = false;
	doCleanCellResidue(option) { let array = option ? Object.values(this.cells) : this.activeCells;
		for (let c of array)  {
		if (!c.target.classList) {c.target = this.cells[c.key].target; console.log("REPAIRED CELL:",c)}
		c.target.classList.contains('impededCell') && c.target.classList.remove('impededCell');
		c.target.classList.contains('hoverCell') && c.target.classList.remove('hoverCell');
		c.target.classList.contains('forbiddenCell') && c.target.classList.remove('forbiddenCell');
		this.cleanCellResidue = false;
	}
	};
};