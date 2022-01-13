


class mat4 {
    constructor()
    {
        //COLUMN MAJOR ALIGNMENT
        this.f32a = new Float32Array(16); //float 32 array
        for( var i=0; i<16; i++)
        {
            this.f32a[i] = 0;
        }
    }
    setValues(array)
    {
        if (array.length != 16)
        {
            console.error("mat4.set(array) - array.length != 16");
            return;
        }
        for (var i=0; i<16; i++)
        {
            this.f32a[i] = array[i];
        }
        return this;
    }
    setUnit()
    {
        for( var i=0; i<16; i++)
        {
            this.f32a[i] = 0;
        }
        this.f32a[0] = 1;
        this.f32a[5] = 1;
        this.f32a[10] = 1;
        this.f32a[15] = 1;
        return this;
    }
    makePerspective(FOV, aspect, near, far)
    {
        var f = Math.tan(Math.PI * 0.5 - 0.5 * FOV);
        var range = 1.0/(near-far);
        this.f32a[0] = f/aspect;
        this.f32a[4] = 0;
        this.f32a[8] = 0;
        this.f32a[12] = 0;

        this.f32a[1] = 0;
        this.f32a[5] = f;
        this.f32a[9] = 0;
        this.f32a[13] = 0;

        this.f32a[2] = 0;
        this.f32a[6] = 0;
        this.f32a[10] = (near+far)*range,
        this.f32a[14] = -1;

        this.f32a[3] = 0;
        this.f32a[7] = 0;
        this.f32a[11] = near*far*range*2;
        this.f32a[15] = 0;
        return this;
    }
    makeOrthogonal(aspect, zoom = 1)
    {
        this.f32a[0] = (1/aspect) * zoom;
        this.f32a[4] = 0;
        this.f32a[8] = 0;
        this.f32a[12] = 0;

        this.f32a[1] = 0;
        this.f32a[5] = zoom;
        this.f32a[9] = 0;
        this.f32a[13] = 0;

        this.f32a[2] = 0;
        this.f32a[6] = 0;
        this.f32a[10] = -.00001;
        this.f32a[14] = 0;

        this.f32a[3] = 0;
        this.f32a[7] = 0;
        this.f32a[11] = 0;
        this.f32a[15] = 1;
        return this;
    }
    makeTranslation(x,y=0,z=0)
    {
        if (x instanceof vec4)
        {
            y = x.y;
            z = x.z;
            x = x.x;
        }

        if (x == null || isNaN(x)) { x = 0;}
        if (y == null || isNaN(y)) { y = 0;}
        if (z == null || isNaN(z)) { z = 0;}

        //COLUMN MAJOR ALIGNMENT
        this.f32a[0] = 1;
        this.f32a[4] = 0;
        this.f32a[8] = 0;
        this.f32a[12] = x;

        this.f32a[1] = 0;
        this.f32a[5] = 1;
        this.f32a[9] = 0;
        this.f32a[13] = y;

        this.f32a[2] = 0;
        this.f32a[6] = 0;
        this.f32a[10] = 1;
        this.f32a[14] = z;

        this.f32a[3] = 0;
        this.f32a[7] = 0;
        this.f32a[11] = 0;
        this.f32a[15] = 1;
        
        return this;
    }
    makeScale(x,y,z,a)
    {
        if (x instanceof vec4)
        {
            //COLUMN MAJOR ALIGNMENT
            this.f32a[0] = x.x;
            this.f32a[4] = 0;
            this.f32a[8] = 0;
            this.f32a[12] = 0;

            this.f32a[1] = 0;
            this.f32a[5] = x.y;
            this.f32a[9] = 0;
            this.f32a[13] = 0;

            this.f32a[2] = 0;
            this.f32a[6] = 0;
            this.f32a[10] = x.z;
            this.f32a[14] = 0;

            this.f32a[3] = 0;
            this.f32a[7] = 0;
            this.f32a[11] = 0;
            this.f32a[15] = x.a;
        } else {
            if (x == null || isNaN(x)) { x = 0;}
            if (y == null || isNaN(y)) { y = 0;}
            if (z == null || isNaN(z)) { z = 0;}
            if (a == null || isNaN(a)) { a = 0;}

            //COLUMN MAJOR ALIGNMENT
            this.f32a[0] = x;
            this.f32a[4] = 0;
            this.f32a[8] = 0;
            this.f32a[12] = 0;

            this.f32a[1] = 0;
            this.f32a[5] = y;
            this.f32a[9] = 0;
            this.f32a[13] = 0;

            this.f32a[2] = 0;
            this.f32a[6] = 0;
            this.f32a[10] = z;
            this.f32a[14] = 0;

            this.f32a[3] = 0;
            this.f32a[7] = 0;
            this.f32a[11] = 0;
            this.f32a[15] = a;
        }
        return this;
    }
    makeRotation(a,b,y) {
        if (a instanceof vec4)
        {
            y = a.z;
            b = a.y;
            a = a.x;
        }

        //COLUMN MAJOR ALIGNMENT
        if (a == null || isNaN(a)) { a = 0;}
        if (b == null || isNaN(b)) { b = 0;}
        if (y == null || isNaN(y)) { y = 0;}
        var sa = Math.sin(a);
        var ca = Math.cos(a);
        var sb = Math.sin(b);
        var cb = Math.cos(b);
        var sy = Math.sin(y);
        var cy = Math.cos(y);

        this.f32a[0] = ca*cb;
        this.f32a[4] = ca*sb*sy-sa*cy;
        this.f32a[8] = ca*sb*cy+sa*sy;
        this.f32a[12] = 0;

        this.f32a[1] = sa*cb;
        this.f32a[5] = sa*sb*sy+ca*cy;
        this.f32a[9] = sa*sb*cy-ca*sy;
        this.f32a[13] = 0;

        this.f32a[2] = -sb;
        this.f32a[6] = cb*sy;
        this.f32a[10] = cb*cy;
        this.f32a[14] = 0;

        this.f32a[3] = 0;
        this.f32a[7] = 0;
        this.f32a[11] = 0;
        this.f32a[15] = 1;
        return this;
    }
    makeIdentity()
    {
        this.f32a[0] = 1;
        this.f32a[4] = 0;
        this.f32a[8] = 0;
        this.f32a[12] = 0;

        this.f32a[1] = 0;
        this.f32a[5] = 1;
        this.f32a[9] = 0;
        this.f32a[13] = 0;

        this.f32a[2] = 0;
        this.f32a[6] = 0;
        this.f32a[10] = 1;
        this.f32a[14] = 0;

        this.f32a[3] = 0;
        this.f32a[7] = 0;
        this.f32a[11] = 0;
        this.f32a[15] = 1;
        return this;
    }
    mul(mat) {
        if (mat instanceof mat4) {
            var f1 = this.getFloat32Array();
            var f2 = mat.getFloat32Array();
            var out = new mat4();
            var vals = [
                f1[0]*f2[0] + f1[4]*f2[1] + f1[8]*f2[2] + f1[12]*f2[3],
                f1[1]*f2[0] + f1[5]*f2[1] + f1[9]*f2[2] + f1[13]*f2[3],
                f1[2]*f2[0] + f1[6]*f2[1] + f1[10]*f2[2] + f1[14]*f2[3],
                f1[3]*f2[0] + f1[7]*f2[1] + f1[11]*f2[2] + f1[15]*f2[3],

                f1[0]*f2[4] + f1[4]*f2[5] + f1[8]*f2[6] + f1[12]*f2[7],
                f1[1]*f2[4] + f1[5]*f2[5] + f1[9]*f2[6] + f1[13]*f2[7],
                f1[2]*f2[4] + f1[6]*f2[5] + f1[10]*f2[6] + f1[14]*f2[7],
                f1[3]*f2[4] + f1[7]*f2[5] + f1[11]*f2[6] + f1[15]*f2[7],

                f1[0]*f2[8] + f1[4]*f2[9] + f1[8]*f2[10] + f1[12]*f2[11],
                f1[1]*f2[8] + f1[5]*f2[9] + f1[9]*f2[10] + f1[13]*f2[11],
                f1[2]*f2[8] + f1[6]*f2[9] + f1[10]*f2[10] + f1[14]*f2[11],
                f1[3]*f2[8] + f1[7]*f2[9] + f1[11]*f2[10] + f1[15]*f2[11],

                f1[0]*f2[12] + f1[4]*f2[13] + f1[8]*f2[14] + f1[12]*f2[15],
                f1[1]*f2[12] + f1[5]*f2[13] + f1[9]*f2[14] + f1[13]*f2[15],
                f1[2]*f2[12] + f1[6]*f2[13] + f1[10]*f2[14] + f1[14]*f2[15],
                f1[3]*f2[12] + f1[7]*f2[13] + f1[11]*f2[14] + f1[15]*f2[15],
            ];
            out.setValues(vals);
            return out;
        } else if (mat instanceof vec4) {
            var f1 = this.getFloat32Array();
            var f2 = mat.getFloat32Array();
            var vals = [
                f1[0]*f2[0] + f1[4]*f2[1] + f1[8]*f2[2] + f1[12]*f2[3],
                f1[1]*f2[0] + f1[5]*f2[1] + f1[9]*f2[2] + f1[13]*f2[3],
                f1[2]*f2[0] + f1[6]*f2[1] + f1[10]*f2[2] + f1[14]*f2[3],
                f1[3]*f2[0] + f1[7]*f2[1] + f1[11]*f2[2] + f1[15]*f2[3],
            ];
            return (new vec4).set(vals);
        }
        console.error("mat4.mul() was passed Object it couldn't multiply...");
        return null;
    }
    getFloat32Array()
    {
        return this.f32a;
    }
    toString()
    {
        //return this.print();
        var s = "";
        var vals = [];
        for (var i=0; i<16; i++)
        {
            vals.push(this.f32a[i].toPrecision(3));
        }
        s += vals[0] + " " + vals[4] + " " + vals[8] + " " + vals[12] + "\n";
        s += vals[1] + " " + vals[5] + " " + vals[9] + " " + vals[13] + "\n";
        s += vals[2] + " " + vals[6] + " " + vals[10] + " " + vals[14] + "\n";
        s += vals[3] + " " + vals[7] + " " + vals[11] + " " + vals[15] + "\n";
        return s;
    }
    print()
    {
        console.log(this.toString());
    }
    invert()
    {
        //Alrighty this is math I don't really care for but I need so here goes nothing
        
        /*
        0  4  8   12
        1  5  9   13
        2  6  10  14
        3  7  11  15
        */

        var mat2 = new mat4().makeIdentity();

        var row = 0;
        var column = 0;

        while(true) //always a good start
        {
            if ( this.f32a[row*4 + column] == 0)
            {
                
            }




            

        }

    }
}

