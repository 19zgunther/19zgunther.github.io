


{
    //Get canvasElement Html object from document, resize accordingly, and get webgl context
    const canvasElement = document.getElementById("glcanvas");
    let bb = canvasElement.getBoundingClientRect();
    canvasElement.width  = Math.round(bb.width);
    canvasElement.height = Math.round(bb.height);
    const gl = canvasElement.getContext("webgl");


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

        uniform mat4 uCameraMatrix;
        uniform mat4 uObjectMatrix;
        uniform mat4 uObjectRotationMatrix;

        varying highp vec3 glPos;

        void main() {
            gl_Position = vec4(aVertexPosition.xyz, 1.0);
            glPos = aVertexPosition.xyz;
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

        varying vec3 glPos;
        uniform sampler2D uSampler;
        uniform float uTimeFloat;
        uniform vec4 uFrequencyMultiplierVector;
        uniform vec4 uFrequencyOffsetVector;
        uniform vec4 uFrequencyVector;

        uniform vec4 uColorMultiplierVector;
        uniform vec4 uColorOffsetVector;

        `+noiseFunctions+`

        void main() {
            vec3 color = vec3(0,0,0);
            vec3 pos = glPos;
            float t = uTimeFloat;

            pos.z = t;

            color = 
                noise3d(pos*uFrequencyVector.x + uFrequencyOffsetVector.x*noise3d(pos     ))*uFrequencyMultiplierVector.x + 
                noise3d(pos*uFrequencyVector.y + uFrequencyOffsetVector.y*noise3d(pos*3.0 ))*uFrequencyMultiplierVector.y + 
                noise3d(pos*uFrequencyVector.z + uFrequencyOffsetVector.z*noise3d(pos*8.0 ))*uFrequencyMultiplierVector.z + 
                noise3d(pos*uFrequencyVector.a + uFrequencyOffsetVector.a*noise3d(pos*20.0))*uFrequencyMultiplierVector.a;

            color = color * uColorMultiplierVector.xyz + uColorOffsetVector.xyz;

            gl_FragColor = vec4(color, 1.0);
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
            },
            uniformLocations: {
                textureSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
                timeFloat: gl.getUniformLocation(shaderProgram, 'uTimeFloat'),
                frequencyMultiplierVector: gl.getUniformLocation(shaderProgram, 'uFrequencyMultiplierVector'),
                frequencyOffsetVector: gl.getUniformLocation(shaderProgram ,'uFrequencyOffsetVector'),
                frequencyVector: gl.getUniformLocation(shaderProgram, 'uFrequencyVector'),

                colorMultiplierVector: gl.getUniformLocation(shaderProgram, 'uColorMultiplierVector'),
                colorOffsetVector: gl.getUniformLocation(shaderProgram ,'uColorOffsetVector'),

            },
        };
        return {
            shaderProgram: shaderProgram,
            programInfo: programInfo,
        }
    }

    //Init ShaderData & Camera
    const shaderData = initShader(gl);
    const vertices = [-1,1,0, 1,1,0, 1,-1,0, -1,-1,0];
    const indices = [0,1,2, 0,2,3, 0,2,1, 0,3,2];

    const verticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const indicesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    const frequencyVector = new vec4();
    const f1 = document.getElementById("f1");
    const f2 = document.getElementById("f2");
    const f3 = document.getElementById("f3");
    const f4 = document.getElementById("f4");
    const frequencyMultiplierVector = new vec4();
    const fm1 = document.getElementById("fm1");
    const fm2 = document.getElementById("fm2");
    const fm3 = document.getElementById("fm3");
    const fm4 = document.getElementById("fm4");
    const frequencyOffsetVector = new vec4();
    const fo1 = document.getElementById("fo1");
    const fo2 = document.getElementById("fo2");
    const fo3 = document.getElementById("fo3");
    const fo4 = document.getElementById("fo4");

    const colorMultiplierVector = new vec4();
    const rm = document.getElementById("rm");
    const gm = document.getElementById("gm");
    const bm = document.getElementById("bm");
    const colorOffsetVector = new vec4();
    const ro = document.getElementById("ro");
    const go = document.getElementById("go");
    const bo = document.getElementById("bo");

    const timeMultiplierSlider = document.getElementById("timeMultiplierSlider");

    ///Update Function 
    let pDateNow = Date.now();
    let time = 0;
    setInterval(update, 50);
    function update()
    {
        let timeMultiplier = 0.01;
        try {
            frequencyMultiplierVector.x = Number(fm1.value);
            frequencyMultiplierVector.y = Number(fm2.value);
            frequencyMultiplierVector.z = Number(fm3.value);
            frequencyMultiplierVector.a = Number(fm4.value);

            frequencyVector.x = Number(f1.value);
            frequencyVector.y = Number(f2.value);
            frequencyVector.z = Number(f3.value);
            frequencyVector.a = Number(f4.value);

            frequencyOffsetVector.x = Number(fo1.value);
            frequencyOffsetVector.y = Number(fo2.value);
            frequencyOffsetVector.z = Number(fo3.value);
            frequencyOffsetVector.a = Number(fo4.value);

            colorOffsetVector.x = Number(ro.value);
            colorOffsetVector.y = Number(go.value);
            colorOffsetVector.z = Number(bo.value);

            colorMultiplierVector.x = Number(rm.value);
            colorMultiplierVector.y = Number(gm.value);
            colorMultiplierVector.z = Number(bm.value);

            timeMultiplier = Number(timeMultiplierSlider.value);
        } catch {

        }

        //Clear canvas
        {
            // Clear the canvas before we start drawing on it.
            gl.clearColor(0,0,0,1);
            gl.clearDepth(1);                   // Clear everything

            //Enable depth testing & blending
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LESS);
            gl.enable(gl.BLEND);
            gl.depthMask(true);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            
            gl.enable(gl.CULL_FACE);
            
            //Clearing color and depth buffer
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            //Set Viewport
            gl.viewport(0, 0, canvasElement.width, canvasElement.height);
        }

        //Render obect
        {
            const programInfo = shaderData.programInfo;

            gl.useProgram(shaderData.shaderProgram);

            //BIND BUFFERS ///////////////////////////////////////////
            //Bind Vertices Buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
            gl.vertexAttribPointer(programInfo.attribLocations.vertexLocation, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexLocation);

            //Bind Indices
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
            // gl.activeTexture(gl.TEXTURE0);
            // gl.bindTexture(gl.TEXTURE_2D, depthShaderData.texture);

            //BIND UNIFORMS////////////////////////////////////////

            const dt = (Date.now() - pDateNow) / 1000;
            time += dt * timeMultiplier;
            pDateNow = Date.now();
            gl.uniform1f(programInfo.uniformLocations.timeFloat, time % 1000);
            gl.uniform4fv(programInfo.uniformLocations.frequencyOffsetVector, frequencyOffsetVector.getFloat32Array());
            gl.uniform4fv(programInfo.uniformLocations.frequencyMultiplierVector, frequencyMultiplierVector.getFloat32Array());
            gl.uniform4fv(programInfo.uniformLocations.frequencyVector, frequencyVector.getFloat32Array());

            gl.uniform4fv(programInfo.uniformLocations.colorOffsetVector, colorOffsetVector.getFloat32Array());
            gl.uniform4fv(programInfo.uniformLocations.colorMultiplierVector, colorMultiplierVector.getFloat32Array());
            

            //RENDER////////////////////////////////////////////////
            gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);   
        }
    }

}





