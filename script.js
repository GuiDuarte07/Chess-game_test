const gameTable_section = document.querySelector('.chess-table');
const numRegex = /\d/g;

//Matrix that stores all game information
let gameSituation = [];
//temporarily store obj situation of a position of gameSituation
let tempGameSituation = [];
//Store fields the king cannot enter
let kingFields = [];

//Check if the game continues
let isGameOver = false;
//Tell me whose turn it is
let isPlayerOne = true;

//Save element id information
let idValue = [];

//Atived when a king under check situation
let forceKingMovie = false;

let mateCheckValidate = false;
let isNotCheckMate = false;

//Stores the element that is in the drag
let attDragItem = undefined;
let attDropItem = undefined;
let attElementItem = undefined;

//Variables used to check if a move of a piece will revert check situation
//Will store one play before of gameSituation and kingFields
let checkPlay = false;
let gameSituationSaveData = [];
let kingFieldsSaveData = [];

//Not to allow entering the dragEnd function when pawn promotion
let isPawnPromotion = false;

let wasRookOrKing = false;

//Variável com todas os quadrados da mesa
const allSquares = gameTable_section.childNodes;

//MOVER MAIS TARDE
const deepClone = obj => {
	// Se não for array ou objeto, retorna null
	if (typeof obj !== 'object' || obj === null) {
		return obj;
	}

	let cloned, i;

	// Handle: Date
	if (obj instanceof Date) {
		cloned = new Date(obj.getTime());
		return cloned;
	}

	// Handle: array
	if (obj instanceof Array) {
		let l;
		cloned = [];
		for (i = 0, l = obj.length; i < l; i++) {
			cloned[i] = deepClone(obj[i]);
		}

		return cloned;
	}

	// Handle: object
	cloned = {};
	for (i in obj) if (obj.hasOwnProperty(i)) {
		cloned[i] = deepClone(obj[i]);
	}

	return cloned;
}

/* -----------------------------------------------------TABLE FEATURES----------------------------------------------------- */
//Start game matrix
const initGameSituation = () => {
    gameSituation = [];
    for(let i = 0; i < 8; i++){
        gameSituation[i] = []
        for(let j = 0; j < 8; j++){
            gameSituation[i][j] = {
                havePiece: false,
                colorPiece: undefined,
                typePiece: undefined,
            }
        }
    }
}

//Create all squares on the board
const createTableSquare = () => {
    gameTable_section.innerHTML = '';

    initGameSituation();

    //Position in x and y
    let squareId = [0, 0];

    for (let i = 0; i < 8; i++) {
        if (i%2){
            for (let j = 0; j < 8; j++){
                const square = document.createElement('div');
                square.classList.add('square');

                if (j%2){
                    square.classList.add('white-table');
                    square.setAttribute('id', `${squareId[0]}-${squareId[1]}`);
                    squareId[1] = (++squareId[1])%8;
                } else {
                    square.classList.add('black-table');
                    square.setAttribute('id', `${squareId[0]}-${squareId[1]}`);
                    squareId[1] = (++squareId[1])%8;
                }
                gameTable_section.appendChild(square);
            }
        } else {
            for (let j = 0; j < 8; j++){
                const square = document.createElement('div');
                square.classList.add('square');
        
                if (j%2){
                    square.classList.add('black-table');
                    square.setAttribute('id', `${squareId[0]}-${squareId[1]}`);
                    squareId[1] = (++squareId[1])%8;
                } else {
                    square.classList.add('white-table');
                    square.setAttribute('id', `${squareId[0]}-${squareId[1]}`);
                    squareId[1] = (++squareId[1])%8;
                }
                gameTable_section.appendChild(square);
            }
        }
        squareId[0]++;
        
    }
    insertTablePieces();
}

