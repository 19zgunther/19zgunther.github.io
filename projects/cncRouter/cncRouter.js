
const canvasElement = document.getElementById("mainCanvas");
canvasElement.addEventListener("mousedown", eventListener);
window.addEventListener("mouseup", eventListener);
canvasElement.addEventListener("mousemove", eventListener);
canvasElement.addEventListener("mousewheel", eventListener);
window.addEventListener("keydown", eventListener);
window.addEventListener("keyup", eventListener);


let objRenderer = new OBJFileRenderer(canvasElement, objDataText, new vec4(0,0,30), new vec4(0,0,0,1));
objRenderer.setObjectRotation(new vec4(0,0,-1.55));

let updateInterval = setInterval(render, 60);
let mouseIsDown = false;
let pressedKeys = new Map()


let rotationSpeed = 0;
const rotationAcceleration = 0.0001;
const maxRotationSpeed = 0.004;


function render()
{
    objRenderer.render();

    if (rotationSpeed < maxRotationSpeed && !mouseIsDown)
    {
        rotationSpeed += rotationAcceleration;
    }
    try {
        objRenderer.setObjectRotation( objRenderer.getObjectRotation().add(0.00, rotationSpeed, 0));
    } catch (error) {
        
    }
    if (pressedKeys.get('w'))
    {
        objRenderer.setObjectPosition(objRenderer.getObjectPosition().add(0,0,0.1));
    } else if (pressedKeys.get('s'))
    {
        objRenderer.setObjectPosition(objRenderer.getObjectPosition().add(0,0,-0.1));
    }
}

function eventListener(e)
{
    objRenderer.eventListener(e);
    if (e.type == "keyup")
    {
        pressedKeys.set(e.key.toLowerCase(), false);
    } else if (e.type == "keydown")
    {
        pressedKeys.set(e.key.toLowerCase(), true);
    } else if (e.type == "mousewheel")
    {
        rotationSpeed = 0;
    } else if (e.type == "mousedown")
    {
        mouseIsDown = true;
        rotationSpeed = 0;
    } else if (e.type == "mouseup")
    {
        mouseIsDown = false;
    }
}




