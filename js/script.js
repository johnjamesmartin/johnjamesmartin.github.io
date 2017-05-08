/* Cache DOM elements:
 **********************************************************************/
var elemScore = document.getElementById('elem-score');
var elemOutputTurn = document.getElementById('elem-output-turn');
var elemOutputFeedback = document.getElementById('elem-output-feedback');
var elemChangeSymbolBtn = document.getElementById('elem-change-symbol-btn');
var elemRestartBtn = document.getElementById('elem-restart-btn');
var elemShareBtn = document.getElementById('elem-share-btn')
/* :
**********************************************************************/
var config = {
	// 'onePlayer': If true, play against computer. If false play against another player:
  onePlayer: true,
	// 'systemMsg': Some miscellaneous system messages:
  systemMsg: {
    shareFunc: 'share function'
  },
	// 'symbols': The symbols played with throughout the game:
  symbols: {
    X: ' X ',
    O: ' O ',
    empty: '     '
  },
	// 'score': An object for keeping count of player and computer scores:
  score: {
    player: 0,
    computer: 0
  },
  playState: {
    // whoseTurn: 0 = player, 1 = computer turn
    whoseTurn: 0, 
    playerInteractionEnabled: true
  },
  animations: {
    playerTurnChangeTimeLength: 600,
    speedSettings: {
      quick: 200,
      medium: 500,
      slow: 800
    }
  },
  sounds: {
		// 'directory': where sound files are sourced from:
    directory: './sounds/',
		// 'files': the sound files to add to DOM:
    files: ['pop_drip', 'click_04', 'wrong', 'clear', 'fart', 'win', 'win-2player', 'ohno', 'wobble']
  },
  cellButtons: {
    arr: [],
    ids: [],
    values: { one: '', two: '', three: '', four: '', five: '', six: '', seven: '', eight: '', nine: '' },
    states: { oneV: null, twoV: null, threeV: null, fourV: null, fiveV: null, sixV: null, sevenV: null, eightV: null, nineV: null, }
  }
};
/* 'uiLabels' — used for easily editing text used throughout app:
**********************************************************************/
var uiLabels = {
  userFeedback: {
    whichSymbol: 'Which symbol would you like to play as?\n\n',
    whichSymbolTwoPlayer: 'Pick a symbol for Player 1\n\n',
    notRecognized: 'Did not recognize your choice. Please input only ',
    player1EnterName: 'Player one, please enter your name.',
    player2EnterName: 'Player two, please enter your name.',
    win: 'You won!',
    lose: 'You lost',
    draw: 'It\'s a draw!',
    turn: {
      computer: 'Game turn',
      player: 'Your turn',
      playerOne: 'Player one' + '\'s turn',
      playerTwo: 'Player two' + '\'s turn'
    },
    additionalMessages: {
      tooBad: ['Oh no!', 'Aw noOoo!!'],
      betterLuckNextTime: 'Better luck next time.',
      keepUpGoodWork: 'Keep it up!',
      goodJob: ['Good job!', 'Outstanding!'],
      drawZzz: ['Zzz...']
    }
  },
  players: {
    player: 'Player',
    computer: 'Computer',
    playerOne: 'Player one',
    playerTwo: 'Player two'
  },
  menuButtons: [['Play Computer', 'start'], ['Player Vs. Player', 'channels']],
	// word equivalents of numbers:
  numbersLibrary: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
};
/* :
**********************************************************************/
var playerSymbol = config.symbols.X;
var computerSymbol = config.symbols.O;
var playerIcons = { player: config.symbols.X, computer: config.symbols.O };
var styles = { turn: { computer: 'computer-turn', player: 'player-turn' }, win: 'game-win', loss: 'game-loss', draw: 'game-draw' };
var feedbackClasses = [styles.turn.computer, styles.turn.player, styles.win, styles.loss, styles.draw];
var win = false;

/* :
 **********************************************************************/
var visuals = {
  // Add a class and then remove it after a predetermined period of time:
  addAndThenRemoveClass: function(o) {
    $(o.element).addClass(o.class);
    setTimeout(function() { $(o.element).removeClass(o.class); }, o.timeout);
  },
  // Highlight the winning row:
  highlightWinningRow: function(row, colVal) {
    for (var i = 0; i < row.length; i++) {
      visuals.addAndThenRemoveClass({ element: '#elem-cell-button' + row[i], class: 'game-win-highlight-row', timeout: config.animations.speedSettings.slow * 6 });
    }
  },
  // :
  removeFeedbackClasses: function() {
    for (var i = 0; i < feedbackClasses.length; i++) elemOutputTurn.classList.remove(feedbackClasses[i]);
  },
  // Create the game grid using 'top' and 'right' borders in CSS:
  createBorders: function() {
    var gridBorder = {
      top: ['elem-cell-button4', 'elem-cell-button5', 'elem-cell-button6', 'elem-cell-button7', 'elem-cell-button8', 'elem-cell-button9'],
      right: ['elem-cell-button1', 'elem-cell-button2', 'elem-cell-button4', 'elem-cell-button5', 'elem-cell-button7', 'elem-cell-button8']
    };
    gridBorder.right.forEach(function(element, index, arr) { document.getElementById(element).className += ' elem-grid-border-right'; });
    gridBorder.top.forEach(function(element, index, arr) { document.getElementById(element).className += ' elem-grid-border-top'; });
  },
  // Make a string titlecase. For example, if a user inputs "john" this function will return "John":
  makeTitleCase: function(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  }
}
function playerTurnChangeAnimation(o) {
  visuals.addAndThenRemoveClass({ element: '#elem-output-turn', class: 'animated fadeIn', timeout: 1000 });
  //o.elem.classList.remove();
  if (config.playState.whoseTurn == 0) {
    elemOutputTurn.classList.remove(styles.turn.computer);
    elemOutputTurn.classList.add(styles.turn.player);
  } else {
    elemOutputTurn.classList.remove(styles.turn.player);
    elemOutputTurn.classList.add(styles.turn.computer);
  }
  //o.elem.style.color = o.colVal;
  o.elem.style.opacity = o.fadeState.begin;
  $(o.elem).animate({ opacity: o.fadeState.end }, o.fadeState.len);
  o.elem.innerHTML = o.message;
};
/* Some animation helper functions:
 **********************************************************************/