class vec4 {
    constructor(x,y,z,a) {
        if (x == null || isNaN(x)) { x = 0;}
        if (y == null || isNaN(y)) { y = 0;}
        if (z == null || isNaN(z)) { z = 0;}
        if (a == null || isNaN(a)) { a = 0;}
        this.x = x;
        this.y = y;
        this.z = z;
        this.a = a;
    }

    set(x,y,z,a) {
        if (x != null && (x instanceof Array == false))
        {
            this.x = x;
            this.y = y;
            this.z = z;
            this.a = a;
        } else if (x instanceof Array) {
            switch (x.length) {
                case 4: this.x=x[0];this.y=x[1];this.z=x[2];this.a=x[3];break;
                case 3: this.x=x[0];this.y=x[1];this.z=x[2];break;
                case 2: this.x=x[0];this.y=x[1];break;
                case 1: this.x=x[0];break;
            };
        }
        return this;
    }

    add(x,y,z,a)
    {
        if (x instanceof vec4)
        {
            return new vec4(this.x+x.x, this.y+x.y, this.z+x.z, this.a+x.a);
        } else {
            if (isNaN(x)) { x = 0;}
            if (isNaN(y)) { y = 0;}
            if (isNaN(z)) { z = 0;}
            if (isNaN(a)) { a = 0;}
            return new vec4(this.x+x, this.y+y, this.z+z, this.a+a);
        }
    }

