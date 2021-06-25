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
    /*---------------------------------------------Creating the black pieces!-----------------------------------------------*/
    //creating black pawns
    for(let i = 0; i < 8; i++){
        insertImagePiece (1, i, 'pawn', 'white', 'plt');
    }
    //creating black towers
    insertImagePiece (0, 0, 'rook', 'white', 'rlt');
    insertImagePiece (0, 7, 'rook', 'white', 'rlt');

    //Creating black knights
    insertImagePiece (0, 1, 'knight', 'white', 'nlt');
    insertImagePiece (0, 6, 'knight', 'white', 'nlt');

    //Creating black bishops
    insertImagePiece (0, 2, 'bishop', 'white', 'blt');
    insertImagePiece (0, 5, 'bishop', 'white', 'blt');

    //Creating black queen
    insertImagePiece (0, 3, 'queen', 'white', 'qlt');

    //Creating black king
    insertImagePiece (0, 4, 'king', 'white', 'klt');
    
    /*---------------------------------------------Creating the white pieces!-----------------------------------------------*/
    //creating white towers
    for(let i = 0; i < 8; i++){
        insertImagePiece (6, i, 'pawn', 'black', 'pdt');
    }
    //creating white towers
    insertImagePiece (7, 0, 'rook', 'black', 'rdt');
    insertImagePiece (7, 7, 'rook', 'black', 'rdt');

    //Creating white knights
    insertImagePiece (7, 1, 'knight', 'black', 'ndt');
    insertImagePiece (7, 6, 'knight', 'black', 'ndt');

    ///Creating white bishops
    insertImagePiece (7, 2, 'bishop', 'black', 'bdt');
    insertImagePiece (7, 5, 'bishop', 'black', 'bdt');

    //Creating white queen
    insertImagePiece (7, 3, 'queen', 'black', 'qdt');

    //Creating white king
    insertImagePiece (7, 4, 'king', 'black', 'kdt');
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

    if(gameSituation[x][y].colorPiece !== (isPlayerOne ? 'black' : 'white')) return;

    saveTempGameSituation(false, x, y);
    executFunction[gameSituation[x][y].typePiece](x, y, false);

    //It will create the effect of disappear in this piece
    setTimeout(() => attDragItem.remove(), 0);
}

