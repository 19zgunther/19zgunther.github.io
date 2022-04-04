


var defaultShaderProgram;
var defaultProgramInfo;

var gridShaderProgram;
var gridProgramInfo;

var textShaderProgram;
var textProgramInfo;

var bodyShaderProgram;
var bodyProgramInfo;

var lineShaderProgram;
var lineProgramInfo;




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

function updateBuffers(buffers = null, vertices = null, normals = null, colors = null, indices = null)
{
    if (buffers == null)
    {
        return initBuffers(vertices, normals, colors, indices);
    }    
    if (buffers[vertices] != null && buffers[vertices] != false && buffers[vertices] != -1 && vertices != null)
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertices);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    }
    if (buffers[normals] != null && buffers[normals] != false && buffers[normals] != -1 && normals != null)
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normals);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.DYNAMIC_DRAW);
    }
    if (buffers[colors] != null && buffers[colors] != false && buffers[colors] != -1 && colors != null)
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colors);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);
    }
    if (buffers[indices] != null && buffers[indices] != false && buffers[indices] != -1 && indices != null)
    {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.DYNAMIC_DRAW);
    }
    return buffers;
}

//Init shaders//////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
function InitShader(gl)
{
    [defaultShaderProgram, defaultProgramInfo] =  initDefaultShaderProgram(gl);
    [gridShaderProgram, gridProgramInfo] =  initGridShaderProgram(gl);
    [textShaderProgram, textProgramInfo] =  initTextShaderProgram(gl);
    [bodyShaderProgram, bodyProgramInfo] = initBodyShaderProgram(gl);
    [lineShaderProgram, lineProgramInfo] = initLineShaderProgram(gl);
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
    uniform mat4 uObjectMatrix;

    varying highp vec4 color;

    void main() {
        vec4 vPos = vec4(aVertexPosition.x, aVertexPosition.y, aVertexPosition.z, 1.0);
        gl_Position = uProjectionMatrix * uViewMatrix * uObjectMatrix * vPos;
        color = aNormalVector;
        color = aColor;
        //color = vec4(aColor.x*aNormalVector.x, aColor.y*aNormalVector.y, aColor.z*aNormalVector.z, aColor.a*aNormalVector.a);
        //color = vec3(0.5 * (aNormalVector.x/2.0+0.25), 0.5 * (aNormalVector.y/2.0+0.25), 0.5*(aNormalVector/2.0+0.25));
    }
    `;
    const fsSource = `
    precision mediump float;

    varying vec4 color;

    void main() {
        gl_FragColor = color;
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
          objectMatrix: gl.getUniformLocation(shaderProgram, 'uObjectMatrix'),
        },
    };


    return [shaderProgram, programInfo]
}

function initBodyShaderProgram(gl) {
    const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aNormalVector;
    attribute vec4 aColor;

    uniform mat4 uProjectionMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uObjectRotationMatrix;
    uniform mat4 uObjectTranslationMatrix;
    uniform vec4 uScaleVector;
    uniform vec4 uHighlightVector;

    varying highp vec4 color;

    void main() {
        vec4 vPos = vec4(uScaleVector.x*aVertexPosition.x, uScaleVector.y*aVertexPosition.y, uScaleVector.z*aVertexPosition.z, 1.0);
        gl_Position = uProjectionMatrix * uViewMatrix * uObjectTranslationMatrix * uObjectRotationMatrix * vPos;

        if (uHighlightVector.x < 0.1)
        {
            float ret = dot( uObjectRotationMatrix*aNormalVector, vec4(0.5, .7, .6, 0) );
            if (ret < 0.4)
            {
                ret = 0.4;
            }
            color = aColor * ret + aNormalVector * .02;
            color.a = 1.0;
        } else {
            color = uHighlightVector;
        }

        if (uHighlightVector.a > 0.01) {
            color.a = uHighlightVector.a;
        }
    }
    `;
    const fsSource = `
    precision mediump float;

    varying vec4 color;

    void main() {
        gl_FragColor = color;
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
          translationMatrix: gl.getUniformLocation(shaderProgram, 'uObjectTranslationMatrix'),
          rotationMatrix: gl.getUniformLocation(shaderProgram, 'uObjectRotationMatrix'),
          scaleVector: gl.getUniformLocation(shaderProgram, 'uScaleVector'),
          highlightVector: gl.getUniformLocation(shaderProgram, 'uHighlightVector')
        },
    };


    return [shaderProgram, programInfo];
}