// {
//     //Get canvasElement Html object from document, resize accordingly, and get webgl context
//     const canvasElement = document.getElementById("glcanvas");
//     let bb = canvasElement.getBoundingClientRect();
//     canvasElement.width  = Math.round(bb.width);
//     canvasElement.height = Math.round(bb.height);
//     const gl = canvasElement.getContext("webgl");


//     function initShader(gl)//initialize the default shader
//     {
//         function _loadShader(gl, type, source)//helper function used by _initShader() and _initPickerShader()
//         {
//             const shader = gl.createShader(type);
//             gl.shaderSource(shader, source);
//             gl.compileShader(shader);

//             // See if it compiled successfully
//             if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
//                 console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
//                 gl.deleteShader(shader);
//                 return null;
//             }
//             return shader;
//         }
//         let vsSource = `
//         attribute vec4 aVertexPosition;

//         uniform mat4 uCameraMatrix;
//         uniform mat4 uObjectMatrix;
//         uniform mat4 uObjectRotationMatrix;

//         varying highp vec3 glPos;

//         void main() {
//             gl_Position = vec4(aVertexPosition.xyz, 1.0);
//             glPos = aVertexPosition.xyz;
//         }`;
//         const noiseFunctions = `
//         // 2D Random
//         float random (vec2 st) {
//             return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
//         }

