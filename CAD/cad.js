/***********************************************************************************************
*  Code Written by Zack Gunther
*  If you would like to copy or use this code email me at 19zgunther@gmail.com to ask permission.
************************************************************************************************/


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

//History element
const historyContainerElement = document.getElementById('historyContainer');





//web gl stuff
var gl;
var FOV = (Math.PI/180.0) * perspective_fovSliderElement.value;
var aspect = glCanvasElement.width/glCanvasElement.height;
var zNear = perspective_zNearSliderElement.value;
var zFar = perspective_zFarSliderElement.value;
var zoom = orthogonal_zoomSliderElement.value;
var perspectiveProjectionMatrix = new mat4();
var orthogonalProjectionMatrix = new mat4();
var projectionMatrix;

var mouseFrameBuffer = null; //FrameBuffer object (custom object) initialized in setup after gl is initialized




//Other
var run = false;
var camera = new Camera();
var projectionType = 'perspective' //perspective or orthogonal
var mode = "default";                  //sketch, extrude, ... modes
var currentSketchObject = null; //current sketch object
var pressedKeys = {};
var tick = 0;

var grids = []; // holds all grid objects 
var objects = []; //hold all body objects
var arrows = [];
var sketches = []; //unusued at the moment because sketches are hard
var compass; //view rotation compass object in the upper lefthand corner
var selectedObject = null; //Stores whichever Object we're editing, moving, etc
var selectedArrow = null;  //Stores whichever arrow we've selected
var editingObject = false;
var editHistory = [];

var pObjectsLength = 0; //used to determine if we need to refresh the objects list

var mouseCanvasPos = new vec4();
var mouseGlPos = new vec4();
var mouseDirectionVector = new vec4();
var mouseIsDown = false;                //Boolean to remember if the mouse is currently depressed
var mouseJustDown = false;              //Boolean to signify first update since mouse clicked
var mouseMovedLast = 0;                 //Int signifying the last time the mouse moved
var mouseDeltaVector = new vec4();      //vector is used to determine mouse offset while moving/dragging/translating objects

var confirmBoxOpen = false; //used to keep track of it  aconfirm box is open. If it is, stop all key handling


setup();
document.addEventListener('keydown', keyPressed);
document.addEventListener('keyup', keyReleased);
window.addEventListener('resize', resizeScreen);
glCanvasElement.addEventListener('mouseleave', mouseUp);
//document.addEventListener('mousemove', mouseMoved);

var mainInterval = setInterval(update, 1000/40);
var slowUpdate = setInterval(slowUpdate, 200);
//var objInterfal = setInterval(() => {updateObjectsContainer()}, 500);
//var updateObjectsContainerInterval = setInterval(updateObjectsContainer, 1000);


