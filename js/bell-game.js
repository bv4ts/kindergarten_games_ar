/**
 * Bell Game Script
 * Handles all functionality for the bell game including:
 * - Game setup
 * - Word/image management
 * - Game play logic
 * - Saving/loading game data
 */

document.addEventListener('DOMContentLoaded', function() {
    // Game elements
    const setupContainer = document.getElementById('setupContainer');
    const playContainer = document.getElementById('playContainer');
    const startGameBtn = document.getElementById('startGameBtn');
    const exitGameBtn = document.getElementById('exitGameBtn');
    const timerInput = document.getElementById('timerInput');
    const gameTimer = document.getElementById('gameTimer');
    const wordInput = document.getElementById('wordInput');
    const addWordBtn = document.getElementById('addWordBtn');
    const addImageBtn = document.getElementById('addImageBtn');
    const imageUpload = document.getElementById('imageUpload');
    const wordCardsList = document.getElementById('wordCardsList');
    const saveGameBtn = document.getElementById('saveGameBtn');
    const loadGameBtn = document.getElementById('loadGameBtn');
    const loadGameFile = document.getElementById('loadGameFile');
    const player1Bell = document.getElementById('player1Bell');
    const player2Bell = document.getElementById('player2Bell');
    const player1Score = document.getElementById('player1Score');
    const player2Score = document.getElementById('player2Score');
    const currentWord = document.getElementById('currentWord');
    const currentImage = document.getElementById('currentImage');
    const wrongBtn = document.getElementById('wrongBtn');
    const correctBtn = document.getElementById('correctBtn');
    const skipBtn = document.getElementById('skipBtn');
    
    // Custom alert elements
    const customAlert = document.getElementById('customAlert');
    const customAlertMessage = document.getElementById('customAlertMessage');
    const customAlertOkBtn = document.getElementById('customAlertOkBtn');
    
    // Custom confirm elements
    const customConfirm = document.getElementById('customConfirm');
    const customConfirmMessage = document.getElementById('customConfirmMessage');
    const customConfirmYesBtn = document.getElementById('customConfirmYesBtn');
    const customConfirmNoBtn = document.getElementById('customConfirmNoBtn');
    
    // Custom edit word elements
    const customEditWord = document.getElementById('customEditWord');
    const customEditTitle = document.getElementById('customEditTitle');
    const customEditInput = document.getElementById('customEditInput');
    const customEditOkBtn = document.getElementById('customEditOkBtn');
    const customEditCancelBtn = document.getElementById('customEditCancelBtn');
    
    // Create bell sound effect
    const bellSound = new Audio('sounds/bell.mp3');
    // Create winner sound effect
    const winnerSound = new Audio('sounds/winner.mp3');

    // Game state
    let gameState = {
        timer: 30,
        words: [],
        currentWordIndex: 0,
        player1Points: 0,
        player2Points: 0,
        activePlayer: null,
        timerInterval: null,
        timeRemaining: 0,
        gameStarted: false,
        gameEnded: false // Add gameEnded flag
    };
    
    // Load saved game data from localStorage if available
    loadSavedGameData();

    // Event listeners for game setup
    startGameBtn.addEventListener('click', startGame);
    exitGameBtn.addEventListener('click', exitGame);
    timerInput.addEventListener('change', updateTimer);
    addWordBtn.addEventListener('click', addWord);
    wordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addWord();
        }
    });
    addImageBtn.addEventListener('click', function() {
        imageUpload.click();
    });
    imageUpload.addEventListener('change', handleImageUpload);
    saveGameBtn.addEventListener('click', saveGame);
    loadGameBtn.addEventListener('click', function() {
        loadGameFile.click();
    });
    loadGameFile.addEventListener('change', loadGame);
    
    // Add clear words button event listener
    const clearWordsBtn = document.getElementById('clearWordsBtn');
    clearWordsBtn.addEventListener('click', clearAllWords);

    // Event listeners for gameplay
    player1Bell.addEventListener('click', function() {
        handleBellClick(1);
    });
    player2Bell.addEventListener('click', function() {
        handleBellClick(2);
    });
    wrongBtn.addEventListener('click', handleWrongAnswer);
    correctBtn.addEventListener('click', handleCorrectAnswer);
    skipBtn.addEventListener('click', handleSkip);

    // Add keyboard controls
    document.addEventListener('keydown', function(e) {
        if (playContainer.style.display === 'flex') {
            if (e.key === 'z' || e.key === 'Z') {
                handleBellClick(1);
            } else if (e.key === 'm' || e.key === 'M') {
                handleBellClick(2);
            } else if (e.key === '1') {
                handleWrongAnswer();
            } else if (e.key === '2') {
                handleCorrectAnswer();
            } else if (e.key === '3') {
                handleSkip();
            } else if (e.key === 'Escape') {
                exitGame();
            }
        }
    });

    // Helper Functions

    // Add a new word to the game
    function addWord() {
        const text = wordInput.value.trim();
        if (text) {
            const newWord = {
                text,
                imageUrl: ''
            };
            gameState.words.push(newWord);
            addWordToUI(newWord);
            wordInput.value = '';
            
            // Save game state to localStorage automatically
            saveToLocalStorage();
        }
    }
    
    // Add a word to the UI
    function addWordToUI(word) {
        const wordCard = document.createElement('div');
        wordCard.className = 'word-card';
        wordCard.innerHTML = `
            <div class="word-text">${word.text}</div>
            ${word.imageUrl ? `<img src="${word.imageUrl}" class="word-image" alt="${word.text}">` : ''}
            <div class="btn-group">
                <button class="delete-btn" title="حذف"><i class="bi bi-trash-fill"></i></button>
                <button class="edit-btn" title="تعديل"><i class="bi bi-pencil-fill"></i></button>
                <button class="emoji-btn" title="إضافة إيموجي"><i class="bi bi-emoji-smile-fill"></i></button>
            </div>
        `;

        // Add event listeners for edit and delete buttons
        const deleteBtn = wordCard.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', function() {
            wordCardsList.removeChild(wordCard);
            const index = gameState.words.findIndex(w => w.text === word.text);
            if (index !== -1) {
                gameState.words.splice(index, 1);
                // Save changes to localStorage
                saveToLocalStorage();
            }
        });

        const editBtn = wordCard.querySelector('.edit-btn');
        editBtn.addEventListener('click', function() {
            // Open custom edit dialog
            customEditTitle.textContent = 'تعديل الكلمة';
            customEditInput.value = word.text;
            customEditWord.style.display = 'flex';
            
            // Save changes on OK button click
            customEditOkBtn.onclick = function() {
                const newText = customEditInput.value.trim();
                if (newText) {
                    word.text = newText;
                    wordCard.querySelector('.word-text').textContent = newText;
                    
                    // Save changes to localStorage
                    saveToLocalStorage();
                }
                
                // Close dialog
                customEditWord.style.display = 'none';
            }
            
            // Close dialog on Cancel button click
            customEditCancelBtn.onclick = function() {
                customEditWord.style.display = 'none';
            }
        });

        // Add event listener for emoji button to change picture
        const emojiBtn = wordCard.querySelector('.emoji-btn');
        emojiBtn.addEventListener('click', function() {
            // Create and trigger a hidden file input
            const tempFileInput = document.createElement('input');
            tempFileInput.type = 'file';
            tempFileInput.accept = 'image/*';
            tempFileInput.style.display = 'none';
            document.body.appendChild(tempFileInput);
            
            tempFileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file && file.type.match('image.*')) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const dataUrl = e.target.result;
                        word.imageUrl = dataUrl;
                        
                        // Update the UI
                        let imageEl = wordCard.querySelector('.word-image');
                        if (!imageEl) {
                            imageEl = document.createElement('img');
                            imageEl.className = 'word-image';
                            wordCard.insertBefore(imageEl, wordCard.querySelector('.btn-group'));
                        }
                        imageEl.src = dataUrl;
                        imageEl.alt = word.text;
                        
                        // Update the word in the game state
                        const index = gameState.words.findIndex(w => w.text === word.text);
                        if (index !== -1) {
                            gameState.words[index].imageUrl = dataUrl;
                        }
                        
                        // Save to localStorage immediately
                        saveToLocalStorage();
                    };
                    reader.readAsDataURL(file);
                }
                // Remove the temporary file input
                document.body.removeChild(tempFileInput);
            });
            
            tempFileInput.click();
        });

        wordCardsList.appendChild(wordCard);
    }

    // Handle image upload
    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (file && file.type.match('image.*')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const dataUrl = e.target.result;
                
                // If a word is selected, associate the image with that word
                const selectedWord = document.querySelector('.word-card.selected');
                if (selectedWord) {
                    const wordIndex = Array.from(wordCardsList.children).indexOf(selectedWord);
                    if (wordIndex !== -1 && wordIndex < gameState.words.length) {
                        gameState.words[wordIndex].imageUrl = dataUrl;
                        
                        // Update the UI
                        let imageEl = selectedWord.querySelector('.word-image');
                        if (!imageEl) {
                            imageEl = document.createElement('img');
                            imageEl.className = 'word-image';
                            selectedWord.insertBefore(imageEl, selectedWord.querySelector('.btn-group'));
                        }
                        imageEl.src = dataUrl;
                        imageEl.alt = gameState.words[wordIndex].text;
                        
                        // Save changes to localStorage
                        saveToLocalStorage();
                    }
                } else if (gameState.words.length > 0) {
                    // Add to last word if none selected
                    const lastIndex = gameState.words.length - 1;
                    gameState.words[lastIndex].imageUrl = dataUrl;
                    
                    // Update the UI
                    const lastWordCard = wordCardsList.lastChild;
                    if (lastWordCard) {
                        let imageEl = lastWordCard.querySelector('.word-image');
                        if (!imageEl) {
                            imageEl = document.createElement('img');
                            imageEl.className = 'word-image';
                            lastWordCard.insertBefore(imageEl, lastWordCard.querySelector('.btn-group'));
                        }
                        imageEl.src = dataUrl;
                        imageEl.alt = gameState.words[lastIndex].text;
                        
                        // Save changes to localStorage
                        saveToLocalStorage();
                    }
                }
            };
            reader.readAsDataURL(file);
        }
        
        // Reset the input to allow uploading the same image again
        e.target.value = '';
    }

    // Update timer value when input changes
    function updateTimer() {
        const value = parseInt(timerInput.value);
        if (value >= 5 && value <= 120) {
            gameState.timer = value;
            gameTimer.textContent = value;
        } else {
            timerInput.value = gameState.timer;
        }
    }

    // Start the game
    function startGame() {
        if (gameState.words.length === 0) {
            showCustomAlert('يرجى إضافة بعض الكلمات قبل بدء اللعبة');
            return;
        }

        // Clean up any previous winner animations
        document.querySelector('.player1-zone').classList.remove('winner-celebration');
        document.querySelector('.player2-zone').classList.remove('winner-celebration');
        document.querySelector('.player1-zone').classList.remove('player-zone-active');
        document.querySelector('.player2-zone').classList.remove('player-zone-active');
        
        // Remove any bell animations
        player1Bell.classList.remove('bell-blink');
        player2Bell.classList.remove('bell-blink');
        
        // Stop any animation related CSS effects
        player1Bell.style.animation = 'none';
        player2Bell.style.animation = 'none';
        
        // Force repaint to ensure animations are reset
        void player1Bell.offsetWidth;
        void player2Bell.offsetWidth;
        
        // Reset animation property
        player1Bell.style.animation = '';
        player2Bell.style.animation = '';
        
        // Remove any trophy and confetti elements from previous games
        const trophyElements = document.querySelectorAll('.winner-trophy');
        const confettiElements = document.querySelectorAll('.confetti');
        
        trophyElements.forEach(element => element.remove());
        confettiElements.forEach(element => element.remove());

        // Setup game state
        gameState.currentWordIndex = 0;
        gameState.player1Points = 0;
        gameState.player2Points = 0;
        gameState.activePlayer = null;
        gameState.timeRemaining = gameState.timer;
        gameState.gameStarted = false;
        gameState.gameEnded = false; // Reset the game ended flag

        // Update UI
        player1Score.textContent = '0';
        player2Score.textContent = '0';
        gameTimer.textContent = gameState.timer;
        
        currentWord.textContent = '';
        currentImage.innerHTML = '';

        // Re-enable both bell buttons
        player1Bell.classList.remove('disabled-bell');
        player2Bell.classList.remove('disabled-bell');
        player1Bell.style.opacity = '1';
        player2Bell.style.opacity = '1';
        player1Bell.style.cursor = 'pointer';
        player2Bell.style.cursor = 'pointer';
        
        // Make sure game controls are visible
        document.querySelector('.game-controls').style.display = 'flex';

        // Show game play container
        setupContainer.style.display = 'none';
        playContainer.style.display = 'flex';
        
        // Get the countdown overlay and number elements
        const countdownOverlay = document.getElementById('countdownOverlay');
        const countdownNumber = document.getElementById('countdownNumber');
        
        // Show the countdown overlay
        countdownOverlay.style.display = 'flex';
        
        // Start the countdown
        let count = 3;
        countdownNumber.textContent = count;
        
        const countdownInterval = setInterval(() => {
            count--;
            
            if (count > 0) {
                countdownNumber.textContent = count;
            } else {
                // Clear the interval when countdown is done
                clearInterval(countdownInterval);
                
                // Hide the countdown overlay
                countdownOverlay.style.display = 'none';
                
                // Display the first word
                displayCurrentWord();
            }
        }, 1000);
    }

    // Exit the game
    function exitGame() {
        // Stop any running timers
        if (gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
            gameState.timerInterval = null;
        }
        
        // Show setup container
        playContainer.style.display = 'none';
        setupContainer.style.display = 'flex';
    }

    // Handle bell click
    function handleBellClick(playerNumber) {
        // Check if game has ended
        if (gameState.gameEnded) {
            return; // Don't allow bell clicks after game has ended
        }
        
        // If another player already pressed the bell, ignore this press
        if (gameState.activePlayer !== null && gameState.activePlayer !== playerNumber) {
            return;
        }

        // If game hasn't started, start it with the first word
        if (!gameState.gameStarted) {
            gameState.gameStarted = true;
            gameState.activePlayer = playerNumber;
            displayCurrentWord();
            startCountdown();
            
            // Add continuous blinking effect to the active player's zone
            const playerZone = (playerNumber === 1) ? document.querySelector('.player1-zone') : document.querySelector('.player2-zone');
            playerZone.classList.add('player-zone-active');
            
            // Disable the other player's bell
            const otherBell = (playerNumber === 1) ? player2Bell : player1Bell;
            otherBell.classList.add('disabled-bell');
            otherBell.style.opacity = '0.5';
            otherBell.style.cursor = 'not-allowed';
        } 
        // If game is in progress and no player is active
        else if (gameState.activePlayer === null) {
            gameState.activePlayer = playerNumber;
            
            // Add continuous blinking effect to the active player's zone
            const playerZone = (playerNumber === 1) ? document.querySelector('.player1-zone') : document.querySelector('.player2-zone');
            playerZone.classList.add('player-zone-active');
            
            // Disable the other player's bell
            const otherBell = (playerNumber === 1) ? player2Bell : player1Bell;
            otherBell.classList.add('disabled-bell');
            otherBell.style.opacity = '0.5';
            otherBell.style.cursor = 'not-allowed';
        }

        // Play bell sound
        bellSound.currentTime = 0; // Rewind to start
        bellSound.play();
        
        // Add momentary bell blink effect
        const bellButton = (playerNumber === 1) ? player1Bell : player2Bell;
        bellButton.classList.add('bell-blink');
        
        // Remove the bell blink class after animation completes
        setTimeout(() => {
            bellButton.classList.remove('bell-blink');
        }, 300); // Match the CSS animation duration
    }

    // Display the current word and image
    function displayCurrentWord() {
        if (gameState.currentWordIndex < gameState.words.length) {
            const word = gameState.words[gameState.currentWordIndex];
            currentWord.textContent = word.text;
            
            if (word.imageUrl) {
                currentImage.innerHTML = `<img src="${word.imageUrl}" alt="${word.text}">`;
            } else {
                currentImage.innerHTML = '';
            }
        } else {
            // End of game
            endGame();
        }
    }

    // Start the countdown timer
    function startCountdown() {
        // Clear any existing timers
        if (gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
        }
        
        gameState.timeRemaining = gameState.timer;
        gameTimer.textContent = gameState.timeRemaining;
        
        gameState.timerInterval = setInterval(function() {
            gameState.timeRemaining--;
            gameTimer.textContent = gameState.timeRemaining;
            
            if (gameState.timeRemaining <= 0) {
                clearInterval(gameState.timerInterval);
                handleWrongAnswer(); // Time's up is counted as a wrong answer
            }
        }, 1000);
    }

    // Handle correct answer
    function handleCorrectAnswer() {
        // Only allow if a player has rung the bell
        if (gameState.activePlayer === null) {
            return;
        }
        
        // Add point to active player
        if (gameState.activePlayer === 1) {
            gameState.player1Points++;
            player1Score.textContent = gameState.player1Points;
        } else {
            gameState.player2Points++;
            player2Score.textContent = gameState.player2Points;
        }
        
        // Check if we've reached the end of words
        if (gameState.currentWordIndex + 1 >= gameState.words.length) {
            endGame();
            return;
        }
        
        // Ask if they want to continue to the next word
        showContinueConfirmation();
    }

    // Handle wrong answer
    function handleWrongAnswer() {
        // Only allow if a player has rung the bell
        if (gameState.activePlayer === null) {
            return;
        }
        
        // Remove point from active player (ensure it doesn't go below 0)
        if (gameState.activePlayer === 1) {
            gameState.player1Points = Math.max(0, gameState.player1Points - 1);
            player1Score.textContent = gameState.player1Points;
        } else {
            gameState.player2Points = Math.max(0, gameState.player2Points - 1);
            player2Score.textContent = gameState.player2Points;
        }
        
        // Check if we've reached the end of words
        if (gameState.currentWordIndex + 1 >= gameState.words.length) {
            endGame();
            return;
        }
        
        // Ask if they want to continue to the next word
        showContinueConfirmation();
    }

    // Handle skipping the current word
    function handleSkip() {
        // Reset active player
        resetActivePlayer();
        
        // Check if we've reached the end of words
        if (gameState.currentWordIndex + 1 >= gameState.words.length) {
            endGame();
            return;
        }
        
        // Ask if they want to continue to the next word
        showContinueConfirmation();
    }

    // Shows the "Continue to iterate?" confirmation dialog
    function showContinueConfirmation() {
        // Pause the timer
        if (gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
            gameState.timerInterval = null;
        }
        
        // Reset active player indicators
        resetActivePlayer();
        
        // Show confirmation dialog
        customConfirmMessage.textContent = "هل تريد الاستمرار إلى الكلمة التالية؟";
        customConfirm.style.display = 'flex';
        
        // Set up the Yes button
        customConfirmYesBtn.onclick = function() {
            customConfirm.style.display = 'none';
            // Advance to the next word
            gameState.currentWordIndex++;
            displayCurrentWord();
            // Reset and start the timer
            gameState.timeRemaining = gameState.timer;
            gameTimer.textContent = gameState.timeRemaining;
            startCountdown();
        };
        
        // Set up the No button
        customConfirmNoBtn.onclick = function() {
            customConfirm.style.display = 'none';
            // End the game
            endGame();
        };
    }

    // End the game
    function endGame() {
        clearInterval(gameState.timerInterval);
        
        // Determine the winner
        let winner;
        let winnerZone;
        
        if (gameState.player1Points > gameState.player2Points) {
            winner = 'اللاعب 1';
            winnerZone = document.querySelector('.player1-zone');
        } else if (gameState.player2Points > gameState.player1Points) {
            winner = 'اللاعب 2';
            winnerZone = document.querySelector('.player2-zone');
        } else {
            winner = 'تعادل';
        }
        
        // Play winner sound
        winnerSound.currentTime = 0; // Rewind to start
        winnerSound.play();
        
        // Update UI with winner announcement
        currentWord.textContent = `انتهت اللعبة! الفائز:`;
        currentImage.innerHTML = '';
        
        // Add winner celebration animation to the winner's zone
        if (winnerZone) {
            winnerZone.classList.add('winner-celebration');
            
            // Add trophy icon
            const trophy = document.createElement('div');
            trophy.className = 'winner-trophy';
            trophy.innerHTML = '🏆';
            winnerZone.appendChild(trophy);
            
            // Add confetti elements
            for (let i = 0; i < 10; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = `${Math.random() * 100}%`;
                confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
                confetti.style.animationDelay = `${Math.random() * 2}s`;
                winnerZone.appendChild(confetti);
            }
        }
        
        // Hide game controls and disable bells until game restarts
        document.querySelector('.game-controls').style.display = 'none';
        
        // Disable both bell buttons
        player1Bell.classList.add('disabled-bell');
        player2Bell.classList.add('disabled-bell');
        player1Bell.style.opacity = '0.5';
        player2Bell.style.opacity = '0.5';
        player1Bell.style.cursor = 'not-allowed';
        player2Bell.style.cursor = 'not-allowed';
        
        // Set a flag to prevent bell clicks
        gameState.gameEnded = true;
    }

    // Save the game
    function saveGame() {
        const gameData = {
            timer: gameState.timer,
            words: gameState.words
        };
        
        const dataStr = JSON.stringify(gameData);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'bell-game.kggs';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        // Save to localStorage
        localStorage.setItem('savedGame', dataStr);
    }

    // Load the game
    function loadGame(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const gameData = JSON.parse(e.target.result);
                    
                    // Validate data
                    if (gameData.timer && Array.isArray(gameData.words)) {
                        // Update timer
                        gameState.timer = gameData.timer;
                        timerInput.value = gameState.timer;
                        
                        // Show merge confirmation dialog
                        customConfirmMessage.textContent = 'هل تريد دمج الكلمات ؟';
                        customConfirm.style.display = 'flex';
                        
                        // Yes button - merge words
                        customConfirmYesBtn.onclick = function() {
                            // Create a map of existing words to check for duplicates
                            const existingWordsMap = {};
                            gameState.words.forEach(word => {
                                existingWordsMap[word.text] = word;
                            });
                            

                            // Add new words or update existing ones
                            gameData.words.forEach(importedWord => {
                                if (existingWordsMap[importedWord.text]) {
                                    // Word already exists - keep the one with an image if only one has it
                                    const existingWord = existingWordsMap[importedWord.text];
                                    if (!existingWord.imageUrl && importedWord.imageUrl) {
                                        existingWord.imageUrl = importedWord.imageUrl;
                                    }
                                } else {
                                    // Word doesn't exist - add it
                                    gameState.words.push(importedWord);
                                }
                            });
                            
                            // Refresh UI
                            wordCardsList.innerHTML = '';
                            gameState.words.forEach(word => {
                                addWordToUI(word);
                            });
                            
                            // Save the merged data to localStorage
                            saveToLocalStorage();
                            
                            // Hide confirm dialog
                            customConfirm.style.display = 'none';
                            
                            // Show success message
                            showCustomAlert('تم دمج البيانات المستوردة مع البيانات الحالية');
                        }
                        
                        // No button - replace words 
                        customConfirmNoBtn.onclick = function() {
                            // Replace all words with imported words
                            gameState.words = gameData.words;
                            
                            // Refresh UI
                            wordCardsList.innerHTML = '';
                            gameState.words.forEach(word => {
                                addWordToUI(word);
                            });
                            
                            // Save the new data to localStorage
                            saveToLocalStorage();
                            
                            // Hide confirm dialog
                            customConfirm.style.display = 'none';
                            
                            // Show success message
                            showCustomAlert('تم استبدال البيانات الحالية بالبيانات المستوردة');
                        }
                    } else {
                        showCustomAlert('ملف غير صالح');
                    }
                } catch (error) {
                    showCustomAlert('حدث خطأ أثناء تحميل الملف');
                    console.error(error);
                }
            };
            reader.readAsText(file);
        }
        
        // Reset the input to allow loading the same file again
        e.target.value = '';
    }

    // Load saved game data from localStorage
    function loadSavedGameData() {
        const savedData = localStorage.getItem('savedGame');
        if (savedData) {
            try {
                const gameData = JSON.parse(savedData);
                
                // Validate data
                if (gameData.timer && Array.isArray(gameData.words)) {
                    gameState.timer = gameData.timer;
                    gameState.words = gameData.words;
                    
                    // Update UI
                    timerInput.value = gameState.timer;
                    gameTimer.textContent = gameState.timer;
                    wordCardsList.innerHTML = '';
                    
                    gameData.words.forEach(word => {
                        addWordToUI(word);
                    });
                }
            } catch (error) {
                console.error('Error loading saved game data:', error);
            }
        }
    }
    
    // Save current game state to localStorage
    function saveToLocalStorage() {
        const gameData = {
            timer: gameState.timer,
            words: gameState.words
        };
        
        localStorage.setItem('savedGame', JSON.stringify(gameData));
    }

    // Clear all words from the game
    function clearAllWords() {
        // Show custom confirm dialog
        customConfirmMessage.textContent = 'هل أنت متأكد أنك تريد مسح جميع الكلمات؟';
        customConfirm.style.display = 'flex';
        
        // Confirm yes button event listener
        customConfirmYesBtn.onclick = function() {
            gameState.words = [];
            wordCardsList.innerHTML = '';
            
            // Save changes to localStorage
            saveToLocalStorage();
            
            // Hide confirm dialog
            customConfirm.style.display = 'none';
        }
        
        // Confirm no button event listener
        customConfirmNoBtn.onclick = function() {
            // Hide confirm dialog
            customConfirm.style.display = 'none';
        }
    }

    // Custom alert function
    window.showCustomAlert = function(message) {
        customAlertMessage.textContent = message;
        customAlert.style.display = 'flex';
    }

    // Custom alert OK button event listener
    customAlertOkBtn.addEventListener('click', function() {
        customAlert.style.display = 'none';
    });
});