let defaultShaderProgram;
let defaultProgramInfo;

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
    varying highp vec4 vertexPos;
    varying highp mat4 objRotMat;
    varying highp vec4 normalVec;


    void main() {
        vec4 vPos = vec4(aVertexPosition.x, aVertexPosition.y, aVertexPosition.z, 1.0);
        gl_Position = uProjectionMatrix * uViewMatrix * uObjectPositionMatrix * uObjectRotationMatrix * vPos;

        /*
        float vari = dot(vec4( 0.6, 0.2, 0.78, 0), uObjectRotationMatrix * aNormalVector);
        vari += 0.01;
        vari = vari*vari*vari;
        //vari = vari * (1.0-fract(sin(vPos.x)*49284.38272)/10.0);
        if (vari < 0.1)
        {
            vari = 0.1;
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
        */
        color = aColor;
        objRotMat = uObjectRotationMatrix;
        normalVec = aNormalVector;
        vertexPos = vPos;
    }
    `;
    const fsSource = `
    precision mediump float;

    varying vec4 color;
    varying vec4 vertexPos;
    varying mat4 objRotMat;
    varying vec4 normalVec;

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
            if (t1 > 0.1 && (t1 < t2 || t2 < 0.1))
            {
                return t1;
            } else if (t2 > 0.1 && (t2 < t1 || t1 < 0.1))
            {
                return t2;
            }
        }
        return 10000.0;
    }


    vec3 unit(vec3 ray)
    {
        float mag = sqrt(ray.x*ray.x + ray.y*ray.y + ray.z*ray.z);
        ray.x = ray.x/mag;
        ray.y = ray.y/mag;
        ray.z = ray.z/mag;
        return ray;
    }
    vec4 unit(vec4 ray)
    {
        float mag = sqrt(ray.x*ray.x + ray.y*ray.y + ray.z*ray.z + ray.a*ray.a);
        ray.x = ray.x/mag;
        ray.y = ray.y/mag;
        ray.z = ray.z/mag;
        ray.a = ray.a/mag;
        return ray;
    }


    void main() {
        //gl_FragColor = color + vec4(fract(vertexPos.x/100.0), fract(vertexPos.y/100.0), fract(vertexPos.z/100.0), 1.0)/10.0;
        //gl_FragColor = color + vec4(fract(sin(vertexPos.x*22.5392)), fract(sin(vertexPos.y*3.5392)), fract(sin(vertexPos.z*4.539)), 1.0)/10.0;
        
        vec4 sun =  vec4( -1, 1, 1, 1) ;
        float v = 1.0;//dot(sun, objRotMat * normalVec);
        vec4 ray = objRotMat * normalVec;

        v = distToSphere(ray.xyz, vertexPos.xyz, sun.xyz, 1.0); 
        
        
        v = 1.0/v;

        //v = dot(ray.xyz, sun.xyz);

        if (v < 0.02) {
            v = 0.2;
        }


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






const glCanvasElement = document.getElementById('reflectiveObjectCanvas');
var gl;
var FOV = (Math.PI/180.0) * 10;
var aspect = glCanvasElement.width/glCanvasElement.height;
var zNear = 4;
var zFar = 50;
var perspectiveProjectionMatrix = new mat4().makePerspective(FOV, aspect, zNear, zFar);
var viewMatrix = (new mat4().makeRotation(0,0,0)).mul( new mat4().makeTranslation(0,0,-4) );
var tick = 0;

setup();

const updateInterval = setInterval(update, 50);



function setup() {

    glCanvasElement.width = glCanvasElement.width*2;
    glCanvasElement.height = glCanvasElement.height*2;

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
    gl.clearColor(0.01, 0.01, 0.01, 0);    // Clear to black, fully opaque
    gl.clearDepth(1);                   // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    //gl.enable(gl.CULL_FACE);
    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    vertices = [-1,1,1, 1,1,1, 1,-1,1, -1,-1,1, //front
        -1,1,-1, -1,-1,-1, 1,-1,-1, 1,1,-1, //back
        -1,1,1, -1,1,-1, 1,1,-1, 1,1,1, //top
        -1,1,1, -1,-1,1, -1,-1,-1, -1,1,-1, //left
    ];
    indices = [0,1,2, 0,2,3, //front
        4,5,6, 4,6,7, //back
        8,9,10,8,10,11, //top
        12,13,14,12,14,15, //left
    ];
    normals = [0,0,1, 0,0,1, 0,0,1, 0,0,1, //front
        0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,  //back
        0,1,0, 0,1,0, 0,1,0, 0,1,0, //top
        -1,0,0, -1,0,0, -1,0,0, -1,0,0, //left
    ];

    colors = [1,0,0,1, 1,0,0,1, 1,0,0,1, 1,0,0,1,
        0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1,
        0,0,1,1, 0,0,1,1, 0,0,1,1, 0,0,1,1,
        1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1,
    ];

    var buffers = initBuffers(vertices, normals, colors, indices);

    drawDefault(gl, perspectiveProjectionMatrix, viewMatrix, 
        new mat4().makeTranslation(), 
        new mat4().makeRotation(tick,tick,tick),
        indices, buffers, true
        );
}