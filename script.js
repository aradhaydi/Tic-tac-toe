
/**
 * Tic-Tac-Toe Game with AI, Local Multiplayer, and PWA Support
 */

// Game state
const gameState = {
  currentPlayer: 'x',
  board: Array(9).fill(''),
  gameMode: null, // 'ai' or 'player'
  aiDifficulty: 'medium',
  gameActive: false,
  scores: {
    x: 0,
    o: 0,
    tie: 0
  },
  winningCombos: [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ],
  autoSaveKey: 'tictactoe_saved_game',
  settingsKey: 'tictactoe_settings',
  leaderboardKey: 'tictactoe_leaderboard'
};

// Settings
const settings = {
  soundEnabled: true,
  musicEnabled: true,
  aiDifficulty: 'medium',
  darkMode: true,
  xColor: '#3498db',
  oColor: '#e74c3c',
  gridColor: '#95a5a6'
};

// Simplified audio system for better reliability
let audioInitialized = false;

// Audio elements with better handling
const sounds = {
  click: null,
  win: null,
  lose: null,
  tie: null,
  bgMusic: null
};

// Audio file paths with version parameters to prevent caching issues
const soundPaths = {
  click: 'sounds/click.mp3?v=1',
  win: 'sounds/win.mp3?v=1',
  lose: 'sounds/lose.mp3?v=1',
  tie: 'sounds/tie.mp3?v=1',
  bgMusic: 'sounds/background.mp3?v=1'
};

// Function to initialize audio system
function initAudio() {
  if (audioInitialized) return;
  
  try {
    // Create audio elements with proper settings
    sounds.click = createAudio(soundPaths.click);
    sounds.win = createAudio(soundPaths.win);
    sounds.lose = createAudio(soundPaths.lose);
    sounds.tie = createAudio(soundPaths.tie);
    sounds.bgMusic = createAudio(soundPaths.bgMusic, true);
    
    // Preload all sounds
    preloadSounds();
    
    audioInitialized = true;
    console.log("Audio system initialized successfully");
  } catch (e) {
    console.error("Audio system failed to initialize:", e);
  }
}

// Helper function to create audio elements with proper settings
function createAudio(src, isMusic = false) {
  const audio = new Audio();
  audio.src = src;
  audio.preload = 'auto';
  
  if (isMusic) {
    audio.loop = true;
    audio.volume = 0.3;
  } else {
    audio.volume = 0.7;
  }
  
  // Add error handling
  audio.onerror = (e) => {
    console.error(`Error loading audio file: ${src}`, e);
  };
  
  return audio;
}

// Preload all sounds
function preloadSounds() {
  Object.entries(soundPaths).forEach(([key, path]) => {
    // Create new audio elements for preloading
    const preloadAudio = new Audio();
    preloadAudio.src = path;
    preloadAudio.preload = 'auto';
    
    // Add load event to confirm successful loading
    preloadAudio.addEventListener('canplaythrough', () => {
      console.log(`Sound ${key} preloaded successfully`);
    }, { once: true });
    
    // Add error handling
    preloadAudio.onerror = (e) => {
      console.error(`Error preloading sound ${key}:`, e);
    };
  });
}

// DOM Elements
const elements = {
  screens: {
    gameSelection: document.getElementById('game-selection'),
    aiDifficulty: document.getElementById('ai-difficulty'),
    gameBoard: document.getElementById('game-board'),
    leaderboard: document.getElementById('leaderboard')
  },
  buttons: {
    vsAI: document.getElementById('vs-ai'),
    vsPlayer: document.getElementById('vs-player'),
    easy: document.getElementById('easy'),
    medium: document.getElementById('medium'),
    hard: document.getElementById('hard'),
    backFromDifficulty: document.getElementById('back-from-difficulty'),
    resetGame: document.getElementById('reset-game'),
    backToMenu: document.getElementById('back-to-menu'),
    showLeaderboard: document.getElementById('show-leaderboard'),
    backFromLeaderboard: document.getElementById('back-from-leaderboard'),
    settings: document.getElementById('settings-btn'),
    closeSettings: document.getElementById('close-settings'),
    resetSettings: document.getElementById('reset-settings'),
    themeToggle: document.getElementById('theme-toggle'),
    musicToggle: document.getElementById('music-toggle'),
    playAgain: document.getElementById('play-again'),
    backToMain: document.getElementById('back-to-main')
  },
  game: {
    cells: document.querySelectorAll('.cell'),
    currentPlayer: document.getElementById('current-player'),
    board: document.querySelector('.board'),
    scoreX: document.getElementById('score-x'),
    scoreO: document.getElementById('score-o'),
    scoreTie: document.getElementById('score-tie')
  },
  modals: {
    settings: document.getElementById('settings-modal'),
    gameResult: document.getElementById('game-result')
  },
  settings: {
    soundToggle: document.getElementById('sound-toggle'),
    musicToggle: document.getElementById('music-toggle-setting'),
    aiDifficultySelect: document.getElementById('ai-difficulty-setting'),
    themeToggle: document.getElementById('theme-toggle-setting'),
    xColor: document.getElementById('x-color'),
    oColor: document.getElementById('o-color'),
    gridColor: document.getElementById('grid-color')
  },
  result: {
    message: document.getElementById('result-message'),
    details: document.getElementById('result-details'),
    confettiContainer: document.getElementById('confetti-container')
  },
  leaderboard: {
    table: document.getElementById('leaderboard-table'),
    body: document.getElementById('leaderboard-body')
  },
  splashScreen: document.getElementById('splash-screen')
};