//         // 3D Random
//         float random (vec3 st) {
//             return fract(sin(dot(st.xyz, vec3(12.9898,78.233,30.5489))) * 43758.5453123);
//         }

//         float noise (vec3 p) {
//             vec3 corner = floor(p);
//             vec3 f = fract(p);

//             //Compute Corner Random Values
//             float c000 = random(corner);
//             float c100 = random(corner + vec3(1,0,0));
//             float c110 = random(corner + vec3(1,1,0));
//             float c010 = random(corner + vec3(0,1,0));
//             float c001 = random(corner + vec3(0,0,1));
//             float c101 = random(corner + vec3(1,0,1));
//             float c111 = random(corner + vec3(1,1,1));
//             float c011 = random(corner + vec3(0,1,1));

//             //Interpolate to find 'p' position, and return value
//             float c00 = c000*(1.0 - f.x) + c100*f.x;
//             float c01 = c001*(1.0 - f.x) + c101*f.x;
//             float c10 = c010*(1.0 - f.x) + c110*f.x;
//             float c11 = c011*(1.0 - f.x) + c111*f.x;
//             float c0 = c00*(1.0 - f.y) + c10*f.y;
//             float c1 = c01*(1.0 - f.y) + c11*f.y;
//             return c0*(1.0-f.z) + c1*f.z;
//         }

//         vec3 noise3d(vec3 p)
//         {
//             return vec3(noise(p), noise(p + 100.0), noise(p + 200.0));
//         }



//         //Marble/Stone like - use 3.0 as baseFreq
//         float compoundNoise7(vec3 p, float baseFreq)
//         {
//             float sum = 0.0;
//             float freq = baseFreq;
//             float offset = 0.0;
//             for (int i=0; i<7; i++)
//             {
//                 sum += noise(p*freq + 10.0*offset);
//                 offset += fract(sum);
//                 freq *= 1.7;
//             }
//             return sum / 7.0;
//         }

//         //Camo Pattern
//         float compoundNoise7_2(vec3 p, float baseFreq)
//         {
//             float sum = 0.0;
//             float freq = baseFreq;
//             float offset = 0.0;
//             for (int i=0; i<10; i++)
//             {
//                 float temp = noise(p*freq + 1.0*offset);
//                 if (temp > 0.5)
//                 {
//                     sum += temp;
//                     offset += fract(sum);
//                     freq *= 1.4;
//                 }
//             }
//             return sum / 10.0;
//         }

//         //Camo Pattern
//         float compoundNoise7_3(vec3 p)
//         {
//             float freq = 3.0;

//             float sum = 0.0;
//             float offset = 0.0;
//             for (int i=0; i<3; i++)
//             {
//                 float temp = noise(p*freq + 1.0*offset);
//                 if (temp > 0.5)
//                 {
//                     sum += temp;
//                     offset += fract(sum);
//                 }
//                 freq *= 1.7;
//             }
//             return sum / 3.0;
//         }


