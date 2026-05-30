export default class Gemma {
    constructor(x, y, valorXP = 20) {
        this.x = x;
        this.y = y;
        this.radi = 8;
        this.valorXP = valorXP;
        this.velocitatAtraccio = 3;
    }

    actualitzar(jugador) {
        // Opcional: atracció cap al jugador si està a prop
        const dx = jugador.x - this.x;
        const dy = jugador.y - this.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < 150) {
            if (dist > 0) {
                this.x += (dx / dist) * this.velocitatAtraccio;
                this.y += (dy / dist) * this.velocitatAtraccio;
            }
        }
    }

    dibuixar(ctx) {
        ctx.fillStyle = '#00fff7';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radi, 0, Math.PI * 2);
        ctx.fill();
    }
}