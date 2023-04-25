

function vec3ArrayToNumberArray(array)
{
    if (array[0] instanceof vec4)
    {
        let temp = [];
        for (let i=0; i<array.length; i++)
        {
            temp.push(array[i].x, array[i].y, array[i].z);
        }
        return temp;
    }
    return array;
}
function vec4ArrayToNumberArray(array)
{
    if (array[0] instanceof vec4)
    {
        let temp = [];
        for (let i=0; i<array.length; i++)
        {
            temp.push(array[i].x, array[i].y, array[i].z, array[i].a);
        }
        return temp;
    }
    return array;
}

function initShader(gl)//initialize the default shader
{
    function _loadShader(gl, type, source)//helper function used by _initShader() and _initPickerShader()
    {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        // See if it compiled successfully
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }
    let vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aNormalVector;
    attribute vec4 aColorVector;
    attribute vec4 aMaterialVector;

    uniform mat4 uCameraMatrix;
    uniform mat4 uObjectMatrix;
    uniform mat4 uObjectRotationMatrix;

    varying highp vec3 worldPos;
    varying highp vec3 modelPos;
    varying highp vec3 glPos;
    varying highp vec3 surfaceNormal;
    varying highp vec4 surfaceColor;
    varying highp vec4 surfaceMaterial;

    void main() {
        //Compute Model & WorldVertex Position
        vec4 vPos = uObjectMatrix * vec4(aVertexPosition.xyz, 1.0);
        modelPos = aVertexPosition.xyz;
        worldPos = vPos.xyz;

        //Compute Position relative to camera
        gl_Position = uCameraMatrix * vPos;
        glPos = (uCameraMatrix * vPos).xyz;
        
        //Compute triangle lighting, and scale color accordingly
        surfaceNormal = (uObjectRotationMatrix * aNormalVector).xyz;

        surfaceMaterial = aMaterialVector;
        surfaceColor = aColorVector;
    }`;
    const noiseFunctions = `
    // 2D Random
    float random (vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    // 3D Random
    float random (vec3 st) {
        return fract(sin(dot(st.xyz, vec3(12.9898,78.233,30.5489))) * 43758.5453123);
    }

    float noise (vec3 p) {
        vec3 corner = floor(p);
        vec3 f = fract(p);

        //Compute Corner Random Values
        float c000 = random(corner);
        float c100 = random(corner + vec3(1,0,0));
        float c110 = random(corner + vec3(1,1,0));
        float c010 = random(corner + vec3(0,1,0));
        float c001 = random(corner + vec3(0,0,1));
        float c101 = random(corner + vec3(1,0,1));
        float c111 = random(corner + vec3(1,1,1));
        float c011 = random(corner + vec3(0,1,1));

        //Interpolate to find 'p' position, and return value
        float c00 = c000*(1.0 - f.x) + c100*f.x;
        float c01 = c001*(1.0 - f.x) + c101*f.x;
        float c10 = c010*(1.0 - f.x) + c110*f.x;
        float c11 = c011*(1.0 - f.x) + c111*f.x;
        float c0 = c00*(1.0 - f.y) + c10*f.y;
        float c1 = c01*(1.0 - f.y) + c11*f.y;
        return c0*(1.0-f.z) + c1*f.z;
    }

    vec3 noise3d(vec3 p)
    {
        return vec3(noise(p), noise(p + 100.0), noise(p + 200.0));
    }


    vec3 modify(vec3 vector, vec4 modifier, vec4 noiseOffsetMultiplier, vec4 frequencies)
    {
        if (modifier.x > 0.01)
        {
            vector *= (1.0 - modifier.x) + modifier.x * noise3d(modelPos*frequencies.x + noiseOffsetMultiplier.x*noise(modelPos*frequencies.x));
        }
        if (modifier.y > 0.01)
        {
            vector *= (1.0 - modifier.y) + modifier.y * noise3d(modelPos*frequencies.y + noiseOffsetMultiplier.y*noise(modelPos*frequencies.y));
        }
        if (modifier.z > 0.01)
        {
            vector *= (1.0 - modifier.z) + modifier.z * noise3d(modelPos*frequencies.z + noiseOffsetMultiplier.z*noise(modelPos*frequencies.z));
        }
        if (modifier.a > 0.01)
        {
            vector *= (1.0 - modifier.a) + modifier.a * noise3d(modelPos*frequencies.a + noiseOffsetMultiplier.a*noise(modelPos*frequencies.a));
        }
        return vector;
    }


    //Marble/Stone like - use 3.0 as baseFreq
    float compoundNoise7(vec3 p, float baseFreq)
    {
        float sum = 0.0;
        float freq = baseFreq;
        float offset = 0.0;
        for (int i=0; i<7; i++)
        {
            sum += noise(p*freq + 10.0*offset);
            offset += fract(sum);
            freq *= 1.7;
        }
        return sum / 7.0;
    }

    //Camo Pattern
    float compoundNoise7_2(vec3 p, float baseFreq)
    {
        float sum = 0.0;
        float freq = baseFreq;
        float offset = 0.0;
        for (int i=0; i<10; i++)
        {
            float temp = noise(p*freq + 1.0*offset);
            if (temp > 0.5)
            {
                sum += temp;
                offset += fract(sum);
                freq *= 1.4;
            }
        }
        return sum / 10.0;
    }

    //Camo Pattern
    float compoundNoise7_3(vec3 p)
    {
        float freq = 3.0;

        float sum = 0.0;
        float offset = 0.0;
        for (int i=0; i<3; i++)
        {
            float temp = noise(p*freq + 1.0*offset);
            if (temp > 0.5)
            {
                sum += temp;
                offset += fract(sum);
            }
            freq *= 1.7;
        }
        return sum / 3.0;
    }


    float compoundNoise7_4(vec3 p)
    {
        vec3 corner = floor(p);
        vec3 f = fract(p);

        float radius = 0.5;
        float threshold = 0.8;

        float d;
        float r;

        d = distance(f, vec3(0,0,0));
        r = random(corner);
        if (d < radius)
        { if (r > threshold) { return d / radius; } return 0.0; }

        d = distance(f, vec3(1,0,0));
        r = random(corner + vec3(1,0,0));
        if (d < radius)
        { if (r > threshold) { return d / radius; } return 0.0; }

        d = distance(f, vec3(1,1,0));
        r = random(corner + vec3(1,1,0));
        if (d < radius)
        { if (r > threshold) { return d / radius; } return 0.0; }

        d = distance(f, vec3(0,1,0));
        r = random(corner + vec3(0,1,0));
        if (d < radius)
        { if (r > threshold) { return d / radius; } return 0.0; }

        


        d = distance(f, vec3(0,0,1));
        r = random(corner + vec3(0,0,1));
        if (d < radius)
        { if (r > threshold) { return d / radius; } return 0.0; }

        d = distance(f, vec3(1,0,1));
        r = random(corner + vec3(1,0,1));
        if (d < radius)
        { if (r > threshold) { return d / radius; } return 0.0; }

        d = distance(f, vec3(1,1,1));
        r = random(corner + vec3(1,1,1));
        if (d < radius)
        { if (r > threshold) { return d / radius; } return 0.0; }

        d = distance(f, vec3(0,1,1));
        r = random(corner + vec3(0,1,1));
        if (d < radius)
        { if (r > threshold) { return d / radius; } return 0.0; }

        return 0.0;
    }
    `;
    const fsSource = `
    precision highp float;

    varying vec3 worldPos;
    varying vec3 modelPos;
    varying vec3 glPos;
    varying vec3 surfaceNormal;
    varying vec4 surfaceColor;
    varying vec4 surfaceMaterial;

    uniform vec4 uLightDirectionVector;
    uniform float uAmbientLightLevel;
    uniform vec4 uCameraPositionVector;

    uniform vec4 uColorModifierVector;
    uniform vec4 uColorNoiseOffsetVector;
    uniform vec4 uNormalModifierVector;
    uniform vec4 uNormalNoiseOffsetVector;

    uniform sampler2D uSampler;

    uniform float uTimeFloat;


    `+noiseFunctions+`


    void main() {

        vec3 normal = surfaceNormal;
        vec3 color = surfaceColor.xyz;
        float opacity = surfaceColor.a;
        normal = normalize(normal);

        if (surfaceMaterial.a > 0.001) {
            float d = dot(normalize(worldPos.xyz - uCameraPositionVector.xyz), normal);
            if (d < 0.0)
            {
                d = 0.0;
            }
            d = sin(d*3.141592)*0.9 + 0.1;
            if (d > 0.0)
            {
                opacity *= d;
            }


            float n = 0.6*noise(modelPos*2.0 + 0.1*uTimeFloat) 
                + 0.2*noise(modelPos*5.0 + 0.1*uTimeFloat) 
                + 0.2*noise(modelPos*10.0 + 3.0*noise(modelPos*10.0) + 0.1*uTimeFloat)
                + 0.1*noise(modelPos*50.0 + 3.0*noise(modelPos*50.0) + 0.1*uTimeFloat)
                ;
            n = n - 0.65;
            if (n > 0.0)
            {
                n *= 5.0;
                if (n > 1.0) { n=1.0;}
                opacity += n * surfaceMaterial.z;
            }
        }
        
        //Compute fragment illumination
        gl_FragColor = vec4(color, opacity);
        return;
    }
    `;
    const vertexShader = _loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = _loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexLocation: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            normalLocation: gl.getAttribLocation(shaderProgram, 'aNormalVector'),
            colorLocation: gl.getAttribLocation(shaderProgram, 'aColorVector'),
            materialLocation: gl.getAttribLocation(shaderProgram, 'aMaterialVector'),
        },
        uniformLocations: {
            cameraMatrix: gl.getUniformLocation(shaderProgram, 'uCameraMatrix'),
            objectMatrix: gl.getUniformLocation(shaderProgram, 'uObjectMatrix'),
            objectRotationMatrix: gl.getUniformLocation(shaderProgram, 'uObjectRotationMatrix'),
            lightDirectionVector: gl.getUniformLocation(shaderProgram, 'uLightDirectionVector'),
            ambientLightLevelFloat: gl.getUniformLocation(shaderProgram, 'uAmbientLightLevel'),
            cameraPositionVector: gl.getUniformLocation(shaderProgram, 'uCameraPositionVector'),

            colorModifierVector: gl.getUniformLocation(shaderProgram, 'uColorModifierVector'),
            colorNoiseOffsetVector: gl.getUniformLocation(shaderProgram, 'uColorNoiseOffsetVector'),
            normalModifierVector: gl.getUniformLocation(shaderProgram, 'uNormalModifierVector'),
            normalNoiseOffsetVector: gl.getUniformLocation(shaderProgram, 'uNormalNoiseOffsetVector'),

            textureSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),

            timeFloat: gl.getUniformLocation(shaderProgram, 'uTimeFloat')
        },
    };
    return {
        shaderProgram: shaderProgram,
        programInfo: programInfo,
    }
}
function clear(gl, clearColor = null) //Clear the screen to default color
{
    if (!(clearColor instanceof vec4)) { clearColor = new vec4(1,0,0,1); }

    // Clear the canvas before we start drawing on it.
    gl.clearColor(clearColor.x, clearColor.y, clearColor.z, clearColor.a);
    gl.clearDepth(1);                   // Clear everything

    //Enable depth testing & blending
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.enable(gl.BLEND);
    gl.depthMask(true);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    gl.enable(gl.CULL_FACE);
    // if (renderReverseFaces == true) { gl.disable(gl.CULL_FACE);
    // } else {                                gl.enable(gl.CULL_FACE); }
    
    //Clearing color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //Set Viewport
    gl.viewport(0, 0, canvasElement.width, canvasElement.height);
}
function renderObject(gl, programInfo, projectionMatrix=new mat4(), cameraPosition=new vec4(), cameraRotation=new vec4(),
    objectPosition=new vec4(), objectRotation=new vec4(), objectScale=new vec4(1,1,1,1), verticesBuffer, normalsBuffer, colorsBuffer, materialsBuffer, indicesBuffer, numIndices=0,
    lightingDirection=new vec4(0.7,0.7,0.1), ambientLightLevel=0.1
)
{
    if (projectionMatrix== null) {projectionMatrix  =new mat4().makePerspective(1,1,1,1000);}
    if (cameraPosition  == null) {cameraPosition    =new vec4();}
    if (cameraRotation  == null) {cameraRotation    =new vec4();}
    if (objectPosition  == null) {objectPosition    =new vec4(1,1,1,1);}
    if (objectRotation  == null) {objectRotation    =new vec4(1,1,1,1);}
    if (objectScale     == null) {objectScale       =new vec4(1,1,1,1);}
    const objectMatrix = new mat4().makeTranslationRotationScale(objectPosition, objectRotation, objectScale);
    const objectRotationMatrix = new mat4().makeRotation(objectRotation);
    const viewMatrix = new mat4().makeTranslationRotationScale(cameraPosition, cameraRotation);

    gl.useProgram(programInfo.program);

    //BIND BUFFERS ///////////////////////////////////////////
    //Bind Vertices Buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexLocation);

    //Bind Normals Buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.vertexAttribPointer(programInfo.attribLocations.normalLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.normalLocation);

    //Bind Colors Buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
    gl.vertexAttribPointer(programInfo.attribLocations.colorLocation, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.colorLocation);

    //Bind Materials Buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, materialsBuffer);
    gl.vertexAttribPointer(programInfo.attribLocations.materialLocation, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.materialLocation);

    //Bind Indices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
    // gl.activeTexture(gl.TEXTURE0);
    // gl.bindTexture(gl.TEXTURE_2D, depthShaderData.texture);

    //BIND UNIFORMS////////////////////////////////////////
    gl.uniformMatrix4fv(programInfo.uniformLocations.cameraMatrix,          false, projectionMatrix.mul(viewMatrix).getFloat32Array());
    gl.uniformMatrix4fv(programInfo.uniformLocations.objectMatrix,          false, objectMatrix.getFloat32Array());
    gl.uniformMatrix4fv(programInfo.uniformLocations.objectRotationMatrix,  false, objectRotationMatrix.getFloat32Array());
    gl.uniform4fv(programInfo.uniformLocations.lightDirectionVector,    lightingDirection.getFloat32Array());
    gl.uniform1f(programInfo.uniformLocations.ambientLightLevelFloat,   ambientLightLevel);
    gl.uniform4fv(programInfo.uniformLocations.cameraPositionVector,    cameraPosition.getFloat32Array());
    gl.uniform1i(programInfo.uniformLocations.textureSampler, 0); // unused
    gl.uniform1f(programInfo.uniformLocations.timeFloat, ((Date.now()) / 1000) % 1000)

    //RENDER////////////////////////////////////////////////
    gl.drawElements(gl.TRIANGLES, numIndices, gl.UNSIGNED_SHORT, 0);
}
function initObjectBuffers(gl, vertices_=[], normals_=[], colors_=[], materials_=[], indices_=[])
{

    let ind = [];
    let nor = [];
    let vert = [];
    let col = [];
    let mat = [];

    if (vertices_.length > 100000)
    {
        let indOffset = 0;

        let tempIndices = [];
        let tempVertices =[];
        let tempColors = [];
        let tempNormals = [];
        let tempMaterials = [];
        for (let i=0; i<indices_.length; i+=3)
        {
            if (tempVertices.length > 100000)
            {
                ind.push(tempIndices);
                vert.push(tempVertices);
                col.push(tempColors);
                mat.push(tempMaterials);
                nor.push(tempNormals);

                tempIndices = [];
                tempVertices =[];
                tempColors = [];
                tempNormals = [];
                tempMaterials = [];

                indOffset = 0;
            }

            tempVertices.push(vertices_[indices_[i  ]]);
            tempVertices.push(vertices_[indices_[i+1]]);
            tempVertices.push(vertices_[indices_[i+2]]);

            tempNormals.push(normals_[indices_[i  ]]);
            tempNormals.push(normals_[indices_[i+1]]);
            tempNormals.push(normals_[indices_[i+2]]);

            tempMaterials.push(materials_[indices_[i  ]]);
            tempMaterials.push(materials_[indices_[i+1]]);
            tempMaterials.push(materials_[indices_[i+2]]);

            tempColors.push(colors_[indices_[i  ]]);
            tempColors.push(colors_[indices_[i+1]]);
            tempColors.push(colors_[indices_[i+2]]);

            tempIndices.push(indOffset, indOffset+1, indOffset+2);
            indOffset += 3;
        }



    } else {
        ind.push(indices_);
        vert.push(vertices_);
        col.push(colors_);
        nor.push(normals_);
        mat.push(materials_);
    }

    if (ind.length > 1)
    {
        const buffers = [];
        for (let i=0; i<ind.length; i++)
        {
            const vertices  = vec3ArrayToNumberArray(vert[i]);
            const normals   = vec3ArrayToNumberArray(nor[i]);
            const colors    = vec4ArrayToNumberArray(col[i]);
            const materials = vec4ArrayToNumberArray(mat[i]);
            const indices   = ind[i];

            const verticesBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

            const normalsBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

            const colorsBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

            const materialsBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, materialsBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(materials), gl.STATIC_DRAW);

            const indicesBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

            buffers.push({
                verticesBuffer: verticesBuffer,
                normalsBuffer: normalsBuffer,
                colorsBuffer: colorsBuffer,
                materialsBuffer: materialsBuffer,
                indicesBuffer: indicesBuffer,
        
                indices: indices,
                normals: normals,
                colors: colors,
                materals: materials,
                vertices: vertices,
            });
        }
        return buffers;
    }

    const vertices  = vec3ArrayToNumberArray(vertices_);
    const normals   = vec3ArrayToNumberArray(normals_);
    const colors    = vec4ArrayToNumberArray(colors_);
    const materials = vec4ArrayToNumberArray(materials_);
    const indices   = indices_;

    const verticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const normalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    const colorsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    const materialsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, materialsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(materials), gl.STATIC_DRAW);

    const indicesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return {
        verticesBuffer: verticesBuffer,
        normalsBuffer: normalsBuffer,
        colorsBuffer: colorsBuffer,
        materialsBuffer: materialsBuffer,
        indicesBuffer: indicesBuffer,

        indices: indices,
        normals: normals,
        colors: colors,
        materals: materials,
        vertices: vertices,
    }
}


//Get canvasElement Html object from document, resize accordingly, and get webgl context
const canvasElement = document.getElementById("glcanvas2");
let bb = canvasElement.getBoundingClientRect();
canvasElement.width  = Math.round(bb.width);
canvasElement.height = Math.round(bb.height);
const gl = canvasElement.getContext("webgl");


//Init ShaderData & Camera
const shaderData = initShader(gl);
const cameraPosition = new vec4(0,0,-10);
const cameraRotation = new vec4(0,0,0);
const projectionMatrix = new mat4().makePerspective(0.2, canvasElement.width/canvasElement.height, 1, 1000);


//Generate Planet and Init Buffers
const atmosphere= atmosphereGenerator(3, 1, 0);
const atmosphereBuffers = initObjectBuffers(gl, atmosphere.vertices, atmosphere.normals, atmosphere.colors, atmosphere.materials, atmosphere.indices);
const lightDirection = new vec4(1,1,1).scaleToUnit();
const ambientLightLevel = 0.001;
const rotation = new vec4();

const keys = {};
window.onkeydown = function (e) { keys[e.key.toLowerCase()] = true; }
window.onkeyup   = function (e) { keys[e.key.toLowerCase()] = false; }
let mouseIsDown = false;
canvasElement.onmousedown = function(e) { mouseIsDown = true; }
canvasElement.onmouseup = function(e) { mouseIsDown = false; }
canvasElement.onmousemove = function(e) {
    if (mouseIsDown)
    {
        let dx = e.movementX;
        let dy = e.movementY;
        rotation.y += dx / 500;
        rotation.z += dy / 500;
    }
}


///Update Function 
setInterval(update, 100);
let t = 0;
let lightDir = new vec4(1,0,0);
let reflectance = 0;
function update()
{
    t++;

    if (keys['w'] == true)
    {
        if (keys['shift'] == true)
        {
            cameraPosition.z+=0.2;
        } else {
            cameraPosition.z+=0.05;
        }
    } else if (keys['s'] == true)
    {
        if (keys['shift'] == true)
        {
            cameraPosition.z-=0.2;
        } else {
            cameraPosition.z-=0.05;
        }
    }
    if (keys['arrowup'])
    {
        cameraRotation.z += 0.05;
    } else if (keys['arrowdown'])
    {
        cameraRotation.z -= 0.05;
    }

    if (keys['a'] == true)
    {
        reflectance += 0.1;
    } else if (keys['d'] == true)
    {
        reflectance -= 0.1;
    }

    lightDirection.scaleToUnit();
    rotation.y += Math.sin(t/10) / 200;
    rotation.z += Math.sin(t/15) / 200;

    //Clear canvas and render object
    clear(gl, new vec4(0,0,0,1));

    renderObject(gl, shaderData.programInfo, projectionMatrix, cameraPosition, cameraRotation, 
        new vec4(), rotation, null, atmosphereBuffers.verticesBuffer, atmosphereBuffers.normalsBuffer, atmosphereBuffers.colorsBuffer, atmosphereBuffers.materialsBuffer, atmosphereBuffers.indicesBuffer, atmosphereBuffers.indices.length, 
        lightDirection.scaleToUnit(), ambientLightLevel);

}



function atmosphereGenerator(numDivisions, maxRadius, minRadius)
{
    const airColor = new vec4(0.8,0.9,0.9,0.01);
    const airMaterial = new vec4(1,0,1,1);

    let vertices = [];
    let normals = [];
    let colors = [];
    let materials = [];
    let indices = [];

    const numLayers = 20;
    const scale = 1.5;
    for (let j=0; j<numLayers; j++)
    {
        let z = j/numLayers;
        const indOffset = Math.round(vertices.length/3);
        vertices.push( -scale,scale,z, scale,scale,z, scale,-scale,z, -scale,-scale,z );
        normals.push( 1,1,1, 1,1,1, 1,1,1, 1,1,1);
        colors.push(airColor, airColor, airColor, airColor);
        materials.push(airMaterial, airMaterial, airMaterial, airMaterial);
        indices.push(
            indOffset+0,indOffset+1,indOffset+2,
            indOffset+0,indOffset+2,indOffset+3,
            indOffset+0,indOffset+2,indOffset+1,
            indOffset+0,indOffset+3,indOffset+2);
    }

    // const numSpheres = 40;
    // const numCloudLevels = 2;
    // for (let j=0; j<numSpheres; j++)
    // {
    //     // radiusMultiplier = radius * (0.8 + 0.2*j/numSpheres);
    //     radiusMultiplier = maxRadius * (j/numSpheres) + minRadius*(1- j/numSpheres);
    //     const color = airColor.add(0.5 - 0.5*j/numSpheres, 0, 0, 0);
    //     let cloudModifier =  (Math.sin(-0.1 + numCloudLevels*3.14159265*j/numSpheres)) * (1-j/numSpheres);
    //     if (cloudModifier < 0) { cloudModifier = 0;}
    //     const material = new vec4(airMaterial.x, airMaterial.y, cloudModifier, airMaterial.a);
    //     ret = generateSphereMesh(numDivisions);
    //     for (let i=0; i<ret.indices.length; i+=3)
    //     {
    //         const indOffset = vertices.length;
    //         const v1 = ret.vertices[ret.indices[i  ]].mul(radiusMultiplier);
    //         const v2 = ret.vertices[ret.indices[i+1]].mul(radiusMultiplier);
    //         const v3 = ret.vertices[ret.indices[i+2]].mul(radiusMultiplier);
    //         vertices.push(v1,v2,v3);
    //         indices.push(indOffset, indOffset+1, indOffset+2);
    //         normals.push(v1.copy().scaleToUnit(), v2.copy().scaleToUnit(), v3.copy().scaleToUnit());
    //         materials.push(material, material, material);
    //         colors.push(color, color, color);
    //     }
    // }
    console.log(vertices.length);
    return {
        vertices: vertices,
        indices: indices,
        normals: normals,
        materials: materials,
        colors: colors,
    }
}