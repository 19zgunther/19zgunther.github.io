

class vec3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.mag = null;
    }
    getMagnitude() {
        if (this.mag == null) {
            this.mag = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        }
        return this.mag;
    }
    normalize() {
        this.getMagnitude();
        this.x = this.x / this.mag;
        this.y = this.y / this.mag;
        this.z = this.z / this.mag;
        return this;
    }
    getDistanceTo(otherP) {
        return Math.sqrt(Math.pow(this.x - otherP.x, 2) + Math.pow(this.y - otherP.y, 2) + Math.pow(this.z - otherP.z, 2));
    }
    sub(other) {
        if (other instanceof vec3) {
            return new vec3(this.x - other.x, this.y - other.y, this.z - other.z);
        } else {
            return new vec3(this.x - other, this.y - other, this.z - other);
        }
    }
    add(other) {
        if (other instanceof vec3) {
            return new vec3(this.x + other.x, this.y + other.y, this.z + other.z);
        } else {
            return new vec3(this.x + other, this.y + other, this.z + other);
        }
    }
    addi(other) {
        if (other instanceof vec3) {
            this.x += other.x;
            this.y += other.y;
            this.z += other.z;
            return this;
        } else {
            this.x += other;
            this.y += other;
            this.z += other;
            return this;
        }
    }
    mul(other) {
        if (other instanceof vec3) {
            return new vec3(this.x * other.x, this.y * other.y, this.z * other.z);
        }
        return new vec3(this.x * other, this.y * other, this.z * other);
    }
    dot(other) {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }
    copy() {
        return new vec3(this.x, this.y, this.z);
    }
    toString(p = 2) {
        return "x: " + this.x.toPrecision(p) + "  y: " + this.y.toPrecision(p) + " z: " + this.z.toPrecision(p);
    }
}

class Object {
    constructor(position = new vec3(), color = new vec3(255, 0, 0), reflectance = 0) {
        this.position = position;
        this.color = color;
        this.reflectance = reflectance;
    }
    raytrace() {
        console.error("Not implemented in child class");
    }
    getNormal() {
        console.error("Not implemented in child class");
    }
    getColor() {
        return this.color;
    }
}

