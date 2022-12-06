
var glCanvasElement = document.getElementById("glCanvas");




const edges = [
    0,1,2,3, //front
    7,4,0,  //leftside
    1,5,4,  //top
    7,6,5,  //back
    6,2,
];

var vertices = [
    -1,1,1,  //front
    1,1,1,
    1,-1,1,
    -1,-1,1,

    -1,1,1, //top
    -1,1,-1,
    1,1,-1,
    1,1,1,

    1,1,1, //right side
    1,1,-1,
    1,-1,-1,
    1,-1,1,

    1,-1,1, //bottom
    1,-1,-1,
    -1,-1,-1,
    -1,-1,1,
    
    -1,-1,1, //left
    -1,1,1,
    -1,1,-1,
    -1,-1,-1,

    -1,-1,-1, //back
    -1,1,-1, 
    1,1,-1,
    1,-1,-1,
];

var vertices_minimal = [
    -1,1,1,  //front
    1,1,1,
    1,-1,1,
    -1,-1,1,

    -1,1,-1,  //back
    1,1,-1,
    1,-1,-1,
    -1,-1,-1,
];

const normals = [
    0,0,1, //front
    0,0,1,
    0,0,1,
    0,0,1,

    0,1,0, //top
    0,1,0,
    0,1,0,
    0,1,0,

    1,0,0, //right
    1,0,0,
    1,0,0,
    1,0,0,

    0,-1,0, //bottom
    0,-1,0,
    0,-1,0,
    0,-1,0,

    -1,0,0, //left
    -1,0,0,
    -1,0,0,
    -1,0,0,

    0,0,-1, //back
    0,0,-1,
    0,0,-1,
    0,0,-1,
];

var indices = [
    0,1,2, 0,2,3, //front
    4,5,6, 4,6,7, //top
    8,9,10, 8,10,11, //right
    12,13,14, 12,14,15,
    16,17,18, 16,18,19,
    20,21,22, 20,22,23,
]

var indices_minimal = [
    0,1,2, 0,2,3, //front
    0,4,5, 0,5,1, //top
    0,3,7, 0,7,4, //left
    4,5,6, 4,6,7, //back
    5,6,2, 5,2,1, //right
    6,7,3, 6,3,2, //bottom
];

var colors = [

];


var FOV = 90 * Math.PI/180.0;
var aspect = glCanvasElement.width/glCanvasElement.height;
var zNear = .1;
var zFar = 10;
var player = new Player();


var pressedKeys = {};

var tick = 0;
setup();

document.addEventListener('keydown', keyPressed);
document.addEventListener('keyup', keyReleased);
var interval = setInterval(main, 1000/50);







function keyPressed(event)
{
    var keyCode = event.key;
    pressedKeys[keyCode] = true;
    console.log(keyCode);
}
function keyReleased(event)
{
    var keyCode = event.key;
    pressedKeys[keyCode] = false;

}
function setup() {
    glCanvasElement.style.width = 900;
    glCanvasElement.style.height = 500;
    glCanvasElement.width = 900;
    glCanvasElement.height = 500;

    for (var i=0; i<vertices_minimal.length; i++)
    {
        vertices_minimal[i] = vertices_minimal[i]/2;
    }

    vertices = [];
    indices = [];
    colors = [];
    for (var x=0; x<100; x++)
    {
        for (var z=0; z<100; z++)
        {
            //Create block! Add it to the vertices and indices
            var r = 0.5 + Math.random()/10;
            var g = 0.2 + Math.random()/10;
            var b = 0.1 + Math.random()/15;
            var y = Math.round(5*Math.sin(x/10) + 5*Math.cos(z/25));
            var indices_offset = vertices.length/3;
            for (var i=0; i<indices_minimal.length; i++)
            {
                indices.push( indices_minimal[i] + indices_offset );
            }
            for (var i=0; i<vertices_minimal.length; i+=3)
            {
                vertices.push( vertices_minimal[i] + x );
                vertices.push( vertices_minimal[i+1] + y );
                vertices.push( vertices_minimal[i+2] + z );
                colors.push(r);
                colors.push(g);
                colors.push(b);
            }
        }
    }
    console.log("vertices");
    console.log(vertices);
    console.log("indices");
    console.log(indices);
    console.log("colors");
    console.log(colors);
}