//Function for drag end, will check if was all okay
const setDragEnd = () => {
    removeSquareDrop();
    if (isPawnPromotion) {
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
    /* console.log(gameSituation) */
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
    const svgName = (color === 'white') ? 'qlt' : 'qdt';
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
    console.log(gameSituation)
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
        gameSituation[x][y].havePiece = tempGameSituation.havePiece;
        gameSituation[x][y].colorPiece = tempGameSituation.colorPiece;
        gameSituation[x][y].typePiece = tempGameSituation.typePiece;
        //When rook or king play (useful for castling funcion)
        if('hasMoved' in tempGameSituation) {
            gameSituation[x][y].hasMoved = true;
        }
        //Verify queen promotion (when pawn play)
    if (gameSituation[x][y].typePiece === 'pawn'){
        let queenPromotion = gameSituation[x][y].colorPiece === 'black' ? 0 : 7;
        console.log(queenPromotion)
        if (x === queenPromotion){/* !check &&  */
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
    kingFields = [...kingFieldsSaveData];
    initGameSituation();

    for (let x = 0; x < 8; x++){
        for (let y = 0; y < 8; y++) {
            gameSituation[x][y].havePiece = gameSituationSaveData[x][y].havePiece;
            gameSituation[x][y].colorPiece = gameSituationSaveData[x][y].colorPiece;
            gameSituation[x][y].typePiece = gameSituationSaveData[x][y].typePiece;
            if('hasMoved' in gameSituationSaveData[x][y]) gameSituation[x][y].hasMoved = gameSituationSaveData[x][y].hasMoved;
        }
    }
}

//Responsible for checking whether a move will remove the king's check
const verifyPlayCheck = (x, y, i, j) => {
    checkPlay = true;
    //gameSituationSaveData store the gameSituation matrix before play in analysis
    gameSituationSaveData = [];

    for (let m = 0; m < 8; m++){
        gameSituationSaveData[m] = []
        for (let n = 0; n < 8; n++) {
            gameSituationSaveData[m][n] = {
                havePiece: false,
                colorPiece: undefined,
                typePiece: undefined,
            }
            gameSituationSaveData[m][n].havePiece = gameSituation[m][n].havePiece;
            gameSituationSaveData[m][n].colorPiece = gameSituation[m][n].colorPiece;
            gameSituationSaveData[m][n].typePiece = gameSituation[m][n].typePiece;
            if('hasMoved' in gameSituation[x][y]) gameSituationSaveData[x][y].hasMoved = gameSituation[x][y].hasMoved;
        }
    }
    //Same thing with kingFieldsSaveData
    kingFieldsSaveData = [...kingFields];
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
            kingFields[i][j] = false;
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
    if (kingFields[x][4] || kingFields[x][3] || kingFields[x][2]) return;

    console.log(x, 2);
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
    if (kingFields[x][4] || kingFields[x][5] || kingFields[x][6]) return;

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
            kingFields[x + op][j] = true;
            j++;
            continue;
        }
        if (gameSituation[x+op][j].havePiece && gameSituation[x+op][j].colorPiece !== gameSituation[x][y].colorPiece){
            if (!kingField && forceKingMovie && !checkPlay) {
                //Verify if put this piece in this position will resolve check situation
                verifyPlayCheck(x, y, x + op, j);

                if (!forceKingMovie) {
                    forceKingMovie = true;
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
                verifyPlayCheck(x, y, x + op*i, y);
                if (!forceKingMovie) {
                    forceKingMovie = true;
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
            verifyPlayCheck(x, y, x + op, y);
            if (!forceKingMovie) {
                forceKingMovie = true;
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
        allyPiece = isPlayerOne ? 'white' : 'black';
        enemyPiece = isPlayerOne ? 'black' : 'white';
    } else {
        allyPiece = isPlayerOne ? 'black' : 'white';
        enemyPiece = isPlayerOne ? 'white' : 'black';
    }

    while(continueWhile){
        for(let i = x - dist; i <= x + dist; i++){
            if (i != x + dist && i != x - dist) continue;
            
            for(let j = y - dist; j <= y + dist; j++){
                if (j != y + dist && j != y - dist) continue;
                localeSpot++;
                if (i < 0 || i > 7) continue;
                if (j < 0 || j > 7)continue;

                if (gameSituation[i][j].havePiece && gameSituation[i][j].colorPiece === allyPiece){
                    continueSide[localeSpot%4] = false;
                    if (kingField) kingFields[i][j]= true;
                    continue;
                }else if (continueSide[localeSpot%4] && gameSituation[i][j].havePiece && gameSituation[i][j].colorPiece === enemyPiece){
                    continueSide[localeSpot%4] = false;

                    if (!kingField && forceKingMovie && !checkPlay) {
                        //Verify if put this piece in this position will resolve check situation
                        verifyPlayCheck(x, y, i, j);
        
                        if (!forceKingMovie) {
                            forceKingMovie = true;
                            squareDrop(i, j);
                        }
                        goBackOnePlay();
                        continue;
                    }

                    if (kingField) kingFields[i][j]= true; else squareDrop(i, j);
                    if (kingField && gameSituation[i][j].typePiece === 'king'){
                        continueSide[localeSpot%8] = true;
                    } else {
                        continueSide[localeSpot%8] = false;
                    }
                }

                if (continueSide[localeSpot%4]) {
                    if (!kingField && forceKingMovie && !checkPlay) {
                        //Verify if put this piece in this position will resolve check situation
                        verifyPlayCheck(x, y, i, j);
        
                        if (!forceKingMovie) {
                            forceKingMovie = true;
                            squareDrop(i, j);
                        }
                        goBackOnePlay();
                        continue;
                    }

                    if (kingField) kingFields[i][j]= true; else squareDrop(i, j);
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
        allyPiece = isPlayerOne ? 'white' : 'black';
        enemyPiece = isPlayerOne ? 'black' : 'white';
    } else {
        allyPiece = isPlayerOne ? 'black' : 'white';
        enemyPiece = isPlayerOne ? 'white' : 'black';
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
                    if (kingField) kingFields[i][j]= true;
                    continue;
                }else if (continueSide[localeSpot%4] && gameSituation[i][j].havePiece && gameSituation[i][j].colorPiece === enemyPiece){
                    continueSide[localeSpot%4] = false;
                    if (kingField && gameSituation[i][j].typePiece === 'king'){
                        continueSide[localeSpot%8] = true;
                    } else {
                        continueSide[localeSpot%8] = false;
                    }
                    if (!kingField && forceKingMovie && !checkPlay) {
                        //Verify if put this piece in this position will resolve check situation
                        verifyPlayCheck(x, y, i, j);
        
                        if (!forceKingMovie) {
                            forceKingMovie = true;
                            squareDrop(i, j);
                        }
                        goBackOnePlay();
                        continue;
                    }
                    if (kingField) kingFields[i][j]= true; else squareDrop(i, j);
                }

                if (!kingField && forceKingMovie && !checkPlay) {
                    //Verify if put this piece in this position will resolve check situation
                    verifyPlayCheck(x, y, i, j);
    
                    if (!forceKingMovie) {
                        forceKingMovie = true;
                        squareDrop(i, j);
                    }
                    goBackOnePlay();
                    continue;
                }
                
                if (continueSide[localeSpot%4]) if (kingField) kingFields[i][j]= true; else squareDrop(i, j);
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
        allyPiece = isPlayerOne ? 'white' : 'black';
        enemyPiece = isPlayerOne ? 'black' : 'white';
    } else {
        allyPiece = isPlayerOne ? 'black' : 'white';
        enemyPiece = isPlayerOne ? 'white' : 'black';
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
                    if (kingField) kingFields[i][j]= true;
                    continue;
                }else if (continueSide[localeSpot%8] && gameSituation[i][j].havePiece && gameSituation[i][j].colorPiece === enemyPiece){
                    if (kingField && gameSituation[i][j].typePiece === 'king'){
                        continueSide[localeSpot%8] = true;
                    } else {
                        continueSide[localeSpot%8] = false;
                    }

                    if (!kingField && forceKingMovie && !checkPlay) {
                        //Verify if put this piece in this position will resolve check situation
                        verifyPlayCheck(x, y, i, j);
        
                        if (!forceKingMovie) {
                            forceKingMovie = true;
                            squareDrop(i, j);
                        }
                        goBackOnePlay();
                        continue;
                    }

                    if (kingField) kingFields[i][j]= true; else squareDrop(i, j);
                }

                if (continueSide[localeSpot%8]) {
                    if (!kingField && forceKingMovie && !checkPlay) {
                        //Verify if put this piece in this position will resolve check situation
                        verifyPlayCheck(x, y, i, j);
                        if (!forceKingMovie) {
                            forceKingMovie = true;
                            squareDrop(i, j);
                        }
                        goBackOnePlay();
                        continue;
                    }
                    if (kingField) kingFields[i][j]= true; else squareDrop(i, j);
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
        allyPiece = isPlayerOne ? 'white' : 'black';
    } else {
        allyPiece = isPlayerOne ? 'black' : 'white';
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
                verifyPlayCheck(x, y, i, j);

                if (!forceKingMovie) {
                    forceKingMovie = true;
                    squareDrop(i, j);
                }
                goBackOnePlay();
                continue;
            }

            if (kingField) kingFields[i][j]= true; else squareDrop(i, j);
        }
    }
}

//Move of the king piece
const kingMove = (x, y, kingField) => {
    let allyPiece;

    if(kingField){
        allyPiece = isPlayerOne ? 'white' : 'black';
        enemyPiece = isPlayerOne ? 'black' : 'white';
    } else {
        allyPiece = isPlayerOne ? 'black' : 'white';
        enemyPiece = isPlayerOne ? 'white' : 'black';
    }

    if (!kingField) verifyCastling();

    for(let i = x - 1; i <= x + 1; i++){
        for(let j = y - 1; j <= y + 1; j++){
            if (i === x && j === y) continue;
            if (i < 0 || i > 7) continue;
            if (j < 0 || j > 7)continue;

            if (gameSituation[i][j].colorPiece === allyPiece) continue;
            if (kingField) kingFields[i][j] = true; else{
                if (!kingField && forceKingMovie && !checkPlay) {
                    //Verify if put this piece in this position will resolve check situation
                    verifyPlayCheck(x, y, i, j);
    
                    if (!forceKingMovie) {
                        forceKingMovie = true;
                        squareDrop(i, j);
                    }
                    goBackOnePlay();
                    continue;
                }
                if (kingFields[i][j]) continue; else squareDrop(i, j);
            } 
        }
    }
}


/* --------------------------------VERIFY CHECKMATE AND POSSIBLES KING MOVE---------------------------------------------- */
const verifyCheckMate = (x, y) => {
    console.log(x, y);
    for(let i = x - 1; i <= x + 1; i++){
        for(let j = y - 1; j <= y + 1; j++){
            if (i === x && j === y) continue;
            if (i < 0 || i > 7) continue;
            if (j < 0 || j > 7)continue;

            if (!gameSituation[i][j].havePiece && !kingFields[i][j]) {
                console.log('is not checkmate!');
                return;
            }
        }
    }

    isGameOver = true;
    alert(`${isPlayerOne ? "white" : "black"} wins!`);
}

//This function will populate the kingFields matrix with info about which position the king cannot enter
const verifyKingFields = () => {
    let enemyTurnColor = isPlayerOne ? 'white' : 'black';
    resetKingFields();

    let x, y;

    for (let i = 0; i < 8; i++){
        for (let j = 0; j < 8; j++){
            if (gameSituation[i][j].havePiece && gameSituation[i][j].colorPiece != enemyTurnColor && gameSituation[i][j].typePiece === 'king') {
                x = i;
                y = j;
            }
            if (gameSituation[i][j].havePiece && gameSituation[i][j].colorPiece === enemyTurnColor){
                executFunction[gameSituation[i][j].typePiece](i, j, true);
            }
        }
    }
    if (kingFields[x][y]) {
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

//ALGUM BUG COM A TORRE FEZ O GAMESITUATION TROCAR A PEÇA DO REI PELA PEÇA DA TORRE FAZENDO O REI SE COMPORTAR COMO REI