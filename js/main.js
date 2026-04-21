import Jugador from './classes/Jugador.js';
import Enemic from './classes/Enemic.js';
import Bala from './classes/Bala.js';
import Gemma from './classes/Gemma.js';
import Millora from './classes/Millora.js';
import { 
    detectarColisioCercles, 
    detectarColisioRectangleCercle,
    obtenirEnemicMesProper,
    angleCapAObjecte,
    posicioAleatoriaVora 
} from './utils.js';

// ========== CONFIGURACIÓ INICIAL ==========
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const ample = canvas.width;
const alt = canvas.height;

// Elements UI
const startScreen = document.getElementById('start-screen');
const gameoverScreen = document.getElementById('gameover-screen');
const levelupScreen = document.getElementById('levelup-screen');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const healthBar = document.getElementById('health-bar');
const healthText = document.getElementById('health-text');
const xpBar = document.getElementById('xp-bar');
const xpText = document.getElementById('xp-text');
const levelDisplay = document.getElementById('level-display');
const timerDisplay = document.getElementById('timer-display');
const finalTimeSpan = document.getElementById('final-time');
const finalLevelSpan = document.getElementById('final-level');
const upgradeOptionsDiv = document.getElementById('upgrade-options');

// Estat del joc
let jugador;
let enemics = [];
let bales = [];
let gemmes = [];
let milloresDisponibles = [];
let estat = 'inici'; // 'inici', 'jugant', 'pujantNivell', 'gameover'
let gameOver = false;
let pausa = false;

// Temporitzador i dificultat
let tempsJoc = 0; // en segons
let frameCount = 0;
let spawnRate = 1.0;
let ultimSpawn = 0;
let velocitatBaseEnemic = 1.5;

// Input
const tecles = {
    w: false, a: false, s: false, d: false,
    up: false, left: false, down: false, right: false
};

// ========== INICIALITZACIÓ ==========
function inicialitzarJoc() {
    jugador = new Jugador(ample/2, alt/2);
    enemics = [];
    bales = [];
    gemmes = [];
    tempsJoc = 0;
    frameCount = 0;
    spawnRate = 1.0;
    velocitatBaseEnemic = 1.5;
    estat = 'jugant';
    gameOver = false;
    pausa = false;
    
    // Crear catàleg de millores (només un cop)
    if (milloresDisponibles.length === 0) {
        crearCatalegMillores();
    }
    
    actualitzarUI();
}

function crearCatalegMillores() {
    milloresDisponibles = [
        new Millora('dany_1', 'Més dany', '+10 dany', 'dany', 10),
        new Millora('dany_2', 'Dany letal', '+20 dany', 'dany', 20),
        new Millora('proj_1', 'Projectil extra', '+1 projectil', 'projectils', 1),
        new Millora('proj_2', 'Doble tret', '+2 projectils', 'projectils', 2),
        new Millora('tret_1', 'Tret ràpid', '-3 frames recàrrega', 'velocitat_tret', 3),
        new Millora('tret_2', 'Metralladora', '-5 frames recàrrega', 'velocitat_tret', 5),
        new Millora('mida_1', 'Projectils grans', '+4 mida', 'mida_projectil', 4),
        new Millora('mov_1', 'Més velocitat', '+1 velocitat mov.', 'velocitat_mov', 1),
        new Millora('vida_1', 'Més vida', '+25 vida màx.', 'vida_maxima', 25),
    ];
}

function actualitzarUI() {
    if (!jugador) return;
    
    const percentVida = (jugador.vida / jugador.vidaMaxima) * 100;
    healthBar.style.width = `${Math.max(0, percentVida)}%`;
    healthText.textContent = `${Math.max(0, jugador.vida)}/${jugador.vidaMaxima}`;
    
    const percentXP = (jugador.xp / jugador.xpPerNivell) * 100;
    xpBar.style.width = `${percentXP}%`;
    xpText.textContent = `${jugador.xp}/${jugador.xpPerNivell}`;
    
    levelDisplay.textContent = `Nivell ${jugador.nivell}`;
    timerDisplay.textContent = `Temps: ${Math.floor(tempsJoc)}s`;
}