function keyPressed(event)
{
    if (confirmBoxOpen)
    {
        return;
    }
    if (currentSketch != null)
    {
        currentSketch.keyPressed(event);
        return;
    }

    var keyCode = event.key;
    pressedKeys[keyCode] = true;
    //console.log(keyCode);

    if (createSketchMenuIsOpen && createSketchMenu_keyPressed(event))
    {
        return;
    }

    switch (keyCode)
    {
        case "Escape": 
            if (selectedArrow != null) {
                selectedArrow = null;
                break;
            }
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
            /*if (selectedObject != null && editingObject == false)

            confirmBoxOpen = true;
            if (!confirm('Are you sure you want to delete object: ' + selectedObject.type + " " + selectedObject.id + "?\n(Action cannot be undone)"))
            {
                confirmBoxOpen = false;
                break;
            }
            confirmBoxOpen = false;*/
            removeObject(selectedObject);
            selectedObject = null;            
            break;
        case "z":
            if (pressedKeys['Control'])
            {
                revertEditHistory();
            }
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
    mouseMovedLast = 0;

    if (currentSketch != null)
    {
        currentSketch.mouseMoved(event);
        return;
    }
    let bb = glCanvasElement.getBoundingClientRect();
    mouseCanvasPos.x = event.clientX - bb.left;
    mouseCanvasPos.y = event.clientY - bb.top;
    mouseGlPos = mouseCanvasPos.mul(new vec4(2/bb.width, -2/bb.height,0,0)).addi(new vec4(-1,1,0,0));
    mouseDirectionVector = screenToWorldVector( mouseGlPos, projectionMatrix, camera.getRotationMatrix() );
    //mouseDirectionVector.a = 0;
    //mouseDirectionVector.scaleToUnit();
}
function mouseDown(event)
{

    if (currentSketch != null)
    {
        currentSketch.mouseDown(event);
        return;
    }

    //Update mouseCanvasPos, mouseGlPos, and mouseDirectionVector
    let bb = glCanvasElement.getBoundingClientRect();
    mouseCanvasPos.x = event.clientX - bb.left;
    mouseCanvasPos.y = event.clientY - bb.top;
    mouseIsDown = true;
    mouseJustDown = true;
    mouseGlPos = mouseCanvasPos.mul(new vec4(2/bb.width, -2/bb.height,0,0)).addi(new vec4(-1,1,0,0));
    mouseDirectionVector = screenToWorldVector( mouseGlPos, projectionMatrix, camera.getRotationMatrix() );

    //Check to see if we clicked an object.
    //Following updates varibales: selectedArrow, selectedObject
    let obj = getObjectFromMousePos();
    selectedArrow = null;
    if (obj != null && selectedObject != null)
    {
        //Check to see if the object type is equal to _arrow_...,  if it is, we clicked an arrow.
        if (obj.type.substring(0,7) == '_arrow_')
        {
            selectedArrow = obj;
            saveEditHistory(selectedObject, 'objectParameterChange', selectedObject.getPosition(), selectedObject.getRotation(), selectedObject.getScale(), obj.type.substring(7,20));
        } else {
            //obj selected is not an arrow
            selectedObject = obj;
        }
    } else if (obj != null) {
        selectedObject = obj;
    } else {
        selectedObject = null;
        selectedArrow = null;
    }
}
function mouseUp(event)
{
    mouseIsDown = false;
    
    //selectedArrow = null;

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
function resizeScreen()
{
    console.log('resizing');
    //Normal stuff
    let bb = glCanvasElement.getBoundingClientRect();
    glCanvasElement.width = bb.width;//window.visualViewport.width;
    glCanvasElement.height = bb.height;
    updateCameraSettings();
}


function addObjectButtonPress(buttonElement) {
    let o = createObject(buttonElement.id);
    console.log(buttonElement.id);
    if (o != null) {
        addObject(o);
        selectedObject = o;
        selectedArrow = null;
    }
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
    //Start by getting the correct object if it exists, return and error if element does not refer to active object in objects[]
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

    //Set the width of the text
    element.style.width = Math.max(element.value.length,2) + 'ch';
 
    let pos = obj.getPosition();
    let rot = obj.getRotation();
    let sca = obj.getScale();

    let val = Number(element.value);
    let valueChanged = false;
    //First, check to see if the value is actually different
    switch(element.name)
    {
        case "posX": if (pos.x != val) {valueChanged = true;} break;
        case 'posY': if (pos.y != val) {valueChanged = true;} break;
        case 'posZ': if (pos.z != val) {valueChanged = true;} break;
        case "rotX": if (rot.x != val*Math.PI/180) {valueChanged = true;} break;
        case "rotY": if (rot.y != val*Math.PI/180) {valueChanged = true;} break;
        case "rotZ": if (rot.z != val*Math.PI/180) {valueChanged = true;} break;
        case "scaX": if (sca.x != val) {valueChanged = true;} break;
        case "scaY": if (sca.y != val) {valueChanged = true;} break;
        case "scaZ": if (sca.z != val) {valueChanged = true;} break;
    }

    //if the value has changed, then we need to save the current state
    if (valueChanged) 
    { 
        saveEditHistory(obj, "objectParameterChange", pos, rot, sca, element.name); 
       
        //apply the change
        switch(element.name)
        {
            case "posX": pos.x = val; break;
            case 'posY': pos.y = val; break;
            case 'posZ': pos.z = val; break;
            case "rotX": rot.x = val*Math.PI/180; break;
            case "rotY": rot.y = val*Math.PI/180; break;
            case "rotZ": rot.z = val*Math.PI/180; break;
            case "scaX": sca.x = val; break;
            case "scaY": sca.y = val; break;
            case "scaZ": sca.z = val; break;
        }
        obj.setPosition(pos);
        obj.setRotation(rot);
        obj.setScale(sca);
    }   
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
function loadFile(text) {
    //console.log(text);
    let array = text.split('@');
    for (var i=0; i<array.length; i++)
    {
        array[i] = array[i].split('_');
        array[i].shift();
    }
    array.shift();
    //console.log(array);

    for (var i=0; i<array.length; i++){
        let obj = new Object();

        //get type
        let temp = array[i][0].split(':')[1];
        switch(temp)
        {
            //case 'Cube': obj = new Cube();
            //todo - fill in the rest of the objects
        }
        
        //get id
        temp = array[i][1].split(':')[1];
        obj.id = Number(temp);

        //get position
        temp = array[i][2].split(':')[1].split(',');
        obj.setPosition(new vec4( Number(temp[0]),  Number(temp[1]), Number(temp[2])  ));

        //get rotation
        temp = array[i][3].split(':')[1].split(',');
        obj.setRotation(new vec4( Number(temp[0]),  Number(temp[1]), Number(temp[2])  ));

        //get scale
        temp = array[i][4].split(':')[1].split(',');
        obj.setScale(new vec4( Number(temp[0]),  Number(temp[1]), Number(temp[2])  ));

        addObject(obj, 'true');
    }
    updateHistoryContainer();
    updateObjectsContainer();
}

document.getElementById('fileInput').addEventListener('change', function(e) {
if(e.target.files) {
    let f = e.target.files[0]; //here we get the image file
    console.log(f);
    var reader = new FileReader();
    reader.readAsText(f);
    reader.onloadend = function (e) {
        loadFile(e.target.result);
    }
}
});


function saveEditHistory(object_=null, eventType_ = "objectParameterChange", position_=new vec4(), rotation_ = new vec4(), scale_ = new vec4(), eventDetail_ = "")
{

    //eventTypes: objectParameterChange, objectCreation, objectDeletion, 
    if (position_ instanceof vec4) { position_ = position_.copy();}
    if (rotation_ instanceof vec4) { rotation_ = rotation_.copy();}
    if (scale_ instanceof vec4) { scale_ = scale_.copy();}

    editHistory.push( 
        {
            object: object_,
            eventType: eventType_,
            position: position_,
            rotation: rotation_,
            scale: scale_,
            eventDetail: eventDetail_
        }
    );
    updateHistoryContainer();
}
function revertEditHistory()
{
    if (editHistory.length > 0)
    {
        let event = editHistory.pop();

        if (event.eventType == 'objectParameterChange')
        {
            if (event.object instanceof Object == false) { console.error("Failed to revert edit. Event.body DNE"); return;}
            event.object.setPosition(event.position);
            event.object.setRotation(event.rotation);
            event.object.setScale(event.scale);
        } else if (event.eventType == 'objectCreation')
        {
            removeObject(event.object, false);
        } else if (event.eventType == 'objectDeletion')
        {
            addObject(event.object, false);
        } else {
            console.error( "event.eventType is unknown. = " + event.eventType );
        }
    }
    selectedObject = null;
    updateHistoryContainer();
}
function updateHistoryContainer() {
    historyContainerElement.innerHTML = '';
    for (var i in editHistory)
    {
        historyContainerElement.innerHTML += editHistory[i].object.type + " " 
                                + editHistory[i].object.id + " "
                                + editHistory[i].eventType + " "
                                + editHistory[i].eventDetail + " "
                                + '<br>';
    }
    historyContainerElement.scrollTop = 100000;
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

    orthogonalProjectionMatrix.makeOrthogonal(zoom, aspect, zNear, zFar);
    perspectiveProjectionMatrix.makePerspective(FOV,aspect,zNear,zFar);

    if (element instanceof HTMLElement)
    {
        switch(element.id)
        {
            case 'orthogonalViewCheckbox': 
                perspective_checkboxElement.checked = false; 
                orthogonal_checkboxElement.checked = true; 
                projectionType = 'orthogonal';
                projectionMatrix = orthogonalProjectionMatrix;
                break;
            case 'perspectiveViewCheckbox': 
                orthogonal_checkboxElement.checked = false; 
                perspective_checkboxElement.checked = true;
                projectionType = 'perspective'; 
                projectionMatrix = perspectiveProjectionMatrix;
                break;
            case 'orthogonalZoomSlider': 
                console.log(zoom); 
                break;
        }
    } else if (element == null) {
        projectionMatrix = perspectiveProjectionMatrix;
    }


    if (currentSketch != null)
    {
        currentSketch.updateProjectionMatrix();
    }
}
function updateObjectsContainer() {
    //if (editingObject) { return; }
    objectContainerElement.innerHTML = "<div style='font-size:large;'>Objects</div>";
    for (var i=0; i<objects.length; i++)
    {
        if (selectedObject == objects[i])
        {
            objectContainerElement.innerHTML += objects[i].getHTMLText(true) + "<br>";
        } else {
            objectContainerElement.innerHTML += objects[i].getHTMLText(false) + "<br>";
        }
    }

    //Update all of the input widths
    let ins = document.getElementsByClassName('vectorInput');
    for (var i in ins)
    {
        try {
            let len = ins[i].value.length;
            ins[i].style.width = Math.min(len, 3) + "ch";
        } catch {

        }
    }
}


function addObject(obj, saveEdit = true) 
{
    objects.push(obj);
    if (saveEdit) { saveEditHistory(obj, 'objectCreation', null, null, null, " "); }
    updateObjectsContainer();
}
function removeObject(obj, saveEdit = true)
{
    for (var i=0; i<objects.length; i++)
    {
        if (obj.id == objects[i].id)
        {
            objects.splice(i,1);
        }
    }
    if (saveEdit) { saveEditHistory(obj, 'objectDeletion', null, null, null, " "); } 
    updateObjectsContainer();
}




function setup() {
    //resize glCanvas and such
    resizeScreen();

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

    InitShader(gl);


    mouseFrameBuffer = new FrameBuffer(gl, glCanvasElement);

    run = true;
    compass = new Compass();
    grids.push( createObject('grid') );


    arrows = [
        new Object().setData(
            rotateData( generateArrow(1.5, .15, 8, new vec4(1,.1,.1,1), .05, 0.7, false, 0.5),  new vec4(0,Math.PI/2,0) )
            ).setData({type: '_arrow_posX'}
        ),
        new Object().setData(
            rotateData( generateArrow(1.5, .15, 8, new vec4(.1,1,.1,1), .05, 0.7, false, 0.5),  new vec4(0,0,-Math.PI/2,0) )
            ).setData({type: '_arrow_posY'}
        ),
        new Object().setData(
            rotateData( generateArrow(1.5, .15, 8, new vec4(.1,.1,1,1), .05, 0.7, false, 0.5),  new vec4() )
            ).setData({type: '_arrow_posZ'}
        ),

        new Object().setData(
            translateData( 
                rotateData( 
                    generateDoubleArrow(0.8, .1, 8, new vec4(1,.5,.5,0.2), .05, 0.75, false ),  
                    new vec4(0,0,Math.PI/4) 
                ), 
                new vec4(0,0.7,0.7))
            ).setData({type: '_arrow_rotX'}
        ),
        new Object().setData(
            translateData( rotateData( generateDoubleArrow(0.8, .1, 8, new vec4(.5,1,.5,0.2), .05, 0.75, false ),  new vec4(0,-Math.PI/4) )
            , new vec4(0.7,0,0.7))
            ).setData({type: '_arrow_rotY'}
        ),
        new Object().setData(
            translateData( rotateData( generateDoubleArrow(0.8, .1, 8, new vec4(.5,.5,1,0.2), .05, 0.75, false ),  new vec4(-Math.PI/4,-Math.PI/2) )
            , new vec4(0.7,0.7,0))
            ).setData({type: '_arrow_rotZ'}
        ),
    ];

    let text = `@_type:default_id:29401_position:0,0,-3,0_rotation:0,0,0,0_scale:1,1,1,1_
    @_type:default_id:149610_position:1,0,-3,0_rotation:0,0,0,0_scale:1,1,1,1_
    @_type:default_id:813754_position:2,0,-3,0_rotation:0,0,0,0_scale:1,1,1,1_
    @_type:default_id:828032_position:0,1,-3,0_rotation:0,0,0,0_scale:1,1,1,1_
    @_type:default_id:850914_position:2,1,-3,0_rotation:0,0,0,0_scale:1,1,1,1_
    @_type:default_id:675529_position:0,2,-3,0_rotation:0,0,0,0_scale:1,1,1,1_
    @_type:default_id:598242_position:1,2,-3,0_rotation:0,0,0,0_scale:1,1,1,1_
    @_type:default_id:603387_position:2,2,-3,0_rotation:0,0,0,0_scale:1,1,1,1_
    @_type:default_id:156834_position:1,1,-1,0_rotation:0,0,0,0_scale:1,1,1,1_  `;

    //loadFile(text);

    updateObjectsContainer();

    

    let o1 = new Object();
    let o2 = new Object();
    //let o2 = new Object(new vec4(0.5,-0.5,0.5,0));

    subtractMesh(o1, o2);

    addObject(o1, true);
    addObject(o2, true);
    //simplifyMesh(o.vertices, o.indices, o.normals);
}
function update() {
    if (!run)
    {
        return;
    }
    //Update tick 
    tick += 1;

    //Update camera position & rotation
    camera.update(pressedKeys);


    //update moving & rotation objects - mouse drag function
    updateMouseArrowDrag();

    //render scene
    render();

    mouseJustDown = false;
    mouseMovedLast += 1;
}

function slowUpdate()
{
    //We want to do this to update values
    updateObjectsContainer();

    //Update cursor (if hovering, should be pointer, if )
    updateMouseCursor();


    if (objects.length > 1)
    {
        //console.log("subMesh");
        //subtractMesh(objects[0], objects[1]);
    }

}


function render()
{
    let pm = projectionMatrix;
    let vm = camera.getViewMatrix();
    let wm = pm.mul(vm);

    //Clear Screen
    gl.clearColor(1, 1, 1, 1);    // Clear to white, fully opaque
    gl.clearDepth(1);                   // Clear everything
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.CULL_FACE);

    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.viewport(0, 0, glCanvasElement.width, glCanvasElement.height);

    
    //Draw each grid
    for (var i=0; i<grids.length; i++)
    {
        grids[i].render(gl, wm, new vec4(1,1,1,1));
    }


    //Draw Selected Object
    if (selectedObject != null)
    {
        gl.depthMask(false); // turn off depth write
        gl.disable(gl.CULL_FACE);
        let t = new Date().getTime();
        let v1 = Math.sin(t/200)/10 + 0.9;
        selectedObject.render(gl, wm, new vec4(v1,v1,v1,0.8));
        //gl.depthMask(true);
        //gl.disable(gl.CULL_FACE);
    } else {
        gl.depthMask(true); 
    }

    //Draw Each object, all but selected object (selectde object has transparency, so render last)
    for (var i=0; i<objects.length; i++)
    {
        if (selectedObject != objects[i])
        {
            if (selectedObject != null)
            {
                objects[i].render(gl, wm, new vec4(1,1,1,0.5));
            } else {
                objects[i].render(gl, wm);
            }
        }
    }

    if (selectedObject != null)
    {
        //gl.clearDepth(1);
        //gl.clear( gl.DEPTH_BUFFER_BIT );
        gl.depthMask(true);
        
        let d = distanceBetweenPoints( selectedObject.getPosition(), camera.getPosition() )/4;


        for (var i=0; i<arrows.length; i++)
        {
            arrows[i].setPosition(selectedObject.getPosition());
            arrows[i].setScale( new vec4(d, d, d, d) );
            if (arrows[i] == selectedArrow)
            {
                arrows[i].render(gl, wm);
            } else {

                arrows[i].render(gl, wm, new vec4(1,1,1,0.5));
            }/*
             else if (arrows[i].id == selectedArrow.id)
            {
                arrows[i].render(gl, vm);//new vec4(1,1,1,1));
            } else {
                arrows[i].render(gl, vm, new vec4(1,1,1,0.5));
            }*/
            
        }
    }


    gl.depthMask(true);

    //Draw Compass
    compass.draw(gl,pm,vm);
}
function getObjectFromMousePos()
{

    let wm2 = projectionMatrix.mul(camera.getViewMatrix());
    return mouseFrameBuffer.getObject(gl, wm2, objects, arrows);
    // create to render to
    const targetTextureWidth = Math.round(glCanvasElement.width);
    const targetTextureHeight = Math.round(glCanvasElement.height);
    const targetTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, targetTextureWidth, targetTextureHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    
    // Create and bind the framebuffer
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    // attach the texture as the first color attachment
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTexture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);

    // create a depth renderbuffer
    const depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, targetTextureWidth, targetTextureHeight);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, targetTextureWidth, targetTextureHeight);
    
    gl.clearColor(1, 1, 1, 1);    // Clear to white, fully opaque
    gl.clearDepth(1);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.enable(gl.CULL_FACE);
    gl.depthMask(true);
    gl.disable(gl.BLEND);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    
    

    //Draw Each object, all but selected object (selectde object has transparency, so render last)
    let wm = projectionMatrix.mul(camera.getViewMatrix());
    let color = new vec4(0,0,0,1);
    for (var i=0; i<objects.length; i++)
    {
        color.x = i/255;
        objects[i].renderPicker(gl, wm, color);
    }

    //We only want to render and search for the translation&rotation arrows if an object is already selected
    if (selectedObject != null)
    {
        gl.clear(gl.DEPTH_BUFFER_BIT);
        for (var i=0; i<arrows.length; i++)
        {
            color.x = (i+objects.length)/255;
            arrows[i].renderPicker(gl, wm, color);
        }
    }


    //create buffer for pixel
    let pixels = new Uint8Array(4);

    //Scale x and y to the correct texture width & height
    let bb = glCanvasElement.getBoundingClientRect();
    let x = mouseCanvasPos.x / bb.width;
    let y = (bb.height - mouseCanvasPos.y) / bb.height;
    x = Math.round(x * targetTextureWidth);
    y = Math.round(y * targetTextureHeight);

    //Read Pixels
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    //Detach framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    color.set(pixels[0], pixels[1], pixels[2], pixels[3]);

    //return object
    if (color.x >= 0 && color.x < objects.length)
    {
        return objects[color.x];
    }
    if (color.x >= objects.length && color.x < objects.length + arrows.length)
    {
        //console.log(arrows[color.x-objects.length].type);
        return arrows[color.x-objects.length];
    }
    return null;
}

