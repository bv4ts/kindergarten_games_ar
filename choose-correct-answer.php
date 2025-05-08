<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>لعبة الكلمات الصحيحة - موقع ألعاب رياض الأطفال</title>
    <!-- Add Google Fonts Link -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
    <!-- Add Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <!-- Add our custom fonts CSS -->
    <link rel="stylesheet" href="css/fonts.css">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/choose-correct-answer.css">
</head>
<body>
    <!-- Custom Alert Modal -->
    <div id="customAlert" class="custom-alert-overlay">
        <div class="custom-alert-box">
            <div class="custom-alert-content">
                <div id="customAlertMessage"></div>
                <button id="customAlertOkBtn" class="btn primary-btn">موافق</button>
            </div>
        </div>
    </div>
    
    <!-- Custom Confirm Modal -->
    <div id="customConfirm" class="custom-alert-overlay">
        <div class="custom-alert-box">
            <div class="custom-alert-content">
                <div id="customConfirmMessage"></div>
                <div class="confirm-buttons">
                    <button id="customConfirmYesBtn" class="btn primary-btn">موافق</button>
                    <button id="customConfirmNoBtn" class="btn secondary-btn">لا</button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Custom Edit Word Modal -->
    <div id="customEditWord" class="custom-alert-overlay">
        <div class="custom-alert-box">
            <div class="custom-alert-content">
                <div id="customEditTitle">تعديل الكلمة</div>
                <input type="text" id="customEditInput" class="custom-edit-input">
                <div class="confirm-buttons">
                    <button id="customEditOkBtn" class="btn primary-btn">موافق</button>
                    <button id="customEditCancelBtn" class="btn secondary-btn">إلغاء</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Navbar -->
    <nav class="navbar">
        <div style="width: 60px;"></div> <!-- Empty spacer to balance the logo -->
        <div class="nav-links">
            <a href="#" class="nav-link">الصفحة الرئيسية</a>
            <a href="index.php" class="nav-link">الألعاب</a>
            <a href="#" class="nav-link">قريبًا</a>
        </div>
        <div class="logo">
            <img src="images/teddy-bear.png" alt="Teddy Bear Logo">
        </div>
    </nav>

    <!-- Game Setup Container -->
    <div class="game-container setup-mode" id="setupContainer">
        <!-- Left Section - Start Game Button -->
        <div class="section start-section">
            <button class="btn primary-btn" id="startGameBtn">
                <span>! ابدأ اللعبة</span>
                <div class="play-icon"><i class="bi bi-play-fill" style="font-size: 48px;"></i></div>
            </button>
        </div>

        <!-- Center Section - Game Settings -->
        <div class="section settings-section">
            <div class="section-title">إعدادات اللعبة</div>
            <div class="timer-setting">
                <input type="number" id="timerInput" value="60" min="10" max="300" class="numeric">
                <label for="timerInput"> : مؤقت</label>
            </div>
            <div class="game-buttons">
                <button class="btn save-btn" id="saveGameBtn"><i class="bi bi-download"></i> حفظ اللعبة</button>
                <button class="btn load-btn" id="loadGameBtn"><i class="bi bi-upload"></i> تحميل اللعبة</button>
                <input type="file" id="loadGameFile" accept=".kggs" style="display: none;">
            </div>
        </div>

        <!-- Right Section - Word Lists -->
        <div class="section words-section">
            <div class="section-title">الكلمات</div>
            
            <!-- Word Lists Container -->
            <div class="word-lists-container">
                <!-- Correct Words List -->
                <div class="word-list-section">
                    <div class="word-list-title">كلمات صحيحة</div>
                    <div class="word-cards" id="correctWordsList">
                        <!-- Correct word cards will be dynamically added here -->
                    </div>
                    <div class="word-input-container">
                        <input type="text" id="correctWordInput" placeholder="أدخل كلمة صحيحة...">
                        <button class="word-add-btn" id="addCorrectWordBtn">
                            <i class="bi bi-plus-lg"></i>
                        </button>
                    </div>
                    <div class="word-input-buttons">
                        <button class="word-input-button" id="addCorrectImageBtn">
                            <i class="bi bi-image"></i> أضف الصورة
                        </button>
                        <input type="file" id="correctImageUpload" accept="image/*" style="display: none;">
                    </div>
                </div>
                
                <!-- Excluded Words List -->
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
                    <div class="word-input-buttons">
                        <button class="word-input-button" id="addExcludedImageBtn">
                            <i class="bi bi-image"></i> أضف الصورة
                        </button>
                        <input type="file" id="excludedImageUpload" accept="image/*" style="display: none;">
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Game Play Container -->
    <div class="game-container play-mode" id="playContainer" style="display:none;">
        <!-- Countdown Overlay -->
        <div id="countdownOverlay" class="countdown-overlay">
            <div id="countdownNumber" class="countdown-number numeric">3</div>
        </div>
        
        <!-- Game Header -->
        <div class="game-header">
            <div class="game-score">
                <span>النقاط: </span>
                <span id="playerScore" class="numeric">0</span>
            </div>
            <div class="game-timer">
                <span>الوقت: </span>
                <span id="gameTimer" class="numeric">60</span>
            </div>
            <button class="exit-btn" id="exitGameBtn"><i class="bi bi-box-arrow-right"></i> خروج</button>
        </div>
        
        <!-- Game Grid -->
        <div class="game-grid" id="gameGrid">
            <!-- Grid items will be dynamically added here -->
        </div>
    </div>

    <script src="js/script.js"></script>
    <script src="js/choose-correct-answer.js"></script>
</body>
</html>
