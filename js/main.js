import Jugador from './classes/Jugador.js';
import Enemic from './classes/Enemic.js';
import Bala from './classes/Bala.js';
import Gemma from './classes/Gemma.js';
import Millora from './classes/Millora.js';
import audio from './audio.js';
import {
    detectarColisioCercles,
    detectarColisioRectangleCercle,
    obtenirEnemicMesProper,
    angleCapAObjecte,
    posicioAleatoriaVora
} from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicialitzant Dead Rush...');

    // ========== REFERÈNCIES DOM ==========
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const ample = canvas.width;
    const alt = canvas.height;

    const startScreen = document.getElementById('start-screen');
    const gameoverScreen = document.getElementById('gameover-screen');
    const levelupScreen = document.getElementById('levelup-screen');
    const pauseMenu = document.getElementById('pause-menu');
    const settingsScreen = document.getElementById('settings-screen');
    const customizeScreen = document.getElementById('customize-screen');

    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const pauseButton = document.getElementById('pause-button');
    const resumeButton = document.getElementById('resume-button');
    const quitButton = document.getElementById('quit-button');
    const settingsButtonStart = document.getElementById('settings-button-start');
    const settingsButtonPause = document.getElementById('settings-button-pause');
    const backButtonSettings = document.getElementById('back-button-settings');
    const fullscreenToggle = document.getElementById('fullscreen-toggle');
    const musicToggle = document.getElementById('music-toggle');
    const sfxToggle = document.getElementById('sfx-toggle');
    const musicVolume = document.getElementById('music-volume');
    const sfxVolume = document.getElementById('sfx-volume');
    const customizeButton = document.getElementById('customize-button');
    const uploadImage = document.getElementById('upload-image');
    const cameraImage = document.getElementById('camera-image');
    const resetImage = document.getElementById('reset-image');
    const imageInput = document.getElementById('image-input');
    const cameraPreview = document.getElementById('camera-preview');
    const cameraCanvas = document.getElementById('camera-canvas');
    const backButtonCustomize = document.getElementById('back-button-customize');
    const previewCanvas = document.getElementById('preview-canvas');
    const previewZombie = document.getElementById('preview-zombie');
    const uploadZombieBtn = document.getElementById('upload-zombie');
    const resetZombieBtn = document.getElementById('reset-zombie');
    const zombieInput = document.getElementById('zombie-input');

    const healthBar = document.getElementById('health-bar');
    const healthText = document.getElementById('health-text');
    const xpBar = document.getElementById('xp-bar');
    const xpText = document.getElementById('xp-text');
    const levelDisplay = document.getElementById('level-display');
    const timerDisplay = document.getElementById('timer-display');
    const finalTimeSpan = document.getElementById('final-time');
    const finalLevelSpan = document.getElementById('final-level');
    const upgradeOptionsDiv = document.getElementById('upgrade-options');

    // ========== VARIABLES GLOBALS ==========
    let jugador;
    let enemics = [];
    let bales = [];
    let gemmes = [];
    let milloresDisponibles = [];
    let estat = 'inici';
    let pausa = false;
    let pantallaActual = 'inici';
    let imatgePersonalitzada = null;   // Image per al jugador
    let imatgeZombie = null;          // Image per als enemics
    let cameraStream = null;          // Per tancar la càmera netament

    let tempsJoc = 0;
    let comptadorFrames = 0;
    let taxaAparicio = 1.0;
    let velocitatBaseEnemic = 1.5;

    const tecles = {
        w: false, a: false, s: false, d: false,
        amunt: false, esquerra: false, avall: false, dreta: false
    };

    // ========== FUNCIONS D'INICIALITZACIÓ I UI ==========

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
        const pctVida = Math.max(0, (jugador.vida / jugador.vidaMaxima) * 100);
        healthBar.style.width = `${pctVida}%`;
        healthText.textContent = `${jugador.vida}/${jugador.vidaMaxima}`;
        const pctXP = (jugador.xp / jugador.xpPerNivell) * 100;
        xpBar.style.width = `${pctXP}%`;
        xpText.textContent = `${jugador.xp}/${jugador.xpPerNivell}`;
        levelDisplay.textContent = `Nivell ${jugador.nivell}`;
        timerDisplay.textContent = `Temps: ${Math.floor(tempsJoc)}s`;
    }

    function inicialitzarJoc() {
        jugador = new Jugador(ample / 2, alt / 2);
        enemics = [];
        bales = [];
        gemmes = [];
        tempsJoc = 0;
        comptadorFrames = 0;
        taxaAparicio = 1.0;
        velocitatBaseEnemic = 1.5;
        estat = 'jugant';
        pausa = false;
        if (milloresDisponibles.length === 0) crearCatalegMillores();
        actualitzarUI();
        pauseButton.style.display = 'block';
    }

    // ---------- Dibuixar imatge respectant relació d'aspecte ----------
    function dibuixarImatgeCentrada(ctxImg, img, xCentre, yCentre, midaMax) {
        const rx = img.width / img.height;
        let w, h;
        if (rx > 1) {
            w = midaMax;
            h = midaMax / rx;
        } else {
            h = midaMax;
            w = midaMax * rx;
        }
        ctxImg.drawImage(img, xCentre - w/2, yCentre - h/2, w, h);
    }

    // ---------- Actualitza les vistes prèvies ----------
    function actualitzarVistaPrevia() {
        const ctxP = previewCanvas.getContext('2d');
        ctxP.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        if (imatgePersonalitzada) {
            dibuixarImatgeCentrada(ctxP, imatgePersonalitzada, previewCanvas.width/2, previewCanvas.height/2, previewCanvas.width);
        } else {
            // Dibuixar cercle blau per defecte
            ctxP.fillStyle = '#3498db';
            ctxP.beginPath();
            ctxP.arc(previewCanvas.width/2, previewCanvas.height/2, 40, 0, Math.PI*2);
            ctxP.fill();
        }

        const ctxZ = previewZombie.getContext('2d');
        ctxZ.clearRect(0, 0, previewZombie.width, previewZombie.height);
        if (imatgeZombie) {
            dibuixarImatgeCentrada(ctxZ, imatgeZombie, previewZombie.width/2, previewZombie.height/2, previewZombie.width);
        } else {
            // Dibuixar quadrat vermell
            ctxZ.fillStyle = '#e74c3c';
            const mida = 60;
            ctxZ.fillRect(previewZombie.width/2 - mida/2, previewZombie.height/2 - mida/2, mida, mida);
        }
    }

    // ---------- Gestió de càmera ----------
    async function obrirCamera() {
        try {
            if (cameraStream) {
                cameraStream.getTracks().forEach(t => t.stop());
            }
            cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            cameraPreview.srcObject = cameraStream;
            cameraPreview.style.display = 'block';
            // Crear botó de capturar (un sol cop)
            if (!document.getElementById('capture-btn')) {
                const captureBtn = document.createElement('button');
                captureBtn.id = 'capture-btn';
                captureBtn.textContent = 'Capturar';
                captureBtn.style.margin = '10px auto';
                captureBtn.style.display = 'block';
                cameraImage.parentNode.appendChild(captureBtn);
                captureBtn.addEventListener('click', () => {
                    const ctxCam = cameraCanvas.getContext('2d');
                    cameraCanvas.width = cameraPreview.videoWidth;
                    cameraCanvas.height = cameraPreview.videoHeight;
                    ctxCam.drawImage(cameraPreview, 0, 0);
                    imatgePersonalitzada = new Image();
                    imatgePersonalitzada.src = cameraCanvas.toDataURL('image/png');
                    tancarCamera();
                    actualitzarVistaPrevia();
                });
            }
        } catch (e) {
            alert('No s\'ha pogut accedir a la càmera');
        }
    }

    function tancarCamera() {
        if (cameraStream) {
            cameraStream.getTracks().forEach(t => t.stop());
            cameraStream = null;
        }
        cameraPreview.style.display = 'none';
        const captureBtn = document.getElementById('capture-btn');
        if (captureBtn) captureBtn.remove();
    }

    // ---------- Generació d'enemics ----------
    function generarEnemic() {
        const pos = posicioAleatoriaVora(ample, alt, 30);
        const enemic = new Enemic(pos.x, pos.y, 14);
        enemic.velocitat = velocitatBaseEnemic;
        enemic.vidaMaxima = 30 + Math.floor(tempsJoc * 2);
        enemic.vida = enemic.vidaMaxima;
        enemics.push(enemic);
    }

    function processarDispars() {
        if (!jugador || !jugador.potDisparar()) return;
        const enemicProper = obtenirEnemicMesProper(jugador, enemics);
        if (!enemicProper) return;
        const angleBase = angleCapAObjecte(jugador, enemicProper);
        const nProjectils = jugador.nombreProjectils;
        for (let i = 0; i < nProjectils; i++) {
            let angle = angleBase;
            if (nProjectils > 1) {
                const d = 0.2;
                angle = angleBase + (i - (nProjectils-1)/2) * d;
            }
            bales.push(new Bala(jugador.x, jugador.y, angle, jugador.danyBase, jugador.midaProjectil));
        }
        jugador.disparar();
        audio.reproduirEfecte('tret');
    }

    function processarMovimentJugador() {
        let dirX = 0, dirY = 0;
        if (tecles.w || tecles.amunt) dirY -= 1;
        if (tecles.s || tecles.avall) dirY += 1;
        if (tecles.a || tecles.esquerra) dirX -= 1;
        if (tecles.d || tecles.dreta) dirX += 1;
        if (dirX !== 0 || dirY !== 0) {
            if (dirX && dirY) { dirX *= 0.707; dirY *= 0.707; }
            jugador.moure(dirX, dirY, { ample, alt });
        }
        jugador.actualitzar();
    }

    function actualitzarEntitats() {
        enemics.forEach(e => e.actualitzar(jugador));
        bales = bales.filter(b => { b.actualitzar(); return !b.foraDePantalla(ample, alt); });
        gemmes.forEach(g => g.actualitzar(jugador));
    }

    function processarColisions() {
        // Bales vs Enemics
        for (let i = bales.length-1; i >= 0; i--) {
            for (let j = enemics.length-1; j >= 0; j--) {
                if (detectarColisioCercles(bales[i], enemics[j])) {
                    if (enemics[j].rebreDany(bales[i].dany)) {
                        gemmes.push(new Gemma(enemics[j].x, enemics[j].y, 20));
                        enemics.splice(j, 1);
                    }
                    bales.splice(i, 1);
                    break;
                }
            }
        }
        // Jugador vs Enemics
        for (let i = enemics.length-1; i >= 0; i--) {
            if (detectarColisioRectangleCercle(enemics[i], jugador)) {
                const mort = jugador.rebreDany(enemics[i].danyContacte);
                enemics.splice(i, 1);
                if (mort) {
                    estat = 'gameover';
                    finalTimeSpan.textContent = Math.floor(tempsJoc);
                    finalLevelSpan.textContent = jugador.nivell;
                    gameoverScreen.classList.remove('hidden');
                    pauseButton.style.display = 'none';
                    audio.reproduirEfecte('gameOver');
                }
            }
        }
        // Jugador vs Gemmes
        for (let i = gemmes.length-1; i >= 0; i--) {
            if (detectarColisioCercles(jugador, gemmes[i])) {
                const haPujat = jugador.afegirXP(gemmes[i].valorXP);
                gemmes.splice(i, 1);
                audio.reproduirEfecte('recollirGemma');
                if (haPujat) pujarNivell();
            }
        }
    }

    function generarEnemicsPerTemps() {
        if (comptadorFrames % 30 === 0) {
            const num = Math.floor(taxaAparicio);
            for (let i = 0; i < num; i++) generarEnemic();
        }
    }

    function escalarDificultat() {
        if (comptadorFrames % 600 === 0 && comptadorFrames > 0) {
            taxaAparicio += 0.5;
            velocitatBaseEnemic += 0.2;
        }
    }

    function pujarNivell() {
        estat = 'pujantNivell';
        pausa = true;
        audio.reproduirEfecte('pujarNivell');
        const disponibles = milloresDisponibles.filter(m => m.potAplicar());
        const triades = [];
        for (let i = 0; i < Math.min(3, disponibles.length); i++) {
            const idx = Math.floor(Math.random() * disponibles.length);
            triades.push(disponibles.splice(idx, 1)[0]);
        }
        upgradeOptionsDiv.innerHTML = '';
        triades.forEach(m => {
            const div = document.createElement('div');
            div.className = 'upgrade-option';
            div.innerHTML = `<h3>${m.nom}</h3><p>${m.descripcio}</p>`;
            div.addEventListener('click', () => {
                jugador.aplicarMillora(m);
                m.aplicar();
                estat = 'jugant';
                pausa = false;
                levelupScreen.classList.add('hidden');
                actualitzarUI();
            });
            upgradeOptionsDiv.appendChild(div);
        });
        levelupScreen.classList.remove('hidden');
    }

    // ========== Navegació ==========
    function obrirAjustos(origen) {
        pantallaActual = origen;
        settingsScreen.classList.remove('hidden');
    }
    function tancarAjustos() {
        settingsScreen.classList.add('hidden');
        if (pantallaActual === 'inici') startScreen.classList.remove('hidden');
        else if (pantallaActual === 'pausa') pauseMenu.classList.remove('hidden');
    }
    function alternarPantallaCompleta() {
        const container = document.getElementById('game-container');
        if (!document.fullscreenElement) container.requestFullscreen();
        else document.exitFullscreen();
    }

    // ========== Dibuixar ==========
    function dibuixar() {
        ctx.clearRect(0, 0, ample, alt);
        // Jugador
        if (jugador) {
            if (imatgePersonalitzada) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(jugador.x, jugador.y, jugador.radi, 0, Math.PI*2);
                ctx.clip();
                dibuixarImatgeCentrada(ctx, imatgePersonalitzada, jugador.x, jugador.y, jugador.radi*2);
                ctx.restore();
            } else {
                ctx.fillStyle = '#3498db';
                ctx.beginPath();
                ctx.arc(jugador.x, jugador.y, jugador.radi, 0, Math.PI*2);
                ctx.fill();
            }
        }
        // Enemics
        enemics.forEach(enemic => {
            if (imatgeZombie) {
                ctx.drawImage(imatgeZombie, enemic.x - enemic.radi, enemic.y - enemic.radi, enemic.radi*2, enemic.radi*2);
                // Barra de vida
                const ampleVida = (enemic.vida / enemic.vidaMaxima) * (enemic.radi*2);
                ctx.fillStyle = '#2ecc71';
                ctx.fillRect(enemic.x - enemic.radi, enemic.y - enemic.radi - 8, ampleVida, 4);
            } else {
                enemic.dibuixar(ctx);
            }
        });
        // Bales
        bales.forEach(b => b.dibuixar(ctx));
        // Gemmes
        gemmes.forEach(g => g.dibuixar(ctx));
    }

    function bucle() {
        if (estat === 'jugant' && !pausa) actualitzarJoc();
        dibuixar();
        comptadorFrames++;
        requestAnimationFrame(bucle);
    }

    function actualitzarJoc() {
        processarMovimentJugador();
        processarDispars();
        actualitzarEntitats();
        processarColisions();
        generarEnemicsPerTemps();
        escalarDificultat();
        if (comptadorFrames % 60 === 0) tempsJoc++;
        actualitzarUI();
    }

    // ========== ESDEVENIMENTS ==========
    function configurarEsdeveniments() {
        window.addEventListener('keydown', e => {
            const k = e.key.toLowerCase();
            if (k === 'w' || k === 'arrowup') tecles.amunt = true;
            if (k === 's' || k === 'arrowdown') tecles.avall = true;
            if (k === 'a' || k === 'arrowleft') tecles.esquerra = true;
            if (k === 'd' || k === 'arrowright') tecles.dreta = true;
            if (k === 'w') tecles.w = true;
            if (k === 's') tecles.s = true;
            if (k === 'a') tecles.a = true;
            if (k === 'd') tecles.d = true;
            if (['arrowup','arrowdown','arrowleft','arrowright'].includes(k)) e.preventDefault();
        });
        window.addEventListener('keyup', e => {
            const k = e.key.toLowerCase();
            if (k === 'w' || k === 'arrowup') tecles.amunt = false;
            if (k === 's' || k === 'arrowdown') tecles.avall = false;
            if (k === 'a' || k === 'arrowleft') tecles.esquerra = false;
            if (k === 'd' || k === 'arrowright') tecles.dreta = false;
            if (k === 'w') tecles.w = false;
            if (k === 's') tecles.s = false;
            if (k === 'a') tecles.a = false;
            if (k === 'd') tecles.d = false;
        });

        startButton.onclick = () => { startScreen.classList.add('hidden'); inicialitzarJoc(); audio.reproduirEfecte('clicBoto'); };
        restartButton.onclick = () => { gameoverScreen.classList.add('hidden'); inicialitzarJoc(); startScreen.classList.add('hidden'); audio.reproduirEfecte('clicBoto'); };

        pauseButton.onclick = () => { pausa = true; pauseMenu.classList.remove('hidden'); audio.reproduirEfecte('clicBoto'); };
        resumeButton.onclick = () => { pausa = false; pauseMenu.classList.add('hidden'); audio.reproduirEfecte('clicBoto'); };
        quitButton.onclick = () => {
            pausa = false; pauseMenu.classList.add('hidden'); pauseButton.style.display = 'none';
            gameoverScreen.classList.add('hidden'); startScreen.classList.remove('hidden'); estat = 'inici';
            audio.reproduirEfecte('clicBoto');
        };

        settingsButtonStart.onclick = () => { startScreen.classList.add('hidden'); obrirAjustos('inici'); audio.reproduirEfecte('clicBoto'); };
        settingsButtonPause.onclick = () => { pauseMenu.classList.add('hidden'); obrirAjustos('pausa'); audio.reproduirEfecte('clicBoto'); };
        backButtonSettings.onclick = () => { tancarAjustos(); audio.reproduirEfecte('clicBoto'); };

        fullscreenToggle.onclick = () => { alternarPantallaCompleta(); audio.reproduirEfecte('clicBoto'); };

        musicToggle.onchange = e => audio.alternarMusica(e.target.checked);
        sfxToggle.onchange = e => audio.alternarEfectes(e.target.checked);
        musicVolume.oninput = e => audio.canviarVolumMusica(parseInt(e.target.value)/100);
        sfxVolume.oninput = e => audio.canviarVolumEfectes(parseInt(e.target.value)/100);

        // Personalització personatge
        customizeButton.onclick = () => { startScreen.classList.add('hidden'); customizeScreen.classList.remove('hidden'); actualitzarVistaPrevia(); audio.reproduirEfecte('clicBoto'); };
        backButtonCustomize.onclick = () => { customizeScreen.classList.add('hidden'); startScreen.classList.remove('hidden'); tancarCamera(); audio.reproduirEfecte('clicBoto'); };

        uploadImage.onclick = () => { imageInput.click(); audio.reproduirEfecte('clicBoto'); };
        imageInput.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => {
                imatgePersonalitzada = new Image();
                imatgePersonalitzada.onload = () => actualitzarVistaPrevia();
                imatgePersonalitzada.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        };

        cameraImage.onclick = () => { obrirCamera(); audio.reproduirEfecte('clicBoto'); };
        resetImage.onclick = () => { imatgePersonalitzada = null; actualitzarVistaPrevia(); audio.reproduirEfecte('clicBoto'); };

        // Personalització zombies
        uploadZombieBtn.onclick = () => { zombieInput.click(); audio.reproduirEfecte('clicBoto'); };
        zombieInput.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => {
                imatgeZombie = new Image();
                imatgeZombie.onload = () => actualitzarVistaPrevia();
                imatgeZombie.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        };
        resetZombieBtn.onclick = () => { imatgeZombie = null; actualitzarVistaPrevia(); audio.reproduirEfecte('clicBoto'); };
    }

    configurarEsdeveniments();
    bucle();

    audio.inicialitzar();
    document.addEventListener('click', function iniciarAudio() {
        audio.reproduirMusica();
        document.removeEventListener('click', iniciarAudio);
    }, { once: true });
});