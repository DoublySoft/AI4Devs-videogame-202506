# MetalSlug-DGA 🎮

A minimal Metal Slug-like game prototype built with vanilla JavaScript and HTML5 Canvas. Features smooth physics, enemy AI, shooting mechanics, and a responsive camera system.

## 🚀 Features

### Core Gameplay
- **Player Physics**: Smooth movement with acceleration, gravity, and ground friction
- **Combat System**: Shooting mechanics with bullet physics and enemy damage
- **Enemy AI**: Patrolling enemies that spawn dynamically based on camera position
- **Level Design**: Procedural terrain with platforms and ground segments
- **Camera System**: Smooth camera following with parallax backgrounds

### Technical Features
- **Canvas Rendering**: 960×540 scalable canvas with responsive design
- **Game Loop**: Optimized update/render cycle with delta time
- **Collision Detection**: AABB collision system for all game objects
- **Input Handling**: Keyboard input with jump buffering and coyote time
- **State Management**: Game states (playing, paused, game over)

## 🎯 Gameplay

### Objective
Survive as long as possible by defeating enemies and avoiding damage. Use platforms strategically to gain tactical advantages.

### Controls
- **← →**: Move left/right
- **↑**: Jump (with coyote time and buffering)
- **X**: Shoot (9 shots per second)
- **P**: Pause/Resume game
- **R**: Restart game

### Mechanics
- **Jump Buffering**: 100ms window to buffer jump input
- **Coyote Time**: 100ms grace period for jumping after leaving ground
- **Knockback**: Enemies and player receive knockback on damage
- **Bullet Physics**: 720 px/s velocity with 0.9s lifetime

## 🏗️ Architecture

### Game Classes
- **MetalSlugGame**: Main game controller and loop
- **Player**: Player character with physics and input handling
- **Enemy**: AI-controlled enemies with patrol behavior
- **Bullet**: Projectile system with lifetime management

### Systems
- **Physics Engine**: Velocity, acceleration, and collision handling
- **Spawner System**: Dynamic enemy spawning based on camera position
- **Terrain System**: Modular level segments with collision detection
- **Camera System**: Smooth following with level bounds

## 📁 File Structure

```
MetalSlug-DGA/
├── game.js          # Main game engine and classes
├── register.js      # Game registration for hub environment
├── index.html       # Standalone game page
├── assets/
│   └── assets.json  # Empty assets file (placeholder)
└── README.md        # This file
```

## 🎮 How to Play

### Standalone Mode
1. Open `index.html` in a modern web browser
2. The game will start automatically
3. Use the controls to play

### Hub Integration
The game automatically detects if it's running in a hub environment and registers itself using `window.registerGame()`.

## 🔧 Technical Details

### Canvas Specifications
- **Resolution**: 960×540 pixels
- **Scaling**: Responsive scaling to fit container
- **Rendering**: 2D context with hardware acceleration

### Performance
- **Frame Rate**: 60 FPS target
- **Delta Time**: Capped at 1/30s to prevent large jumps
- **Memory Management**: Automatic cleanup of expired objects

### Browser Compatibility
- **Required**: HTML5 Canvas support
- **Recommended**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Mobile**: Responsive design with touch-friendly controls

## 🎨 Visual Style

### Graphics
- **Colors**: Vibrant color palette with good contrast
- **Shapes**: Simple geometric shapes for clear gameplay
- **Effects**: Shadows and gradients for depth
- **Parallax**: Two-layer background system

### UI Elements
- **HUD**: Lives (hearts), score, and ammo display
- **Overlays**: Pause and game over screens
- **Responsive**: Adapts to different screen sizes

## 🚧 Future Enhancements

### Planned Features
- **Sprite System**: Replace geometric shapes with pixel art
- **Sound Effects**: Audio feedback for actions
- **Power-ups**: Collectible items and abilities
- **Level Progression**: Multiple levels with increasing difficulty
- **Save System**: High score persistence

### Technical Improvements
- **WebGL Rendering**: Hardware-accelerated graphics
- **Particle Effects**: Enhanced visual feedback
- **Mobile Support**: Touch controls and mobile optimization
- **Performance**: Web Workers for physics calculations

## 🤝 Contributing

This is a prototype game created for educational purposes. Feel free to:
- Fork and modify the code
- Add new features
- Improve performance
- Create new levels
- Add sound and music

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Inspired by classic Metal Slug games
- Built with vanilla JavaScript for maximum compatibility
- Designed for educational and prototyping purposes

---

**Enjoy playing MetalSlug-DGA!** 🎮✨
