class FluidParticle{
    /**
     * Konstruktor
     * @param {Vector} position Anfangsposition
     * @param {Vector} velocity Anfangsgeschwindigkeit
     * @param {number} mass Masse
     * @param {number} dt Integrationsschrittweite
     */
    constructor(position, velocity, mass, dt){
        this.position = position;
        this.velocity = velocity;
        this.mass = mass;

        this.dt = dt;
    }

    /**
     * Führt ein Update durch
     * @param {Vector[]} forces Die wirkenden Kräfte
     */
    update(forces){
        var f = forces.reduce((val, acc) => acc.add(val), new Vector())
        var a = f.div(this.mass);

        this.velocity = this.velocity.add(a.mul(this.dt))
        this.position = this.position.add(this.velocity.mul(this.dt))
    }

    /**
     * Zeichnet das Teilchen
     * @param {..?} ctx Renderkontext
     * @param {Vector} offset Versatz der Zeichenebene
     */
    render(ctx, offset){
        ctx.fillStyle = Fluid.colorMap(this.velocity.norm(), 0,80);
        ctx.fillRect(this.position.x + offset.x, this.position.y + offset.y, 2, 2);
    }
}