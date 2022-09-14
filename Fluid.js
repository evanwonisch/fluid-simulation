class Fluid{
    /**
     * Erzeugt ein Fluid
     * @param {number} width 
     * @param {number} height 
     * @param {number} rows 
     * @param {number} columns
     * @param {Vector => Vector} initialVelocity Das Anfangsgeschwindigkeitsfeld.
     * @param {Vector => Vector} forceField Das äußere Kraftfeld, welches auf das Fluid wirkt.
     * @param {number} dt Integrationsschrittweite
     */
    constructor(width, height, rows, columns, particleMass, nParticles, initialVelocity, forceField, dt = 0.1){
        this.height = height;
        this.width = width;
        this.rows = rows;
        this.columns = columns;

        this.cellWidth = width / columns;
        this.cellHeight = height / rows;

        this.dt = dt;
        this.particleMass = particleMass;
        this.nParticles = nParticles;

        this.initialVelocity = initialVelocity;
        this.forceField = forceField;

        //Zellen initialisieren
        this.cells = [];
        for(var i = 0; i < rows; i++){
            var row = [];
            for(var j = 0; j < columns; j++){
                row.push(new FluidCell(new Vector(j * this.cellWidth, i * this.cellHeight), this.cellWidth, this.cellHeight, this.forceField, dt));
            }
            this.cells.push(row);
        }

        //Nachbarn setzen
        for(var i = 0; i < rows; i++){
            for(var j = 0; j < columns; j++){

                var top = undefined, bot = undefined, left = undefined, right = undefined;
                var topleft = undefined, topright = undefined, botleft = undefined, botright = undefined;

                if(i > 0){
                    top = this.cells[i - 1][j]

                    if(j > 0){
                        topleft = this.cells[i - 1][j - 1]
                    } else {
                        topleft = this.cells[i - 1][this.columns - 1] //wrap to the other side
                    }

                    if(j < this.columns - 1){
                        topright = this.cells[i - 1][j + 1]
                    } else {
                        topright = this.cells[i - 1][0]
                    }
                }
                
                if(j > 0){
                    left = this.cells[i][j - 1]
                } else {
                    left = this.cells[i][this.columns - 1]
                }

                if(j < this.columns - 1){
                    right = this.cells[i][j + 1];
                } else {
                    right = this.cells[i][0]
                }

                if(i < this.rows - 1){
                    bot = this.cells[i + 1][j]
                    if(j > 0){
                        botleft = this.cells[i + 1][j - 1]
                    } else {
                        botleft = this.cells[i + 1][this.columns - 1]
                    }

                    if(j < this.columns -1){
                        botright = this.cells[i + 1][j + 1]
                    } else {
                        botright = this.cells[i + 1][0]
                    }
                }

                this.cells[i][j].setNeighbours(top, bot, left, right, topleft, topright, botleft, botright);
            }
        }

        //Partikel erzeugen und in Zellen einsortieren
        var area = this.width * this.height;
        var area_per_particle = area / nParticles;

        var space = Math.sqrt(area_per_particle);

        for(var x = 0; x < width; x += space){
            for(var y = 0; y < height; y += space){
                var particle = new FluidParticle(new Vector(x, y), this.initialVelocity(new Vector(x, y)), particleMass, this.dt);

                var j = parseInt(x / this.cellWidth); //Berechnung der Indizes der zugehörigen Zelle
                var i = parseInt(y / this.cellHeight);

                this.cells[i][j].addParticle(particle);
            }
        }


        //Gesamternergie bestimmen
        for(var i = 0; i < 5; i++) this.update();
        this.energy = 0;
        this.cells.forEach(row => {
            row.forEach(cell => {
                this.energy += cell.particles.map(p => p.velocity.norm()**2).reduce((val, acc) => val + acc, 0) 
            })
        })
        this.current_energy = this.energy;
    }

    /**
     * Updated das gesamte Fluid und berechnet dabei die Stokesche Reibung so, dass die Energie erhalten bleibt..
     */
    update(){
        var calc_energy = 0;

        var friction = 0;
        if(this.current_energy > this.energy){
            friction = this.current_energy / (this.energy + 1) - 1
            if(friction > 5) friction = 5
        }

        this.cells.forEach(row => {
            row.forEach(cell => {
                cell.update(friction);
                calc_energy += cell.particles.map(p => p.velocity.norm()**2).reduce((val, acc) => val + acc, 0) 
            })
        })

        console.log(friction)

        this.current_energy = calc_energy;
    }

    /**
     * Zeichnet das gesamte Fluid
     * @param {*} ctx Die Zeichenebene 
     * @param {Vector} offset Der Koordinatenversatz
     */
    render(ctx, offset){
        this.cells.forEach(row => {
            row.forEach(cell => {
                cell.render(ctx, offset);
            })
        })
    }

    /**
    * Colormap for Velocity Field
    * @param {number} value
    * @param {number} min Normalisation min
    * @param {number} max Normalisation max
    */
    static colorMap(value, min, max){
        var p = (value - min) / (max - min)
        var alpha = p * 2 * Math.PI;

        var r = (Math.sin(alpha) + 1) * 255;
        var g = (Math.sin(alpha + 2/3 * Math.PI) + 1) * 255;
        var b = (Math.sin(alpha + 4/3 * Math.PI) + 1) * 255;

        return "rgb(" + r + "," + g + "," + b + ")"
    }
}