
var glCanvasElement = document.getElementById("glCanvas");

var FOV = (Math.PI/180.0) * document.getElementById('fovSlider').value;
var aspect = glCanvasElement.width/glCanvasElement.height;
var zNear = document.getElementById('znearSlider').value;
var zFar = document.getElementById('zfarSlider').value;

//web gl stuff
var gl;

//Other
var player = new Player();
var mode = "default";                  //sketch, extrude, ... modes
var currentSketchObject = null; //current sketch object
var pressedKeys = {};
var tick = 0;


var mouseCanvasPos = new vec4();

document.addEventListener('keydown', keyPressed);
document.addEventListener('keyup', keyReleased);
document.addEventListener('mousemove', mouseMove);
setup();
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

    InitShader(gl)

    //creaitng the shader programs
    //[defaultShaderProgram, defaultProgramInfo] = initShaderProgram(gl);
    //[gridShaderProgram, gridProgramInfo] = initGridShaderProgram(gl);
}


function main() {
    tick += 1;

    //Init vertex and indices buffer
    //var buffers = initBuffers(vertices, normals, indices);


    switch (mode)
    {
        case "default" || "":
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
            
            //Render!
            drawLite(gl, projectionMatrix, viewMatrix);
            break;
        case "sketch":
            //Make Perspective Matrix
            aspect = glCanvasElement.width/glCanvasElement.height;
            var projectionMatrix = new mat4();
            var zoom = Number(document.getElementById("orthogonalZoomSlider").value)/10;
            if (isNaN(zoom)) { zoom = 1;}
            projectionMatrix.makeOrthogonal(aspect, zoom);

            //Get view matrix from player
            player.update(pressedKeys);
            var viewMatrix = player.getViewMatrix();
            
            //Render!
            drawLite(gl, projectionMatrix, viewMatrix);
            break;
    }
    
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





function drawLite(gl, projectionMatrix, viewMatrix)
{
    gl.clearColor(0.9, 0.9, 0.9, 1);  // Clear to black, fully opaque
    gl.clearDepth(100.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    
    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    var g = new Grid(new vec4(0,0,-3), new vec4(0,0,Math.PI/2));
    g.draw(gl, projectionMatrix, viewMatrix);

    var b = new Body();
    b.draw(gl, projectionMatrix, viewMatrix);

    var c = new Compass();
    c.draw(gl, projectionMatrix, viewMatrix);

    var s = new Sketch();
    s.draw(gl, projectionMatrix, viewMatrix);


    
    var pVec = (player.getScreenNormalVector()).scaleToUnit();
    pVec.x = -pVec.x;
    pVec.y = -pVec.y;
    pVec.z = -pVec.z;
    
    var norm = g.getNormalVector();

    console.log( pVec.toString() + "  " + norm.toString());

    c.translateMat.makeTranslation( player.getPosition().sub(new vec4(0,0,1,0)) )
    c.rotateMat.makeRotation(0,0,0);
    DrawDefault(gl, projectionMatrix, viewMatrix, c.translateMat.mul(c.rotateMat), c.indices, c.buffers, false);
    //c.setPosition(pVec);
    //c.translateMat.makeTranslation(pVec);
    //DrawLines(gl, programInfo, projectionMatrix, viewMatrix, (new mat4()).makeRotation(0,0,0,).mul(c.translateMat), c.indices, c.buffers);

    /*
    var mouse = new vec4( (mouseCanvasPos.x - glCanvasElement.width/2)/(glCanvasElement.height/2), -(mouseCanvasPos.y - glCanvasElement.height/2)/(glCanvasElement.height/2)  );
    var aspect = glCanvasElement.width/glCanvasElement.height;

    console.log(FOV);

    var n = FOV;
    var pVec = (new vec4(0,0,-1));

    var rm = (new mat4()).makeRotation(0, -mouse.x, mouse.y );
    pVec = rm.mul(pVec);

    pVec = player.getRotationMatrixInv().mul(pVec);


    pVec = pVec.sub(player.getPosition());
    c.setPosition(pVec);
    //c.translateMat.makeTranslation(pVec);
    DrawLines(gl, programInfo, projectionMatrix, viewMatrix, (new mat4()).makeRotation(0,0,0,).mul(c.translateMat), c.indices, c.buffers);
    */
    //console.log(mouse.toString());

}



