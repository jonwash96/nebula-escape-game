import Board from "../components/board/Board.js";

const usrBoardEl = document.getElementById('usr-board');
const oppBoardEl = document.getElementById('opp-board');

const usrBoard = new Board(usrBoardEl, '../components/board');
await usrBoard.render();
const oppBoard = new Board(oppBoardEl, '../components/board');
await oppBoard.render();