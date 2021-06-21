const gameTable_section = document.querySelector('.chess-table');

const numRegex = /\d/g;

//Matriz que guarda todas as informações do jogo
const gameSituation = [];
//temporarily store obj situation of a position of gameSituation
let tempGameSituation = [];
//Store fields the king cannot enter
let kingFields = [];

//Verificar se o jogo continua;
let isGameOver = false;

//Informa de quem é a vez de jogar
let isPlayerOne = true;

//Guarda informação do id de um element
let idValue = [];

//Atived when a king under check situation
let forceKingMovie = false;

//Armazena o elemento que está no drag
let attDragItem = undefined;
let attDropItem = undefined;
let attElementItem = undefined;

//Variável com todas os quadrados da mesa
const allSquares = gameTable_section.childNodes;

/* -----------------------------------------------Funcionalidades da mesa----------------------------------------------- */
//Iniciar matriz do jogo
const initGameSituation = () => {
    for(let i = 0; i < 8; i++){
        gameSituation[i] = []
        for(let j = 0; j < 8; j++){
            gameSituation[i][j] = {
                havePiece: false,
                squareColor: undefined,
                colorPiece: undefined,
                typePiece: undefined,
            }
        }
    }
}

//Criar todas as casas do tabuleiro
const createTableSquare = () => {
    gameTable_section.innerHTML = '';

    //Iniciar matriz do jogo
    initGameSituation();

    //posição  em   x e y
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
                    gameSituation[i][j].squareColor = 'white';
                } else {
                    square.classList.add('black-table');
                    square.setAttribute('id', `${squareId[0]}-${squareId[1]}`);
                    squareId[1] = (++squareId[1])%8;
                    gameSituation[i][j].squareColor = 'black';
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
                    gameSituation[i][j].squareColor = 'black';
                } else {
                    square.classList.add('white-table');
                    square.setAttribute('id', `${squareId[0]}-${squareId[1]}`);
                    squareId[1] = (++squareId[1])%8;
                    gameSituation[i][j].squareColor = 'white';
                }
                gameTable_section.appendChild(square);
            }
        }
        squareId[0]++;
        
    }
    insertTablePieces();
}

//Criar as peças do tabuleiro
const insertTablePieces = () => {
    /*---------------------------------------   Criando as peças pretas!---------------------------------------  */
        //Criando piões pretas
        for(let i = 0; i < 8; i++){
            insertImagePiece (1, i, 'pawn', 'white', 'plt');
        }
        //Criando torres pretas
        insertImagePiece (0, 0, 'rook', 'white', 'rlt');
        insertImagePiece (0, 7, 'rook', 'white', 'rlt');
    
        //Criando cavalos
        insertImagePiece (0, 1, 'knight', 'white', 'nlt');
        insertImagePiece (0, 6, 'knight', 'white', 'nlt');
    
        //Criando bispos
        insertImagePiece (0, 2, 'bishop', 'white', 'blt');
        insertImagePiece (0, 5, 'bishop', 'white', 'blt');
    
        //Criando rainha
        insertImagePiece (0, 3, 'queen', 'white', 'qlt');
    
        //Criando rei
        insertImagePiece (0, 4, 'king', 'white', 'klt');
    
    
    /*---------------------------------------   Criando as peças pretas!---------------------------------------  */
        //Criando piões pretas
        for(let i = 0; i < 8; i++){
            insertImagePiece (6, i, 'pawn', 'black', 'pdt');
        }
        //Criando torres pretas
        insertImagePiece (7, 0, 'rook', 'black', 'rdt');
        insertImagePiece (7, 7, 'rook', 'black', 'rdt');
    
        //Criando cavalos
        insertImagePiece (7, 1, 'knight', 'black', 'ndt');
        insertImagePiece (7, 6, 'knight', 'black', 'ndt');
    
        //Criando bispos
        insertImagePiece (7, 2, 'bishop', 'black', 'bdt');
        insertImagePiece (7, 5, 'bishop', 'black', 'bdt');
    
        //Criando rainha
        insertImagePiece (7, 3, 'queen', 'black', 'qdt');
    
        //Criando rei
        insertImagePiece (7, 4, 'king', 'black', 'kdt');
    }

