/**
 * MetalSlug-DGA Game Registration
 * Handles game registration for the hub environment
 */

// Game metadata
const gameInfo = {
    name: 'MetalSlug-DGA',
    title: 'Metal Slug DGA',
    description: 'A minimal Metal Slug-like game with physics, enemies, and shooting mechanics',
    author: 'DGA',
    version: '1.0.0',
    category: 'Action',
    tags: ['platformer', 'shooter', 'arcade'],
    controls: {
        'Arrow Keys': 'Move and jump',
        'X': 'Shoot',
        'P': 'Pause',
        'R': 'Restart'
    }
};

// Register game with hub if available
if (typeof window !== 'undefined') {
    if (window.registerGame) {
        // Hub environment - register the game
        window.registerGame(gameInfo.name, startGame);
        
        // Also register game info if the hub supports it
        if (window.registerGameInfo) {
            window.registerGameInfo(gameInfo.name, gameInfo);
        }
    } else {
        // Standalone environment - start game automatically
        window.addEventListener('DOMContentLoaded', () => {
            startGame();
        });
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { gameInfo, startGame };
}
