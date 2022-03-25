



{



let waterShaderProgram;
let waterProgramInfo;

const glCanvasElement_water = document.getElementById('glCanvas_water');
let gl_water;
let FOV = (Math.PI/180.0) * 1;
let bb = glCanvasElement_water.getBoundingClientRect();
glCanvasElement_water.width = bb.width;
glCanvasElement_water.height = bb.height
let aspect = bb.width/bb.height;
let zNear = 20;
let zFar = 100;
let tick = 0;
let tick1 = 0;
let tick2 = 0;

let objectPositionMatrix = new mat4().makeTranslation();
let objectRotationMatrix = new mat4().makeRotation();
let objectScaleVector = new vec4(1,1,1,1);
let lightSourceVector = new vec4();
let cameraVector = new vec4(0, 10, 25);


let projectionMatrix = new mat4().makePerspective(FOV, aspect, zNear, zFar);
let viewMatrix = (new mat4().makeRotation(0,0,0.4)).mul( new mat4().makeTranslation(-cameraVector.x, -cameraVector.y, -cameraVector.z) );

let meshSize = 30;
let ret = generateMesh(meshSize);



let lightRotationSpeed = 0.04;
let lightRotationTick = 0;
let lightHeight = 50;
let lightRadius = 100;

let waveSpeed = 0.05;
let waveTick = 0;
let waveAmplitude = 0.5;
let waveType = 0;




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

function initWaterShaderProgram(gl) {
    
    const vsSource1 = `
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
        color = aColor;
        pos = uObjectPositionMatrix * uObjectRotationMatrix * vPos;
    }
    `;
    fsShaderComplete = `
    precision highp float;

    varying vec4 color;
    varying vec4 normal;
    varying vec4 pos;

    uniform vec4 uLightSourceVector;
    uniform vec4 uCameraVector;

    vec4 unit(vec4 v)
    {
        float m = sqrt(v.x*v.x + v.y*v.y + v.z*v.z + v.a*v.a);
        v.x = v.x/m;
        v.y = v.y/m;
        v.z = v.z/m;
        v.a = v.a/m;
        return v;
    }

    
    void main() {
        gl_FragColor = vec4(0,0,0,0);
        float v = 0.0;

        //Reflective part
        vec4 LtoF = unit(pos - uLightSourceVector);
        vec4 CtoF = unit(pos - uCameraVector);
        v = dot(LtoF + CtoF, normal);
        gl_FragColor = vec4(1,.8,0,0) * v/5.0;

        //General Illuminance
        vec4 ls = unit(pos - uLightSourceVector);
        v = dot(ls, normal)/10.0 + 1.0;
        gl_FragColor += color * v;
        gl_FragColor.a = 1.0;
    }`;

    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource1);
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
            
            lightSourceVector: gl.getUniformLocation(shaderProgram, 'uLightSourceVector'),
            cameraVector: gl.getUniformLocation(shaderProgram, 'uCameraVector'),
        },
    };


    return [shaderProgram, programInfo]
}



setup();



const updateInterval = setInterval(update, 50);


function setup() {
    glCanvasElement_water.width = glCanvasElement_water.width*2;
    glCanvasElement_water.height = glCanvasElement_water.height*2;
    gl_water = glCanvasElement_water.getContext("webgl");
    if (gl_water == null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    } else {
        console.log("GL defined ")
    }
    [waterShaderProgram, waterProgramInfo] = initWaterShaderProgram(gl_water);

    inputChange_water();
}