//Create the board pieces
const insertTablePieces = () => {
    /*---------------------------------------------Creating the white pieces!-----------------------------------------------*/
    //creating white pawns
    for(let i = 0; i < 8; i++){
        insertImagePiece (1, i, 'pawn', 'black', 'pdt');
    }
    //creating white towers
    insertImagePiece (0, 0, 'rook', 'black', 'rdt');
    insertImagePiece (0, 7, 'rook', 'black', 'rdt');

    //Creating white knights
    insertImagePiece (0, 1, 'knight', 'black', 'ndt');  
    insertImagePiece (0, 6, 'knight', 'black', 'ndt');

    //Creating white bishops
    insertImagePiece (0, 2, 'bishop', 'black', 'bdt');
    insertImagePiece (0, 5, 'bishop', 'black', 'bdt');

    //Creating white queen
    insertImagePiece (0, 3, 'queen', 'black', 'qdt');

    //Creating white king
    insertImagePiece (0, 4, 'king', 'black', 'kdt');
    
    /*---------------------------------------------Creating the black pieces!-----------------------------------------------*/
    //creating black towers
    for(let i = 0; i < 8; i++){
        insertImagePiece (6, i, 'pawn', 'white', 'plt');
    }
    //creating black towers
    insertImagePiece (7, 0, 'rook', 'white', 'rlt');
    insertImagePiece (7, 7, 'rook', 'white', 'rlt');

    //Creating black knights
    insertImagePiece (7, 1, 'knight', 'white', 'nlt');
    insertImagePiece (7, 6, 'knight', 'white', 'nlt');

    ///Creating black bishops
    insertImagePiece (7, 2, 'bishop', 'white', 'blt');
    insertImagePiece (7, 5, 'bishop', 'white', 'blt');

    //Creating black queen
    insertImagePiece (7, 3, 'queen', 'white', 'qlt');

    //Creating black king
    insertImagePiece (7, 4, 'king', 'white', 'klt');
}

//Insert image and info that a certain piece type
const insertImagePiece = (i, j, pieceName, colorPiece, svgName) => {
    
    anySquare = document.getElementById(`${i}-${j}`);
    gameSituation[i][j].typePiece = pieceName;
    gameSituation[i][j].colorPiece = colorPiece;
    gameSituation[i][j].havePiece = true;
    if (pieceName === 'rook' || pieceName === 'king'){
        gameSituation[i][j].hasMoved = false;
    }

    const piece_img = document.createElement('img');
    piece_img.src = `./svg_pieces/Chess_${svgName}45.svg`;
    insertDragAndDrop(piece_img);
    anySquare.appendChild(piece_img);
}

/* ----------------------------------------------DRAG AND DROP FUNCTIONS!---------------------------------------------------*/
//Add drag-and-drop functions to a piece
const insertDragAndDrop = (element) => {
    element.draggable = true;
    element.setAttribute('ondragstart', 'setDragStart(event)');
    element.setAttribute('ondragend', 'setDragEnd()');
}

//Function for drag start!
const setDragStart = (event) => {
    if(isGameOver) return;

    attDragItem = event.target;
    attElementItem = attDragItem.parentNode;
    
    getId(attElementItem);
    
    let x = idValue[0], y = idValue[1];
    
    if(gameSituation[x][y].colorPiece !== (isPlayerOne ? 'white' : 'black')) return;
    
    /* allSquares.forEach(square => {
        square.classList.add('border-view');
    });
 */
    saveTempGameSituation(false, x, y);
    executFunction[gameSituation[x][y].typePiece](x, y, false);

    //It will create the effect of disappear in this piece
    setTimeout(() => attDragItem.remove(), 0);
}

//Function for drag end, will check if was all okay
const setDragEnd = () => {
    removeSquareDrop();
    if (isGameOver) setTimeout(() => alert(`${isPlayerOne ? "black" : "white"} wins!`),0);

    if (isPawnPromotion) {
        console.log('pq disso???')
        isPawnPromotion = false;
        return;
    }
    if (attDropItem && attDropItem.childNodes[0] === attDragItem) return;
    attElementItem.appendChild(attDragItem);
}

//Function for drop funcionality, will apend the piece in the drop element
const setDrop = (event) => {
    event.preventDefault();
    let selectEl = event.target;

    while (!selectEl.classList.contains('square')){
        selectEl = selectEl.parentNode;
    }
    if (selectEl.childNodes[0]) selectEl.childNodes[0].remove();

    selectEl.appendChild(attDragItem);

    if (selectEl.classList.contains('castle')){
        changeGameSituation(attElementItem, selectEl, true);
    } else {
        changeGameSituation(attElementItem, selectEl);
    }
    
    isPlayerOne = isPlayerOne? false: true;
    verifyKingFields();
}

//Get and save the element that a drag is over
const setDragOver = (event) => {
    event.preventDefault();
    //It will check if the piece being dragged was dropped on the same element as we have in this variable
    attDropItem = event.target;
    while (!attDropItem.classList.contains('square')){
        attDropItem = attDropItem.parentNode;
    }
}

//When drag end, remove drag funtionality from all pieces
const removeSquareDrop = () => {
    allSquares.forEach(square => {
        /* square.classList.remove('border-view'); */
        if(square.classList.contains('spotlight')){
            square.classList.remove('spotlight');
            square.removeAttribute('ondrop');
            square.removeAttribute('ondragover');
        }
    });
}

/* --------------------------------------------UTILITY FUNCTIONS!---------------------------------------------------------- */