    sub(x,y,z,a)
    {
        //console.log("x: " + x + "  y: " + y + "  z: " + z + "  a: " + a);
        if (x instanceof vec4)
        {
            return new vec4(this.x-x.x, this.y-x.y, this.z-x.z, this.a-x.a);
        } else {
            if (isNaN(x)) { x = 0;}
            if (isNaN(y)) { y = 0;}
            if (isNaN(z)) { z = 0;}
            if (isNaN(a)) { a = 0;}
            return new vec4(this.x-x, this.y-y, this.z-z, this.a-a);
        }
    }

    mul(x,y=null,z=null,a=null)
    {
        //console.log("x: " + x + "  y: " + y + "  z: " + z + "  a: " + a);
        if (x instanceof vec4)
        {
            //multiply by vector
            return new vec4(this.x*x.x, this.y*x.y, this.z*x.z, this.a*x.a);
        } else if ( !isNaN(Number(x)) && y == null && z == null && a == null) {
            //multiply by scalar
            return new vec4(this.x*x, this.y*x, this.z*x, this.a*x);
        } else {
            //multiple by all scalars
            if (isNaN(x)) { x = 0;}
            if (isNaN(y)) { y = 0;}
            if (isNaN(z)) { z = 0;}
            if (isNaN(a)) { a = 0;}
            return new vec4(this.x*x, this.y*y, this.z*z, this.a*a);
        }
    }

