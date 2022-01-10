class Object {
    constructor(pos, rot) {
        if (pos instanceof vec4)
        {
            this.position = pos;
        } else {
            this.position = new vec4();
        }
        if (rot instanceof vec4)
        {
            this.rotation = rot;
        } else {
            this.rotation = new vec4();
        }
        
        this.translateMat = new mat4().makeTranslation(this.position);
        this.rotateMat = new mat4().makeRotation(this.rotation);
        this.objectMat = this.translateMat.mul(this.rotateMat);

        this.vertices = [0,0,0, 0,0,2, 0,1,1];
        this.normals = [1,0,0, 1,0,0, 1,0,0];
        this.colors = [1,0,0,1, 0,1,0,1, 0,0,1,1,];
        this.indices = [0,1,2];

        this.buffers = initBuffers(this.vertices, this.normals, this.colors, this.indices);
    }

    setPosition(position)
    {
        if (position instanceof vec4)
        {
            this.position = position;
            this.translateMat.makeTranslation(this.position);
            this.objectMat = this.translateMat.mul(this.rotateMat);
        } else {
            console.error("Body.setPosition() takes a vec4. Not whatever the hell you just passed it.");
        }
    }
    setRotation(rotation)
    {
        if (rotation instanceof vec4)
        {
            this.rotation = rotation;
            this.rotateMat.makeTranslation(this.rotation);
            this.objectMat = this.translateMat.mul(this.rotateMat);
        } else {
            console.error("Body.setRotation() takes a vec4. Not whatever the hell you just passed it.");
        }
    }
    getPosition()
    {
        return this.position;
    }
    getRotation()
    {
        return this.rotation;
    }

    setData(vertices, normals, colors, indices)
    {
        if (vertices instanceof Array)
        {
            this.vertices = vertices;
        }
        if (normals instanceof Array)
        {
            this.normals = normals;
        }
        if (colors instanceof Array)
        {
            this.colors = colors;
        }
        if (indices instanceof Array)
        {
            this.indices = indices;
        }
        this.buffers = initBuffers(this.vertices, this.normals, this.colors, this.indices);
    }
    refresh()
    {   //refreshes all matrices and buffers
        this.translateMat = new mat4().makeTranslation(this.position);
        this.rotateMat = new mat4().makeRotation(this.rotation);
        this.objectMat = this.translateMat.mul(this.rotateMat);
        this.buffers = initBuffers(this.vertices, this.normals, this.colors, this.indices);
    }
    draw(gl, projectionMatrix, viewMatrix)
    {
        DrawDefault(gl, projectionMatrix, viewMatrix, this.objectMat, this.indices, this.buffers);
    }
}




class Grid extends Object{
    constructor(position, rotation) {
        super(position, rotation);

        this.gridScale = 0.25;
        this.majorLineDivisor = 10;     //How many minor lines between major lines?
        this.numLines = 50;             //number of lines in each direction

        this.majorLineColor = new vec4(.3, .3, .3, 1);
        this.minorLineColor = new vec4(.7, .7, .7, 1);
    
        this._generateData();
    }
    _generateData()
    {
        this.vertices = [];
        this.colors = [];
        this.indices = [];

        var ind = 0; //indice iterator
        var p = new vec4();
        for (var j=1; j<this.numLines*2; j+=1 )
        {
            var i = j*this.gridScale - this.numLines * this.gridScale;
            //lines parallel to x 
            p.x = i;
            p.y = 0;
            p.z = -this.numLines*this.gridScale;

            this.vertices.push(p.x);
            this.vertices.push(p.y);
            this.vertices.push(p.z);

            p.z = this.numLines*this.gridScale;

            this.vertices.push(p.x);
            this.vertices.push(p.y);
            this.vertices.push(p.z);

            this.indices.push(ind);
            this.indices.push(ind+1);
            ind += 2;

            //lines parallel to z
            p.x = -this.numLines*this.gridScale;
            p.y = 0;
            p.z = i;

            this.vertices.push(p.x);
            this.vertices.push(p.y);
            this.vertices.push(p.z);

            p.x = this.numLines*this.gridScale;

            this.vertices.push(p.x);
            this.vertices.push(p.y);
            this.vertices.push(p.z);

            this.indices.push(ind);
            this.indices.push(ind+1);
            ind += 2;

            if (Math.abs(j)%(this.majorLineDivisor) == 0)
            {
                for (var k=0; k<4; k++) {
                    this.colors.push(this.majorLineColor.x);
                    this.colors.push(this.majorLineColor.y);
                    this.colors.push(this.majorLineColor.z);
                    this.colors.push(this.majorLineColor.a);
                }
            } else {
                for (var k=0; k<4; k++) {
                    this.colors.push(this.minorLineColor.x);
                    this.colors.push(this.minorLineColor.y);
                    this.colors.push(this.minorLineColor.z);
                    this.colors.push(this.minorLineColor.a);
                }
            }

        }

        //Update the buffers
        this.buffers = initBuffers(this.vertices, this.normals, this.colors, this.indices);
    }
    getNormalVector()
    {
        return this.rotateMat.mul(new vec4(0,1,0));
    }
    draw(gl, projectionMatrix, viewMatrix)
    {
        var dist = distanceBetweenPoints( player.getPosition(), this.getPosition() );

        var scaleVector = new vec4(1,1,1,1);


        DrawGrid(gl, projectionMatrix, viewMatrix, this.objectMat, scaleVector,  this.indices, this.buffers, false);
    }
}