// ==========================================================
// Initialization
// ==========================================================

// Initialize the game
function init() {
  // Hide splash screen after animation completes
  setTimeout(() => {
    elements.splashScreen.classList.add('hidden');
    setTimeout(() => {
      elements.splashScreen.style.display = 'none';
    }, 500);
  }, 2000);

  // Load settings
  loadSettings();
  
  // Apply current settings
  applySettings();
  
  // Load any saved game
  loadGame();
  
  // Update the UI to match the current state
  updateScoreDisplay();
  
  // Initialize audio system
  initAudio();
  
  // Add event listeners
  addEventListeners();

  // Initialize leaderboard
  initLeaderboard();
  
  // Try to unlock audio context for browsers with autoplay restrictions
  unlockAudioContext();
  
  // Make sure settings form reflects current settings
  syncSettingsFormWithState();
  
  // Add a listener for visibility changes to handle audio properly
  document.addEventListener('visibilitychange', handleVisibilityChange);
}

// Handle page visibility changes
function handleVisibilityChange() {
  if (document.hidden) {
    // Page is hidden, pause background music
    if (sounds.bgMusic && !sounds.bgMusic.paused) {
      sounds.bgMusic.pause();
    }
  } else {
    // Page is visible again, resume background music if enabled
    if (settings.musicEnabled) {
      setTimeout(() => toggleBackgroundMusic(), 300);
    }
  }
}

// Sync settings form elements with the current settings state
function syncSettingsFormWithState() {
  // Update checkboxes and selects to match current settings
  elements.settings.soundToggle.checked = settings.soundEnabled;
  elements.settings.musicToggle.checked = settings.musicEnabled;
  elements.settings.themeToggle.checked = settings.darkMode;
  elements.settings.aiDifficultySelect.value = settings.aiDifficulty;
  
  // Update color inputs
  elements.settings.xColor.value = settings.xColor;
  elements.settings.oColor.value = settings.oColor;
  elements.settings.gridColor.value = settings.gridColor;
}

// ==========================================================
// Event Listeners
// ==========================================================

