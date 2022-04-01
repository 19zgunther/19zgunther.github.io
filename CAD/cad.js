const glCanvasElement = document.getElementById("glCanvas");

//Camera settings elements
const perspective_fovSliderElement = document.getElementById('fovSlider');
const perspective_zNearSliderElement = document.getElementById('znearSlider');
const perspective_zFarSliderElement = document.getElementById('zfarSlider');
const orthogonal_zoomSliderElement = document.getElementById('orthogonalZoomSlider');
const perspective_checkboxElement = document.getElementById('perspectiveViewCheckbox');
const orthogonal_checkboxElement = document.getElementById('orthogonalViewCheckbox');

//Object list elements
const objectContainerElement = document.getElementById('objectContainer');



//web gl stuff
var gl;
var FOV = (Math.PI/180.0) * perspective_fovSliderElement.value;
var aspect = glCanvasElement.width/glCanvasElement.height;
var zNear = perspective_zNearSliderElement.value;
var zFar = perspective_zFarSliderElement.value;
var zoom = orthogonal_zoomSliderElement.value;
var perspectiveProjectionMatrix = new mat4();
var orthogonalProjectionMatrix = new mat4();
var pGlCanvasWidth = -1;



//Other
var run = false;
var camera = new Camera();
var projectionType = 'perspective' //perspective or orthogonal
var mode = "default";                  //sketch, extrude, ... modes
var currentSketchObject = null; //current sketch object
var pressedKeys = {};
var tick = 0;

var grids = [];
var objects = [];
var sketches = [];
var compass;
var selectedObject = null;
var editingObject = false;

var pObjectsLength = 0; //used to determine if we need to refresh the objects list

var mouseCanvasPos = new vec4();


setup();
document.addEventListener('keydown', keyPressed);
document.addEventListener('keyup', keyReleased);
//document.addEventListener('mousemove', mouseMoved);
var interval = setInterval(main, 1000/30);
//var updateObjectsContainerInterval = setInterval(updateObjectsContainer, 1000);


function keyPressed(event)
{
    if (currentSketch != null)
    {
        currentSketch.keyPressed(event);
        return;
    }

    var keyCode = event.key;
    pressedKeys[keyCode] = true;
    console.log(keyCode);

    if (createSketchMenuIsOpen && createSketchMenu_keyPressed(event))
    {
        return;
    }

    switch (keyCode)
    {
        case "Escape": 
            selectedObject = null;
            let ins_ = document.getElementsByTagName('input');
            for (var i in ins_) { 
                try {
                    ins_[i].blur();
                } catch {}
            }
            
            break;    
        case "Backspace":
            break;
            
        case "Delete": 
            if (selectedObject != null && editingObject == false)
            for (var i=0; i<objects.length; i++)
            {
                if (selectedObject == objects[i])
                {
                    objects.splice(i);
                }
            }
            selectedObject = null;
            updateObjectsContainer();
            
            break;
    }
}
function keyReleased(event)
{
    if (currentSketch != null)
    {
        currentSketch.keyReleased(event);
        return;
    }
    var keyCode = event.key;
    pressedKeys[keyCode] = false;

}
function mouseMoved(event)
{
    if (currentSketch != null)
    {
        currentSketch.mouseMoved(event);
        return;
    }
    var rect = glCanvasElement.getBoundingClientRect();
    mouseCanvasPos.x = event.clientX - rect.left;
    mouseCanvasPos.y = event.clientY - rect.top;
    //console.log(mouseCanvasPos.toString());
    
}
function mouseDown(event)
{
    if (currentSketch != null)
    {
        currentSketch.mouseDown(event);
        return;
    }
}
function mouseUp(event)
{
    if (currentSketch != null)
    {
        currentSketch.mouseUp(event);
        return;
    }
}
function mouseWheel(event)
{
    if (currentSketch != null)
    {
        currentSketch.mouseWheel(event);
        return;
    }
    
    if (projectionType == 'orthogonal')
    {
        zoom = Number(orthogonal_zoomSliderElement.value);

        if (event.wheelDelta>0)
        {
            zoom = zoom * 0.9;
        } else {
            zoom = zoom * 1.1;
        }
        orthogonal_zoomSliderElement.value =  zoom;
        console.log("Zoom: " + zoom);
        updateCameraSettings();
    }
}