//         float compoundNoise7_4(vec3 p)
//         {
//             vec3 corner = floor(p);
//             vec3 f = fract(p);

//             float radius = 0.5;
//             float threshold = 0.8;

//             float d;
//             float r;

//             d = distance(f, vec3(0,0,0));
//             r = random(corner);
//             if (d < radius)
//             { if (r > threshold) { return d / radius; } return 0.0; }

//             d = distance(f, vec3(1,0,0));
//             r = random(corner + vec3(1,0,0));
//             if (d < radius)
//             { if (r > threshold) { return d / radius; } return 0.0; }

//             d = distance(f, vec3(1,1,0));
//             r = random(corner + vec3(1,1,0));
//             if (d < radius)
//             { if (r > threshold) { return d / radius; } return 0.0; }

//             d = distance(f, vec3(0,1,0));
//             r = random(corner + vec3(0,1,0));
//             if (d < radius)
//             { if (r > threshold) { return d / radius; } return 0.0; }

            


//             d = distance(f, vec3(0,0,1));
//             r = random(corner + vec3(0,0,1));
//             if (d < radius)
//             { if (r > threshold) { return d / radius; } return 0.0; }

//             d = distance(f, vec3(1,0,1));
//             r = random(corner + vec3(1,0,1));
//             if (d < radius)
//             { if (r > threshold) { return d / radius; } return 0.0; }

//             d = distance(f, vec3(1,1,1));
//             r = random(corner + vec3(1,1,1));
//             if (d < radius)
//             { if (r > threshold) { return d / radius; } return 0.0; }

//             d = distance(f, vec3(0,1,1));
//             r = random(corner + vec3(0,1,1));
//             if (d < radius)
//             { if (r > threshold) { return d / radius; } return 0.0; }

//             return 0.0;
//         }
//         `;
//         const fsSource = `
//         precision highp float;

//         varying vec3 glPos;
//         uniform sampler2D uSampler;
//         uniform float uTimeFloat;
//         uniform vec4 uFrequencyMultiplierVector;
//         uniform vec4 uFrequencyOffsetVector;
//         uniform vec4 uFrequencyVector;

//         uniform vec4 uColorMultiplierVector;
//         uniform vec4 uColorOffsetVector;

//         `+noiseFunctions+`

//         void main() {
//             vec3 color = vec3(0,0,0);
//             vec3 pos = glPos;
//             float t = uTimeFloat;

//             pos.z = t;

//             color = 
//                 noise3d(pos*uFrequencyVector.x + uFrequencyOffsetVector.x*noise3d(pos     ))*uFrequencyMultiplierVector.x + 
//                 noise3d(pos*uFrequencyVector.y + uFrequencyOffsetVector.y*noise3d(pos*3.0 ))*uFrequencyMultiplierVector.y + 
//                 noise3d(pos*uFrequencyVector.z + uFrequencyOffsetVector.z*noise3d(pos*8.0 ))*uFrequencyMultiplierVector.z + 
//                 noise3d(pos*uFrequencyVector.a + uFrequencyOffsetVector.a*noise3d(pos*20.0))*uFrequencyMultiplierVector.a;

//             color = color * uColorMultiplierVector.xyz + uColorOffsetVector.xyz;

//             gl_FragColor = vec4(color, 1.0);
//             return;
//         }
//         `;
//         const vertexShader = _loadShader(gl, gl.VERTEX_SHADER, vsSource);
//         const fragmentShader = _loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

//         // Create the shader program
//         const shaderProgram = gl.createProgram();
//         gl.attachShader(shaderProgram, vertexShader);
//         gl.attachShader(shaderProgram, fragmentShader);
//         gl.linkProgram(shaderProgram);

//         // If creating the shader program failed, alert
//         if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
//             console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
//             return null;
//         }

