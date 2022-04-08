
var defaultShaderProgram;
var defaultProgramInfo;

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

    uniform vec4 uViewPosition;
    precision highp float;

    varying highp vec4 vScreenPos;
    //varying highp vec4 viewPosition;

    void main() {
        gl_Position = vec4(aVertexPosition.x, aVertexPosition.y, aVertexPosition.z, 1.0);
        vScreenPos = gl_Position;
        //viewPosition = uViewPosition;
    }
    `;

    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, generateShader());

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
        },
        uniformLocations: {
            viewPosition: gl.getUniformLocation(shaderProgram, 'uViewPosition'),
            viewRotation: gl.getUniformLocation(shaderProgram, 'uViewRotation'),
            rotationMatrix: gl.getUniformLocation(shaderProgram, 'uRotationMatrix'),
            lightDistanceDivisor: gl.getUniformLocation(shaderProgram, 'uLightDistanceDivisor'),
            planeReflectance: gl.getUniformLocation(shaderProgram, 'uPlaneReflectance'),
        },
    };

    return [shaderProgram, programInfo]
}



const glCanvasElement = document.getElementById('glcanvas');
const lightDistanceDivisorElement = document.getElementById('lightDistanceDivisor');
const planeReflectanceElement = document.getElementById('planeReflectance');
const maxReflectionsElement = document.getElementById('maxReflections');
var gl;
var camPos = new vec4(0,0,-5);
var camRot = new vec4(Math.PI/2,0,0);
var camRotMat = new mat4();
var pressedKeys = {};
var tick = 0;
var mousePos = new vec4();
var mouseIsDown = false;

setup();

const vertices = [-1,1,0, 1,1,0, 1,-1,0, -1,-1,0];
const indices = [0,1,2, 0,2,3];
const buffers = initBuffers(vertices, null, null, indices);

var updateInterval = setInterval(update, 30);
document.addEventListener('keydown', keyPressed);
document.addEventListener('keyup', keyReleased);
glCanvasElement.addEventListener('mousedown', mouseDown);
glCanvasElement.addEventListener('mousemove', mouseMove);
document.addEventListener('mouseup', mouseUp);



function setup() {
    //var min = Math.min(window.visualViewport.width, window.visualViewport.height);
    /*glCanvasElement.width = window.visualViewport.width;
    glCanvasElement.height = window.visualViewport.height;
    glCanvasElement.style.width = glCanvasElement.width + "px";
    glCanvasElement.style.height = glCanvasElement.height + 'px';*/
    //glCanvasElement.width = min;
    //glCanvasElement.height = min;
    //glCanvasElement.style.width = min + "px";
    //glCanvasElement.style.height = min + 'px';
    let bb = glCanvasElement.getBoundingClientRect();
    glCanvasElement.width = bb.width;
    glCanvasElement.height = bb.height;

    gl = glCanvasElement.getContext("webgl");
    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    } else {
        console.log("GL defined ")
    }

    //InitShader(gl);
    [defaultShaderProgram, defaultProgramInfo] =  initDefaultShaderProgram(gl);
}
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
function mouseDown(event)
{
    console.log(event);
    mouseIsDown = true;
    mousePos.x = event.clientX;
    mousePos.y = event.clientY;
}
function mouseMove(event)
{
    if (mouseIsDown)
    {
        let x = event.clientX;
        let y = event.clientY;
        let dx = mousePos.x - x;
        let dy = mousePos.y - y;
        camRot.y += dx/500;
        camRot.x += -dy/500;
        mousePos.x = x;
        mousePos.y = y;
    }
}
function mouseUp(event)
{
    mouseIsDown = false;
}

function frameRate(element)
{
    let fr = Number(element.value);
    clearInterval(updateInterval);
    updateInterval = setInterval(update, Math.ceil(1000/fr));
}


function updateCamera() {
    let tempTrans = new vec4();
    let tempRot = new vec4();
    let transSpeed = 0.1;
    let rotSpeed = 0.05;
    if (pressedKeys['w'] || pressedKeys['W'])
    {
        tempTrans.z += transSpeed;// * Math.cos(camRot.y);
    }
    if (pressedKeys['s'] || pressedKeys['S'])
    {
        tempTrans.z -= transSpeed;// * Math.cos(camRot.y);
    }
    if (pressedKeys['d'] || pressedKeys['D'])
    {
        tempTrans.x += transSpeed;// * Math.cos(camRot.y);
    }
    if (pressedKeys['a'] || pressedKeys['A'])
    {
        tempTrans.x -= transSpeed;// * Math.cos(camRot.y);
    }
    if (pressedKeys[' '])
    {
        tempTrans.y += transSpeed;
    }
    if (pressedKeys['Shift'])
    {
        tempTrans.y -= transSpeed;
    }


    if (pressedKeys['ArrowRight'])
    {
        tempRot.y += rotSpeed;
    }
    if (pressedKeys['ArrowLeft'])
    {
        tempRot.y -= rotSpeed;
    }
    if (pressedKeys['ArrowUp'] && camRot.x < 2)
    {
        tempRot.x += rotSpeed;
    }
    if (pressedKeys['ArrowDown'] && camRot.x > 1)
    {
        tempRot.x -= rotSpeed;
    }

    camRot.addi(tempRot);
    //camRotMat.makeRotation(0, camRot.y, 0);
    camPos.addi( new mat4().makeRotation(0,camRot.y,0).mul(tempTrans) );

    //camRotMat.makeRotation(camRot.x*Math.sin(camRot.y), camRot.y, camRot.x * Math.cos(camRot.y))
    //camRotMat =   new mat4().makeRotation(0,0,camRot.x).mul(  new mat4().makeRotation(0,camRot.y,0) ) ;
    camRotMat =   new mat4().makeRotation(0,camRot.y, (-camRot.x + Math.PI/2)%Math.PI);

    //camRotMat.makeRotation(camRot.x, camRot.y, camRot.z);
}


function update() {
    tick += 1;

    updateCamera();

    camPos.addi(0,Math.sin(tick/10)/500)

    gl.clearColor(0.01, 0.01, 0.01, 1);    // Clear to black, fully opaque
    gl.clearDepth(1);                   // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    var programInfo = defaultProgramInfo;

    // Tell WebGL to use our program when drawing
    gl.useProgram(programInfo.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertices);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexLocation);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    // Set the shader uniforms
    lightDistanceDivisor = [Number(lightDistanceDivisorElement.value)];
    planeReflectance = [Number(planeReflectanceElement.value)];
    gl.uniform4fv(programInfo.uniformLocations.viewPosition, camPos.getFloat32Array());
    gl.uniform4fv(programInfo.uniformLocations.viewRotation, camRot.getFloat32Array());
    gl.uniformMatrix4fv( programInfo.uniformLocations.rotationMatrix, false, camRotMat.getFloat32Array() );
    gl.uniform1fv(programInfo.uniformLocations.lightDistanceDivisor, new Float32Array(lightDistanceDivisor));
    gl.uniform1fv(programInfo.uniformLocations.planeReflectance, new Float32Array(planeReflectance));

    

    const vertexCount = indices.length;
    gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, 0);
}




function generateShader() {
    const defaultCode = `
    precision highp float;