function main() {
    // Initialize the GL context
    const gl = glCanvasElement.getContext("webgl");
    tick += 1;

    // Only continue if WebGL is available and working
    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    //creaitng the shader program
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
          vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
          colors: gl.getAttribLocation(shaderProgram, 'aColor'),
        },
        uniformLocations: {
          projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
          viewMatrix: gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
          objectMatrix: gl.getUniformLocation(shaderProgram, 'uObjectMatrix'),
          colorVector: gl.getUniformLocation(shaderProgram, 'uColorVector'),
        },
    };

    //Init vertex and indices buffer
    const buffers = initBuffers(gl);


    //Make Perspective Matrix
    FOV = (Math.PI/180.0) * document.getElementById('fovSlider').value;
    aspect = glCanvasElement.width/glCanvasElement.height;
    zNear = document.getElementById('znearSlider').value;
    zFar = document.getElementById('zfarSlider').value;
    var projectionMatrix = new mat4();
    projectionMatrix.makePerspective(FOV, aspect, zNear, zFar);

    //Get view matrix from player
    player.update(pressedKeys);
    var viewMatrix = player.getViewMatrix();
    
    //create default object transform matrix for now
    var objectMatrix = new mat4();
    objectMatrix.makeTranslation(0,0,0);

    //Create default object rotation matrix
    var rotMat = (new mat4()).makeRotation(0,0,0);
    objectMatrix = objectMatrix.mul(rotMat);
    
    //Render!
    drawLite(gl, programInfo, buffers, projectionMatrix, viewMatrix, objectMatrix);
}


function initBuffers(gl) {
    const verticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const colorsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    const indicesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return {
        vertices: verticesBuffer,
        colors: colorsBuffer,
        indices: indicesBuffer,
    };
}




function drawLite(gl, programInfo, buffers, projectionMatrix, viewMatrix, objectMatrix)
{
    gl.clearColor(0.3, 0.4, 0.9, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(100.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  
    {
        const numComponents = 3  // pull out 2 values per iteration
        const type = gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 0;         // how many bytes to get from one set of values to the next
        const offset = 0;         // how many bytes inside the buffer to start from

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertices);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    }
    {
        const numComponents = 3  // pull out 2 values per iteration
        const type = gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 0;         // how many bytes to get from one set of values to the next
        const offset = 0;         // how many bytes inside the buffer to start from

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colors);
        gl.vertexAttribPointer(programInfo.attribLocations.colors, numComponents, type, normalize, stride, offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.colors);
    }


    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
  

    // Tell WebGL to use our program when drawing
    gl.useProgram(programInfo.program);
  

    // Set the shader uniforms
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix,  false, projectionMatrix.getFloat32Array());
    gl.uniformMatrix4fv(programInfo.uniformLocations.viewMatrix, false, viewMatrix.getFloat32Array());


    const vertexCount = indices.length;
    var objMat = (new mat4()).makeTranslation(0,0,0);
    gl.uniformMatrix4fv(programInfo.uniformLocations.objectMatrix, false, objMat.getFloat32Array());
    gl.uniform4fv(programInfo.uniformLocations.colorVector, (new vec4(0,0,0,0)).getFloat32Array());
    gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, 0);
    //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.edges);
    //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.edges);
    //gl.uniform4fv(programInfo.uniformLocations.colorVector, (new vec4(.1,.1,.1,0.9)).getFloat32Array());
    //gl.drawElements(gl.LINE_STRIP, vertexCount, gl.UNSIGNED_SHORT, 0);
 
}