//Will show the position a piece can go
const squareDrop = (x, y, castle) => {
    const element = document.getElementById(`${x}-${y}`);
    element.classList.add('spotlight');
    element.setAttribute('ondrop', 'setDrop(event)');
    element.setAttribute('ondragover', 'setDragOver(event)');
    if (castle) {
        element.classList.add('castle');
    }
}

//Aply pawn promotion to queen
const changeImgToQueen = (x, y, color) => {
    gameSituation[x][y].typePiece = 'queen';
    console.trace()
    console.log('salveee!!!')
    if (checkPlay) return;

    const svgName = (color === 'black') ? 'qdt' : 'qlt';
    const pawnPiece = document.getElementById(`${x}-${y}`);

    const piece_img = document.createElement('img');
    piece_img.src = `./svg_pieces/Chess_${svgName}45.svg`;
    insertDragAndDrop(piece_img);
    pawnPiece.childNodes[0].remove();
    pawnPiece.appendChild(piece_img);
}

//Will make the play and save it in gameSituation matrix
const changeGameSituation = (prevEl, afterEl, castle) => {
    getId(afterEl);
    saveTempGameSituation(true, idValue[0], idValue[1]);

    if (castle) {
        let x = idValue[0];
        let y = idValue[1];
        let prY = y === 6 ? 7 : 0; //prevRookY
        let arY = prY === 7 ? 5 : 3; //afterRookY
        
        gameSituation[x][arY].havePiece = true;
        gameSituation[x][arY].colorPiece = gameSituation[x][prY].colorPiece;
        gameSituation[x][arY].typePiece = 'rook'
        gameSituation[x][arY].hasMoved = true;

        gameSituation[x][prY].havePiece = false;
        gameSituation[x][prY].colorPiece = undefined;
        gameSituation[x][prY].typePiece = undefined;
        delete gameSituation[x][prY].hasMoved;

        let rook_img = document.getElementById(`${x}-${prY}`).childNodes[0];
        rook_img.remove();

        document.getElementById(`${x}-${arY}`).appendChild(rook_img);
    }
    
    getId(prevEl);
    gameSituation[idValue[0]][idValue[1]].havePiece = false;
    gameSituation[idValue[0]][idValue[1]].colorPiece = undefined;
    gameSituation[idValue[0]][idValue[1]].typePiece = undefined;
    delete gameSituation[idValue[0]][idValue[1]].hasMoved;
}

//Get the row and column from a id
const getId = (squareEl) => {
    idValue = [];
    squareEl.id.match(numRegex).forEach(ind => {
        idValue.push(parseInt(ind));
    });
}


//get the new position of a piece saved in tempGameSituation or save this piece in it
const saveTempGameSituation = (recover, x, y) => {
    if (recover) {
        console.log(gameSituation[x][y], x, y)
        gameSituation[x][y].havePiece = tempGameSituation.havePiece;
        gameSituation[x][y].colorPiece = tempGameSituation.colorPiece;
        gameSituation[x][y].typePiece = tempGameSituation.typePiece;
        //When rook or king play (useful for castling funcion)
        if('hasMoved' in tempGameSituation) {
            gameSituation[x][y].hasMoved = true;
        }
        //Verify queen promotion (when pawn play)
        if (gameSituation[x][y].typePiece === 'pawn'){
            let queenPromotion = gameSituation[x][y].colorPiece === 'white' ? 0 : 7;
            if (x === queenPromotion){/* !check &&  */
                console.log(tempGameSituation)
                console.log(queenPromotion)
                changeImgToQueen(x, y, gameSituation[x][y].colorPiece);
                isPawnPromotion = true;
            }
        }
        return;
    }

    tempGameSituation = {
        havePiece: false,
        colorPiece: undefined,
        typePiece: undefined,
    }
    tempGameSituation.havePiece = gameSituation[x][y].havePiece;
    tempGameSituation.colorPiece = gameSituation[x][y].colorPiece;
    tempGameSituation.typePiece = gameSituation[x][y].typePiece;
    if('hasMoved' in gameSituation[x][y]) tempGameSituation.hasMoved = gameSituation[x][y].hasMoved;
}

//Return the gameSituation and kingFields to the beginning with save datas
const goBackOnePlay = () => {
    checkPlay = false;
    kingFields = deepClone(kingFieldsSaveData);
    initGameSituation();

    gameSituation = deepClone(gameSituationSaveData);
    /* for (let x = 0; x < 8; x++){
        for (let y = 0; y < 8; y++) {
            gameSituation[x][y].havePiece = gameSituationSaveData[x][y].havePiece;
            gameSituation[x][y].colorPiece = gameSituationSaveData[x][y].colorPiece;
            gameSituation[x][y].typePiece = gameSituationSaveData[x][y].typePiece;
            if('hasMoved' in gameSituationSaveData[x][y]) gameSituation[x][y].hasMoved = gameSituationSaveData[x][y].hasMoved;
        }
    } */
}

