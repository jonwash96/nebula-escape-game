class Board {
	constructor(root, options) {
        this.root = root;
		this.target = document.querySelector('.Board');
		this.Container = document.querySelector('.Board-grid-container');
		this.header = document.querySelector('.Board header');
		this.footer = document.querySelector('.Board footer');
		this.left = document.querySelector('.Board aside.left');
		this.right = document.querySelector('.Board aside.right');
		this.letters = [header, footer];
		this.numbers = [left, right];
		this.targeting = document.querySelector('section.targeting-system');
		this.brackets = document.querySelector('.targeting-brackets');
		this.disc = document.querySelector('.targeting-disc');
		this.crosshairs = document.querySelectorAll('.crosshairs');
		this.crosshairV = document.querySelector('.xhv');
		this.crosshairH = document.querySelector('.xhh');
		this.bracketNode = document.querySelector('.bracket-node > span');

		this.createBoard();

		this.follow = options.follow ?? true;
		document.addEventListener('keypress', this.handleKeyPress);
		Board.addEventListener('mousemove',this.handleMouseMove);

		brackets['xpos'] = window.innerWidth / 2;
		brackets['ypos'] = window.innerHeight / 2;
		// brackets.classList.toggle('hide');
		disc['xpos'] = window.innerWidth / 2;
		disc['ypos'] = window.innerHeight / 2;
		disc.classList.toggle('hide');
		crosshairV['xpos'] = window.innerWidth / 2;
		crosshairH['ypos'] = window.innerHeight / 2;
		// crosshairs.forEach(el=>el.classList.toggle('hide'));

		this.update();
	};


    // INITIALIZERS
	colRow = [['A', 1], ['B', 2], ['C', 3], ['D', 4], ['E', 5], ['F', 6], ['G', 7], ['H', 8], ['I', 9], ['J', 10], ['K', 11], ['L', 12], ['M', 13], ['N', 14], ['O', 15], ['P', 16], ['Q', 17], ['R', 18], ['S', 19], ['T', 20], ['U', 21], ['V', 22], ['W', 23], ['X', 24], ['Y', 25], ['Z', 26]];
	cells = {};

	createBoard() {
		for (let i = 0; i < 26; i++) {
			numbers.forEach(self => {
				const el = document.createElement('div');
				el.textContent = colRow[i][0];
				self.appendChild(el);
			});

			letters.forEach(self => {
				const el = document.createElement('div');
				el.textContent = colRow[i][1];
				self.appendChild(el);
			});

			const row = document.createElement('div');
			row.classList.add('board-row');
			colRow.forEach((c, k) => {
				const el = document.createElement('div');
				let key = `${String(i + 1).padStart(2, '0')}${String(k + 1).padStart(2, '0')}`;
				el.id = key;
				el.classList.add(`${i + 1}${c[0]}`);
				el.classList.add('cell');
				el.textContent = `${i + 1}${c[0]}`;
				row.appendChild(el);
				cells[key] = el;
			});
			Container.appendChild(row);
		}
	}

    // PUBLIC
    status = {
        mode:'init'
    }


    // METHODS
    mode(option) {
        this.status.mode = option;
        switch (option) {
            case 'place-ships': {this.addEventListener('click', this.placeShip)} break;
        }
    }

	// EVENT HANDLERS
	handleMouseMove(e) {
		const hoverOver = document.elementsFromPoint(e.clientX,e.clientY);
		if (this.follow && hoverOver.includes(Board)) {
			this.targeting.classList.remove('hide');
			this.targeting.classList.add('show');
			this.brackets.xpos = remap(e.clientX, 0, window.innerWidth, window.innerWidth*0.10, window.innerWidth*0.9);
			this.brackets.ypos = remap(e.clientY, 0, window.innerHeight, window.innerHeight*0.1, window.innerHeight*0.90);
			this.disc.xpos = e.clientX;
			this.disc.ypos = e.clientY;
			this.crosshairV.xpos = e.clientX;
			this.crosshairH.ypos = e.clientY;
			this.bracketNode.textContent = hoverOver[0].classList;
			render();
		} else if (!hoverOver.includes(Board)) {
			targeting.classList.remove('show');
			targeting.classList.add('hide');
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
        const sillhouette = sillhouette ?? {array: [[0,1,0],[1,1,1],[0,1,0],[1,1,1],[1,0,1],[1,0,1]], width:3, offset() {return this.useOffset ? Math.floor(this.width / 2) : 0}}; // ! Tester. Remove.
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

    render() { fetch('./board.html').then(body=>this.root.innerHTML = body.text()) }; // ! UNTESTED. I know not whether this works or is allowed under the project guidelines

}