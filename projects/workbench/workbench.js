


var gl;
const glCanvasElement = document.getElementById('glcanvas');
const fovSliderElement = document.getElementById('fovSlider');
const zFarSliderElement = document.getElementById('zfarSlider');
const zNearSliderElement = document.getElementById('znearSlider');
var projectionMatrix = new mat4();
var viewMatrix = new mat4();
var camPos = new vec4();
var camRot = new vec4();
var tick = 0;
const keys = {};
setup();


var updateInterval = setInterval(update, 30);

window.onkeydown = function (e) {
    keys[e.key] = true;
}
window.onkeyup = function(e) {
    keys[e.key] = false;
}

function setup()
{
    let bb = glCanvasElement.getBoundingClientRect();
    glCanvasElement.width = bb.width;
    glCanvasElement.height = bb.height;

    updateCameraSettings();

    gl = glCanvasElement.getContext("webgl");
    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    } else {
        console.log("GL defined ")
    }
    const ext = gl.getExtension('WEBGL_depth_texture');

    InitShader(gl);
}

function updateCameraSettings()
{
    let FOV = (Math.PI/180.0) * Number(fovSliderElement.value);
    let aspect = glCanvasElement.width/glCanvasElement.height;
    let zNear = Number(zNearSliderElement.value);
    let zFar = Number(zFarSliderElement.value);
    projectionMatrix = new mat4().makePerspective(FOV, aspect, zNear, zFar);
    viewMatrix = (new mat4().makeRotation(0,0,0)).mul( new mat4().makeTranslation(0,0,0) );
    console.log(FOV + " " + aspect + " " + zNear + " " + zFar);
}

function updateCamera()
{
    let transSpeed = 0.2;
    let tempTrans = new vec4();

    let rotSpeed = 0.05;
    let tempRot = new vec4();
    if (keys['w'])
    {
        tempTrans.z += transSpeed;
    }
    if (keys['s'])
    {
        tempTrans.z -= transSpeed;
    }
    if (keys['a'])
    {
        tempTrans.x -= transSpeed;
    }
    if (keys['d'])
    {
        tempTrans.x += transSpeed;
    }
    if (keys[' '])
    {
        tempTrans.y += transSpeed;
    }
    if (keys['Shift'])
    {
        tempTrans.y -= transSpeed;
    }

    if (keys['ArrowRight'])
    {
        tempRot.y += rotSpeed;
    }
    if (keys['ArrowLeft'])
    {
        tempRot.y -= rotSpeed;
    }
    if (keys['ArrowUp'])
    {
        tempRot.x -= rotSpeed;
    }
    if (keys['ArrowDown'])
    {
        tempRot.x += rotSpeed;
    }

    camRot.addi(tempRot);
    camPos.addi(new mat4().makeRotation(0, camRot.y,0).mul(tempTrans));
    let rotationMatrix = (  new mat4().makeRotation(0, 0, camRot.x + camRot.z)  ).mul(  new mat4().makeRotation(0,camRot.y,0)  );
    viewMatrix = rotationMatrix.mul( new mat4().makeTranslation(-camPos.x,-camPos.y,camPos.z) );
    
    //camRotMat = new mat4().makeRotation(0,camRot.y, (-camRot.x + Math.PI/2)%Math.PI);
}





