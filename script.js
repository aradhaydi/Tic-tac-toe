
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

// Audio elements
const sounds = {
  click: null,
  win: null,
  lose: null,
  tie: null,
  bgMusic: null
};

// Initialize sounds - we'll create them only when needed to avoid autoplay restrictions
function initSounds() {
  try {
    // Use shorter, more reliable audio files
    if (!sounds.click) sounds.click = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLHPM+N2JSxMSQajj9tijaCoZKHu43Pbuv5JEKxlQlNDx8tnDdk0nE0yR0Pf67M+kfWE3GzOEuuX89uTOoIZtRiMZJHGw4f3++OvgyLCQdVItFRIuhNT4/v/9+fDew6uYhmM5GwgwltX0/P7/+vXr1rygkHlbLx8MFTiU2/j9/v/6+fPjxK2XgmxLKyMLECSb5/j7/f77+fbw1r6olHpjQisWDAshq/L6+/v7+/r39OrhxbCaiXVWMyINFTKb3PT6+vv8/Pz69e7lyLaejHRbOiQQCRpHwu/1+Pn6/f39/frz69zFrpmDaDwpGg0JI7Pq8/j4+vv8/f39+/jx3MWvnYdwTDAcDQkTYeTw9fb5+/v8/f39/frx5tDAtZyEYjokEwwLHarn8PT3+fr7/Pz9/f37+e7ew7KchWpFKxcJCSOq7vL09vn6+/z8/f39/PjqzbuolIBqSzAeCgcaaMXs8vX3+Pn6/Pz9/f39+uLLtqOPdlY3JRILCSGk6O/z9vj5+vv8/P39/v7366p3Ui0gGhgaHB0dHRwbGhkYFxcWFxcNBgkDA+Ps+gcICQoLCwsKCQcGBQMDAv381G0cBRITFRYXGBgYFxYVEtbv/QABAQEBAgICAgICAgICAgEB3NtuHQcCKMLk+vz8+/v7+/v7+vr5+PjRZC4dh9bo+Pr7+/z8/P39/f5P3a/Z4On0+vz9/v////////////////3q1rKAbn6Xq7vI09upkXhzd4WOnJ+ciXFHPEVTVk9EMR4GCAAAAAQIFB0sP09bYmj/j0YREhITFBUYGRsfIycqKzAzMzY6pZ5EGQcICgsNDxETFBYYGhsdHiEjJCYoKcTszJGQkZOVlpeZmpydnp+goaGio6Spw9d+KJ7M3+Pl5ebm5+fn6Ojp6enp6ens9Pyuh1Uwd5ars7m+wsXJzM/S1NbY2drc29rZobV7XEVJYm12fIOIjZGUl5mcnqCtp6KeloE9S01JQz83MSolIyAfHh4dHR0dHRwbGhgYHC08WYjC6h0UEA4NCwkHBgQCAgEBAQECAgMEBAMMN15ICAkKCwwODg8REhMUFRYXGBkbHB0eHyEiIyUnvO+1HSEkJigrLS8xMzQ2Nzk6Ozw9PT4+Pj5AT2mw8k8sKCUjIR8eHRsaGRgXFhYUFBMTEhERFyArS4HI9lkzKiYjIR8eHRsaGRcWFRQTERAPDg0MCwsafJ6jm5WNhoN/e3ZybmpmYl5bV1RSUEx6pcIrAQECAwQFBgcICQoLDA0ODxARERITFBQVFhkrTO64OTo8PT9AQkNERUZHSElKS0xNTU5OT1BQV26f2HNMSkhGREJAPjw6ODc1MzIxLy4tKyspKSku9p6am5ydnZ6en5+fn5+goKCgoKCgoKCgoKOrv3WsrKysrKysrKurq6urq6urq6urq6urqcPdnw==');
    if (!sounds.win) sounds.win = new Audio('data:audio/wav;base64,UklGRpYFAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YXIFAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIA==');
    if (!sounds.lose) sounds.lose = new Audio('data:audio/wav;base64,UklGRpAFAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YWwFAAB0dXVdR0I/QkVCR0xRWF1gX11cXWBjZGZoaWtvc3Fxc3JzdHV1dHRzdHRwbGppZ2VjX1xbWldVUlFPTE1NRkM/PDw5ODY1MzEwMC8vLy8vLy8wMTEzNDU2Nzo8PT9BQ0VHS05RU1VXWVtdYGJjZWdpbGxucXN0dXZ3eHh5enp7e3x7fHt7fHt7enp5enl5eHd3d3d2dnV1dHRzcnJxcXBwbm5tbGxramppaWhoZ2ZmZmVlZWVjY2JiYmJiYmFgX19fX11dXFxbW1pZWVlYV1dXV1ZVVVRUVFNTUlJSUlFRUVFQUFBPTk5OTk1NTEtLS0tKSklJSUlJSEhIR0dHR0dHR0dGRkZGRkZFRUVERURERERDQ0NDQkJCQkFBQUFBQEA/Pz8/Pz4+Pj09PT09PD08Ozs7Ozs6Ojo6Ojo5OTk5OTk4ODg4ODg4Nzc3Nzc3Nzc3Nzc3Nzc2NjY2NjY2NTU1NTU0NDM0MzQ0NDQzMzMzMzMyMjIyMjIyMjIyMjIxMTExMTExMTEwMDAwMDAwMDAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLA==');
    if (!sounds.tie) sounds.tie = new Audio('data:audio/wav;base64,UklGRqYFAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YYIFAAAzMzMzMzMzMzMzM9nZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZMzMzMzMzMzMzMzMzMzOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzjMzMzMzMzMzMzMzMzMzMzMzMwEAAAAAAAAAAICA7Ozs7Ozs7Ozs7Ozs7Ozs7OwAAAAAAAAAAADMzMzMzMzMzMzMzDMzMzMzM7OzMzMzMzMzMzMzMzMzMzMzs7Ozs7MzMzMzMzMzMzMzMzMzMzMzMzMzgICAgICAgICAgICAgICAgICAgICAgICAgICAgMzMzMzMzMzMzMzAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgDMzMzMzMzMzMzMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAzMzMzMzMzMzMzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzszMzMzMzMzMzMzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzMzMzMzMzMzMwEAAAAAAAAAAICAgICAgICAgICAgICAgICAgICAgIAAAAAAAAAAAADMzMzMzMzMzMwzMzMzMzOzszMzMzMzMzMzMzMzMzMzMzOzs7OzszMzMzMzMzMzMwzMzMzMzMzMzMzMAAAAAICAgICAgICAgICAgDOzs7Ozs7Ozs7OzszMzMzMzMzMzM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7MzMzMzMzMzMzMzMzMzMzMzMzMzMzPZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2TMzMzMzMzMzMzMzMzMzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs4zMzMzMzMzMzMzMzMzMzMzMzMzAQAAAAAAAAAAgIDs7Ozs7Ozs7Ozs7Ozs7Ozs7AAAAAAAAAAAADMzMzMzMzMzMzMzDMzMzMzM7OzMzMzMzMzMzMzMzMzMzMzs7Ozs7MzMzMzMzMzMzMzMzMzMzMzMzMzgICAgICAgICAgICAgICAgICAgICAgICAgICAgMzMzMzMzMzMzMzAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgDMzMzMzMzMzMzMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAzMzMzMzMzMzMzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzszMzMzMzMzMzMzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzMzMzMzMzMzMwEAAAAAAAAAAICAgICAgICAgICAgICAgICAgICAgIAAAAAAAAAAAADMzMzMzMzMzMwzMzMzMzOzszMzMzMzMzMzMzMzMzMzMzOzs7OzszMzMzMzMzMzMwzMzMzMzMzMzMzMAAAAAICAgICAgICAgICAgDOzs7Ozs7Ozs7OzszMzMzMzMzMzM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7MzMzMzMzMzMzMzAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
    if (!sounds.bgMusic) {
      sounds.bgMusic = new Audio('data:audio/wav;base64,UklGRigFAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQFAACCd2lnZ2RiZGZsa21vcW9sampjYF1WVVRWU1VTU1JTVFZYWl5naWxzd3l+goSEh4qHiYeFg4F8eHJrY1xVTEY/OjQwLCkmJiUmJicoKy0uMjQ3Oj9FS1FXXGJnbnR6gIKGjY+SmJueoaOlp6mpqqmopaSioJ6bl5OPiYOBfHhzcW1qZmRhYF5fXl5fYGFiZWdpa25xdHd5fYCCg4eLj5GVmJueoa+zt7u/wsXIy8zQ0tTW1djZ2dfV0c7Kx8PAu7azrqmloJqTjYd/d3BnXlVNRDswKiMeGBMPDAoIBwcHCAgKDA4RFBcbHyQpLzU8RExVXWhye4aRm6WwucXP197m7fT69v37/vz69PPu6ePd1tDJwr21rqWbkIZkYVhPRDozLigkIyQpLzY+R09YYWpzfIWNk5qhp62ytri7vL6+vLq3tLCsp6KdmJONh4J9eHRwbGlmY2BdXFpZWVhYWVlbXF5fYWRnaWxvcXR3eXx+gYOFh4qMjo+QkZGSkpOTk5OCdmtnZ2RiZGZsa21vcW9sampjYF1WVVRWU1VTU1JTVFZYWl5naWxzd3l+goSEh4qHiYeFg4F8eHJrY1xVTEY/OjQwLCkmJiUmJicoKy0uMjQ3Oj9FS1FXXGJnbnR6gIKGjY+SmJueoaOlp6mpqqmopaSioJ6bl5OPiYOBfHhzcW1qZmRhYF5fXl5fYGFiZWdpa25xdHd5fYCCg4eLj5GVmJueoa+zt7u/wsXIy8zQ0tTW1djZ2dfV0c7Kx8PAu7azrqmloJqTjYd/d3BnXlVNRDswKiMeGBMPDAoIBwcHCAgKDA4RFBcbHyQpLzU8RExVXWhye4aRm6WwucXP197m7fT69v37/vz69PPu6ePd1tDJwr21rqWbkIZkYVhPRDozLigkIyQpLzY+R09YYWpzfIWNk5qhp62ytri7vL6+vLq3tLCsp6KdmJONh4J9eHRwbWloZGJfXl1dXF1cXF1dXl9hY2VoaWxucHJ1+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+vr6+g==');
      sounds.bgMusic.loop = true;
      sounds.bgMusic.volume = 0.3;
    }
  } catch(e) {
    console.error("Failed to initialize sounds", e);
  }
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
  // Load settings
  loadSettings();
  
  // Apply current settings
  applySettings();
  
  // Load any saved game
  loadGame();
  
  // Update the UI to match the current state
  updateScoreDisplay();
  
  // Add event listeners
  addEventListeners();

  // Initialize leaderboard
  initLeaderboard();
  
  // Handle splash screen interaction for audio permission
  elements.splashScreen.addEventListener('click', () => {
    // Initialize audio context on user interaction
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      const audioCtx = new AudioContext();
      window.audioContextInitialized = true;
    }
    
    // Initialize sounds
    initSounds();
    
    // Try playing background music if enabled
    if (settings.musicEnabled) {
      sounds.bgMusic.play().catch(e => console.log('Music play error:', e));
    }
    
    // Hide splash screen after click
    elements.splashScreen.classList.add('hidden');
    setTimeout(() => {
      elements.splashScreen.style.display = 'none';
    }, 500);
  });
  
  // If not clicked after 3 seconds, auto-hide splash screen
  setTimeout(() => {
    if (!elements.splashScreen.classList.contains('hidden')) {
      elements.splashScreen.classList.add('hidden');
      setTimeout(() => {
        elements.splashScreen.style.display = 'none';
      }, 500);
    }
  }, 3000);
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
    elements.modals.settings.classList.add('active');
    playSound('click');
  });
  
  elements.buttons.closeSettings.addEventListener('click', () => {
    elements.modals.settings.classList.remove('active');
    playSound('click');
  });
  
  // Theme toggle button
  elements.buttons.themeToggle.addEventListener('click', () => {
    settings.darkMode = !settings.darkMode;
    applyTheme();
    saveSettings();
    
    // Update button icon
    elements.buttons.themeToggle.innerHTML = settings.darkMode 
      ? '<i class="fas fa-moon"></i>' 
      : '<i class="fas fa-sun"></i>';
    
    playSound('click');
  });
  
  // Music toggle button
  elements.buttons.musicToggle.addEventListener('click', () => {
    settings.musicEnabled = !settings.musicEnabled;
    toggleBackgroundMusic();
    saveSettings();
    
    // Update button icon
    elements.buttons.musicToggle.innerHTML = settings.musicEnabled 
      ? '<i class="fas fa-music"></i>' 
      : '<i class="fas fa-volume-mute"></i>';
    
    playSound('click');
  });
  
  // Settings form elements
  elements.settings.soundToggle.addEventListener('change', () => {
    settings.soundEnabled = elements.settings.soundToggle.checked;
    saveSettings();
  });
  
  elements.settings.musicToggle.addEventListener('change', () => {
    settings.musicEnabled = elements.settings.musicToggle.checked;
    toggleBackgroundMusic();
    saveSettings();
    
    // Update button icon
    elements.buttons.musicToggle.innerHTML = settings.musicEnabled 
      ? '<i class="fas fa-music"></i>' 
      : '<i class="fas fa-volume-mute"></i>';
  });
  
  elements.settings.aiDifficultySelect.addEventListener('change', () => {
    settings.aiDifficulty = elements.settings.aiDifficultySelect.value;
    gameState.aiDifficulty = settings.aiDifficulty;
    saveSettings();
  });
  
  elements.settings.themeToggle.addEventListener('change', () => {
    settings.darkMode = elements.settings.themeToggle.checked;
    applyTheme();
    saveSettings();
    
    // Update button icon
    elements.buttons.themeToggle.innerHTML = settings.darkMode 
      ? '<i class="fas fa-moon"></i>' 
      : '<i class="fas fa-sun"></i>';
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
  
  // Wait for DOM to be fully loaded before accessing settings elements
  setTimeout(() => {
    try {
      // Make sure elements exist before trying to update them
      if (elements.settings.soundToggle) elements.settings.soundToggle.checked = settings.soundEnabled;
      if (elements.settings.musicToggle) elements.settings.musicToggle.checked = settings.musicEnabled;
      if (elements.settings.aiDifficultySelect) elements.settings.aiDifficultySelect.value = settings.aiDifficulty;
      if (elements.settings.themeToggle) elements.settings.themeToggle.checked = settings.darkMode;
      if (elements.settings.xColor) elements.settings.xColor.value = settings.xColor;
      if (elements.settings.oColor) elements.settings.oColor.value = settings.oColor;
      if (elements.settings.gridColor) elements.settings.gridColor.value = settings.gridColor;
      
      // Update theme toggle button
      if (elements.buttons.themeToggle) {
        elements.buttons.themeToggle.innerHTML = settings.darkMode 
          ? '<i class="fas fa-moon"></i>' 
          : '<i class="fas fa-sun"></i>';
      }
      
      // Update music toggle button
      if (elements.buttons.musicToggle) {
        elements.buttons.musicToggle.innerHTML = settings.musicEnabled 
          ? '<i class="fas fa-music"></i>' 
          : '<i class="fas fa-volume-mute"></i>';
      }
      
      // Apply music setting
      toggleBackgroundMusic();
    } catch (e) {
      console.error('Error applying settings:', e);
    }
  }, 100);
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

// Play a sound effect
function playSound(type) {
  if (!settings.soundEnabled) return;
  
  try {
    // Initialize sounds if needed
    initSounds();
    
    const sound = sounds[type];
    if (sound) {
      // Reset sound to beginning
      sound.currentTime = 0;
      
      // For mobile compatibility, we need a user gesture to play audio
      // So we make the first click initialize the audio context
      if (window.audioContextInitialized !== true) {
        // Create and start a silent audio context to enable audio on mobile
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          const audioCtx = new AudioContext();
          window.audioContextInitialized = true;
        }
      }
      
      // Play with error handling
      const playPromise = sound.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.log('Error playing sound:', e);
          // Create a temporary audio context to unblock audio
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (AudioContext) {
            const audioCtx = new AudioContext();
            audioCtx.resume().then(() => {
              window.audioContextInitialized = true;
            });
          }
        });
      }
    }
  } catch (e) {
    console.log('Sound playback error:', e);
  }
}

// Toggle background music
function toggleBackgroundMusic() {
  // Initialize sounds if needed
  initSounds();
  
  if (settings.musicEnabled && sounds.bgMusic) {
    // For mobile compatibility
    if (window.audioContextInitialized !== true) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const audioCtx = new AudioContext();
        window.audioContextInitialized = true;
      }
    }
    
    const playPromise = sounds.bgMusic.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => {
        console.log('Error playing background music:', e);
        // Add a message to inform the user they need to interact with the page
        document.addEventListener('click', () => {
          if (settings.musicEnabled && sounds.bgMusic) {
            sounds.bgMusic.play().catch(err => console.log('Failed to play music on click:', err));
          }
        });
      });
    }
  } else if (sounds.bgMusic) {
    sounds.bgMusic.pause();
  }
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
// Initialization
// ==========================================================
document.addEventListener('DOMContentLoaded', init);
