

//Sketch-specific Variables
const sketchMenuElement = document.getElementById('createSketchMenu');
const sketchMenuCanvasElement = document.getElementById('createSketchCanvas');
var planeId = 'xzPlane';
var createSketchMenuIsOpen = false;

var editingSketch = false;

var currentSketch = null;


//Shows create-sketch menu
function enable_create_sketch_menu()
{
    createSketchMenuIsOpen = true;
    //enable menu
    sketchMenuElement.style.display = 'block';

    //Center sketch menu in glCanvas
    const glCanvasRect = glCanvasElement.getBoundingClientRect();
    const sketchMenuElementRect = sketchMenuElement.getBoundingClientRect();
    sketchMenuElement.style.left = glCanvasRect.left + glCanvasRect.width/2 - sketchMenuElementRect.width/2;
    sketchMenuElement.style.top = glCanvasRect.top + glCanvasRect.height/2 - sketchMenuElementRect.height/2;

    planeId = 'xzPlane'

    create_sketch_menu_plane_onclick();
}

//Hides create-sketch menu
function disable_create_sketch_menu()
{
    createSketchMenuIsOpen = false;
    sketchMenuElement.style.display = 'none';
}

//button handler for create-sketch menu (for plane selection buttons)
function create_sketch_menu_plane_onclick(element)
{
    var p = new Painter(sketchMenuCanvasElement);
    p.Clear('lightgrey');
    var center = new Point(sketchMenuCanvasElement.width/2, sketchMenuCanvasElement.width*7/11);

    var pR = new Point((center.x + sketchMenuCanvasElement.width)/2, (center.y + sketchMenuCanvasElement.height)/2); //pointRight
    var pL = new Point(center.x/2, (center.y + sketchMenuCanvasElement.height)/2); //pointLeft
    var pU=  new Point(center.x, center.y/2); //pointUp


    if (element != null)
    {
        planeId = element.id;
    }
    
    switch (planeId)
    {
        case 'xzPlane': p.DrawTriangleFilled(center.x, center.y, (center.x + sketchMenuCanvasElement.width)/2, (center.y + sketchMenuCanvasElement.height)/2, center.x/2, (center.y + sketchMenuCanvasElement.height)/2, rgbToHex(255,0,255));
                        p.DrawTriangleFilled(center.x,  sketchMenuCanvasElement.height, (center.x + sketchMenuCanvasElement.width)/2, (center.y + sketchMenuCanvasElement.height)/2, center.x/2, (center.y + sketchMenuCanvasElement.height)/2, rgbToHex(255,0,255));
                        document.getElementById(planeId).style.opacity = '100%';
                        break;
        case 'xyPlane': var corner = new Point( (center.x+sketchMenuCanvasElement.width)/2, (center.y+sketchMenuCanvasElement.height)/2 - center.y/2 );
                        p.DrawTriangleFilled(center.x, center.y, (center.x + sketchMenuCanvasElement.width)/2, (center.y + sketchMenuCanvasElement.height)/2, corner.x, corner.y, rgbToHex(255,255,0));
                        p.DrawTriangleFilled(center.x, center.y, center.x, center.y /2, corner.x, corner.y, rgbToHex(255,255,0));
                        break;
        case 'yzPlane': var corner = new Point( (center.x)/2, (center.y+sketchMenuCanvasElement.height)/2 - center.y/2 );
                        p.DrawTriangleFilled(center.x, center.y, center.x/2, (center.y + sketchMenuCanvasElement.height)/2, corner.x, corner.y, rgbToHex(0,255,255));
                        p.DrawTriangleFilled(center.x, center.y, center.x, center.y /2, corner.x, corner.y, rgbToHex(0,255,255));
                        break;
    }

    p.DrawLine(center.x, center.y, 0, sketchMenuCanvasElement.height, 'blue');
    p.DrawLine(center.x, center.y, sketchMenuCanvasElement.width, sketchMenuCanvasElement.height, 'red');
    p.DrawLine(center.x, center.y, sketchMenuCanvasElement.width/2, 0, 'ggreen');
}

//Button in create-sketch menu, actually starts the creation of a new sketch
function create_sketch_menu_create_onclick()
{
    //Hide create-sketch menu
    disable_create_sketch_menu();
    console.log("Creating sketch. Plane: " + planeId);

    var pos;
    var rot;

    switch (planeId)
    {
        case 'xzPlane': pos = new vec4(0,10,0);  rot = new vec4(0,0,Math.PI/2); break;
        case 'xyPlane': pos = new vec4(0,0,10);  rot = new vec4(0,0,0); break;
        case 'yzPlane': pos = new vec4(10,0,0);  rot = new vec4(0,-Math.PI/2,0); break;
    }

    //pos = new vec4(0,0,10);  rot = new vec4(0,0,Math.PI/4);

    //Make View Orthogonal
    updateCameraSettings(document.getElementById('orthogonalViewCheckbox'));

    //Move to correct Position
    camera.slideToPositionAndRotation(pos, rot.mul(1));



    pos = new vec4();//grid position should always start as 0,0,0

    //Make Plane/Grid
    var g;
    for (var i=0; i<grids.length; i++)
    {
        if (grids[i].getPosition().equals(pos) && grids[i].getRotation().equals(rot))
        {
            //Found correct grid
            g = grids[i];
            grids[i].enableDraw = true;
            //console.log("Found Correct Plane");
        } else {
            //console.log("Other grid: " + grids[i].getPosition() + "  " + grids[i].getRotation());
            //Incorrect grid - turn off drawing
            grids[i].enableDraw = false;
        }
    }
    if (g == null)
    {
        console.log("Creating New Plane @ " + pos + "  " + rot);
        g = new Grid(new vec4(), rot);
        grids.push(g);
    }

    editingSketch = true;
    currentSketch = new Sketch(new vec4(), new vec4(), g);
}



class Sketch extends Object{
    constructor(position = new vec4(), rotation = new vec4(), grid = new Grid()) {
        super(position, rotation);

        this.grid = grid;

        this.lines = [];

        this.vertices = [0,0,0,  1,0,0, -1,0,0,  0,1,0,  0,-1,0,  0,0,1,  0,0,-1];
        this.normals = [0,1,0,  0,1,0,  0,1,0,  0,1,0,   0,1,0,   0,1,0,  0,1,0];
        this.colors = [0,0,0,1, 1,0,0,1,, 1,0,0,1, 0,1,0,1, 0,1,0,1, 0,0,1,1, 0,0,1,1,];
        this.indices = [0,1, 0,2, 0,3, 0,4, 0,5, 0,6];

        this.refresh();
    }

    setGrid(grid)
    {
        if (grid instanceof Grid)
        {
            this.grid = grid;
        } else {
            console.error("Sketch.setGrid() requires a Grid object as an argument.");
        }
    }

    addLine(pos1, pos2) {
        lines.push([pos1, pos2]);
    }

    draw(gl, projectionMatrix, viewMatrix)
    {
        if (!this.enableDraw) {return;}
        DrawDefault(gl, projectionMatrix, viewMatrix, this.objectMat, this.indices, this.buffers, false);
    }
}