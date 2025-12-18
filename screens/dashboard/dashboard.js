import Board from "../components/board/Board.js";

const target = document.getElementById('usr-board');

const usrBoard = new Board(target, '../components/board');
usrBoard.render();
// const oppBoard = new Board(target, '../components/board');
// oppBoard.render();