function initGridShaderProgram(gl)
{
    const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aColor;

    uniform mat4 uProjectionMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uObjectMatrix;
    uniform vec4 uScaleVector;

    uniform vec4 uColorModVector;

    varying highp vec4 color;

    void main() {
        vec4 vPos = vec4(aVertexPosition.x*uScaleVector.x, aVertexPosition.y*uScaleVector.y, aVertexPosition.z*uScaleVector.z, 1.0);
        gl_Position = uProjectionMatrix * uViewMatrix * uObjectMatrix * vPos;
        color = aColor * uColorModVector;
    }
    `;
    const fsSource = `
    precision mediump float;
    
    varying vec4 color;

    void main() {
        gl_FragColor = color;
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
          colorLocation: gl.getAttribLocation(shaderProgram, 'aColor'),
        },
        uniformLocations: {
          projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
          viewMatrix: gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
          objectMatrix: gl.getUniformLocation(shaderProgram, 'uObjectMatrix'),
          scaleVector: gl.getUniformLocation(shaderProgram, 'uScaleVector'),
          colorModVector: gl.getUniformLocation(shaderProgram, 'uColorModVector'),
        },
    };

    return [shaderProgram, programInfo];
}

function initTextShaderProgram(gl) {
    const vsSource = `
    attribute vec4 aVertexPosition;

    uniform mat4 uProjectionMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uObjectMatrix;
    uniform vec4 uTextOffset;
    uniform vec4 uScaleVector;

    void main() {
        vec4 vPos = vec4(aVertexPosition.x + uTextOffset.x, aVertexPosition.y + uTextOffset.y, aVertexPosition.z + uTextOffset.z, 1.0) * uScaleVector;
        gl_Position = uProjectionMatrix * uViewMatrix * uObjectMatrix * vPos;
    }
    `;
    const fsSource = `
    precision mediump float;
    uniform vec4 uColorVector;
    void main() {
        gl_FragColor = uColorVector;
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
          projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
          viewMatrix: gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
          objectMatrix: gl.getUniformLocation(shaderProgram, 'uObjectMatrix'),
          colorVector: gl.getUniformLocation(shaderProgram, 'uColorVector'),
          scaleVector: gl.getUniformLocation(shaderProgram, 'uScaleVector'),
          textOffset: gl.getUniformLocation(shaderProgram, 'uTextOffset'),
        },
    };


    return [shaderProgram, programInfo]
}

//Unused at the moment
function initTextureShaderProgram(gl) {
    const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoords;

    uniform mat4 uProjectionMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uObjectMatrix;

    varying highp vec2 texCoord;

    void main() {
        vec4 vPos = vec4(aVertexPosition.x, aVertexPosition.y, aVertexPosition.z, 1.0);
        gl_Position = uProjectionMatrix * uViewMatrix * uObjectMatrix * vPos;
        texCoord = aTextureCoords;
    }
    `;
    const fsSource = `
    precision mediump float;

    varying vec2 texCoord;

    uniform sampler2D uSampler;
    uniform vec4 uColor;

    void main() {
        //gl_FragColor = texture2D(uSampler, texCoord);

        if (texture2D(uSampler, texCoord).x > 0.5)
        {
            gl_FragColor = uColor;
        } else {
            return;
            ///gl_FragColor = vec4(0,0,0,0);   
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
          textureCoordsLocation: gl.getAttribLocation(shaderProgram, 'aTextureCoords'),
        },
        uniformLocations: {
          projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
          viewMatrix: gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
          objectMatrix: gl.getUniformLocation(shaderProgram, 'uObjectMatrix'),
          uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
          colorVector: gl.getUniformLocation(shaderProgram, 'uColor'),
        },
    };


    return [shaderProgram, programInfo]
}

function initLineShaderProgram(gl) {
    const vsSource = `
    attribute vec4 aVertexPosition;

    uniform mat4 uProjectionMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uObjectRotationMatrix;
    uniform mat4 uObjectTranslationMatrix;
    uniform vec4 uScaleVector;
    uniform vec4 uColorVector;

    varying highp vec4 color;

    void main() {
        vec4 vPos = vec4(uScaleVector.x*aVertexPosition.x, uScaleVector.y*aVertexPosition.y, uScaleVector.z*aVertexPosition.z, 1.0);
        gl_Position = uProjectionMatrix * uViewMatrix * uObjectTranslationMatrix * uObjectRotationMatrix * vPos;
        color = uColorVector;
    }
    `;
    const fsSource = `
    precision mediump float;

    varying vec4 color;
    void main() {
        gl_FragColor = color;
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
          projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
          viewMatrix: gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
          translationMatrix: gl.getUniformLocation(shaderProgram, 'uObjectTranslationMatrix'),
          rotationMatrix: gl.getUniformLocation(shaderProgram, 'uObjectRotationMatrix'),
          scaleVector: gl.getUniformLocation(shaderProgram, 'uScaleVector'),
          colorVector: gl.getUniformLocation(shaderProgram, 'uColorVector')
        },
    };


    return [shaderProgram, programInfo]
}






