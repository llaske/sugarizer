/* global Notyf, liquidjs, twemoji, AOS */
const checkElement = async (selector) => {
  while (document.querySelector(selector) === null) {
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
  return document.querySelector(selector);
};

const notyf = new Notyf({
  duration: 5000,
  types: [
    {
      type: 'success',
      background: 'var(--bs-success)',
      icon: {
        className: 'material-icons text-white',
        tagName: 'span',
        text: 'check_circle',
      },
    },
    {
      type: 'info',
      background: 'var(--bs-blue)',
      icon: {
        className: 'material-icons text-white',
        tagName: 'span',
        text: 'info',
      },
    },
    {
      type: 'warning',
      background: 'var(--bs-orange)',
      icon: {
        className: 'material-icons text-white',
        tagName: 'span',
        text: 'warning',
      },
    },
    {
      type: 'error',
      background: 'var(--bs-danger)',
      icon: {
        className: 'material-icons text-white',
        tagName: 'span',
        text: 'error',
      },
    },
  ],
});

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function storageAvailable(type) {
  let storage;
  try {
    storage = window[type];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      (e.code === 22 ||
        e.code === 1014 ||
        e.name === 'QuotaExceededError' ||
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      storage &&
      storage.length !== 0
    );
  }
}

// Language
const pageLanguage = document.documentElement.lang;
const userLanguage = navigator.language;
const changeLanguageAlert = document.getElementById('change-language');
if (
  
  (pageLanguage === 'en' && userLanguage === 'en')
) {
  let isDismissClicked = '';
  if (storageAvailable('localStorage')) {
    isDismissClicked = localStorage.getItem('dismissLanguage') === 'true';
  }
  if (!isDismissClicked) {
    changeLanguageAlert.style = 'display: block;';
    const dismissButton = document.getElementById('language-dismiss-button');
    dismissButton.addEventListener('click', () => {
      changeLanguageAlert.style = 'display: none;';
      if (storageAvailable('localStorage')) {
        localStorage.setItem('dismissLanguage', true);
      }
    });
  }
}

let languageData = {
    "toastNewGame": "New game started.",
    "youFirst": "You start first.",
    "computerFirst": "Computer starts first. Please click 'Pass Turn' button.",
    "youWin": "You win!",
    "computerWin": "Computer win. Press 'New Game' button to restart.",
    "rowSelected": "{{row}} row selected. Click as many times as you want to take a coin and press the 'Pass Turn' button.",
    "rowCanNotTake": "You can't take any more coins on the {{row}} row. Please press the turn-over button below.",
    "wrongRow": "Wrong row selected. Please take coins from the {{row}} row only.",
    "yourTurn": "Your turn. Select the row you want to take the coin from and click on it. Once selected, it cannot be changed.",
    "computerNotStarted": "Computer has not started. Please click 'Pass Turn' button.",
    "youAreNotTaked": "You haven't taken your coins yet.<br>You must take at least one coin from one of the many rows.",
    "wrongKey": "Wrong key pressed. There are currently 3 coin rows in the game.",
    "optionSaved": "Option saved successfully.",
    "browserCanNotSaveLoadOption": "In this browser, you cannot save or load options",
    "optionLoaded": "Option loaded successfully."
};

const engine = new liquidjs.Liquid();
function getLanguageWithValue(message, values) {
  const languageMessage = languageData[message];
  const parsedTemplete = engine.parse(languageMessage);
  return engine.renderSync(parsedTemplete, values);
}

// Original Code
// Copyright © 2009 Fortune_Cookie_
// https://community.shopify.com/c/Shopify-Design/Ordinal-Number-in-javascript-1st-2nd-3rd-4th/m-p/72156
function getGetOrdinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// Game Options
let isClassic = true;
let numberOfCoinrows = 4;
let minCoins = 1;
let maxCoins = 10;

let isGamePlaying = false;
let isComputerFirst = false;
let isPlayerTurn = false;
let isPlayerSelectedRow = false;
let playerSelectedRow;
let isPlayerMoved = false;

const statusElement = document.getElementById('game-status');

let coins = [];

function calculateNimSum(array) {
  let nimSum = 0;
  array.forEach((elem) => {
    /* eslint no-bitwise: ["error", { "allow": ["^="] }] */
    nimSum ^= elem;
  });
  return nimSum;
}

function remapCoins() {
  const coinSpans = document.querySelectorAll('.game-row-coin');
  for (let i = 0; i < numberOfCoinrows; i += 1)
    coinSpans[i].innerHTML = '⚫'.repeat(coins[i]);
  const gameBoard = document.getElementById('game-board');
  twemoji.parse(gameBoard, { className: 'emoji mx-3' });
  gameBoard.addEventListener('dragstart', (event) => {
    event.preventDefault();
  });
}

function decideWhoFirst() {
  const nimSum = calculateNimSum(coins);
  if (nimSum !== 0) {
    statusElement.innerHTML = languageData.youFirst;
    isPlayerTurn = true;
  } else {
    statusElement.innerHTML = languageData.computerFirst;
    isPlayerTurn = false;
  }
}

function newGame() {
  if (isClassic) {
    coins = [1, 3, 5, 7];
  } else {
    for (let i = 0; i < numberOfCoinrows; i += 1) {
      coins[i] = getRandomIntInclusive(minCoins, maxCoins);
    }
  }

  const gameRowElements = document.querySelectorAll('.game-row');
  if (numberOfCoinrows === 3) {
    const forHide = gameRowElements[gameRowElements.length - 1];
    forHide.style = 'display: none;';
    coins[3] = 0;
  } else if (numberOfCoinrows === 4) {
    const forShow = gameRowElements[gameRowElements.length - 1];
    forShow.style = 'display: table-row;';
  }

  isPlayerSelectedRow = false;
  playerSelectedRow = null;
  isGamePlaying = true;
  isPlayerMoved = false;

  remapCoins();
  decideWhoFirst();
  if (!isPlayerTurn) isComputerFirst = true;
  notyf.open({ type: 'info', message: languageData.toastNewGame });
}

function isWin(isPlayerMove) {
  const getArraySum = (array) => array.reduce((a, b) => a + b, 0);
  if (getArraySum(coins) === 0) {
    if (isPlayerMove) {
      statusElement.innerHTML = languageData.youWin;
    } else {
      statusElement.innerHTML = languageData.computerWin;
    }
    isGamePlaying = false;
  }
}

function playerMove(row) {
  statusElement.innerHTML = getLanguageWithValue('rowSelected', {
    row: getGetOrdinal(row + 1),
  });
  const move = () => {
    playerSelectedRow = row;
    isPlayerSelectedRow = true;
    isPlayerMoved = true;
    coins[row] -= 1;
    remapCoins();
  };
  if (!isPlayerSelectedRow) {
    if (coins[row] === 0)
      statusElement.innerHTML = getLanguageWithValue('rowCanNotTake', {
        row: getGetOrdinal(row + 1),
      });
    else {
      move();
      isWin(true);
    }
  } else if (row === playerSelectedRow) {
    if (coins[row] === 0)
      statusElement.innerHTML = getLanguageWithValue('rowCanNotTake', {
        row: getGetOrdinal(row + 1),
      });
    else {
      move();
      isWin(true);
    }
  } else {
    statusElement.innerHTML = getLanguageWithValue('wrongRow', {
      row: getGetOrdinal(playerSelectedRow + 1),
    });
  }
}

function computerMove() {
  for (let i = 0; i < numberOfCoinrows; i += 1) {
    const copyCoins = [...coins];
    while (copyCoins[i] > 0) {
      copyCoins[i] -= 1;
      if (calculateNimSum(copyCoins) === 0) {
        coins = copyCoins;
        isPlayerSelectedRow = false;
        playerSelectedRow = null;
        isPlayerTurn = true;
        isPlayerMoved = false;
        statusElement.innerHTML = languageData.yourTurn;
        isWin(false);
        remapCoins();
        return;
      }
    }
  }

  let randomRow;
  do randomRow = getRandomIntInclusive(1, numberOfCoinrows - 1);
  while (coins[randomRow] === 0);
  const randomMove = getRandomIntInclusive(1, coins[randomRow]);
  coins[randomRow] -= randomMove;
  isPlayerSelectedRow = false;
  playerSelectedRow = null;
  isPlayerTurn = true;
  isPlayerMoved = false;
  statusElement.innerHTML = languageData.yourTurn;
  isWin(false);
  remapCoins();
}

// Game Event
function onRowClicked(event) {
  if (isGamePlaying && isComputerFirst) {
    statusElement.innerHTML = languageData.computerNotStarted;
    return;
  }
  if (isGamePlaying && isPlayerTurn) {
    const clickedElement = event.target;
    let selectedRow;
    if (clickedElement.tagName === 'IMG') {
      selectedRow = clickedElement.parentNode.parentNode.parentNode;
    } else if (clickedElement.tagName === 'SPAN') {
      selectedRow = clickedElement.parentNode.parentNode;
    } else {
      selectedRow = clickedElement.parentNode;
    }
    playerMove(parseInt(selectedRow.dataset.gameRow));
  }
}

function onTurnOverClicked() {
  if (!isGamePlaying) return;
  if (isComputerFirst) {
    isComputerFirst = false;
    computerMove();
    return;
  }
  if (!isPlayerMoved) {
    statusElement.innerHTML = languageData.youAreNotTaked;
    return;
  }
  if (isGamePlaying && isPlayerTurn) {
    isPlayerTurn = false;
    computerMove();
  }
}

const gameRows = document.querySelectorAll('.game-row');
gameRows.forEach((gameRow) =>
  gameRow.addEventListener('click', (event) => onRowClicked(event))
);
document.addEventListener('keydown', (event) => {
  const gameKeys = ['1', '2', '3', '4', 'd', 'f', 'j', 'k'];
  const keyPressed = event.key.toLowerCase();
  const newEvent = { target: null };
  if (gameKeys.includes(keyPressed)) {
    if (keyPressed === '1' || keyPressed === 'd') {
      newEvent.target = document.querySelector('#game-row-1-tr td');
    }
    if (keyPressed === '2' || keyPressed === 'f') {
      newEvent.target = document.querySelector('#game-row-2-tr td');
    }
    if (keyPressed === '3' || keyPressed === 'j') {
      newEvent.target = document.querySelector('#game-row-3-tr td');
    }
    if (keyPressed === '4' || keyPressed === 'k') {
      if (numberOfCoinrows === 4) {
        newEvent.target = document.querySelector('#game-row-4-tr td');
      } else {
        statusElement.innerHTML = languageData.wrongKey;
        return;
      }
    }
    onRowClicked(newEvent);
  }
});

const turnOverButton = document.getElementById('turn-over-btn');
turnOverButton.addEventListener('click', (event) => onTurnOverClicked(event));
document.addEventListener('keydown', (event) => {
  if (['Enter', ' '].includes(event.key)) {
    event.preventDefault();
    onTurnOverClicked();
  }
});

const newGameButton = document.getElementById('new-game-btn');
newGameButton.addEventListener('click', () =>
  newGame(isClassic, numberOfCoinrows, minCoins, maxCoins)
);
document.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'n') {
    event.preventDefault();
    newGameButton.click();
  }
});

