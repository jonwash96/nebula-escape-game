// PLACE SHIPS
game.status.mode('place-ships');
Board.placeShips();
     // ship.onclick()
    const placement = Board.placeShips(sillhouette) // that was clicked. Returns array [head,[...cells]]
    // select next & repeat

shipsPanel.addEventListener('click', (e) => {
    const hoverOver = document.elementsFromPoint(e.clientX,e.clientY);
    if (e.target.classList.includes('ship')) {
        const projection = ships[e.target.id].projection
        if (!activeProjection) {
            projection.addEventListener('mousemove',handleMouseMove);
            projection.classlist.replace('hide','show');
        } else {
            switch (e.target.id) {
                case 'board': {board.placeShip(e)} break;
                case 'db-brkt-usr-ships': {
                    projection.classlist.replace('show','hide');
                    projection.removeEventListener('mousemove',handleMouseMove);
                    /* reset its position */
                } break;

            }
        } // ! finish this
        
    }
})

handleMouseMove(e) {
	const hoverOver = document.elementsFromPoint(e.clientX,e.clientY);
    const projection = player.ships[e.target.dataset.ship].projection
        ship.projection.xpos = e.clientX;
		ship.projection.ypos = e.clientY;
}