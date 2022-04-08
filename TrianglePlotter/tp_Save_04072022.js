


const canvas = document.getElementById('myCanvas');
const p = new Painter(canvas);
const gridSize = 20;
const gridColor = '#444444';
const selectedTriangleColor = '#993333';
const triangleColor = '#991111';
const triangleEdgeColor = '#995555';
var mouseCanvasPos = new Point();
var shiftIsDown = false;
var controlIsDown = false;

Setup();

var updateInterval = setInterval( Update,  1000/10 );
var currentComp = null;
var step = 0;


var triangles = [];
document.addEventListener('keydown', keyPressed);
document.addEventListener('keyup', keyReleased);

function Setup()
{
    
    canvas.width = 600;
    canvas.height = 600;
    canvas.style.width = 600;
    canvas.style.height = 600;
}

function mouseDown(event)
{
    var rect = canvas.getBoundingClientRect();
    var pos = new Point();
    pos.x = event.clientX - rect.left;
    pos.y = event.clientY - rect.top;
    pos = roundToGrid(pos);

    //console.log(pos);

    if (shiftIsDown)
    {
        var bestDist = 1000000;
        for (var i=0; i<triangles.length; i++)
        {
            var d1 = distBetweenPoints(triangles[i].p1, pos);
            var d2 = distBetweenPoints(triangles[i].p2, pos);
            var d3 = distBetweenPoints(triangles[i].p3, pos);
            var d = Math.min(d1,d2,d3);
            if (d <= bestDist)
            {
                bestDist = d;
                currentComp = triangles[i];
                if (d == d1) { step = 10; } 
                else if (d == d2) { step = 11; }
                else if (d == d3) { step = 12; }
            }
        }

    } else {
        if (currentComp == null)
        {
            currentComp = new Triangle(pos);
            triangles.push(currentComp);
            step = 1;
        } else if (step == 1) {
            currentComp.setP2(pos);
            step = 2;
        } else if (step == 2) {
            currentComp.setP3(pos);
            step = 0;
            currentComp = null;
        }   else {
            currentComp = null;
            step = 0;
        }
    }

    mouseCanvasPos = pos;
}

function keyPressed(event)
{
    var keyCode = event.key;
    //console.log(keyCode);

    switch(keyCode)
    {
        case 'Escape':
            if (step != 0) { removeComponentFromList(triangles, currentComp); }
            currentComp = null; step = 0; break;
        case 'Shift':
            var d = document.getElementById('shiftIsDownDiv');
            d.innerHTML = "Shift Is Down";
            d.style.backgroundColor = 'green';
            shiftIsDown = true; break;
        case 'Backspace':
            removeComponentFromList(triangles, currentComp); currentComp = null; step = 0; break;
        case 'Delete':
            currentComp = null;
            triangles = [];
            step = 0;
            break;
        case 'P' || 'p':
            print();
            break;
        case 'Control':
            controlIsDown = true;
            break;
    }
}

function keyReleased(event)
{
    var keyCode = event.key;
    switch(keyCode)
    {
        case 'Shift': 
            var d = document.getElementById('shiftIsDownDiv');
            d.innerHTML = "Shift Is Up";
            d.style.backgroundColor = 'red';
            shiftIsDown = false; break;
        case 'Control':
            controlIsDown = false;
            break;
    }
}

function mouseMove(event)
{
    var rect = canvas.getBoundingClientRect();
    var pos = new Point();
    pos.x = event.clientX - rect.left;
    pos.y = event.clientY - rect.top;
    mouseCanvasPos = roundToGrid(pos);
}


function Update()
{
    //console.log("Current Comp: " + currentComp + "   step: "  +step);
    p.Clear('black');

    //p.SetTextSize(370);
    //p.DrawText(canvas.width/2-5,canvas.height/2,"B",'blue')

    
    for (var i=Math.floor(canvas.width/2); i<canvas.width; i+= gridSize)
    {
        p.DrawLine(i, 0, i, canvas.height,gridColor);
        p.DrawLine(canvas.width-i, 0, canvas.width-i, canvas.height,gridColor);
    }

    for (var i=Math.floor(canvas.height/2); i<canvas.height; i+= gridSize)
    {
        p.DrawLine(0, i, canvas.width,  i, gridColor);
        p.DrawLine(0, canvas.height-i, canvas.width, canvas.height-i,gridColor);
    }

    p.DrawRect(canvas.width/2, canvas.height/2, 4*gridSize, -8*gridSize, 'yellow');
    p.DrawRect(canvas.width/2, canvas.height/2, 4*gridSize, -5*gridSize, 'yellow');
    p.DrawRect(canvas.width/2, canvas.height/2, 4*gridSize, 2*gridSize, 'yellow');



    if (currentComp == null)
    {

    } else if (step == 1) {
        currentComp.setP2(mouseCanvasPos);
    } else if (step == 2) {
        currentComp.setP3(mouseCanvasPos);
    } else if (step == 10) {
        currentComp.setP1(mouseCanvasPos);
    } else if (step == 11) {
        currentComp.setP2(mouseCanvasPos);
    } else if (step == 12) {
        currentComp.setP3(mouseCanvasPos);
    }




    for     (var i=0; i<triangles.length; i++)
    {
        triangles[i].draw();
    }
}

function roundToGrid(pos)
{
    var x = pos.x - canvas.width/2;
    var y = pos.y - canvas.height/2;
    var gs = gridSize;
    if (controlIsDown)
    {
        gs = gs/2;
    }

    x = Math.round(x/gs)*gs;
    y = Math.round(y/gs)*gs;

    return new Point(x,y);
}