function addObjectButtonPress(buttonElement) {
    console.log(buttonElement.id);

    switch (buttonElement.id) {
        case "cube": let o = new Cube(); objects.push(o); objectContainerElement.innerHTML += (o.getHTMLText()); break;
        case "cylinder": objects.push(new Cylinder()); break;
    }

    updateObjectsContainer();
}
function objectClicked(element) {
    console.log(element.id + "  h");
    for (var i=0; i<objects.length; i++)
    {
        if (objects[i].id == element.id)
        {
            selectedObject = objects[i];
        }
    }
}
function objectParameterChanged(element) {
    let obj = null;
    for(var i=0; i<objects.length; i++)
    {
        if (objects[i].id == element.id)
        {
            obj = objects[i];
            break;
        }
    }
    if (obj == null)
    {
        console.error("objectParameterchanged(element)  was passed unknown element");
        return;
    }

    element.style.width = element.value.length + 'ch';
 
    //console.log("changing obj="+obj.id+" value");
    let pos = obj.getPosition();
    let rot = obj.getRotation();
    let sca = obj.getScale();
    switch(element.name)
    {
        case "posX": pos.x = Number(element.value); console.log('posx');break;
        case 'posY': pos.y = Number(element.value); break;
        case 'posZ': pos.z = Number(element.value); break;
        case "rotX": rot.x = Number(element.value)*Math.PI/180; break;
        case "rotY": rot.y = Number(element.value)*Math.PI/180; break;
        case "rotZ": rot.z = Number(element.value)*Math.PI/180; break;
        case "scaX": sca.x = Number(element.value); break;
        case "scaY": sca.y = Number(element.value); break;
        case "scaZ": sca.z = Number(element.value); break;
    }
    obj.setPosition(pos);
    obj.setRotation(rot);
    obj.setScale(sca);
    //at this point, we have the object and the element which changed it...
}
function save_file_button_press() {
    let output = "";

    for (var i in objects)
    {
        output += objects[i].getSaveText();
    }
    console.log(output);



    let content = output;
    let contentType = 'text/plain';
    let filename = document.getElementById('fileSaveNameTextbox').value;

    const a = document.createElement('a');
    const file = new Blob([content], {type: contentType});
    a.href= URL.createObjectURL(file);
    a.download = filename;
    a.click();
	URL.revokeObjectURL(a.href);
}
function load_file_button_press() {
    console.error("Zack has not finished implementing this... he is very busy with RPI these days");
    return;
    var fr=new FileReader();
    fr.onload=function(){
        document.getElementById('output')
                .textContent=fr.result;
    }
        
    fr.readAsText(this.files[0]);
}


function move_camera_home_button_press()
{
    if (currentSketch == null)
    {
        camera.slideTo();
    } else {
        currentSketch.slideTo();
    }
}
function updateCameraSettings(element = null)
{
    FOV = (Math.PI/180.0) * perspective_fovSliderElement.value;
    aspect = glCanvasElement.width/glCanvasElement.height;
    zNear = perspective_zNearSliderElement.value;
    zFar = perspective_zFarSliderElement.value;
    zoom = orthogonal_zoomSliderElement.value;


    if (element instanceof HTMLElement)
    {
        switch(element.id)
        {
            case 'orthogonalViewCheckbox': perspective_checkboxElement.checked = false; 
                orthogonal_checkboxElement.checked = true; 
                projectionType = 'orthogonal'; break;
            case 'perspectiveViewCheckbox': orthogonal_checkboxElement.checked = false; 
                perspective_checkboxElement.checked = true;
                projectionType = 'perspective'; break;
            case 'orthogonalZoomSlider': console.log(zoom);
        }
    }

    orthogonalProjectionMatrix.makeOrthogonal(zoom, aspect, zNear, zFar);
    perspectiveProjectionMatrix.makePerspective(FOV,aspect,zNear,zFar);

    if (currentSketch != null)
    {
        currentSketch.updateProjectionMatrix();
    }
}





