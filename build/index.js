"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class Coordinates {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }
}
class LetterPair {
    constructor(first, second) {
        this.first = first;
        this.second = second;
    }
    getCoords(keyArray) {
        const ind1 = keyArray.indexOf(this.first);
        const ind2 = keyArray.indexOf(this.second);
        const c1 = new Coordinates(Math.floor(ind1 / 5), ind1 % 5);
        const c2 = new Coordinates(Math.floor(ind2 / 5), ind2 % 5);
        return [c1, c2];
    }
    encode(keyArray) {
        const ptxtCoords = this.getCoords(keyArray);
        const coord1 = ptxtCoords[0];
        const coord2 = ptxtCoords[1];
        let ctxtCoord1;
        let ctxtCoord2;
        if (coord1.col == coord2.col) {
            ctxtCoord1 = new Coordinates((coord1.row + 1) % 5, coord1.col);
            ctxtCoord2 = new Coordinates((coord2.row + 1) % 5, coord2.col);
        }
        else if (coord1.row == coord2.row) {
            ctxtCoord1 = new Coordinates(coord1.row, (coord1.col + 1) % 5);
            ctxtCoord2 = new Coordinates(coord2.row, (coord2.col + 1) % 5);
        }
        else {
            ctxtCoord1 = new Coordinates(coord1.row, coord2.col);
            ctxtCoord2 = new Coordinates(coord2.row, coord1.col);
        }
        return getTextFromCoords([ctxtCoord1, ctxtCoord2], keyArray);
    }
    decode(keyArray) {
        const ctxtCoords = this.getCoords(keyArray);
        const coord1 = ctxtCoords[0];
        const coord2 = ctxtCoords[1];
        let ptxtCoord1;
        let ptxtCoord2;
        if (coord1.col == coord2.col) {
            ptxtCoord1 = coord1.row == 0 ? new Coordinates(4, coord1.col) : new Coordinates((coord1.row - 1), coord1.col);
            ptxtCoord2 = coord2.row == 0 ? new Coordinates(4, coord2.col) : new Coordinates((coord2.row - 1), coord2.col);
        }
        else if (coord1.row == coord2.row) {
            ptxtCoord1 = coord1.col == 0 ? new Coordinates(coord1.row, 4) : new Coordinates(coord1.row, (coord1.col - 1));
            ptxtCoord2 = coord2.col == 0 ? new Coordinates(coord2.row, 4) : new Coordinates(coord2.row, (coord2.col - 1));
        }
        else {
            ptxtCoord1 = new Coordinates(coord1.row, coord2.col);
            ptxtCoord2 = new Coordinates(coord2.row, coord1.col);
        }
        return getTextFromCoords([ptxtCoord1, ptxtCoord2], keyArray);
    }
}
let userKeyArray = "ABCDEFGHIKLMNOPQRSTUVWXYZ".split("");
const keywordForm = document.getElementById("keywordForm");
const ptxtForm = document.getElementById("ptxtForm");
const ctxtForm = document.getElementById("ctxtForm");
keywordForm.addEventListener('submit', handleKeywordFormSubmit);
ptxtForm.addEventListener('submit', convertText);
ctxtForm.addEventListener('submit', convertText);
createKeywordTable('keywordTable');
createKeywordTable('demoStart');
createKeywordTable('demoEnd', 'example');
createKeywordTable('demo1', 'example');
createKeywordTable('demo2', 'example');
createKeywordTable('demo3', 'example');
window.addEventListener('resize', () => {
    setLineVisibility('keywordTable', false);
    setLineVisibility('demo1', false);
    setLineVisibility('demo2', false);
    setLineVisibility('demo3', false);
});
function convertText(event) {
    return __awaiter(this, void 0, void 0, function* () {
        event.preventDefault();
        const form = event.target;
        const warningContainer = document.getElementById('warning');
        const keywordButton = document.querySelector("#keywordForm input[type='submit']");
        const submitButton = document.querySelector("input[type='submit'][value='Encode']");
        const userInputs = document.getElementsByClassName('userInput');
        const displayInputs = document.getElementsByClassName('displayInput');
        const displayOutputs = document.getElementsByClassName('displayOutput');
        let isCtxt;
        let index;
        if (form.id === 'ptxtForm') {
            isCtxt = false;
            index = 0;
        }
        else {
            isCtxt = true;
            index = 1;
            warningContainer.textContent = '';
        }
        let inputTxt = userInputs[index].value;
        const displayInput = displayInputs[index];
        const displayOutput = displayOutputs[index];
        displayInput.value = '';
        displayOutput.value = '';
        let inputList;
        try {
            inputList = pairText(inputTxt, isCtxt);
        }
        catch (err) {
            if (err instanceof Error) {
                warningContainer.textContent = err.message;
            }
            return;
        }
        let splitText = '';
        const modInput = getTextFromLetterPairArray(inputList);
        for (let i = 0; i < modInput.length - 1; i++) {
            if (i % 2 == 0) {
                splitText += modInput.substring(i, i + 2) + ' | ';
            }
        }
        splitText = splitText.slice(0, -3);
        displayInput.value = splitText;
        const outputList = [];
        if (!isCtxt) {
            keywordButton.disabled = true;
            submitButton.disabled = true;
            for (const letterPair of inputList) {
                const ctxtPair = letterPair.encode(userKeyArray);
                yield animatePair(letterPair, ctxtPair, 'keywordTable');
                outputList.push(ctxtPair);
                displayOutput.value = getTextFromLetterPairArray(outputList);
            }
            keywordButton.disabled = false;
            submitButton.disabled = false;
        }
        else {
            for (const letterPair of inputList) {
                const ptxtPair = letterPair.decode(userKeyArray);
                outputList.push(ptxtPair);
            }
            displayOutput.value = getTextFromLetterPairArray(outputList);
        }
    });
}
function removeInvalidChars(text) {
    text = text.toUpperCase();
    text = text.replace(/J/g, "I");
    for (let i = text.length - 1; i >= 0; i--) {
        const ascii = text.charCodeAt(i);
        if (ascii >= 65 && ascii <= 90) {
            continue;
        }
        else {
            text = text.substring(0, i) + text.substring(i + 1);
        }
    }
    return text;
}
function createKeywordTable(idTarget, keyword = '') {
    const keyArray = addKeywordToArray(keyword);
    const keywordTable = document.getElementById(idTarget);
    keywordTable.textContent = "";
    for (let i = 0; i < keyArray.length; i++) {
        const cell = document.createElement("td");
        cell.appendChild(document.createTextNode(keyArray[i]));
        if (i % 5 == 0) {
            const tr = document.createElement("tr");
            tr.appendChild(cell);
            keywordTable.appendChild(tr);
        }
        else {
            const tr = keywordTable.lastElementChild;
            tr.appendChild(cell);
        }
    }
}
function handleKeywordFormSubmit(event) {
    event.preventDefault();
    const keyword = document.getElementById('keywordInput').value;
    userKeyArray = addKeywordToArray(keyword);
    createKeywordTable('keywordTable', keyword);
}
function getTextFromLetterPairArray(array) {
    let text = "";
    for (const pair of array) {
        text += pair.first + pair.second;
    }
    return text;
}
//filler letter q, dup letter x
function pairText(text, isCtxt) {
    const tupleList = [];
    text = removeInvalidChars(text);
    while (text.length != 0) {
        if (text.length == 1) {
            if (isCtxt) {
                throw Error('Invalid ciphertext has an odd number of alphabetical characters.');
            }
            const newTuple = new LetterPair(text, "Q");
            tupleList.push(newTuple);
            break;
        }
        else {
            const first = text.substring(0, 1);
            const second = text.substring(1, 2);
            if (first == second) {
                if (isCtxt) {
                    throw Error('Invalid ciphertext contains a pair with identical characters.');
                }
                const newTuple = new LetterPair(first, "X");
                tupleList.push(newTuple);
                text = text.substring(1);
            }
            else {
                const newTuple = new LetterPair(first, second);
                tupleList.push(newTuple);
                text = text.substring(2);
            }
        }
    }
    return tupleList;
}
function removeDupLetters(string) {
    for (let i = 0; i < string.length - 1; i++) {
        const currChar = string.charAt(i);
        for (let k = string.length - 1; k >= i + 1; k--) {
            if (currChar == string.charAt(k)) {
                string = string.substring(0, k) + string.substring(k + 1);
            }
        }
    }
    return string;
}
function addKeywordToArray(keyword) {
    const alphabetArray = "ABCDEFGHIKLMNOPQRSTUVWXYZ".split("");
    keyword = removeInvalidChars(keyword);
    keyword = removeDupLetters(keyword);
    const orderedKey = keyword.split("");
    orderedKey.sort();
    orderedKey.reverse();
    for (let i = 0; i < keyword.length; i++) {
        const ascii = orderedKey[i].charCodeAt(0);
        if (ascii <= 73) {
            const index = ascii - 65;
            alphabetArray.splice(index, 1);
        }
        else {
            const index = ascii - 66;
            alphabetArray.splice(index, 1);
        }
    }
    return keyword.split("").concat(alphabetArray);
}
function getTextFromCoords(CoordinatesPair, keyArray) {
    const c1 = CoordinatesPair[0];
    const c2 = CoordinatesPair[1];
    return new LetterPair(keyArray[(c1.row * 5 + c1.col)], keyArray[(c2.row * 5 + c2.col)]);
}
// ANIMATION
const sections = document.getElementsByClassName('animateOnMouseMove');
for (const section of sections) {
    section.addEventListener('mousemove', handleDemoMouseMove);
}
function handleDemoMouseMove(e) {
    return __awaiter(this, void 0, void 0, function* () {
        const table = e.currentTarget.getElementsByTagName('table')[0];
        const keyArray = addKeywordToArray('example');
        if (table.id == "demo1") {
            // unique rows and cols
            sections[0].removeEventListener('mousemove', handleDemoMouseMove);
            const start = new LetterPair('E', 'Z');
            const end = start.encode(keyArray);
            yield animatePair(start, end, table.id);
            sections[0].addEventListener('mousemove', handleDemoMouseMove);
        }
        else if (table.id == "demo2") {
            // same row
            sections[1].removeEventListener('mousemove', handleDemoMouseMove);
            const start = new LetterPair('H', 'N');
            const end = start.encode(keyArray);
            yield animatePair(start, end, table.id);
            sections[1].addEventListener('mousemove', handleDemoMouseMove);
        }
        else {
            // same col
            sections[2].removeEventListener('mousemove', handleDemoMouseMove);
            const start = new LetterPair('A', 'R');
            const end = start.encode(keyArray);
            yield animatePair(start, end, table.id);
            sections[2].addEventListener('mousemove', handleDemoMouseMove);
        }
    });
}
function animatePair(startPair, endPair, tableId) {
    return __awaiter(this, void 0, void 0, function* () {
        const keyArray = tableId == 'keywordTable' ? userKeyArray : addKeywordToArray('example');
        const startCoords = startPair.getCoords(keyArray);
        const endCoords = endPair.getCoords(keyArray);
        highlightCells(tableId, 'ptxt', ...startCoords);
        yield delay(500);
        setLineVisibility(tableId, true);
        yield drawLines(startCoords, endCoords, tableId);
        setLineVisibility(tableId, false);
        for (const startCoord of startCoords) {
            let overlap = false;
            for (const endCoord of endCoords) {
                if (startCoord.row == endCoord.row && startCoord.col == endCoord.col) {
                    overlap = true;
                }
            }
            if (!overlap) {
                highlightCells(tableId, 'transparent', startCoord);
            }
        }
        yield delay(500);
        highlightCells(tableId, 'transparent', ...endCoords);
    });
}
function drawLines(startCoords, endCoords, tableId) {
    return __awaiter(this, void 0, void 0, function* () {
        const xLine = document.getElementById("xLine_" + tableId);
        const yLine = document.getElementById("yLine_" + tableId);
        const rows = document.getElementById(tableId).children;
        const coord1 = startCoords[0];
        const coord2 = startCoords[1];
        const cell1Rect = rows[coord1.row].children[coord1.col].getBoundingClientRect();
        const cell2Rect = rows[coord2.row].children[coord2.col].getBoundingClientRect();
        const cellDimension = cell1Rect.width;
        xLine.style.width = cellDimension + 'px';
        xLine.style.height = cellDimension + 'px';
        yLine.style.width = cellDimension + 'px';
        yLine.style.height = cellDimension + 'px';
        let arrPromises;
        if (coord1.row == coord2.row) {
            xLine.style.top = window.scrollY + cell1Rect.top + 'px';
            xLine.style.left = window.scrollX + cell1Rect.left + 'px';
            yLine.style.top = window.scrollY + cell2Rect.top + 'px';
            yLine.style.left = window.scrollX + cell2Rect.left + 'px';
            let animateBox1;
            let animateBox2;
            if (coord1.col == 4) {
                xLine.style.width = '0px';
                xLine.style.left = window.scrollX + document.getElementById(tableId).getBoundingClientRect().left + 'px';
                animateBox1 = xLine.animate([
                    { width: cellDimension + 'px' }
                ], {
                    duration: 1000
                });
            }
            else {
                animateBox1 = xLine.animate([
                    { left: window.scrollX + cell1Rect.left + cellDimension + 'px' }
                ], {
                    duration: 1000
                });
            }
            if (coord2.col == 4) {
                yLine.style.width = '0px';
                yLine.style.left = window.scrollX + document.getElementById(tableId).getBoundingClientRect().left + 'px';
                animateBox2 = yLine.animate([
                    { width: cellDimension + 'px' }
                ], {
                    duration: 1000
                });
            }
            else {
                animateBox2 = yLine.animate([
                    { left: window.scrollX + cell2Rect.left + cellDimension + 'px' }
                ], {
                    duration: 1000
                });
            }
            arrPromises = [animateBox1.finished, animateBox2.finished];
            yield Promise.all(arrPromises);
            highlightCells(tableId, 'ctxt', ...endCoords);
        }
        else if (coord1.col == coord2.col) {
            xLine.style.top = window.scrollY + cell1Rect.top + 'px';
            xLine.style.left = window.scrollX + cell1Rect.left + 'px';
            yLine.style.top = window.scrollY + cell2Rect.top + 'px';
            yLine.style.left = window.scrollX + cell2Rect.left + 'px';
            let animateBox1;
            let animateBox2;
            if (coord1.row == 4) {
                xLine.style.height = '0px';
                xLine.style.top = window.scrollY + document.getElementById(tableId).getBoundingClientRect().top + 'px';
                animateBox1 = xLine.animate([
                    { height: cellDimension + 'px' }
                ], {
                    duration: 1000
                });
            }
            else {
                animateBox1 = xLine.animate([
                    { top: window.scrollY + cell1Rect.top + cellDimension + 'px' }
                ], {
                    duration: 1000
                });
            }
            if (coord2.row == 4) {
                yLine.style.height = '0px';
                yLine.style.top = window.scrollY + document.getElementById(tableId).getBoundingClientRect().top + 'px';
                animateBox2 = yLine.animate([
                    { height: cellDimension + 'px' }
                ], {
                    duration: 1000
                });
            }
            else {
                animateBox2 = yLine.animate([
                    { top: window.scrollY + cell2Rect.top + cellDimension + 'px' }
                ], {
                    duration: 1000
                });
            }
            arrPromises = [animateBox1.finished, animateBox2.finished];
            yield Promise.all(arrPromises);
            highlightCells(tableId, 'ctxt', ...endCoords);
        }
        else {
            yield Promise.all(drawLinesUniqueCoords(startCoords, tableId));
            highlightCells(tableId, 'ctxt', endCoords[0]);
            yield Promise.all(drawLinesUniqueCoords([startCoords[1], startCoords[0]], tableId));
            highlightCells(tableId, 'ctxt', endCoords[1]);
        }
    });
}
function drawLinesUniqueCoords(startCoords, tableId) {
    const xLine = document.getElementById("xLine_" + tableId);
    const yLine = document.getElementById("yLine_" + tableId);
    const rows = document.getElementById(tableId).children;
    const coord1 = startCoords[0];
    const coord2 = startCoords[1];
    const cell1Rect = rows[coord1.row].children[coord1.col].getBoundingClientRect();
    const cell2Rect = rows[coord2.row].children[coord2.col].getBoundingClientRect();
    const cellDimension = cell1Rect.width;
    const lineThickness = 6;
    xLine.style.height = lineThickness + 'px';
    xLine.style.width = '0px';
    yLine.style.height = '0px';
    yLine.style.width = lineThickness + 'px';
    const oneX = window.scrollX + cell1Rect.left;
    const oneY = window.scrollY + cell1Rect.top;
    const twoX = window.scrollX + cell2Rect.left;
    const twoY = window.scrollY + cell2Rect.top;
    let extendX;
    let extendY;
    const centerDistance = 0.5 * cellDimension - 0.5 * lineThickness;
    xLine.style.top = oneY + centerDistance + 'px';
    yLine.style.left = twoX + centerDistance + 'px';
    const coordDistance = getDistance(startCoords, cellDimension);
    // xLine originates from 1st letter
    if (coord1.col < coord2.col) {
        // 1st letter is on the left of rectangle
        xLine.style.left = oneX + centerDistance + 'px';
        extendX = xLine.animate([
            { width: coordDistance[0] + 'px' }
        ], {
            duration: 1000
        });
    }
    else {
        // 1st letter is on the right of rectangle
        xLine.style.left = oneX + centerDistance + 'px';
        extendX = xLine.animate([
            { width: coordDistance[0] + 'px',
                left: twoX + centerDistance + 'px'
            }
        ], {
            duration: 1000
        });
    }
    // yLine originates from 2nd letter
    if (coord1.row < coord2.row) {
        // 2nd letter is on bottom of rectangle
        yLine.style.top = twoY + centerDistance + 'px';
        extendY = yLine.animate([
            { height: coordDistance[1] + 'px',
                top: oneY + centerDistance + 'px'
            }
        ], {
            duration: 1000
        });
    }
    else {
        // 2nd letter is on top of rectangle
        yLine.style.top = twoY + centerDistance + 'px';
        extendY = yLine.animate([
            { height: coordDistance[1] + 'px' }
        ], {
            duration: 1000
        });
    }
    return [extendX.finished, extendY.finished];
}
function getDistance(CoordinatesPair, cellDimension) {
    const yDist = Math.abs(CoordinatesPair[0].row - CoordinatesPair[1].row) * cellDimension;
    const xDist = Math.abs(CoordinatesPair[0].col - CoordinatesPair[1].col) * cellDimension;
    return [xDist, yDist];
}
function setLineVisibility(tableId, visible) {
    const xLine = document.getElementById("xLine_" + tableId);
    const yLine = document.getElementById("yLine_" + tableId);
    if (visible) {
        xLine.style.visibility = 'visible';
        yLine.style.visibility = 'visible';
    }
    else {
        xLine.style.visibility = 'hidden';
        yLine.style.visibility = 'hidden';
    }
}
function highlightCells(tableId, color, ...Coordinates) {
    const rows = document.getElementById(tableId).children;
    for (const coord of Coordinates) {
        const cell = rows[coord.row].children[coord.col];
        switch (color) {
            case 'transparent':
                cell.className = '';
                break;
            case 'ptxt':
                cell.className = 'table__cell--pink';
                break;
            case 'ctxt':
                cell.className = 'table__cell--green';
                break;
        }
    }
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
