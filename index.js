// update all variables and functions to ES6
// maybe create a global variable that IS the current row's HTML? it gets used a lot
// allow backspace to go back to the previous input 

// Global Variables
var winningWord = '';
var currentRow = 1;
var guess = '';
var gamesPlayed = [];

// Query Selectors
var inputs = document.querySelectorAll('input');
var guessButton = document.querySelector('#guess-button');
var keyLetters = document.querySelectorAll('span');
var errorMessage = document.querySelector('#error-message');
var viewRulesButton = document.querySelector('#rules-button');
var viewGameButton = document.querySelector('#play-button');
var viewStatsButton = document.querySelector('#stats-button');
var gameBoard = document.querySelector('#game-section');
var letterKey = document.querySelector('#key-section');
var rules = document.querySelector('#rules-section');
var stats = document.querySelector('#stats-section');
var gameOverBox = document.querySelector('#game-over-section');
var gameOverGuessCount = document.querySelector('#game-over-guesses-count');
var gameOverGuessGrammar = document.querySelector('#game-over-guesses-plural');

// Event Listeners
window.addEventListener('load', setGame);

// pass event through
// can this be done with an iterator?
for (var i = 0; i < inputs.length; i++) {
  inputs[i].addEventListener('keyup', function() { moveToNextInput(event) });
}

// pass event through
// can this be done with an iterator?
for (var i = 0; i < keyLetters.length; i++) {
  keyLetters[i].addEventListener('click', function() { clickLetter(event) });
}

guessButton.addEventListener('click', submitGuess);

viewRulesButton.addEventListener('click', viewRules);

viewGameButton.addEventListener('click', viewGame);

viewStatsButton.addEventListener('click', viewStats);

// Functions
function setGame() {
  currentRow = 1;
  winningWord = getRandomWord();
  updateInputPermissions();
}

function getRandomWord() {
  // replace 2500 with array length
  var randomIndex = Math.floor(Math.random() * 2500);
  return words[randomIndex];
}

function updateInputPermissions() {
  // use iterator
  for(var i = 0; i < inputs.length; i++) {
    // interpolated with dashes around so it does not search the cell numbers - smart, but is there a better way?
    if(!inputs[i].id.includes(`-${currentRow}-`)) {
    //disabled determines whether HTML element will accept clicks or not
    // are boolean assignments needed here?
      inputs[i].disabled = true;
    } else {
      inputs[i].disabled = false;
    }
  }

  inputs[0].focus();
}

function moveToNextInput(e) {
  // these are both deprecated; use key property instead - will likely require additional debugging
  var key = e.keyCode || e.charCode;

  // 8 means backspace, 46 means delete - this allows the user to stay in the same box when they are backspacing or deleting, and only auto-moves forward if they are entering something. Change this to only allow move forward if a letter is entered - prevents blanks or numbers or any other key press from triggering the move forward
  if( key !== 8 && key !== 46 ) {
    // split the id of the event target at the dashes and put the separate elements in an array (dashes are deleted). Target the 3rd (last) element and add 1 - thisis how we progress through the cells in sequential order
    var indexOfNext = parseInt(e.target.id.split('-')[2]) + 1;
    // focus is a JS method
    inputs[indexOfNext].focus();
  }
}

function clickLetter(e) {
  var activeInput = null;
  var activeIndex = null;

  // iterator forEach?
  for (var i = 0; i < inputs.length; i++) {
      // interpolated with dashes around so it does not search the cell numbers - smart, but is there a better way? 
      // can this conditional be cleaned up?
      // 
    if(inputs[i].id.includes(`-${currentRow}-`) && !inputs[i].value && !activeInput) {
      activeInput = inputs[i];
      activeIndex = i;
    }
  }

  activeInput.value = e.target.innerText;
  inputs[activeIndex + 1].focus();
}

function submitGuess() {
  // nested conditional - ick
  if (checkIsWord()) {
    errorMessage.innerText = '';
    compareGuess();
    // move this to checkForWin function
    if (checkForWin()) {
      setTimeout(declareWinner, 1000);
    } else {
      changeRow();
    }
  } else {
    // actually I hate that this error message pops up, because there are not many words in this game library. Why not just say all the letters are wrong?
    errorMessage.innerText = 'Not a valid word. Try again!';
  }
}

