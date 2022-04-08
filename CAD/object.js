class Object {
    constructor(pos = new vec4(), rot = new vec4()) {
        this.position = pos;
        this.rotation = rot;
        
        this.translationMatrix = new mat4().makeTranslation(this.position);
        this.rotationMatrix = new mat4().makeRotation(this.rotation);
        this.objectMat = this.translationMatrix.mul(this.rotationMatrix);

        this.vertices = [0,0,0, 0,0,2, 0,1,1];
        this.normals = [1,0,0, 1,0,0, 1,0,0];
        this.colors = [1,0,0,1, 0,1,0,1, 0,0,1,1,];
        this.indices = [0,1,2];

        this.enableDraw = true;

        this.buffers = initBuffers(this.vertices, this.normals, this.colors, this.indices);
    }
    setPosition(position)
    {
        if (position instanceof vec4)
        {
            this.position = position;
            this.translationMatrix.makeTranslation(this.position);
            this.objectMat = this.translationMatrix.mul(this.rotationMatrix);
        } else {
            console.error("Body.setPosition() takes a vec4. Not whatever the hell you just passed it.");
        }
    }
    setRotation(rotation)
    {
        if (rotation instanceof vec4)
        {
            this.rotation = rotation;
            this.rotationMatrix.makeRotation(this.rotation);
            this.objectMat = this.translationMatrix.mul(this.rotationMatrix);
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
    getRotationMatrix()
    {
        return this.rotationMatrix;
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
        this.translationMatrix = new mat4().makeTranslation(this.position);
        this.rotationMatrix = new mat4().makeRotation(this.rotation);
        this.objectMat = this.translationMatrix.mul(this.rotationMatrix);
        this.buffers = initBuffers(this.vertices, this.normals, this.colors, this.indices);
    }
    draw(gl, projectionMatrix, viewMatrix)
    {
        if (!this.enableDraw) {return;}
        DrawDefault(gl, projectionMatrix, viewMatrix, this.objectMat, this.indices, this.buffers);
    }
}

class Grid extends Object{
    constructor(position = new vec4(), rotation = new vec4(), gridScale = 1, colorMod = new vec4(1,1,1,1)) {
        super(position, rotation);

        this.gridScale = gridScale;
        this.majorLineDivisor = 10;     //How many minor lines between major lines?
        this.numLines = 50;             //number of lines in each direction

        this.majorLineColor = new vec4(.3, .3, .3, 1);
        this.minorLineColor = new vec4(.7, .7, .7, 1);

        this.normalVector = this.rotationMatrix.mul(new vec4(0,0,-1));
        this.scaleVector = new vec4(1,1,1,1);

        this.colorMod = colorMod;
    
        this._generateData();
    }
    _generateData()
    {
        this.vertices = [];
        this.colors = [];
        this.indices = [];

        var ind = 0; //indice iterator
        var p = new vec4();
        for (var j=0; j<this.numLines*2+1; j+=1 )
        {
            var i = j*this.gridScale - this.numLines * this.gridScale;
            //lines parallel to x 
            p.x = i;
            p.y = -this.numLines*this.gridScale;
            p.z = 0;

            this.vertices.push(p.x);
            this.vertices.push(p.y);
            this.vertices.push(p.z);

            p.y = this.numLines*this.gridScale;

            this.vertices.push(p.x);
            this.vertices.push(p.y);
            this.vertices.push(p.z);

            this.indices.push(ind);
            this.indices.push(ind+1);
            ind += 2;

            //lines parallel to z
            p.x = -this.numLines*this.gridScale;
            p.y = i;
            p.z = 0;

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
        this.buffers = initBuffers(this.vertices, [], this.colors, this.indices);
    }
    setRotation(rotation)
    {
        if (rotation instanceof vec4)
        {
            this.rotation = rotation;
            this.rotationMatrix.makeRotation(this.rotation);
            this.objectMat = this.translationMatrix.mul(this.rotationMatrix);
            this.normalVector = this.rotationMatrix.mul(new vec4(0,0,-1));
        } else {
            console.error("Body.setRotation() takes a vec4. Not whatever the hell you just passed it.");
        }
    }
    getNormalVector()
    {
        return this.normalVector;
    }
    getIntersectionPoint(position = new vec4(), directionVector = new vec4(), snapScale = null)
    {
        var v = vectorFromPointToPlane(this.position, this.normalVector, position, directionVector);
        if (snapScale != null) {
            v = (new mat4()).makeRotation(this.rotation.mul(-1)).mul(v);
            v.x = Math.round(v.x/snapScale) * snapScale;
            v.y = Math.round(v.y/snapScale) * snapScale;
            v.z = Math.round(v.z/snapScale) * snapScale;
            v = this.rotationMatrix.mul(v);
        }
        return v;
    }
    draw(gl, projectionMatrix, viewMatrix)
    {
        if (!this.enableDraw) {return;}
        //var scaleVector = new vec4(1,1,1,1);
        //DrawGrid(gl, projectionMatrix, viewMatrix, this.objectMat, scaleVector,  this.indices, this.buffers, false);
        DrawGrid(gl, projectionMatrix, viewMatrix, this.objectMat, this.indices, this.buffers, this.scaleVector, this.colorMod);
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
        this.setPosition(new vec4(-0.92*aspect,0.87,-1));
    }

    draw(gl, projectionMatrix, viewMatrix)
    {
        if (!this.enableDraw) {return;}
        this.rotationMatrix = camera.getRotationMatrix();
        DrawDefault(gl, new mat4().makeOrthogonal(1,aspect,0,100), this.translationMatrix, this.rotationMatrix, this.indices, this.buffers, false);
    }
}

class Text {
    constructor(pos = new vec4(), rot = new vec4(), text = "default_text", textColor = new vec4(0,0,0,255), shouldBake = false)
    {
        this.position = pos;
        this.rotation = rot;
        
        this.translationMatrix = null;
        this.rotationMatrix = null;
        this.objectMat = null;
        this.buffers = null;
        
        this.text = text;
        this.textColor = textColor;
        this.textScale = new vec4(1,1,1,1);
        this.spacing = 0.1; //Distance between letters

        this.baked = false; //Boolean storing whether or not we have "baked" the vertices & indices.

        this.enableDraw = true;

        this.refresh();

        if (shouldBake)
        {
            this.bake();
        }
    }

    setPosition(position)
    {
        if (position instanceof vec4)
        {
            this.position = position;
            this.translationMatrix.makeTranslation(this.position);
            this.objectMat = this.translationMatrix.mul(this.rotationMatrix);
        } else {
            console.error("Body.setPosition() takes a vec4. Not whatever the hell you just passed it.");
        }
    }
    setRotation(rotation)
    {
        if (rotation instanceof vec4)
        {
            this.rotation = rotation;
            this.rotationMatrix.makeTranslation(this.rotation);
            this.objectMat = this.translationMatrix.mul(this.rotationMatrix);
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
    setText(text = "", shouldBake = false)
    {
        this.text = text;
        this.baked = false;
        if (shouldBake)
        {
            this.bake();
        }
    }
    setTextScale(x=new vec4(1,1,1,1),y=1,z=1)
    {
        if (x instanceof vec4)
        {
            this.textScale = x.copy();
        } else {
            this.textScale = new vec4(x,y,z,1);
        }
    }
    refresh()
    {   //refreshes all matrices and buffers
        this.translationMatrix = new mat4().makeTranslation(this.position);
        this.rotationMatrix = new mat4().makeRotation(this.rotation);
        this.objectMat = this.translationMatrix.mul(this.rotationMatrix);
        this.buffers = initBuffersForText(asciiVertices, asciiIndices[0]);
    }
    bake()
    {   
        var xPosOffset = 0;
        this.vertices = [];
        this.indices = [];

        //for each letter
        for (var i=0; i<this.text.length; i++)
        {
            var asciiIndex = this.text[i].charCodeAt(0);
            var oldIndices = asciiIndices[asciiIndex];
            if (oldIndices != null)
            {

                var oldIndiceToNewIndice = {};

                for (var j=0; j<oldIndices.length; j++)
                {
                    //for each old indice
                    var newInd = oldIndiceToNewIndice[ oldIndices[j] ];
                    if (newInd == null)
                    {
                        //if null, we haven't encountered this oldIndice before
                        oldIndiceToNewIndice[oldIndices[j]] = this.vertices.length/3;
                        newInd = this.vertices.length/3;
                        this.vertices.push( asciiVertices[oldIndices[j]*3 + 0] + xPosOffset );           //
                        this.vertices.push( asciiVertices[oldIndices[j]*3 + 1] );
                        this.vertices.push( asciiVertices[oldIndices[j]*3 + 2] );
                    }

                    //Now, we have the newInd and the corrosponding vertice is in var vertices
                    this.indices.push(newInd);
                }
                xPosOffset += this.spacing + asciiWidths[asciiIndex];
            }
        }

        this.buffers = initBuffers(this.vertices, null, [255,0,0,255], this.indices);
        this.baked = true;
    }
    draw(gl, projectionMatrix, viewMatrix)
    {
        if (!this.enableDraw) {return;}
        if (this.baked == true)
        {
            DrawBakedText(gl, projectionMatrix, viewMatrix, this.objectMat, this.buffers, this.indices, this.textColor, this.textScale);
        } else {
            DrawText(gl, projectionMatrix, viewMatrix, this.objectMat, this.buffers, this.textColor, this.text, this.textScale, this.spacing);
        }
    }
}

class Body extends Object {
    constructor(pos = new vec4(), rot = new vec4(), scale = new vec4(1,1,1,1)) {
        super(pos, rot);
        this.scale = scale;
        this.type = 'Body'
        this.id = Math.round(Math.random()*1000000); //assign random id

        this.lineIndices = [0,1];
        this.lineBuffers = initBuffers(this.vertices, [], [], this.lineIndices);
    }
    getScale()
    {
        return this.scale;
    }
    setScale(scale = vec4())
    {
        this.scale = scale;
    }
    draw(gl, projectionMatrix, viewMatrix, highlightVector = new vec4())
    {
        if (!this.enableDraw) {return;}
        //DrawDefault(gl, projectionMatrix, viewMatrix, this.objectMat, this.indices, this.buffers);
        //DrawBody(gl, projectionMatrix, viewMatrix, this.translationMatrix, this.rotationMatrix, this.scale, this.indices, this.buffers, highlightVector);
        DrawLine(gl, projectionMatrix, viewMatrix, this.translationMatrix, this.rotationMatrix, this.scale, this.lineIndices, this.lineBuffers);
        DrawBody(gl, projectionMatrix, viewMatrix, this.translationMatrix, this.rotationMatrix, this.scale, this.indices, this.buffers, highlightVector);
    }
    refresh(){
        super.refresh();
        this.lineBuffers = initBuffers(this.vertices, [], [], this.lineIndices);
    }
    getHTMLText()
    {
        return ""
            + "<item id = \'"+this.id+"\' checked=false onclick = \"objectClicked(this); this.setAttribute('checked', 'checked'); console.log(this.checked);\" >" 
                + "<div style='font-size: larger'>"    
                    + this.type + ":" + this.id
                + "</div>"
                + "<div class = 'objectDetailsContainer'>"
                    + "<div style='display:flex;'>"
                        + "position"
                        + "\<<input class = 'vectorInput' name='posX' id = \'"+this.id+"\' type='number' value = "+this.position.x+" oninput=objectParameterChanged(this)></input> "
                        + ",<input class = 'vectorInput' name='posY' id = \'"+this.id+"\' type='number' value = "+this.position.y+" oninput=objectParameterChanged(this)></input> "
                        + ",<input class = 'vectorInput' name='posZ' id = \'"+this.id+"\' type='number' value = "+this.position.z+" oninput=objectParameterChanged(this)></input> \>"
                    +"</div>"
                    + "<div style='display:flex;'>"
                        + "rotation"
                        + "\<<input class = 'vectorInput' name='rotX' id = \'"+this.id+"\' type='number' value = "+this.rotation.x+" oninput=objectParameterChanged(this)></input> "
                        + ",<input class = 'vectorInput' name='rotY' id = \'"+this.id+"\' type='number' value = "+this.rotation.y+" oninput=objectParameterChanged(this)></input> "
                        + ",<input class = 'vectorInput' name='rotZ' id = \'"+this.id+"\' type='number' value = "+this.rotation.z+" oninput=objectParameterChanged(this)></input> \>"
                    +"</div>"
                    + "<div style='display:flex;'>"
                        + "scale"
                        + "\<<input class = 'vectorInput' name='scaX' id = \'"+this.id+"\' type='number' value = "+this.scale.x+" oninput=objectParameterChanged(this)></input> "
                        + ",<input class = 'vectorInput' name='scaY' id = \'"+this.id+"\' type='number' value = "+this.scale.y+" oninput=objectParameterChanged(this)></input> "
                        + ",<input class = 'vectorInput' name='scaZ' id = \'"+this.id+"\' type='number' value = "+this.scale.z+" oninput=objectParameterChanged(this)></input> \>"
                    +"</div>"
                + "</div>"
            + "</item>";
    }
    getSaveText(){
        let out = "@"
        +"_type:"+this.type
        +"_id:"+this.id
        +"_position:"+this.position.x+","+this.position.y+","+this.position.z+","+this.position.a
        +"_rotation:"+this.rotation.x+","+this.rotation.y+","+this.rotation.z+","+this.rotation.a
        +"_scale:"+this.scale.x+","+this.scale.y+","+this.scale.z+","+this.scale.a
        +"_vertices:"+this.vertices
        +"_indices:"+this.indices
        +"_normals:"+this.normals
        +"_colors:"+this.colors
        return out + "\n\n";
    }
}

class Cube extends Body {
    constructor(pos = new vec4(), rot = new vec4(), scale = new vec4(1,1,1,1)) {
        super(pos, rot, scale);

        this.type = 'Cube';

        this.vertices = [
            -1,1,1, 1,1,1, 1,-1,1, -1,-1,1, //front
            -1,1,-1, -1,-1,-1, 1,-1,-1, 1,1,-1, //back
            -1,1,1, -1,1,-1, 1,1,-1, 1,1,1, //top
            -1,1,1, -1,-1,1, -1,-1,-1, -1,1,-1, //left
            1,1,1, 1,1,-1, 1,-1,-1, 1,-1,1, //right
            -1,-1,1, 1,-1,1, 1,-1,-1, -1,-1,-1, //bottom
        ];
        for (var i in this.vertices) {this.vertices[i] /= 2;}
        this.indices = [
            0,2,1, 0,3,2, //front
            4,6,5, 4,7,6, //back
            8,10,9, 8,11,10, //top
            12,14,13, 12,15,14, //left
            16,18,17, 16,19,18, //right
            20,22,21, 20,23,22, //bottom
        ];
        this.normals = [
            0,0,1, 0,0,1, 0,0,1, 0,0,1,
            0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
            0,1,0, 0,1,0, 0,1,0, 0,1,0,
            -1,0,0, -1,0,0, -1,0,0, -1,0,0, //left
            1,0,0, 1,0,0, 1,0,0, 1,0,0, //right
            0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0, //bottom
        ];
        this.colors = [
            /*
            1,0,0,1, 1,0,0,1, 1,0,0,1, 1,0,0,1,
            0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1,
            0,0,1,1, 0,0,1,1, 0,0,1,1, 0,0,1,1,
            1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1,
            1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1,
            0,1,1,1, 0,1,1,1, 0,1,1,1, 0,1,1,1*/
            0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1,
            0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1,
            0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1,
            0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1,
            0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1,
            0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1, 0.5,0.5,0.5,1,
        ];

        this.lineIndices = [0,1, 1,2, 2,3, 3,0, 
            4,5,5,6,6,7,7,4, 
            0,4, 7,1, 2,6, 5,3];
        this.refresh();
    }
}

class Cylinder extends Body {
    constructor(pos = new vec4(), rot = new vec4(), scale = new vec4(1,1,1,1)) {
        super(pos, rot, scale);

        this.type = 'Cylinder';

        

        this._generateMesh();

        this.refresh();
    }
    _generateMesh() {
        let rad = 0.5;
        let height = 1;
        let divisions = 20;

        this.vertices = [0,height/2,0, 0,-height/2,0, ];
        this.indices = [];
        this.normals = [0,1,0,  0,-1,0];
        this.colors = [0.5, 0.5, 0.5, 1,   0.5, 0.5, 0.5, 1];
        this.lineIndices = [];

        let i = 2;
        let si = 2;

        for (var a=0; a<2*Math.PI; a += 2*Math.PI/divisions)
        {   
            this.vertices.push( Math.cos(a)*rad, height/2, Math.sin(a)*rad ); //adding top vertice
            this.vertices.push( Math.cos(a)*rad, -height/2, Math.sin(a)*rad ); //adding bottom vertice

            this.colors.push( 0.5, 0.5, 0.5, 1,  0.5, 0.5, 0.5, 1, );
            this.normals.push( Math.cos(a), 0, Math.sin(a),    Math.cos(a), 0, Math.sin(a),  );
            i += 2;
            if (a > 0)
            {
                //                 side triangle 1   side triangle 2  top triangle  bottom triangle
                this.indices.push( i-1, i-3, i-2,   i-3, i-4, i-2,  0, i-2, i-4,  1,i-3,i-1);
                this.lineIndices.push(i-1, i-3, i-2, i-4);
            }
        }
        this.indices.push( i-1, i-2, si,   si,si+1, i-1,  i-2,0,si,   1, i-1, si+1);
        this.lineIndices.push(i-1, si+1, i-2, si);
    }
}

class Sphere extends Body {
    constructor(pos = new vec4(), rot = new vec4(), scale = new vec4(1,1,1,1)) {
        super(pos, rot, scale);

        this.type = 'Sphere';
        this._generateMesh();
        this.refresh();
    }
    _generateMesh() {
        let rad = 1.0;
        let numDivisions = 10;

        this.vertices = [0,1,0]; 
        this.indices =[];
        this.colors = [];
        this.normals = [];

        let numInPreviousRow = 1;
        let indiceStartPrevRow = 1;
        for (var i=0; i<numDivisions; i++)
        {
            let y = Math.cos(Math.PI * i/numDivisions);
            let r = Math.sin(Math.PI * i/numDivisions);
            //let circ = 2*Math.PI*r;
            //console.log("y: "+ y + " r: " + r);
            
            for (var a=0; a<numDivisions; a++)
            {
                let x = r*Math.cos(2*Math.PI * a/numDivisions);
                let z = r*Math.sin(2*Math.PI * a/numDivisions);

                this.vertices.push(x,y,z);
                this.colors.push(0.5,0.5,0.5,1);
                let n = new vec4(x,y,z);
                n.scaleToUnit();
                this.normals.push(n.x, n.y, n.z);
                if (i != 0 && a != 0)
                {
                    this.indices.push((i-1)*numDivisions + a, (i)*numDivisions + a-1, (i-1)*numDivisions + a-1,  );
                }
            }
            indiceStartPrevRow += numDivisions;
            //for (var a=0; a<)
        }
    }
}



//This is all used for Text. It contains all of the triangles necessary for creating each ascii shape
const asciiVertices = [
    0,-0.2,0,0,-0.1,0,0,0,0,0,0.1,0,0,0.2,0,0,0.3,0,0,0.4,0,0,0.5,0,0,0.6,0,0,0.7,0,0,0.8,0,0.1,
    -0.2,0,0.1,-0.1,0,0.1,0,0,0.1,0.1,0,0.1,0.2,0,0.1,0.3,0,0.1,0.4,0,0.1,0.5,0,0.1,0.6,0,0.1,0.7,
    0,0.1,0.8,0,0.2,-0.2,0,0.2,-0.1,0,0.2,0,0,0.2,0.1,0,0.2,0.2,0,0.2,0.3,0,0.2,0.4,0,0.2,0.5,0,
    0.2,0.6,0,0.2,0.7,0,0.2,0.8,0,0.3,-0.2,0,0.3,-0.1,0,0.3,0,0,0.3,0.1,0,0.3,0.2,0,0.3,0.3,0,0.3,
    0.4,0,0.3,0.5,0,0.3,0.6,0,0.3,0.7,0,0.3,0.8,0,0.4,-0.2,0,0.4,-0.1,0,0.4,0,0,0.4,0.1,0,0.4,0.2,
    0,0.4,0.3,0,0.4,0.4,0,0.4,0.5,0,0.4,0.6,0,0.4,0.7,0,0.4,0.8,0
];

const asciiIndices = [
    null,null,null,null,null,null,null,null,null,null,  //0-9
    null,null,null,null,null,null,null,null,null,null,  //10 - 19
    null,null,null,null,null,null,null,null,null,null,  //20 - 29
    null,null,  //30 - 31

    [], // (Space)
    [3,2,13,13,14,3,4,15,21,21,10,4], // !    
    [8,21,32,32,19,8,30,43,54,54,41,30], // "
    [2,20,31,31,13,2,24,42,53,53,35,24,7,51,50,50,6,7,5,49,48,48,4,5], //#
    null,
    [8,7,18,18,19,8,37,36,47,47,48,37,42,2,13,13,53,42], //% 
    null, // &
    [21,8,19,19,32,21], // '
    [7,4,13,13,20,7,20,32,31,31,19,20,13,23,24,24,14,13], // (
    [13,26,29,29,20,13,20,10,9,9,19,20,1,13,2,2,14,13], // )
    [7,21,19,19,29,21,19,9,20,19,31,20], //*
    [6,39,38,38,5,6,18,15,26,26,29,18], // +
    [14,2,1,14,25,24,1,24,14], // ,
    [6,39,38,38,5,6], // -
    [3,14,13,13,2,3], // .
    [1,43,54,54,12,1], //  /

    //Numbers: 48-57
    [13,3,9,9,21,13,21,43,53,53,9,21,53,47,35,35,43,53,47,3,13,13,35,47], //0
    [8,9,21,21,32,8,32,24,13,13,21,32,3,36,35,35,2,3], //1
    [46,2,3,3,47,46,3,52,51,51,2,3,51,53,43,43,39,51,43,21,9,9,53,43,21,9,8,8,19,21], //2
    [4,15,13,13,3,4,3,47,35,35,13,3,8,9,21,21,19,8,9,21,43,43,53,9,53,51,39,39,43,53,47,49,39,39,35,47,40,28,38], //3
    [10,6,17,17,21,10,43,35,46,46,54,43,50,6,7,7,51,50], //4
    [9,53,54,54,10,9,10,6,17,17,21,10,7,40,50,50,6,7,50,47,35,35,40,50,35,13,3,3,47,35,3,4,15,15,13,3],//5
    [3,47,35,35,13,3,3,6,18,18,40,50,50,6,18,18,13,3,50,47,35,35,40,50,17,43,32,32,6,17], //6
    [10,54,53,53,9,10,53,24,13,13,42,53],//7
    [9,21,43,43,53,9,9,7,17,17,21,9,7,51,39,39,17,7,39,43,53,53,51,39,18,6,3,3,13,18,40,50,47,47,35,40,3,47,35,35,13,3],//8
    [17,7,9,9,21,17,21,43,53,53,9,21,53,51,39,39,43,53,39,17,7,7,51,39,51,24,13,13,40,51], //9
    

    //Special characters 58-64
    [7,6,17,17,18,7,15,4,3,3,15,14], // :
    [3,15,12,12,1,3,7,6,17,17,18,7], // ;
    [6,51,52,6,49,48,49,17,6,17,51,6], // <
    [50,6,7,7,51,50,49,5,4,4,48,49], // = 
    [8,50,7,50,5,4,7,39,50,39,5,50], // >
    [18,7,9,9,21,18,21,43,53,53,9,21,53,51,39,39,43,53,40,37,26,26,28,40,25,24,35,36,25,35], // ?
    [48,53,43,43,38,48,43,21,9,9,53,43,9,2,12,12,21,9,2,46,34,34,12,2,28,26,48,48,39,28], //@

    //Uppercase Letters: 65-90
    [2,21,32,32,13,2,43,46,35,35,32,43,21,43,31,17,39,38,38,16,17], // A
    [10,2,13,13,21,10,10,43,53,53,9,10,53,51,39,39,43,53,39,49,47,47,35,39,35,2,3,3,47,35,7,40,39,39,6,7], //B
    [9,21,43,43,53,9,53,52,41,41,43,53,21,13,3,3,9,21,3,47,35,35,13,3,47,48,37,37,35,47], // C
    [10,2,13,13,21,10,52,47,35,35,2,3,3,47,35,41,52,35,10,32,42,42,9,10,42,52,41,41,31,42], //D
    [54,10,9,9,53,54,10,2,13,13,21,10,3,47,46,46,2,3,6,39,38,38,5,6], //E
    [2,10,21,21,13,2,10,54,53,53,9,10,6,39,38,38,5,6], //F
    [52,41,42,52,53,42,53,43,21,9,21,53,9,3,13,13,20,9,3,47,35,35,13,3,27,49,48,48,26,27,37,35,46,46,48,37], //G
    [10,21,13,13,2,10,6,50,49,49,5,6,43,35,46,46,54,43], //H
    [21,13,24,24,32,21,10,43,42,42,9,10,3,36,35,35,2,3], //I
    [10,54,53,53,9,10,43,36,24,24,32,43,24,13,3,3,36,24,3,4,15,15,13,3], //J
    [10,2,13,13,21,10,38,35,46,38,48,46,48,8,7,7,47,48,43,41,53,53,54,43,53,5,6,6,54,53], // K
    [10,2,13,13,21,10,3,47,46,46,2,3], //L
    [2,10,21,21,13,2,35,43,54,54,46,35,21,29,18,29,43,40,18,27,40], //M
    [13,21,10,10,2,13,54,46,35,35,43,54,21,46,35,35,10,21], //N
    [3,13,35,35,47,3,3,9,21,21,13,3,21,43,53,53,9,21,53,47,35,35,43,53], //O
    [10,2,13,13,21,10,10,43,53,53,9,10,53,51,39,39,43,53,39,6,7,7,51,39], //p
    [24,48,37,37,13,24,3,36,24,24,13,3,3,9,21,21,13,3,21,43,53,53,9,21,53,48,37,37,43,53,27,47,46,46,26,27], //Q
    [10,2,13,13,21,10,10,43,53,53,9,10,53,51,39,39,43,53,39,6,7,7,51,39,39,49,46,46,35,39,28,38,39], //R
    [53,43,21,53,9,21,3,13,35,35,47,3,9,7,17,17,21,9,47,49,39,39,35,47,38,17,18,18,39,38,14,4,3,42,52,53], //S
    [10,54,53,53,9,10,32,24,35,35,43,32], //T
    [10,3,13,13,21,10,13,46,47,47,3,13,46,54,43,43,35,46], //U
    [10,24,35,35,21,10,24,43,54,54,35,24], //V
    [10,2,13,13,21,10,43,35,46,46,54,43,13,26,15,26,35,37,15,28,37], //W
    [21,46,35,35,10,21,43,2,13,13,54,43], //X
    [24,28,39,39,35,24,28,10,21,21,39,28,39,54,43,43,28,39], //Y
    [10,54,53,53,9,10,53,14,3,3,42,53,3,2,46,46,47,3], //Z


    //91-96
    [31,32,10,10,9,31,10,1,12,12,21,10,2,24,23,23,1,2], // [
    [10,21,34,34,23,10], // \
    [10,32,31,31,9,10,32,23,12,12,21,32,2,24,23,23,1,2], // ]
    [9,8,21,21,20,8,20,30,31,31,21,20], // ^
    [2,46,45,45,1,2], // _
    [10,19,30,30,21,10], // `

    //Lowercase letters: 97-122
    [46,50,40,40,35,46,35,13,3,3,47,35,40,18,6,6,50,40,3,4,16,16,13,3,16,49,48,48,4,16], //a
    [10,2,13,21,10,13,7,40,50,50,6,7,50,47,35,35,40,50,35,2,3,3,47,35],     //b
    [50,6,18,18,40,50,3,47,35,35,13,3,13,18,6,6,3,13],   //c
    [46,54,43,43,35,46,46,13,3,3,47,46,3,6,18,18,13,3,18,51,50,50,6,18], //d
    [47,3,13,13,35,47,13,3,6,6,18,13,18,40,50,50,6,18,50,49,37,37,40,50,37,4,5,5,49,37], //e
    [13,20,32,32,24,13,32,43,53,53,20,32,53,52,42,7,40,39,39,6,7,42,41,52], //f
    [18,13,3,3,6,18,18,40,50,50,6,18,3,47,46,46,13,3,50,45,33,33,40,50,33,11,1,1,45,33], //g
    [2,10,21,13,2,21,7,40,50,50,6,7,50,46,35,35,40,50], //h
    [13,17,28,13,24,28,19,18,29,29,30,19], //i
    [2,1,11,11,13,2,1,34,22,22,11,1,34,39,28,28,22,34,30,29,40,40,41,30], //j
    [2,10,21,21,13,2,46,35,5,5,16,46,30,5,16,16,41,30], //k
    [10,3,13,13,21,10,14,24,13,14,25,24], //l
    [2,7,18,18,13,2,40,35,46,46,51,40,40,28,39,18,28,17,17,27,39], //m
    [2,6,18,18,13,2,40,35,46,46,51,40,18,51,50,50,6,18], //n
    [3,6,18,18,13,3,18,40,50,50,6,18,3,47,35,35,13,3,47,50,40,40,35,47], //o
    [0,6,18,18,11,0,18,40,50,50,6,18,3,47,35,35,3,2,47,50,40,40,35,47], //p
    [3,6,18,18,13,3,18,40,50,50,6,18,3,47,35,35,13,3,44,50,40,40,33,44], //q
    [13,18,7,7,2,13,6,29,28,28,5,6,29,40,39,39,28,29,40,50,49,49,38,40], //r
    [47,48,38,38,35,47,38,5,15,15,48,38,4,24,13,13,3,4,3,47,35,35,13,3,5,6,18,18,15,5,18,40,50,50,6,18,50,49,29], //s
    [24,14,21,21,32,24,14,36,35,35,24,14,7,40,39,39,6,7], //t
    [7,18,13,13,3,7,3,47,46,46,13,3,35,40,51,51,46,35], //u
    [18,35,24,24,7,18,35,51,40,40,24,35], //v
    [7,2,13,13,18,7,40,35,46,46,51,40,14,27,36,13,25,14,25,35,36], //w
    [46,18,7,7,35,46,13,51,40,40,2,13], //x
    [7,3,13,13,18,7,51,45,33,33,40,51,3,47,46,46,13,3,33,11,1,1,45,33], //y
    [7,51,50,50,6,7,3,47,46,46,2,3,3,39,50,50,14,3], //z         //122

    //Spectials 123-126
    [25,36,35,35,24,25,24,14,16,16,27,24,32,43,42,42,31,32,32,20,18,18,29,32,16,6,18,27,17,16,17,29,18],    // {
    [1,10,21,21,12,1],                                                                                      // |
    [2,3,13,13,14,3,13,25,27,27,16,13,10,21,20,20,9,10,21,31,29,29,18,21,29,39,27,16,28,27,18,28,29],       // }
    [17,5,6,6,18,28,28,40,39,17,27,39], //~

    null, null, null, //127-129
    null, null, null, null, null, null, null, null, null, null, //130-139
    null, null, null, null, null, null, null, null, null, null, //140-149
    null, null, null, null, null, null, null, null, null, null, //150-159
    null, null, null, null, null, null, null, null, null, null, //160-169
    null, null, null, null, null, null, //170-175
    [9,21,32,32,42,9,21,18,8,8,9,21,8,41,29,29,18,8,29,32,42,42,41,29],  //176 - Degree Symbol
    null, null, null, //177-179 
    null, null, null, null, null, null, null, null, null, null, //180-189
    null, null, null, null, null, null, null, null, null, null, //190-199
    null, null, null, null, null, null, null, null, null, null, //200-209
    null, null, null, null, null, null, null, null, null, null, //210-219
    null, null, null, null, null, null, null, null, null, null, //220-229
    null, null, null, null, null, null, null, null, null, null, //230-239
    null, null, null, null, null, null, null, null,  //240-247
    [9,21,32,32,42,9,21,18,8,8,9,21,8,41,29,29,18,8,29,32,42,42,41,29], // Degree Symbol - 248
    null, //249
    null, null, null, null, null, null, null, null, null, null, //250-259
    //
];

const asciiWidths = [
    0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.1, 0.4, 0.4, 0.4, 0.4, 0.4, 0.2, 0.2, 0.2, 0.2, 0.3, 0.2, 0.3, 0.1, 0.4, 0.4, 0.3, 0.4,
    0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.1, 0.1, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.3, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.2, 0.3, 0.2, 0.2, 0.4, 0.2, 0.4, 0.4, 0.4, 0.4, 0.4,
    0.4, 0.4, 0.4, 0.2, 0.3, 0.4, 0.2, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.3, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.3, 0.1, 0.3, 0.3, 0.4,

    0.4,0.4,//128,129
    0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4, //130-169
    0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4, //170-209
    0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4, //210-247
    0.3,
    0.4,//249
    0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,0.4,//250-259

];

function computeAsciiWidths_ONLY_NEEDED_ONCE() {
    var widths = [];
    for (var i=0; i<asciiIndices.length; i++)
    {
        var maxInd = 0;
        var width = 0;

        if (asciiIndices[i] == null || asciiIndices[i].length == 0)
        {
            width = 4;
        } else {
            for (var j=0; j<asciiIndices[i].length; j++)
            {
                if (asciiIndices[i][j] > maxInd)
                {
                    maxInd = asciiIndices[i][j];
                }
            }

            if (maxInd < 11) {
                width = 1;
            } else if (maxInd < 22) {
                width = 1;
            } else if (maxInd < 33) {
                width = 2;
            } else if (maxInd < 44) {
                width = 3;
            } else {
                width = 4;
            }
        }

        if (widths.length > 50)
        {
            console.log(widths);
            widths = [];
        }
        widths.push(width/10);
    }

    console.log(widths);
}





/*
var vertices = [0,0,0,0,0.1,0,0,0.2,0,0,0.3,0,0,0.4,0,0,0.5,0,0,0.6,0,0,0.7,0,0.1,0,0,0.1,0.1,0,0.1,0.2,0,0.1,0.3,0,0.1,0.4,0,0.1,0.5,0,0.1,0.6,0,0.1,0.7,0,0.2,0,0,0.2,0.1,0,0.2,0.2,0,0.2,0.3,0,0.2,0.4,0,0.2,0.5,0,0.2,0.6,0,0.2,0.7,0,0.3,0,0,0.3,0.1,0,0.3,0.2,0,0.3,0.3,0,0.3,0.4,0,0.3,0.5,0,0.3,0.6,0,0.3,0.7,0,0.4,0,0,0.4,0.1,0,0.4,0.2,0,0.4,0.3,0,0.4,0.4,0,0.4,0.5,0,0.4,0.6,0,0.4,0.7,0];
        
var i0 = [1,33,24,24,8,1,6,15,31,31,38,6,6,1,8,8,15,6,31,24,33,33,38,31];
var i1 = [1,33,32,0,1,32,23,31,24,24,16,23,14,23,30,30,13,14];
var i2 = [33,32,0,0,1,33,1,29,37,37,0,1,37,31,23,23,29,37,31,30,14,14,15,31,5,15,23,23,13,5];
var i3 = [6,15,31,31,38,6,1,33,24,24,8,1,33,34,27,27,25,33,38,36,27,27,31,38,28,19,26,6,5,13,13,14,6,2,10,9,9,1,2];
var i4 = [7,3,11,11,15,7,31,24,32,32,39,31,4,36,35,35,3,4];
var i5 = [7,39,38,38,6,7,7,3,11,11,15,7,4,28,35,35,3,4,35,33,24,24,28,35,24,8,1,1,33,24,2,10,9,9,1,2];
var i6 = [1,33,24,24,8,1,1,3,12,12,8,1,12,28,35,35,3,12,35,33,24,24,28,35,3,23,31,31,11,3];
var i7 = [7,39,38,38,6,7,38,16,8,8,30,38];    
var i8 = [6,15,31,31,38,6,1,33,24,24,8,1,12,28,27,11,12,27,6,4,11,11,15,6,31,27,36,36,38,31,33,35,28,28,24,33,8,12,3,3,1,8];
var i9 = [6,15,31,31,38,6,6,4,11,11,15,6,31,27,36,36,38,31,4,36,27,27,11,4,36,16,8,8,28,36];
*/

/*
const numberIndices_OLD = [
    [1,33,24,24,8,1,6,15,31,31,38,6,6,1,8,8,15,6,31,24,33,33,38,31],
    [1,33,32,0,1,32,23,31,24,24,16,23,14,23,30,30,13,14],
    [33,32,0,0,1,33,1,29,37,37,0,1,37,31,23,23,29,37,31,30,14,14,15,31,5,15,23,23,13,5],
    [6,15,31,31,38,6,1,33,24,24,8,1,33,34,27,27,25,33,38,36,27,27,31,38,28,19,26,6,5,13,13,14,6,2,10,9,9,1,2],
    [7,3,11,11,15,7,31,24,32,32,39,31,4,36,35,35,3,4],
    [7,39,38,38,6,7,7,3,11,11,15,7,4,28,35,35,3,4,35,33,24,24,28,35,24,8,1,1,33,24,2,10,9,9,1,2],
    [1,33,24,24,8,1,1,3,12,12,8,1,12,28,35,35,3,12,35,33,24,24,28,35,3,23,31,31,11,3],
    [7,39,38,38,6,7,38,16,8,8,30,38],
    [6,15,31,31,38,6,1,33,24,24,8,1,12,28,27,11,12,27,6,4,11,11,15,6,31,27,36,36,38,31,33,35,28,28,24,33,8,12,3,3,1,8],
    [6,15,31,31,38,6,6,4,11,11,15,6,31,27,36,36,38,31,4,36,27,27,11,4,36,16,8,8,28,36]
]

const numberVertices_OLD = [
    0,0,0,0,0.1,0,0,0.2,0,0,0.3,0,0,0.4,0,0,0.5,0,0,0.6,0,0,0.7,0,0.1,0,0,0.1,0.1,0,0.1,
    0.2,0,0.1,0.3,0,0.1,0.4,0,0.1,0.5,0,0.1,0.6,0,0.1,0.7,0,0.2,0,0,0.2,0.1,0,0.2,0.2,0,
    0.2,0.3,0,0.2,0.4,0,0.2,0.5,0,0.2,0.6,0,0.2,0.7,0,0.3,0,0,0.3,0.1,0,0.3,0.2,0,0.3,0.3,
    0,0.3,0.4,0,0.3,0.5,0,0.3,0.6,0,0.3,0.7,0,0.4,0,0,0.4,0.1,0,0.4,0.2,0,0.4,0.3,0,0.4,0.4,
    0,0.4,0.5,0,0.4,0.6,0,0.4,0.7,0
];*/


/*

const uppercaseLetterIndices = [
    [2,32,13,13,30,32,32,46,35,35,30,32,16,38,37,37,15,16], // A
    [10,2,13,13,21,10,10,43,53,53,9,10,53,51,39,39,43,53,39,49,47,47,35,39,35,2,3,3,47,35,7,40,39,39,6,7], //B
    [9,21,43,43,53,9,53,52,41,41,43,53,21,13,3,3,9,21,3,47,35,35,13,3,47,48,37,37,35,47], // C
    [10,2,13,13,21,10,52,47,35,35,2,3,3,47,35,41,52,35,10,32,42,42,9,10,42,52,41,41,31,42], //D
    [54,10,9,9,53,54,10,2,13,13,21,10,3,47,46,46,2,3,6,39,38,38,5,6], //E
    [2,10,21,21,13,2,10,54,53,53,9,10,6,39,38,38,5,6], //F
    [52,41,42,52,53,42,53,43,21,9,21,53,9,3,13,13,20,9,3,47,35,35,13,3,27,49,48,48,26,27,37,35,46,46,48,37], //G
    [10,21,13,13,2,10,6,50,49,49,5,6,43,35,46,46,54,43], //H
    [21,13,24,24,32,21,10,43,42,42,9,10,3,36,35,35,2,3], //I
    [10,54,53,53,9,10,43,36,24,24,32,43,24,13,3,3,36,24,3,4,15,15,13,3], //J
    [10,2,13,13,21,10,38,35,46,38,48,46,48,8,7,7,47,48,43,41,53,53,54,43,53,5,6,6,54,53], // K
    [10,2,13,13,21,10,3,47,46,46,2,3], //L
    [2,10,21,21,13,2,35,43,54,54,46,35,21,29,18,29,43,40,18,27,40], //M
    [13,21,10,10,2,13,54,46,35,35,43,54,21,46,35,35,10,21], //N
    [3,13,35,35,47,3,3,9,21,21,13,3,21,43,53,53,9,21,53,47,35,35,43,53], //O
    [10,2,13,13,21,10,10,43,53,53,9,10,53,51,39,39,43,53,39,6,7,7,51,39], //p
    [24,48,37,37,13,24,3,36,24,24,13,3,3,9,21,21,13,3,21,43,53,53,9,21,53,48,37,37,43,53,27,47,46,46,26,27], //Q
    [10,2,13,13,21,10,10,43,53,53,9,10,53,51,39,39,43,53,39,6,7,7,51,39,39,49,46,46,35,39,28,38,39], //R
    [53,43,21,53,9,21,3,13,35,35,47,3,9,7,17,17,21,9,47,49,39,39,35,47,38,17,18,18,39,38,14,4,3,42,52,53], //S
    [10,43,42,42,9,10,21,13,24,24,32,21], //T
    [10,3,13,13,21,10,13,46,47,47,3,13,46,54,43,43,35,46], //U
    [10,24,35,35,21,10,24,43,54,54,35,24], //V
    [10,2,13,13,21,10,43,35,46,46,54,43,13,26,15,26,35,37,15,28,37], //W
    [21,46,35,35,10,21,43,2,13,13,54,43], //X
    [24,28,39,39,35,24,28,10,21,21,39,28,39,54,43,43,28,39], //Y
    [10,54,53,53,9,10,53,14,3,3,42,53,3,2,46,46,47,3], //Z
];

const letterIndices = [
    [46,50,40,40,35,46,35,13,3,3,47,35,40,18,6,6,50,40,3,4,16,16,13,3,16,49,48,48,4,16], //a
    [10,2,13,13,21,10,6,39,49,49,5,6,3,47,35,35,2,3,47,49,39,39,35,47],     //b
    [5,17,39,39,49,5,3,47,35,35,13,3,3,5,17,17,13,3],   //c
    [43,54,46,46,35,43,46,13,3,3,47,46,3,5,17,17,13,3,17,50,49,49,5,17], //d
    [47,3,13,13,35,47,13,3,6,6,18,13,18,40,50,50,6,18,50,49,37,37,40,50,37,4,5,5,49,37], //e
    [24,13,19,19,31,24,19,43,54,54,18,19,6,39,38,38,5,6,31,53,54], //f
    [3,13,35,35,47,3,3,5,17,17,13,3,17,39,49,49,5,17,49,45,33,33,39,49,33,11,1,1,45,33], //g
    [10,2,13,13,21,10,6,39,49,49,5,6,49,46,35,35,39,49], //h
    [13,17,28,13,24,28,19,18,29,29,30,19], //i
    [2,1,11,11,13,2,1,34,22,22,11,1,34,39,28,28,22,34,30,29,40,40,41,30], //j
    [2,10,21,21,13,2,46,35,5,5,16,46,30,5,16,16,41,30], //k
    [10,3,13,13,21,10,14,24,13,14,25,24], //l
    [2,5,17,17,13,2,46,49,39,39,35,46,26,5,17,26,49,39,5,49,25], //m
    [2,5,17,17,13,2,17,50,49,49,5,17,50,46,35,35,39,50], //n
    [13,3,5,5,17,13,5,17,39,39,49,5,39,49,47,47,35,39,47,35,13,13,3,47], //o
    [11,0,5,5,17,11,17,39,49,49,5,17,49,47,35,35,39,49,35,2,3,3,47,35], //p
    [44,33,39,39,49,44,39,17,5,5,49,39,5,3,13,13,17,5,3,13,35,35,47,3], //q
    [13,18,7,7,2,13,6,29,28,28,5,6,29,40,39,39,28,29,40,50,49,49,38,40], //r
    [47,48,38,38,35,47,38,5,15,15,48,38,4,24,13,13,3,4,3,47,35,35,13,3,5,6,18,18,15,5,18,40,50,50,6,18,50,49,29], //s
    [24,14,21,21,32,24,14,36,35,35,24,14,7,40,39,39,6,7], //t
    [6,17,13,13,3,6,3,47,46,46,13,3,39,50,46,46,35,39], //u
    [6,17,25,6,24,25,25,39,50,50,24,25], //v
    [6,3,13,13,17,6,39,35,47,47,50,39,14,27,36,13,25,3,25,35,47], //w
    [17,46,35,35,6,17,13,50,39,39,2,13], //x
    [6,3,13,13,17,6,3,47,46,46,13,3,50,45,33,33,39,50,33,11,1,1,45,33], //y
    [6,50,49,49,5,6,3,47,46,46,2,3,3,50,49,49,2,3], //z
];


const numberIndices = [
    [13,3,9,9,21,13,21,43,53,53,9,21,53,47,35,35,43,53,47,3,13,13,35,47], //0
    [8,9,21,21,32,8,32,24,13,13,21,32,3,36,35,35,2,3], //1
    [46,2,3,3,47,46,3,52,51,51,2,3,51,53,43,43,39,51,43,21,9,9,53,43,21,9,8,8,19,21], //2
    [4,15,13,13,3,4,3,47,35,35,13,3,8,9,21,21,19,8,9,21,43,43,53,9,53,51,39,39,43,53,47,49,39,39,35,47,40,28,38], //3
    [10,6,17,17,21,10,43,35,46,46,54,43,50,6,7,7,51,50], //4
    [9,53,54,54,10,9,10,6,17,17,21,10,7,40,50,50,6,7,50,47,35,35,40,50,35,13,3,3,47,35,3,4,15,15,13,3],//5
    [3,47,35,35,13,3,3,6,18,18,40,50,50,6,18,18,13,3,50,47,35,35,40,50,17,43,32,32,6,17], //6
    [10,54,53,53,9,10,53,24,13,13,42,53],//7
    [9,21,43,43,53,9,9,7,17,17,21,9,7,51,39,39,17,7,39,43,53,53,51,39,18,6,3,3,13,18,40,50,47,47,35,40,3,47,35,35,13,3],//8
    [17,7,9,9,21,17,21,43,53,53,9,21,53,51,39,39,43,53,39,17,7,7,51,39,51,24,13,13,40,51], //9
];

const special_91_96 = [
    [31,32,10,10,9,31,10,1,12,12,21,10,2,24,23,23,1,2], // [
    [10,21,34,34,23,10], // \
    [10,32,31,31,9,10,32,23,12,12,21,32,2,24,23,23,1,2], // ]
    [9,8,21,21,20,8,20,30,31,31,21,20], // ^
    [10,19,30,30,21,10], // `
];

const spectial_123_126 = [
    [25,36,35,35,24,25,24,14,16,16,27,24,32,43,42,42,31,32,32,20,18,18,29,32,16,6,18,27,17,16,17,29,18], //{
    [1,10,21,21,12,1],                                                                                  // |
    [2,3,13,13,14,3,13,25,27,27,16,13,10,21,20,20,9,10,21,31,29,29,18,21,29,39,27,16,28,27,18,28,29], //}
    [17,5,6,6,18,28,28,40,39,17,27,39],  //~
    [2,46,45,45,1,2], // _

];
*/


/*
const a_vertices = [0,0,0,  2,10,0,  3,10,0,  1,0,0,    4,0,0, 2,10,0, 3,10,0, 5,0,0,    1,5,0, 4,5,0, 4,4,0, 1,4,0 ];
const a_indices = [0,1,2, 0,2,3,  4,5,6,  4,6,7,  8,9,10, 8,10,11];


function GenerateTextures() {

    const canvas = document.createElement("canvas");
    canvas.setAttribute('id', 'tempCanvas');
    //document.getElementById("background").appendChild(canvas);
    const p = new Painter(canvas);

    var textSize = 45;

    canvas.width = textSize;
    canvas.height = textSize*255;
    p.Clear();
    p.SetTextSize(textSize-1);
    p.SetTextColor('white');

    var totalHeight = 0;
    for(var i=0; i<255; i++)
    {
        var s = String.fromCharCode(i);
        totalHeight += textSize;
        p.DrawText(0,totalHeight,s);
    }

    var i = 55;
    p.DrawLine(0, textSize*(i-1)+4, 10, textSize*(i-1)+4, 'blue');
    p.DrawLine(0, textSize*i+4, 10, textSize*i+4, 'red');
    textSize

    textureImageData = canvas.getContext('2d').getImageData(0,0,canvas.width, canvas.height);

    console.log(textureImageData);

}
var textureImageData = null;

GenerateTextures();

*/


/*

class Text_OLD {
    constructor(pos = new vec4(0,-300,0), rot = new vec4())
    {
        this.position = pos;
        this.rotation = rot;
        
        this.translationMatrix = null;
        this.rotationMatrix = null;
        this.objectMat = null;
        this.buffers = null;

        this.vertices = [0,500,0,  2,500,0,  2,0,0, 0,0,0 ];
        this.indices = [0,1,2, 0,2,3];
        this.textureCoords = [0,0, 1,0, 1,1, 0,1,];

        this.refresh();
    }

    setPosition(position)
    {
        if (position instanceof vec4)
        {
            this.position = position;
            this.translationMatrix.makeTranslation(this.position);
            this.objectMat = this.translationMatrix.mul(this.rotationMatrix);
        } else {
            console.error("Body.setPosition() takes a vec4. Not whatever the hell you just passed it.");
        }
    }
    setRotation(rotation)
    {
        if (rotation instanceof vec4)
        {
            this.rotation = rotation;
            this.rotationMatrix.makeTranslation(this.rotation);
            this.objectMat = this.translationMatrix.mul(this.rotationMatrix);
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
    refresh()
    {   //refreshes all matrices and buffers
        this.translationMatrix = new mat4().makeTranslation(this.position);
        this.rotationMatrix = new mat4().makeRotation(this.rotation);
        this.objectMat = this.translationMatrix.mul(this.rotationMatrix);
        this.buffers = initBuffersTexture(this.vertices, this.textureCoords, this.indices, textureImageData);
    }

    draw(gl, projectionMatrix, viewMatrix)
    {
        DrawText(gl, projectionMatrix, viewMatrix, this.objectMat, this.indices, this.buffers, this.color);
    }

}

*/