/***********************************************************************************************
*  Code Written by Zack Gunther
*  If you would like to copy or use this code email me at 19zgunther@gmail.com to ask permission.
************************************************************************************************/


/*
class Segment
{
    constructor(easyGl, basePosition = new vec4(), rotation = new vec4(0.5,0,0), length = 1, color = new vec4(1,0,0,1))
    {
        this.easyGl = easyGl;
        this.id = String(Math.random());

        this.length = length;
        this.color = color;
        this.rotation = rotation;
        this.pSegment = null;

        this.rotationMatrix = new mat4().makeRotation(this.rotation);
        this.translationMatrix = new mat4().makeTranslation(new vec4(0,this.length, 0));

        this.transform = this.rotationMatrix.mul(this.translationMatrix);

        easyGl.createObject(this.id, new vec4(), this.rotation, new vec4(0.2,0.2,0.2), null, null, null, color);
    }
    setPreviousSegment(seg)
    {
        this.pSegment = seg;
    }
    getTransform()
    {
    }
    render()
    {
        if (this.pSegment != null)
        {
            //const e = this.getTransform().mul(new vec4(1,1,1));
            //easyGl.setObjectPosition(this.id, e);
            easyGl.setObjectPosition(this.id, new vec4(0, this.length, 0));
        }
        easyGl.renderObject(this.id);
    }
}
*/


class Segment
{
    constructor(easyGl, p1, p2)
    {
        this.width = 0.2;
        this.p1 = p1;
        this.p2 = p2;
        this.id = String(Math.random());
        this.position = this.p1.add(this.p2).muli(0.5);
        this.length = distanceBetweenPoints(this.p1, this.p2);
        this.scale = new vec4(this.width, this.length, this.width);

        //this.rotation = this.p1.sub(this.p2).scaleToUnit();
        let vec = this.p2.sub(this.p1).scaleToUnit();


        this.rotation =vec;

        this.easyGl = easyGl;

        easyGl.createObject(this.id, this.position, this.rotation, this.scale);
    }
}


//const blockMineTimes = [ 0.1,  0.15,  0.25,  0.3, .2, .2, .2, .2, .2, .2, .2, .2, .2];
const backgroundColor = new vec4(0.3,0,0.3,1);

//Get canvas & set width & height
const canvasElement = document.getElementById("mainCanvas");
const bb = canvasElement.getBoundingClientRect();
canvasElement.width = bb.width;
canvasElement.height = bb.height;

const scaleMatrix = new mat4().makeScale(canvasElement.height/canvasElement.width,1,1);
const identityMatrix = new mat4().makeIdentity();

//Create easyGl, Player, chunkmanager, and entities
const easyGl = new EasyGL(canvasElement, backgroundColor);

easyGl.setCameraPosition(new vec4(0,0,4));
easyGl.setCameraRotation(new vec4());
easyGl.enableRenderingReverseFaces(true);

easyGl.setSortingTimeDelayMs(100);
easyGl.resizeListener(); //resize canvas & gl
sliderInput(); //set FOV, zNear, and zFar to slider defaults

canvasElement.addEventListener("mousedown", eventListener);
document.addEventListener("mouseup", eventListener);
canvasElement.addEventListener("mousemove", eventListener);
document.addEventListener("keydown", eventListener);
document.addEventListener("keyup", eventListener);



/*
const s1 = new Segment(easyGl, new vec4(), new vec4(), 1, new vec4(1,0,0,1));
const s2 = new Segment(easyGl, new vec4(0), new vec4(0,0,0), 1, new vec4(0,1,0,1));
const s3 = new Segment(easyGl, new vec4(0), new vec4(0,0,0), 1, new vec4(0,0,1,1));
const s4 = new Segment(easyGl, new vec4(0), new vec4(0,0,0), 1, new vec4(1,0,1,1));

const segments = [s1,s2,s3,s4];

s2.setPreviousSegment(s1);
s3.setPreviousSegment(s2);*/

const s1 = new Segment(easyGl, new vec4(), new vec4(0,2,2));
const s0 = new Segment(easyGl, new vec4(), new vec4(0,1,0),);
const s01 = new Segment(easyGl, new vec4(0,2,2), new vec4(0,3,2));

let renderInterval = setInterval(render, 50);
 
function eventListener(event)
{
    switch (event.type)
    {
        case "keydown":
            let key = event.key.toLowerCase();
            switch (key)
            {
                case "w": easyGl.setCameraPosition( easyGl.getCameraPosition().add(0,0,0.1) ); break;
                case "s": easyGl.setCameraPosition( easyGl.getCameraPosition().add(0,0,-0.1) ); break;
            }
            break;
    }
}

//Render/update loop
function render()
{

    easyGl.clear();
    easyGl.renderAll();
    /*for (let i=0; i<segments.length; i++)
    {
        segments[i].render();
    }
    easyGl.createObject("n", null, null, new vec4(0.1, 0.1, 0.1), null, null, null, new vec4(1,0,0,1));
    easyGl.renderObject("n");*/
}


//Handle FOV, zNear, and zFar changes
function sliderInput()
{
    let zNear = Number(document.getElementById('zNearInput').value);
    let zFar = Number(document.getElementById('zFarInput').value);
    let FOV = Number(document.getElementById('fovInput').value);

    //zNear = Math.round(zNear);
    //zFar = Math.round(zFar);

    console.log("zNear: " + zNear + "\nzFar: " + zFar + "\nFOV: " + FOV);

    easyGl.setPerspective(FOV, null, zNear, zFar);
}