//Responsible for checking whether a move will remove the king's check
const verifyPlayCheck = (x, y, i, j) => {
    checkPlay = true;
    //gameSituationSaveData store the gameSituation matrix before play in analysis
    gameSituationSaveData = [];

    gameSituationSaveData = deepClone(gameSituation);
    //Same thing with kingFieldsSaveData
    kingFieldsSaveData = deepClone(kingFields);
    console.log(document.getElementById(`${x}-${y}`))
    console.log(document.getElementById(`${i}-${j}`))
    changeGameSituation(document.getElementById(`${x}-${y}`), document.getElementById(`${i}-${j}`));
    //This will make the new matrix that will reveal whether it was sucessful or not
    verifyKingFields();
}

//Reset kingFields matrix
const resetKingFields = () => {
    kingFields = [];
    forceKingMovie = false;

    for (let i = 0; i < 8; i++){
        kingFields[i] = []
        for (let j = 0; j < 8; j++){
            kingFields[i][j] = {
                isCheck : false,
                pieces : []
            };
        }
    }
}

//Castle from left
const leftCastle = (x) => {
    //Looking for a piece where it can't be
    if (gameSituation[x][1].havePiece || gameSituation[x][2].havePiece || gameSituation[x][3].havePiece) return;
    if (!gameSituation[x][0].havePiece) return;
    if (gameSituation[x][0].typePiece !== 'rook') return;
    if (gameSituation[x][0].hasMoved) return;

    //King checks
    if (!gameSituation[x][4].havePiece) return;
    if (gameSituation[x][4].typePiece !== 'king') return;
    if (gameSituation[x][4].hasMoved) return;

    //Check checks
    if (kingFields[x][4].isCheck || kingFields[x][3].isCheck || kingFields[x][2].isCheck) return;

    squareDrop(x, 2, true);
}

/* ----------------------------------------------CASTLE FUNCTIONS!--------------------------------------------------------- */

//Castle from right
const rightCastle = (x) => {
    //CLooking for a piece where it can't be
    if (gameSituation[x][5].havePiece || gameSituation[x][6].havePiece) return;
    if (!gameSituation[x][7].havePiece) return;
    if (gameSituation[x][7].typePiece !== 'rook') return;
    if (gameSituation[x][7].hasMoved) return;

    
    //King checks
    if (!gameSituation[x][4].havePiece) return;
    if (gameSituation[x][4].typePiece !== 'king') return;
    if (gameSituation[x][4].hasMoved) return;
    
    //Check checks
    if (kingFields[x][4].isCheck || kingFields[x][5].isCheck || kingFields[x][6].isCheck) return;

    squareDrop(x, 6, true);
}

//Castling check
const verifyCastling = () => {
    let x = isPlayerOne ? 7 : 0;

    leftCastle(x);
    rightCastle(x);
}

/* ----------------------------------------------PIECES MOVEMENT FUNCTIONS!------------------------------------------------ */

const executFunction = {
    'pawn'   : (x, y, kingField) => pawnMove(x, y, kingField),
    'rook'   : (x, y, kingField) => rookMove(x, y, kingField),
    'bishop' : (x, y, kingField) => bishopMove(x, y, kingField),
    'knight' : (x, y, kingField) => knightMove(x, y, kingField),
    'queen'  : (x, y, kingField) => queenMove(x, y, kingField),
    'king'   : (x, y, kingField) => kingMove(x, y, kingField)
}

