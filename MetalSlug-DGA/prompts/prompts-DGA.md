# Prompt for Creating Metal Slug

Objetivo: Crear el juego MetalSlug-DGA (prototipo jugable) en este repo.
Requisitos:

- Carpeta: MetalSlug-DGA/
- Archivos: game.js, register.js, index.html, assets/assets.json (vacío), README.md.
- El juego debe correr tanto:
  1. Embebido desde el hub del repo (si existe window.registerGame(name, startFn)).
  2. De forma autónoma abriendo MetalSlug-DGA/index.html.
- Implementar en game.js un Metal Slug-like mínimo:
- Canvas 960×540 escalable a contenedor.
- Bucles: update(dt) y render(ctx, camera).
- Input: ← → para moverse, ↑ para saltar (coyote time 100ms, salto buffered 100ms), X disparar, P pausar, R reiniciar.
- Player con físicas: pos, vel, acc, gravedad, frenado en suelo, colisión con suelo/plataformas (AABB).
- Cámara siguiendo al player con lerp y límites de nivel.
- Balas (cadencia 9/s, velocidad 720 px/s, lifetime 0.9 s).
- Enemigos simples que patrullan entre dos puntos y hacen daño por contacto. Reciben 1 hit, mueren con knockback y desaparecen.
- Spawners definidos por x en el nivel; activan enemigos cuando la cámara los cruza.
- Terreno con segmentos {x,y,w,h,kind} y un fondo parallax (2 capas).
- HUD: vidas ♥♥♥, score, nivel de munición infinito, estado pausa/game over.
- Sin assets: usa colores/sombras; más tarde sustituiremos por sprites.
- Código limpio, modular y documentado. Sin librerías externas.