var animations = {
  feedbackEvent: {
    constructor: function(o) {
      elemOutputFeedback.innerHTML = o.messageLower[Math.floor(Math.random() * o.messageLower.length)];
      visuals.removeFeedbackClasses();
      elemOutputTurn.classList.add(o.classToApply);
      elemOutputTurn.innerHTML = o.messageUpper;
      elemOutputFeedback.style.opacity = 0;
      setTimeout(function() {  $(elemOutputFeedback).animate({ opacity: 1 }, config.animations.speedSettings.medium); }, config.animations.speedSettings.quick);
      setTimeout(function() { $(elemOutputFeedback).animate({ opacity: 0 }, config.animations.speedSettings.medium); }, 2500);
      setTimeout(function() { $(elemOutputFeedback).animate({ opacity: 1 }, config.animations.speedSettings.quick / 2); elemOutputFeedback.innerHTML = o.messageLower2; }, 3500);
      setTimeout(function() { $(elemOutputFeedback).animate({ opacity: 0 }, config.animations.speedSettings.slow);
      setTimeout(function() { elemOutputFeedback.innerHTML = '<br/>'; }, config.animations.speedSettings.slow); }, 5000);
    }
  }
};
function disableAllCellButtons(truthValue) {
  $('.elem-cell-button').each(function(i) { this.disabled = truthValue; });
};
function updateElemScore() {
  var player1 = config.onePlayer ? uiLabels.players.player : uiLabels.players.playerOne;
  var player2 = config.onePlayer ? uiLabels.players.computer : uiLabels.players.playerTwo;
  elemScore.innerHTML = player1 + ': ' + config.score.player + '&nbsp;&nbsp;&nbsp;&nbsp;' + player2 + ': ' + config.score.computer;
}
/* ---------------------------------------------------------------------------------------------- */
/* ---------------------------------------------------------------------------------------------- */
/* ---------------------------------------------------------------------------------------------- */
/* ---------------------------------------------------------------------------------------------- */
/* ---------------------------------------------------------------------------------------------- */
/* ---------------------------------------------------------------------------------------------- */
/* 'promptPlayerToChooseSymbol' gets the user to input the symbol they
    wish to play as (either X or O):
 **********************************************************************/
function promptPlayerToChooseSymbol() {
  var pickSymbol;
  // Determine the 'pick symbol' prompt — it depends on whether it's one player or against another player:
  pickSymbol = config.onePlayer ? 
    prompt(uiLabels.userFeedback.whichSymbol + config.symbols.X.trim() + ' or ' + config.symbols.O.trim() + '?', config.symbols.X.trim()) :
    prompt(uiLabels.userFeedback.whichSymbolTwoPlayer + config.symbols.X.trim() + ' or ' + config.symbols.O.trim() + '?', config.symbols.X.trim());
  // If no symbol has been chosen at this stage try re-prompting the user:
  if (!pickSymbol) {
    promptPlayerToChooseSymbol();
    return false;
  }
  // Set the symbol chosen as the 'playerSymbol' (after trimming white space and checking it matches 'X' or 'O' in whichever case):
  if (pickSymbol.trim().toLowerCase() == config.symbols.X.trim().trim().toLowerCase()) {
    playerSymbol = config.symbols.X;
    computerSymbol = config.symbols.O;
  } else if (pickSymbol.trim().toLowerCase() == config.symbols.O.trim().toLowerCase()) {
    playerSymbol = config.symbols.O;
    computerSymbol = config.symbols.X;
  } else {
    alert(uiLabels.userFeedback.notRecognized + '"' + config.symbols.X.trim() + '" or "' + config.symbols.O.trim() + '".');
    promptPlayerToChooseSymbol();
  }
};
/* 'promptPlayerToChooseSymbol' gets the user to input the symbol they
    wish to play as (either X or O):
 **********************************************************************/
function promptPlayerToChooseNames() {
  var player1;
  var player2;
  // Determine the 'pick symbol' prompt — it depends on whether it's one player or against another player:
  if (!config.onePlayer) {
    player1 = visuals.makeTitleCase(prompt(uiLabels.userFeedback.player1EnterName));
    player2 = visuals.makeTitleCase(prompt(uiLabels.userFeedback.player2EnterName));
  }
  if (!config.onePlayer && player1) {
    uiLabels.players.playerOne = player1;
    uiLabels.userFeedback.turn.playerOne = uiLabels.userFeedback.turn.playerOne.replace('Player one', player1);
  }
  if (!config.onePlayer && player2) {
    uiLabels.players.playerTwo = player2;
    uiLabels.userFeedback.turn.playerTwo = uiLabels.userFeedback.turn.playerTwo.replace('Player two', player2);
  }
  updateElemScore();
};
/* 
 **********************************************************************/
var feedbackEvent = {
  win: function(row) {
    // Increment player score and highlight winning row:
    config.score.player++;
    updateElemScore();
    visuals.highlightWinningRow(row, styles.win);
    visuals.removeFeedbackClasses();
    win = true;
    // Do the following if player wins against computer:
    if (config.onePlayer) {
      document.getElementById('win').play();
      animations.feedbackEvent.constructor({
        messageUpper: uiLabels.userFeedback.win,
        messageLower: uiLabels.userFeedback.additionalMessages.goodJob,
        messageLower2: uiLabels.userFeedback.additionalMessages.keepUpGoodWork,
        classToApply: styles.win
      });
    // Do the following if player one wins against player two:
    } else {
      document.getElementById('win-2player').play();
      animations.feedbackEvent.constructor({
        messageUpper: uiLabels.players.playerOne + ' wins!',
        messageLower: ['Don\'t cry, ' + uiLabels.players.playerTwo + '!!'],
        messageLower2: 'Okay... another game...',
        classToApply: styles.win
      });
    }
    // Disable cells from further interaction until ending animation completes:
    disableAllCellButtons(true);
    setTimeout(function() { visuals.addAndThenRemoveClass({ element: '.container', class: 'animated rubberBand', timeout: 1000 }); document.getElementById('wobble').play(); resetGame(); }, 4500);
  },
  lose: function(row) {
    // Increment computer score and highlight winning row:
    config.score.computer++;
    updateElemScore();
    visuals.highlightWinningRow(row, styles.loss);
    // Do the following if player loses to computer:
    if (config.onePlayer) {
      document.getElementById('ohno').play();
      animations.feedbackEvent.constructor({
        messageUpper: uiLabels.userFeedback.lose,
        messageLower: uiLabels.userFeedback.additionalMessages.tooBad,
        messageLower2: uiLabels.userFeedback.additionalMessages.betterLuckNextTime,
        classToApply: styles.loss
      });
    // Do the following if player two wins against player one:
    } else {
      document.getElementById('win-2player').play();
      animations.feedbackEvent.constructor({
        messageUpper: uiLabels.players.playerTwo + ' wins!',
        messageLower: ['Don\'t cry, ' + uiLabels.players.playerOne + '!!'],
        messageLower2: 'Okay... another game...',
        classToApply: styles.win
      });
    }
    // Disable cells from further interaction until ending animation completes:
    disableAllCellButtons(true);
    setTimeout(function() { visuals.addAndThenRemoveClass({ element: '.container', class: 'animated rubberBand', timeout: 1000 }); document.getElementById('wobble').play(); resetGame(); }, 4500);
  },
  draw: function() {
    // Do the following if there's a draw with no winning row:
    if (!win) {
      document.getElementById('ohno').play();
      visuals.highlightWinningRow([1, 2, 3, 4, 5, 6, 7, 8, 9], styles.draw);
      config.animations.playerTurnChangeTimeLength = 4500;
      visuals.removeFeedbackClasses();
      animations.feedbackEvent.constructor({
        messageUpper: uiLabels.userFeedback.draw,
        messageLower: uiLabels.userFeedback.additionalMessages.drawZzz,
        messageLower2: '<br>',
        classToApply: styles.draw
      });
      // Disable cells from further interaction until ending animation completes:
      disableAllCellButtons(true);
      setTimeout(function() { 
        visuals.addAndThenRemoveClass({ element: '.container', class: 'animated rubberBand', timeout: 1000 });
        document.getElementById('wobble').play();
        resetGame();
        //config.animations.playerTurnChangeTimeLength = 600;
      },
      4500);
    }
    win = false;
  }
};
/* :
 **********************************************************************/