function setup() {
    glCanvasElement.width = window.visualViewport.width;
    glCanvasElement.height =  window.visualViewport.height * 0.8;
    glCanvasElement.style.width = glCanvasElement.width
    glCanvasElement.style.height = glCanvasElement.height

    // Initialize the GL context
    // Only continue if WebGL is available and working
    if (gl == null)
    {
        gl = glCanvasElement.getContext("webgl");
        if (gl === null) {
            alert("Unable to initialize WebGL. Your browser or machine may not support it.");
            return;
        } else {
            console.log("GL defined ")
        }
    }
    updateCameraSettings();

    InitShader(gl);
    run = true;

    compass = new Compass();


    grids.push(   new Grid(new vec4(50,50,0), new vec4(0,0,00))  );
    grids.push(   new Grid(new vec4(0,50,50), new vec4(0,Math.PI/2,0))  );
    grids.push(   new Grid(new vec4(50,0,50), new vec4(0,0,Math.PI/2))  );
    
    //objects.push(   new Body()      );

    //objects.push(   new Text(new vec4(5,5,5),     new vec4(), '5, 5, 5',      new vec4(),   true)  );
    //objects.push(   new Text(new vec4(-5,-5,-5),  new vec4(), '-5, -5, -5',   new vec4(),   true)  );
    //objects.push(   new Text(new vec4(5,5,-5),    new vec4(), '5, 5, -5',     new vec4(),   true)  );
    //objects.push(   new Text(new vec4(5,-5,-5),   new vec4(), '5, -5, -5',    new vec4(),   true)  );
    //objects.push(   new Text(new vec4(-5,5,5), new vec4(0,Math.PI/2,0), '-5, 5, 5 rot90', new vec4(), true)  );

    updateObjectsContainer();
}
function main() {
    if (!run)
    {
        return;
    }
    tick += 1;


    //Update either the camera or the current sketch, and get the correct projectionMatrix and viewMatrix
    var pm; //projectionMatrix;
    var vm; //viewMatrix;
    if (currentSketch != null && camera.sliding == false)
    {
        currentSketch.update();
        pm = currentSketch.getProjectionMatrix();
        vm = currentSketch.getViewMatrix();
    } else {
        camera.update(pressedKeys);
        vm = camera.getViewMatrix();

        //Get projection Matrix
        if (projectionType == 'orthogonal')
        {
            pm = orthogonalProjectionMatrix;
        } else if (projectionType == 'perspective')
        {
            pm = perspectiveProjectionMatrix;
        } else {
            console.error("Unknown projectionType. Needs to be orthogonal or perspective.");
            pm = perspectiveProjectionMatrix;
        }
    }




    //RENDERING PART///////////////////////////////
    //Clear Screen
    gl.clearColor(1, 1, 1, 1);    // Clear to black, fully opaque
    gl.clearDepth(1);                   // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    //gl.enable(gl.CULL_FACE);
    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    //Draw Each object
    for (var i=0; i<objects.length; i++)
    {
        if (selectedObject == objects[i])
        {
            objects[i].draw(gl, pm, vm, new vec4(0.9,0.3,0.3,1));
        } else {
            objects[i].draw(gl, pm, vm);
        }
    }

     //Draw Compass
    compass.draw(gl,pm,vm);

    //Draw All Sketches
    for (var i=0; i<sketches.length; i++)
    {
        if (sketches[i] == currentSketch) { continue; }
        sketches[i].draw(gl, pm, vm);
    }


    //Draw Current Sketch
    if (currentSketch != null && camera.sliding == false)
    {
        currentSketch.draw(gl);
    } else {
        //Draw grids
        //Draw each grid
        for (var i=0; i<grids.length; i++)
        {
            grids[i].draw(gl, pm, vm);
        }
    }


    //Messing around with projection matrices and switching between them linearly.
    /*var a = (tick)/1000;
    if (a > 1) {
        a = 1;
    }
    var b = 1-a;
    projectionMatrix =  ( orthogonalProjectionMatrix.mul(a) ).add(  (perspectiveProjectionMatrix.mul(b))  );*/
    

    //Render!
    //drawLite(gl, projectionMatrix, viewMatrix);    
}
function updateObjectsContainer() {
    //if (editingObject) { return; }
    objectContainerElement.innerHTML = "<div style='font-size:large;'>Objects</div>";
    for (var i=0; i<objects.length; i++)
    {
        objectContainerElement.innerHTML += objects[i].getHTMLText() + "<br>";
    }
    let ins = document.getElementsByClassName('vectorInput');

    for (var i in ins)
    {
        try {
            ins[i].style.width = ins[i].value.length + "ch";
        } catch {

        }
    }
}



