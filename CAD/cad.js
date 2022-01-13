
var glCanvasElement = document.getElementById("glCanvas");

var FOV = (Math.PI/180.0) * document.getElementById('fovSlider').value;
var aspect = glCanvasElement.width/glCanvasElement.height;
var zNear = document.getElementById('znearSlider').value;
var zFar = document.getElementById('zfarSlider').value;
var zoom = document.getElementById('orthogonalZoomSlider').value;

//web gl stuff
var gl;

//Other
var run = false;
var player = new Player();
var viewType = 'perspective' //perspective or orthogonal
var mode = "default";                  //sketch, extrude, ... modes
var currentSketchObject = null; //current sketch object
var pressedKeys = {};
var tick = 0;


var mouseCanvasPos = new vec4();

setup();
document.addEventListener('keydown', keyPressed);
document.addEventListener('keyup', keyReleased);
document.addEventListener('mousemove', mouseMove);
var interval = setInterval(main, 1000/30);


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
function mouseMove(event)
{
    var rect = glCanvasElement.getBoundingClientRect();
    mouseCanvasPos.x = event.clientX - rect.left;
    mouseCanvasPos.y = event.clientY - rect.top;
    //console.log(mouseCanvasPos.toString());
}
function create_sketch_button_press()
{
    mode = "sketch";
}
function move_player_home_button_press()
{
    player.slideToPositionAndRotation();
}




function updateCameraSettings(element = null)
{
    FOV = (Math.PI/180.0) * document.getElementById('fovSlider').value;
    aspect = glCanvasElement.width/glCanvasElement.height;
    zNear = document.getElementById('znearSlider').value;
    zFar = document.getElementById('zfarSlider').value;
    zoom = document.getElementById('orthogonalZoomSlider').value/100;

    if (element == null) {return;}
    switch(element.id)
    {
        case 'orthogonalViewCheckbox': document.getElementById('perspectiveViewCheckbox').checked = false; viewType = 'orthogonal'; break;
        case 'perspectiveViewCheckbox': document.getElementById('orthogonalViewCheckbox').checked = false; viewType = 'perspective'; break;
    }
}



function setup() {
    glCanvasElement.style.width = 900;
    glCanvasElement.style.height = 500;
    glCanvasElement.width = 900;
    glCanvasElement.height = 500;

    // Initialize the GL context
    //const gl = glCanvasElement.getContext("webgl");

    // Only continue if WebGL is available and working
    if (gl == null)
    {
        gl = glCanvasElement.getContext("webgl");
        if (gl === null) {
            alert("Unable to initialize WebGL. Your browser or machine may not support it.");
            return;
        } else {
            console.log("GL defined ")
        }
    }
    updateCameraSettings();
    InitShader(gl);
    run = true;
}


function main() {
    if (!run)
    {
        return;
    }
    tick += 1;

    //Init vertex and indices buffer
    //var buffers = initBuffers(vertices, normals, indices);

    var projectionMatrix = new mat4();
    switch (viewType)
    {
        
        case "perspective" || "":
            //Make Perspective Matrix
            projectionMatrix.makePerspective(FOV, aspect, zNear, zFar);
            break;
        case "orthogonal":
            //Make Perspective Matrix
            projectionMatrix.makeOrthogonal(aspect, zoom);
            break;
        default:
            console.error("Unknown viewType. Should be 'perspective' or 'orthogonal'.");
            return;
    }
    //Get view matrix from player
    player.update(pressedKeys);
    var viewMatrix = player.getViewMatrix();
    
    //Render!
    drawLite(gl, projectionMatrix, viewMatrix);    
}


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

function initBuffersForText(vertices, indices)
{
    const verticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const indicesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.DYNAMIC_DRAW);

    return {
        vertices: verticesBuffer,
        indices: indicesBuffer,
    };
}


function initBuffersTexture(vertices, textureCoords, indices, textureImageData) {
    const verticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const textureCoordsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);

    const indicesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);


    const textureBuffer = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textureBuffer);


    const level = 0;
    const internalFormat = gl.RGBA;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    //gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, textureImageData.width, textureImageData.height, border, srcFormat, srcType, textureImageData.data);
    //gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    
    /*const image = new Image();
    image.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, textureBuffer);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);

        // WebGL1 has different requirements for power of 2 images
        // vs non power of 2 images so check if the image is a
        // power of 2 in both dimensions.
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            // Yes, it's a power of 2. Generate mips.
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            // No, it's not a power of 2. Turn off mips and set
            // wrapping to clamp to edge
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };
    image.src = textureURL;*/

    return {
        vertices: verticesBuffer,
        textureCoords: textureCoordsBuffer,
        indices: indicesBuffer,
        texture: textureBuffer,
    };
    


 
}




