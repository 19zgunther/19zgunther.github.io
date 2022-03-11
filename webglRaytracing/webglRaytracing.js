
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
    //attribute vec4 aNormalVector;
    attribute vec4 aColor;

    //uniform mat4 uProjectionMatrix;
    //uniform mat4 uViewMatrix;
    //uniform mat4 uObjectPositionMatrix;
    //uniform mat4 uObjectRotationMatrix;

    varying highp vec4 color;
    varying highp vec4 pos;

    void main() {
        //vec4 vPos = vec4(aVertexPosition.x, aVertexPosition.y, aVertexPosition.z, 1.0);
        //gl_Position = uProjectionMatrix * uViewMatrix * uObjectPositionMatrix * uObjectRotationMatrix * vPos;
        //color = aNormalVector;

        color = aColor;
        gl_Position = vec4(aVertexPosition.x, aVertexPosition.y, aVertexPosition.z, 1.0);


        pos = gl_Position;

        //float vari = dot(vec4( 0.7, 0.2, 0.8, 0), uObjectRotationMatrix* aNormalVector);
        //vari += 0.01;
        //if (vari < 0.1)
        //{
        //    vari = 0.1;
        //}

        //color.x = aColor.x * vari;
        //color.y = aColor.y * vari;
        //color.z = aColor.z * vari;
        //color.a = 1.0;
        //color = vec4(aColor.x*aNormalVector.x, aColor.y*aNormalVector.y, aColor.z*aNormalVector.z, aColor.a*aNormalVector.a);
        //color = vec3(0.5 * (aNormalVector.x/2.0+0.25), 0.5 * (aNormalVector.y/2.0+0.25), 0.5*(aNormalVector/2.0+0.25));
    }
    `;
    const fsSource = `
    precision mediump float;

    varying vec4 color;
    varying vec4 pos;
    /*
    vec4 rayToSphere(vec4 rayD, vec4 rayP, vec4 C, float radius)
    {
        float a = rayD.x*rayD.x + rayD.y*rayD.y + rayD.z*rayD.z;
        float b = 2.0 * (rayD.x * (rayP.x - C.x) + rayD.y * (rayP.y - C.y) + rayD.z * (rayP.z - C.z));
        float c = (rayP.x-C.x)*(rayP.x-C.x) + (rayP.y-C.y)*(rayP.y-C.y) + (rayP.z-C.z)*(rayP.z-C.z) - radius*radius;
        
        float top = b*b-4.0*a*c;
        if (top < 0.0)
        {
            return vec4(0,0,0,-1);
        }
        float s1 = (b+sqrt(top))/(2.0*a);
        float s2 = (b-sqrt(top))/(2.0*a);

        return vec4(0,0,0,1);
    }*/

    vec4 unit(vec4 r)
    {
        float d = sqrt(r.x*r.x + r.y*r.y + r.z+r.z + r.a*r.a);
        r.x = r.x / d;
        r.y = r.y / d;
        r.z = r.z / d;
        r.a = r.a / d;
        return r;
    }

    vec4 reflectRay(vec4 rayD, vec4 N)
    {
        float d = (rayD.x*N.x + rayD.y*N.y + rayD.z*N.z)*2.0;
        return unit(vec4(  rayD.x-N.x*d, rayD.y-N.y*d, rayD.z-N.z*d , 0.0));
    }


    void main() {

        vec4 rayD = vec4(pos.x, pos.y, 1.0, 0.0);
        vec4 rayP = vec4(0.0, 0.0, 0.0, 0.0);
        vec4 C = vec4(0.0, 0.0, 5.0, 0.0);
        float radius = 1.0;

        vec4 P = vec4(0.0, 0.0, 8.0, 0.0);
        vec4 Pn = vec4(0.0, 0.0, -1.0, 0.0);

        vec4 P2 = vec4(8.0, 0.0, 8.0, 0.0);
        vec4 P2n = vec4(-1.0, 0, 0.0, 0.0);
        
        float a = 0.0;
        float b = 0.0;
        float c = 0.0;
        float top = 0.0;

        for(int i=0; i<10; i++) {

            a = rayD.x*rayD.x + rayD.y*rayD.y + rayD.z*rayD.z;
            b = 2.0 * (rayD.x * (rayP.x - C.x) + rayD.y * (rayP.y - C.y) + rayD.z * (rayP.z - C.z));
            c = (rayP.x-C.x)*(rayP.x-C.x) + (rayP.y-C.y)*(rayP.y-C.y) + (rayP.z-C.z)*(rayP.z-C.z) - radius*radius;

            top = b*b - 4.0*a*c;

            if (top > 0.0)
            {
                float s1 = (-b+sqrt(top))/(2.0*a);
                float s2 = (-b-sqrt(top))/(2.0*a);
                if (s1 < s2 && s1 > 0.0)
                {
                    rayP = vec4( rayP.x + rayD.x*s1,  rayP.y + rayD.y*s1,  rayP.z+rayD.z*s1, 1.0);
                    rayD = reflectRay(rayD, unit(vec4(C.x-rayP.x, C.y-rayP.y, C.z-rayP.z, 0.0)));
                    gl_FragColor = vec4(0,1,1,0);
                    continue;
                } else if (s2 < s1 && s2 > 0.0) {
                    rayP = vec4( rayP.x + rayD.x*s2,  rayP.y + rayD.y*s2,  rayP.z+rayD.z*s2, 1.0);
                    rayD = reflectRay(rayD, unit(C-rayP));
                    gl_FragColor = vec4(0,1,0,0);
                    continue;
                }
            }

            
            float d1 = dot((P - rayP), Pn) / dot(rayD, Pn);
            float d2 = dot((P2 - rayP), P2n) / dot(rayD, P2n);
            if (d1 > 0.01)
            {
                gl_FragColor = vec4(1.0/top,0,0,1);
                //return;
            }
            
            if (d2 > 0.01)
            {
                gl_FragColor = vec4(0,0,1.0/top,1);
                return;
            }
        }
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

function DrawDefault(gl, projectionMatrix, viewMatrix, objectPositionMatrix, objectRotationMatrix, indices, buffers, drawTriangles = true)
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
    var colors = [0,1,0,1, 1,0,0,1, 0,0,1,1, 1,1,1,1];

    var buffers = initBuffers(vertices, null, colors, indices);


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
    //gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix,  false, projectionMatrix.getFloat32Array());
    //gl.uniformMatrix4fv(programInfo.uniformLocations.viewMatrix, false, viewMatrix.getFloat32Array());
    //gl.uniformMatrix4fv(programInfo.uniformLocations.objectPositionMatrix, false, objectPositionMatrix.getFloat32Array());
    //gl.uniformMatrix4fv(programInfo.uniformLocations.objectRotationMatrix, false, objectRotationMatrix.getFloat32Array());

    const vertexCount = indices.length;
    gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, 0);

}