








let reflectiveShaderProgram;
let reflectiveProgramInfo;

const glCanvasElement_reflective = document.getElementById('glCanvas_reflective');
var gl_reflective;
var FOV = (Math.PI/180.0) * 1;
let bb = glCanvasElement_reflective.getBoundingClientRect();
glCanvasElement_reflective.width = bb.width;
glCanvasElement_reflective.height = bb.height
var aspect = bb.width/bb.height;
var zNear = 10;
var zFar = 100;
var perspectiveProjectionMatrix = new mat4().makePerspective(FOV, aspect, zNear, zFar);
var viewMatrix = (new mat4().makeRotation(0,0,0)).mul( new mat4().makeTranslation(0,0,-15) );
var tick = 0;


const cube_vertices = [
    -1,1,1, 1,1,1, 1,-1,1, -1,-1,1, //front
    -1,1,-1, -1,-1,-1, 1,-1,-1, 1,1,-1, //back
    -1,1,1, -1,1,-1, 1,1,-1, 1,1,1, //top
    -1,1,1, -1,-1,1, -1,-1,-1, -1,1,-1, //left
    1,1,1, 1,1,-1, 1,-1,-1, 1,-1,1, //right
    -1,-1,1, 1,-1,1, 1,-1,-1, -1,-1,-1, //bottom
];
const cube_indices = [
    0,2,1, 0,3,2, //front
    4,6,5, 4,7,6, //back
    8,10,9, 8,11,10, //top
    12,14,13, 12,15,14, //left
    16,18,17, 16,19,18, //right
    20,22,21, 20,23,22, //bottom
];
const cube_normals = [
    /*0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1, //front
    0,0,1, 0,0,1, 0,0,1, 0,0,1,  //back
    0,1,0, 0,1,0, 0,1,0, 0,1,0, //top
    -1,0,0, -1,0,0, -1,0,0, -1,0,0, //left
    1,0,0, 1,0,0, 1,0,0, 1,0,0, //right
    0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0, //bottom*/

    0,0,1, 0,0,1, 0,0,1, 0,0,1,
    0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
    0,1,0, 0,1,0, 0,1,0, 0,1,0,
    -1,0,0, -1,0,0, -1,0,0, -1,0,0, //left
    1,0,0, 1,0,0, 1,0,0, 1,0,0, //right
    0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0, //bottom

];
const cube_colors = [
    1,0,0,1, 1,0,0,1, 1,0,0,1, 1,0,0,1,
    0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1,
    0,0,1,1, 0,0,1,1, 0,0,1,1, 0,0,1,1,
    1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1,
    1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1,
    0,1,1,1, 0,1,1,1, 0,1,1,1, 0,1,1,1
];








//BUFFERS//////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
function initBuffers(gl, vertices, normals, colors, indices) {
    const verticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const normalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    const colorsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    const indicesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return {
        vertices: verticesBuffer,
        normals: normalsBuffer,
        colors: colorsBuffer,
        indices: indicesBuffer,
    };
}

