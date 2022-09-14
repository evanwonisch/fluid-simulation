class FluidCell{
    /**
     * Konstruktor
     * @param {Vector} position Die obere linke Ecke in px
     * @param {number} width Die Breite
     * @param {number} height Die Höhe
     * @param {Vector => Vector} forceField Kraft in Abhängigeit von Ort
     * @param {number} dt Integrationsschrittweite
     */
    constructor(position, width, height, forceField, dt){
        this.position = position;
        this.width = width;
        this.height = height;
        this.dt = dt;
        this.particles = [];

        this.forceField = forceField;

        this.meanVelocity;
    }

    /**
     * Setzt die benachbarten Zellen dieser Zelle
     * @param {*} top 
     * @param {*} bot 
     * @param {*} left 
     * @param {*} rigth 
     * @param {*} topleft 
     * @param {*} topright 
     * @param {*} botleft 
     * @param {*} botright 
     */
    setNeighbours(top, bot, left, rigth, topleft, topright, botleft, botright){
        this.top = top;
        this.bot = bot;
        this.left = left;
        this.rigth = rigth;
        this.topleft = topleft;
        this.topright = topright;
        this.botleft = botleft;
        this.botright = botright;


        this.neighbours = [this.top, this.bot, this.left, this.right, this.topleft, this.topright, this.botleft, this.botright]
        this.neighbours = this.neighbours.filter(e => e)
    }

    /**
     * Fügt ein Teilchen zur Zelle hinzu und portet das Teilchen ggf. in die Zelle falls dieses den Randsprung gemacht hat
     * @param {FluidParticle} particle Das Teilchen
     */
    addParticle(particle){
        this.particles.push(particle);

        if(particle.position.x > this.position.x + this.width){
            particle.position.x = this.position.x;
        }
        if(particle.position.x < this.position.x){
            particle.position.x = this.position.x + this.width;
        }
    }

    /**
     * Führt ein Update der Zelle durch
     * @param {number} friction Die Aktuelle Reibung in der Zelle
     */
    update(friction){
        this.meanVelocity = new Vector();


        this.particles.forEach(p => {
            var forces = [];

            //Wechselwirkung
            //mit Zellgenossen
            this.particles.forEach(e => {
                if(e != p){
                    forces.push(this.particleForce(p, e))
                }
            })

            //mit Nachbarn
            this.neighbours.forEach(neighbour => {
                neighbour.particles.forEach(e => {
                    forces.push(this.particleForce(p, e))
                })
            })

            //äußere Kräfte
            forces.push(this.forceField(p.position))

            //Friction Stokes
            forces.push(p.velocity.mul(-friction));


            //Notbremse
            if(p.velocity.norm() > 160){
                p.velocity = new Vector();
            }

            p.update(forces)
            this.relocateParticle(p);


            //Update mean Velocity
            this.meanVelocity = this.meanVelocity.add(p.velocity);
        })

        this.meanVelocity = this.meanVelocity.div(this.particles.length);
    }

    /**
     * Kraft zwischen zwei Fluidpartikeln
     * @param {FluidParticle} p1 Partikel auf das die Kraft wirkt
     * @param {FluidParticle} p2 Wechselwirkungspartner
     * @returns {Vector} der Kraftvektor
     */
    particleForce(p1, p2){
        var rel = p1.position.sub(p2.position);
        var dist = rel.norm() + 1;
        var direction = rel.div(dist);  //abstoßender Vektor

        var v_rel = p2.velocity.sub(p1.velocity);

        var forces = [];

        forces.push(direction.mul(240/dist)); //Druckkraft
        forces.push(v_rel.mul(9/dist)); //Reibung

        return forces.reduce((val, acc) => acc.add(val), new Vector())
    }

    /**
     * Führt die Zellenverschiebung der Partikel durch und kontrolliert die Wände
     */
    relocateParticle(p){
        if(p.position.x < this.position.x){
            //remove to the left
            this.left.addParticle(p)
            this.particles = this.particles.filter(e => e != p)
        }
        else if(p.position.x > this.position.x + this.width){
            //remove to the right
            this.rigth.addParticle(p)
            this.particles = this.particles.filter(e => e != p)
        }
        else if(p.position.y <= this.position.y){
            //remove to top or stop particle
            if(this.top){
                this.top.addParticle(p)
                this.particles = this.particles.filter(e => e != p)
            } else {
                p.position.y = this.position.y + Math.random() * 5;
                p.velocity.y = -p.velocity.y*0.2;
                p.velocity.x *= 0.2
            }
            
        }
        else if(p.position.y >= this.position.y + this.height){
            //remove to bottom or stop particle
            if(this.bot){
                this.bot.addParticle(p)
                this.particles = this.particles.filter(e => e != p)
            } else {
                p.position.y = this.position.y + this.height - Math.random() * 5;
                p.velocity.y = -p.velocity.y*0.2;
                p.velocity.x *= 0.2
            }
        }
    }

    /**
     * Zeichnet die Zelle und ihre Partikel
     * @param {*} ctx Zeichenebene
     * @param {*} offset Koordinatenversatz
     */
    render(ctx, offset){
        this.particles.forEach(p => p.render(ctx, offset))

        var drawLines = false;
        if(drawLines){
            var direction = this.meanVelocity.toUnitVector();
            ctx.strokeStyle = Fluid.colorMap(this.meanVelocity.norm(), 0, 80)
            ctx.beginPath()
            ctx.moveTo(offset.x + this.position.x + this.width / 2, offset.y + this.position.y + this.height / 2);
            ctx.lineTo(offset.x + this.position.x + this.width / 2 + direction.x * 10, offset.y + this.position.y + this.height / 2 + direction.y * 10)
            ctx.stroke();
        }
        
        if(this.forceField(this.position).norm() > 40){
            ctx.fillStyle = "rgba(200,20,20,0.6)"
            ctx.fillRect(this.position.x + offset.x, this.position.y + offset.y, this.width, this.height)
        }

        
    }
}