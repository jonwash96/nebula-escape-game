const Board = document.querySelector('.Board');
const Container = document.querySelector('.Board-grid-container');
const header = document.querySelector('.Board header');
const footer = document.querySelector('.Board footer');
const left = document.querySelector('.Board aside.left');
const right = document.querySelector('.Board aside.right');
const letters = [header, footer];
const numbers = [left, right];
const targeting = document.querySelector('section.targeting-system');
const brackets = document.querySelector('.targeting-brackets'); 
const disc = document.querySelector('.targeting-disc'); 
const crosshairs = document.querySelectorAll('.crosshairs');
const crosshairV = document.querySelector('.xhv');
const crosshairH = document.querySelector('.xhh');
const bracketNode = document.querySelector('.bracket-node > span');
const cells = {};

const colRow =  [ ['A', 1], ['B', 2], ['C', 3], ['D', 4], ['E', 5], ['F', 6], ['G', 7], ['H', 8], ['I', 9], ['J', 10], ['K', 11], ['L', 12], ['M', 13], ['N', 14], ['O', 15], ['P', 16], ['Q', 17], ['R', 18], ['S', 19], ['T', 20], ['U', 21], ['V', 22], ['W', 23], ['X', 24], ['Y', 25], ['Z', 26] ]

for (let i = 0; i<26; i++) {
    numbers.forEach(self=>{
        const el = document.createElement('div');
        el.textContent = colRow[i][0];
        self.appendChild(el);
    });

    letters.forEach(self=>{
        const el = document.createElement('div');
        el.textContent = colRow[i][1];
        self.appendChild(el);
    });

    const row = document.createElement('div');
        row.classList.add('board-row');
    colRow.forEach((c,k)=>{
        const el = document.createElement('div');
        let key =`${String(i+1).padStart(2,'0')}${String(k+1).padStart(2,'0')}`;
            el.id = key;
            el.classList.add(`${i+1}${c[0]}`);
            el.classList.add('cell');
            el.textContent = `${i+1}${c[0]}`;
        row.appendChild(el);
        cells[key] = el;
    });
    Container.appendChild(row);
}

let follow = true;
document.addEventListener('keypress', (e) => {
    e.preventDefault();
    switch (e.key) {
        case ' ': {follow = !follow} break;
        case 'c': {crosshairs.forEach(el=>el.classList.toggle('hide'))} break;
        case 'b': {brackets.classList.toggle('hide')} break;
        case 'd': {disc.classList.toggle('hide')} break;
    }
});

Board.addEventListener('mousemove',handleMouseMove);
function handleMouseMove(e) {
    const hoverOver = document.elementsFromPoint(e.clientX,e.clientY);
    // console.log(hoverOver);
    if (follow) {
        targeting.classList.remove('hide');
        targeting.classList.add('show');
        brackets.xpos = remap(e.clientX, 0, window.innerWidth, window.innerWidth*0.10, window.innerWidth*0.9);
        brackets.ypos = remap(e.clientY, 0, window.innerHeight, window.innerHeight*0.1, window.innerHeight*0.90);
        disc.xpos = e.clientX;
        disc.ypos = e.clientY;
        crosshairV.xpos = e.clientX;
        crosshairH.ypos = e.clientY;
        bracketNode.textContent = hoverOver[0].classList;
        // console.log(e.clientX, e.clientY, "handleMouseMove(",brackets.xpos, brackets.ypos,")");
        render();
    } else if (!hoverOver.includes(Board)) {
        targeting.classList.remove('show');
        targeting.classList.add('hide')
    }
};
 // ! TESTER CODE 
Board.addEventListener('click', handleClick)
function handleClick(e) {
    const sillhouette = [[0,1,0],[1,1,1],[0,1,0],[1,1,1],[1,0,1],[1,0,1]];
    const config = {
        width:sillhouette[0].length,
        height:sillhouette.length,
        area:sillhouette.flat().filter(c=>c==1).length,
        useOffset:true,
        offset() {return this.useOffset ? Math.floor(this.width / 2) : 0}
    };
    console.log("handleClick("+e.target.classList+")");
    console.log(config);
    if (e.target.classList.contains('cell')) {
        const cell = e.target.id;
        // e.target.classList.toggle('activeCell');
        sillhouette.forEach((row,i)=>{
            row.forEach((c,k)=>{
                const idx = (cellNum) => String( cellNum + ((100 * i) + (k - config.offset())) ).padStart(4,'0'); // INCREMENT 4 DIGIT CELL KEY FROM CLICKED
                if (c==1) cells[idx(Number(cell))].classList.add('activeCell');
            })
        })
    }
}

function render() {
    console.log("render()")
    brackets.style.left = brackets.xpos + 'px';
    brackets.style.top = brackets.ypos + 'px';
    disc.style.left = disc.xpos + 'px';
    disc.style.top = disc.ypos + 'px';
    crosshairV.style.left = disc.xpos + 'px';
    crosshairH.style.top = disc.ypos + 'px';
}

(function init() {
    brackets['xpos'] = window.innerWidth/2;
    brackets['ypos'] = window.innerHeight/2;
    // brackets.classList.toggle('hide');
    disc['xpos'] = window.innerWidth/2;
    disc['ypos'] = window.innerHeight/2;
    disc.classList.toggle('hide');
    crosshairV['xpos'] = window.innerWidth/2;
    crosshairH['ypos'] = window.innerHeight/2;
    // crosshairs.forEach(el=>el.classList.toggle('hide'));


    // console.log("init("+brackets.xpos, brackets.ypos+")");
    render();
})();