function addEventListeners() {
  // Game mode selection
  elements.buttons.vsAI.addEventListener('click', () => {
    gameState.gameMode = 'ai';
    showScreen('aiDifficulty');
    playSound('click');
  });
  
  elements.buttons.vsPlayer.addEventListener('click', () => {
    gameState.gameMode = 'player';
    startNewGame();
    showScreen('gameBoard');
    playSound('click');
  });
  
  // AI difficulty selection
  elements.buttons.easy.addEventListener('click', () => {
    gameState.aiDifficulty = 'easy';
    settings.aiDifficulty = 'easy';
    startNewGame();
    showScreen('gameBoard');
    saveSettings();
    playSound('click');
  });
  
  elements.buttons.medium.addEventListener('click', () => {
    gameState.aiDifficulty = 'medium';
    settings.aiDifficulty = 'medium';
    startNewGame();
    showScreen('gameBoard');
    saveSettings();
    playSound('click');
  });
  
  elements.buttons.hard.addEventListener('click', () => {
    gameState.aiDifficulty = 'hard';
    settings.aiDifficulty = 'hard';
    startNewGame();
    showScreen('gameBoard');
    saveSettings();
    playSound('click');
  });
  
  // Navigation buttons
  elements.buttons.backFromDifficulty.addEventListener('click', () => {
    showScreen('gameSelection');
    playSound('click');
  });
  
  elements.buttons.resetGame.addEventListener('click', () => {
    startNewGame();
    playSound('click');
  });
  
  elements.buttons.backToMenu.addEventListener('click', () => {
    showScreen('gameSelection');
    playSound('click');
  });
  
  // Leaderboard buttons
  elements.buttons.showLeaderboard.addEventListener('click', () => {
    showScreen('leaderboard');
    updateLeaderboard();
    playSound('click');
  });
  
  elements.buttons.backFromLeaderboard.addEventListener('click', () => {
    showScreen('gameSelection');
    playSound('click');
  });
  
  // Game cells
  elements.game.cells.forEach(cell => {
    cell.addEventListener('click', () => {
      const index = cell.getAttribute('data-index');
      if (gameState.board[index] === '' && gameState.gameActive) {
        makeMove(index);
      }
    });
  });
  
  // Settings buttons
  elements.buttons.settings.addEventListener('click', () => {
    // Make sure settings form reflects current settings before showing
    syncSettingsFormWithState();
    elements.modals.settings.classList.add('active');
    playSound('click');
  });
  
  elements.buttons.closeSettings.addEventListener('click', () => {
    elements.modals.settings.classList.remove('active');
    playSound('click');
  });
  
  // Theme toggle button in header
  elements.buttons.themeToggle.addEventListener('click', () => {
    settings.darkMode = !settings.darkMode;
    applyTheme();
    saveSettings();
    
    // Update both button icon and settings form
    elements.buttons.themeToggle.innerHTML = settings.darkMode 
      ? '<i class="fas fa-moon"></i>' 
      : '<i class="fas fa-sun"></i>';
    elements.settings.themeToggle.checked = settings.darkMode;
    
    playSound('click');
  });
  
  // Music toggle button in header
  elements.buttons.musicToggle.addEventListener('click', () => {
    settings.musicEnabled = !settings.musicEnabled;
    
    // Update button icon
    elements.buttons.musicToggle.innerHTML = settings.musicEnabled 
      ? '<i class="fas fa-music"></i>' 
      : '<i class="fas fa-volume-mute"></i>';
    
    // Update settings form to keep in sync
    elements.settings.musicToggle.checked = settings.musicEnabled;
    
    // Toggle background music
    toggleBackgroundMusic();
    saveSettings();
    
    // Play sound for feedback
    playSound('click');
  });
  
  // Sound toggle in settings form
  elements.settings.soundToggle.addEventListener('change', () => {
    settings.soundEnabled = elements.settings.soundToggle.checked;
    saveSettings();
    
    // Play a sound to demonstrate sound is enabled (if it was just enabled)
    if (settings.soundEnabled) {
      setTimeout(() => playSound('click'), 100);
    }
  });
  
  // Music toggle in settings form
  elements.settings.musicToggle.addEventListener('change', () => {
    settings.musicEnabled = elements.settings.musicToggle.checked;
    
    // Update button icon to match setting
    elements.buttons.musicToggle.innerHTML = settings.musicEnabled 
      ? '<i class="fas fa-music"></i>' 
      : '<i class="fas fa-volume-mute"></i>';
    
    // Save settings
    saveSettings();
    
    // Toggle background music
    setTimeout(() => toggleBackgroundMusic(), 100);
    
    // Play a sound for feedback
    if (settings.soundEnabled) {
      setTimeout(() => playSound('click'), 200);
    }
  });
  
  elements.settings.aiDifficultySelect.addEventListener('change', () => {
    settings.aiDifficulty = elements.settings.aiDifficultySelect.value;
    gameState.aiDifficulty = settings.aiDifficulty;
    saveSettings();
    playSound('click');
  });
  
  elements.settings.themeToggle.addEventListener('click', () => {
    settings.darkMode = elements.settings.themeToggle.checked;
    applyTheme();
    saveSettings();
    
    // Update button icon
    elements.buttons.themeToggle.innerHTML = settings.darkMode 
      ? '<i class="fas fa-moon"></i>' 
      : '<i class="fas fa-sun"></i>';
    
    playSound('click');
  });
  
  // Color pickers
  elements.settings.xColor.addEventListener('change', () => {
    settings.xColor = elements.settings.xColor.value;
    document.documentElement.style.setProperty('--x-color', settings.xColor);
    saveSettings();
  });
  
  elements.settings.oColor.addEventListener('change', () => {
    settings.oColor = elements.settings.oColor.value;
    document.documentElement.style.setProperty('--o-color', settings.oColor);
    saveSettings();
  });
  
  elements.settings.gridColor.addEventListener('change', () => {
    settings.gridColor = elements.settings.gridColor.value;
    document.documentElement.style.setProperty('--grid-color', settings.gridColor);
    saveSettings();
  });
  
  // Reset settings button
  elements.buttons.resetSettings.addEventListener('click', () => {
    resetSettings();
    playSound('click');
  });
  
  // Game result modal buttons
  elements.buttons.playAgain.addEventListener('click', () => {
    elements.modals.gameResult.classList.remove('active');
    startNewGame();
    playSound('click');
  });
  
  elements.buttons.backToMain.addEventListener('click', () => {
    elements.modals.gameResult.classList.remove('active');
    showScreen('gameSelection');
    playSound('click');
  });
  
  // Handle outside clicks on modals
  window.addEventListener('click', (e) => {
    if (e.target === elements.modals.settings) {
      elements.modals.settings.classList.remove('active');
    }
  });
}

// ==========================================================
// Game Logic
// ==========================================================

// Start a new game
function startNewGame() {
  gameState.board = Array(9).fill('');
  gameState.currentPlayer = 'x';
  gameState.gameActive = true;
  
  // Clear the board
  elements.game.cells.forEach(cell => {
    cell.className = 'cell';
    cell.innerHTML = '';
  });
  
  // Remove any win line
  const winLine = document.querySelector('.win-line');
  if (winLine) {
    winLine.remove();
  }
  
  // Update player turn display
  updatePlayerTurn();
  
  // Save the game state
  saveGame();
  
  // If AI goes first, make AI move
  if (gameState.gameMode === 'ai' && gameState.currentPlayer === 'o') {
    setTimeout(makeAIMove, 700);
  }
}