function speedTest() {

    var g = new Grid();
    var pm = new mat4().makePerspective(FOV, aspect, zNear, zFar);
    var vm = new mat4().makeTranslation(1,1,1);

    var t = Date.now();
    for (var i=0; i<1000; i++)
    {
        g.draw(gl, pm, vm);
    }
    console.log(Date.now() - t);


    
    g.setData([50]*3000, null, [50]*4000, [1]*3000)

    console.log(g.vertices);

    t = Date.now();
    for (var i=0; i<1000; i++)
    {
        g.draw(gl,pm,vm);
    }
    console.log(Date.now() - t);


    

}























/*
function drawLite(gl, projectionMatrix, viewMatrix)
{

    gl.clearColor(0.9, 0.9, 0.9, 1);    // Clear to black, fully opaque
    gl.clearDepth(1);                   // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);




    if (currentSketch != null && camera.sliding == false)
    {
        const pm = currentSketch.getProjectionMatrix();
        const vm = currentSketch.getViewMatrix();

        //Draw each grid
        for (var i=0; i<grids.length; i++)
        {
            grids[i].draw(gl, pm, vm);
        }

        //Draw Each object
        for (var i=0; i<objects.length; i++)
        {
            objects[i].draw(gl, pm, vm);
        }
        currentSketch.draw(gl);

         //Draw Compass
        compass.draw(gl,pm,vm);

        return;
    }



    //Draw each grid
    for (var i=0; i<grids.length; i++)
    {
        grids[i].draw(gl, projectionMatrix, viewMatrix);
    }

    //Draw Each object
    for (var i=0; i<objects.length; i++)
    {
        objects[i].draw(gl, projectionMatrix, viewMatrix);
    }

    //Draw Compass
    compass.draw(gl,projectionMatrix,viewMatrix);
    



    //var g = new Grid(new vec4(50,0,50), new vec4(0,0,0));
    
    if (currentSketch != null) {

        var m = mouseCanvasPos;
        if (projectionType == 'orthogonal')
        {
            var gl_pos = new vec4(2*m.x/glCanvasElement.width - 1, -(2*m.y/glCanvasElement.height - 1), 0);
            //gl_pos = projectionMatrix * viewMatrix * point
            //point  = (projectionMatrix * viewMatrix)^-1  * gl_pos    +  cameraPos
            var point = (( (projectionMatrix.mul(viewMatrix)).invert() ).mul(gl_pos).add(camera.getPosition()) );
            var pos = currentSketch.grid.getIntersectionPoint(point, camera.getScreenNormalVector(), 0.1);
            var s= new Sketch(pos);
            s.draw(gl, projectionMatrix, viewMatrix);
        } else if (projectionType == 'perspective') {


        } else {
            console.error("unknown projectionType.");
        }
    }


    var m = mouseCanvasPos;
    var gl_pos = new vec4(2*m.x/glCanvasElement.width - 1, -(2*m.y/glCanvasElement.height - 1), 0);
    
}

*/