varying vec4 vScreenPos;

uniform vec4 uViewPosition;
uniform mat4 uRotationMatrix;
uniform float uLightDistanceDivisor;
uniform float uPlaneReflectance;

vec3 unit(vec3 r)
{
	float d = sqrt(r.x*r.x + r.y*r.y + r.z*r.z);
	if (d < 0.0) { d = -d;}
	r.x = r.x / d;
	r.y = r.y / d;
	r.z = r.z / d;
	return r;
}

vec3 reflectRay(vec3 rayD, vec3 N)
{
	float d = dot(rayD, N)*2.0;
	return unit( rayD - N*d );
}
float distToSphere(vec3 rayD, vec3 rayP, vec3 sC, float sR)
{
	float a = rayD.x*rayD.x + rayD.y*rayD.y + rayD.z*rayD.z;
	float b = 2.0 * (rayD.x * (rayP.x - sC.x) + rayD.y * (rayP.y - sC.y) + rayD.z * (rayP.z - sC.z));
	float c = (rayP.x-sC.x)*(rayP.x-sC.x) + (rayP.y-sC.y)*(rayP.y-sC.y) + (rayP.z-sC.z)*(rayP.z-sC.z) - sR*sR;
	float top = b*b - 4.0*a*c;

	if (top >= 0.001)
	{
	    top = sqrt(top);
	    float t1 = (-b-top)/(2.0*a);
	    float t2 = (-b+top)/(2.0*a);
	    if (t1 > 0.01 && (t1 < t2 || t2 < 0.01))
	    {
		return t1;
	    } else if (t2 > 0.01 && (t2 < t1 || t1 < 0.01))
	    {
		return t2;
	    }
	}
	return 100000.0;
}