function checkGameResult() {
  checkForAvailableComputerCell();
  checkForLoss();
  checkForDraw();
};
var cellButton = {
  setCurrentValues: function() {
  },
  setDefaultStates: function() {
  }
}
/* :
 **********************************************************************/
function setCellButtons() {
  config.cellButtons.states['oneV'] = 0;
  config.cellButtons.states['twoV'] = 0;
  config.cellButtons.states['threeV'] = 0;
  config.cellButtons.states['fourV'] = 0;
  config.cellButtons.states['fiveV'] = 0;
  config.cellButtons.states['sixV'] = 0;
  config.cellButtons.states['sevenV'] = 0;
  config.cellButtons.states['eightV'] = 0;
  config.cellButtons.states['nineV'] = 0;
};
/* :
 **********************************************************************/
function getCellButtons() {
  for (var i = 0; i < 9; i++) {
    config.cellButtons.values[uiLabels.numbersLibrary[i]] = $('#elem-cell-button' + eval(i + 1))[0].value
  }
};
/* :
 **********************************************************************/
/* :
 **********************************************************************/
function checkForRow() {
  if (config.cellButtons.values.one == playerSymbol && config.cellButtons.values.two == playerSymbol && config.cellButtons.values.three == playerSymbol) feedbackEvent.win([1, 2, 3]);
  else if (config.cellButtons.values.four == playerSymbol && config.cellButtons.values.five == playerSymbol && config.cellButtons.values.six == playerSymbol) feedbackEvent.win([4, 5, 6]);
  else if (config.cellButtons.values.seven == playerSymbol && config.cellButtons.values.eight == playerSymbol && config.cellButtons.values.nine == playerSymbol) feedbackEvent.win([7, 8, 9]);
  else if (config.cellButtons.values.one == playerSymbol && config.cellButtons.values.five == playerSymbol && config.cellButtons.values.nine == playerSymbol) feedbackEvent.win([1, 5, 9]);
  else if (config.cellButtons.values.one == playerSymbol && config.cellButtons.values.four == playerSymbol && config.cellButtons.values.seven == playerSymbol) feedbackEvent.win([1, 4, 7]);
  else if (config.cellButtons.values.two == playerSymbol && config.cellButtons.values.five == playerSymbol && config.cellButtons.values.eight == playerSymbol) feedbackEvent.win([2, 5, 8]);
  else if (config.cellButtons.values.three == playerSymbol && config.cellButtons.values.six == playerSymbol && config.cellButtons.values.nine == playerSymbol) feedbackEvent.win([3, 6, 9]);
  else if (config.cellButtons.values.one == playerSymbol && config.cellButtons.values.five == playerSymbol && config.cellButtons.values.nine == playerSymbol) feedbackEvent.win([1, 5, 9]);
  else if (config.cellButtons.values.three == playerSymbol && config.cellButtons.values.five == playerSymbol && config.cellButtons.values.seven == playerSymbol) feedbackEvent.win([3, 5, 7]);
  else checkGameResult();
};
/* :
 **********************************************************************/
function checkForLoss() {
  getCellButtons();
  checkForDraw();
  if (config.cellButtons.values.one == computerSymbol && config.cellButtons.values.two == computerSymbol && config.cellButtons.values.three == computerSymbol) feedbackEvent.lose([1, 2, 3]);
  else if (config.cellButtons.values.four == computerSymbol && config.cellButtons.values.five == computerSymbol && config.cellButtons.values.six == computerSymbol) feedbackEvent.lose([4, 5, 6]);
  else if (config.cellButtons.values.seven == computerSymbol && config.cellButtons.values.eight == computerSymbol && config.cellButtons.values.nine == computerSymbol) feedbackEvent.lose([7, 8, 9]);
  else if (config.cellButtons.values.one == computerSymbol && config.cellButtons.values.five == computerSymbol && config.cellButtons.values.nine == computerSymbol) feedbackEvent.lose([1, 5, 9]);
  else if (config.cellButtons.values.one == computerSymbol && config.cellButtons.values.four == computerSymbol && config.cellButtons.values.seven == computerSymbol) feedbackEvent.lose([1, 4, 7]);
  else if (config.cellButtons.values.two == computerSymbol && config.cellButtons.values.five == computerSymbol && config.cellButtons.values.eight == computerSymbol) feedbackEvent.lose([2, 5, 8]);
  else if (config.cellButtons.values.three == computerSymbol && config.cellButtons.values.six == computerSymbol && config.cellButtons.values.nine == computerSymbol) feedbackEvent.lose([3, 6, 9]);
  else if (config.cellButtons.values.one == computerSymbol && config.cellButtons.values.five == computerSymbol && config.cellButtons.values.nine == computerSymbol) feedbackEvent.lose([1, 5, 9]);
  else if (config.cellButtons.values.three == computerSymbol && config.cellButtons.values.five == computerSymbol && config.cellButtons.values.seven == computerSymbol) feedbackEvent.lose([3, 5, 7]);
};
/* :
 **********************************************************************/