// ========== GENERACIÓ D'ENEMICS ==========
function generarEnemic() {
    const pos = posicioAleatoriaVora(ample, alt, 30);
    const enemic = new Enemic(pos.x, pos.y, 14);
    enemic.velocitat = velocitatBaseEnemic;
    // Escalar vida segons temps
    enemic.vidaMaxima = 30 + Math.floor(tempsJoc * 2);
    enemic.vida = enemic.vidaMaxima;
    enemics.push(enemic);
}

// ========== DISPAR ==========
function disparar() {
    if (!jugador.potDisparar()) return;
    
    const enemicProper = obtenirEnemicMesProper(jugador, enemics);
    if (!enemicProper) return;
    
    const angle = angleCapAObjecte(jugador, enemicProper);
    const numProjectils = jugador.nombreProjectils;
    
    for (let i = 0; i < numProjectils; i++) {
        // Afegir una mica de dispersió si hi ha múltiples projectils
        let angleFinal = angle;
        if (numProjectils > 1) {
            const dispersio = 0.2;
            angleFinal = angle + (i - (numProjectils-1)/2) * dispersio;
        }
        
        const bala = new Bala(
            jugador.x, jugador.y, 
            angleFinal, 
            jugador.danyBase, 
            jugador.midaProjectil
        );
        bales.push(bala);
    }
    
    jugador.disparar();
}

// ========== ACTUALITZACIÓ DEL JOC ==========
function actualitzarJoc() {
    if (estat !== 'jugant' || pausa) return;
    
    // Moure jugador
    let dx = 0, dy = 0;
    if (tecles.w || tecles.up) dy -= 1;
    if (tecles.s || tecles.down) dy += 1;
    if (tecles.a || tecles.left) dx -= 1;
    if (tecles.d || tecles.right) dx += 1;
    
    if (dx !== 0 || dy !== 0) {
        // Normalitzar diagonal
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }
        jugador.moure(dx, dy, { ample, alt });
    }
    
    jugador.actualitzar();
    
    // Disparar automàticament
    disparar();
    
    // Actualitzar enemics
    enemics.forEach(enemic => enemic.actualitzar(jugador));
    
    // Actualitzar bales
    bales = bales.filter(bala => {
        bala.actualitzar();
        return !bala.foraDePantalla(ample, alt);
    });
    
    // Actualitzar gemmes
    gemmes.forEach(gemma => gemma.actualitzar(jugador));
    
    // Col·lisions bales-enemics
    for (let i = bales.length - 1; i >= 0; i--) {
        const bala = bales[i];
        for (let j = enemics.length - 1; j >= 0; j--) {
            const enemic = enemics[j];
            if (detectarColisioCercles(bala, enemic)) {
                const mort = enemic.rebreDany(bala.dany);
                bales.splice(i, 1);
                if (mort) {
                    // Generar gemma
                    const gemma = new Gemma(enemic.x, enemic.y, 20);
                    gemmes.push(gemma);
                    enemics.splice(j, 1);
                }
                break;
            }
        }
    }
    
    // Col·lisions jugador-enemics
    for (let i = enemics.length - 1; i >= 0; i--) {
        const enemic = enemics[i];
        if (detectarColisioRectangleCercle(enemic, jugador)) {
            const mort = jugador.rebreDany(enemic.danyContacte);
            enemics.splice(i, 1);
            if (mort) {
                estat = 'gameover';
                gameOver = true;
                finalTimeSpan.textContent = Math.floor(tempsJoc);
                finalLevelSpan.textContent = jugador.nivell;
                gameoverScreen.classList.remove('hidden');
            }
        }
    }
    
    // Col·lisions jugador-gemmes
    for (let i = gemmes.length - 1; i >= 0; i--) {
        const gemma = gemmes[i];
        if (detectarColisioCercles(jugador, gemma)) {
            const haPujat = jugador.afegirXP(gemma.valorXP);
            gemmes.splice(i, 1);
            if (haPujat) {
                pujarNivell();
            }
        }
    }
    
    // Generació d'enemics (basat en temps)
    if (frameCount % 30 === 0) { // aprox cada 0.5s a 60fps
        const numEnemics = Math.floor(spawnRate);
        for (let i = 0; i < numEnemics; i++) {
            generarEnemic();
        }
    }
    
    // Escalar dificultat cada 10 segons
    if (frameCount % 600 === 0 && frameCount > 0) {
        spawnRate += 0.5;
        velocitatBaseEnemic += 0.2;
    }
    
    // Actualitzar temps
    if (frameCount % 60 === 0) {
        tempsJoc++;
    }
    
    actualitzarUI();
}

