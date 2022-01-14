


var defaultShaderProgram;
var defaultProgramInfo;

var gridShaderProgram;
var gridProgramInfo;

var textShaderProgram;
var textProgramInfo;


function InitShader(gl)
{
    [defaultShaderProgram, defaultProgramInfo] =  initDefaultShaderProgram(gl);
    [gridShaderProgram, gridProgramInfo] =  initGridShaderProgram(gl);
    [textShaderProgram, textProgramInfo] =  initTextShaderProgram(gl);
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

function initGridShaderProgram(gl)
{
    const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aNormalVector;
    attribute vec4 aColor;

    uniform mat4 uProjectionMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uObjectMatrix;
    uniform vec4 uScaleVector;

    varying highp vec4 color;

    void main() {
        vec4 vPos = vec4(aVertexPosition.x*uScaleVector.x, aVertexPosition.y*uScaleVector.y, aVertexPosition.z*uScaleVector.z, 1.0);
        gl_Position = uProjectionMatrix * uViewMatrix * uObjectMatrix * vPos;
        color = aNormalVector;
        color = aColor;
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
          scaleVector: gl.getUniformLocation(shaderProgram, 'uScaleVector'),
        },
    };

    return [shaderProgram, programInfo];
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

function DrawGrid(gl, projectionMatrix, viewMatrix, objectMatrix, scaleVector, indices, buffers, drawTriangles = true)
{
    var programInfo = gridProgramInfo;

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
    gl.uniform4fv(programInfo.uniformLocations.scaleVector, scaleVector.getFloat32Array());

    const vertexCount = indices.length;
    if (drawTriangles == true)
    {
        gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, 0);
    } else {
        gl.drawElements(gl.LINES, vertexCount, gl.UNSIGNED_SHORT, 0);
    }
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