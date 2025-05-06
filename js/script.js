/**
 * Main JavaScript for Kindergarten Games Website
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Kindergarten Games Website loaded successfully!');
    
    // Add animation to all game cards
    const gameCards = document.querySelectorAll('.game-card');
    
    gameCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});