class Sphere extends Object {
    constructor(position = new vec3(), radius = 1, color = new vec3(255, 255, 255), reflectance = 0.95) {
        super(position, color, reflectance);
        this.radius = radius;
    }
    raytrace(rayD, rayP) {

        //var a = Math.pow(rayD.x-rayP.x,2)  +  Math.pow(rayD.y-rayP.y,2)  +  Math.pow(rayD.z-rayP.z,2);
        //var b = -2*(   (rayD.x-rayP.x)*(this.position.x-rayP.x) +  (rayD.y-rayP.y)*(this.position.y-rayP.y) + (rayD.z-rayP.z)*(this.position.z-rayP.z)  );
        //var c = Math.pow(this.position.x-rayP.x,2)  +  Math.pow(this.position.y-rayP.y,2)  +  Math.pow(this.position.z-rayP.z,2) - this.radius*this.radius;
        var a = rayD.x * rayD.x + rayD.y * rayD.y + rayD.z * rayD.z;
        var b = 2 * (rayD.x * (rayP.x - this.position.x) + rayD.y * (rayP.y - this.position.y) + rayD.z * (rayP.z - this.position.z));
        var c = Math.pow(rayP.x - this.position.x, 2) + Math.pow(rayP.y - this.position.y, 2) + Math.pow(rayP.z - this.position.z, 2) - this.radius * this.radius;

        var ret = quadraticFormula(a, b, c);
        var a = rayD.x * rayD.x + rayD.y * rayD.y + rayD.z * rayD.z;
        var b = 2 * (rayD.x * (rayP.x - this.position.x) + rayD.y * (rayP.y - this.position.y) + rayD.z * (rayP.z - this.position.z));
        var c = Math.pow(rayP.x - this.position.x, 2) + Math.pow(rayP.y - this.position.y, 2) + Math.pow(rayP.z - this.position.z, 2) - this.radius * this.radius;

        var ret = quadraticFormula(a, b, c);

        if (ret == null) {
            //Do nothing... 
        } else if (ret.length == 1) {
            if (ret[0] > 0.01) {
                //var v1 = new vec3(ret[0]*rayD.x + rayP.x, ret[0]*rayD.y + rayP.y, ret[0]*rayD.z + rayP.z );
                var v1 = new vec3(ret[0] * rayD.x, ret[0] * rayD.y, ret[0] * rayD.z);
                return [v1.add(rayP), v1.getMagnitude()];
            }
        } else if (ret.length == 2) {

            if (ret[0] > 0.01 && ret[1] > 0.01) {
                //var v1 = new vec3(ret[0]*rayD.x + rayP.x, ret[0]*rayD.y + rayP.y, ret[0]*rayD.z + rayP.z );
                //var v2 = new vec3(ret[1]*rayD.x + rayP.x, ret[1]*rayD.y + rayP.y, ret[1]*rayD.z + rayP.z );
                var v1 = new vec3(ret[0] * rayD.x, ret[0] * rayD.y, ret[0] * rayD.z);
                var v2 = new vec3(ret[1] * rayD.x, ret[1] * rayD.y, ret[1] * rayD.z);
                if (v1.getMagnitude() < v2.getMagnitude()) {
                    return [v1.add(rayP), v1.getMagnitude()];
                } else {
                    return [v2.add(rayP), v2.getMagnitude()];
                }
            } else if (ret[0] > 0.01) {
                //var v1 = new vec3(ret[0]*rayD.x + rayP.x, ret[0]*rayD.y + rayP.y, ret[0]*rayD.z + rayP.z );
                var v1 = new vec3(ret[0] * rayD.x, ret[0] * rayD.y, ret[0] * rayD.z);
                return [v1.add(rayP), v1.getMagnitude()];
            } else if (ret[1] > 0.01) {
                //var v2 = new vec3(ret[1]*rayD.x + rayP.x, ret[1]*rayD.y + rayP.y, ret[1]*rayD.z + rayP.z );
                var v2 = new vec3(ret[1] * rayD.x, ret[1] * rayD.y, ret[1] * rayD.z);
                return [v2.add(rayP), v2.getMagnitude()];
            }
        }
        return null;


    }
    getNormal(point) {
        return this.position.sub(point).normalize();
    }
}

class Plane extends Object {
    constructor(position = new vec3(), normal = new vec3(0, 0, 1), color = new vec3(0, 0, 255), reflectance = 0) {
        super(position, color, reflectance);
        this.normal = normal.normalize();
        this.color = color;
    }
    raytrace(rayD, rayP) {
        var t = (this.position.sub(rayP).dot(this.normal)) / (rayD.dot(this.normal));
        if (t > 0.1) {
            var vec = new vec3(rayD.x * t, rayD.y * t, rayD.z * t);
            return [vec.add(rayP), vec.getMagnitude()];
        }
    }
    getNormal() {
        return this.normal;
    }
    getColor(point) {
        //return this.color;
        if (Math.abs(point.x % 2) < 1 && Math.abs(point.y % 2) < 1 || Math.abs(point.z % 2) < 1)
        {
            return this.color;
        } else {
            return new vec3(255,255,255).sub(this.color);
        }
    }
}

class Disk extends Plane {
    constructor(position = new vec3(), normal = new vec3(0, 0, 1), color = new vec3(255, 255, 255), radius = 1, reflectance = 0.2) {
        super(position, normal, color, reflectance);
        this.radius = radius;
    }
    raytrace(rayD, rayP) {
        var t = (this.position.sub(rayP).dot(this.normal)) / (rayD.dot(this.normal));
        if (t > 0.1) {
            var vec = new vec3(rayD.x * t, rayD.y * t, rayD.z * t);
            if (vec.add(rayP).getDistanceTo(this.position) < this.radius) {
                return [vec.add(rayP), vec.getMagnitude()];
            }
        }
        return null;
    }
}