class Triangle
{
    constructor(p1,p2,p3)
    {
        if (p1 != null) {this.p1 =p1; } else { this.p1 = new Point(); }
        if (p2 != null) {this.p2 =p2; } else { this.p2 = new Point(); }
        if (p3 != null) {this.p3 =p3; } else { this.p3 = new Point(); }
    }

    setP1(pos)
    {
        this.p1 = pos;
    }
    setP2(pos)
    {
        this.p2 = pos;
    }
    setP3(pos)
    {
        this.p3 = pos;
    }

    draw()
    {
        //console.log(this.p1 + " " + this.p2 + " " + this.p3);
        if (this == currentComp)
        {
            p.DrawTriangleFilled(this.p1.x+canvas.width/2,this.p1.y+canvas.height/2, this.p2.x+canvas.width/2,this.p2.y+canvas.height/2, this.p3.x+canvas.width/2,this.p3.y+canvas.height/2, selectedTriangleColor);
        } else {
            p.DrawTriangleFilled(this.p1.x+canvas.width/2,this.p1.y+canvas.height/2, this.p2.x+canvas.width/2,this.p2.y+canvas.height/2, this.p3.x+canvas.width/2,this.p3.y+canvas.height/2, triangleColor);
        }
        
        p.DrawLine(this.p1.x+canvas.width/2,this.p1.y+canvas.height/2, this.p2.x+canvas.width/2,this.p2.y+canvas.height/2, triangleEdgeColor);
        p.DrawLine(this.p1.x+canvas.width/2,this.p1.y+canvas.height/2, this.p3.x+canvas.width/2,this.p3.y+canvas.height/2, triangleEdgeColor);
        p.DrawLine(this.p3.x+canvas.width/2,this.p3.y+canvas.height/2, this.p2.x+canvas.width/2,this.p2.y+canvas.height/2, triangleEdgeColor);
    }
}

function print_OLD() 
{

    var vertices = [];
    var indices = [];

    var points = [];
    var inds = [];

    for (var i=0; i<triangles.length; i++)
    {
        var t = triangles[i];

        var k = indexInList(points, t.p1);
        if (k != -1)
        { //point is in list!
            indices.push(inds[k]);
        } else {
            points.push(t.p1);
            indices.push(inds.length);
            inds.push(inds.length);
        }

        k = indexInList(points, t.p2);
        if (k != -1)
        { //point is in list!
            indices.push(inds[k]);
        } else {
            points.push(t.p2);
            indices.push(inds.length);
            inds.push(inds.length);
        }

        k = indexInList(points, t.p3);
        if (k != -1)
        { //point is in list!
            indices.push(inds[k]);
        } else {
            points.push(t.p3);
            indices.push(inds.length);
            inds.push(inds.length);
        }
    }

    var w = 300;
    for (var i=0; i<points.length; i++)
    {
        vertices.push(points[i].x/w);
        vertices.push(-points[i].y/w);
        vertices.push(0);
    }


    console.log("Vert.Len = " + vertices.length + "   ind.len = " + indices.length);
    var s = 'Vertices: ' + vertices + "  Indices: "  +indices;
    console.log(s);
    document.getElementById('output').innerHTML = s;



}

function indexInList(list, p)
{
    for (var i=0; i<list.length;i++)
    {
        if (p.equals(list[i]))
        {
            return i;
        }
    }
    return -1;
}

function print_numbers()
{

    var points = [];
    var vertices = [];
    var indices = [];

    for (var i=0; i<5; i++)
    {
        for (var j=0; j<8; j++)
        {
            points.push( new Point(i/10, j/10));
            vertices.push(i/10);
            vertices.push(j/10);
            vertices.push(0);
        }
    }


    for (var i=0; i<triangles.length;i++)
    {
        var t = triangles[i];
        var w = gridSize*10;
        var k = indexInList(points, new Point(t.p1.x/w, -t.p1.y/w));
        console.log(t.p1);
        indices.push(k);
        k = indexInList(points, new Point(t.p2.x/w, -t.p2.y/w));
        indices.push(k);
        k = indexInList(points, new Point(t.p3.x/w, -t.p3.y/w));
        indices.push(k);
    }

    for (var i=0; i<indices.length; i++)
    {
        if (indices[i] < 0){
            console.error("Out of bounds");
        }
    }


    console.log("vertices: \n" + vertices + "\n\nindices: \n" + indices + "\n");
}


function print()
{
    var points = [];
    var vertices = [];
    var indices = [];

    for (var i=0; i<5; i++)
    {
        for (var j=-2; j<9; j++)
        {
            points.push( new Point(i/10, j/10));
            vertices.push(i/10);
            vertices.push(j/10);
            vertices.push(0);
        }
    }


    for (var i=0; i<triangles.length;i++)
    {
        var t = triangles[i];
        var w = gridSize*10;
        var k = indexInList(points, new Point(t.p1.x/w, -t.p1.y/w));
        console.log(t.p1);
        indices.push(k);
        k = indexInList(points, new Point(t.p2.x/w, -t.p2.y/w));
        indices.push(k);
        k = indexInList(points, new Point(t.p3.x/w, -t.p3.y/w));
        indices.push(k);
    }

    for (var i=0; i<indices.length; i++)
    {
        if (indices[i] < 0){
            console.error("Out of bounds");
        }
    }


    console.log("vertices: \n" + vertices + "\n\nindices: \n" + indices + "\n");
}