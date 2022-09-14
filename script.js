var canvas;
var ctx;
var width, height;
const FPS = 100;

var fluid;
var time = 0;


window.onload = () => {
    canvas = document.getElementById("canvas")
    ctx = canvas.getContext("2d")

    var forceField = (position) => {
        var x = position.x;
        var y = position.y;

        y -= 150;
        x -= 300;

        x /= 20;
        y /= 50;

        var init = time**3/(time**3+10*x**2); //konv geg 1

        if(x < 2){
            return new Vector(1,2*y).mul(Math.exp(y*y+x)).mul(-1*init)
        }
        

        
        // if(Math.abs(y) < 0.2) return new Vector();

        // y += -0.6*x
        // return new Vector(Math.exp(-y*y-x*x)*-2*x, Math.exp(-y*y-x*x)*-2*y).mul(-420*init)

        return new Vector(0,0);
        
    }


    var initialVelocity = (position) => {
        var x = position.x;
        var y = position.y;

        y -= 150;
        x -= 300;

        // if(y < 40){
        //     return new Vector(80,0)
        // } else {
        //     return new Vector(-15,5*Math.sin(x/30));
        // }
        return new Vector(20,0)
        
    }



    fluid = new Fluid(1000,300,30,90,1,2000, initialVelocity, forceField, 0.03);
    

    //Update Loop
    setInterval(() => {
        canvas.width = width = window.innerWidth
        canvas.height = height = window.innerHeight
        ctx.fillStyle = "black"
        ctx.fillRect(0, 0, width, height)

        update();

    }, 1000 / FPS);
}

//Main Loop
function update(){
    fluid.update();
    fluid.render(ctx, new Vector(100,100));
    time += 0.01;
}