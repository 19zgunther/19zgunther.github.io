var defaultShaderProgram;
var defaultProgramInfo;

//BUFFERS//////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
function initBuffers(vertices, normals, colors, indices) {
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

//Init shaders//////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function InitShader(gl)
{
    [defaultShaderProgram, defaultProgramInfo] =  initDefaultShaderProgram(gl);
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

function initDefaultShaderProgram(gl) {
    const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aNormalVector;
    attribute vec4 aColor;

    uniform mat4 uProjectionMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uObjectPositionMatrix;
    uniform mat4 uObjectRotationMatrix;

    varying highp vec4 color;


    void main() {
        vec4 vPos = vec4(aVertexPosition.x, aVertexPosition.y, aVertexPosition.z, 1.0);
        gl_Position = uProjectionMatrix * uViewMatrix * uObjectPositionMatrix * uObjectRotationMatrix * vPos;

        
        float vari = dot(vec4( 0.6, 0.78, 0.2, 0), uObjectRotationMatrix * aNormalVector);
        vari += 0.01;
        vari = vari*vari*vari;
        //vari = vari * (1.0-fract(sin(vPos.x)*49284.38272)/10.0);
        if (vari < 0.3)
        {
            vari = 0.3;
        }
        if (vari > 10.01 && aColor.z > 0.6 && aColor.x < 0.5) {
            color.x = 0.9;
            color.y = 0.7;
            color.z = 0.2;
        } else {
            color.x = aColor.x * vari;
            color.y = aColor.y * vari;
            color.z = aColor.z * vari;
        }
        color.a = 1.0;
    
    }
    `;
    const fsSource = `
    precision mediump float;

    varying vec4 color;


    void main() {
        //gl_FragColor = color + vec4(fract(vertexPos.x/100.0), fract(vertexPos.y/100.0), fract(vertexPos.z/100.0), 1.0)/10.0;
        //gl_FragColor = color + vec4(fract(sin(vertexPos.x*22.5392)), fract(sin(vertexPos.y*3.5392)), fract(sin(vertexPos.z*4.539)), 1.0)/10.0;
        
        float v = 1.0;


        gl_FragColor = vec4(color.x*v, color.y*v, color.z*v, 1.0);
    }
    `;
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

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
        },
    };


    return [shaderProgram, programInfo]
}

//Render & Drawing //////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//Used for rendering tringles or lines
function drawDefault(gl, projectionMatrix, viewMatrix, objectPositionMatrix, objectRotationMatrix, indices, buffers, drawTriangles = true)
{
    var programInfo = defaultProgramInfo;

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

    const vertexCount = indices.length;
    if (drawTriangles == true)
    {
        gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, 0);
    } else {
        gl.drawElements(gl.LINES, vertexCount, gl.UNSIGNED_SHORT, 0);
    }
}





class Cube
{
    constructor(position = new vec4(), rotation = new vec4()){
        this.position = position;
        this.rotation = rotation;
        this.translationMatrix = new mat4().makeTranslation(position.x, position.y, position.z);
        this.rotationMatrix = new mat4().makeRotation(rotation.x, rotation.y, rotation.z);

        this.velocity = new vec4();
        this.angularVelocity = new vec4();

        this.falling = false;
    }
    setPosition(position = new vec4()) {
        this.position = position;
        this.translationMatrix = new mat4().makeTranslation(position.x, position.y, position.z);
    }
    move( change = new vec4() ) {
        this.position.addi(change);
        this.translationMatrix = new mat4().makeTranslation(this.position.x, this.position.y, this.position.z);
    }
    setPosition(rotation = new vec4()) {
        this.rotation = rotation;
        this.rotationMatrix = new mat4().makeRotation(rotation.x, rotation.y, rotation.z);
    }
    update()
    {
        this.position.addi(this.velocity);
        if (this.falling)
        {
            this.velocity.addi(0,-.01,0);
        }
        this.rotation.addi(this.angularVelocity);

        this.translationMatrix = new mat4().makeTranslation(this.position.x, this.position.y, this.position.z);
        this.rotationMatrix = new mat4().makeRotation(this.rotation.x, this.rotation.y, this.rotation.z);

    }

    isPointInside(point = new vec4()) {
        return pointInsideCube(this.position, this.rotationMatrix, point);
    }

    _relPointInside(p)
    {
        return  ( -1<=p.x && p.x<=1 &&
                -1<=p.y && p.y<=1 &&
                -1<=p.z && p.z<=1  );
    }
    isCubeColliding(cubePos = new vec4(), cubeRot = new vec4())
    {
        var relPos = cubePos.sub(this.position);

        if (relPos.getMagnitude() > 4)
        {
            return false;   
        }
    
        var relRotation = cubeRot;
        var rotMat = new mat4().makeRotation(relRotation.x, relRotation.y, relRotation.z);

        var vec = rotMat.mul(new vec4(1,1,1));

        return this._relPointInside( rotMat.mul(new vec4(-1,-1,-1)).addi(relPos) ) ||
        this._relPointInside( rotMat.mul(new vec4(1,1,1)).addi(relPos) ) ||
        this._relPointInside( rotMat.mul(new vec4(-1,1,1)).addi(relPos) ) ||
        this._relPointInside( rotMat.mul(new vec4(1,-1,1)).addi(relPos) ) ||
        this._relPointInside( rotMat.mul(new vec4(1,1,-1)).addi(relPos) ) ||
        this._relPointInside( rotMat.mul(new vec4(-1,-1,1)).addi(relPos) ) ||
        this._relPointInside( rotMat.mul(new vec4(1,-1,-1)).addi(relPos) );
    }
}








const glCanvasElement = document.getElementById('glCanvas');
var gl;
var FOV = (Math.PI/180.0) * 50;
var aspect = 1.0;
var zNear = 2;
var zFar = 50;
var perspectiveProjectionMatrix = new mat4().makePerspective(FOV, aspect, zNear, zFar);
var viewMatrix = (new mat4().makeRotation(0,0,0)).mul( new mat4().makeTranslation(0,0,-6) );
var tick = 0;


var cube1 = new Cube( new vec4(0,-2,0));
var cube2 = new Cube(new vec4(0,3,0), new vec4(.5,.5,.5));
var cubes = [cube1, cube2];

cube2.falling = true;
cube2.angularVelocity = new vec4(.1,0,0);

setup();

const updateInterval = setInterval(update, 80);



function setup() {

    glCanvasElement.width = glCanvasElement.width*2;
    glCanvasElement.height = glCanvasElement.width;

    gl = glCanvasElement.getContext("webgl");
    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    } else {
        console.log("GL defined ")
    }

    InitShader(gl);
}







function update() {
    tick += 0.05;
    gl.clearColor(0.01, 0.01, 0.01, 1);    // Clear to black, fully opaque
    gl.clearDepth(1);                   // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    //gl.enable(gl.CULL_FACE);
    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var buffers = initBuffers(cube_vertices, cube_normals, cube_colors, cube_indices);

    //cube2.move(new vec4(0,-.03,0));

    console.log(   cube1.isCubeColliding(cube2.position, cube2.rotation)   );

    for (var i=0; i<cubes.length; i++)
    {

        cubes[i].update();



        drawDefault(gl, perspectiveProjectionMatrix, viewMatrix, 
            cubes[i].translationMatrix, 
            cubes[i].rotationMatrix,
            cube_indices, buffers, true
            );
    }
}



const cube_vertices = [
    -1,1,1, 1,1,1, 1,-1,1, -1,-1,1, //front
    -1,1,-1, -1,-1,-1, 1,-1,-1, 1,1,-1, //back
    -1,1,1, -1,1,-1, 1,1,-1, 1,1,1, //top
    -1,1,1, -1,-1,1, -1,-1,-1, -1,1,-1, //left
    1,1,1, 1,1,-1, 1,-1,-1, 1,-1,1, //right
    -1,-1,1, 1,-1,1, 1,-1,-1, -1,-1,-1, //bottom
];
const cube_indices = [
    0,1,2, 0,2,3, //front
    4,5,6, 4,6,7, //back
    8,9,10,8,10,11, //top
    12,13,14,12,14,15, //left
    16,17,18, 16,18,19, //right
    20,21,22, 20,22,23, //bottom
];
const cube_normals = [
    0,0,1, 0,0,1, 0,0,1, 0,0,1, //front
    0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,  //back
    0,1,0, 0,1,0, 0,1,0, 0,1,0, //top
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
    0,1,1,1, 0,1,1,1, 0,1,1,1, 0,1,1,1,
];


function pointInsideCube(cubePosition = new vec4(), cubeRotationMat = new mat4().makeRotation(), point = new vec4(), cubeScale = 1)
{
    var rp = cubeRotationMat.mul( point.sub(cubePosition) ); //relative point
    
    if (-cubeScale <= rp.x && rp.x <= cubeScale && 
        -cubeScale <= rp.y && rp.y <= cubeScale && 
        -cubeScale <= rp.z && rp.z <= cubeScale )
    {
        return true;
    }
    return false;
}