const insertImagePiece = (i, j, pieceName, colorPiece, svgName) => {
    
    anySquare = document.getElementById(`${i}-${j}`);
    gameSituation[i][j].typePiece = pieceName;
    gameSituation[i][j].colorPiece = colorPiece;
    gameSituation[i][j].havePiece = true;

    const piece_img = document.createElement('img');
    piece_img.src = `./svg_pieces/Chess_${svgName}45.svg`;
    insertDragAndDrop(piece_img);
    anySquare.appendChild(piece_img);
}

/* --------------------------------------------Funções do drag and drop--------------------------------------------*/
const insertDragAndDrop = (element) => {
    element.draggable = true;
    element.setAttribute('ondragstart', 'setDragStart(event)');
    element.setAttribute('ondragend', 'setDragEnd()');
}

//Function for drag start!
const setDragStart = (event) => {
    attDragItem = event.target;
    attElementItem = attDragItem.parentNode;

    getId(attElementItem);

    let x = idValue[0], y = idValue[1];

    if(gameSituation[x][y].colorPiece !== (isPlayerOne ? 'black' : 'white')) return;

    tempGameSituation = gameSituation[x][y];

    executFunction[gameSituation[x][y].typePiece](x, y, false);

    //It will create the effect of disappear in this piece
    setTimeout(() => attDragItem.remove(), 0);
}

//Function for drag end, will check if was all okay
const setDragEnd = () => {
    removeSquareDrop();
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
    changeGameSituation(attElementItem, selectEl);
    
    isPlayerOne = isPlayerOne? false: true;
    verifyKingFields();
}

const setDragOver = (event) => {
    event.preventDefault();
    //It will check if the piece being dragged was dropped on the same element as we have in this variable
    attDropItem = event.target;
    while (!attDropItem.classList.contains('square')){
        attDropItem = attDropItem.parentNode;
    }
}

const squareDrop = (x, y) => {
    const element = document.getElementById(`${x}-${y}`);
    element.classList.add('spotlight');
    element.setAttribute('ondrop', 'setDrop(event)');
    element.setAttribute('ondragover', 'setDragOver(event)');
}


const removeSquareDrop = () => {
    allSquares.forEach(square => {
        if(square.classList.contains('spotlight')){
            square.classList.remove('spotlight');
            square.removeAttribute('ondrop');
            square.removeAttribute('ondragover');
        }
    });
}

const changeGameSituation = (prevEl, afterEl) => {  
    getId(afterEl);
    gameSituation[idValue[0]][idValue[1]].havePiece = tempGameSituation.havePiece;
    gameSituation[idValue[0]][idValue[1]].colorPiece = tempGameSituation.colorPiece;
    gameSituation[idValue[0]][idValue[1]].typePiece = tempGameSituation.typePiece;
    tempGameSituation = [];
    
    getId(prevEl);
    gameSituation[idValue[0]][idValue[1]].havePiece = false;
    gameSituation[idValue[0]][idValue[1]].colorPiece = undefined;
    gameSituation[idValue[0]][idValue[1]].typePiece = undefined;
    console.log(gameSituation)
}

//Get the row and column from a id
const getId = (squareEl) => {
    idValue = [];
    squareEl.id.match(numRegex).forEach(ind => {
        idValue.push(parseInt(ind));
    });
}


