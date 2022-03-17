
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
    varying highp vec4 viewPosition;

    void main() {
        gl_Position = vec4(aVertexPosition.x, aVertexPosition.y, aVertexPosition.z, 1.0);
        pos = gl_Position;
        viewPosition = uViewPosition;
    }
    `;


    const fsSourceHeader = `
    precision highp float;
    varying vec4 pos;
    varying vec4 viewPosition;
    `;


    const toUnitFunction = `
    vec3 unit(vec3 r)
    {
        float d = sqrt(r.x*r.x + r.y*r.y + r.z+r.z);
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

        vec3 lC = vec3(4,0,8);

        bool leavingSphere = false;

        for (int i=0; i<10; i++) {
            float sD = 10000.0;
            if (!leavingSphere) { sD = distToSphere(rayD, rayP, sC, sR); }
            float pD1 = distToPlane(rayD, rayP, vec3(0,  0,  10), vec3(0,0,1));
            float pD2 = distToPlane(rayD, rayP, vec3(5,  0,  0), vec3(1,0,0));
            float pD3 = distToPlane(rayD, rayP, vec3(-5, 0,  0), vec3(1,0,0));
            float pD4 = distToPlane(rayD, rayP, vec3(0,  5,  0), vec3(0,1,0));
            float pD5 = distToPlane(rayD, rayP, vec3(0,  -5, 0), vec3(0,1,0));

            float m = min(min(min(sD, pD1), min(pD2, pD3)), min(pD4, pD5));

            if (m == sD)
            {
                rayP = rayP + rayD*m;
                rayD = reflectRay(rayD, unit(sC-rayP));

                float d2 = distToSphere(rayD, rayP, sC, sR);
                float d = distToPoint(rayP, lC);

                if (d2 < d)
                {
                    color += (1.0-percentDone)*0.3*vec4(1,1,1,0);
                    percentDone += (1.0-percentDone)*0.3;
                }


                leavingSphere = true;
            } else {
                leavingSphere = false;
                vec3 newRayP = rayP + rayD*m;
                vec3 newRayD = unit( lC - newRayP);
                float d = distToPoint(newRayP, lC);

                float d2 = distToSphere(newRayD, newRayP, sC, sR);

                if ( d2 < d && d2 > 0.0) {
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
                    return vec4(0,0.5/d,0.5/d,1)*(1.0-percentDone) + percentDone*color;
                }else if (m == pD4)
                {
                    return vec4(0.5/d,0.5/d,0,1)*(1.0-percentDone) + percentDone*color;
                }else if (m == pD5)
                {
                    return vec4(1.0/d,1.0/d,1.0/d,1)*(1.0-percentDone) + percentDone*color;
                }
            }
            
        }

        return vec4(0,0,0,1);

    }



    void main() {

        vec3 rayD = unit(vec3(pos.x*2.0, pos.y*2.0, 1.0));
        vec3 rayP = vec3(0.0, 0.0, 0.0);

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
        },
    };


    return [shaderProgram, programInfo]
}


const glCanvasElement = document.getElementById('glcanvas');


var gl;

setup();

const updateInterval = setInterval(update, 500);


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
    gl.uniformMatrix4fv(programInfo.uniformLocations.viewPosition, false, new vec4().getFloat32Array())

    const vertexCount = indices.length;
    gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, 0);

}