function update() {
    // Clear the canvas before we start drawing on it.
    const gl = gl_water;
    gl.clearColor(0.01, 0.01, 0.01, 0.5);    // Clear to black, fully opaque
    gl.clearDepth(1);                   // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
    //gl.enable(gl.CULL_FACE);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    

    //Update Mesh
    tick += 0.01;
    tick1 += 0.04;
    tick2 += 0.08;

    waveTick += waveSpeed;

    for (var z=1; z<meshSize-1; z++)
    {
        for (var x=1; x<meshSize-1; x++)
        {

            if (waveType  < 0.5) {
                ret.vertices[(z*meshSize + x)*3 + 1] = ( Math.sin(waveTick*1.1 + z/2) + Math.cos(waveTick + x/2) + Math.sin(z/2 + x/3+ waveTick) ) *waveAmplitude;
            } else if (waveType < 1.5)
            {
                let r = Math.sqrt(Math.pow(x-meshSize/2,2) + Math.pow(z-meshSize/2,2)+1);
                ret.vertices[(z*meshSize + x)*3 + 1] = ( 5*Math.sin(r - waveTick)/r ) *waveAmplitude;
            } else if (waveType < 2.5)
            {
                let r = Math.sqrt(Math.pow(x-meshSize/2,2) + Math.pow(z-meshSize/2,2)+1);
                ret.vertices[(z*meshSize + x)*3 + 1] = ( 5*Math.sin(r - (2*Math.sin(waveTick/4)*r))/r ) *waveAmplitude;
            } else if (waveType < 3.5)
            {
                ret.vertices[(z*meshSize + x)*3 + 1] = ( Math.sin(waveTick + z + x) ) *waveAmplitude;
            } else if (waveType < 4.5)
            {
                ret.vertices[(z*meshSize + x)*3 + 1] = ( Math.sin(waveTick + z) ) *waveAmplitude;
            } else if (waveType < 5.5)
            {
                ret.vertices[(z*meshSize + x)*3 + 1] = ( Math.sin(waveTick + x) ) *waveAmplitude;
            }

            let n = new vec4(0,1,0);
            n.x = ret.vertices[(z*meshSize + x-1)*3 + 1] - ret.vertices[(z*meshSize + x+1)*3 + 1];
            n.z = ret.vertices[((z-1)*meshSize + x)*3 + 1] - ret.vertices[((z+1)*meshSize + x)*3 + 1];
            n.scaleToUnit();

            ret.normals[ (z*meshSize + x)*3    ] = n.x * 3;
            ret.normals[ (z*meshSize + x)*3 + 1] = n.y;
            ret.normals[ (z*meshSize + x)*3 + 2] = n.z * 3;
        }
    }
    lightRotationTick += lightRotationSpeed
    lightSourceVector = new vec4(lightRadius*Math.sin(lightRotationTick), lightHeight, lightRadius*Math.cos(lightRotationTick));


    
    //recreate buffers
    let buffers = initBuffers(gl, ret.vertices, ret.normals, ret.colors, ret.indices);


    // Tell WebGL to use our program when drawing
    gl.useProgram(waterProgramInfo.program);
    //Bind Vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertices);
    gl.vertexAttribPointer(waterProgramInfo.attribLocations.vertexLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(waterProgramInfo.attribLocations.vertexLocation);
    //Bind normals
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normals);
    gl.vertexAttribPointer(waterProgramInfo.attribLocations.normalLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(waterProgramInfo.attribLocations.normalLocation);
    //Bind Colors
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colors);
    gl.vertexAttribPointer(waterProgramInfo.attribLocations.colorLocation, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(waterProgramInfo.attribLocations.colorLocation);
    //Bind Indices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    // Set the shader uniforms
    gl.uniformMatrix4fv(waterProgramInfo.uniformLocations.projectionMatrix,  false, projectionMatrix.getFloat32Array());
    gl.uniformMatrix4fv(waterProgramInfo.uniformLocations.viewMatrix, false, viewMatrix.getFloat32Array());
    gl.uniformMatrix4fv(waterProgramInfo.uniformLocations.objectPositionMatrix, false, objectPositionMatrix.getFloat32Array());
    gl.uniformMatrix4fv(waterProgramInfo.uniformLocations.objectRotationMatrix, false, objectRotationMatrix.getFloat32Array());
    gl.uniform4fv(waterProgramInfo.uniformLocations.objectScaleVector, objectScaleVector.getFloat32Array());
    gl.uniform4fv(waterProgramInfo.uniformLocations.lightSourceVector, lightSourceVector.getFloat32Array());
    gl.uniform4fv(waterProgramInfo.uniformLocations.cameraVector, cameraVector.getFloat32Array());

    gl.drawElements(gl.TRIANGLES, ret.indices.length, gl.UNSIGNED_SHORT, 0);
}


function inputChange_water() {
    try {
        waveType = Number(document.getElementById('waveTypeInput').value);
        waveAmplitude = Number(document.getElementById('waveAmplitudeInput').value);
        waveSpeed =  Number(document.getElementById('waveSpeedInput').value);
        lightRotationSpeed = Number(document.getElementById('lightRotationSpeedInput').value);
        lightRadius = Math.pow(Number(document.getElementById('lightRadiusInput').value), 2);
        lightHeight = Math.pow(Number(document.getElementById('lightHeightInput').value), 2);        
    } catch {

    }
}



function generateMesh(meshSize = 20) {
    let v = [];
    let i = [];
    let n = [];
    let c = [];
    for (var z=0; z<meshSize; z++)
    {
        for (var x=0; x<meshSize; x++)
        {
            if (x == 0 || z == 0 || x + 1 == meshSize || z + 1 == meshSize)
            {
                v.push( x - meshSize/2 , -10000 , z - meshSize/2 );
            } else {
                v.push( x - meshSize/2 , 0 , z - meshSize/2);
            }

            if ( ! ( x == 0 || z == 0 || x + 2 == meshSize || z + 2 == meshSize  ))
            {
                if (x + 1 < meshSize && z + 1 < meshSize)
                {
                    i.push(x + z*meshSize, x+1 + (z+1)*meshSize, x+1 + z*meshSize);
                    i.push(x + z*meshSize, x + (z+1)*meshSize, x+1 + (z+1)*meshSize);
                }
            }

            n.push(0,1,0);
            c.push(Math.random()/30 + 0.3, Math.random()/30 + 0.3, Math.random()/30 + 0.7, 1.0);
        }
    }


    return {
        vertices: v,
        indices: i,
        normals: n,
        colors: c,
    }
}





}

















/*
//Render & Drawing //////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//Used for rendering tringles or lines
function drawWater(gl, projectionMatrix, viewMatrix, objectPositionMatrix, objectRotationMatrix, objectScaleVector, indices, buffers, lightSourceVector, cameraVector)
{
    let programInfo = waterProgramInfo;

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

    gl.uniform4fv(programInfo.uniformLocations.lightSourceVector, lightSourceVector.getFloat32Array());
    gl.uniform4fv(programInfo.uniformLocations.cameraVector, cameraVector.getFloat32Array());

    const vertexCount = indices.length;
    gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, 0);
}
*/