function update()
{
    tick += 0.1;

    updateCamera();

    let s = 30;
    let vertices = [-s,0,-s, -s,0,s, s,0,s,  s,0,-s];
    let indices = [0,1,2, 0,2,3];
    let normals = [0,1,0, 0,1,0, 0,1,0, 0,1,0];
    let colors = [.6,.6,.6,1, .6,.6,.6,1, .6,.6,.6,1, .6,.6,.6,1,];

    let ret = generateBench();
    ret = addMeshes(vertices, ret.vertices, indices, ret.indices, normals, ret.normals, colors, ret.colors);
    const buffers = initBuffers(ret.vertices, ret.normals, ret.colors, ret.indices);
    indices = ret.indices;
    let objectPositionMatrix = new mat4().makeTranslation();
    let objectRotationMatrix = new mat4().makeRotation();


    
    const depthTexture = gl.createTexture();
    const depthTextureSize = 512;
    gl.bindTexture(gl.TEXTURE_2D, depthTexture);
    //               target      mipLevel  format           width            height        border     format           type          data
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, depthTextureSize, depthTextureSize, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
    //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, depthTextureSize, depthTextureSize, 0, gl.RGBA, gl.UNSIGNED_INT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    const depthFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,       // target
        gl.DEPTH_ATTACHMENT,  // attachment point
        gl.TEXTURE_2D,        // texture target
        depthTexture,         // texture
        0);                   // mip level

    // create a color texture of the same size as the depth texture
    const unusedTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, unusedTexture);
    //               target      mipLevel  format           width            height        border     format           type          data
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, depthTextureSize, depthTextureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // attach it to the framebuffer
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,        // target
        gl.COLOR_ATTACHMENT0,  // attachment point
        gl.TEXTURE_2D,         // texture target
        unusedTexture,         // texture
        0);                    // mip level

        



    //RENDERING PART///////////////////////////////
    //Clear Screen
    gl.clearColor(0.01, 0.01, 0.01, 1);    // Clear to black, fully opaque
    gl.clearDepth(1);                   // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    gl.enable(gl.CULL_FACE);
    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //ground
    //DrawDefault(gl, projectionMatrix, viewMatrix, new mat4().makeTranslation(), new mat4().makeRotation(), ret.indices, buffers, true);
    //return;

    var programInfo = defaultProgramInfo;
    // Tell WebGL to use our program when drawingm
    gl.useProgram(programInfo.program);
    
    //Vertice
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertices);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexLocation);

    //Normals
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normals);
    gl.vertexAttribPointer(programInfo.attribLocations.normalLocation, 3,  gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.normalLocation);
    
    //Colors
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colors);
    gl.vertexAttribPointer(programInfo.attribLocations.colorLocation, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.colorLocation);
    
    //Indices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    // Set the shader uniforms
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix,  false, projectionMatrix.getFloat32Array());
    gl.uniformMatrix4fv(programInfo.uniformLocations.viewMatrix, false, viewMatrix.getFloat32Array());
    gl.uniformMatrix4fv(programInfo.uniformLocations.objectPositionMatrix, false, objectPositionMatrix.getFloat32Array());
    gl.uniformMatrix4fv(programInfo.uniformLocations.objectRotationMatrix, false, objectRotationMatrix.getFloat32Array());
    gl.uniform4fv(programInfo.uniformLocations.cameraPositionVector, camPos.copy().mul(1,1,-1).getFloat32Array());

    //Draw Elements
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

}






function generateBench() {

    let bw = 5; //bench width;
    let bt = 0.5; //bench thickness
    let bh = 3; //bench height
    let bd = 2; //bench depth
    let btc = new vec4(133/255, 94/255, 37/255, 1); //benchTopColor

    let vertices = [-bw, bh, bd,  -bw, bh, -bd,  bw,bh,-bd,  bw,bh,bd, //top
        -bw, bh-bt, bd,  -bw, bh-bt, -bd,  bw,bh-bt,-bd,  bw,bh-bt,bd, //bottom
        -bw,bh,bd, bw,bh,bd, bw,bh-bt,bd, -bw,bh-bt,bd, //front 
        -bw,bh,-bd, bw,bh,-bd, bw,bh-bt,-bd, -bw,bh-bt,-bd, //back 
        -bw,bh,bd, -bw,bh,-bd,  -bw,bh-bt,-bd, -bw,bh-bt,bd, //left
        bw,bh,bd, bw,bh,-bd,  bw,bh-bt,-bd, bw,bh-bt,bd, //right
    ];
    let indices = [0,2,1, 0,3,2, //top
            4,5,6, 4,6,7, //bottom
            8,10,9,8,11,10, //front
            12,13,14, 12,14,15, //back
            16,17,18, 16,18,19, //left
            20,22,21, 20,23,22, //right
    ];
    let normals = [0,1,0, 0,1,0, 0,1,0, 0,1,0,//top
        0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0, //bottom
        0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1, //front
        0,0,1, 0,0,1, 0,0,1, 0,0,1, //back
        -1,0,0, -1,0,0, -1,0,0, -1,0,0, //left
        1,0,0, 1,0,0, 1,0,0, 1,0,0, //right
    ];
    let colors = [];//[btc.x, btc.y, btc.z, btc.a, btc.x, btc.y, btc.z, btc.a, btc.x, btc.y, btc.z, btc.a, btc.x, btc.y, btc.z, btc.a];

    for (var i=0; i<vertices.length/3; i++)
    {
        colors.push(btc.x, btc.y, btc.z, btc.a,);
    }
    //vertices.push(  );

    return {
        vertices: vertices,
        indices: indices,
        normals: normals,
        colors: colors,
    }
}


