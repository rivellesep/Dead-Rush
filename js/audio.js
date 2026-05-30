// js/audio.js
// Gestor centralitzat de so i música

const audio = {
    musicaFons: null,
    efectes: {},
    volumGeneral: 1.0,
    volumMusica: 0.5,
    volumEfectes: 0.7,
    musicaActivada: true,
    efectesActivats: true,

    /**
     * Inicialitza tots els sons carregant els fitxers d'àudio.
     */
    inicialitzar() {
        this.musicaFons = new Audio('assets/audio/musica_fons.mp3');
        this.musicaFons.loop = true;
        this.musicaFons.volume = this.volumMusica;

        this.efectes.tret = new Audio('assets/audio/tret.mp3');
        this.efectes.pujarNivell = new Audio('assets/audio/pujar_nivell.mp3');
        this.efectes.recollirGemma = new Audio('assets/audio/recollir_gemma.mp3');
        this.efectes.gameOver = new Audio('assets/audio/game_over.mp3');
        this.efectes.clicBoto = new Audio('assets/audio/clic_boto.mp3');

        Object.values(this.efectes).forEach(efecte => {
            efecte.volume = this.volumEfectes;
        });
    },

    /** Reprodueix la música de fons (requereix interacció prèvia de l'usuari). */
    reproduirMusica() {
        if (this.musicaActivada && this.musicaFons) {
            this.musicaFons.play().catch(() => {});
        }
    },

    /** Pausa la música de fons. */
    pausarMusica() {
        this.musicaFons?.pause();
    },

    /** Reprodueix un efecte de so. @param {string} nom - Nom de l'efecte. */
    reproduirEfecte(nom) {
        if (!this.efectesActivats) return;
        const efecte = this.efectes[nom];
        if (efecte) {
            efecte.currentTime = 0;
            efecte.play().catch(() => {});
        }
    },

    /** Activa o desactiva la música. */
    alternarMusica(activat) {
        this.musicaActivada = activat;
        if (activat) {
            this.reproduirMusica();
        } else {
            this.pausarMusica();
        }
    },

    /** Activa o desactiva els efectes de so. */
    alternarEfectes(activat) {
        this.efectesActivats = activat;
    },

    /** Canvia el volum de la música. @param {number} valor - Volum entre 0 i 1. */
    canviarVolumMusica(valor) {
        this.volumMusica = valor;
        if (this.musicaFons) this.musicaFons.volume = valor;
    },

    /** Canvia el volum dels efectes. @param {number} valor - Volum entre 0 i 1. */
    canviarVolumEfectes(valor) {
        this.volumEfectes = valor;
        Object.values(this.efectes).forEach(efecte => {
            efecte.volume = valor;
        });
    }
};

export default audio;