//         const programInfo = {
//             program: shaderProgram,
//             attribLocations: {
//                 vertexLocation: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
//             },
//             uniformLocations: {
//                 textureSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
//                 timeFloat: gl.getUniformLocation(shaderProgram, 'uTimeFloat'),
//                 frequencyMultiplierVector: gl.getUniformLocation(shaderProgram, 'uFrequencyMultiplierVector'),
//                 frequencyOffsetVector: gl.getUniformLocation(shaderProgram ,'uFrequencyOffsetVector'),
//                 frequencyVector: gl.getUniformLocation(shaderProgram, 'uFrequencyVector'),

//                 colorMultiplierVector: gl.getUniformLocation(shaderProgram, 'uColorMultiplierVector'),
//                 colorOffsetVector: gl.getUniformLocation(shaderProgram ,'uColorOffsetVector'),

//             },
//         };
//         return {
//             shaderProgram: shaderProgram,
//             programInfo: programInfo,
//         }
//     }

//     //Init ShaderData & Camera
//     const shaderData = initShader(gl);
//     const vertices = [-1,1,0, 1,1,0, 1,-1,0, -1,-1,0];
//     const indices = [0,1,2, 0,2,3, 0,2,1, 0,3,2];

//     const verticesBuffer = gl.createBuffer();
//     gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
//     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

//     const indicesBuffer = gl.createBuffer();
//     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
//     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);


//     ///Update Function 
//     let pDateNow = Date.now();
//     let time = 0;
//     setInterval(update, 50);
//     function update()
//     {
//         //Clear canvas
//         {
//             // Clear the canvas before we start drawing on it.
//             gl.clearColor(0,0,0,1);
//             gl.clearDepth(1);                   // Clear everything

//             //Enable depth testing & blending
//             gl.enable(gl.DEPTH_TEST);
//             gl.depthFunc(gl.LESS);
//             gl.enable(gl.BLEND);
//             gl.depthMask(true);
//             gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            
//             gl.enable(gl.CULL_FACE);
            
//             //Clearing color and depth buffer
//             gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

//             //Set Viewport
//             gl.viewport(0, 0, canvasElement.width, canvasElement.height);
//         }

//         //Render obect
//         {
//             const programInfo = shaderData.programInfo;

//             gl.useProgram(shaderData.shaderProgram);

//             //BIND BUFFERS ///////////////////////////////////////////
//             //Bind Vertices Buffer
//             gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
//             gl.vertexAttribPointer(programInfo.attribLocations.vertexLocation, 3, gl.FLOAT, false, 0, 0);
//             gl.enableVertexAttribArray(programInfo.attribLocations.vertexLocation);

//             //Bind Indices
//             gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
//             // gl.activeTexture(gl.TEXTURE0);
//             // gl.bindTexture(gl.TEXTURE_2D, depthShaderData.texture);

//             //BIND UNIFORMS////////////////////////////////////////

//             const dt = (Date.now() - pDateNow) / 1000;
//             time += dt * timeMultiplier;
//             pDateNow = Date.now();
//             gl.uniform1f(programInfo.uniformLocations.timeFloat, time % 1000);
//             gl.uniform4fv(programInfo.uniformLocations.frequencyOffsetVector, frequencyOffsetVector.getFloat32Array());
//             gl.uniform4fv(programInfo.uniformLocations.frequencyMultiplierVector, frequencyMultiplierVector.getFloat32Array());
//             gl.uniform4fv(programInfo.uniformLocations.frequencyVector, frequencyVector.getFloat32Array());

//             gl.uniform4fv(programInfo.uniformLocations.colorOffsetVector, colorOffsetVector.getFloat32Array());
//             gl.uniform4fv(programInfo.uniformLocations.colorMultiplierVector, colorMultiplierVector.getFloat32Array());
            

//             //RENDER////////////////////////////////////////////////
//             gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);   
//         }
//     }

// }