function addMeshes(v1, v2, i1, i2, n1, n2, c1, c2) {
    let l = Math.round(v1.length/3);

    for (var i=0; i<i2.length; i++)
    {
        i1.push(i2[i]+l);
    }
    v1 = v1.concat(v2);
    n1 = n1.concat(n2);
    c1 = c1.concat(c2);

    return {
        vertices: v1,
        indices: i1,
        normals: n1,
        colors: c1,
    }
}

function addMesh(v,ind,n,c, v2,ind2,n2,c2, )
{

}

function generateSphere(steps = 5, radius = 1, color = new vec4(1,0,0,1))
{
    //var vertices = [0,-1,0, 1,0,0, 0,0,1, -1,0,0, 0,0,-1, 0,1,0];
    var indices = [0,1,2, 0,2,3, 0,3,4, 0,4,1, 1,5,2, 2,5,3, 3,5,4, 4,5,1];
    var vertices = [
        new vec4(0,-1,0),
        new vec4(1,0,0),
        new vec4(0,0,1),
        new vec4(-1,0,0),
        new vec4(0,0,-1),
        new vec4(0,1,0),
    ];


    var vertDict = new Map();
    for (var i in vertices)
    {
        vertices[i].muli(radius);
        vertDict.set(vertices[i], i);
    }
   
    //Generate sphere mesh
    var zz = new vec4();
    for (var s=0; s<steps; s++)
    {
        var inds = [];

        for( var i=0; i<indices.length; i+=3)
        {
            let v1 = vertices[indices[i]];
            let v2 = vertices[indices[i+1]];
            let v3 = vertices[indices[i+2]];

            let b1 = (v1.add(v2)).muli(0.5);
            b1.muli( radius/distanceBetweenPoints(b1, zz)  );
            let b2 = (v2.add(v3)).muli(0.5);
            b2.muli( radius/distanceBetweenPoints(b2, zz)  );
            let b3 = (v1.add(v3)).muli(0.5);
            b3.muli( radius/distanceBetweenPoints(b3, zz)  );


            let r = vertDict.get(b1);
            if (r != null) {
                b1 = r;
            } else {
                r = vertices.length;
                vertDict.set(b1,r);
                vertices.push(b1);
                b1 = r;
            }

            r = vertDict.get(b2);
            if (r != null) {
                b2 = r;
            } else {
                r = vertices.length;
                vertDict.set(b2,r);
                vertices.push(b2);
                b2 = r;
            }

            r = vertDict.get(b3);
            if (r != null) {
                b3 = r;
            } else {
                r = vertices.length;
                vertDict.set(b3,r);
                vertices.push(b3);
                b3 = r;
            }
            inds.push(indices[i], b1, b3,   b1, indices[i+1], b2,   b3, b2, indices[i+2],  b1,b2,b3);
        }
        indices = inds;
    }


    var v = [];
    var ind = [];
    var n = [];
    var c = [];

    //transform...

    var indOn = 0;
    for(var i=0; i<indices.length; i+=3)
    {

        v.push( vertices[indices[i]].x, vertices[indices[i]].y, vertices[indices[i]].z);
        v.push( vertices[indices[i+1]].x, vertices[indices[i+1]].y, vertices[indices[i+1]].z);
        v.push( vertices[indices[i+2]].x, vertices[indices[i+2]].y, vertices[indices[i+2]].z);


        ind.push(indOn, indOn+1, indOn+2);
        indOn += 3;
    
        var n1 = vertices[indices[i]].copy().scaleToUnit();
        var n2 = vertices[indices[i+1]].copy().scaleToUnit();
        var n3 = vertices[indices[i+2]].copy().scaleToUnit();
        //n.push( n1.x, n1.y, n1.z,  n2.z, n2.y, n2.z, n3.x, n3.y, n3.z);

        var a = vertices[indices[i+1]].sub(vertices[indices[i]]);
        var b = vertices[indices[i+2]].sub(vertices[indices[i]]);
        b.scaleToUnit();
        a.scaleToUnit();
        var nx = a.y*b.z - a.z*b.y;
        var ny = a.z*b.x - a.x*b.z;
        var nz = a.x*b.y - a.y*b.x;
        let newN = new vec4(nx,ny,nz).scaleToUnit();
        //n.push( newN.x, newN.y, newN.z, newN.x, newN.y, newN.z, newN.x, newN.y, newN.z, );
        
        c.push(color.x, color.y, color.z, color.a,  color.x, color.y, color.z, color.a,  color.x, color.y, color.z, color.a);
    }


    return {
        vertices: v,
        indices: ind,
        normals: n,
        colors: c,
    }
}