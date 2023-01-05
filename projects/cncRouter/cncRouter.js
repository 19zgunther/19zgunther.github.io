
const canvasElement = document.getElementById("mainCanvas");
canvasElement.addEventListener("mousedown", eventListener);
window.addEventListener("mouseup", eventListener);
canvasElement.addEventListener("mousemove", eventListener);
canvasElement.addEventListener("mousewheel", eventListener);
window.addEventListener("keydown", eventListener);
window.addEventListener("keyup", eventListener);


var objRenderer = new OBJFileRenderer(canvasElement, objDataText,new vec4(0,0,20), new vec4(0,0,0,1));
objRenderer.setObjectRotation(new vec4(0,0,-1.55));

let updateInterval = setInterval(render, 60);

var pressedKeys = new Map()

//window.addEventListener("keydown", )



function render()
{
    objRenderer.render();
    try {
        objRenderer.setObjectRotation( objRenderer.getObjectRotation().add(0.00, 0.004, 0));
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
    }
}