class PointSource extends Object {
    constructor(position = new vec3(), lightColor = new vec3(5, 4, 4), shadowColor = new vec3(.2, .2, .2), radius = 0.5) {
        super(position, lightColor, 0);
        this.lightColor = lightColor;
        this.radius = radius;
        this.shadowColor = shadowColor;
    }
 
    getLightMultiplier(rayStartPositon, objects) {
        var rayD = this.position.sub(rayStartPositon).normalize();
        var rayP = rayStartPositon.copy();
        var bestMag = this.position.sub(rayStartPositon).getMagnitude();

        for (var i = 0; i < objects.length; i++) {
            if (objects[i] instanceof PointSource) {continue;}
            ret = objects[i].raytrace(rayD, rayP);
            if (ret != null && ret[1] < bestMag) {
                //Oh no! THere is an object blocking light.
                return this.shadowColor;
            }
        }
        return this.lightColor.mul(1 / (bestMag + 1));
    }
    raytrace(rayD, rayP) {
        var a = rayD.x * rayD.x + rayD.y * rayD.y + rayD.z * rayD.z;
        var b = 2 * (rayD.x * (rayP.x - this.position.x) + rayD.y * (rayP.y - this.position.y) + rayD.z * (rayP.z - this.position.z));
        var c = Math.pow(rayP.x - this.position.x, 2) + Math.pow(rayP.y - this.position.y, 2) + Math.pow(rayP.z - this.position.z, 2) - this.radius * this.radius;

        var ret = quadraticFormula(a, b, c);
        var a = rayD.x * rayD.x + rayD.y * rayD.y + rayD.z * rayD.z;
        var b = 2 * (rayD.x * (rayP.x - this.position.x) + rayD.y * (rayP.y - this.position.y) + rayD.z * (rayP.z - this.position.z));
        var c = Math.pow(rayP.x - this.position.x, 2) + Math.pow(rayP.y - this.position.y, 2) + Math.pow(rayP.z - this.position.z, 2) - this.radius * this.radius;

        var ret = quadraticFormula(a, b, c);

        if (ret != null && ret.length == 2 && ret[0] > 0.01 && ret[1] > 0.01) {
            
            //var v1 = new vec3(ret[0]*rayD.x + rayP.x, ret[0]*rayD.y + rayP.y, ret[0]*rayD.z + rayP.z );
            var t = Math.min(ret[0], ret[1]);
            var t2 = Math.max(ret[0], ret[1])-t;
            var v = new vec3(t * rayD.x, t * rayD.y, t * rayD.z);
            return [v.add(rayP), v.getMagnitude(), new vec3(t2 * rayD.x, t2 * rayD.y, t2 * rayD.z).getMagnitude()];
        }
        return null;
    }
    getNormal() {
        console.error("Not implemented");
    }
}





const CanvasElement = document.getElementById('canvas');


//Instantiate Point Source
const pointSource = new PointSource(new vec3(0, 9, 5));

//Instantiate Scene Objects
const objects = [
    pointSource,
    //new Sphere(new vec3(2,0,2), 1, new vec3(50,50,50)), 
    //new Sphere(new vec3(-2,1,1), 1, new vec3(50,50,50)),
    //new Sphere(new vec3(4,0,10), 3, new vec3(50,50,50)),
    //new Sphere(new vec3(1,-7,8), 2, new vec3(50,50,50)),
    //new Sphere(new vec3(1,-9,8), 2, new vec3(50,50,50)),

    //new Disk(new vec3(0,0,11), new vec3(0,0,-1), new vec3(100,100,100), 2),

    new Sphere(new vec3(4, 0, 5), 3),
    new Sphere(new vec3(-4, 0, 7), 3),

    //new Disk(new vec3(-2,-2,8), new vec3(0, 0, -1), new vec3(200,0,0), 2, 0.9),


    //new Disk(new vec3(0,0,5), new vec3(0,1,-1), new vec3(255,255,255), 2), 

    new Plane(new vec3(-10, 0, 0), new vec3(1, 0, 0), new vec3(255, 0, 0), .1), //right
    new Plane(new vec3(0, 0, 10), new vec3(0, 0, -1), new vec3(0, 255, 0), 0), //back
    new Plane(new vec3(10, 0, 0), new vec3(-1, 0, 0), new vec3(0, 0, 255)), //left
    new Plane(new vec3(0, 10, 0), new vec3(0, -1, 0), new vec3(200, 0, 255)), //top
    new Plane(new vec3(0, -10, 0), new vec3(0, 1, 0), new vec3(150, 255, 0)), //bottom
    //new Disk(new vec3(0,0,10), new vec3(0,0,1), new vec3(0,150,0),50), //back
    //new Plane(new vec3(0,0,-1), new vec3(0,0,1), new vec3(255,255,255)), //back
];