    mulScalar(n)
    {
        //depricated
        console.error("vec4.mulScalar is depricated. Just use mul() and pass 1 Number.");
        return new vec4(this.x*n, this.y*n, this.z*n, this.a*n);
    }

    dot(vec)
    {
        if (vec instanceof vec4 == false)
        {
            console.error("vec4.dot() was passed a non vec4.")
            return null;
        }
        return this.x*vec.x + this.y*vec.y + this.z*vec.z + this.a*vec.a;
    }

    getFloat32Array()
    {
        return new Float32Array([this.x,this.y,this.z,this.a]);
    }

    copy()
    {
        return new vec4(this.x, this.y, this.z, this.a);
    }

    getLength()
    {
        return Math.sqrt(  this.x*this.x + this.y*this.y + this.z*this.z  );
    }

    scaleToUnit()
    {
        //divide each component by the length of the vector
        var L = this.getLength();
        this.x = this.x/L;
        this.y = this.y/L;
        this.z = this.z/L;
        this.a = this.a/L;
        return this;
    }

    round(val = 1)
    {   
        this.x = Math.round(this.x/val)*val;
        this.y = Math.round(this.y/val)*val;
        this.z = Math.round(this.z/val)*val;
        return this;
    }

    toString()
    {
        var p = 3;
        return "[ "+this.x.toPrecision(p)+", "+this.y.toPrecision(p)+", "+this.z.toPrecision(p)+", "+this.a.toPrecision(p)+" ]";
    }

    equals(otherVec4)
    {
        if (otherVec4 instanceof vec4 && otherVec4.x == this.x && otherVec4.y == this.y && otherVec4.z == this.z && otherVec4.a == this.a)
        {
            return true;
        }
        return false;
    }
}



function distanceBetweenPoints(v1,v2) //ONLY is for x y z NO a.
{
    return Math.sqrt(  Math.abs(Math.pow(v1.x-v2.x,2)) + Math.abs(Math.pow(v1.y-v2.y,2)) + Math.abs(Math.pow(v1.z-v2.z,2))  );
}


function vectorFromPointToPlane(planePoint, planeNormal, pointPosition, unitVecFromPoint)
{
    //u = x + (n dot (p-x))/(n dot v) * v

    //NOTE: this function is designed so you can "hit" plane from BOTH SIDES.
    //console.log("pointPosition: " + pointPosition.toString() + "\nunitVecFromPoint: "+unitVecFromPoint.toString()+"\nplaneNormal: "+planeNormal.toString()+"\nplanePoint: "+planePoint.toString());

    var denom = planeNormal.dot(unitVecFromPoint);
    if (denom > 0.000001)
    {
        var p0l0 = planePoint.sub(pointPosition);
        var t = ( p0l0.dot(planeNormal)) / denom;
        var p = pointPosition.add(  unitVecFromPoint.mul(t)  );
        p.a = 1;
        return p;
    } else {
        planeNormal.x = -planeNormal.x;
        planeNormal.y = -planeNormal.y;
        planeNormal.z = -planeNormal.z;
        var denom = planeNormal.dot(unitVecFromPoint);
        if (denom > 0.000001)
        {
            var p0l0 = planePoint.sub(pointPosition);
            var t = ( p0l0.dot(planeNormal)) / denom;
            var p = pointPosition.add(  unitVecFromPoint.mul(t)  );
            p.a = 1;
            return p;
        } else {
            return null;
        }
    }
}