class Compass extends Object{
    constructor(position, rotation){
        super(position, rotation);

        super.setData([0,0,0, .1,0,0, 0,.1,0, 0,0,.1,],            //vertices
                [1,1,1, 1,1,1, 1,1,1, 1,1,1,],                  //normals
                [.3,.3,.3,1,  1,0,0,1,  0,1,0,1, 0,0,1,1,],     //colors
                [0,1, 0,2, 0,3]                                 //indices
               );

        var aspect = glCanvasElement.width/glCanvasElement.height;
        this.setPosition(new vec4(-0.92*aspect,0.87,0));
    }

    addLine(pos1, pos2) {
        lines.push([pos1, pos2]);
    }

    draw(gl, projectionMatrix, viewMatrix)
    {
        var aspect = glCanvasElement.width/glCanvasElement.height;

        this.rotation = player.getRotation();
        this.rotateMat.makeRotation(this.rotation);
        this.rotateMat = player.getRotationMatrix();
        //this.objectMat = this.translateMat.mul(player.getRotationMatrix());
        DrawDefault(gl, new mat4().makeOrthogonal(aspect), this.translateMat, this.rotateMat, this.indices, this.buffers, false);
    }
}





class Sketch {
    constructor(){
        this.position = new vec4(.05,0.05,0.05);
        this.rotation = new vec4();
        this.positionMat = new mat4().makeTranslation(this.position);
        this.rotationMat = new mat4().makeRotation(this.rotation);

        this.lines = [];

        this.vertices = [0,0,0,  1,0,0, -1,0,0,  0,1,0,  0,-1,0,  0,0,1,  0,0,-1];
        this.normals = [0,1,0,  0,1,0,  0,1,0,  0,1,0,   0,1,0,   0,1,0,  0,1,0];
        this.colors = [0,0,0,1, 1,0,0,1,, 1,0,0,1, 0,1,0,1, 0,1,0,1, 0,0,1,1, 0,0,1,1,];
        this.indices = [0,1, 0,2, 0,3, 0,4, 0,5, 0,6];

        this.buffers = initBuffers(this.vertices, this.normals, this.colors, this.indices);
    }



    addLine(pos1, pos2) {
        lines.push([pos1, pos2]);
    }

    draw(gl, projectionMatrix, viewMatrix)
    {
        //this.buffers = initBuffers(this.vertices, this.normals, this.colors, this.indices);
        //var objMat = new mat4();
        //var aspect = glCanvasElement.width/glCanvasElement.height;
       // objMat.makeTranslation(this.);
        //this.positionMat.makeTranslation(this.position);
        //this.rotationMat.makeRotation(this.rotation);
        DrawDefault(gl, projectionMatrix, viewMatrix, this.positionMat.mul(this.rotationMat), this.indices, this.buffers, false);
    }
}


class Body extends Object {
    draw(gl, projectionMatrix, viewMatrix)
    {
        DrawDefault(gl, projectionMatrix, viewMatrix, this.objectMat, this.indices, this.buffers);
    }
}