function checkForDraw() {
  var movesMade = 0;
  getCellButtons();
  for (var i = 0; i <= 9; i++) if (config.cellButtons.states[uiLabels.numbersLibrary[i] + 'V']) movesMade += 1;
  if (movesMade == 9) feedbackEvent.draw();
};
/* :
**********************************************************************/
function checkForAvailableComputerCell() {
  if (!config.onePlayer) return false;
  checkForLoss();
  if (config.cellButtons.values.one == computerSymbol && config.cellButtons.values.two == computerSymbol && !config.cellButtons.states['threeV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button3').value = computerSymbol;
    config.cellButtons.states['threeV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.two == computerSymbol && config.cellButtons.values.three == computerSymbol && !config.cellButtons.states['oneV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button1').value = computerSymbol;
    config.cellButtons.states['oneV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.four == computerSymbol && config.cellButtons.values.five == computerSymbol && !config.cellButtons.states['sixV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button6').value = computerSymbol;
    config.cellButtons.states['sixV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.five == computerSymbol && config.cellButtons.values.six == computerSymbol && !config.cellButtons.states['fourV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button4').value = computerSymbol;
    config.cellButtons.states['fourV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.seven == computerSymbol && config.cellButtons.values.eight == computerSymbol && !config.cellButtons.states['nineV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button9').value = computerSymbol;
    config.cellButtons.states['nineV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.eight == computerSymbol && config.cellButtons.values.nine == computerSymbol && !config.cellButtons.states['sevenV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button7').value = computerSymbol;
    config.cellButtons.states['sevenV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.one == computerSymbol && config.cellButtons.values.five == computerSymbol && !config.cellButtons.states['nineV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button9').value = computerSymbol;
    config.cellButtons.states['nineV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.five == computerSymbol && config.cellButtons.values.nine == computerSymbol && !config.cellButtons.states['oneV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button1').value = computerSymbol;
    config.cellButtons.states['oneV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.three == computerSymbol && config.cellButtons.values.five == computerSymbol && !config.cellButtons.states['sevenV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button7').value = computerSymbol;
    config.cellButtons.states['sevenV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.seven == computerSymbol && config.cellButtons.values.five == computerSymbol && !config.cellButtons.states['threeV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button3').value = computerSymbol;
    config.cellButtons.states['threeV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.one == computerSymbol && config.cellButtons.values.three == computerSymbol && !config.cellButtons.states['twoV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button2').value = computerSymbol;
    config.cellButtons.states['twoV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.four == computerSymbol && config.cellButtons.values.six == computerSymbol && !config.cellButtons.states['fiveV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button5').value = computerSymbol;
    config.cellButtons.states['fiveV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.seven == computerSymbol && config.cellButtons.values.nine == computerSymbol && !config.cellButtons.states['eightV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button8').value = computerSymbol;
    config.cellButtons.states['eightV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.one == computerSymbol && config.cellButtons.values.seven == computerSymbol && !config.cellButtons.states['fourV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button4').value = computerSymbol;
    config.cellButtons.states['fourV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.two == computerSymbol && config.cellButtons.values.eight == computerSymbol && !config.cellButtons.states['fiveV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button5').value = computerSymbol;
    config.cellButtons.states['fiveV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.three == computerSymbol && config.cellButtons.values.nine == computerSymbol && !config.cellButtons.states['sixV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button6').value = computerSymbol;
    config.cellButtons.states['sixV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.one == computerSymbol && config.cellButtons.values.five == computerSymbol && !config.cellButtons.states['nineV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button9').value = computerSymbol;
    config.cellButtons.states['nineV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.four == computerSymbol && config.cellButtons.values.seven == computerSymbol && !config.cellButtons.states['oneV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button1').value = computerSymbol;
    config.cellButtons.states['oneV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.five == computerSymbol && config.cellButtons.values.eight == computerSymbol && !config.cellButtons.states['twoV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button2').value = computerSymbol;
    config.cellButtons.states['twoV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.six == computerSymbol && config.cellButtons.values.nine == computerSymbol && !config.cellButtons.states['threeV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button3').value = computerSymbol;
    config.cellButtons.states['threeV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.one == computerSymbol && config.cellButtons.values.four == computerSymbol && !config.cellButtons.states['sevenV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button7').value = computerSymbol;
    config.cellButtons.states['sevenV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.two == computerSymbol && config.cellButtons.values.five == computerSymbol && !config.cellButtons.states['eightV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button8').value = computerSymbol;
    config.cellButtons.states['eightV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.three == computerSymbol && config.cellButtons.values.six == computerSymbol && !config.cellButtons.states['nineV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button9').value = computerSymbol;
    config.cellButtons.states['nineV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.one == computerSymbol && config.cellButtons.values.nine == computerSymbol && !config.cellButtons.states['fiveV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button5').value = computerSymbol;
    config.cellButtons.states['fiveV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.three == computerSymbol && config.cellButtons.values.seven == computerSymbol && !config.cellButtons.states['fiveV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button5').value = computerSymbol;
    config.cellButtons.states['fiveV'] = 1;
    config.playState.whoseTurn = 0;
  } else {
    elemOutputTurn.innerHTML = config.onePlayer ? uiLabels.userFeedback.turn.computer : uiLabels.userFeedback.turn.playerTwo;
    elemOutputTurn.classList.remove(styles.turn.player);
    elemOutputTurn.classList.add(styles.turn.computer);
    setTimeout(function() { checkForAvailablePlayerCell(); }, config.animations.playerTurnChangeTimeLength);
  }
};
/* :
 **********************************************************************/
function checkForAvailablePlayerCell() {
  checkForLoss();
  var randomNumber = Math.floor(Math.random() * 4);
  // 66.6% chance that the computer will mess up and allow a player win on cells 7 8 9 when cell 5 belongs to player
  if (randomNumber === 2 || randomNumber === 1) {
    if (config.cellButtons.values.nine == playerSymbol && config.cellButtons.values.five == playerSymbol && !config.cellButtons.states['eightV'] && config.playState.whoseTurn == 1) {
      document.getElementById('elem-cell-button8').value = computerSymbol;
      config.cellButtons.states['eightV'] = 1;
      config.playState.whoseTurn = 0;
    }
    if (config.cellButtons.values.eight == playerSymbol && config.cellButtons.values.nine == playerSymbol && !config.cellButtons.states['sixV'] && config.playState.whoseTurn == 1) {
      document.getElementById('elem-cell-button6').value = computerSymbol;
      config.cellButtons.states['sixV'] = 1;
      config.playState.whoseTurn = 0;
    }
  }
  // There's a 20% chance that the computer will make a non-optimal move
  if (randomNumber === 2) {
    if (config.cellButtons.values.one == playerSymbol && config.cellButtons.values.two == playerSymbol && !config.cellButtons.states['fiveV'] && config.playState.whoseTurn == 1) {
      document.getElementById('elem-cell-button5').value = computerSymbol;
      config.cellButtons.states['fiveV'] = 1;
      config.playState.whoseTurn = 0;
    } else if (config.cellButtons.values.two == playerSymbol && config.cellButtons.values.three == playerSymbol && !config.cellButtons.states['nineV'] && config.playState.whoseTurn == 1) {
      document.getElementById('elem-cell-button9').value = computerSymbol;
      config.cellButtons.states['nineV'] = 1;
      config.playState.whoseTurn = 0;
    } else if (config.cellButtons.values.four == playerSymbol && config.cellButtons.values.five == playerSymbol && !config.cellButtons.states['fourV'] && config.playState.whoseTurn == 1) {
      document.getElementById('elem-cell-button4').value = computerSymbol;
      config.cellButtons.states['fourV'] = 1;
      config.playState.whoseTurn = 0;
    } else if (config.cellButtons.values.five == playerSymbol && config.cellButtons.values.six == playerSymbol && !config.cellButtons.states['sevenV'] && config.playState.whoseTurn == 1) {
      document.getElementById('elem-cell-button7').value = computerSymbol;
      config.cellButtons.states['sevenV'] = 1;
      config.playState.whoseTurn = 0;
    } else if (config.cellButtons.values.seven == playerSymbol && config.cellButtons.values.eight == playerSymbol && !config.cellButtons.states['oneV'] && config.playState.whoseTurn == 1) {
      document.getElementById('elem-cell-button9').value = computerSymbol;
      config.cellButtons.states['nineV'] = 1;
      config.playState.whoseTurn = 0;
    } else if (config.cellButtons.values.eight == playerSymbol && config.cellButtons.values.nine == playerSymbol && !config.cellButtons.states['sevenV'] && config.playState.whoseTurn == 1) {
      document.getElementById('elem-cell-button7').value = computerSymbol;
      config.cellButtons.states['sevenV'] = 1;
      config.playState.whoseTurn = 0;
    } else if (config.cellButtons.values.one == playerSymbol && config.cellButtons.values.five == playerSymbol && !config.cellButtons.states['nineV'] && config.playState.whoseTurn == 1) {
      document.getElementById('elem-cell-button1').value = computerSymbol;
      config.cellButtons.states['oneV'] = 1;
      config.playState.whoseTurn = 0;
    } else if (config.cellButtons.values.five == playerSymbol && config.cellButtons.values.nine == playerSymbol && !config.cellButtons.states['twoV'] && config.playState.whoseTurn == 1) {
      document.getElementById('elem-cell-button2').value = computerSymbol;
      config.cellButtons.states['twoV'] = 1;
      config.playState.whoseTurn = 0;
    } else if (config.cellButtons.values.three == playerSymbol && config.cellButtons.values.five == playerSymbol && !config.cellButtons.states['eightV'] && config.playState.whoseTurn == 1) {
      document.getElementById('elem-cell-button8').value = computerSymbol;
      config.cellButtons.states['eightV'] = 1;
      config.playState.whoseTurn = 0;
    } else if (config.cellButtons.values.seven == playerSymbol && config.cellButtons.values.five == playerSymbol && !config.cellButtons.states['sixV'] && config.playState.whoseTurn == 1) {
      document.getElementById('elem-cell-button6').value = computerSymbol;
      config.cellButtons.states['sixV'] = 1;
      config.playState.whoseTurn = 0;
    } else if (config.cellButtons.values.one == playerSymbol && config.cellButtons.values.three == playerSymbol && !config.cellButtons.states['sixV'] && config.playState.whoseTurn == 1) {
      document.getElementById('elem-cell-button6').value = computerSymbol;
      config.cellButtons.states['sixV'] = 1;
      config.playState.whoseTurn = 0;
    } else if (config.cellButtons.values.four == playerSymbol && config.cellButtons.values.six == playerSymbol && !config.cellButtons.states['oneV'] && config.playState.whoseTurn == 1) {
      document.getElementById('elem-cell-button1').value = computerSymbol;
      config.cellButtons.states['oneV'] = 1;
      config.playState.whoseTurn = 0;
    } else if (config.cellButtons.values.seven == playerSymbol && config.cellButtons.values.nine == playerSymbol && !config.cellButtons.states['twoV'] && config.playState.whoseTurn == 1) {
      document.getElementById('elem-cell-button2').value = computerSymbol;
      config.cellButtons.states['twoV'] = 1;
      config.playState.whoseTurn = 0;
    } else if (config.cellButtons.values.one == playerSymbol && config.cellButtons.values.seven == playerSymbol && !config.cellButtons.states['sixV'] && config.playState.whoseTurn == 1) {
      document.getElementById('elem-cell-button6').value = computerSymbol;
      config.cellButtons.states['sixV'] = 1;
      config.playState.whoseTurn = 0;
    } else if (config.cellButtons.values.two == playerSymbol && config.cellButtons.values.eight == playerSymbol && !config.cellButtons.states['oneV'] && config.playState.whoseTurn == 1) {
      document.getElementById('elem-cell-button1').value = computerSymbol;
      config.cellButtons.states['oneV'] = 1;
      config.playState.whoseTurn = 0;
    } else if (config.cellButtons.values.three == playerSymbol && config.cellButtons.values.nine == playerSymbol && !config.cellButtons.states['twoV'] && config.playState.whoseTurn == 1) {
      document.getElementById('elem-cell-button2').value = computerSymbol;
      config.cellButtons.states['twoV'] = 1;
      config.playState.whoseTurn = 0;
    } else if (config.cellButtons.values.one == playerSymbol && config.cellButtons.values.five == playerSymbol && !config.cellButtons.states['eightV'] && config.playState.whoseTurn == 1) {
      document.getElementById('elem-cell-button8').value = computerSymbol;
      config.cellButtons.states['eightV'] = 1;
      config.playState.whoseTurn = 0;
    } else if (config.cellButtons.values.four == playerSymbol && config.cellButtons.values.seven == playerSymbol && !config.cellButtons.states['threeV'] && config.playState.whoseTurn == 1) {
      document.getElementById('elem-cell-button3').value = computerSymbol;
      config.cellButtons.states['threeV'] = 1;
      config.playState.whoseTurn = 0;
    } else if (config.cellButtons.values.five == playerSymbol && config.cellButtons.values.eight == playerSymbol && !config.cellButtons.states['oneV'] && config.playState.whoseTurn == 1) {
      document.getElementById('elem-cell-button1').value = computerSymbol;
      config.cellButtons.states['oneV'] = 1;
      config.playState.whoseTurn = 0;
    } else if (config.cellButtons.values.six == playerSymbol && config.cellButtons.values.nine == playerSymbol && !config.cellButtons.states['sevenV'] && config.playState.whoseTurn == 1) {
      document.getElementById('elem-cell-button7').value = computerSymbol;
      config.cellButtons.states['sevenV'] = 1;
      config.playState.whoseTurn = 0;
    } else if (config.cellButtons.values.one == playerSymbol && config.cellButtons.values.four == playerSymbol && !config.cellButtons.states['threeV'] && config.playState.whoseTurn == 1) {
      document.getElementById('elem-cell-button3').value = computerSymbol;
      config.cellButtons.states['threeV'] = 1;
      config.playState.whoseTurn = 0;
    } else if (config.cellButtons.values.two == playerSymbol && config.cellButtons.values.five == playerSymbol && !config.cellButtons.states['nineV'] && config.playState.whoseTurn == 1) {
      document.getElementById('elem-cell-button9').value = computerSymbol;
      config.cellButtons.states['nineV'] = 1;
      config.playState.whoseTurn = 0;
    } else if (config.cellButtons.values.three == playerSymbol && config.cellButtons.values.six == playerSymbol && !config.cellButtons.states['twoV'] && config.playState.whoseTurn == 1) {
      document.getElementById('elem-cell-button2').value = computerSymbol;
      config.cellButtons.states['twoV'] = 1;
      config.playState.whoseTurn = 0;
    } else if (config.cellButtons.values.one == playerSymbol && config.cellButtons.values.nine == playerSymbol && !config.cellButtons.states['fourV'] && config.playState.whoseTurn == 1) {
      document.getElementById('elem-cell-button4').value = computerSymbol;
      config.cellButtons.states['fourV'] = 1;
      config.playState.whoseTurn = 0;
    } else if (config.cellButtons.values.three == playerSymbol && config.cellButtons.values.seven == playerSymbol && !config.cellButtons.states['eightV'] && config.playState.whoseTurn == 1) {
      document.getElementById('elem-cell-button8').value = computerSymbol
      config.cellButtons.states['eightV'] = 1;
      config.playState.whoseTurn = 0;
    } else {
      determineComputerMove();
    }
  }
  // default:
  if (config.cellButtons.values.one == playerSymbol && config.cellButtons.values.two == playerSymbol && !config.cellButtons.states['threeV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button3').value = computerSymbol;
    config.cellButtons.states['threeV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.two == playerSymbol && config.cellButtons.values.three == playerSymbol && !config.cellButtons.states['oneV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button1').value = computerSymbol;
    config.cellButtons.states['oneV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.four == playerSymbol && config.cellButtons.values.five == playerSymbol && !config.cellButtons.states['sixV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button6').value = computerSymbol;
    config.cellButtons.states['sixV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.five == playerSymbol && config.cellButtons.values.six == playerSymbol && !config.cellButtons.states['fourV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button4').value = computerSymbol;
    config.cellButtons.states['fourV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.seven == playerSymbol && config.cellButtons.values.eight == playerSymbol && !config.cellButtons.states['nineV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button9').value = computerSymbol;
    config.cellButtons.states['nineV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.eight == playerSymbol && config.cellButtons.values.nine == playerSymbol && !config.cellButtons.states['sevenV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button7').value = computerSymbol;
    config.cellButtons.states['sevenV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.one == playerSymbol && config.cellButtons.values.five == playerSymbol && !config.cellButtons.states['nineV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button9').value = computerSymbol;
    config.cellButtons.states['nineV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.five == playerSymbol && config.cellButtons.values.nine == playerSymbol && !config.cellButtons.states['oneV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button1').value = computerSymbol;
    config.cellButtons.states['oneV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.three == playerSymbol && config.cellButtons.values.five == playerSymbol && !config.cellButtons.states['sevenV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button7').value = computerSymbol;
    config.cellButtons.states['sevenV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.seven == playerSymbol && config.cellButtons.values.five == playerSymbol && !config.cellButtons.states['threeV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button3').value = computerSymbol;
    config.cellButtons.states['threeV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.one == playerSymbol && config.cellButtons.values.three == playerSymbol && !config.cellButtons.states['twoV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button2').value = computerSymbol;
    config.cellButtons.states['twoV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.four == playerSymbol && config.cellButtons.values.six == playerSymbol && !config.cellButtons.states['fiveV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button5').value = computerSymbol;
    config.cellButtons.states['fiveV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.seven == playerSymbol && config.cellButtons.values.nine == playerSymbol && !config.cellButtons.states['eightV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button8').value = computerSymbol;
    config.cellButtons.states['eightV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.one == playerSymbol && config.cellButtons.values.seven == playerSymbol && !config.cellButtons.states['fourV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button4').value = computerSymbol;
    config.cellButtons.states['fourV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.two == playerSymbol && config.cellButtons.values.eight == playerSymbol && !config.cellButtons.states['fiveV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button5').value = computerSymbol;
    config.cellButtons.states['fiveV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.three == playerSymbol && config.cellButtons.values.nine == playerSymbol && !config.cellButtons.states['sixV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button6').value = computerSymbol;
    config.cellButtons.states['sixV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.one == playerSymbol && config.cellButtons.values.five == playerSymbol && !config.cellButtons.states['nineV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button9').value = computerSymbol;
    config.cellButtons.states['nineV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.four == playerSymbol && config.cellButtons.values.seven == playerSymbol && !config.cellButtons.states['oneV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button1').value = computerSymbol;
    config.cellButtons.states['oneV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.five == playerSymbol && config.cellButtons.values.eight == playerSymbol && !config.cellButtons.states['twoV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button2').value = computerSymbol;
    config.cellButtons.states['twoV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.six == playerSymbol && config.cellButtons.values.nine == playerSymbol && !config.cellButtons.states['threeV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button3').value = computerSymbol;
    config.cellButtons.states['threeV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.one == playerSymbol && config.cellButtons.values.four == playerSymbol && !config.cellButtons.states['sevenV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button7').value = computerSymbol;
    config.cellButtons.states['sevenV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.two == playerSymbol && config.cellButtons.values.five == playerSymbol && !config.cellButtons.states['eightV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button8').value = computerSymbol;
    config.cellButtons.states['eightV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.three == playerSymbol && config.cellButtons.values.six == playerSymbol && !config.cellButtons.states['nineV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button9').value = computerSymbol;
    config.cellButtons.states['nineV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.one == playerSymbol && config.cellButtons.values.nine == playerSymbol && !config.cellButtons.states['fiveV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button5').value = computerSymbol;
    config.cellButtons.states['fiveV'] = 1;
    config.playState.whoseTurn = 0;
  } else if (config.cellButtons.values.three == playerSymbol && config.cellButtons.values.seven == playerSymbol && !config.cellButtons.states['fiveV'] && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button9').value = computerSymbol
    config.cellButtons.states['fiveV'] = 1;
    config.playState.whoseTurn = 0;
  } else {
    determineComputerMove();
  }
  checkForLoss();
  //
  playerTurnChangeAnimation({
    elem: elemOutputTurn,
    message: config.onePlayer ? uiLabels.userFeedback.turn.player : uiLabels.userFeedback.turn.playerOne,
    fadeState: {
      begin: 0,
      end: 1,
      len: config.animations.speedSettings.quick
    }
  });
};
/* :
**********************************************************************/
function determineComputerMove() {
  getCellButtons();
  if (document.getElementById('elem-cell-button5').value == config.symbols.empty && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button5').value = computerSymbol;
    config.playState.whoseTurn = 0;
    config.cellButtons.states['fiveV'] = 1;
  } else if (document.getElementById('elem-cell-button1').value == config.symbols.empty && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button1').value = computerSymbol;
    config.playState.whoseTurn = 0;
    config.cellButtons.states['oneV'] = 1;
  } else if (document.getElementById('elem-cell-button9').value == config.symbols.empty && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button9').value = computerSymbol;
    config.playState.whoseTurn = 0;
    config.cellButtons.states['nineV'] = 1;
  } else if (document.getElementById('elem-cell-button6').value == config.symbols.empty && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button6').value = computerSymbol;
    config.playState.whoseTurn = 0;
    config.cellButtons.states['sixV'] = 1;
  } else if (document.getElementById('elem-cell-button2').value == config.symbols.empty && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button2').value = computerSymbol;
    config.playState.whoseTurn = 0;
    config.cellButtons.states['twoV'] = 1;
  } else if (document.getElementById('elem-cell-button8').value == config.symbols.empty && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button8').value = computerSymbol;
    config.playState.whoseTurn = 0;
    config.cellButtons.states['eightV'] = 1;
  } else if (document.getElementById('elem-cell-button3').value == config.symbols.empty && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button3').value = computerSymbol;
    config.playState.whoseTurn = 0;
    config.cellButtons.states['threeV'] = 1;
  } else if (document.getElementById('elem-cell-button7').value == config.symbols.empty && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button7').value = computerSymbol;
    config.playState.whoseTurn = 0;
    config.cellButtons.states['sevenV'] = 1;
  } else if (document.getElementById('elem-cell-button4').value == config.symbols.empty && config.playState.whoseTurn == 1) {
    document.getElementById('elem-cell-button4').value = computerSymbol;
    config.playState.whoseTurn = 0;
    config.cellButtons.states['fourV'] = 1;
  }
  checkForLoss();
};
/* ( x ) Reset the game and all values:
 **********************************************************************/
function resetGame() {
  //
  visuals.removeFeedbackClasses();
  config.animations.playerTurnChangeTimeLength = 600;
  //
  for (var i = 1; i <= 9; i++) document.getElementById('elem-cell-button' + i).value = config.symbols.empty;
  //
  setCellButtons();
  getCellButtons();
  disableAllCellButtons(false);
  config.playState.whoseTurn = 0;
  movesMade = 0;
  //
  playerTurnChangeAnimation({
    elem: elemOutputTurn,
    message: config.onePlayer ? uiLabels.userFeedback.turn.player : uiLabels.userFeedback.turn.playerOne,
    fadeState: {
      begin: 0,
      end: 1,
      len: config.animations.speedSettings.quick
    }
  });
  config.playState.playerInteractionEnabled = true;
};
/* :
***************************************************************************/
var Element = {
  init: function(o) {
    this.element = document.createElement(o.el);
    if (o.id) this.element.id = o.id;
    if (o.type) this.element.type = o.type;
    if (o.value) this.element.value = o.value;
    if (o.className) this.element.className = o.className;
    if (o.appendTo) this.element.appendTo = o.appendTo;
    if (o.innerHTML) this.element.innerHTML = o.innerHTML;
    if (o.src) this.element.src = o.src;
    return this.element;
  },
  appendTo: function(el) {
    document.getElementById(el).appendChild(this.element);
  }
};
/* :
***************************************************************************/
function ConstructElement(o) {
  var obj = Object.create(Element);
  obj.init(o);
  o.appendTo !== document.body ? obj.appendTo(obj.element.appendTo) : document.body.appendChild(obj.init(o));
}
/* :
**********************************************************************/
function ConstructCellButton(o) {
  ConstructElement({ el: 'input', type: 'button', id: o.idVal, value: config.symbols.empty, className: o.classVal, appendTo: config.cellButtons.ids[o.indexVal] });
  document.getElementById(o.idVal).onclick = function() { eval(o.clickVal); }
};
/* :
 **********************************************************************/
var CreateAudio = (function() {
  var audio, audioElement, ConstructAudioHelper, sourceMp3, sourceOgg, directory = config.sounds.directory;
  var audios = {
    Construct: {
      audioElement: function(o) {
        audio = document.createElement('audio');
        audio.id = o.id;
        if (o.loop) audio.loop = 'loop';
        document.body.appendChild(audio);
        audios.Construct.sourceElement.mp3(o);
        audios.Construct.sourceElement.ogg(o);
      },
      sourceElement: {
        mp3: function(o) {
          sourceMp3 = document.createElement('source');
          sourceMp3.src = o.source.mp3.src;
          sourceMp3.type = o.source.mp3.type;
        },
        ogg: function(o) {
          sourceOgg = document.createElement('source');
          sourceOgg.src = o.source.ogg.src;
          sourceOgg.type = o.source.ogg.type;
          audios.Construct.addSources(o);
        }
      },
      addSources: function(o) {
        audioElement = document.getElementById(o.id);
        audioElement.appendChild(sourceMp3);
        audioElement.appendChild(sourceOgg);
        audioElement.appendChild(document.createTextNode(o.notSupported));
      }
    }
  };
  ConstructAudioHelper = function ConstructAudioHelper(element, url, loop) {
    audios.Construct.audioElement({
      id: element,
      source: {
        mp3: {
          src: url + '.mp3',
          type: 'audio/mpeg'
        },
        ogg: {
          src: url + '.ogg',
          type: 'audio/ogg'
        }
      },
      loop: loop,
      notSupported: 'Your browser does not support the audio element'
    });
  };
  // Construct audio from the following files in the 'sounds' directory:
  for (var i = 0; i < config.sounds.files.length; i++) {
    ConstructAudioHelper(config.sounds.files[i], directory + config.sounds.files[i]);
  }
});
/* :
 **********************************************************************/
var grid = {
  create: function() { ConstructElement({ el: 'table', id: 'elem-grid', className: 'elem-grid', appendTo: 'elem-container' }); },
  populate: function() {
    for (var i = 0; i < 3; i++) {
      var row = document.getElementById('elem-grid').insertRow();
      for (var j = 0; j < 3; j++) {
        cellName = 'r' + (i + 1) + 'c' + (j + 1);
        col = row.insertCell();
        col.innerHTML = '<div class="elem-grid-cell" id="' + cellName + '">' + '&nbsp;' + '</div>';
        config.cellButtons.ids.push(cellName);
      }
    }
  }
};
/* :
 **********************************************************************/
function getCurrentSymbol() {
  if (config.playState.whoseTurn == 0) {
    config.playState.whoseTurn = 1;
    playerTurnChangeAnimation({
      elem: elemOutputTurn,
      colVal: styles.turn.player,
      message: uiLabels.userFeedback.turn.playerTwo,
      fadeState: {
        begin: 0,
        end: 1,
        len: config.animations.speedSettings.quick
      }
    });
    return playerSymbol;
  } else {
    config.playState.whoseTurn = 0;
    playerTurnChangeAnimation({
      elem: elemOutputTurn,
      colVal: styles.turn.player,
      message: uiLabels.userFeedback.turn.playerOne,
      fadeState: {
        begin: 0,
        end: 1,
        len: config.animations.speedSettings.quick
      }
    });
    return computerSymbol;
  }
}
/* :
**********************************************************************/
var gridCellButtons = {
  generate: function() {
    for (var i = 0; i < 9; i++) {
      config.cellButtons.arr.push({
        nameVal: 'elem-cell-button' + (i + 1),
        classVal: 'elem-cell-button',
        valueVal: config.symbols.X,
        clickVal: `
        //Change to es5:
        win = false;
        if (config.playState.playerInteractionEnabled) {
          config.playState.playerInteractionEnabled = false;
          if (document.getElementById('elem-cell-button${i + 1}').value == playerSymbol || document.getElementById('elem-cell-button${i + 1}').value == computerSymbol) {
            document.getElementById('wrong').play();
          }
          if (document.getElementById('elem-cell-button${i + 1}').value == "${config.symbols.empty}") {
            document.getElementById('elem-cell-button${i + 1}').value = getCurrentSymbol();
            //config.playState.whoseTurn = 1;
            config.cellButtons.states.${uiLabels.numbersLibrary[i]}V = 1;
            getCellButtons();
            checkForRow();
          } else if (document.getElementById('elem-cell-button${i + 1}').value == "${config.symbols.empty}") {
            document.getElementById('elem-cell-button${i + 1}').value = getCurrentSymbol();
            //config.playState.whoseTurn = 0;
            config.cellButtons.states.${uiLabels.numbersLibrary[i]}V = 1;
            getCellButtons();
            //player1Check();
          } else if (document.getElementById('elem-cell-button${i + 1}').value == "${config.symbols.empty}") {
            document.getElementById('elem-cell-button${i + 1}').value = "' + getCurrentSymbol() + '";
            config.cellButtons.states.${uiLabels.numbersLibrary[i]}V = 1;
            //config.playState.whoseTurn = 1; 
            getCellButtons(); 
            //player1Check()
          }
          setTimeout(function() {
            config.playState.playerInteractionEnabled = true;
          }, config.animations.playerTurnChangeTimeLength + 200);
          checkForDraw();
          document.getElementById('click_04').play();
        }
        `
      });
    }
  },
  construct: function() {
    for (var i = 0; i < config.cellButtons.arr.length; i++) {
      //console.log(cellButtons)
      ConstructCellButton({
        indexVal: i,
        nameVal: config.cellButtons.arr[i].nameVal,
        idVal: config.cellButtons.arr[i].nameVal,
        classVal: config.cellButtons.arr[i].classVal,
        valueVal: config.cellButtons.arr[i].valueVal,
        clickVal: config.cellButtons.arr[i].clickVal
      });
    }
  }
};
/* :
 **********************************************************************/
var titleScreen = {
  constructElements: function() {
    ConstructElement({ el: 'div', id: 'elem-div-titlescreen-container', className: 'elem-div-titlescreen-container col-lg-4 col-lg-offset-4 col-md-4 col-md-offset-4 col-sm-6 col-sm-offset-3 col-xs-10 col-xs-offset-1', appendTo: 'elem-container' });
    ConstructElement({ el: 'br', id: '', className: '', innerHTML: '', appendTo: 'elem-div-titlescreen-container' });
    ConstructElement({ el: 'div', id: 'elem-div-titlescreen-input-users', className: 'elem-div-titlescreen-input-users', innerHTML: '', appendTo: 'elem-div-titlescreen-container' });
    ConstructElement({ el: 'table', id: 'elem-tb-menu-btns', className: 'elem-tb-menu-btns', innerHTML: '', appendTo: 'elem-div-titlescreen-input-users' });
    for (var i = 0; i < uiLabels.menuButtons.length; i++) {
      ConstructElement({ el: 'tr', id: 'elem-tb-menu-btns-tr-' + (i + 1), className: '', innerHTML: '', appendTo: 'elem-tb-menu-btns' });
      ConstructElement({ el: 'td', id: 'elem-td-menu-btn-' + (i + 1), className: 'elem-td-menu-btn', innerHTML: '', appendTo: 'elem-tb-menu-btns-tr-' + (i + 1) });
      ConstructElement({ el: 'button', id: 'elem-titlescreen-menu-btn-' + uiLabels.menuButtons[i][1].toLowerCase(), className: 'elem-titlescreen-menu-btn-' + uiLabels.menuButtons[i][0].toLowerCase() + ' elem-titlescreen-menu-btn btn btn-block', innerHTML: uiLabels.menuButtons[i][0], appendTo: 'elem-td-menu-btn-' + (i + 1) });
    }
    for (var j = 0; j < 6; j++) ConstructElement({ el: 'br', id: '', className: '', innerHTML: '', appendTo: 'elem-div-titlescreen-container' });
    ConstructElement({ el: 'p', id: '', className: 'elem-p-footer', innerHTML: 'Made by John for <a href="#">FreeCodeCamp</a>', appendTo: 'elem-div-titlescreen-container' });
  },
  createEventListeners: function() {
    document.getElementById('elem-titlescreen-menu-btn-start').onclick = function() {
      config.onePlayer = true;
      init.main();
    }
    document.getElementById('elem-titlescreen-menu-btn-start').onmouseover = function() { document.getElementById('click_04').play();}
    document.getElementById('elem-titlescreen-menu-btn-channels').onmouseover = function() { document.getElementById('click_04').play(); }
    document.getElementById('elem-titlescreen-menu-btn-channels').onclick = function() { 
      config.onePlayer = false;
      init.main();
    }
  }
};
var titleIntervals = {
  interval1: null,
  timeout1: null,
  timeout2: null,
  timeout3: null,
  timeout4: null
}
var titleOriginal = elemOutputTurn.innerHTML;
function titleScreenAnimate() {
  titleIntervals.interval1 = setInterval(function() {
    clearInterval(titleIntervals.timeout1);
    clearInterval(titleIntervals.timeout2);
    // change to class:
    elemOutputTurn.style.fontFamily = 'Cutive Mono, monospace';
    var titleToArr = titleOriginal.split('');
    var symbols = [config.symbols.X.trim(), config.symbols.O.trim()];
    titleToArr[Math.floor(Math.random() * titleToArr.length)] = symbols[Math.floor(Math.random() * symbols.length)];
    elemOutputTurn.innerHTML = titleToArr.join('');
    visuals.addAndThenRemoveClass({ element: '#elem-output-turn', class: 'animated pulse', timeout: 1000 });
  }, 200);
}
var titleScreenAnimations = {
  regularText: function() {
    elemOutputTurn.style.fontFamily = 'Montserrat, sans-serif';
    visuals.addAndThenRemoveClass({ element: '#elem-output-turn', class: 'animated pulse', timeout: 1000 });
    elemOutputTurn.innerHTML = titleOriginal;
  },
  animatedText: function() {
  }
}
/* :
 **********************************************************************/
var init = {
  titleScreen: function() {
    CreateAudio();
    titleScreen.constructElements();
    titleScreen.createEventListeners();
    visuals.addAndThenRemoveClass({ element: '#elem-output-turn', class: 'animated flip', timeout: 1000 });
    visuals.addAndThenRemoveClass({ element: '#elem-titlescreen-menu-btn-start', class: 'animated slideInLeft', timeout: 1000 });
    visuals.addAndThenRemoveClass({ element: '#elem-titlescreen-menu-btn-channels', class: 'animated slideInRight', timeout: 1000 });
    //titleIntervals.timeout3 = setTimeout(function() { titleScreenAnimate(); }, 4000);
    /*
    titleIntervals.timeout4 = setTimeout(function() {
      clearInterval(titleIntervals.interval1);
      elemOutputTurn.style.fontFamily = 'Montserrat, sans-serif';
      visuals.addAndThenRemoveClass({ element: '#elem-output-turn', class: 'animated pulse', timeout: 1000 });
      elemOutputTurn.innerHTML = titleOriginal;
      clearInterval(titleIntervals.interval4);
      titleIntervals.timeout2 = setTimeout(function() { titleScreenAnimate(); }, 5000);
    }, 10000);
    */
  },
  main: function() {
    updateElemScore();
    elemOutputTurn.style.fontFamily = 'Montserrat, sans-serif';
    clearInterval(titleIntervals.interval1);
    clearInterval(titleIntervals.timeout1);
    clearInterval(titleIntervals.timeout2);
    clearInterval(titleIntervals.timeout3);
    clearInterval(titleIntervals.timeout4);
    promptPlayerToChooseSymbol();
    promptPlayerToChooseNames();
    elemOutputFeedback.innerHTML = '<br/>';
    document.getElementById('elem-div-titlescreen-container').remove();
    gridCellButtons.generate();
    grid.create();
    grid.populate();
    gridCellButtons.construct();
    visuals.createBorders();
    playerTurnChangeAnimation({
      elem: elemOutputTurn,
      colVal: styles.turn.player,
      message: config.onePlayer ? uiLabels.userFeedback.turn.player : uiLabels.userFeedback.turn.playerOne,
      fadeState: {
        begin: 0,
        end: 1,
        len: config.animations.speedSettings.quick
      }
    });
    /*
    *********************************************************************/
    $(elemChangeSymbolBtn).click(function() {
      resetGame();
      promptPlayerToChooseSymbol();
    });
    $(elemRestartBtn).click(function() {
      resetGame();
    });
    $(elemShareBtn).click(function() {
      alert(config.systemMsg.shareFunc)
    });
  }
};
init.titleScreen();
