/*
//uniform mat4 uModelTranslationMatrix;
//uniform mat4 uProjectionMatrix;
//uniform mat4 uRotationMatrix;
//uniform vec4 uColorVector;



PrjM * ViewM * ObjMat = Screen_Pos

Screen_Pos * ( PrjM * VieM ) ^-1 = ObjMat

*/
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


function initShaderProgram(gl) {
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
    return shaderProgram;
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