// Option

const optionButton = document.getElementById('option-btn');
const optionSaveButton = document.getElementById('option-save-btn');

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    optionButton.click();
  }
});

function saveOption(toSaveOptions) {
  if (storageAvailable('localStorage')) {
    localStorage.setItem('isClassic', toSaveOptions.isClassic);
    localStorage.setItem('numberOfCoinrows', toSaveOptions.numberOfCoinrows);
    localStorage.setItem('minCoins', toSaveOptions.minCoins);
    localStorage.setItem('maxCoins', toSaveOptions.maxCoins);
    notyf.open({
      type: 'success',
      message: languageData.optionSaved,
    });
  } else {
    notyf.open({
      type: 'warning',
      message: languageData.browserCanNotSaveLoadOption,
    });
  }
}

function loadOption() {
  if (storageAvailable('localStorage')) {
    isClassic = (localStorage.getItem('isClassic') ?? 'true') === 'true';
    numberOfCoinrows = Number(localStorage.getItem('numberOfCoinrows') ?? 4);
    minCoins = Number(localStorage.getItem('minCoins') ?? 1);
    maxCoins = Number(localStorage.getItem('maxCoins') ?? 10);
    const gameRowElements = document.querySelectorAll('.game-row');
    if (numberOfCoinrows === 3) {
      const forHide = gameRowElements[gameRowElements.length - 1];
      forHide.style = 'display: none;';
    } else if (numberOfCoinrows === 4) {
      const forShow = gameRowElements[gameRowElements.length - 1];
      forShow.style = 'display: table-row;';
    }
    // notyf.open({
    //   type: 'success',
    //   message: languageData.optionLoaded,
    // });
  } else {
    notyf.open({
      type: 'warning',
      message: languageData.browserCanNotSaveLoadOption,
    });
  }
}

