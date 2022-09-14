class Vector{
    constructor(x = 0, y = 0){
        this.x = x;
        this.y = y;
    }
    add(vector){
        return new Vector(this.x + vector.x, this.y + vector.y)
    }
    sub(vector){
        return new Vector(this.x - vector.x, this.y - vector.y)
    }
    mul(scalar){
        return new Vector(this.x * scalar, this.y * scalar)
    }
    div(scalar){
        return new Vector(this.x / scalar, this.y / scalar)
    }
    norm(){
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    toUnitVector(){
        if(this.norm() != 0){
            return this.div(this.norm())
        }else {
            return new Vector();
        }
    }
    dot(vector){
        return this.x * vector.x + this.y*vector.y;
    }
    static random(){
        return new Vector(Math.random(), Math.random())
    }
}