//Move of the pawn piece
const pawnMove = (x, y, kingField) => {
    const initRow = (kingField ? (isPlayerOne === true ? false : true) : isPlayerOne) ? 6 : 1;
    let op = (kingField ? (isPlayerOne === true ? false : true) : isPlayerOne) ? -1 : +1;
    
    //Take piece with pawn (on the front diagonal of the pawn)
    for (let j = y-1; j <= y+1; j++){
        if (x+op > 7 || x+op < 0 || j < 0 || j > 7) {
            j++;
            continue;
        }
        if(kingField){
            kingFields[x + op][j].isCheck = true;
            kingFields[x + op][j].pieces.push({
                typePiece: gameSituation[x][y].typePiece,
                colorPiece: gameSituation[x][y].colorPiece,
                x: x,
                y: y
            });
            j++;
            continue;
        }
        if (gameSituation[x+op][j].havePiece && gameSituation[x+op][j].colorPiece !== gameSituation[x][y].colorPiece){
            if (!kingField && forceKingMovie && !checkPlay) {
                //Verify if put this piece in this position will resolve check situation
                saveTempGameSituation(false, x, y);
                verifyPlayCheck(x, y, x + op, j);

                if (!forceKingMovie) {
                    forceKingMovie = true;
                    if (mateCheckValidate) {
                        isNotCheckMate = true;
                        goBackOnePlay();
                        return;
                    }
                    squareDrop(x + op, j);
                }
                goBackOnePlay();
                j++;
                continue;
            }
            squareDrop(x + op, j);
        }
        j++;
    }

    if (kingField) return;

    if(x === initRow){
        for (let i = 1; i <= 2; i++){
            if(gameSituation[x + op*i][y].havePiece) break;

            if (forceKingMovie && !checkPlay) {
                //Verify if put this piece in this position will resolve check situation
                saveTempGameSituation(false, x, y);
                verifyPlayCheck(x, y, x + op*i, y);
                if (!forceKingMovie) {
                    forceKingMovie = true;
                    if (mateCheckValidate) {
                        isNotCheckMate = true;
                        goBackOnePlay();
                        return;
                    }
                    squareDrop(x + op*i, y);
                }
                goBackOnePlay();
                continue;
            }
            squareDrop(x + op*i, y);
        }
    } else {
        if (gameSituation[x+op][y].havePiece) return;
        if (forceKingMovie && !checkPlay) {
            //Verify if put this piece in this position will resolve check situation
            saveTempGameSituation(false, x, y);
            verifyPlayCheck(x, y, x + op, y);
            if (!forceKingMovie) {
                forceKingMovie = true;
                if (mateCheckValidate) {
                    isNotCheckMate = true;
                    goBackOnePlay();
                    return;
                }
                squareDrop(x + op, y);
            }
            goBackOnePlay();
            return;
        }
        squareDrop(x + op, y);
    }
}

//Move of the bishop piece
const bishopMove = (x, y, kingField) => {
    let dist = 1, localeSpot = -1, continueSide = [], continueWhile = true;
    let allyPiece, enemyPiece;

    for (let i = 0; i < 4; i++) continueSide[i] = true;

    if(kingField){
        allyPiece = isPlayerOne ? 'black' : 'white';
        enemyPiece = isPlayerOne ? 'white' : 'black';
    } else {
        allyPiece = isPlayerOne ? 'white' : 'black';
        enemyPiece = isPlayerOne ? 'black' : 'white';
    }

    while(continueWhile){
        for(let i = x - dist; i <= x + dist; i++){
            if (i != x + dist && i != x - dist) continue;
            
            for(let j = y - dist; j <= y + dist; j++){
                if (j != y + dist && j != y - dist) continue;
                localeSpot++;
                if (i < 0 || i > 7) continue;
                if (j < 0 || j > 7)continue;

                if (continueSide[localeSpot%4] && gameSituation[i][j].havePiece && gameSituation[i][j].colorPiece === allyPiece){
                    continueSide[localeSpot%4] = false;
                    if (kingField) {
                        kingFields[i][j].isCheck = true;
                        kingFields[i][j].pieces.push({
                            typePiece: gameSituation[x][y].typePiece,
                            colorPiece: gameSituation[x][y].colorPiece,
                            x: x,
                            y: y
                        });
                    }
                    continue;
                }
                if (continueSide[localeSpot%4] && gameSituation[i][j].havePiece && gameSituation[i][j].colorPiece === enemyPiece){
                    if (kingField && gameSituation[i][j].typePiece === 'king'){
                        continueSide[localeSpot%4] = true;
                    } else continueSide[localeSpot%4] = false;

                    if (!kingField && forceKingMovie && !checkPlay) {
                        //Verify if put this piece in this position will resolve check situation
                        saveTempGameSituation(false, x, y);
                        verifyPlayCheck(x, y, i, j);
        
                        if (!forceKingMovie) {
                            forceKingMovie = true;
                            if (mateCheckValidate) {
                                isNotCheckMate = true;
                                goBackOnePlay();
                                return;
                            }
                            squareDrop(i, j);
                        }
                        goBackOnePlay();
                        continue;
                    }

                    if (kingField) {
                        kingFields[i][j].isCheck = true;
                        kingFields[i][j].pieces.push({
                            typePiece: gameSituation[x][y].typePiece,
                            colorPiece: gameSituation[x][y].colorPiece,
                            x: x,
                            y: y
                        });
                    } else squareDrop(i, j);
                }

                if (continueSide[localeSpot%4]) {
                    if (!kingField && forceKingMovie && !checkPlay) {
                        //Verify if put this piece in this position will resolve check situation
                        saveTempGameSituation(false, x, y);
                        verifyPlayCheck(x, y, i, j);
        
                        if (!forceKingMovie) {
                            forceKingMovie = true;
                            if (mateCheckValidate) {
                                isNotCheckMate = true;
                                goBackOnePlay();
                                return;
                            }
                            squareDrop(i, j);
                        }
                        goBackOnePlay();
                        continue;
                    }

                    if (kingField) {
                        kingFields[i][j].isCheck = true;
                        kingFields[i][j].pieces.push({
                            typePiece: gameSituation[x][y].typePiece,
                            colorPiece: gameSituation[x][y].colorPiece,
                            x: x,
                            y: y
                        });
                    } else squareDrop(i, j);
                }
            }
        }
        dist++;
        if (dist >= 8) continueWhile = false;
    }
}