function pujarNivell() {
    estat = 'pujantNivell';
    pausa = true;
    
    // Seleccionar 3 millores aleatòries
    const disponibles = milloresDisponibles.filter(m => m.potAplicar());
    const seleccionades = [];
    const numOpcions = Math.min(3, disponibles.length);
    
    for (let i = 0; i < numOpcions; i++) {
        const index = Math.floor(Math.random() * disponibles.length);
        seleccionades.push(disponibles.splice(index, 1)[0]);
    }
    
    // Mostrar opcions a la UI
    upgradeOptionsDiv.innerHTML = '';
    seleccionades.forEach(millora => {
        const div = document.createElement('div');
        div.className = 'upgrade-option';
        div.innerHTML = `<h3>${millora.nom}</h3><p>${millora.descripcio}</p>`;
        div.addEventListener('click', () => {
            jugador.aplicarMillora(millora);
            millora.aplicar();
            estat = 'jugant';
            pausa = false;
            levelupScreen.classList.add('hidden');
            actualitzarUI();
        });
        upgradeOptionsDiv.appendChild(div);
    });
    
    levelupScreen.classList.remove('hidden');
}

// ========== RENDERITZAT ==========
function dibuixar() {
    ctx.clearRect(0, 0, ample, alt);
    
    // Dibuixar jugador
    ctx.fillStyle = jugador.invencible ? '#3498db' : '#3498db';
    ctx.beginPath();
    ctx.arc(jugador.x, jugador.y, jugador.radi, 0, Math.PI * 2);
    ctx.fill();
    
    // Dibuixar enemics
    enemics.forEach(enemic => enemic.dibuixar(ctx));
    
    // Dibuixar bales
    bales.forEach(bala => bala.dibuixar(ctx));
    
    // Dibuixar gemmes
    gemmes.forEach(gemma => gemma.dibuixar(ctx));
}

// ========== BUCLE PRINCIPAL ==========
function bucle() {
    if (estat === 'jugant' && !pausa) {
        actualitzarJoc();
    }
    dibuixar();
    
    frameCount++;
    requestAnimationFrame(bucle);
}

// ========== ESDEVENIMENTS ==========
function setupEventListeners() {
    window.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (key === 'w' || key === 'arrowup') tecles.up = true;
        if (key === 's' || key === 'arrowdown') tecles.down = true;
        if (key === 'a' || key === 'arrowleft') tecles.left = true;
        if (key === 'd' || key === 'arrowright') tecles.right = true;
        if (key === 'w') tecles.w = true;
        if (key === 's') tecles.s = true;
        if (key === 'a') tecles.a = true;
        if (key === 'd') tecles.d = true;
        
        // Prevenir scroll amb fletxes
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) {
            e.preventDefault();
        }
    });
    
    window.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if (key === 'w' || key === 'arrowup') tecles.up = false;
        if (key === 's' || key === 'arrowdown') tecles.down = false;
        if (key === 'a' || key === 'arrowleft') tecles.left = false;
        if (key === 'd' || key === 'arrowright') tecles.right = false;
        if (key === 'w') tecles.w = false;
        if (key === 's') tecles.s = false;
        if (key === 'a') tecles.a = false;
        if (key === 'd') tecles.d = false;
    });
    
    startButton.addEventListener('click', () => {
        startScreen.classList.add('hidden');
        inicialitzarJoc();
    });
    
    restartButton.addEventListener('click', () => {
        gameoverScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
        // Reiniciar completament
        inicialitzarJoc();
    });
}

// ========== INICI ==========
setupEventListeners();
bucle(); // El bucle corre sempre, però només actualitza si estat === 'jugant'