// Make a move
function makeMove(index) {
  // Exit if the cell is already taken or game is not active
  if (gameState.board[index] !== '' || !gameState.gameActive) return;
  
  // Update the board
  gameState.board[index] = gameState.currentPlayer;
  
  // Update the UI
  const cell = elements.game.cells[index];
  cell.classList.add(gameState.currentPlayer);
  
  // Play sound
  playSound('click');
  
  // Check for win or tie
  if (checkWin()) {
    endGame(false);
  } else if (isBoardFull()) {
    endGame(true);
  } else {
    // Switch player
    gameState.currentPlayer = gameState.currentPlayer === 'x' ? 'o' : 'x';
    updatePlayerTurn();
    
    // Save the game state
    saveGame();
    
    // If it's AI's turn, make AI move
    if (gameState.gameMode === 'ai' && gameState.currentPlayer === 'o') {
      setTimeout(makeAIMove, 700);
    }
  }
}

// Make AI move
function makeAIMove() {
  if (!gameState.gameActive) return;
  
  let index;
  
  switch (gameState.aiDifficulty) {
    case 'easy':
      index = makeRandomMove();
      break;
    case 'medium':
      // 70% chance of smart move, 30% random
      index = Math.random() < 0.7 ? makeBestMove() : makeRandomMove();
      break;
    case 'hard':
      index = makeBestMove();
      break;
    default:
      index = makeRandomMove();
  }
  
  makeMove(index);
}

// Make a random move
function makeRandomMove() {
  const availableMoves = [];
  gameState.board.forEach((cell, index) => {
    if (cell === '') {
      availableMoves.push(index);
    }
  });
  
  const randomIndex = Math.floor(Math.random() * availableMoves.length);
  return availableMoves[randomIndex];
}

