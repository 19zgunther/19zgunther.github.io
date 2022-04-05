
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

function InitShader(gl)
{
    [defaultShaderProgram, defaultProgramInfo] =  initDefaultShaderProgram(gl);
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

    varying highp vec4 pos;
    //varying highp vec4 viewPosition;

    void main() {
        gl_Position = vec4(aVertexPosition.x, aVertexPosition.y, aVertexPosition.z, 1.0);
        pos = gl_Position;
        //viewPosition = uViewPosition;
    }
    `;


    const fsSourceHeader = `
    precision highp float;
    varying vec4 pos;
    //varying vec4 viewPosition;

    uniform vec4 uViewPosition;
    uniform vec4 uViewRotation;

    uniform mat4 uRotationMatrix;

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

    const fsSource  = 
    fsSourceHeader + toUnitFunction + reflectRayFunction + distToPlaneFunction + distToPointFunction + distToSphereFunction +
    `

    vec3 newRayP(vec3 rayD, vec3 rayP, float t)
    {
        return rayP + rayD*t;
    }


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

        float sD = 0.0;
        float sD2 = 0.0;
        float pD1 = 0.0;
        float pD2 = 0.0;
        float pD3 = 0.0;
        float pD4 = 0.0;
        float pD5 = 0.0;


        for (int i=0; i<10; i++) {

            if (!leavingSphere) { sD = distToSphere(rayD, rayP, sC, sR); } else { sD = 10000.0; }
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
                rayD = reflectRay(unit(rayD), unit(sC-rayP));
                
                
                /*float d2 = distToSphere(rayD, rayP, sC, sR);
                float d = distToPoint(rayP, lC);
                if (d2 < d)
                {
                    //color += (1.0-percentDone)*0.0*vec4(1,1,1,0);
                    //percentDone += (1.0-percentDone)*0.0;
                }*/
                leavingSphere = true;
            } else if (m == sD2)
            {
                rayP = rayP + rayD*m;
                rayD = reflectRay(rayD, unit(sC2-rayP));

                float d2 = distToSphere(rayD, rayP, sC2, sR2);
                float d = distToPoint(rayP, lC);

                if (d2 < d)
                {
                    //color += (1.0-percentDone)*0.5*vec4(1,1,1,0);
                    //percentDone += (1.0-percentDone)*0.5;
                }
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
                    color += (1.0-percentDone)*0.9*vec4(1.0/d,1.0/d,1.0/d,0);
                    percentDone += (1.0-percentDone)*0.9;
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

        vec3 rayD = unit(vec3(pos.x*3.0, pos.y*3.0, 5.0));
        rayD = ( uRotationMatrix * vec4(rayD.xyz,1.0) ).xyz;        

        vec3 rayP = uViewPosition.xyz;  //vec3(0.0, 0.0, 0.0);
    
        gl_FragColor = fireRay(rayD, rayP);
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
        },
        uniformLocations: {
            viewPosition: gl.getUniformLocation(shaderProgram, 'uViewPosition'),
            viewRotation: gl.getUniformLocation(shaderProgram, 'uViewRotation'),
            rotationMatrix: gl.getUniformLocation(shaderProgram, 'uRotationMatrix'),
        },
    };


    return [shaderProgram, programInfo]
}


const glCanvasElement = document.getElementById('glcanvas');
var gl;
var camPos = new vec4();
var camRot = new vec4(Math.PI/2,0,0);
var camRotMat = new mat4();
var pressedKeys = {};

setup();

const updateInterval = setInterval(update, 30);


function setup() {
    var min = Math.min(window.visualViewport.width, window.visualViewport.height);
    /*glCanvasElement.width = window.visualViewport.width;
    glCanvasElement.height = window.visualViewport.height;
    glCanvasElement.style.width = glCanvasElement.width + "px";
    glCanvasElement.style.height = glCanvasElement.height + 'px';*/
    glCanvasElement.width = min;
    glCanvasElement.height = min;
    glCanvasElement.style.width = min + "px";
    glCanvasElement.style.height = min + 'px';

    gl = glCanvasElement.getContext("webgl");
    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    } else {
        console.log("GL defined ")
    }

    InitShader(gl);
}

document.addEventListener('keydown', keyPressed);
document.addEventListener('keyup', keyReleased);

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


function update() {
    gl.clearColor(0.01, 0.01, 0.01, 1);    // Clear to black, fully opaque
    gl.clearDepth(1);                   // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    //gl.enable(gl.CULL_FACE);
    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);



    var vertices = [-1,1,0, 1,1,0, 1,-1,0, -1,-1,0];
    var indices = [0,1,2, 0,2,3];
    var buffers = initBuffers(vertices, null, null, indices);


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
    /*{
        const numComponents = 3  // pull out 3 values per iteration
        const type = gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 0;         // how many bytes to get from one set of values to the next
        const offset = 0;         // how many bytes inside the buffer to start from

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normals);
        gl.vertexAttribPointer(programInfo.attribLocations.normalLocation, numComponents, type, normalize, stride, offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.normalLocation);
    }*/
    /*{
        const numComponents = 4;  // pull out 4 values per iteration
        const type = gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 0;         // how many bytes to get from one set of values to the next
        const offset = 0;         // how many bytes inside the buffer to start from

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colors);
        gl.vertexAttribPointer(programInfo.attribLocations.colorLocation, numComponents, type, normalize, stride, offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.colorLocation);
    }*/

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    // Set the shader uniforms
    //gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix,  false, projectionMatrix.getFloat32Array());
    //gl.uniformMatrix4fv(programInfo.uniformLocations.viewMatrix, false, viewMatrix.getFloat32Array());
    //gl.uniformMatrix4fv(programInfo.uniformLocations.objectPositionMatrix, false, objectPositionMatrix.getFloat32Array());
    //gl.uniformMatrix4fv(programInfo.uniformLocations.objectRotationMatrix, false, objectRotationMatrix.getFloat32Array());
    gl.uniform4fv(programInfo.uniformLocations.viewPosition, camPos.getFloat32Array());

    gl.uniform4fv(programInfo.uniformLocations.viewRotation, camRot.getFloat32Array());
    gl.uniformMatrix4fv( programInfo.uniformLocations.rotationMatrix, false, camRotMat.getFloat32Array() );

    const vertexCount = indices.length;
    gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, 0);

}