document.addEventListener('DOMContentLoaded', loadOption);

const optionIsClassicElement = document.getElementById('is-classic-checkbox');
const optionCoinrowsElement = document.getElementById('coin-rows-select');
const optionMaxCoinRangeElement = document.getElementById('max-coins-range');
const optionNowCoinElement = document.getElementById('option-now-coin');
optionSaveButton.addEventListener('click', () => {
  const optionIsClassic = optionIsClassicElement.checked;
  let optionCoinrows = Number(optionCoinrowsElement.value);
  let optionMaxCoinRange = Number(optionMaxCoinRangeElement.value);
  if (optionIsClassic) {
    optionCoinrows = 4;
    optionMaxCoinRange = 7;
  }

  isClassic = optionIsClassic;
  numberOfCoinrows = parseInt(optionCoinrows, 10);
  maxCoins = parseInt(optionMaxCoinRange, 10);
  saveOption({ isClassic, numberOfCoinrows, minCoins, maxCoins });
  newGame();
});

optionMaxCoinRangeElement.addEventListener('change', (event) => {
  optionNowCoinElement.innerHTML = event.target.value;
});
optionButton.addEventListener('click', () => {
  optionIsClassicElement.checked = isClassic;
  optionCoinrowsElement.value = numberOfCoinrows;
  optionNowCoinElement.innerHTML = maxCoins;
  optionMaxCoinRangeElement.value = maxCoins;
});