/*
    var Av = [0,0,0,0.2,0.8,0,0.3,0.8,0,0.1,0,0,0.5,0,0,0.4,0,0,0.1,0.3,0,0.1,0.4,0,0.4,0.4,0,0.4,0.3,0];
    var Ai = [0,1,2,2,3,0,2,4,5,5,1,2,6,7,8,8,9,6];

    var Bv = [0,0,0,0,0.8,0,0.1,0.8,0,0.1,0,0,0.3,0.8,0,0.4,0.7,0,0.1,0.7,0,0.4,0.5,0,0.3,0.4,0,0.3,0.7,0,0.4,0.1,0,0.3,0,0,0.1,0.1,0,0.3,0.1,0,0.3,0.5,0,0.4,0.3,0,0.1,0.5,0,0.1,0.4,0];
    var Bi = [0,1,2,2,3,0,2,4,5,5,6,2,5,7,8,8,9,5,10,11,3,3,12,10,10,13,14,14,15,10,16,14,8,8,17,16];

    var Cv = [0.1,0,0,0,0.1,0,0,0.7,0,0.1,0.8,0,0.4,0.8,0,0.5,0.7,0,0.1,0.7,0,0.5,0.6,0,0.4,0.6,0,0.4,0.7,0,0.4,0,0,0.5,0.1,0,0.1,0.1,0,0.5,0.2,0,0.4,0.2,0,0.4,0.1,0];
    var Ci = [0,1,2,2,3,0,3,4,5,5,6,3,5,7,8,8,9,5,0,10,11,11,12,0,11,13,14,14,15,11];

    var Dv = [0,0,0,0,0.8,0,0.1,0.8,0,0.1,0,0,0.3,0.8,0,0.4,0.7,0,0.1,0.7,0,0.5,0.6,0,0.4,0.6,0,0.3,0.7,0,0.5,0.2,0,0.4,0.2,0,0.3,0,0,0.4,0.1,0,0.1,0.1,0,0.3,0.1,0];
    var Di = [0,1,2,2,3,0,2,4,5,5,6,2,5,7,8,8,9,5,7,10,11,11,8,7,3,12,13,13,14,3,13,10,11,11,15,13];

    var Ev = [0,0,0,0,0.8,0,0.1,0.8,0,0.1,0,0,0.5,0.8,0,0.5,0.7,0,0.1,0.7,0,0.1,0.1,0,0.5,0.1,0,0.5,0,0,0.1,0.4,0,0.3,0.4,0,0.3,0.3,0,0.1,0.3,0 ];
    var Ei = [0,1,2,2,3,0,2,4,5,5,6,2,7,8,9,9,3,7,10,11,12,12,13,10];

    var Fv = [0,0,0,0,0.8,0,0.1,0.8,0,0.1,0,0,0.5,0.8,0,0.5,0.7,0,0.1,0.7,0,0.1,0.4,0,0.3,0.4,0,0.3,0.3,0,0.1,0.3,0];
    var Fi = [0,1,2,2,3,0,2,4,5,5,6,2,7,8,9,9,10,7];

    var Gv = [0.1,0,0,0,0.1,0,0,0.7,0,0.1,0.8,0,0.4,0,0,0.4,0.1,0,0.1,0.1,0,0.4,0.8,0,0.5,0.7,0,0.1,0.7,0,0.5,0.6,0,0.4,0.6,0,0.4,0.7,0,0.5,0,0,0.5,0.4,0,0.4,0.4,0,0.3,0.4,0,0.3,0.3,0,0.4,0.3,0];
    var Gi = [0,1,2,2,3,0,0,4,5,5,6,0,3,7,8,8,9,3,8,10,11,11,12,8,13,14,15,4,15,13,15,16,17,17,15,18];

    var Hv = [0,0,0,0,0.8,0,0.1,0.8,0,0.1,0,0,0.4,0,0,0.4,0.8,0,0.5,0.8,0,0.5,0,0,0.1,0.4,0,0.4,0.4,0,0.4,0.3,0,0.1,0.3,0];
    var Hi = [0,1,2,2,3,0,4,5,6,6,7,4,8,9,10,10,11,8];

    var Iv = [0,0.8,0,0.5,0.8,0,0.5,0.7,0,0,0.7,0,0,0.1,0,0.5,0.1,0,0.5,0,0,0,0,0,0.2,0.7,0,0.2,0.1,0,0.3,0.1,0,0.3,0.7,0];
    var Ii = [0,1,2,2,3,0,4,5,6,6,7,4,8,9,10,10,11,8];

    var Jv = [0,0.2,0,0,0.1,0,0.1,0,0,0.1,0.2,0,0.1,0.1,0,0.3,0.1,0,0.3,0,0,0.3,0.8,0,0.4,0.8,0,0.4,0.1,0];
    var Ji = [0,1,2,2,3,0,4,5,6,6,2,4,7,8,9,6,9,7];

    var Kv = [0,0,0,0,0.8,0,0.1,0.8,0,0.1,0,0,0.1,0.4,0,0.2,0.4,0,0.2,0.3,0,0.1,0.3,0,0.4,0.8,0,0.5,0.8,0,0.5,0.6,0,0.4,0.5,0,0.4,0.6,0,0.5,0.2,0,0.5,0,0,0.4,0,0,0.4,0.2,0];
    var Ki = [0,1,2,2,3,0,4,5,6,6,7,4,8,9,10,10,11,8,12,5,6,6,11,12,5,13,14,14,15,16,6,16,5];

    var Lv = [0.1,0.8,0,0.2,0.8,0,0.2,0,0,0.1,0,0,0.2,0.05,0,0.6,0.05,0,0.65,0,0,0.65,0.2,0,0.7,0.2,0,0.5,0,0,0,0.8,0,0.3,0.8,0,0.3,0.75,0,0.15,0.7,0,0,0.75,0,0,0,0,0,0.05,0,0.2,0.1,0];
    var Li = [0,1,2,2,3,0,4,5,6,6,2,4,5,7,8,8,6,9,10,11,12,12,13,14,14,10,12,15,16,17,17,2,15];
*/

    /*
    var v0 = [0,0.1,0,0.4,0.1,0,0.3,0,0,0.1,0,0,0,0.7,0,0.1,0.8,0,0.1,0.1,0,0.3,0.8,0,0.4,0.7,0,0.1,0.7,0,0.3,0.1,0,0.3,0.7,0];
    var i0 = [0,1,2,2,3,0,0,4,5,5,6,0,5,7,8,8,9,5,8,1,10,10,11,8];

    var v1 = [0,0.1,0,0.4,0.1,0,0.4,0,0,0,0,0,0.15,0,0,0.15,0.8,0,0.25,0.8,0,0.25,0,0,0,0.6,0,0.05,0.55,0];
    var i1 = [0,1,2,2,3,0,4,5,6,7,4,6,8,5,6,6,9,8];

    var v2 = [0,0.1,0,0.4,0.1,0,0.4,0,0,0,0,0,0,0.6,0,0.1,0.8,0,0.2,0.8,0,0.1,0.6,0,0.3,0.8,0,0.4,0.6,0,0.3,0.6,0,0.15,0.7,0,0.25,0.7,0,0.1,0.1,0];
    var i2 = [0,1,2,2,3,0,4,5,6,6,7,4,8,9,10,10,6,8,11,6,12,13,9,10,10,0,13];

    var v3 = [0.1,0.1,0,0.3,0.1,0,0.3,0,0,0.1,0,0,0.1,0.8,0,0.3,0.8,0,0.3,0.7,0,0.1,0.7,0,0.3,0.4,0,0.4,0.3,0,0.4,0.1,0,0.4,0.7,0,0.4,0.45,0,0.3,0.35,0,0,0.1,0,0.05,0.15,0,0,0.7,0,0.05,0.65,0,0.3,0.3,0,0.2,0.35,0,0.2,0.4,0,0.3,0.45,0];
    var i3 = [0,1,2,2,3,0,4,5,6,6,7,4,8,9,10,10,2,8,5,11,12,12,13,5,3,14,15,15,0,3,4,16,17,17,7,4,18,19,20,20,21,18];

    var v4 = [0.3,0,0,0.3,0.8,0,0.4,0.8,0,0.4,0,0,0,0.3,0,0,0.8,0,0.1,0.8,0,0.1,0.3,0,0.1,0.4,0,0.4,0.4,0,0.4,0.3,0];
    var i4 = [0,1,2,2,3,0,4,5,6,6,7,4,8,9,10,10,7,8];

    var v5 = [0,0.7,0,0,0.8,0,0.4,0.8,0,0.4,0.7,0,0,0.4,0,0.1,0.4,0,0.1,0.7,0,0.1,0.5,0,0.3,0.5,0,0.4,0.4,0,0.4,0.1,0,0.3,0,0,0.3,0.4,0,0.1,0,0,0,0.1,0,0.3,0.1,0,0,0.2,0,0.1,0.2,0,0.1,0.1,0];
    var i5 = [0,1,2,2,3,0,0,4,5,5,6,0,7,8,9,9,5,7,9,10,11,11,12,9,11,13,14,14,15,11,14,16,17,17,18,14];

    var v6 = [0,0.1,0,0.4,0.1,0,0.3,0,0,0.1,0,0,0.4,0.3,0,0.3,0.4,0,0.3,0.1,0,0.1,0.4,0,0.1,0.3,0,0.3,0.3,0,0,0.4,0,0.1,0.1,0,0.1,0.8,0,0.2,0.8,0];
    var i6 = [0,1,2,2,3,0,1,4,5,5,6,1,5,7,8,8,9,5,0,10,7,7,11,0,10,12,13,13,7,10];

    var v7 = [0,0.8,0,0.4,0.8,0,0.4,0.7,0,0,0.7,0,0.2,0,0,0.1,0,0,0.3,0.7,0];
    var i7 = [0,1,2,2,3,0,2,4,5,5,6,2];
    
    var v8 = [0,0.7,0,0.1,0.8,0,0.3,0.8,0,0.4,0.7,0,0,0.1,0,0.4,0.1,0,0.3,0,0,0.1,0,0,0.1,0.5,0,0.3,0.5,0,0.3,0.4,0,0.1,0.4,0,0.1,0.45,0,0,0.55,0,0.1,0.7,0,0,0.35,0,0.1,0.1,0,0.3,0.7,0,0.3,0.45,0,0.4,0.55,0,0.3,0.1,0,0.4,0.35,0];
    var i8 = [0,1,2,2,3,0,4,5,6,6,7,4,8,9,10,10,11,8,12,13,0,0,14,12,12,15,4,4,16,12,17,18,19,19,3,17,18,20,5,5,21,18];
    
    var v9 = [0,0.7,0,0.1,0.8,0,0.3,0.8,0,0.4,0.7,0,0,0.5,0,0.1,0.4,0,0.1,0.7,0,0.1,0.5,0,0.4,0.5,0,0.4,0.4,0,0.3,0.7,0,0.3,0.5,0,0.3,0,0,0.2,0,0,0.3,0.4,0];
    var i9 = [0,1,2,2,3,0,0,4,5,5,6,0,7,8,9,9,5,7,10,11,8,8,3,10,9,12,13,13,14,9];
    


    var v = [0,0,0,0,0.1,0,0,0.2,0,0,0.3,0,0,0.4,0,0,0.5,0,0,0.6,0,0,0.7,0,0.1,0,0,0.1,0.1,0,0.1,0.2,0,0.1,0.3,0,0.1,0.4,0,0.1,0.5,0,0.1,0.6,0,0.1,0.7,0,0.2,0,0,0.2,0.1,0,0.2,0.2,0,0.2,0.3,0,0.2,0.4,0,0.2,0.5,0,0.2,0.6,0,0.2,0.7,0,0.3,0,0,0.3,0.1,0,0.3,0.2,0,0.3,0.3,0,0.3,0.4,0,0.3,0.5,0,0.3,0.6,0,0.3,0.7,0,0.4,0,0,0.4,0.1,0,0.4,0.2,0,0.4,0.3,0,0.4,0.4,0,0.4,0.5,0,0.4,0.6,0,0.4,0.7,0];

    var i0 = [1,33,24,24,8,1,6,15,31,31,38,6,6,1,8,8,15,6,31,24,33,33,38,31];
    var i1 = [1,33,32,0,1,32,23,31,24,24,16,23,14,23,30,30,13,14];
    var i2 = [33,32,0,0,1,33,1,29,37,37,0,1,37,31,23,23,29,37,31,30,14,14,15,31,5,15,23,23,13,5];
    var i3 = [6,15,31,31,38,6,1,33,24,24,8,1,33,34,27,27,25,33,38,36,27,27,31,38,28,19,26,6,5,13,13,14,6,2,10,9,9,1,2];
    var i4 = [7,3,11,11,15,7,31,24,32,32,39,31,4,36,35,35,3,4];
    var i5 = [7,39,38,38,6,7,7,3,11,11,15,7,4,28,35,35,3,4,35,33,24,24,28,35,24,8,1,1,33,24,2,10,9,9,1,2];
    var i6 = [1,33,24,24,8,1,1,3,12,12,8,1,12,28,35,35,3,12,35,33,24,24,28,35,3,23,31,31,11,3];
    var i7 = [7,39,38,38,6,7,38,16,8,8,30,38];    
    var i8 = [6,15,31,31,38,6,1,33,24,24,8,1,12,28,27,11,12,27,6,4,11,11,15,6,31,27,36,36,38,31,33,35,28,28,24,33,8,12,3,3,1,8];
    var i9 = [6,15,31,31,38,6,6,4,11,11,15,6,31,27,36,36,38,31,4,36,27,27,11,4,36,16,8,8,28,36];
    */