//Move of the rook piece
const rookMove = (x, y, kingField) => {
    let dist = 1, localeSpot = -1, continueSide = [], continueWhile = true;
    let allyPiece, enemyPiece;

    for (let i = 0; i < 4; i++) continueSide[i] = true;

    if(kingField){
        allyPiece = isPlayerOne ? 'black' : 'white';
        enemyPiece = isPlayerOne ? 'white' : 'black';
    } else {
        allyPiece = isPlayerOne ? 'white' : 'black';
        enemyPiece = isPlayerOne ? 'black' : 'white';
    }

    while(continueWhile){
        for(let i = x - dist; i <= x + dist; i++){
            if (i !== x - dist && i !== x + dist && i !== x) continue;
            for(let j = y - dist; j <= y + dist; j++){
                if (j !== y - dist && j !== y + dist && j !== y) continue;
                if (j !== y && i !== x) continue;
                if (j === y && i === x) continue;
                localeSpot++;
                if (i < 0 || i > 7) continue;
                if (j < 0 || j > 7)continue;
                
                if (continueSide[localeSpot%4] && gameSituation[i][j].havePiece && gameSituation[i][j].colorPiece === allyPiece){
                    continueSide[localeSpot%4] = false;
                    if (kingField) {
                        kingFields[i][j].isCheck = true;
                        kingFields[i][j].pieces.push({
                            typePiece: gameSituation[x][y].typePiece,
                            colorPiece: gameSituation[x][y].colorPiece,
                            x: x,
                            y: y
                        });
                    }
                    continue;
                }else if (continueSide[localeSpot%4] && gameSituation[i][j].havePiece && gameSituation[i][j].colorPiece === enemyPiece){
                    if (kingField && gameSituation[i][j].typePiece === 'king'){
                        continueSide[localeSpot%4] = true;
                    } else {
                        continueSide[localeSpot%4] = false;
                    }
                    if (!kingField && forceKingMovie && !checkPlay) {
                        //Verify if put this piece in this position will resolve check situation
                        saveTempGameSituation(false, x, y);
                        verifyPlayCheck(x, y, i, j);
        
                        if (!forceKingMovie) {
                            forceKingMovie = true;
                            if (mateCheckValidate) {
                                isNotCheckMate = true;
                                goBackOnePlay();
                                return;
                            }
                            squareDrop(i, j);
                        }
                        goBackOnePlay();
                        continue;
                    }
                    if (kingField) {
                        kingFields[i][j].isCheck = true;
                        kingFields[i][j].pieces.push({
                            typePiece: gameSituation[x][y].typePiece,
                            colorPiece: gameSituation[x][y].colorPiece,
                            x: x,
                            y: y
                        });
                    } else squareDrop(i, j);
                }
                
                if (continueSide[localeSpot%4]) {
                    if (!kingField && forceKingMovie && !checkPlay) {
                        //Verify if put this piece in this position will resolve check situation
                        saveTempGameSituation(false, x, y);
                        verifyPlayCheck(x, y, i, j);
        
                        if (!forceKingMovie) {
                            forceKingMovie = true;
                            if (mateCheckValidate) {
                                isNotCheckMate = true;
                                goBackOnePlay();
                                return;
                            }
                            squareDrop(i, j);
                        }
                        goBackOnePlay();
                        continue;
                    }

                    if (kingField) {
                        kingFields[i][j].isCheck = true;
                        kingFields[i][j].pieces.push({
                            typePiece: gameSituation[x][y].typePiece,
                            colorPiece: gameSituation[x][y].colorPiece,
                            x: x,
                            y: y
                        });
                    } else squareDrop(i, j);
                }
            }
        }
        dist++;
        if (dist >= 8) continueWhile = false;
    }
}

