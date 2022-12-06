
const vsSource = `
attribute vec4 aVertexPosition;
attribute vec3 aColor;

//uniform mat4 uModelTranslationMatrix;
//uniform mat4 uProjectionMatrix;
//uniform mat4 uRotationMatrix;
uniform vec4 uColorVector;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uObjectMatrix;

varying highp vec3 color;

void main() {
    vec4 vPos = vec4(aVertexPosition.x, aVertexPosition.y, aVertexPosition.z, 1.0);
    gl_Position = uProjectionMatrix * uViewMatrix * uObjectMatrix * vPos;

    //vec3 lightColor = vec3(1,0.6,1);
    //normalVec = lightColor * max(dot(aNormalVectors, vec3(0.5,0.5,0.5)), 0.3);
    if (uColorVector.a == 0.0) {
        color = aColor;
    } else {
        color = uColorVector.xyz;
    }
}
`;
const fsSource = `
precision mediump float;
uniform vec4 uColorVector;

//varying vec3 normalVec;
varying vec3 color;

void main() {
    //gl_FragColor = vec4(normalVec.xyz*uColorVector.xyz, 1.0);
    gl_FragColor = vec4(color.x, color.y, color.z, 1.0);
    //gl_FragColor = vec4(1.0,0.0,0.0,1.0);
}
`;


function initShaderProgram(gl, vsSource, fsSource) {
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