// creates a shader of the given type, uploads the source and compiles it.
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function initReflectiveShaderProgram(gl, includeBlueAmbientSource = true, includeRedAmbientSource = true, includeBlueReflectiveSource = true, includeRedReflectiveSource = true) {
    const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aNormalVector;
    attribute vec4 aColor;

    uniform mat4 uProjectionMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uObjectPositionMatrix;
    uniform mat4 uObjectRotationMatrix;
    uniform vec4 uObjectScaleVector;

    varying highp vec4 color;
    varying highp vec4 normal;
    varying highp vec4 pos;

    void main() {
        vec4 vPos = uObjectScaleVector * vec4(aVertexPosition.x, aVertexPosition.y, aVertexPosition.z, 1.0);
        gl_Position = uProjectionMatrix * uViewMatrix * uObjectPositionMatrix * uObjectRotationMatrix * vPos;
        normal = uObjectRotationMatrix * aNormalVector;
        //float c = dot(uObjectRotationMatrix*normal, vec4(0.4, 0.4, 0.9, 0) );
        color = aColor;// * c;
        pos = uProjectionMatrix * uViewMatrix * uObjectRotationMatrix * vPos;
    }
    `;
    const fsSource = `
    precision highp float;

    varying vec4 color;
    varying vec4 normal;
    varying vec4 pos;


    float distToSphere(vec3 rayD, vec3 rayP, vec3 sC, float sR)
    {
        float a = rayD.x*rayD.x + rayD.y*rayD.y + rayD.z*rayD.z;
        float b = 2.0 * (rayD.x * (rayP.x - sC.x) + rayD.y * (rayP.y - sC.y) + rayD.z * (rayP.z - sC.z));
        float c = (rayP.x-sC.x)*(rayP.x-sC.x) + (rayP.y-sC.y)*(rayP.y-sC.y) + (rayP.z-sC.z)*(rayP.z-sC.z) - sR*sR;
        float top = b*b - 4.0*a*c;

        if (top >= 0.0)
        {
            float t1 = (-b-top)/(2.0*a);
            float t2 = (-b+top)/(2.0*a);

            float t = (t1 - t2)/sR;

            if (t < 0.0)
            {
                return -t;
            }
            return t;

            if (t1 > 0.1 && (t1 < t2 || t2 < 0.1))
            {
                return t1;
            } else if (t2 > 0.1 && (t2 < t1 || t1 < 0.1))
            {
                return t2;
            }
        }
        return 1000000.0;
    }


    vec3 unit(vec3 r)
    {
        float mag = sqrt(r.x*r.x + r.y*r.y + r.z*r.z);
        r.x = r.x/mag;
        r.y = r.y/mag;
        r.z = r.z/mag;
        return r;
    }


    void main() {

        gl_FragColor = vec4(0,0,0,1); 
        float c = 0.0;
        float ret = 0.0;`;
        
    
    const redAmbientSource = `
        c = dot(normal, vec4(0.4, 0.85, 0.4, 0) );
        if (c < 0.1) {c = 0.1;}
        gl_FragColor += color*vec4(c, c/2.0, 0, 0); `;
    const redReflectiveSource = `
        ret = distToSphere(unit(normal.xyz), pos.xyz, vec3(70,50,100), 20.0);
        if (ret > 0.0 && ret < 10000.0)
        {
            gl_FragColor += vec4(ret/50.0, ret/100.0, 0, 0);
        }`;
    const blueAmbientSource = `
        c = dot(normal, vec4(-0.4, 0.85, 0.4, 0) );
        if (c < 0.1) {c = 0.1;}
        gl_FragColor += color*vec4(0, c/2.0, c, 0);`;
    const blueReflectiveSource = `
        ret = distToSphere(unit(normal.xyz), pos.xyz, vec3(-70,50,100), 20.0);
        if (ret > 0.0 && ret < 10000.0)
        {
            gl_FragColor += vec4(0, ret/100.0, ret/50.0, 0);
        }`;
    const fsSourceEnd = `}`;
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);

    var fsShaderComplete = fsSource;
    if (includeBlueAmbientSource) { fsShaderComplete += blueAmbientSource; }
    if (includeRedAmbientSource) { fsShaderComplete += redAmbientSource; }
    if (includeBlueReflectiveSource) { fsShaderComplete += blueReflectiveSource; }
    if (includeRedReflectiveSource) { fsShaderComplete += redReflectiveSource; }
    fsShaderComplete +=fsSourceEnd;

    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsShaderComplete);

    // Create the shader program
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }


    const programInfo = {
        program: shaderProgram,
        attribLocations: {
          vertexLocation: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
          normalLocation: gl.getAttribLocation(shaderProgram, 'aNormalVector'),
          colorLocation: gl.getAttribLocation(shaderProgram, 'aColor'),
        },
        uniformLocations: {
          projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
          viewMatrix: gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
          objectPositionMatrix: gl.getUniformLocation(shaderProgram, 'uObjectPositionMatrix'),
          objectRotationMatrix: gl.getUniformLocation(shaderProgram, 'uObjectRotationMatrix'),
          objectScaleVector: gl.getUniformLocation(shaderProgram, 'uObjectScaleVector'),
        },
    };


    return [shaderProgram, programInfo]
}

//Render & Drawing //////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//Used for rendering tringles or lines
function drawReflective(gl, projectionMatrix, viewMatrix, objectPositionMatrix, objectRotationMatrix, objectScaleVector, indices, buffers, drawTriangles = true)
{
    var programInfo = reflectiveProgramInfo;

    // Tell WebGL to use our program when drawing
    gl.useProgram(programInfo.program);
    {
        const numComponents = 3  // pull out 3 values per iteration
        const type = gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 0;         // how many bytes to get from one set of values to the next
        const offset = 0;         // how many bytes inside the buffer to start from

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertices);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexLocation, numComponents, type, normalize, stride, offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexLocation);
    }
    {
        const numComponents = 3  // pull out 3 values per iteration
        const type = gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 0;         // how many bytes to get from one set of values to the next
        const offset = 0;         // how many bytes inside the buffer to start from

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normals);
        gl.vertexAttribPointer(programInfo.attribLocations.normalLocation, numComponents, type, normalize, stride, offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.normalLocation);
    }
    {
        const numComponents = 4;  // pull out 4 values per iteration
        const type = gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 0;         // how many bytes to get from one set of values to the next
        const offset = 0;         // how many bytes inside the buffer to start from

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colors);
        gl.vertexAttribPointer(programInfo.attribLocations.colorLocation, numComponents, type, normalize, stride, offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.colorLocation);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    // Set the shader uniforms
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix,  false, projectionMatrix.getFloat32Array());
    gl.uniformMatrix4fv(programInfo.uniformLocations.viewMatrix, false, viewMatrix.getFloat32Array());
    gl.uniformMatrix4fv(programInfo.uniformLocations.objectPositionMatrix, false, objectPositionMatrix.getFloat32Array());
    gl.uniformMatrix4fv(programInfo.uniformLocations.objectRotationMatrix, false, objectRotationMatrix.getFloat32Array());
    gl.uniform4fv(programInfo.uniformLocations.objectScaleVector, objectScaleVector.getFloat32Array());

    const vertexCount = indices.length;
    if (drawTriangles == true)
    {
        gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, 0);
    } else {
        gl.drawElements(gl.LINES, vertexCount, gl.UNSIGNED_SHORT, 0);
    }
}







class Object {
    constructor(position = new vec4(), rotation = new vec4(), scale = new vec4(1,1,1,1)) {
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
        this.translationMatrix = new mat4().makeTranslation(this.position.x, this.position.y, this.position.z);
        this.rotationMatrix = new mat4().makeRotation(this.rotation.x, this.rotation.y, this.rotation.z);

        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.colors = [];
        this.buffers = initBuffers(gl_reflective, this.vertices, this.normals, this.colors, this.indices);
    }

    setPosition(position = new vec4())
    {
        this.position = position;
        this.translationMatrix.makeTranslation(this.position.x, this.position.y, this.position.z);
    }
    setRotation(rotation = new vec4())
    {
        this.rotation = rotation;
        this.rotationMatrix.makeRotation(this.rotation.x, this.rotation.y, this.rotation.z);
    }
    setScale(scale = new vec4(1,1,1,1))
    {
        this.scale = scale;
    }
    setColor(color = new vec4(), variation = 0.0)
    {
        for (var i=0; i<this.colors.length; i+=4)
        {
            colors[i] = color.x + Math.random() * variation;
            colors[i+1] = color.x + Math.random() * variation;
            colors[i+2] = color.x + Math.random() * variation;
            colors[i+3] = 1;
        }
        this.buffers = initBuffers(this.vertices, this.normals, this.colors, this.indices);
    }
    draw(gl, projectionMatrix, viewMatrix)
    {
        drawReflective(gl, projectionMatrix, viewMatrix, 
            this.translationMatrix, 
            this.rotationMatrix,
            this.scale,
            this.indices, this.buffers, true );
    }
}
class Cube extends Object {
    constructor(position = new vec4(), rotation = new vec4(), scale = new vec4(1,1,1,1)) {
        super(position, rotation, scale);

        this.vertices = cube_vertices;
        this.indices = cube_indices;
        this.normals = cube_normals;
        this.colors = cube_colors;

        this.buffers = initBuffers(gl_reflective, this.vertices, this.normals, this.colors, this.indices);
    }
}
class Sphere extends Object {
    constructor(position = new vec4(), rotation = new vec4(), scale = new vec4(1,1,1,1), color = new vec4(0,0,1,1), colorMod = 0.05, numSides = 1) {
        super(position, rotation, scale);
        this.numSides = numSides;
        this.color = color;
        this.colorMod = colorMod;
        this.generateMesh();
    }

    generateMesh() {
        let ret = generateSphere(this.numSides, 1, this.color, this.colorMod);
        this.vertices = ret.vertices;
        this.indices = ret.indices;
        this.normals = ret.normals;
        this.colors = ret.colors;
        this.buffers = initBuffers(gl_reflective, this.vertices, this.normals, this.colors, this.indices);
    }
}

setup_reflective();


var objects = [
    new Cube(new vec4(-4,1.1), new vec4(), new vec4(0.5,0.5,0.5,1)),
    new Cube(new vec4(-4,-1.1), new vec4(), new vec4(0.5,0.5,0.5,1)),
    new Sphere(new vec4( -1.4,1.1,0,0), new vec4(), new vec4(1,1,1,1), new vec4(0.7,0.2,0.2,1), 0.2, 0),
    new Sphere(new vec4( -1.4,-1.1,0,0), new vec4(), new vec4(1,1,1,1), new vec4(0.7,0.2,0.2,1), 0.2, 1),
    new Sphere(new vec4( 1.4,1.1,0,0), new vec4(), new vec4(1,1,1,1), new vec4(0.7,0.2,0.2,1), 0.2, 2),
    new Sphere(new vec4( 4,1.1,0,0), new vec4(), new vec4(1,1,1,1), new vec4(0.2,0.7,0.2,1), 0.2, 3),
    new Sphere(new vec4( 1.4,-1.1,0,0), new vec4(), new vec4(1,1,1,1), new vec4(0.2,0.2,0.7,1), 0.2, 4),
    new Sphere(new vec4( 4,-1.1,0,0), new vec4(), new vec4(1,1,1,1), new vec4(0.7,0.7,0.7,1), 0.2, 5),
];

const updateInterval = setInterval(update_reflective, 50);


function setup_reflective() {
    glCanvasElement_reflective.width = glCanvasElement_reflective.width*2;
    glCanvasElement_reflective.height = glCanvasElement_reflective.height*2;
    gl_reflective = glCanvasElement_reflective.getContext("webgl");
    if (gl_reflective === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    } else {
        console.log("GL defined ")
    }
    [reflectiveShaderProgram, reflectiveProgramInfo] = initReflectiveShaderProgram(gl_reflective);
}


function update_reflective() {
    tick += Number(document.getElementById("reflectiveSpeed").value);
    gl_reflective.clearColor(0.01, 0.01, 0.01, 0);    // Clear to black, fully opaque
    gl_reflective.clearDepth(1);                   // Clear everything
    gl_reflective.enable(gl_reflective.DEPTH_TEST);           // Enable depth testing
    gl_reflective.depthFunc(gl_reflective.LEQUAL);            // Near things obscure far things

    gl_reflective.enable(gl_reflective.CULL_FACE);
    // Clear the canvas before we start drawing on it.
    gl_reflective.clear(gl_reflective.COLOR_BUFFER_BIT | gl_reflective.DEPTH_BUFFER_BIT);

    for (var i=0; i<objects.length; i++){
        objects[i].setRotation(new vec4(tick, tick/(i+1), tick/(i%2 + 1)));
        objects[i].draw(gl_reflective, perspectiveProjectionMatrix, viewMatrix);
    }
}



function inputChange_reflective() {
    if (document.getElementById("includeRedAmbientSourceCheckbox") == null)
    {
        return;
    }

    [reflectiveShaderProgram, reflectiveProgramInfo] = initReflectiveShaderProgram(gl_reflective, 
        document.getElementById("includeBlueAmbientSourceCheckbox").checked, 
        document.getElementById("includeRedAmbientSourceCheckbox").checked,
        document.getElementById("includeBlueReflectiveSourceCheckbox").checked,
        document.getElementById("includeRedReflectiveSourceCheckbox").checked  );
}





function generateSphere(steps = 5, radius = 1, color = new vec4(0,0,1,1), colorMod = 0.1)
{
    //var vertices = [0,-1,0, 1,0,0, 0,0,1, -1,0,0, 0,0,-1, 0,1,0];
    var indices = [0,1,2, 0,2,3, 0,3,4, 0,4,1, 1,5,2, 2,5,3, 3,5,4, 4,5,1];
    var vertices = [
        new vec4(0,-1,0),
        new vec4(1,0,0),
        new vec4(0,0,1),
        new vec4(-1,0,0),
        new vec4(0,0,-1),
        new vec4(0,1,0),
    ];


    var vertDict = new Map();
    for (var i in vertices)
    {
        vertices[i].muli(radius);
        vertDict.set(vertices[i], i);
    }
   
    //Generate sphere mesh
    var zz = new vec4();
    for (var s=0; s<steps; s++)
    {
        var inds = [];

        for( var i=0; i<indices.length; i+=3)
        {
            let v1 = vertices[indices[i]];
            let v2 = vertices[indices[i+1]];
            let v3 = vertices[indices[i+2]];

            let b1 = (v1.add(v2)).muli(0.5);
            b1.muli( radius/distanceBetweenPoints(b1, zz)  );
            let b2 = (v2.add(v3)).muli(0.5);
            b2.muli( radius/distanceBetweenPoints(b2, zz)  );
            let b3 = (v1.add(v3)).muli(0.5);
            b3.muli( radius/distanceBetweenPoints(b3, zz)  );


            let r = vertDict.get(b1);
            if (r != null) {
                b1 = r;
            } else {
                r = vertices.length;
                vertDict.set(b1,r);
                vertices.push(b1);
                b1 = r;
            }

            r = vertDict.get(b2);
            if (r != null) {
                b2 = r;
            } else {
                r = vertices.length;
                vertDict.set(b2,r);
                vertices.push(b2);
                b2 = r;
            }

            r = vertDict.get(b3);
            if (r != null) {
                b3 = r;
            } else {
                r = vertices.length;
                vertDict.set(b3,r);
                vertices.push(b3);
                b3 = r;
            }

            inds.push(indices[i], b1, b3,   b1, indices[i+1], b2,   b3, b2, indices[i+2],  b1,b2,b3);
        }

        indices = inds;
    }

    var v = [];
    var ind = [];
    var n = [];
    var c = [];

    //transform...

    var indOn = 0;
    for(var i=0; i<indices.length; i+=3)
    {

        v.push( vertices[indices[i]].x, vertices[indices[i]].y, vertices[indices[i]].z);
        v.push( vertices[indices[i+1]].x, vertices[indices[i+1]].y, vertices[indices[i+1]].z);
        v.push( vertices[indices[i+2]].x, vertices[indices[i+2]].y, vertices[indices[i+2]].z);


        ind.push(indOn, indOn+1, indOn+2);
        indOn += 3;

        
        //n.push( nx,ny,nz, nx,ny,nz, nx,ny,nz);
        
        var maxMag = Math.max(vertices[indices[i+0]].getLength(), vertices[indices[i+1]].getLength(), vertices[indices[i+2]].getLength())/radius;

        if (maxMag < -1)
        {
            var n1 = vertices[indices[i]].copy().scaleToUnit();
            var n2 = vertices[indices[i+1]].copy().scaleToUnit();
            var n3 = vertices[indices[i+2]].copy().scaleToUnit();
            n.push( n1.x, n1.y, n1.z,  n2.z, n2.y, n2.z, n3.x, n3.y, n3.z);
        } else {
            var a = vertices[indices[i+1]].sub(vertices[indices[i]]);
            var b = vertices[indices[i+2]].sub(vertices[indices[i]]);
            b.scaleToUnit();
            a.scaleToUnit();
            var nx = a.y*b.z - a.z*b.y;
            var ny = a.z*b.x - a.x*b.z;
            var nz = a.x*b.y - a.y*b.x;
            let newN = new vec4(nx,ny,nz).scaleToUnit();
            n.push( newN.x, newN.y, newN.z, newN.x, newN.y, newN.z, newN.x, newN.y, newN.z, );
        }


        let mod = Math.random() * colorMod;
        for (var k=0; k<3; k++){
            c.push(color.x+mod, color.y+mod, color.z+mod, color.a);
        }

    }


    return {
        vertices: v,
        indices: ind,
        normals: n,
        colors: c,
    }
}