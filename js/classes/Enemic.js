export default class Enemic {
    constructor(x, y, radi = 16) {
        this.x = x;
        this.y = y;
        this.radi = radi;
        this.vida = 30;
        this.vidaMaxima = 30;
        this.velocitat = 1.5;
        this.danyContacte = 20;
        this.color = '#008214';
    }

    actualitzar(jugador) {
        const dx = jugador.x - this.x;
        const dy = jugador.y - this.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist > 0) {
            this.x += (dx / dist) * this.velocitat;
            this.y += (dy / dist) * this.velocitat;
        }
    }

    rebreDany(dany) {
        this.vida -= dany;
        return this.vida <= 0;
    }

    // Per dibuixar-lo al canvas
    dibuixar(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.radi, this.y - this.radi, this.radi*2, this.radi*2);
        
        // Barra de vida
        const ampleVida = (this.vida / this.vidaMaxima) * (this.radi*2);
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x - this.radi, this.y - this.radi - 8, ampleVida, 4);
    }
}