//Render & Drawing //////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

//Used for rendering tringles or lines
function DrawDefault(gl, projectionMatrix, viewMatrix, objectMatrix, indices, buffers, drawTriangles = true)
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
    gl.uniformMatrix4fv(programInfo.uniformLocations.objectMatrix, false, objectMatrix.getFloat32Array());


    const vertexCount = indices.length;
    if (drawTriangles == true)
    {
        gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, 0);
    } else {
        gl.drawElements(gl.LINES, vertexCount, gl.UNSIGNED_SHORT, 0);
    }
}

function DrawGrid(gl, projectionMatrix, viewMatrix, objectMatrix, indices, buffers, scaleVector = new vec4(1,1,1,1), colorModVector = new vec4(1,1,1,1))
{
    var programInfo = gridProgramInfo;

    // Tell WebGL to use our program when drawing
    gl.useProgram(programInfo.program);


    //Enable Vertices
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

    //Enable Colors 
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
    gl.uniformMatrix4fv(programInfo.uniformLocations.objectMatrix, false, objectMatrix.getFloat32Array());
    gl.uniform4fv(programInfo.uniformLocations.scaleVector, scaleVector.getFloat32Array());
    gl.uniform4fv(programInfo.uniformLocations.colorModVector, colorModVector.getFloat32Array());

    const vertexCount = indices.length;
    gl.drawElements(gl.LINES, vertexCount, gl.UNSIGNED_SHORT, 0);
}

//Unused at the moment
function DrawTexture(gl, projectionMatrix, viewMatrix, objectMatrix, indices, buffers, color = new vec4(1,100,0,1))
{
    var programInfo = textProgramInfo;

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
    // tell webgl how to pull out the texture coordinates from buffer
    {
        const num = 2; // every coordinate composed of 2 values
        const type = gl.FLOAT; // the data in the buffer is 32 bit float
        const normalize = false; // don't normalize
        const stride = 0; // how many bytes to get from one set to the next
        const offset = 0; // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoords);
        gl.vertexAttribPointer(programInfo.attribLocations.textureCoordsLocation, num, type, normalize, stride, offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.textureCoordsLocation);
    }

    // Tell WebGL we want to affect texture unit 0
    gl.activeTexture(gl.TEXTURE0);

    // Bind the texture to texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, buffers.texture);

    // Tell the shader we bound the texture to texture unit 0
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);


    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    gl.getExtension('EXT_frag_depth');

    // Set the shader uniforms
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix,  false, projectionMatrix.getFloat32Array());
    gl.uniformMatrix4fv(programInfo.uniformLocations.viewMatrix, false, viewMatrix.getFloat32Array());
    gl.uniformMatrix4fv(programInfo.uniformLocations.objectMatrix, false, objectMatrix.getFloat32Array());
    gl.uniform4fv(programInfo.uniformLocations.colorVector, color.getFloat32Array());

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