/* ------------------------------------------FUNÇÕES DE MOVIMENTO DAS PEÇAS------------------------------------------- */

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
    if (!kingField && forceKingMovie) return;

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
            squareDrop(x + op, j);
        }
        j++;
    }

    if(kingField) return;

    if(x === initRow){
        for (let i = 1; i <= 2; i++){
            if(gameSituation[x + op*i][y].havePiece) break;
            squareDrop(x + op*i, y);
        }
        
    } else {
        if (gameSituation[x+op][y].havePiece) return;
        squareDrop(x + op, y);
    }
}

//Move of the bishop piece
const bishopMove = (x, y, kingField) => {
    if (!kingField && forceKingMovie) return;
    let dist = 1, localeSpot = -1, continueSide = [], continueWhile = true;

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
                    if (kingField) kingFields[i][j]= true; else squareDrop(i, j);
                    if (kingField && gameSituation[i][j].typePiece === 'king'){
                        continueSide[localeSpot%8] = true;
                    } else {
                        continueSide[localeSpot%8] = false;
                    }
                }

                if (continueSide[localeSpot%4]) {
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
    if (!kingField && forceKingMovie) return;
    let dist = 1, localeSpot = -1, continueSide = [], continueWhile = true;

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
                    if (kingField) kingFields[i][j]= true; else squareDrop(i, j);
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
    if (!kingField && forceKingMovie) return;
    let dist = 1, localeSpot = -1, continueSide = [], continueWhile = true;

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

                    if (kingField) kingFields[i][j]= true; else squareDrop(i, j);
                }

                if (continueSide[localeSpot%8]) if (kingField) kingFields[i][j]= true; else squareDrop(i, j);
            }
        }
        dist++;
        if (dist >= 8) continueWhile = false;
    }
}

//Move of the knight
const knightMove = (x, y, kingField) => {
    if (!kingField && forceKingMovie) return;
    let dist = 0;

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
            if (kingField) kingFields[i][j]= true; else squareDrop(i, j);
        }
    }
}

//Move of the king piece
const kingMove = (x, y, kingField) => {
    if(kingField){
        allyPiece = isPlayerOne ? 'white' : 'black';
        enemyPiece = isPlayerOne ? 'black' : 'white';
    } else {
        allyPiece = isPlayerOne ? 'black' : 'white';
        enemyPiece = isPlayerOne ? 'white' : 'black';
    }

    for(let i = x - 1; i <= x + 1; i++){
        for(let j = y - 1; j <= y + 1; j++){
            if (i === x && j === y) continue;
            if (i < 0 || i > 7) continue;
            if (j < 0 || j > 7)continue;

            if (gameSituation[i][j].colorPiece === allyPiece) continue;
            if (kingField) kingFields[i][j] = true; else if (kingFields[i][j]) continue; else squareDrop(i, j);
        }
    }
}


/* --------------------------------VERIFY CHECKMATE AND POSSIBLES KING MOVE---------------------------------------------- */
const verifyCheckMate = (x, y) => {
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
    console.log('O JOGO ACABOU');
}
const resetKingFields = () => {
    kingFields = [];
    forceKingMovie = false;

    for (let i = 0; i < 8; i++){
        kingFields[i] = []
        for (let j = 0; j < 8; j++){
            kingFields[i][j] = {
                check: false,
                piecesPoint = [] //Armazenar todas as peças que dão check nesse indice (armazenar x e y delas)!
            }
        }
    }
}

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
    console.log(kingFields)
    if (kingFields[x][y]) {
        forceKingMovie = true;
        verifyCheckMate(x, y);
    }
}
createTableSquare();


/*        NAME OF PIECES
    king: rei
    rook: torre
    bishop: bispo
    queen: rainha
    knight: cavalo
    pawn: peão ---> pode pular até 2 casas na primeira vez e só come peças pela lateral
*/

//PERMITIR QUE O REI SAIA DO CHECK FAZENDO COM Q OUTRA PEÇA COMA A PEÇA QUE DEIXOU O REI EM CHECK
//Talvez colocar o indice do elemento que está gerando o check emm cada posição do kingFields e nas peças verificar se uma delas pode comer ela