//Move of the queen piece
const queenMove = (x, y, kingField) => {
    let dist = 1, localeSpot = -1, continueSide = [], continueWhile = true;
    let allyPiece, enemyPiece;

    for (let i = 0; i < 8; i++) continueSide[i] = true;

    if(kingField){
        allyPiece = isPlayerOne ? 'black' : 'white';
        enemyPiece = isPlayerOne ? 'white' : 'black';
    } else {
        allyPiece = isPlayerOne ? 'white' : 'black';
        enemyPiece = isPlayerOne ? 'black' : 'white';
    }
    while(continueWhile){
        for(let i = x - dist; i <= x + dist; i++){ 
            if (i !== x - dist && i !== x + dist && i !== x) continue;
            for(let j = y - dist; j <= y + dist; j++){
                if (j !== y - dist && j !== y + dist && j !== y) continue;
                if (j === y && i === x) continue;
                localeSpot++;
                if (i < 0 || i > 7) continue;
                if (j < 0 || j > 7)continue;
                
                if (continueSide[localeSpot%8] && gameSituation[i][j].havePiece && gameSituation[i][j].colorPiece === allyPiece){
                    continueSide[localeSpot%8] = false;
                    if (kingField) {
                        kingFields[i][j].isCheck = true;
                        kingFields[i][j].pieces.push({
                            typePiece: gameSituation[x][y].typePiece,
                            colorPiece: gameSituation[x][y].colorPiece,
                            x: x,
                            y: y
                        });
                    }
                    continue;
                }else if (continueSide[localeSpot%8] && gameSituation[i][j].havePiece && gameSituation[i][j].colorPiece === enemyPiece){
                    if (kingField && gameSituation[i][j].typePiece === 'king'){
                        continueSide[localeSpot%8] = true;
                    } else {
                        continueSide[localeSpot%8] = false;
                    }

                    if (!kingField && forceKingMovie && !checkPlay) {
                        //Verify if put this piece in this position will resolve check situation
                        saveTempGameSituation(false, x, y);
                        verifyPlayCheck(x, y, i, j);
        
                        if (!forceKingMovie) {
                            forceKingMovie = true;
                            if (mateCheckValidate) {
                                isNotCheckMate = true;
                                goBackOnePlay();
                                return;
                            }
                            squareDrop(i, j);
                        }
                        goBackOnePlay();
                        continue;
                    }

                    if (kingField) {
                        kingFields[i][j].isCheck = true;
                        kingFields[i][j].pieces.push({
                            typePiece: gameSituation[x][y].typePiece,
                            colorPiece: gameSituation[x][y].colorPiece,
                            x: x,
                            y: y
                        });
                    } else squareDrop(i, j);
                }

                if (continueSide[localeSpot%8]) {
                    if (!kingField && forceKingMovie && !checkPlay) {
                        //Verify if put this piece in this position will resolve check situation
                        saveTempGameSituation(false, x, y);
                        verifyPlayCheck(x, y, i, j);
                        if (!forceKingMovie) {
                            forceKingMovie = true;
                            if (mateCheckValidate) {
                                isNotCheckMate = true;
                                goBackOnePlay();
                                return;
                            }
                            squareDrop(i, j);
                        }
                        goBackOnePlay();
                        continue;
                    }
                    if (kingField) {
                        kingFields[i][j].isCheck = true;
                        kingFields[i][j].pieces.push({
                            typePiece: gameSituation[x][y].typePiece,
                            colorPiece: gameSituation[x][y].colorPiece,
                            x: x,
                            y: y
                        });
                    } else squareDrop(i, j);
                }
            }
        }
        dist++;
        if (dist >= 8) continueWhile = false;
    }
}

//Move of the knight
const knightMove = (x, y, kingField) => {
    let dist = 0;
    let allyPiece;

    if(kingField){
        allyPiece = isPlayerOne ? 'black' : 'white';
    } else {
        allyPiece = isPlayerOne ? 'white' : 'black';
    }

    for (let i = x - 2; i <= x + 2; i++){
        if (i === x) continue;
        //Support to providing correct dist variable behavior
        dist++;
        if (dist > 2) dist--;
        if (i === x + 2) dist = 1;

        for (let j = y - dist; j <= y + dist; j++){
            if (j != y - dist && j != y + dist) continue;
            if (j < 0 || j > 7 || i < 0 || i > 7) continue;

            if (gameSituation[i][j].colorPiece === allyPiece) continue;

            if (!kingField && forceKingMovie && !checkPlay) {
                //Verify if put this piece in this position will resolve check situation
                saveTempGameSituation(false, x, y);
                verifyPlayCheck(x, y, i, j);

                if (!forceKingMovie) {
                    forceKingMovie = true;
                    if (mateCheckValidate) {
                        isNotCheckMate = true;
                        goBackOnePlay();
                        return;
                    }
                    squareDrop(i, j);
                }
                goBackOnePlay();
                continue;
            }

            if (kingField) {
                kingFields[i][j].isCheck = true;
                kingFields[i][j].pieces.push({
                    typePiece: gameSituation[x][y].typePiece,
                    colorPiece: gameSituation[x][y].colorPiece,
                    x: x,
                    y: y
                });
            } else squareDrop(i, j);
        }
    }
}