var width = 500;
var height = 500;
const ctx = CanvasElement.getContext('2d');
var canvasData = [];


setup();





function setup() {

    document.getElementById('ImageSize').value = width;

    document.getElementById('LSx').value = pointSource.position.x;
    document.getElementById('LSy').value = pointSource.position.y;
    document.getElementById('LSz').value = pointSource.position.z;

    //Get image data, and clear colors.
    canvasData = ctx.createImageData(width, height);
    for (var i = 0; i < width * height * 4; i += 4) {
        canvasData.data[i] = 0;
        canvasData.data[i + 1] = 0;
        canvasData.data[i + 2] = 0;
        canvasData.data[i + 3] = 255;
    }


    render();
}


function sliderChanged(element) {
    switch (element.id){
        case 'ImageSize': width = height = Number(element.value); render(); break;
        case 'LSx': pointSource.position.x = Number(element.value); render(); break;
        case 'LSy': pointSource.position.y = Number(element.value); render(); break;
        case 'LSz': pointSource.position.z = Number(element.value); render(); break;
    }
}



function render() {
    CanvasElement.style.width = width + 'px';
    CanvasElement.style.height = height + 'px';
    CanvasElement.width = width;
    CanvasElement.height = height;

    canvasData = ctx.createImageData(width, height);

    numRuns = 1;
    for (var x = 0; x < width; x += 1) {
        for (var y = 0; y < height; y += 1) {
            var color = new vec3(0, 0, 0);
            for (var i = 0; i < numRuns; i++) {
                //ret = fireRay(new vec3(3*(0.5-x/w),3*(0.5-y/h),1), new vec3( (0.5-x/w)/1, (0.5-y/h)/1 ), objects)
                ret = fireRay(new vec3(3.0 * (0.5 - x / width), 3.0 * (0.5 - y / height), 1), new vec3(), objects, pointSource)
                color.addi(ret);
            }
            canvasData.data[x * 4 + y * width * 4] = color.x / numRuns;
            canvasData.data[x * 4 + y * width * 4 + 1] = color.y / numRuns;
            canvasData.data[x * 4 + y * width * 4 + 2] = color.z / numRuns;
            canvasData.data[x * 4 + y * width * 4 + 3] = 255;
        }
    }
    console.log("done!");
    ctx.putImageData(canvasData, 0, 0);

    return "done";
}



function fireRay(rayD = new vec3(), rayP = new vec3(), objects = [], lightSource, pObject = null, recDepth = 0) {
    var bestMag = 10000000;
    var bestObject = null;
    var bestPoint = null;
    var lightAmount = 0;
    var o;

    rayD.normalize();

    for (var i = 0; i < objects.length; i++) {
        if (objects[i] == pObject) { continue; }
        o = objects[i]

        ret = o.raytrace(rayD, rayP);
        if (ret != null && ret[1] < bestMag) {
            bestMag = ret[1];
            bestPoint = ret[0];
            bestObject = o;
            if (ret.length == 3)
            {
                lightAmount = ret[2];
            }
        }
    }

    if (bestObject != null) {
        if (bestObject != lightSource) {
            if (bestObject.reflectance > 0.1 && recDepth < 10) {
                var normalVec = bestObject.getNormal(bestPoint);
                var newRayD = reflectRay(rayD, normalVec);
                var newColor = fireRay(newRayD, bestPoint, objects, lightSource, bestObject, recDepth + 1);
                var colorMultiplier = lightSource.getLightMultiplier(bestPoint, objects);
                return newColor.mul(bestObject.reflectance).add(bestObject.getColor(bestPoint).mul(1 - bestObject.reflectance).mul(colorMultiplier));
            } else {
                var colorMultiplier = lightSource.getLightMultiplier(bestPoint, objects);
                return bestObject.getColor(bestPoint).mul(colorMultiplier);
            }   
        }
        //console.log("HERE: " + recDepth);
        return new vec3(255,255,255);
        return bestObject.lightColor.copy().normalize().mul(255);
        return bestObject.lightColor.normalize().mul(200);
    }
    return new vec3();
}




