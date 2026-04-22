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

// ========== ESPERAR QUE EL DOM ESTIGUI LLEST ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregat. Inicialitzant Dead Rush...');
    
    // ========== REFERÈNCIES A ELEMENTS DEL DOM ==========
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const ample = canvas.width;
    const alt = canvas.height;

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

    // ========== VARIABLES GLOBALS DEL JOC ==========
    let jugador;
    let enemics = [];
    let bales = [];
    let gemmes = [];
    let milloresDisponibles = [];
    let estat = 'inici'; // 'inici', 'jugant', 'pujantNivell', 'gameover'
    let pausa = false;

    let tempsJoc = 0;
    let comptadorFrames = 0;
    let taxaAparicio = 1.0;
    let velocitatBaseEnemic = 1.5;

    const tecles = {
        w: false, a: false, s: false, d: false,
        amunt: false, esquerra: false, avall: false, dreta: false
    };

    // ========== FUNCIONS D'INICIALITZACIÓ I UI ==========
    
    /** Crea el catàleg de millores disponibles al joc. */
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

    /** Actualitza tots els elements de la interfície d'usuari. */
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

    /** Inicialitza o reinicia l'estat complet del joc. */
    function inicialitzarJoc() {
        jugador = new Jugador(ample/2, alt/2);
        enemics = [];
        bales = [];
        gemmes = [];
        tempsJoc = 0;
        comptadorFrames = 0;
        taxaAparicio = 1.0;
        velocitatBaseEnemic = 1.5;
        estat = 'jugant';
        pausa = false;
        
        if (milloresDisponibles.length === 0) {
            crearCatalegMillores();
        }
        
        actualitzarUI();
        console.log('Joc inicialitzat. Jugador a:', jugador.x, jugador.y);
    }

    // ========== GENERACIÓ D'ENEMICS ==========
    
    /** Crea un nou enemic en una posició aleatòria de la vora del canvas. */
    function generarEnemic() {
        const pos = posicioAleatoriaVora(ample, alt, 30);
        const enemic = new Enemic(pos.x, pos.y, 14);
        enemic.velocitat = velocitatBaseEnemic;
        enemic.vidaMaxima = 30 + Math.floor(tempsJoc * 2);
        enemic.vida = enemic.vidaMaxima;
        enemics.push(enemic);
    }

    // ========== DISPAR ==========
    
    /** Gestiona el tret automàtic del jugador cap a l'enemic més proper. */
    function processarDispars() {
        if (!jugador || !jugador.potDisparar()) return;
        
        const enemicProper = obtenirEnemicMesProper(jugador, enemics);
        if (!enemicProper) return;
        
        const angleBase = angleCapAObjecte(jugador, enemicProper);
        const nombreProjectils = jugador.nombreProjectils;
        
        for (let i = 0; i < nombreProjectils; i++) {
            let angleFinal = angleBase;
            if (nombreProjectils > 1) {
                const dispersio = 0.2;
                angleFinal = angleBase + (i - (nombreProjectils - 1) / 2) * dispersio;
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

    // ========== ACTUALITZACIÓ D'ENTITATS ==========
    
    /** Mou el jugador segons les tecles premudes. */
    function processarMovimentJugador() {
        let dirX = 0, dirY = 0;
        if (tecles.w || tecles.amunt) dirY -= 1;
        if (tecles.s || tecles.avall) dirY += 1;
        if (tecles.a || tecles.esquerra) dirX -= 1;
        if (tecles.d || tecles.dreta) dirX += 1;
        
        if (dirX !== 0 || dirY !== 0) {
            if (dirX !== 0 && dirY !== 0) {
                dirX *= 0.707;
                dirY *= 0.707;
            }
            jugador.moure(dirX, dirY, { ample, alt });
        }
        jugador.actualitzar();
    }

    /** Actualitza la posició de tots els enemics, bales i gemmes. */
    function actualitzarEntitats() {
        enemics.forEach(enemic => enemic.actualitzar(jugador));
        
        bales = bales.filter(bala => {
            bala.actualitzar();
            return !bala.foraDePantalla(ample, alt);
        });
        
        gemmes.forEach(gemma => gemma.actualitzar(jugador));
    }

    // ========== COL·LISIONS ==========
    
    /** Comprova i resol totes les col·lisions del joc. */
    function processarColisions() {
        // Bales vs Enemics
        for (let i = bales.length - 1; i >= 0; i--) {
            const bala = bales[i];
            for (let j = enemics.length - 1; j >= 0; j--) {
                const enemic = enemics[j];
                if (detectarColisioCercles(bala, enemic)) {
                    const mort = enemic.rebreDany(bala.dany);
                    bales.splice(i, 1);
                    if (mort) {
                        const gemma = new Gemma(enemic.x, enemic.y, 20);
                        gemmes.push(gemma);
                        enemics.splice(j, 1);
                    }
                    break;
                }
            }
        }
        
        // Jugador vs Enemics
        for (let i = enemics.length - 1; i >= 0; i--) {
            const enemic = enemics[i];
            if (detectarColisioRectangleCercle(enemic, jugador)) {
                const mort = jugador.rebreDany(enemic.danyContacte);
                enemics.splice(i, 1);
                if (mort) {
                    estat = 'gameover';
                    finalTimeSpan.textContent = Math.floor(tempsJoc);
                    finalLevelSpan.textContent = jugador.nivell;
                    gameoverScreen.classList.remove('hidden');
                }
            }
        }
        
        // Jugador vs Gemmes
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
    }

    // ========== GENERACIÓ I DIFICULTAT ==========
    
    /** Genera enemics segons la taxa actual d'aparició. */
    function generarEnemicsPerTemps() {
        if (comptadorFrames % 30 === 0) {
            const numEnemics = Math.floor(taxaAparicio);
            for (let i = 0; i < numEnemics; i++) {
                generarEnemic();
            }
        }
    }

    /** Incrementa progressivament la dificultat del joc. */
    function escalarDificultat() {
        if (comptadorFrames % 600 === 0 && comptadorFrames > 0) {
            taxaAparicio += 0.5;
            velocitatBaseEnemic += 0.2;
        }
    }

    // ========== PUJADA DE NIVELL ==========
    
    /** Pausa el joc i mostra el panell de selecció de millores. */
    function pujarNivell() {
        estat = 'pujantNivell';
        pausa = true;
        
        const disponibles = milloresDisponibles.filter(m => m.potAplicar());
        const seleccionades = [];
        const numOpcions = Math.min(3, disponibles.length);
        
        for (let i = 0; i < numOpcions; i++) {
            const index = Math.floor(Math.random() * disponibles.length);
            seleccionades.push(disponibles.splice(index, 1)[0]);
        }
        
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

    // ========== ACTUALITZACIÓ PRINCIPAL DEL JOC ==========
    
    /** Funció principal que actualitza tota la lògica del joc en cada frame. */
    function actualitzarJoc() {
        if (estat !== 'jugant' || pausa) return;
        
        processarMovimentJugador();
        processarDispars();
        actualitzarEntitats();
        processarColisions();
        generarEnemicsPerTemps();
        escalarDificultat();
        
        if (comptadorFrames % 60 === 0) {
            tempsJoc++;
        }
        
        actualitzarUI();
    }

    // ========== RENDERITZAT ==========
    
    /** Dibuixa tots els elements del joc al canvas. */
    function dibuixar() {
        ctx.clearRect(0, 0, ample, alt);
        
        if (jugador) {
            ctx.fillStyle = jugador.invencible ? '#3498db' : '#3498db';
            ctx.beginPath();
            ctx.arc(jugador.x, jugador.y, jugador.radi, 0, Math.PI * 2);
            ctx.fill();
        }
        
        enemics.forEach(enemic => enemic.dibuixar(ctx));
        bales.forEach(bala => bala.dibuixar(ctx));
        gemmes.forEach(gemma => gemma.dibuixar(ctx));
    }

    // ========== BUCLE PRINCIPAL ==========
    
    /** Bucle d'animació principal (executat contínuament per requestAnimationFrame). */
    function bucle() {
        if (estat === 'jugant' && !pausa) {
            actualitzarJoc();
        }
        dibuixar();
        comptadorFrames++;
        requestAnimationFrame(bucle);
    }

    // ========== ESDEVENIMENTS ==========
    
    /** Configura els listeners de teclat i botons. */
    function configurarEsdeveniments() {
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (key === 'w' || key === 'arrowup') tecles.amunt = true;
            if (key === 's' || key === 'arrowdown') tecles.avall = true;
            if (key === 'a' || key === 'arrowleft') tecles.esquerra = true;
            if (key === 'd' || key === 'arrowright') tecles.dreta = true;
            if (key === 'w') tecles.w = true;
            if (key === 's') tecles.s = true;
            if (key === 'a') tecles.a = true;
            if (key === 'd') tecles.d = true;
            
            if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (key === 'w' || key === 'arrowup') tecles.amunt = false;
            if (key === 's' || key === 'arrowdown') tecles.avall = false;
            if (key === 'a' || key === 'arrowleft') tecles.esquerra = false;
            if (key === 'd' || key === 'arrowright') tecles.dreta = false;
            if (key === 'w') tecles.w = false;
            if (key === 's') tecles.s = false;
            if (key === 'a') tecles.a = false;
            if (key === 'd') tecles.d = false;
        });
        
        startButton.addEventListener('click', () => {
            console.log('Començar clicat');
            startScreen.classList.add('hidden');
            inicialitzarJoc();
        });
        
        restartButton.addEventListener('click', () => {
            console.log('Reiniciar clicat');
            gameoverScreen.classList.add('hidden');
            inicialitzarJoc();
            startScreen.classList.add('hidden');
        });
    }

    // ========== INICIAR TOT ==========
    console.log('Configurant esdeveniments...');
    configurarEsdeveniments();
    
    console.log('Iniciant bucle...');
    bucle();
});