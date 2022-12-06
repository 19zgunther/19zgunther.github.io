
{
const glCanvasElement = document.getElementById('glCanvas');
let shaderProgram = null;
let programInfo = null;

let gl = null;
let tick = 0;

setup();

let updateInterval = setInterval(update, 500);

function setup() {
    glCanvasElement.width = 500;
    glCanvasElement.height = 500;
    gl = glCanvasElement.getContext("webgl");

    [shaderProgram, programInfo] =  initReflectiveShaderProgram(gl);
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

    let vertices = [-1,1,0, 1,1,0, 1,-1,0, -1,-1,0];
    let indices = [0,1,2, 0,2,3];
    let buffers = initBuffers(gl, vertices, null, null, indices);

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

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    // Set the shader uniforms
    //gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix,  false, projectionMatrix.getFloat32Array());
    //gl.uniformMatrix4fv(programInfo.uniformLocations.viewMatrix, false, viewMatrix.getFloat32Array());
    //gl.uniformMatrix4fv(programInfo.uniformLocations.objectPositionMatrix, false, objectPositionMatrix.getFloat32Array());
    //gl.uniformMatrix4fv(programInfo.uniformLocations.objectRotationMatrix, false, objectRotationMatrix.getFloat32Array());
    //gl.uniform4fv(programInfo.uniformLocations.objectScaleVector, objectScaleVector.getFloat32Array());
    gl.uniform4fv(programInfo.uniformLocations.S1, (new vec4(0,0,5,1)).getFloat32Array() );
    gl.uniform4fv(programInfo.uniformLocations.S2, (new vec4(2,2,5,1)).getFloat32Array() );
    //gl.uniform4fv(programInfo.uniformLocations.S2, (new vec4(2,2,5,1)).getFloat32Array() );
    gl.uniform4fv(programInfo.uniformLocations.L1, (new vec4(-2,-2,5,1)).getFloat32Array() );

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}



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

function initReflectiveShaderProgram(gl) {
    const vsSource = `
    attribute vec4 aVertexPosition;

    varying highp vec4 pos;

    void main() {
        gl_Position = aVertexPosition;
        pos = gl_Position;
    }
    `;
    const fsSource = `
    precision highp float;

    uniform vec4 uS1;
    uniform vec4 uS2;
    uniform vec4 uP1;
    uniform vec4 uP2;
    uniform vec4 uL1;

    varying vec4 pos;

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
        return 1000000.0;
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

    vec3 unit(vec3 r)
    {
        float mag = sqrt(r.x*r.x + r.y*r.y + r.z*r.z);
        r.x = r.x/mag;
        r.y = r.y/mag;
        r.z = r.z/mag;
        return r;
    }

    float min(float n1, float n2, float n3)
    {
        if (n1 <= n2)
        {
            if (n3 < n1) 
            {return n3;} 
            return n1;
        } else {
            if (n3 < n2) {return n3;}
            return n2;
        }
    }


    void main() {

        gl_FragColor = vec4(0,0,0,1);

        
        vec3 rD = unit(pos.xyz + vec3(0,0,1));
        vec3 rP = vec4(0,0,0,0).xyz;

        float d1 = 0.0;
        float d2 = 0.0;
        float d3 = 0.0;
        float d4 = 0.0;
        float md = 0.0;


        float percentColored = 0.0;

        for (int i=0; i<3; i++) {

            d1 = distToSphere(rD, rP, uS1.xyz, uS1.a);
            d2 = distToSphere(rD, rP, uS2.xyz, uS2.a);


            if (d1 < d2 && d1 < 1000.0)
            { //ray hit uS1

                rP = rD*d1 + rP;
                rD = uS1.xyz - rP;
                gl_FragColor = vec4(rD.x, rD.y, rD.z, 1.0);

            } else if (d2 < d1 && d2 < 1000.0) 
            { //ray hit uS2
                rP = rD*d2 + rP;
                rD = uS2.xyz - rP;

                d1 = distToSphere(rD, rP, uS1.xyz, uS1.a);
                d2 = distToSphere(rD, rP, uS2.xyz, uS2.a);
                d3 = distToPoint(rP, uL1.xyz);

                if ( (d3 < d1 && (d1>0.1 || true)) && (d3 < d2 && (d2>0.1 || true)) )
                {
                    gl_FragColor += vec4(.5,.5,.5,0);
                }
            }

        }


        return;


        
        
        /*
        float c = dot(normal, vec4(0.4, 0.85, 0.4, 0) );
        if (c < 0.1) {c = 0.1;}
        gl_FragColor += color*vec4(c, c/2.0, 0, 0);


        c = dot(normal, vec4(-0.4, 0.85, 0.4, 0) );
        if (c < 0.1) {c = 0.1;}
        gl_FragColor += color*vec4(0, c/2.0, c, 0);


        float ret = distToSphere(unit(normal.xyz), pos.xyz, vec3(100,50,100), 20.0);
        if (ret > 0.0 && ret < 10000.0)
        {
            gl_FragColor += vec4(ret/50.0, ret/100.0, 0, 0);
        }


        ret = distToSphere(unit(normal.xyz), pos.xyz, vec3(-100,50,100), 20.0);
        if (ret > 0.0 && ret < 10000.0)
        {
            gl_FragColor += vec4(0, ret/100.0, ret/50.0, 0);
        }*/

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
          //normalLocation: gl.getAttribLocation(shaderProgram, 'aNormalVector'),
          //colorLocation: gl.getAttribLocation(shaderProgram, 'aColor'),
        },
        uniformLocations: {
          //projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
          //viewMatrix: gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
          //objectPositionMatrix: gl.getUniformLocation(shaderProgram, 'uObjectPositionMatrix'),
          //objectRotationMatrix: gl.getUniformLocation(shaderProgram, 'uObjectRotationMatrix'),
          //objectScaleVector: gl.getUniformLocation(shaderProgram, 'uObjectScaleVector'),

          S1: gl.getUniformLocation(shaderProgram, 'uS1'),
          S2: gl.getUniformLocation(shaderProgram, 'uS2'),
          P1: gl.getUniformLocation(shaderProgram, 'uP1'),
          P2: gl.getUniformLocation(shaderProgram, 'uP2'),
          L1: gl.getUniformLocation(shaderProgram, 'uL1'),
        },
    };


    return [shaderProgram, programInfo]
}



}