function drawLite(gl, projectionMatrix, viewMatrix)
{
    gl.clearColor(0.9, 0.9, 0.9, 1);  // Clear to black, fully opaque
    gl.clearDepth(1);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    
    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    var g = new Grid(new vec4(50,0,50), new vec4(0,0,0));
    g.draw(gl, projectionMatrix, viewMatrix);
    g = new Grid(new vec4(50,50,0), new vec4(0,0,Math.PI/2));
    g.draw(gl, projectionMatrix, viewMatrix);
    g = new Grid(new vec4(00,50,50), new vec4(Math.PI/2,0,0));
    g.draw(gl, projectionMatrix, viewMatrix);

    var b = new Body(new vec4(0,0,0));
    b.draw(gl, projectionMatrix, viewMatrix);

    var c = new Compass();
    c.draw(gl, projectionMatrix, viewMatrix);

    var s = new Sketch(new vec4(1,1,1));
    s.draw(gl, projectionMatrix, viewMatrix);


    var pointOnPlane = vectorFromPointToPlane(g.getPosition(), g.getNormalVector(), player.getPosition(), player.getScreenNormalVector() );
    if (pointOnPlane != null) {
        pointOnPlane.round(2);
        var t = (new mat4).makeTranslation(  pointOnPlane  );
        DrawDefault(gl, projectionMatrix, viewMatrix, t, s.indices, s.buffers, false);
    }

    
   // b.setData(v,[],[0,0,0,0],i2);
    //b.draw(gl, projectionMatrix, viewMatrix);

    var t = new Text( new vec4(0,2,0) );
    t.draw(gl, projectionMatrix, viewMatrix);
}