// change function name?
function checkIsWord() {
  guess = '';

  // iterator forEach
  for(var i = 0; i < inputs.length; i++) {
    if(inputs[i].id.includes(`-${currentRow}-`)) {
      // sequentially adds letters to the guess
      guess += inputs[i].value;
    }
  }

  return words.includes(guess);
}

// rename function - compare is the wrong word
function compareGuess() {
  var guessLetters = guess.split('');

  // iterator
  for (var i = 0; i < guessLetters.length; i++) {

    // making the winning word split a variable
    if (winningWord.includes(guessLetters[i]) && winningWord.split('')[i] !== guessLetters[i]) {
      updateBoxColor(i, 'wrong-location');
      updateKeyColor(guessLetters[i], 'wrong-location-key');
    } else if (winningWord.split('')[i] === guessLetters[i]) {
      updateBoxColor(i, 'correct-location');
      updateKeyColor(guessLetters[i], 'correct-location-key');
    } else {
      updateBoxColor(i, 'wrong');
      updateKeyColor(guessLetters[i], 'wrong-key');
    }
  }

}

// Maybe put these in one function? 
function updateBoxColor(letterLocation, className) {
  // iterator - map
  var row = [];

  for (var i = 0; i < inputs.length; i++) {
    if(inputs[i].id.includes(`-${currentRow}-`)) {
      row.push(inputs[i]);
    }
  }

  row[letterLocation].classList.add(className);
}

function updateKeyColor(letter, className) {
  var keyLetter = null;

  // iterator forEach
  for (var i = 0; i < keyLetters.length; i++) {
    if (keyLetters[i].innerText === letter) {
      keyLetter = keyLetters[i];
    }
  }

  keyLetter.classList.add(className);
}

function checkForWin() {
  return guess === winningWord;
}

function changeRow() {
  currentRow++;
  updateInputPermissions();
}

function declareWinner() {
  recordGameStats();
  changeGameOverText();
  viewGameOverMessage();
  setTimeout(startNewGame, 4000);
}


function recordGameStats() {
  gamesPlayed.push({ solved: true, guesses: currentRow });
}

// add display game stats function
// display total number of games played
// display % of correct guesses (divide wins by total guesses; need to add this info to a user object, most likely)
// display average number of guesses per game

/// definitely change this conditional to just equal 1; how silly
function changeGameOverText() {
  gameOverGuessCount.innerText = currentRow;
  if (currentRow < 2) {
    gameOverGuessGrammar.classList.add('collapsed');
  } else {
    gameOverGuessGrammar.classList.remove('collapsed');
  }
}

function startNewGame() {
  clearGameBoard();
  clearKey();
  setGame();
  viewGame();

  // this is not needed, as updating input permissions already does this
  inputs[0].focus();
}

function clearGameBoard() {
  // iterator ForEach
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].value = '';
    inputs[i].classList.remove('correct-location', 'wrong-location', 'wrong');
  }
}

// new function name or lump into previous function
function clearKey() {
  // iterator ForEach
  for (var i = 0; i < keyLetters.length; i++) {
    keyLetters[i].classList.remove('correct-location-key', 'wrong-location-key', 'wrong-key');
  }
}

// Change Page View Functions

// add helper functions
function viewRules() {
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
  rules.classList.remove('collapsed');
  stats.classList.add('collapsed');
  viewGameButton.classList.remove('active');
  viewRulesButton.classList.add('active');
  viewStatsButton.classList.remove('active');
}

function viewGame() {
  letterKey.classList.remove('hidden');
  gameBoard.classList.remove('collapsed');
  rules.classList.add('collapsed');
  stats.classList.add('collapsed');
  gameOverBox.classList.add('collapsed')
  viewGameButton.classList.add('active');
  viewRulesButton.classList.remove('active');
  viewStatsButton.classList.remove('active');
}

function viewStats() {
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
  rules.classList.add('collapsed');
  stats.classList.remove('collapsed');
  viewGameButton.classList.remove('active');
  viewRulesButton.classList.remove('active');
  viewStatsButton.classList.add('active');
}

function viewGameOverMessage() {
  gameOverBox.classList.remove('collapsed')
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
}
