import Board from "../components/board/Board.js";

const usrBoardEl = document.getElementById('usr-board');
const oppBoardEl = document.getElementById('opp-board');
const targetingSystem = document.getElementById('load-targeting-System');

const usrBoard = new Board(usrBoardEl,targetingSystem);
await usrBoard.render();
const usrBoard2 = new Board(oppBoardEl);
await usrBoard2.render();
// const oppBoard = new Board(oppBoardEl, '../components/board');
// await oppBoard.render();
// usrBoard.mode('place-ships');
// usrBoard2.mode('place-ships');

const orientBtn = document.getElementById('btn-orient');
orientBtn.addEventListener('click', e=>usrBoardEl.classList.toggle('rotate'))