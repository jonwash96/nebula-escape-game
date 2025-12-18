import { remap } from "../../../engine/utils/math.js";
export default class Board {
	static boardNumber = 0;
	constructor(root, pathToModule, options) {
        this.root = root;
		this.pathToModule = pathToModule;
		this.follow = options?.follow || true;
		Board.boardNumber++;
		console.log("Board number", Board.boardNumber, "created");
	};


    // STATIC
	static colRow = [['A', 1], ['B', 2], ['C', 3], ['D', 4], ['E', 5], ['F', 6], ['G', 7], ['H', 8], ['I', 9], ['J', 10], ['K', 11], ['L', 12], ['M', 13], ['N', 14], ['O', 15], ['P', 16], ['Q', 17], ['R', 18], ['S', 19], ['T', 20], ['U', 21], ['V', 22], ['W', 23], ['X', 24], ['Y', 25], ['Z', 26]];
	
	// PUBLUC
	cells = {};
	status = {
        mode:'init'
    };

	render() { 
		try {
			fetch(this.pathToModule+'/game-board.html')
			.then(res=>res.text())
			.then(text=>this.root.innerHTML += text)
			.then(()=> {
				let count = 0;
				while (!this.root.querySelector('.Board footer')) {count++};
				console.log("loading board count", count);
				fetch(this.pathToModule+'/targeting-system.html')
				.then(res=>res.text())
				.then(text=>this.root.innerHTML += text)
				.then(() => {
					let count = 0;
					while (!this.root.querySelector('.targeting-brackets')) {count++};
					console.log("loading targeting-system count", count);
					// INIT
					this.target = this.root.querySelector('.Board');
					this.container = this.root.querySelector('.Board-grid-container');
					this.header = this.root.querySelector('.Board header');
					this.footer = this.root.querySelector('.Board footer');
					this.left = this.root.querySelector('.Board aside.left');
					this.right = this.root.querySelector('.Board aside.right');
					this.letters = [this.header, this.footer];
					this.numbers = [this.left, this.right];
					this.targeting = this.root.querySelector('section.targeting-system');
					this.brackets = this.root.querySelector('.targeting-brackets');
					this.disc = this.root.querySelector('.targeting-disc');
					this.crosshairs = this.root.querySelectorAll('.crosshairs');
					this.crosshairV = this.root.querySelector('.xhv');
					this.crosshairH = this.root.querySelector('.xhh');
					this.bracketNode = this.root.querySelector('.bracket-node > span');
					
					this.createBoard();
					document.addEventListener('keypress', this.handleKeyPress.bind(this));
					this.root.addEventListener('mousemove',this.handleMouseMove.bind(this));

					this.brackets['xpos'] = window.innerWidth / 2;
					this.brackets['ypos'] = window.innerHeight / 2;
					// brackets.classList.toggle('hide');
					this.disc['xpos'] = window.innerWidth / 2;
					this.disc['ypos'] = window.innerHeight / 2;
					this.disc.classList.toggle('hide');
					this.crosshairV['xpos'] = window.innerWidth / 2;
					this.crosshairH['ypos'] = window.innerHeight / 2;
					// crosshairs.forEach(el=>el.classList.toggle('hide'));

					this.update();
				});
			})
		} catch (err) {throw new Error("FETCH BOARD FAILED!", err)};

		
	};

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
			row.classList.add('board-row');
			Board.colRow.forEach((c, k) => {
				const el = document.createElement('div');
				let key = `${String(i + 1).padStart(2, '0')}${String(k + 1).padStart(2, '0')}`;
				el.id = key;
				el.classList.add(`${i + 1}${c[0]}`);
				el.classList.add('cell');
				// el.textContent = `${i + 1}${c[0]}`;
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
            case 'place-ships': {this.addEventListener('click', this.placeShip.bind(this))} break;
        }
    }

	// EVENT HANDLERS
	handleMouseMove(e) {
		const hoverOver = document.elementsFromPoint(e.clientX,e.clientY);
		if (this.follow && hoverOver.includes(this.target)) {
			this.targeting.classList.remove('hide');
			this.targeting.classList.add('show');
			this.brackets.xpos = remap(e.clientX, 0, window.innerWidth, window.innerWidth*0.10, window.innerWidth*0.9);
			this.brackets.ypos = remap(e.clientY, 0, window.innerHeight, window.innerHeight*0.1, window.innerHeight*0.90);
			this.disc.xpos = e.clientX;
			this.disc.ypos = e.clientY;
			this.crosshairV.xpos = e.clientX;
			this.crosshairH.ypos = e.clientY;
			this.bracketNode.textContent = hoverOver[0].classList;
			this.update();
		} else if (!hoverOver.includes(Board)) {
			this.targeting.classList.remove('show');
			this.targeting.classList.add('hide');
		}
	}

	handleKeyPress(e) {
    	e.preventDefault();
    	switch (e.key) {
			case ' ': {this.follow = !this.follow} break;
			case 'c': {this.crosshairs.forEach(el=>el.classList.toggle('hide'))} break;
			case 'b': {this.brackets.classList.toggle('hide')} break;
			case 'd': {this.disc.classList.toggle('hide')} break;
    	}
	}

    placeShip(e, sillhouette) {
        sillhouette = sillhouette ?? {array: [[0,1,0],[1,1,1],[0,1,0],[1,1,1],[1,0,1],[1,0,1]], width:3, offset() {return this.useOffset ? Math.floor(this.width / 2) : 0}}; // ! Tester. Remove.
        if (e.target.classList.contains('cell')) {
            const cell = e.target.id;
            sillhouette.array.forEach((row,i)=>{
                row.forEach((c,k)=>{
                    const idx = (num) => String( num + ((100 * i) + (k - sillhouette.offset())) ).padStart(4,'0'); // INCREMENT 4 DIGIT CELL KEY FROM CLICKED
                    if (c==1) cells[idx(Number(cell))].classList.add('activeCell'); // ! This wil probably work differently later
                })
            })
        }
    }

    update() {
        this.brackets.style.left = this.brackets.xpos + 'px';
        this.brackets.style.top = this.brackets.ypos + 'px';
        this.disc.style.left = this.disc.xpos + 'px';
        this.disc.style.top = this.disc.ypos + 'px';
        this.crosshairV.style.left = this.disc.xpos + 'px';
        this.crosshairH.style.top = this.disc.ypos + 'px';
    }

};