function updateMouseCursor()
{
    //Don't update if we haven't moved the mouse recently EDIT - do update - we might have translated the camera
    if (mouseMovedLast > 15)
    {
        if (mouseMovedLast < 100)
        {
            return;
        }
    }

    //Update mouse cursor style
    let obj = getObjectFromMousePos();
    if (obj != null)
    {
        if (obj.type.substring(0,7) == '_arrow_')
        {
            glCanvasElement.style.cursor = "move";
        } else {
            if (selectedObject != null)
            {
                glCanvasElement.style.cursor = "grabber";
            } else {
                glCanvasElement.style.cursor = "pointer";
            }
        }
    } else {
        glCanvasElement.style.cursor = "default";
    }

    if (mouseIsDown)
    {
        glCanvasElement.style.cursor = "grabbing";
    }
}
function updateMouseArrowDrag()
{

    //Update selectedObject position if we are currently dragging an arrow.
    if (selectedArrow != null && mouseIsDown && selectedObject != null)
    {
        let objPos = selectedObject.getPosition();
        let objRot = selectedObject.getRotation();
        let rayD_pos = null;
        let rayD_rot = null;
        let rayS = null;
        switch(selectedArrow.type)
        {
            case '_arrow_posX': rayD_pos = new vec4(1,0,0); break;
            case '_arrow_posY': rayD_pos = new vec4(0,1,0); break;
            case '_arrow_posZ': rayD_pos = new vec4(0,0,1); break;
            case '_arrow_rotX': rayD_rot = new vec4(0,.7,-.7); rayS = new vec4(0,.7,.7); break;
            case '_arrow_rotY': rayD_rot = new vec4(.7,1,-.7); rayS = new vec4(.7,0,.7); break;
            case '_arrow_rotZ': rayD_rot = new vec4(-.7,.7,0); rayS = new vec4(.7,.7,0); break;
            default:
                console.error("Error in mouseMoved(): global var 'selectedArrow' is not of type:'xarrow', 'yarrow', or 'zarrow'. Critical error! Where the f*** did you set 'selectedArrow'?");
                break;
        }
        //If rayD_pos is not null, then a posX/Y/Z arrow must be selected
        //USED FOR TRANSLATING _arrow_pos*
        if (rayD_pos != null)
        {
            let newPos = closestPointOnRayToRay(rayD_pos, objPos, mouseDirectionVector, camera.getPosition());
            if (newPos != null)
            {
                if (mouseJustDown) //if it's the first run since the mouse was clicked, we need to record the mouseDeltaVector to object origin
                {
                    mouseDeltaVector = objPos.sub(newPos);
                } else{
                    newPos.addi(mouseDeltaVector);
                    newPos.round(.1); //round to nearest .1
                    selectedObject.setPosition(newPos);   
                }
            }
        }

        //USED FOR ROTATION _arrow_rot*
        if (rayD_rot != null)
        {
            rayS.addi(objPos);

            if (mouseJustDown)
            {
                let newPos = closestPointOnRayToRay(rayD_rot, rayS, mouseDirectionVector, camera.getPosition());
                mouseDeltaVector = rayS.sub(newPos);
            }

            rayS.subi(mouseDeltaVector);

            let d = distToClosestPointOnRayToRay(rayD_rot, rayS, mouseDirectionVector, camera.getPosition());
            d = Math.round( (d*180/Math.PI)/15 ) * 15 * Math.PI/180; //Rounding d to nearest 15 degrees
            if (selectedArrow.type == '_arrow_rotX')
            {
                objRot.z = -d;
                selectedObject.setRotation(objRot);
            } else if (selectedArrow.type == '_arrow_rotY')
            {
                objRot.y = d;
                selectedObject.setRotation(objRot);
            } else if (selectedArrow.type == '_arrow_rotZ')
            {
                objRot.x = d;
                selectedObject.setRotation(objRot);
            }            
        }
    }
}









function screenToWorldVector(screenScaledPos, projectionMatrix, cameraRotationMatrix)
{
    screenScaledPos.z = 0;
    screenScaledPos.a = 1;
    let p = (projectionMatrix.mul(cameraRotationMatrix)).invert().mul(screenScaledPos);
    p.a = 1/p.a;
    p.x *= p.a;
    p.y *= p.a;
    p.z *= p.a;
    p.a = 0;
    return  p.scaleToUnit() ;
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