

class Shape
{
    constructor(easyGl)
    {
        this.easyGl = easyGl;
        this.color = new vec4(1,0,0,1);
        this.id = Math.floor(Math.random()*1000000);
        this.blocks = [new vec4(), new vec4(1,0), new vec4(0,-1), new vec4(0,-2)];
        this.pos = new vec4();
        for (let i=0; i<this.blocks.length; i++)
        {
            const blockId = this.id + i/10;
            easyGl.createObject(blockId);
            easyGl.setObjectColor(blockId, this.color);
        }
    }

    setPos( pos )
    {
        this.pos = pos;
        for (let i=0; i<this.blocks.length; i++)
        {
            const blockId = this.id + i/10;
            this.easyGl.setObjectPosition( blockId, pos.add(this.blocks[i]));
        }
    }
}

const canvasElement = document.getElementById("mainCanvas");
const bb = canvasElement.getBoundingClientRect();
const w = bb.width;
const h = bb.height;
canvasElement.width = w;
canvasElement.height = h;
const backgroundColor = new vec4(0.3,0,0.3,1);
const easyGl = new EasyGL(canvasElement, backgroundColor);
easyGl.setCameraPosition(0,0,-5);
easyGl.resizeListener();
easyGl.renderAll();


const mapWidth = 10;
const mapHeight = 20;

var currentShape;
var map = []; //in form map[row#][column#]
var shapes = [];
let fallSpeed = 1;
let lastUpdateTime = Date.now()/1000;

let updateInterval = setInterval(render, 80);

//create map
for (let i=0; i<mapHeight; i++)
{
    let l = [];
    for (let j=0; j<mapWidth; j++)
    {
        l.push(null);
    }
    map.push(l);
}




function getNewRandomShape()
{
    return new Shape(easyGl, );
}



function render()
{

    if (currentShape == null)
    {
        currentShape = getNewRandomShape();
    }
    
    //update current shape
    let pos = currentShape.pos.copy();
    pos.y -= (Date.now()/1000 - lastUpdateTime)*fallSpeed;
    currentShape.setPos( pos );

    lastUpdateTime = Date.now()/1000;
    easyGl.clear();
    easyGl.renderAll();
}