// Make the best move using the minimax algorithm
function makeBestMove() {
  let bestScore = -Infinity;
  let bestMove;
  
  // Try each available move
  for (let i = 0; i < gameState.board.length; i++) {
    if (gameState.board[i] === '') {
      // Make a temporary move
      gameState.board[i] = 'o';
      
      // Calculate score for this move
      const score = minimax(gameState.board, 0, false);
      
      // Undo the move
      gameState.board[i] = '';
      
      // Update best score and move
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  
  return bestMove;
}

// Minimax algorithm for AI
function minimax(board, depth, isMaximizing) {
  // Check for terminal states
  const winner = getWinner(board);
  
  if (winner === 'o') return 10 - depth;
  if (winner === 'x') return depth - 10;
  if (isBoardFullMinimax(board)) return 0;
  
  if (isMaximizing) {
    let bestScore = -Infinity;
    
    for (let i = 0; i < board.length; i++) {
      if (board[i] === '') {
        board[i] = 'o';
        const score = minimax(board, depth + 1, false);
        board[i] = '';
        bestScore = Math.max(score, bestScore);
      }
    }
    
    return bestScore;
  } else {
    let bestScore = Infinity;
    
    for (let i = 0; i < board.length; i++) {
      if (board[i] === '') {
        board[i] = 'x';
        const score = minimax(board, depth + 1, true);
        board[i] = '';
        bestScore = Math.min(score, bestScore);
      }
    }
    
    return bestScore;
  }
}

// Check if the board is full (for minimax)
function isBoardFullMinimax(board) {
  return board.every(cell => cell !== '');
}

// Get winner (for minimax)
function getWinner(board) {
  // Check for a win
  for (const combo of gameState.winningCombos) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  
  return null;
}

// Check for a win
function checkWin() {
  for (const combo of gameState.winningCombos) {
    const [a, b, c] = combo;
    if (gameState.board[a] && gameState.board[a] === gameState.board[b] && gameState.board[a] === gameState.board[c]) {
      drawWinLine(combo);
      return true;
    }
  }
  
  return false;
}

// Draw the win line
function drawWinLine(combo) {
  const [a, b, c] = combo;
  const lineClassName = getLineClassName(combo);
  
  const winLine = document.createElement('div');
  winLine.classList.add('win-line', lineClassName);
  elements.game.board.appendChild(winLine);
  
  // Set line positions based on the winning combo
  if (lineClassName === 'horizontal') {
    const row = Math.floor(a / 3);
    winLine.style.top = `calc(${row * 33.33}% + ${33.33 / 2}%)`;
    winLine.style.animation = 'win-line-animation 0.5s ease forwards';
  } else if (lineClassName === 'vertical') {
    const col = a % 3;
    winLine.style.left = `calc(${col * 33.33}% + ${33.33 / 2}%)`;
    winLine.style.animation = 'win-line-animation-vertical 0.5s ease forwards';
  } else if (lineClassName === 'diagonal-1') {
    winLine.style.width = '141%'; // sqrt(2) * 100%
    winLine.style.animation = 'win-line-animation 0.5s ease forwards';
  } else if (lineClassName === 'diagonal-2') {
    winLine.style.width = '141%'; // sqrt(2) * 100%
    winLine.style.animation = 'win-line-animation 0.5s ease forwards';
  }
}

// Get the CSS class for the win line
function getLineClassName(combo) {
  const [a, b, c] = combo;
  
  // Check for horizontal line
  if (Math.floor(a / 3) === Math.floor(b / 3) && Math.floor(a / 3) === Math.floor(c / 3)) {
    return 'horizontal';
  }
  
  // Check for vertical line
  if (a % 3 === b % 3 && a % 3 === c % 3) {
    return 'vertical';
  }
  
  // Check for diagonal lines
  if ((a === 0 && b === 4 && c === 8) || (a === 4 && b === 8 && c === 0) || (a === 8 && b === 4 && c === 0)) {
    return 'diagonal-1';
  }
  
  return 'diagonal-2';
}

// Check if the board is full
function isBoardFull() {
  return gameState.board.every(cell => cell !== '');
}

// End the game
function endGame(isTie) {
  gameState.gameActive = false;
  
  if (isTie) {
    gameState.scores.tie++;
    playSound('tie');
    showResult('It\'s a Tie!', 'The game ended in a draw.', false);
  } else {
    const winner = gameState.currentPlayer;
    gameState.scores[winner]++;
    
    if (winner === 'x') {
      playSound('win');
      
      let resultDetails = 'Player X wins the game!';
      if (gameState.gameMode === 'ai') {
        resultDetails = `You beat the AI on ${gameState.aiDifficulty} difficulty!`;
      }
      
      showResult('You Win!', resultDetails, true);
    } else {
      playSound('lose');
      
      let resultDetails = 'Player O wins the game!';
      if (gameState.gameMode === 'ai') {
        resultDetails = `The AI (${gameState.aiDifficulty} difficulty) wins this round.`;
      }
      
      showResult('You Lose!', resultDetails, false);
    }
    
    // Update leaderboard
    updatePlayerStats(winner);
  }
  
  // Update scores display
  updateScoreDisplay();
  
  // Save game state
  saveGame();
}

// ==========================================================
// UI Updates
// ==========================================================

// Show a specific screen
function showScreen(screenName) {
  // Hide all screens
  Object.values(elements.screens).forEach(screen => {
    screen.classList.remove('active');
  });
  
  // Show the requested screen
  elements.screens[screenName].classList.add('active');
}

// Update player turn display
function updatePlayerTurn() {
  const playerSymbol = gameState.currentPlayer.toUpperCase();
  let playerName = `Player ${playerSymbol}`;
  
  if (gameState.gameMode === 'ai') {
    if (gameState.currentPlayer === 'x') {
      playerName = 'Your';
    } else {
      playerName = 'AI\'s';
    }
  }
  
  elements.game.currentPlayer.className = `player-${gameState.currentPlayer}`;
  elements.game.currentPlayer.textContent = `${playerName} turn`;
}

// Update score display
function updateScoreDisplay() {
  elements.game.scoreX.textContent = gameState.scores.x;
  elements.game.scoreO.textContent = gameState.scores.o;
  elements.game.scoreTie.textContent = gameState.scores.tie;
}

// Show game result
function showResult(title, message, isWin) {
  elements.result.message.textContent = title;
  elements.result.details.textContent = message;
  
  // Clear any existing confetti
  elements.result.confettiContainer.innerHTML = '';
  
  // Create confetti if the player won
  if (isWin) {
    createConfetti();
  }
  
  // Show the modal
  elements.modals.gameResult.classList.add('active');
}

// Create confetti effect
function createConfetti() {
  const colors = [
    settings.xColor,
    settings.oColor,
    settings.gridColor,
    '#2ecc71',
    '#9b59b6'
  ];
  
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    
    const size = Math.random() * 10 + 5;
    const backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    const shape = Math.random() > 0.5 ? 'circle' : 'square';
    
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;
    confetti.style.backgroundColor = backgroundColor;
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
    confetti.style.animationDelay = `${Math.random() * 2}s`;
    
    if (shape === 'circle') {
      confetti.style.borderRadius = '50%';
    }
    
    elements.result.confettiContainer.appendChild(confetti);
  }
}

// Apply current settings to UI
function applySettings() {
  // Apply theme
  applyTheme();
  
  // Update colors
  document.documentElement.style.setProperty('--x-color', settings.xColor);
  document.documentElement.style.setProperty('--o-color', settings.oColor);
  document.documentElement.style.setProperty('--grid-color', settings.gridColor);
  
  // Update settings form
  elements.settings.soundToggle.checked = settings.soundEnabled;
  elements.settings.musicToggle.checked = settings.musicEnabled;
  elements.settings.aiDifficultySelect.value = settings.aiDifficulty;
  elements.settings.themeToggle.checked = settings.darkMode;
  elements.settings.xColor.value = settings.xColor;
  elements.settings.oColor.value = settings.oColor;
  elements.settings.gridColor.value = settings.gridColor;
  
  // Update theme toggle button
  elements.buttons.themeToggle.innerHTML = settings.darkMode 
    ? '<i class="fas fa-moon"></i>' 
    : '<i class="fas fa-sun"></i>';
  
  // Update music toggle button
  elements.buttons.musicToggle.innerHTML = settings.musicEnabled 
    ? '<i class="fas fa-music"></i>' 
    : '<i class="fas fa-volume-mute"></i>';
  
  // Apply music setting
  toggleBackgroundMusic();
}

// Apply theme
function applyTheme() {
  if (settings.darkMode) {
    document.body.classList.remove('light-mode');
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
    document.body.classList.add('light-mode');
  }
}

// ==========================================================
// Audio Functions
// ==========================================================

// Simplified sound playback function for better reliability
function playSound(type) {
  // Check if sound should play based on settings
  if (!settings.soundEnabled && type !== 'bgMusic') return false;
  if (type === 'bgMusic' && !settings.musicEnabled) return false;
  
  // Initialize audio system if not already done
  if (!audioInitialized) {
    initAudio();
  }
  
  try {
    // Handle background music specially
    if (type === 'bgMusic') {
      if (sounds.bgMusic) {
        if (sounds.bgMusic.paused) {
          sounds.bgMusic.currentTime = 0;
          sounds.bgMusic.play()
            .then(() => console.log('Background music started'))
            .catch(e => console.error('Error playing background music:', e));
        }
      }
      return true;
    }
    
    // For sound effects, create a fresh audio instance each time
    const soundClone = new Audio(soundPaths[type]);
    soundClone.volume = 0.7;
    
    // Play the sound
    soundClone.play()
      .then(() => console.log(`Sound ${type} played successfully`))
      .catch(e => console.error(`Error playing sound:`, e));
    
    return true;
  } catch (e) {
    console.error('Sound playback error:', e);
    return false;
  }
}

// Simplified background music toggle function
function toggleBackgroundMusic() {
  // Initialize audio system if not already done
  if (!audioInitialized) {
    initAudio();
  }
  
  try {
    if (settings.musicEnabled) {
      // Make sure we have a fresh music element
      if (!sounds.bgMusic || sounds.bgMusic.error) {
        sounds.bgMusic = createAudio(soundPaths.bgMusic, true);
      }
      
      // Play the music
      if (sounds.bgMusic.paused) {
        // A user gesture is required to play audio, so we'll use the next click
        const startMusic = () => {
          sounds.bgMusic.play()
            .then(() => console.log('Background music started on user interaction'))
            .catch(e => {
              console.error('Failed to play music on click:', e);
              
              // Create new audio element and try again
              sounds.bgMusic = createAudio(soundPaths.bgMusic, true);
              setTimeout(() => {
                sounds.bgMusic.play().catch(() => {});
              }, 1000);
            });
        };
        
        // Try to play now (might work if already had user interaction)
        sounds.bgMusic.play()
          .then(() => console.log('Background music started immediately'))
          .catch(() => {
            // Set up a one-time click listener if immediate play fails
            document.addEventListener('click', startMusic, { once: true });
          });
      }
    } else {
      // Pause the music if it's playing
      if (sounds.bgMusic && !sounds.bgMusic.paused) {
        sounds.bgMusic.pause();
        console.log('Background music paused');
      }
    }
  } catch (e) {
    console.error('Music toggle error:', e);
  }
}

// Simplified audio unlocking for better browser compatibility
function unlockAudioContext() {
  // Initialize audio if not already done
  if (!audioInitialized) {
    initAudio();
  }
  
  // Show audio banner
  const audioBanner = document.getElementById('audio-banner');
  audioBanner.classList.add('show');
  
  // Function to unlock audio on user interaction
  const unlockAudio = () => {
    console.log('Attempting to unlock audio...');
    
    // Create and play a silent sound to unlock audio
    try {
      const silentSound = new Audio("data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV");
      silentSound.volume = 0.1;
      silentSound.play().then(() => {
        console.log('Silent sound played successfully');
      }).catch(e => {
        console.error('Silent sound playback failed:', e);
      });
    } catch (e) {
      console.error('Error creating silent sound:', e);
    }
    
    // Hide the banner after a short delay
    setTimeout(() => {
      audioBanner.classList.remove('show');
    }, 1000);
    
    // Force reload all sound elements
    Object.keys(soundPaths).forEach(key => {
      sounds[key] = createAudio(soundPaths[key], key === 'bgMusic');
    });
    
    // Start background music if enabled
    if (settings.musicEnabled) {
      setTimeout(() => toggleBackgroundMusic(), 500);
    }
    
    // Play a test sound with a delay
    if (settings.soundEnabled) {
      setTimeout(() => playSound('click'), 700);
    }
    
    // Remove event listeners
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('touchstart', unlockAudio);
    document.removeEventListener('keydown', unlockAudio);
    audioBanner.removeEventListener('click', unlockAudio);
    
    // Mark audio as unlocked
    window.audioUnlocked = true;
  };
  
  // Add event listeners to unlock audio on user interaction
  document.addEventListener('click', unlockAudio, { once: true });
  document.addEventListener('touchstart', unlockAudio, { once: true });
  document.addEventListener('keydown', unlockAudio, { once: true });
  audioBanner.addEventListener('click', unlockAudio, { once: true });
  
  // Also set a timeout to remove the banner if it's not clicked
  setTimeout(() => {
    if (audioBanner.classList.contains('show')) {
      unlockAudio();
    }
  }, 10000);
}

// ==========================================================
// Storage Functions
// ==========================================================

// Save the game state
function saveGame() {
  const gameData = {
    board: gameState.board,
    currentPlayer: gameState.currentPlayer,
    gameMode: gameState.gameMode,
    aiDifficulty: gameState.aiDifficulty,
    gameActive: gameState.gameActive,
    scores: gameState.scores
  };
  
  localStorage.setItem(gameState.autoSaveKey, JSON.stringify(gameData));
}

// Load a saved game
function loadGame() {
  const savedGame = localStorage.getItem(gameState.autoSaveKey);
  
  if (savedGame) {
    try {
      const gameData = JSON.parse(savedGame);
      
      gameState.board = gameData.board;
      gameState.currentPlayer = gameData.currentPlayer;
      gameState.gameMode = gameData.gameMode;
      gameState.aiDifficulty = gameData.aiDifficulty;
      gameState.gameActive = gameData.gameActive;
      gameState.scores = gameData.scores;
      
      // Update the UI
      elements.game.cells.forEach((cell, index) => {
        cell.className = 'cell';
        if (gameState.board[index]) {
          cell.classList.add(gameState.board[index]);
        }
      });
      
      if (gameState.gameActive) {
        updatePlayerTurn();
      }
      
      if (gameState.gameMode) {
        showScreen('gameBoard');
      }
    } catch (error) {
      console.error('Error loading saved game:', error);
      startNewGame();
    }
  }
}

// Save settings
function saveSettings() {
  localStorage.setItem(gameState.settingsKey, JSON.stringify(settings));
}

// Load settings
function loadSettings() {
  const savedSettings = localStorage.getItem(gameState.settingsKey);
  
  if (savedSettings) {
    try {
      const loadedSettings = JSON.parse(savedSettings);
      Object.assign(settings, loadedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }
}

// Reset settings to defaults
function resetSettings() {
  settings.soundEnabled = true;
  settings.musicEnabled = true;
  settings.aiDifficulty = 'medium';
  settings.darkMode = true;
  settings.xColor = '#3498db';
  settings.oColor = '#e74c3c';
  settings.gridColor = '#95a5a6';
  
  applySettings();
  saveSettings();
}

// ==========================================================
// Leaderboard
// ==========================================================

// Initialize leaderboard
function initLeaderboard() {
  const leaderboard = localStorage.getItem(gameState.leaderboardKey);
  
  if (!leaderboard) {
    const initialLeaderboard = {
      'Player': { wins: 0, losses: 0, ties: 0 },
      'AI (Easy)': { wins: 0, losses: 0, ties: 0 },
      'AI (Medium)': { wins: 0, losses: 0, ties: 0 },
      'AI (Hard)': { wins: 0, losses: 0, ties: 0 }
    };
    
    localStorage.setItem(gameState.leaderboardKey, JSON.stringify(initialLeaderboard));
  }
}

// Update player stats
function updatePlayerStats(winner) {
  const leaderboard = JSON.parse(localStorage.getItem(gameState.leaderboardKey));
  
  if (gameState.gameMode === 'ai') {
    const aiName = `AI (${gameState.aiDifficulty.charAt(0).toUpperCase() + gameState.aiDifficulty.slice(1)})`;
    
    if (winner === 'x') {
      // Player won
      leaderboard['Player'].wins += 1;
      leaderboard[aiName].losses += 1;
    } else {
      // AI won
      leaderboard['Player'].losses += 1;
      leaderboard[aiName].wins += 1;
    }
  } else {
    // Two player mode, update generic player stats
    if (winner === 'x') {
      leaderboard['Player X'] = leaderboard['Player X'] || { wins: 0, losses: 0, ties: 0 };
      leaderboard['Player O'] = leaderboard['Player O'] || { wins: 0, losses: 0, ties: 0 };
      leaderboard['Player X'].wins += 1;
      leaderboard['Player O'].losses += 1;
    } else {
      leaderboard['Player X'] = leaderboard['Player X'] || { wins: 0, losses: 0, ties: 0 };
      leaderboard['Player O'] = leaderboard['Player O'] || { wins: 0, losses: 0, ties: 0 };
      leaderboard['Player O'].wins += 1;
      leaderboard['Player X'].losses += 1;
    }
  }
  
  localStorage.setItem(gameState.leaderboardKey, JSON.stringify(leaderboard));
}

// Update leaderboard UI
function updateLeaderboard() {
  const leaderboard = JSON.parse(localStorage.getItem(gameState.leaderboardKey));
  
  // Clear the leaderboard body
  elements.leaderboard.body.innerHTML = '';
  
  // Convert leaderboard to array for sorting
  const players = Object.keys(leaderboard).map(name => {
    return {
      name,
      ...leaderboard[name],
      total: leaderboard[name].wins - leaderboard[name].losses
    };
  });
  
  // Sort by total score (wins - losses)
  players.sort((a, b) => b.total - a.total);
  
  // Add rows to the leaderboard
  players.forEach((player, index) => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${player.name}</td>
      <td>${player.wins}</td>
      <td>${player.losses}</td>
      <td>${player.ties}</td>
    `;
    
    elements.leaderboard.body.appendChild(row);
  });
}

// ==========================================================
// Replit-specific audio handling
// ==========================================================

// Special function for handling audio in Replit environment
function setupReplitAudio() {
  // Check if we're in a Replit environment
  const isReplit = window.location.hostname.includes('replit');
  
  if (isReplit) {
    console.log('Replit environment detected, setting up special audio handling');
    
    // Create a more aggressive audio unlock strategy for Replit
    const forceUnlockAudio = () => {
      console.log('Force unlocking audio in Replit environment');
      
      // Resume audio context
      if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume().catch(e => console.error('Force resume failed:', e));
      }
      
      // Try multiple silent sounds with different formats
      const silentSoundMP3 = new Audio("data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABGgD///////////////////////////////////////////////8AAAAA//////////////////////////////////////////////////////////////////8=");
      silentSoundMP3.volume = 0.1;
      silentSoundMP3.play().catch(e => console.log("MP3 silent sound unlock failed:", e));
      
      // Try WAV format as alternative
      const silentSoundWAV = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA");
      silentSoundWAV.volume = 0.1;
      silentSoundWAV.play().catch(e => console.log("WAV silent sound unlock failed:", e));
      
      // Create short oscillator sound (this often works when other methods fail)
      try {
        if (audioContext) {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          gainNode.gain.value = 0.01; // Very low volume
          oscillator.type = 'sine';
          oscillator.frequency.value = 440; // A4 note
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          oscillator.start(0);
          oscillator.stop(audioContext.currentTime + 0.05); // Very short duration
        }
      } catch (oscillatorError) {
        console.error('Oscillator method failed:', oscillatorError);
      }
      
      // Recreate all audio elements
      sounds.click = createAudio(soundPaths.click);
      sounds.win = createAudio(soundPaths.win);
      sounds.lose = createAudio(soundPaths.lose);
      sounds.tie = createAudio(soundPaths.tie);
      sounds.bgMusic = createAudio(soundPaths.bgMusic, true);
      
      // Preload all sounds again
      preloadSounds();
      
      // Try playing each sound quickly and stopping it (helps unlock)
      Object.values(sounds).forEach(sound => {
        if (sound && typeof sound.play === 'function') {
          const promise = sound.play();
          if (promise) {
            promise.then(() => {
              sound.pause();
              sound.currentTime = 0;
              console.log('Successfully unlocked a sound');
            }).catch(e => console.log("Sound unlock failed:", e));
          }
        }
      });
      
      // Start background music after a slight delay if enabled
      if (settings.musicEnabled) {
        setTimeout(() => toggleBackgroundMusic(), 1000);
      }
    };
    
    // Add event listeners with options for better control
    document.addEventListener('click', forceUnlockAudio, { once: true, capture: true });
    document.addEventListener('touchstart', forceUnlockAudio, { once: true, capture: true });
    document.addEventListener('keydown', forceUnlockAudio, { once: true, capture: true });
    
    // Make the audio banner more prominent
    const audioBanner = document.getElementById('audio-banner');
    if (audioBanner) {
      audioBanner.classList.add('replit-banner');
      audioBanner.addEventListener('click', forceUnlockAudio, { once: true });
    }
    
    // Update the splash screen message to be more explicit
    const audioPermissionNotice = document.getElementById('audio-permission-notice');
    if (audioPermissionNotice) {
      audioPermissionNotice.innerHTML = '<strong>👉 Tap or click anywhere for relaxing sounds & music 👈</strong><br>(Browser restrictions require user interaction)';
      audioPermissionNotice.style.color = '#ff9900';
      audioPermissionNotice.style.fontSize = '1.2em';
      audioPermissionNotice.style.padding = '10px';
      audioPermissionNotice.style.background = 'rgba(0,0,0,0.7)';
      audioPermissionNotice.style.borderRadius = '8px';
    }
    
    // Try unlocking on DOMContentLoaded as well
    if (document.readyState !== 'loading') {
      setTimeout(forceUnlockAudio, 1000);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(forceUnlockAudio, 1000);
      });
    }
  }
}

// ==========================================================
// Initialization
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
  init();
  setupReplitAudio();
});
