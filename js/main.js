import Jugador from './classes/Jugador.js';
import Enemic from './classes/Enemic.js';
import { posicioAleatoriaVora } from './utils.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const ample = canvas.width;
const alt = canvas.height;

// Estado
let jugador;
let enemics = [];
let frameCount = 0;
let jocActiu = false;

// Input
const tecles = {
    w: false, a: false, s: false, d: false,
    up: false, left: false, down: false, right: false
};

function inicialitzar() {
    jugador = new Jugador(ample/2, alt/2);
    enemics = [];
    frameCount = 0;
    jocActiu = true;
}

function generarEnemic() {
    const pos = posicioAleatoriaVora(ample, alt, 30);
    enemics.push(new Enemic(pos.x, pos.y, 14));
}

function actualitzar() {
    if (!jocActiu) return;

    // Movimiento jugador
    let dx = 0, dy = 0;
    if (tecles.w || tecles.up) dy -= 1;
    if (tecles.s || tecles.down) dy += 1;
    if (tecles.a || tecles.left) dx -= 1;
    if (tecles.d || tecles.right) dx += 1;
    if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }
    jugador.moure(dx, dy, { ample, alt });

    // Generar enemigos cada ~0.5 segundos
    if (frameCount % 30 === 0) {
        generarEnemic();
    }

    // Actualizar enemigos
    enemics.forEach(e => e.actualitzar(jugador));

    frameCount++;
}

function dibuixar() {
    ctx.clearRect(0, 0, ample, alt);
    // Jugador
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(jugador.x, jugador.y, jugador.radi, 0, Math.PI*2);
    ctx.fill();
    // Enemics
    enemics.forEach(e => e.dibuixar(ctx));
}

function bucle() {
    actualitzar();
    dibuixar();
    requestAnimationFrame(bucle);
}

// Event listeners teclado
window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'w') tecles.w = true;
    if (k === 's') tecles.s = true;
    if (k === 'a') tecles.a = true;
    if (k === 'd') tecles.d = true;
    if (k === 'arrowup') tecles.up = true;
    if (k === 'arrowdown') tecles.down = true;
    if (k === 'arrowleft') tecles.left = true;
    if (k === 'arrowright') tecles.right = true;
});
window.addEventListener('keyup', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'w') tecles.w = false;
    if (k === 's') tecles.s = false;
    if (k === 'a') tecles.a = false;
    if (k === 'd') tecles.d = false;
    if (k === 'arrowup') tecles.up = false;
    if (k === 'arrowdown') tecles.down = false;
    if (k === 'arrowleft') tecles.left = false;
    if (k === 'arrowright') tecles.right = false;
});

// Iniciar
document.getElementById('start-button').addEventListener('click', () => {
    document.getElementById('start-screen').classList.add('hidden');
    inicialitzar();
});

bucle();