/*
    var Av = [0,0,0,0.2,0.8,0,0.3,0.8,0,0.1,0,0,0.5,0,0,0.4,0,0,0.1,0.3,0,0.1,0.4,0,0.4,0.4,0,0.4,0.3,0];
    var Ai = [0,1,2,2,3,0,2,4,5,5,1,2,6,7,8,8,9,6];

    var Bv = [0,0,0,0,0.8,0,0.1,0.8,0,0.1,0,0,0.3,0.8,0,0.4,0.7,0,0.1,0.7,0,0.4,0.5,0,0.3,0.4,0,0.3,0.7,0,0.4,0.1,0,0.3,0,0,0.1,0.1,0,0.3,0.1,0,0.3,0.5,0,0.4,0.3,0,0.1,0.5,0,0.1,0.4,0];
    var Bi = [0,1,2,2,3,0,2,4,5,5,6,2,5,7,8,8,9,5,10,11,3,3,12,10,10,13,14,14,15,10,16,14,8,8,17,16];

    var Cv = [0.1,0,0,0,0.1,0,0,0.7,0,0.1,0.8,0,0.4,0.8,0,0.5,0.7,0,0.1,0.7,0,0.5,0.6,0,0.4,0.6,0,0.4,0.7,0,0.4,0,0,0.5,0.1,0,0.1,0.1,0,0.5,0.2,0,0.4,0.2,0,0.4,0.1,0];
    var Ci = [0,1,2,2,3,0,3,4,5,5,6,3,5,7,8,8,9,5,0,10,11,11,12,0,11,13,14,14,15,11];

    var Dv = [0,0,0,0,0.8,0,0.1,0.8,0,0.1,0,0,0.3,0.8,0,0.4,0.7,0,0.1,0.7,0,0.5,0.6,0,0.4,0.6,0,0.3,0.7,0,0.5,0.2,0,0.4,0.2,0,0.3,0,0,0.4,0.1,0,0.1,0.1,0,0.3,0.1,0];
    var Di = [0,1,2,2,3,0,2,4,5,5,6,2,5,7,8,8,9,5,7,10,11,11,8,7,3,12,13,13,14,3,13,10,11,11,15,13];

    var Ev = [0,0,0,0,0.8,0,0.1,0.8,0,0.1,0,0,0.5,0.8,0,0.5,0.7,0,0.1,0.7,0,0.1,0.1,0,0.5,0.1,0,0.5,0,0,0.1,0.4,0,0.3,0.4,0,0.3,0.3,0,0.1,0.3,0 ];
    var Ei = [0,1,2,2,3,0,2,4,5,5,6,2,7,8,9,9,3,7,10,11,12,12,13,10];

    var Fv = [0,0,0,0,0.8,0,0.1,0.8,0,0.1,0,0,0.5,0.8,0,0.5,0.7,0,0.1,0.7,0,0.1,0.4,0,0.3,0.4,0,0.3,0.3,0,0.1,0.3,0];
    var Fi = [0,1,2,2,3,0,2,4,5,5,6,2,7,8,9,9,10,7];

    var Gv = [0.1,0,0,0,0.1,0,0,0.7,0,0.1,0.8,0,0.4,0,0,0.4,0.1,0,0.1,0.1,0,0.4,0.8,0,0.5,0.7,0,0.1,0.7,0,0.5,0.6,0,0.4,0.6,0,0.4,0.7,0,0.5,0,0,0.5,0.4,0,0.4,0.4,0,0.3,0.4,0,0.3,0.3,0,0.4,0.3,0];
    var Gi = [0,1,2,2,3,0,0,4,5,5,6,0,3,7,8,8,9,3,8,10,11,11,12,8,13,14,15,4,15,13,15,16,17,17,15,18];

    var Hv = [0,0,0,0,0.8,0,0.1,0.8,0,0.1,0,0,0.4,0,0,0.4,0.8,0,0.5,0.8,0,0.5,0,0,0.1,0.4,0,0.4,0.4,0,0.4,0.3,0,0.1,0.3,0];
    var Hi = [0,1,2,2,3,0,4,5,6,6,7,4,8,9,10,10,11,8];

    var Iv = [0,0.8,0,0.5,0.8,0,0.5,0.7,0,0,0.7,0,0,0.1,0,0.5,0.1,0,0.5,0,0,0,0,0,0.2,0.7,0,0.2,0.1,0,0.3,0.1,0,0.3,0.7,0];
    var Ii = [0,1,2,2,3,0,4,5,6,6,7,4,8,9,10,10,11,8];

    var Jv = [0,0.2,0,0,0.1,0,0.1,0,0,0.1,0.2,0,0.1,0.1,0,0.3,0.1,0,0.3,0,0,0.3,0.8,0,0.4,0.8,0,0.4,0.1,0];
    var Ji = [0,1,2,2,3,0,4,5,6,6,2,4,7,8,9,6,9,7];

    var Kv = [0,0,0,0,0.8,0,0.1,0.8,0,0.1,0,0,0.1,0.4,0,0.2,0.4,0,0.2,0.3,0,0.1,0.3,0,0.4,0.8,0,0.5,0.8,0,0.5,0.6,0,0.4,0.5,0,0.4,0.6,0,0.5,0.2,0,0.5,0,0,0.4,0,0,0.4,0.2,0];
    var Ki = [0,1,2,2,3,0,4,5,6,6,7,4,8,9,10,10,11,8,12,5,6,6,11,12,5,13,14,14,15,16,6,16,5];

    var Lv = [0.1,0.8,0,0.2,0.8,0,0.2,0,0,0.1,0,0,0.2,0.05,0,0.6,0.05,0,0.65,0,0,0.65,0.2,0,0.7,0.2,0,0.5,0,0,0,0.8,0,0.3,0.8,0,0.3,0.75,0,0.15,0.7,0,0,0.75,0,0,0,0,0,0.05,0,0.2,0.1,0];
    var Li = [0,1,2,2,3,0,4,5,6,6,2,4,5,7,8,8,6,9,10,11,12,12,13,14,14,10,12,15,16,17,17,2,15];
*/


    /*
    var v0 = [0,0.1,0,0.4,0.1,0,0.3,0,0,0.1,0,0,0,0.7,0,0.1,0.8,0,0.1,0.1,0,0.3,0.8,0,0.4,0.7,0,0.1,0.7,0,0.3,0.1,0,0.3,0.7,0];
    var i0 = [0,1,2,2,3,0,0,4,5,5,6,0,5,7,8,8,9,5,8,1,10,10,11,8];

    var v1 = [0,0.1,0,0.4,0.1,0,0.4,0,0,0,0,0,0.15,0,0,0.15,0.8,0,0.25,0.8,0,0.25,0,0,0,0.6,0,0.05,0.55,0];
    var i1 = [0,1,2,2,3,0,4,5,6,7,4,6,8,5,6,6,9,8];

    var v2 = [0,0.1,0,0.4,0.1,0,0.4,0,0,0,0,0,0,0.6,0,0.1,0.8,0,0.2,0.8,0,0.1,0.6,0,0.3,0.8,0,0.4,0.6,0,0.3,0.6,0,0.15,0.7,0,0.25,0.7,0,0.1,0.1,0];
    var i2 = [0,1,2,2,3,0,4,5,6,6,7,4,8,9,10,10,6,8,11,6,12,13,9,10,10,0,13];

    var v3 = [0.1,0.1,0,0.3,0.1,0,0.3,0,0,0.1,0,0,0.1,0.8,0,0.3,0.8,0,0.3,0.7,0,0.1,0.7,0,0.3,0.4,0,0.4,0.3,0,0.4,0.1,0,0.4,0.7,0,0.4,0.45,0,0.3,0.35,0,0,0.1,0,0.05,0.15,0,0,0.7,0,0.05,0.65,0,0.3,0.3,0,0.2,0.35,0,0.2,0.4,0,0.3,0.45,0];
    var i3 = [0,1,2,2,3,0,4,5,6,6,7,4,8,9,10,10,2,8,5,11,12,12,13,5,3,14,15,15,0,3,4,16,17,17,7,4,18,19,20,20,21,18];

    var v4 = [0.3,0,0,0.3,0.8,0,0.4,0.8,0,0.4,0,0,0,0.3,0,0,0.8,0,0.1,0.8,0,0.1,0.3,0,0.1,0.4,0,0.4,0.4,0,0.4,0.3,0];
    var i4 = [0,1,2,2,3,0,4,5,6,6,7,4,8,9,10,10,7,8];

    var v5 = [0,0.7,0,0,0.8,0,0.4,0.8,0,0.4,0.7,0,0,0.4,0,0.1,0.4,0,0.1,0.7,0,0.1,0.5,0,0.3,0.5,0,0.4,0.4,0,0.4,0.1,0,0.3,0,0,0.3,0.4,0,0.1,0,0,0,0.1,0,0.3,0.1,0,0,0.2,0,0.1,0.2,0,0.1,0.1,0];
    var i5 = [0,1,2,2,3,0,0,4,5,5,6,0,7,8,9,9,5,7,9,10,11,11,12,9,11,13,14,14,15,11,14,16,17,17,18,14];

    var v6 = [0,0.1,0,0.4,0.1,0,0.3,0,0,0.1,0,0,0.4,0.3,0,0.3,0.4,0,0.3,0.1,0,0.1,0.4,0,0.1,0.3,0,0.3,0.3,0,0,0.4,0,0.1,0.1,0,0.1,0.8,0,0.2,0.8,0];
    var i6 = [0,1,2,2,3,0,1,4,5,5,6,1,5,7,8,8,9,5,0,10,7,7,11,0,10,12,13,13,7,10];

    var v7 = [0,0.8,0,0.4,0.8,0,0.4,0.7,0,0,0.7,0,0.2,0,0,0.1,0,0,0.3,0.7,0];
    var i7 = [0,1,2,2,3,0,2,4,5,5,6,2];
    
    var v8 = [0,0.7,0,0.1,0.8,0,0.3,0.8,0,0.4,0.7,0,0,0.1,0,0.4,0.1,0,0.3,0,0,0.1,0,0,0.1,0.5,0,0.3,0.5,0,0.3,0.4,0,0.1,0.4,0,0.1,0.45,0,0,0.55,0,0.1,0.7,0,0,0.35,0,0.1,0.1,0,0.3,0.7,0,0.3,0.45,0,0.4,0.55,0,0.3,0.1,0,0.4,0.35,0];
    var i8 = [0,1,2,2,3,0,4,5,6,6,7,4,8,9,10,10,11,8,12,13,0,0,14,12,12,15,4,4,16,12,17,18,19,19,3,17,18,20,5,5,21,18];
    
    var v9 = [0,0.7,0,0.1,0.8,0,0.3,0.8,0,0.4,0.7,0,0,0.5,0,0.1,0.4,0,0.1,0.7,0,0.1,0.5,0,0.4,0.5,0,0.4,0.4,0,0.3,0.7,0,0.3,0.5,0,0.3,0,0,0.2,0,0,0.3,0.4,0];
    var i9 = [0,1,2,2,3,0,0,4,5,5,6,0,7,8,9,9,5,7,10,11,8,8,3,10,9,12,13,13,14,9];
    


    var v = [0,0,0,0,0.1,0,0,0.2,0,0,0.3,0,0,0.4,0,0,0.5,0,0,0.6,0,0,0.7,0,0.1,0,0,0.1,0.1,0,0.1,0.2,0,0.1,0.3,0,0.1,0.4,0,0.1,0.5,0,0.1,0.6,0,0.1,0.7,0,0.2,0,0,0.2,0.1,0,0.2,0.2,0,0.2,0.3,0,0.2,0.4,0,0.2,0.5,0,0.2,0.6,0,0.2,0.7,0,0.3,0,0,0.3,0.1,0,0.3,0.2,0,0.3,0.3,0,0.3,0.4,0,0.3,0.5,0,0.3,0.6,0,0.3,0.7,0,0.4,0,0,0.4,0.1,0,0.4,0.2,0,0.4,0.3,0,0.4,0.4,0,0.4,0.5,0,0.4,0.6,0,0.4,0.7,0];

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