//Move of the king piece
const kingMove = (x, y, kingField) => {
    let allyPiece;

    if(kingField){
        allyPiece = isPlayerOne ? 'black' : 'white';
        enemyPiece = isPlayerOne ? 'white' : 'black';
    } else {
        allyPiece = isPlayerOne ? 'white' : 'black';
        enemyPiece = isPlayerOne ? 'black' : 'white';
    }

    if (!kingField) verifyCastling();

    for(let i = x - 1; i <= x + 1; i++){
        for(let j = y - 1; j <= y + 1; j++){
            if (i === x && j === y) continue;
            if (i < 0 || i > 7) continue;
            if (j < 0 || j > 7)continue;

            if (gameSituation[i][j].colorPiece === allyPiece) continue;
            if (kingField) {
                kingFields[i][j].isCheck = true;
                kingFields[i][j].pieces.push({
                    typePiece: gameSituation[x][y].typePiece,
                    colorPiece: gameSituation[x][y].colorPiece,
                    x: x,
                    y: y
                });
            } else {
                if (!kingField && forceKingMovie && !checkPlay) {
                    //Verify if put this piece in this position will resolve check situation
                    saveTempGameSituation(false, x, y);
                    verifyPlayCheck(x, y, i, j);
    
                    if (!forceKingMovie) {
                        forceKingMovie = true;
                        if (mateCheckValidate) {
                            isNotCheckMate = true;
                            goBackOnePlay();
                            return;
                        }
                        squareDrop(i, j);
                    }
                    goBackOnePlay();
                    continue;
                }
                if (kingFields[i][j].isCheck) continue; else squareDrop(i, j);
            } 
        }
    }
}


/* --------------------------------VERIFY CHECKMATE AND POSSIBLES KING MOVE---------------------------------------------- */

//Check and CheckMate
const verifyCheckMate = (x, y) => {
    for(let i = x - 1; i <= x + 1; i++){
        for(let j = y - 1; j <= y + 1; j++){
            if (i === x && j === y) continue;
            if (i < 0 || i > 7) continue;
            if (j < 0 || j > 7)continue;

            if (!gameSituation[i][j].havePiece && !kingFields[i][j].isCheck) {
                console.log('is not checkmate!');
                return;
            }
        }
    }


    if (!checkPlay) {
        for (let m = 0; m < 8; m++){
            for (let n = 0; n < 8; n++) {
                mateCheckValidate = true;
                if (gameSituation[m][n].havePiece && gameSituation[m][n].colorPiece === gameSituation[x][y].colorPiece){
                    if (gameSituation[m][n].typePiece === 'king') continue;
                    executFunction[gameSituation[m][n].typePiece](m, n, false);

                    if(isNotCheckMate) {
                        mateCheckValidate = false;
                        isNotCheckMate = false;
                        return;
                    }
                }
            }
        }
    }
    
    mateCheckValidate = false;
    if (!checkPlay) isGameOver = true;
    //FAZER UMA FUNÇÃO QUE VERIFICA CADA PEÇA E PROCURA SE TEM ALGUMA QUE TIRA O REI DO CHECK, PARA SÓ DPS DA O CHECKMATE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
}

//This function will populate the kingFields matrix with info about which position the king cannot enter
const verifyKingFields = () => {
    let enemyTurnColor = isPlayerOne ? 'black' : 'white';
    resetKingFields();

    let x, y;
    for (let i = 0; i < 8; i++){
        for (let j = 0; j < 8; j++) {
            if (gameSituation[i][j].havePiece && gameSituation[i][j].colorPiece !== enemyTurnColor && gameSituation[i][j].typePiece === 'king') {
                x = i;
                y = j;
            }
            if (gameSituation[i][j].havePiece && gameSituation[i][j].colorPiece === enemyTurnColor){
                executFunction[gameSituation[i][j].typePiece](i, j, true);
            }
        }
    }

    if (kingFields[x][y].isCheck) {
        forceKingMovie = true;
        verifyCheckMate(x, y);
    }
}


//Init Game
createTableSquare();


/*        NAME OF PIECES
    king: rei
    rook: torre
    bishop: bispo
    queen: rainha
    knight: cavalo
    pawn: peão ---> pode pular até 2 casas na primeira vez e só come peças pela lateral
*/