function DrawText(gl, projectionMatrix, viewMatrix, objectMatrix, buffers, textColor = new vec4(255,0,0,255), text = "default_text", textScale = new vec4(1,1,1,1), spacing = 0.1)
{
    var programInfo = textProgramInfo;

    // Tell WebGL to use our program when drawing
    gl.useProgram(programInfo.program);

    
    //Bind Vertices
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

    // Set the shader uniforms
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix,  false, projectionMatrix.getFloat32Array());
    gl.uniformMatrix4fv(programInfo.uniformLocations.viewMatrix, false, viewMatrix.getFloat32Array());
    gl.uniformMatrix4fv(programInfo.uniformLocations.objectMatrix, false, objectMatrix.getFloat32Array());
    gl.uniform4fv(programInfo.uniformLocations.colorVector, textColor.getFloat32Array());
    gl.uniform4fv(programInfo.uniformLocations.scaleVector, textScale.getFloat32Array());

    //For each letter...
    var xpos = 0;
    for (var i=0; i<text.length; i++)
    {
        var letter = text[i];
        var ascii = letter.charCodeAt(0);

        const indices = asciiIndices[ascii];

        //Bind Indices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.DYNAMIC_DRAW);
        
        //Set Position (move over a 0.5)
        gl.uniform4fv(programInfo.uniformLocations.textOffset, ( new vec4(xpos,0,0,0) ).getFloat32Array());

        if (indices == null) { console.error("Cannot find ascii char - code: " + ascii); continue;}
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

        xpos += asciiWidths[ascii] + spacing;
    }
}

function DrawBakedText(gl, projectionMatrix, viewMatrix, objectMatrix, buffers, indices, textColor = new vec4(255,0,0,255), textScale = new vec4(1,1,1,1))
{
    var programInfo = textProgramInfo;

    // Tell WebGL to use our program when drawing
    gl.useProgram(programInfo.program);

    
    //Bind Vertices
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

    // Set the shader uniforms
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix,  false, projectionMatrix.getFloat32Array());
    gl.uniformMatrix4fv(programInfo.uniformLocations.viewMatrix, false, viewMatrix.getFloat32Array());
    gl.uniformMatrix4fv(programInfo.uniformLocations.objectMatrix, false, objectMatrix.getFloat32Array());
    gl.uniform4fv(programInfo.uniformLocations.colorVector, textColor.getFloat32Array());
    gl.uniform4fv(programInfo.uniformLocations.scaleVector, textScale.getFloat32Array());



    //Bind Indices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    
}


function DrawBody(gl, projectionMatrix, viewMatrix, translationMatrix, rotationMatrix, scaleVector, indices, buffers, highlightVector = new vec4())
{
    var programInfo = bodyProgramInfo;

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
    gl.uniformMatrix4fv(programInfo.uniformLocations.translationMatrix, false, translationMatrix.getFloat32Array());
    gl.uniformMatrix4fv(programInfo.uniformLocations.rotationMatrix, false, rotationMatrix.getFloat32Array());
    gl.uniform4fv(programInfo.uniformLocations.scaleVector, scaleVector.getFloat32Array());
    
    gl.uniform4fv(programInfo.uniformLocations.highlightVector, highlightVector.getFloat32Array());

    //gl.drawElements(gl.LINES, indices.length, gl.UNSIGNED_SHORT, 0);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

function DrawLine(gl, projectionMatrix, viewMatrix, translationMatrix, rotationMatrix, scaleVector, indices, buffers, colorVector = new vec4(0,0,0,1))
{
    var programInfo = lineProgramInfo;

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
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix,  false, projectionMatrix.getFloat32Array());
    gl.uniformMatrix4fv(programInfo.uniformLocations.viewMatrix, false, viewMatrix.getFloat32Array());
    gl.uniformMatrix4fv(programInfo.uniformLocations.translationMatrix, false, translationMatrix.getFloat32Array());
    gl.uniformMatrix4fv(programInfo.uniformLocations.rotationMatrix, false, rotationMatrix.getFloat32Array());
    gl.uniform4fv(programInfo.uniformLocations.scaleVector, scaleVector.getFloat32Array());
    gl.uniform4fv(programInfo.uniformLocations.colorVector, colorVector.getFloat32Array());

    //gl.drawElements(gl.LINES, indices.length, gl.UNSIGNED_SHORT, 0);
    gl.drawElements(gl.LINES, indices.length, gl.UNSIGNED_SHORT, 0);
}


