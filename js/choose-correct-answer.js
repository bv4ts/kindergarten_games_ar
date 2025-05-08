document.addEventListener('DOMContentLoaded', function() {
    // Game state variables
    let gameMode = 'setup'; // 'setup' or 'play'
    let timer = null;
    let timeLeft = 60;
    let correctWords = [];
    let excludedWords = [];
    let gameWords = [];
    let score = 0;
    let currentWordIndex = 0;

    // DOM Elements
    const setupContainer = document.getElementById('setupContainer');
    const gameplayContainer = document.getElementById('gameplayContainer');
    const timerInput = document.getElementById('timerInput');
    const startGameBtn = document.getElementById('startGameBtn');
    const saveGameBtn = document.getElementById('saveGameBtn');
    const loadGameBtn = document.getElementById('loadGameBtn');
    const loadGameFile = document.getElementById('loadGameFile');
    const correctWordInput = document.getElementById('correctWordInput');
    const addCorrectWordBtn = document.getElementById('addCorrectWordBtn');
    const correctWordsList = document.getElementById('correctWordsList');
    const excludedWordsList = document.getElementById('excludedWordsList');
    const addCorrectImageBtn = document.getElementById('addCorrectImageBtn');
    const correctImageUpload = document.getElementById('correctImageUpload');

    // Modal elements
    const customAlert = document.getElementById('customAlert');
    const customAlertMessage = document.getElementById('customAlertMessage');
    const customAlertOkBtn = document.getElementById('customAlertOkBtn');
    const customConfirm = document.getElementById('customConfirm');
    const customConfirmMessage = document.getElementById('customConfirmMessage');
    const customConfirmYesBtn = document.getElementById('customConfirmYesBtn');
    const customConfirmNoBtn = document.getElementById('customConfirmNoBtn');
    const customEditWord = document.getElementById('customEditWord');
    const customEditInput = document.getElementById('customEditInput');
    const customEditOkBtn = document.getElementById('customEditOkBtn');
    const customEditCancelBtn = document.getElementById('customEditCancelBtn');

    // Initialize game elements
    initializeGame();

    function initializeGame() {
        // Set up event listeners
        startGameBtn.addEventListener('click', startGame);
        saveGameBtn.addEventListener('click', saveGame);
        loadGameBtn.addEventListener('click', () => {
            loadGameFile.click();
        });
        loadGameFile.addEventListener('change', loadGame);
        addCorrectWordBtn.addEventListener('click', addCorrectWord);
        correctWordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addCorrectWord();
            }
        });
        addCorrectImageBtn.addEventListener('click', () => {
            correctImageUpload.click();
        });
        correctImageUpload.addEventListener('change', handleImageUpload);

        // Modal event listeners
        customAlertOkBtn.addEventListener('click', closeCustomAlert);
        customConfirmYesBtn.addEventListener('click', confirmYes);
        customConfirmNoBtn.addEventListener('click', confirmNo);
        customEditOkBtn.addEventListener('click', editWordConfirm);
        customEditCancelBtn.addEventListener('click', closeCustomEdit);

        // Initialize gameplay container (will create if not exists)
        initGameplayContainer();
    }

    function initGameplayContainer() {
        // If gameplay container doesn't exist in the HTML, create it
        if (!gameplayContainer) {
            const gameplayHTML = `
                <div class="game-container play-mode" id="gameplayContainer" style="display: none;">
                    <div class="game-header">
                        <div class="score-container">
                            <span class="score-label">النقاط:</span>
                            <span class="score-value" id="scoreValue">0</span>
                        </div>
                        <div class="timer-container">
                            <span class="timer-label">الوقت:</span>
                            <span class="timer-value" id="timerValue">60</span>
                        </div>
                    </div>
                    <div class="word-display" id="wordDisplay"></div>
                    <div class="game-controls">
                        <button class="btn correct-btn" id="correctBtn">صحيح</button>
                        <button class="btn incorrect-btn" id="incorrectBtn">خطأ</button>
                    </div>
                    <button class="btn end-game-btn" id="endGameBtn">إنهاء اللعبة</button>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', gameplayHTML);
            
            // Update gameplayContainer reference
            gameplayContainer = document.getElementById('gameplayContainer');
            
            // Add event listeners for game buttons
            document.getElementById('correctBtn').addEventListener('click', () => handleAnswer(true));
            document.getElementById('incorrectBtn').addEventListener('click', () => handleAnswer(false));
            document.getElementById('endGameBtn').addEventListener('click', endGame);
        }
    }

    function startGame() {
        // Validate that we have enough words
        if (correctWords.length < 2) {
            showCustomAlert('يجب إضافة كلمتين صحيحتين على الأقل للبدء.');
            return;
        }
        if (excludedWords.length < 2) {
            showCustomAlert('يجب إضافة كلمتين مستبعدتين على الأقل للبدء.');
            return;
        }

        // Set timer from input
        timeLeft = parseInt(timerInput.value) || 60;
        
        // Prepare game words
        gameWords = [...correctWords.map(word => ({...word, isCorrect: true})), 
                    ...excludedWords.map(word => ({...word, isCorrect: false}))];
        
        // Shuffle words
        shuffleArray(gameWords);
        
        // Reset game state
        score = 0;
        currentWordIndex = 0;
        
        // Update UI
        document.getElementById('scoreValue').textContent = score;
        document.getElementById('timerValue').textContent = timeLeft;
        displayCurrentWord();
        
        // Switch to play mode
        gameMode = 'play';
        setupContainer.style.display = 'none';
        gameplayContainer.style.display = 'flex';
        
        // Start timer
        startTimer();
        
        // Play sound
        playSound('sounds/bell.mp3');
    }

    function displayCurrentWord() {
        if (currentWordIndex < gameWords.length) {
            const word = gameWords[currentWordIndex];
            const wordDisplay = document.getElementById('wordDisplay');
            
            if (word.image) {
                wordDisplay.innerHTML = `
                    <div class="word-text">${word.text}</div>
                    <div class="word-image">
                        <img src="${word.image}" alt="${word.text}">
                    </div>
                `;
            } else {
                wordDisplay.innerHTML = `<div class="word-text">${word.text}</div>`;
            }
        } else {
            // No more words, end the game
            endGame();
        }
    }

    function handleAnswer(userSaidCorrect) {
        if (currentWordIndex < gameWords.length) {
            const currentWord = gameWords[currentWordIndex];
            const isCorrectAnswer = (userSaidCorrect === currentWord.isCorrect);
            
            if (isCorrectAnswer) {
                score++;
                document.getElementById('scoreValue').textContent = score;
                
                // Visual feedback for correct answer
                flashFeedback(true);
            } else {
                // Visual feedback for wrong answer
                flashFeedback(false);
            }
            
            // Move to next word
            currentWordIndex++;
            
            // Check if we have more words
            if (currentWordIndex < gameWords.length) {
                displayCurrentWord();
            } else {
                endGame();
            }
        }
    }

    function flashFeedback(isCorrect) {
        const feedbackElement = document.createElement('div');
        feedbackElement.className = isCorrect ? 'feedback correct' : 'feedback incorrect';
        feedbackElement.textContent = isCorrect ? 'صحيح!' : 'خطأ!';
        document.body.appendChild(feedbackElement);
        
        // Animate and remove
        setTimeout(() => {
            feedbackElement.remove();
        }, 1000);
    }

    function startTimer() {
        // Clear any existing timer
        if (timer) {
            clearInterval(timer);
        }
        
        const timerElement = document.getElementById('timerValue');
        
        timer = setInterval(() => {
            timeLeft--;
            timerElement.textContent = timeLeft;
            
            if (timeLeft <= 10) {
                timerElement.classList.add('timer-warning');
            }
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                endGame();
            }
        }, 1000);
    }

    function endGame() {
        // Stop timer
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        
        // Calculate final score percentage
        const totalPossibleScore = gameWords.length;
        const scorePercentage = Math.round((score / totalPossibleScore) * 100);
        
        // Show result
        showCustomAlert(`انتهت اللعبة! <br>النقاط: ${score}/${totalPossibleScore} (${scorePercentage}%)`);
        
        // Play win sound if score is good
        if (scorePercentage >= 70) {
            playSound('sounds/winner.mp3');
        }
        
        // Switch back to setup mode
        gameMode = 'setup';
        gameplayContainer.style.display = 'none';
        setupContainer.style.display = 'flex';
    }

    function addCorrectWord() {
        addWord(correctWordInput, correctWordsList, true);
    }

    function addExcludedWord() {
        const excludedWordInput = document.getElementById('excludedWordInput');
        addWord(excludedWordInput, excludedWordsList, false);
    }

    function addWord(inputElement, listElement, isCorrect) {
        const wordText = inputElement.value.trim();
        
        if (wordText === '') {
            return;
        }
        
        // Create word object
        const wordObj = { text: wordText, image: null };
        
        // Add to appropriate array
        if (isCorrect) {
            correctWords.push(wordObj);
        } else {
            excludedWords.push(wordObj);
        }
        
        // Create and add word card to UI
        const wordCard = createWordCard(wordObj, isCorrect);
        listElement.appendChild(wordCard);
        
        // Clear input
        inputElement.value = '';
        inputElement.focus();
    }

    function createWordCard(wordObj, isCorrect) {
        const wordCard = document.createElement('div');
        wordCard.className = 'word-card';
        
        const wordText = document.createElement('div');
        wordText.className = 'word-text';
        wordText.textContent = wordObj.text;
        wordCard.appendChild(wordText);
        
        if (wordObj.image) {
            const wordImage = document.createElement('div');
            wordImage.className = 'word-thumbnail';
            wordImage.innerHTML = `<img src="${wordObj.image}" alt="${wordObj.text}">`;
            wordCard.appendChild(wordImage);
        }
        
        const wordActions = document.createElement('div');
        wordActions.className = 'word-actions';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'word-action-btn edit-btn';
        editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
        editBtn.addEventListener('click', () => editWord(wordObj, wordCard, isCorrect));
        wordActions.appendChild(editBtn);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'word-action-btn delete-btn';
        deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
        deleteBtn.addEventListener('click', () => deleteWord(wordObj, wordCard, isCorrect));
        wordActions.appendChild(deleteBtn);
        
        wordCard.appendChild(wordActions);
        
        return wordCard;
    }

    function editWord(wordObj, wordCard, isCorrect) {
        // Store reference to word being edited
        customEditWord.dataset.wordObj = JSON.stringify(wordObj);
        customEditWord.dataset.isCorrect = isCorrect;
        customEditWord.dataset.wordCard = wordCard.outerHTML;
        
        // Set current text in edit input
        customEditInput.value = wordObj.text;
        
        // Show edit modal
        customEditWord.style.display = 'flex';
        customEditInput.focus();
    }

    function editWordConfirm() {
        const wordData = JSON.parse(customEditWord.dataset.wordObj);
        const isCorrect = customEditWord.dataset.isCorrect === 'true';
        const wordCards = isCorrect ? correctWordsList.children : excludedWordsList.children;
        
        // Update word text
        const newText = customEditInput.value.trim();
        if (newText === '') {
            closeCustomEdit();
            return;
        }
        
        // Find and update the word in the appropriate array
        const wordArray = isCorrect ? correctWords : excludedWords;
        const wordIndex = wordArray.findIndex(w => w.text === wordData.text && w.image === wordData.image);
        
        if (wordIndex !== -1) {
            wordArray[wordIndex].text = newText;
            
            // Update the card in the UI
            const updatedWord = wordArray[wordIndex];
            const newCard = createWordCard(updatedWord, isCorrect);
            
            // Replace old card with updated one
            for (let i = 0; i < wordCards.length; i++) {
                const card = wordCards[i];
                if (card.querySelector('.word-text').textContent === wordData.text) {
                    card.replaceWith(newCard);
                    break;
                }
            }
        }
        
        closeCustomEdit();
    }

    function deleteWord(wordObj, wordCard, isCorrect) {
        // Confirm deletion
        showCustomConfirm(`هل أنت متأكد من حذف الكلمة "${wordObj.text}"؟`, () => {
            // Remove from array
            const wordArray = isCorrect ? correctWords : excludedWords;
            const wordIndex = wordArray.findIndex(w => w.text === wordObj.text && w.image === wordObj.image);
            
            if (wordIndex !== -1) {
                wordArray.splice(wordIndex, 1);
                
                // Remove from UI
                wordCard.remove();
            }
        });
    }

    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.type.match('image.*')) {
            showCustomAlert('يرجى تحميل ملف صورة صالح.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const wordText = correctWordInput.value.trim();
            if (wordText === '') {
                showCustomAlert('يرجى إدخال نص الكلمة قبل إضافة صورة.');
                return;
            }
            
            // Create word object with image
            const wordObj = { text: wordText, image: e.target.result };
            
            // Add to correct words array
            correctWords.push(wordObj);
            
            // Create and add word card to UI
            const wordCard = createWordCard(wordObj, true);
            correctWordsList.appendChild(wordCard);
            
            // Clear input
            correctWordInput.value = '';
            correctImageUpload.value = '';
        };
        
        reader.readAsDataURL(file);
    }

    function saveGame() {
        // Prepare game data
        const gameData = {
            timer: parseInt(timerInput.value) || 60,
            correctWords: correctWords,
            excludedWords: excludedWords
        };
        
        // Convert to JSON
        const gameJSON = JSON.stringify(gameData);
        
        // Create blob and downloadable link
        const blob = new Blob([gameJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'choose-correct-words.kggs';
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function loadGame(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const gameData = JSON.parse(e.target.result);
                
                // Validate game data
                if (!gameData.correctWords || !gameData.excludedWords || !gameData.timer) {
                    throw new Error('ملف اللعبة غير صالح.');
                }
                
                // Reset current game data
                correctWords = gameData.correctWords;
                excludedWords = gameData.excludedWords;
                timerInput.value = gameData.timer;
                
                // Update UI
                updateWordLists();
                
                showCustomAlert('تم تحميل اللعبة بنجاح!');
            } catch (error) {
                showCustomAlert('خطأ في تحميل ملف اللعبة: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    }

    function updateWordLists() {
        // Clear current lists
        correctWordsList.innerHTML = '';
        excludedWordsList.innerHTML = '';
        
        // Add correct words to UI
        correctWords.forEach(word => {
            const wordCard = createWordCard(word, true);
            correctWordsList.appendChild(wordCard);
        });
        
        // Add excluded words to UI
        excludedWords.forEach(word => {
            const wordCard = createWordCard(word, false);
            excludedWordsList.appendChild(wordCard);
        });
    }

    // Modal functions
    function showCustomAlert(message) {
        customAlertMessage.innerHTML = message;
        customAlert.style.display = 'flex';
    }
    
    function closeCustomAlert() {
        customAlert.style.display = 'none';
    }
    
    function showCustomConfirm(message, onConfirm) {
        customConfirmMessage.innerHTML = message;
        customConfirm.style.display = 'flex';
        
        // Store callback
        customConfirm.dataset.onConfirm = JSON.stringify({ callback: onConfirm.toString() });
    }
    
    function confirmYes() {
        try {
            const data = JSON.parse(customConfirm.dataset.onConfirm);
            const callback = new Function('return ' + data.callback)();
            callback();
        } catch (e) {
            console.error('Error executing callback:', e);
        }
        
        customConfirm.style.display = 'none';
    }
    
    function confirmNo() {
        customConfirm.style.display = 'none';
    }
    
    function closeCustomEdit() {
        customEditWord.style.display = 'none';
    }

    // Helper functions
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    function playSound(soundPath) {
        const audio = new Audio(soundPath);
        audio.play().catch(e => console.error('Error playing sound:', e));
    }

    // Initialize UI for excluded words
    function initExcludedWordsUI() {
        // Make sure we have the expected DOM structure
        const setupContainer = document.querySelector('.words-section');
        
        if (!document.getElementById('excludedWordInput')) {
            // Add the excluded words section if not present in HTML
            const excludedWordsHTML = `
                <div class="word-list-section">
                    <div class="word-list-title">كلمات مستبعدة</div>
                    <div class="word-cards" id="excludedWordsList">
                        <!-- Excluded word cards will be dynamically added here -->
                    </div>
                    <div class="word-input-container">
                        <input type="text" id="excludedWordInput" placeholder="أدخل كلمة مستبعدة...">
                        <button class="word-add-btn" id="addExcludedWordBtn">
                            <i class="bi bi-plus-lg"></i>
                        </button>
                    </div>
                </div>
            `;
            
            setupContainer.insertAdjacentHTML('beforeend', excludedWordsHTML);
            
            // Add event listeners
            document.getElementById('addExcludedWordBtn').addEventListener('click', addExcludedWord);
            document.getElementById('excludedWordInput').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    addExcludedWord();
                }
            });
        }
    }

    // Call this on initialization to ensure the excluded words UI is present
    initExcludedWordsUI();
});