function reflectRay(Ri, N) {
    //Ri = incident Ray
    //N = normal to surface
    //returns reflected ray
    return Ri.sub(N.mul(Ri.dot(N) * 2))
}

function quadraticFormula(a = 1, b = 0, c = 0) {
    //console.log("a: " + a + "  b: " + b + "  c: " + c);
    var inside = (b * b) - (4 * a * c)
    //console.log("b*b: " + b*b + "  4*a*c: " + 4*a*c + "  inside: " + inside);

    if (inside < 0) {
        return null;
    } else if (inside == 0) {
        return [-b / (2 * a), null]
    }

    return [(-b + Math.sqrt(inside)) / (2 * a), (-b - Math.sqrt(inside)) / (2 * a)];
}





/*----------------------------------------------------------------


function intersectSphere(r, sp, sr){
    var a = Math.pow(r.getMagnitude(),2);
    var b = -2*(  r.x*sp.x + r.y*sp.y + r.z*sp.z  );
    var c = Math.pow(sp.getMagnitude(),2) - sr*sr;

    var ret = quadraticFormula(a,b,c);
    if (ret != null)
    {
        if (ret.length == 1)
        {
            //line is tangent to sphere
            //console.log("< "+lx*ret[0] + ", "+ly*ret[0] + ", " + lz*ret[0] + " >")
            return new vec3(ret[0]*r.x, ret[0]*r.y, ret[0]*r.z );
        } else {
            //line intersects sphere
            var v1 = new vec3(ret[0]*r.x, ret[0]*r.y, ret[0]*r.z );
            var v2 = new vec3(ret[1]*r.x, ret[1]*r.y, ret[1]*r.z );
            if (v1.getMagnitude() < v2.getMagnitude()){
                return v1;
            }
            return v2;
            //return new vec3(ret[1]*r.x, ret[1]*r.y, ret[1]*r.z );
            //console.log("< "+lx*ret[0] + ", "+ly*ret[0] + ", " + lz*ret[0] + " >")
        }
    } else {
        return null;
    }
}
function distance(p1x,p1y,p1z, p2x,p2y,p2z)
{
    return Math.sqrt(Math.pow(p1x-p2x,2) + Math.pow(p1y-p2y,2) + Math.pow(p1z-p2z,2) );
}
function magnitude(x,y,z)
{
    return Math.sqrt( x*x + y*y + z*z);
}


function getVectorColor(ray, sp,sr)
{
    ray.normalize();

    var ret = intersectSphere(ray, sp, sr);
    if (ret != null)
    {
        var N = (ret.sub(sp)).normalize();

        var Rr = reflectRay(ray, N).normalize(0);

        ret = intersectSphere(Rr, new vec3(1,0,10), 1);

        if (ret != null)
        {
            N = (ret.sub(sp)).normalize();
            var angle = Math.atan2(N.y, N.x);
            if (angle%.5<0.25)
            {
                return new vec3(255,0,0);
            } else {
                return new vec3(0,255,0);
            }
            return new vec3(10,100,255);
        } else {
            return N.mul(255);
        }


        //return N.mul(255);
    } else {
        return new vec3(0,0,0);
    }
}
*/