float distToPlane(vec3 rayD, vec3 rayP, vec3 pP, vec3 pN)
{
	float t = dot(pP-rayP, pN) / dot(rayD, pN);
	if (t > 0.001)
	{
	    return t;
	}
	return 10000.0;
}
float distToPoint(vec3 rayP, vec3 P)
{
	vec3 x = P-rayP;
	return sqrt( dot(x,x) );
}
    `;
    const mainFunction = `void main() {
        vec3 rayD = unit(vec3(vScreenPos.x*3.0, vScreenPos.y*3.0, 5.0));
        rayD = ( uRotationMatrix * vec4(rayD.xyz,1.0) ).xyz;        
        vec3 rayP = uViewPosition.xyz;  //vec3(0.0, 0.0, 0.0);
        gl_FragColor = fireRay(rayD, rayP);
    }`;
    var planes = [
        //Position              Normal         Color
        [new vec4(0,0,10), new vec4(0,0,1), new vec4(1,0,0)], //back
        [new vec4(0,5,0), new vec4(0,-1,0), new vec4(0,1,0)], //top
        [new vec4(0,-5,0), new vec4(0,1,0), new vec4(0,0,1)], //bottom
        [new vec4(5,0,0), new vec4(-1,0,0), new vec4(0.5,0.5,0)], //right
        [new vec4(-5,0,0), new vec4(1,0,0), new vec4(0,0.5,0.5)], //left
    ];
    var spheres = [
        [new vec4(0,0,5), 1],
        [new vec4(1,2,6), 1],
        [new vec4(-3,-2,6), 1],
        [new vec4(0,-2,6), 2],
    ];
    /*
    var spheres = [];
    let max = 5;
    for (var x=0; x<max; x++)
    {
        for (var z=0;z<max;z++)
        {
            for (var y=0; y<max; y++)
            {
                spheres.push( [ new vec4(x*2,y*2,z*2), 1])
            }
        }
    }*/

    var planeReflectance = 0.99; //any value 0.1 to 0.99;



    
    var str = "vec4 fireRay(vec3 rayD, vec3 rayP) { \nvec4 color = vec4(0,0,0,1); \nfloat percentDone = 0.0;\n";
    str += "vec3 lightSource = vec3(3,3,6);\n"; //adding lightsource

    //Adding sphere & plane distance and leaving variables
    str +="\n\n//Spheres:\n";
    for (var i in spheres)
    {
        str += "float SD"+i+"=10000.0; bool leavingS"+i+"=false;\n";
        str += "vec3 SC"+i+"=vec3("+spheres[i][0].x+", "+spheres[i][0].y+", "+spheres[i][0].z+"); float SR"+i+"="+spheres[i][1]+".0;\n";
    }

    str +="\n\n//Planes:\n";
    for (var i in planes)
    {
        str += "float PD"+i+"=10000.0; bool leavingP"+i+"=false;\n";
        str += "vec3 PC"+i+"=vec3("+planes[i][0].x+", "+planes[i][0].y+", "+planes[i][0].z+"); vec3 PN"+i+"=vec3("+planes[i][1].x+", "+planes[i][1].y+", "+planes[i][1].z+");\n";
    }

    //beginning of for loop
    str += "\n\n//Loop:\nfor (int i=0; i<10; i++) {\n";

    //Get initial distances
    str += "\n\n//Get Distances:\n";
    for (var i in spheres)
    {
        str += "if (!leavingS"+i+") {SD"+i+"=distToSphere(rayD, rayP, SC"+i+", SR"+i+");} else {SD"+i+"=10000.0;} \n";
    }
    for (var i in planes)
    {
        str += "if (!leavingP"+i+") {PD"+i+"=distToPlane(rayD, rayP, PC"+i+", PN"+i+");} else {PD"+i+"=10000.0;} \n";
    }


    //Reset all 'leaving...' booleans
    str += "\n\n//Reseting leaving...\n";
    for (var i in spheres)
    {
        str += "leavingS"+i+" = false;\n";
    }
    for (var i in planes)
    {
        str += "leavingP"+i+" = false;\n";
    }


    //Min Function - Needs Optimization.
    str += "\n\n//MinFunction:\n";
    str += "float m = ";
    var ds = [];
    for (var i in spheres) {ds.push("SD"+i);}
    for (var i in planes) {ds.push("PD"+i);}
    for (var i=0; i<ds.length-1; i++)
    {
        str +='min(';
    }
    str += ds[0] +", ";
    for (var i=1; i<ds.length-1; i++)
    {
        str += ds[i] +"), ";
    }
    str += ds[ds.length-1] +");";
    

    //Sphere if statements
    str += "\n\n//Spheres If Statements:\n"
    for (var i in spheres)
    {
        str += "if (m == SD"+i+"){\n";
        str += "rayP += rayD*m;\n";
        str += "rayD = reflectRay(rayD, unit(SC"+i+"-rayP));\n";
        str += "leavingS"+i+" = true;\n";
        str += "continue; \n}\n";
    }


    //Plane if statements
    str += "\n\n//Plane If Statements:\n"
    str += "vec3 newRayP = rayP + rayD*m;\n";
    str += "vec3 newRayD = unit(lightSource - newRayP);\n";
    str += "float d = distToPoint(newRayP, lightSource);\n";
    for (var i in spheres)
    {
        str += "SD"+i+"=distToSphere(newRayD, newRayP, SC"+i+", SR"+i+");\n";
    }
    str += "if (";
    for (var i in spheres)
    {
        str += "(SD"+i+"<d && SD"+i+">0.01)";
        if (i != spheres.length-1) { str += " || ";}
    }
    str += "){ d = d*1.5; }\n";
    str += "d = d/uLightDistanceDivisor;";

    for (var i in planes)
    {
        str += "if (m == PD"+i+"){\n";
        str += "rayP += rayD*m;\n";
        str += "rayD = reflectRay(rayD, PN"+i+");\n";
        str += "color += (1.0-percentDone)*"+planeReflectance+"*vec4("+planes[i][2].x.toPrecision(2)+"/d, "+planes[i][2].y.toPrecision(2)+"/d, "+planes[i][2].z.toPrecision(2)+"/d, 0);\n";
        str += "percentDone += (1.0-percentDone)*uPlaneReflectance;\n";
        str += "leavingP"+i+" = true;\n";
        str += "continue; \n}\n";
    }

    str += "\n\nif (percentDone > 0.95) { return color; }\n";
    str += "} return color;}";
    console.log(defaultCode + str + mainFunction);
    return defaultCode + str + mainFunction;
}









function generateShader2() {
    const defaultCode = `
    precision highp float;
    varying vec4 vScreenPos;

    uniform vec4 uViewPosition;
    uniform mat4 uRotationMatrix;
    uniform float uLightDistanceDivisor;
    uniform float uPlaneReflectance;

    vec3 unit(vec3 r)
    {
        float d = sqrt(r.x*r.x + r.y*r.y + r.z*r.z);
        if (d < 0.0) { d = -d;}
        r.x = r.x / d;
        r.y = r.y / d;
        r.z = r.z / d;
        return r;
    }

    vec3 reflectRay(vec3 rayD, vec3 N)
    {
        float d = dot(rayD, N)*2.0;
        return unit( rayD - N*d );
    }
    float distToSphere(vec3 rayD, vec3 rayP, vec3 sC, float sR)
    {
        float a = rayD.x*rayD.x + rayD.y*rayD.y + rayD.z*rayD.z;
        float b = 2.0 * (rayD.x * (rayP.x - sC.x) + rayD.y * (rayP.y - sC.y) + rayD.z * (rayP.z - sC.z));
        float c = (rayP.x-sC.x)*(rayP.x-sC.x) + (rayP.y-sC.y)*(rayP.y-sC.y) + (rayP.z-sC.z)*(rayP.z-sC.z) - sR*sR;
        float top = b*b - 4.0*a*c;

        if (top >= 0.001)
        {
            top = sqrt(top);
            float t1 = (-b-top)/(2.0*a);
            float t2 = (-b+top)/(2.0*a);
            if (t1 > 0.01 && (t1 < t2 || t2 < 0.01))
            {
            return t1;
            } else if (t2 > 0.01 && (t2 < t1 || t1 < 0.01))
            {
            return t2;
            }
        }
        return 100000.0;
    }

    float distToPlane(vec3 rayD, vec3 rayP, vec3 pP, vec3 pN)
    {
        float t = dot(pP-rayP, pN) / dot(rayD, pN);
        if (t > 0.001)
        {
            return t;
        }
        return 10000.0;
    }
    float distToPoint(vec3 rayP, vec3 P)
    {
        vec3 x = P-rayP;
        return sqrt( dot(x,x) );
    }


    vec4 fireRay(vec3 rayD, vec3 rayP) {
        vec4 color = vec4(0,0,0,1);
        float percentDone = 0.0;

        vec3 sC = vec3(0,0,4);
        float sR = 1.0;

        vec3 sC2 = vec3(1,2,5);
        float sR2 = 0.6;

        vec3 lC = vec3(4,0,8);

        bool leavingSphere = false;
        bool leavingSphere2 = false;

        float sD = 10000.0;
        float sD2 = 10000.0;
        float pD1 = 10000.0;
        float pD2 = 10000.0;
        float pD3 = 10000.0;
        float pD4 = 10000.0;
        float pD5 = 10000.0;


        for (int i=0; i<10; i++) {

            if (!leavingSphere) { sD = distToSphere(rayD, rayP, sC, sR); } else { sD = 10000.0; }
            //if (!leavingSphere) { sD = distToCube(rayD, rayP, sC, sR); } else { sD = 10000.0; }
            if (!leavingSphere2) { sD2 = distToSphere(rayD, rayP, sC2, sR2); } else { sD2 = 10000.0; }
            pD1 = distToPlane(rayD, rayP, vec3(0,  0,  10), vec3(0,0,1));
            pD2 = distToPlane(rayD, rayP, vec3(5,  0,  0), vec3(1,0,0));
            pD3 = distToPlane(rayD, rayP, vec3(-5, 0,  0), vec3(1,0,0));
            pD4 = distToPlane(rayD, rayP, vec3(0,  5,  0), vec3(0,1,0));
            pD5 = distToPlane(rayD, rayP, vec3(0,  -5, 0), vec3(0,1,0));

            float m = min(min(min(sD, pD1), min(pD2, pD3)), min(pD4, pD5));
            m = min(m, sD2);


            if (m == sD)
            {
                rayP = rayP + rayD*m;
                rayD = reflectRay(rayD, unit(sC-rayP));
                leavingSphere = true;
            } else if (m == sD2)
            {
                rayP = rayP + rayD*m;
                rayD = reflectRay(rayD, unit(rayP-sC2) );
                leavingSphere2 = true;
            } else {
                leavingSphere = false;
                leavingSphere2 = false;

                vec3 newRayP = rayP + rayD*m;
                vec3 newRayD = unit( lC - newRayP);
                float d = distToPoint(newRayP, lC);
                float d2 = distToSphere(newRayD, newRayP, sC, sR);
                float d3 = distToSphere(newRayD, newRayP, sC2, sR2);
                if ((d2 < d && d2 > 0.0) || (d3 < d && d3 > 0.0)){
                    d = d*2.0;
                }

                d = d/uLightDistanceDivisor;

                if (m == pD1)
                {
                    return vec4(1.0/d,0,0,1)*(1.0-percentDone) + percentDone*color;
                }else if (m == pD2)
                {
                    return vec4(0,1.0/d,0,1)*(1.0-percentDone) + percentDone*color;
                }else if (m == pD3)
                {
                    rayP = rayP + m*rayD;
                    rayD = reflectRay(rayD, vec3(1,0,0));
                    color += (1.0-percentDone)*0.9*vec4(0,1.0/d,1.0/d,0);
                    percentDone += (1.0-percentDone)*0.9;
                    //return vec4(0,0.5/d,0.5/d,1)*(1.0-percentDone) + percentDone*color;
                }else if (m == pD4)
                {
                    return vec4(0.5/d,0.5/d,0,1)*(1.0-percentDone) + percentDone*color;
                }else if (m == pD5)
                {
                    rayP = rayP + m*rayD;
                    rayD = reflectRay(rayD, vec3(0,1,0));
                    color += (1.0-percentDone)*0.99*vec4(1.0/d,1.0/d,1.0/d,0);
                    percentDone += (1.0-percentDone)*0.99;
                    //return vec4(1.0/d,1.0/d,1.0/d,1)*(1.0-percentDone) + percentDone*color;
                }
            }


            if (percentDone > 0.95)
            {
                return color;
            }
            
        }

        //Return white if there's an issue and nothing is hit.
        return vec4(1,1,1,1);
    }

    void main() {
        vec3 rayD = unit(vec3(vScreenPos.x*3.0, vScreenPos.y*3.0, 5.0));
        rayD = ( uRotationMatrix * vec4(rayD.xyz,1.0) ).xyz;        
        vec3 rayP = uViewPosition.xyz;  //vec3(0.0, 0.0, 0.0);
        gl_FragColor = fireRay(rayD, rayP);
    }
    `;






    return defaultCode;
}















/* OLD CODE:
    const fsSourceHeader = `
    precision highp float;
    varying vec4 vScreenPos;

    uniform vec4 uViewPosition;
    uniform mat4 uRotationMatrix;
    uniform float uLightDistanceDivisor;

    `;
    const toUnitFunction = `
    vec3 unit(vec3 r)
    {
        float d = sqrt(r.x*r.x + r.y*r.y + r.z*r.z);
        if (d < 0.0) { d = -d;}
        r.x = r.x / d;
        r.y = r.y / d;
        r.z = r.z / d;
        return r;
    }
    `;
    const reflectRayFunction = `
    vec3 reflectRay(vec3 rayD, vec3 N)
    {
        //float d = (rayD.x*N.x + rayD.y*N.y + rayD.z*N.z)*2.0;
        float d = dot(rayD, N)*2.0;
        return unit( rayD - N*d );
    }
    `;
    const distToSphereFunction = `
    float distToSphere(vec3 rayD, vec3 rayP, vec3 sC, float sR)
    {
        float a = rayD.x*rayD.x + rayD.y*rayD.y + rayD.z*rayD.z;
        float b = 2.0 * (rayD.x * (rayP.x - sC.x) + rayD.y * (rayP.y - sC.y) + rayD.z * (rayP.z - sC.z));
        float c = (rayP.x-sC.x)*(rayP.x-sC.x) + (rayP.y-sC.y)*(rayP.y-sC.y) + (rayP.z-sC.z)*(rayP.z-sC.z) - sR*sR;
        float top = b*b - 4.0*a*c;

        if (top >= 0.001)
        {
            top = sqrt(top);
            float t1 = (-b-top)/(2.0*a);
            float t2 = (-b+top)/(2.0*a);
            if (t1 > 0.01 && (t1 < t2 || t2 < 0.01))
            {
                return t1;
            } else if (t2 > 0.01 && (t2 < t1 || t1 < 0.01))
            {
                return t2;
            }
        }
        return 100000.0;
    }
    `;
    const distToCubeFunction = `
    float distToCube(vec3 rayD, vec3 rayP, vec3 bC, float bR)
    {
        float d = distToPlane(rayD, rayP, bC + vec3(0,0,bR), vec3(0,0,1));
        if (d > 0.0 && d < 1000.0)
        {
            vec3 newRayP = rayP + rayD * d;
            if (newRayP.x < bC.x + bR   &&  newRayP.x > bC.x - bR 
                && newRayP.y < bC.y + bR   &&  newRayP.y > bC.y - bR)
            {
                return d;
            }
        }
        return 10000.0;
    }
    `;
    const distToPlaneFunction = `
    float distToPlane(vec3 rayD, vec3 rayP, vec3 pP, vec3 pN)
    {
        float t = dot(pP-rayP, pN) / dot(rayD, pN);
        if (t > 0.001)
        {
            return t;
        }
        return 10000.0;
    }
    `;
    const distToPointFunction = `
    float distToPoint(vec3 rayP, vec3 P)
    {
        vec3 x = P-rayP;
        return sqrt( dot(x,x) );
    }
    `;
    const mainFunction = `
    void main() {
        vec3 rayD = unit(vec3(vScreenPos.x*3.0, vScreenPos.y*3.0, 5.0));
        rayD = ( uRotationMatrix * vec4(rayD.xyz,1.0) ).xyz;        

        vec3 rayP = uViewPosition.xyz;  //vec3(0.0, 0.0, 0.0);
    
        gl_FragColor = fireRay(rayD, rayP);
    }
    `;
    const fireRayFunction = `

    vec4 fireRay(vec3 rayD, vec3 rayP)
    {
        vec4 color = vec4(0,0,0,1);
        float percentDone = 0.0;

        vec3 sC = vec3(0,0,4);
        float sR = 1.0;

        vec3 sC2 = vec3(1,2,5);
        float sR2 = 0.6;

        vec3 lC = vec3(4,0,8);

        bool leavingSphere = false;
        bool leavingSphere2 = false;

        float sD = 10000.0;
        float sD2 = 10000.0;
        float pD1 = 10000.0;
        float pD2 = 10000.0;
        float pD3 = 10000.0;
        float pD4 = 10000.0;
        float pD5 = 10000.0;


        for (int i=0; i<10; i++) {

            if (!leavingSphere) { sD = distToSphere(rayD, rayP, sC, sR); } else { sD = 10000.0; }
            //if (!leavingSphere) { sD = distToCube(rayD, rayP, sC, sR); } else { sD = 10000.0; }
            if (!leavingSphere2) { sD2 = distToSphere(rayD, rayP, sC2, sR2); } else { sD2 = 10000.0; }
            pD1 = distToPlane(rayD, rayP, vec3(0,  0,  10), vec3(0,0,1));
            pD2 = distToPlane(rayD, rayP, vec3(5,  0,  0), vec3(1,0,0));
            pD3 = distToPlane(rayD, rayP, vec3(-5, 0,  0), vec3(1,0,0));
            //pD4 = distToPlane(rayD, rayP, vec3(0,  5,  0), vec3(0,1,0));
            pD5 = distToPlane(rayD, rayP, vec3(0,  -5, 0), vec3(0,1,0));

            float m = min(min(min(sD, pD1), min(pD2, pD3)), min(pD4, pD5));
            m = min(m, sD2);


            if (m == sD)
            {
                rayP = rayP + rayD*m;
                rayD = reflectRay(unit(rayD), unit(sC-rayP));
                //rayD = reflectRay(rayD, vec3(0,0,1));
                
                float d2 = distToSphere(rayD, rayP, sC, sR);
                float d = distToPoint(rayP, lC);
                if (d2 > d)
                {
                    //color += (1.0-percentDone)*0.0*vec4(1,1,1,0);
                    //percentDone += (1.0-percentDone)*0.0;
                }
                leavingSphere = true;
            } else if (m == sD2)
            {
                rayP = rayP + rayD*m;
                rayD = reflectRay(rayD, unit(sC2-rayP) );

                leavingSphere2 = true;
            } else {
                leavingSphere = false;
                leavingSphere2 = false;

                vec3 newRayP = rayP + rayD*m;
                vec3 newRayD = unit( lC - newRayP);
                float d = distToPoint(newRayP, lC);
                float d2 = distToSphere(newRayD, newRayP, sC, sR);
                float d3 = distToSphere(newRayD, newRayP, sC2, sR2);
                if ((d2 < d && d2 > 0.0) || (d3 < d && d3 > 0.0)){
                    d = d*2.0;
                }

                d = d/uLightDistanceDivisor;

                if (m == pD1)
                {
                    return vec4(1.0/d,0,0,1)*(1.0-percentDone) + percentDone*color;
                }else if (m == pD2)
                {
                    return vec4(0,1.0/d,0,1)*(1.0-percentDone) + percentDone*color;
                }else if (m == pD3)
                {
                    rayP = rayP + m*rayD;
                    rayD = reflectRay(rayD, vec3(1,0,0));
                    color += (1.0-percentDone)*0.9*vec4(0,1.0/d,1.0/d,0);
                    percentDone += (1.0-percentDone)*0.9;
                    //return vec4(0,0.5/d,0.5/d,1)*(1.0-percentDone) + percentDone*color;
                }else if (m == pD4)
                {
                    return vec4(0.5/d,0.5/d,0,1)*(1.0-percentDone) + percentDone*color;
                }else if (m == pD5)
                {
                    rayP = rayP + m*rayD;
                    rayD = reflectRay(rayD, vec3(0,1,0));
                    color += (1.0-percentDone)*0.99*vec4(1.0/d,1.0/d,1.0/d,0);
                    percentDone += (1.0-percentDone)*0.99;
                    //return vec4(1.0/d,1.0/d,1.0/d,1)*(1.0-percentDone) + percentDone*color;
                }
            }


            if (percentDone > 0.95)
            {
                return color;
            }
            
        }

        //Return white if there's an issue and nothing is hit.
        return vec4(1,1,1,1);
    }
    `;

    //let fireRayFunction2 = generateShader();

    const fsSource  =  fsSourceHeader + toUnitFunction + reflectRayFunction + distToPlaneFunction + distToCubeFunction + distToPointFunction + distToSphereFunction +
    fireRayFunction + mainFunction;
*/