

CanvasElement = document.getElementById('mainCanvas')



var updateInterval = setInterval(Update, 100);
var calcInterval = setInterval(Calculate, 1000);



var mousePos = new Point();
var painter = new Painter(CanvasElement);
var gridWidth = 40;


var selectedComponent = null;   //component currently selected/using/moving/etc
var movingComponent = false;
var vectorToSelectedComponent = new Point(); //If we select a component, this holds the vector/offset from the mouseClick to the component location
var hoverComponent = null;      //the component currently hovering over - null if selectedComponent != null
var components = [];            //the list of all components
var wires = [];                 //the list of all wires
var nodes = [];                 //this list of all nodes
var drawMode = "";              //what type of component should be drawn next if any ex: "AND", "OR", or "XOR"

var selectedWirePointIndex = 0; //if we select a wire and want to move it, we'll want to know what point in its wire.points[] list we're moving



window.onresize = resizeCanvas();
document.addEventListener('keydown', key_pressed);
document.addEventListener('mouseUp', mouse_released);

function resizeCanvas()
{
    var rect = CanvasElement.getBoundingClientRect();
    CanvasElement.width = rect.width;
    CanvasElement.height = rect.height;
    painter = new Painter(CanvasElement);

    painter.Clear('#333333');

}


//Mouse Functions///////////////////////////////////////////////////////
function canvas_onmousedown(event)
{
    console.log("mouse down   DrawMode: " + drawMode);
    var rect = CanvasElement.getBoundingClientRect();
    mousePos.x = Math.round(event.clientX - rect.x);
    mousePos.y = Math.round(event.clientY - rect.y);


    //If we're currently drawing a wire....
    if (selectedComponent != null && selectedComponent instanceof Wire && drawMode == "Wire")
    {
        if (selectedComponent.points.length < 2) {
            selectedComponent.AddPoint(roundToGrid(mousePos, gridWidth));
            return;
        } else {
            if (distBetweenPoints( selectedComponent.points[0], selectedComponent.points[1]) < 2)
            {
                removeObjectFromList(wires, selectedComponent);
                console.log("Wire length too short - deleting!");
                return;
            }
            var pSelectedComponent = selectedComponent;
            selectedComponent = new Wire(pSelectedComponent.points[1]);
            selectedComponent.AddPoint(roundToGrid(mousePos, gridWidth));
            wires.push(selectedComponent);
            return;
        }
    }


    //Check if we're selecting an existing component
    selectedComponent = findComponentByPos( mousePos );
    if (selectedComponent != null)
    {
        if (selectedComponent instanceof Component)
        {
            vectorToSelectedComponent.x = -mousePos.x + selectedComponent.pos.x;
            vectorToSelectedComponent.y = -mousePos.y + selectedComponent.pos.y;
        } else if (selectedComponent instanceof Wire)
        {
            console.log("SELECTED WIRE");
        }
        movingComponent = true;
        return;
    }

    //Add a new component 
    if (selectedComponent == null && drawMode != "")
    {
        switch(drawMode)
        {
            case "Wire": selectedComponent = new Wire(roundToGrid(mousePos, gridWidth)); break;
            case "AND": selectedComponent = new AND(roundToGrid(mousePos, gridWidth)); break;
            case "OR": selectedComponent = new OR(roundToGrid(mousePos, gridWidth)); break;
            case "XOR": selectedComponent = new XOR(roundToGrid(mousePos, gridWidth)); break;
            case "NOR": selectedComponent = new NOR(roundToGrid(mousePos, gridWidth)); break;
            case "CLK": selectedComponent = new CLK(roundToGrid(mousePos, gridWidth)); break;
            case "INV": selectedComponent = new INV(roundToGrid(mousePos, gridWidth)); break;
        }
        movingComponent = true;
        if (selectedComponent != null && selectedComponent instanceof Component) { //If it's a new COMPONENT
            components.push(selectedComponent); 
        } else if (selectedComponent != null && selectedComponent instanceof Wire) { //if it's a new Wire
            wires.push(selectedComponent);
        }
    }
}
function canvas_onmousemove(event)
{
    var rect = CanvasElement.getBoundingClientRect();
    mousePos.x = Math.round(event.clientX - rect.x);
    mousePos.y = Math.round(event.clientY - rect.y);

    //Move selectedComponent
    if (selectedComponent != null && movingComponent == true)
    {
        if (selectedComponent instanceof Component) //If we're moving a COMPONENT
        {
            selectedComponent.SetPosition( roundToGrid(mousePos.add(vectorToSelectedComponent), gridWidth)  );
        } else if (selectedComponent instanceof Wire)
        {
            selectedComponent.points[selectedWirePointIndex] = roundToGrid(mousePos, gridWidth);
        }
    }
}
function canvas_onmouseup(event)
{
    console.log("mouse up");
    var rect = CanvasElement.getBoundingClientRect();
    mousePos.x = Math.round(event.clientX - rect.x);
    mousePos.y = Math.round(event.clientY - rect.y);
    
    movingComponent = false;
    if (selectedComponent != null && selectedComponent instanceof Component) //Stop moving component
    {

    } else {
        //console.log("selectedComponent == null");
    }
}

//Key Functions/////////////////////////////////////////////////////////
function key_pressed(event) {
    var keyCode = event.key;

    switch(keyCode)
    {
        case "Escape": 
            if (selectedComponent != null) {
                selectedComponent = null; break;
            } else {
                drawMode = ""; break;
            }
        case "w": drawMode = "Wire"; break;
        case "a": drawMode = "AND"; break;
        case "o": drawMode = "OR"; break;
        case "x": drawMode = "XOR"; break;
        case "n": drawMode = "NOR"; break;
        case "c": drawMode = "CLK"; break;
        case "i": drawMode = "INV"; break;
        case "Backspace":
            if (selectedComponent != null)
            {
                if (selectedComponent instanceof Component)
                {
                    removeObjectFromList(components, selectedComponent);
                    selectedComponent = null;
                } else if (selectedComponent instanceof Wire)
                {
                    removeObjectFromList(wires, selectedComponent);
                    selectedComponent = null;
                }
            }
            break;
        case "Delete": components = []; selectedComponent = null; wires = []; movingComponent = false;
    }

}
function mouse_released(event){
    var keyCode = event.key;
}



//Generic timed update - Update screen canvas
function Update()
{
    //console.log("Selected Component: " + selectedComponent);

    //Draw grid
    resizeCanvas();
    painter.Clear('#333333');
    painter.SetStrokeColor('#393939');
    painter.SetStrokeWidth(1);
    for (var i=0; i<CanvasElement.width; i+= gridWidth)
    {
        painter.DrawLine(i,0,i,CanvasElement.height);
        painter.DrawLine(0,i,CanvasElement.width,i);
    }


    //Component we're hovering over (mouse is over, or is within selectable range)
    var hoverComponent = findComponentByPos(mousePos);

    //Draw each component
    painter.SetStrokeWidth(1);
    painter.SetStrokeColor('gray');
    painter.SetTextColor('gray');
    for (var i=0; i<components.length; i++)
    {
        if ( (selectedComponent == null && components[i] == hoverComponent) || selectedComponent == components[i])
        {
            painter.SetStrokeWidth(3);
            components[i].Draw(painter);
            painter.SetStrokeWidth(1);
        } else {
            components[i].Draw(painter);
        }
    }

    for (var i=0; i<wires.length; i++)
    {
        painter.SetStrokeColor('gray');
        if ( (selectedComponent == null && wires[i] == hoverComponent) || selectedComponent == wires[i] )
        {
            painter.SetStrokeWidth(2);
            wires[i].Draw(painter);
            painter.SetStrokeWidth(1);
        } else {
            wires[i].Draw(painter);
        }
    }

}



//Utilities
function roundToGrid(pos, gridWidth)
{
    return new Point( Math.round(pos.x/gridWidth)*gridWidth, Math.round(pos.y/gridWidth)*gridWidth);
}
function findComponentByPos(mousePos)
{
    //Check if the mousePos is above a component
    for (var i=0; i<components.length; i++)
    {
        var c = components[i];
        if (mousePos.x > c.pos.x + c.padding && mousePos.x < c.pos.x+c.bodyWidth+c.padding &&
            mousePos.y > c.pos.y - c.padding && mousePos.y < c.pos.y+c.bodyHeight-c.padding
            )
        {
            return c;
        }
    }

    //check if it's near a wire
    var bestDist = gridWidth/2;
    var closestComp = null;
    for (var i=0; i<wires.length; i++)
    {
        /*var w = wires[i];
        
        //check if it's near an end point
        for (var j=0; j<w.points.length; j++)
        {
            if (distBetweenPoints(w.points[j], mousePos) < gridWidth/2)
            {
                selectedWirePointIndex = j;
                return w;
            }
        }*/
        var wire = wires[i];
        for (var j=0; j<wire.points.length-1; j++)
        {
            var p1 = wire.points[j];
            var p2 = wire.points[j+1];
            var dist = distBetweenPoints(p1,p2);
            var div = dist/(gridWidth/2);
            var xStep = (p2.x-p1.x)/div;
            var yStep = (p2.y-p1.y)/div;
            var p = new Point(p1.x, p1.y);
            var tempDist;
            for (var k=0; k<div; k++)
            {
                tempDist = distBetweenPoints(p,mousePos);
                if (tempDist < bestDist)
                {
                    bestDist = tempDist;
                    closestComp = wires[i];
                    var distFromPtoP1 = distBetweenPoints(p,p1);
                    if (distFromPtoP1 < dist/3)
                    {
                        selectedWirePointIndex = j;
                    } else if (distFromPtoP1 > dist * 2 / 3)
                    {
                        selectedWirePointIndex = j+1;
                    } else {
                        selectedWirePointIndex = j+0.5;
                    }
                }
                p.x += xStep;
                p.y += yStep;
            }
        }
    }

    return closestComp;
}




//Compute!
function Calculate()
{
    //RESETTING............................................................................
    //Start by reseting the wire voltages to undefined (null)
    for (var i=0; i<wires.length; i++)
    {
        wires[i].voltage = null;
        wires[i].node = null;
    }

    //   Also reset all component inputs
    for (var i=0; i<components.length; i++)
    {
        for (var j=0; j<components[i].inputs.length; j++)
        {
            components[i].inputs[j] = null;
        }
    }

    nodes = [];

    Route();

    //Lets also cover the scenario where an output node directly touches an input node without a wire.
    /*for (var c=0; c<components.length; c++) //for each component
    {
        var comp = components[i];

        for (var o=0; o<comp.numOutputs; o++) //for each output of comp
        {
            var node = comp.
            for (var c2=0; c2<components.length; c2++) //for each other component
            {
                if (c == c2) {continue;}
                for (var i=0; i<components[c2].numInputs; i++) //for each other component input
                {
                    if (comp.outputsPos[o].equals(components[c2].inputsPos[i]))
                    {
                        if (node == null)
                        {
                            node = new Node();
                            node.points.push(comp.outputsPos[o]);
                        } else {
                            
                        }
                    }
                }

            }
        }
    }*/

    console.log("Created " + nodes.length + " nodes");


    
    //PROPAGATING.............................................................................
    //Attempt to find solutions for the components
    for (var i=0; i<components.length; i++)
    {
        components[i].Update();
    }
    for (var cycles = 0; cycles < 50; cycles++)
    {
        for (var i=0; i<components.length; i++)
        {
            if (components[i] instanceof CLK) {continue;}
            components[i].Update();
        }
    }

    
    
    for (var i=0; i<wires.length; i++)
    {
        console.log("Wire " + i + "  voltage: " + wires[i].node.voltage);
    }
}




function Route_NEW() 
{
    
    //var points = [];
    nodes = [];

    //Start by finding all points for all wires.
    for (var i=0; i<components.length; i++) //for each component
    {
        var comp = components[i];
        for (var j=0; j<comp.inputsPos.length; i++) //for each input
        {
            var p = comp.inputsPos[j];

            var foundPoint = false;
            for (var k=0; k<nodes.length; k++) //for each node
            {
                for (var q=0; q<nodes[k].points.length; q++) //for each point in node.points
                {
                    if (nodes[k].points[q].equals(p)) //if comp input pos == nodes[k].points[q]
                    {
                        foundPoint = true;
                        comp.inputNodes[j] = nodes[k];
                        break;
                    }
                }
                if (foundPoint)
                {
                    break;
                }
            }

            if ( foundPoint )
            {

            } else {
                var n = new Node();
                n.points.push(p);
                nodes.push(n);
            }

        }


        var comp = components[i];
        for (var j=0; j<comp.outputsPos.length; i++) //for each output
        {
            var p = comp.outputsPos[j];

            var foundPoint = false;
            for (var k=0; k<nodes.length; k++) //for each node
            {
                for (var q=0; q<nodes[k].points.length; q++) //for each point in node.points
                {
                    if (nodes[k].points[q].equals(p)) //if comp input pos == nodes[k].points[q]
                    {
                        foundPoint = true;
                        comp.outputNodes[j] = nodes[k];
                        break;
                    }
                }
                if (foundPoint)
                {
                    break;
                }
            }
            
            if ( foundPoint )
            {

            } else {
                var n = new Node();
                n.points.push(p);
                nodes.push(n);
            }
        }
    }

    console.log("HERE");

    //At this point, we have too many nodes. We need to remove ones linked by wires
    for (var i=0; i<wires.length; i++)
    {
        var wire = wires[i];
        if (node == null)
        {
            //if we don't already have a node, try to find a node it shares a point with
            var foundANode = false;
            for (var j=0; j<nodes.length; j++)
            {
                for (var k=0; k<nodes[j].points.length; k++)
                {
                    for (var q=0; q<wire.points.length; q++)
                    {
                        if (wire.points[q].equals(nodes[j].points[k]))
                        {
                            foundANode = true;
                            wire.node = nodes[j];
                            break;
                        }
                    }
                    if (foundANode) {break;}
                }
                if (foundANode) {break;}
            }

            if (!foundANode) { continue; }

            //At this point, we have found a node for the wire. Now we need to search for other connected wires and update them too
            //Make sure the node has all of the points of the wire
            for (var j=0; j<wire.points.length; j++)
            {
                if (wire.node.ContainsPoint(wire.points[j]) == false)
                {
                    wire.node.AddPoint(wire.points[j]);
                }
            }


            var wiresFound = [];
            wiresFound.push(wire);

            for (var w=0;w<wiresFound.length;w++)
            {
                for (var j=0; j<wires.length; j++)
                {
                    //check if we've already hit wires[j]
                    var alreadyHit = false
                    for (var o=0; o<wiresFound.length; o++)
                    {
                        if (wiresFound[o] == wires[j])
                        {
                            alreadyHit = true;
                            break;
                        }
                    }
                    if (alreadyHit) { continue; }

                    //Now, search all other wires.
                    for (var k=0; k<wires[i].points.length; k++)
                    {
                        if (wire.node.ContainsPoint(wires[i].points[k]))
                        {
                            otherWires.push(wires[i]);
                            wires[i].node = wire.node;
                        }
                    }
                }
            }




        }
    }

    console.log("HERE2");


}


function Route()
{
    //ROUTING................................................................................
    //Alright this is where stuff gets weird. theres probably a better way to do this than the way I am, but I can't think of it right now.
    //      So, what I will do is start with one wire, give it a node (if it doesn't already have one), and copy all of the points from the wire
    //  into the node.points list. Then, for each point the node has, I will cycle through all of the other wires and see if any of them share
    //  points with the current node/wire. If a wire does, then I give current node all of the points from the other wire. If the other wire
    //  which shares points already has a node associated with it, then I combine the nodes into one.
    //      After making all of the nodes, I link each node to every component (input or output) it shares a point with.
    //     There is one last case: a component output touches a component input without a wire&node. We must take this scenario into consideration
    //  To fix it, we simply create a node that has one point and the two components

    //create all of the necessary nodes
    for (var i=0; i<wires.length; i++)
    {
        var wire = wires[i];
        var node;
        if (wire.node != null)
        {
            node = wire.node;
        } else {
            node = new Node();
            wire.node = node;
            nodes.push(node);
        }

        //copy all points from the initial wire into the node
        for (var j=0; j<wire.points.length; j++)
        {
            if (node.ContainsPoint(wire.points[j]) == false)
            {
                node.points.push(wire.points[j])
                //console.log("pushing point " + wire.points[j].x + ", " + wire.points[j].y);
            }
        }

        for (var q=0; q < node.points.length; q++) //for each point in the nodes
        {
            var pos = node.points[q];
            for (var j=i+1; j<wires.length; j++) //for each other wire
            {
                var otherWire = wires[j];
                if (pos instanceof Point == false ) {console.log("ERROR");}
                //console.log('other wire j='+j+"  testing pos="+pos.x+", "+pos.y);
                if (otherWire.ContainsPoint(pos) && otherWire.node == null) //if the other wire contains a shared point, copy all of the other 
                {
                    otherWire.node = node;
                    //console.log("same node!");
                } else if (otherWire.ContainsPoint(pos) && otherWire.node != null)
                {
                    //console.log("other wire node != null");

                    for (var k=0; k<otherWire.node.points.length; k++) //Copy over the other node's points into this node
                    {
                        if (node.ContainsPoint(otherWire.node.points[k]) == false )
                        {
                            node.points.push(otherWire.node.points[k]);
                        }
                    }
                    otherWire.node = node;

                }

            }
        }
    }

    //Now, tell each of the components about the nodes we just found.
    //for each component
    for (var k=0; k<components.length; k++)
    {
        var comp = components[k];
        //for each input
        for (var i=0; i<comp.numInputs; i++)
        {
            for (var j=0; j<nodes.length; j++)
            {
                if (nodes[j].ContainsPoint(comp.inputsPos[i]))
                {
                    comp.inputNodes[i] = nodes[j];
                    break;
                }
            }
        }

        //for each output
        for (var i=0; i<comp.numOutputs; i++)
        {
            for (var j=0; j<nodes.length; j++)
            {
                if (nodes[j].ContainsPoint(comp.outputsPos[i]))
                {
                    comp.outputNodes[i] = nodes[j];
                    break;
                }
            }
        }
    }
}


class Wire {
    constructor(start_pos)
    {
        this.points = [start_pos];
        this.node = null;
    }
    AddPoint(pos)
    {
        this.points.push(pos);
    }
    Draw(painter)
    {
        if (this.node != null && this.node.voltage != null) {
            if (this.node.voltage <= 0) {
                painter.SetStrokeColor('red');
                painter.SetFillColor('red');
            } else if (this.node.voltage > 0) {
                painter.SetStrokeColor('green');
                painter.SetFillColor('green');
            }
        } else {
            painter.SetStrokeColor('yellow');
            painter.SetFillColor('yellow');
        }
        painter.DrawCircleFilled(this.points[0].x, this.points[0].y, 2);
        for (var i=0; i<this.points.length-1; i++)
        {
            painter.DrawLine(this.points[i].x, this.points[i].y, this.points[i+1].x, this.points[i+1].y);
            painter.DrawCircleFilled(this.points[i+1].x, this.points[i+1].y, 2);
        }
    }
    ContainsPoint(point)
    {
        for (var i=0; i<this.points.length; i++)
        {
            if (this.points[i].equals(point))
            {
                return true;
            }
        }
        return false;
    }
}


class Node {
    constructor()
    {
        this.points = [];
        this.voltage = null;
    }
    AddPoint(pos)
    {
        this.points.push(pos);
    }
    ContainsPoint(pos)
    {
        for (var i=0; i<this.points.length; i++)
        {
            if ( this.points[i].equals(pos) )
            {
                return true;
            }
        }
        return false;
    }
}

class Component {
    constructor(pos)
    {
        this.pos = pos;
        
        /*  Each component must have the following defined in the class:
        *       this.numInputs      - number of inputs
        *       this.numOutputs     - number of outputs
        *       this.bodyText       - the text/name
        */

        //The following all get set/overwritten in Init();
        this.inputsPos = [];    //The pixel location of each input   
        this.inputNodes = [];   //The node associated with each input
        this.inputs = [];       //The value for each input
        this.outputsPos = [];
        this.outputNodes = [];
        this.outputs = [];
    }

    Init() {
        this.bodyWidth = 1 * gridWidth;
        this.bodyHeight = Math.max( this.numInputs, this.numOutputs) * gridWidth;
        this.padding = 0.5 * gridWidth; //must be .5 or any larger multiple of gridWidth
       
        this.inputsPos = [];    
        this.inputNodes = [];
        this.inputs = [];
        for (var i=0; i<this.numInputs; i++)
        {
            this.inputsPos.push( (new Point(0,i*gridWidth)).add(this.pos) );
            this.inputNodes.push( null );
            this.inputs.push( null );
        }

        this.outputsPos = [];
        this.outputNodes = [];
        this.outputs = [];
        for (var i=0; i<this.numOutputs; i++)
        {
            this.outputsPos.push( (new Point(this.bodyWidth + 2*this.padding, i*gridWidth)).add(this.pos) );
            this.outputNodes.push( null );
            this.outputs.push( null );
        }
    }
    SetPosition(pos)
    {
        this.pos = pos;
        this.inputsPos = [];
        for (var i=0; i<this.numInputs; i++)
        {
            this.inputsPos.push( (new Point(0,i*gridWidth)).add(this.pos) );
        }
        this.outputsPos = [];
        for (var i=0; i<this.numOutputs; i++)
        {
            this.outputsPos.push( (new Point(this.bodyWidth + 2*this.padding, i*gridWidth)).add(this.pos) );
        }
    }
 
    Draw(painter) {
        painter.SetTextSize(gridWidth/2);

        var color = 'yellow';
        for (var i=0; i<this.inputsPos.length; i++)
        {
            color = 'yellow';
            if (this.inputs[i] != null && this.inputs[i] < 0.3) { color = 'red'; } else if (this.inputs[i] > 0.7) { color = 'green'; }
            painter.DrawCircle(this.inputsPos[i].x,  this.inputsPos[i].y,  5, color);
            painter.DrawLine(this.inputsPos[i].x,  this.inputsPos[i].y,
                this.inputsPos[i].x + this.padding,  this.inputsPos[i].y, color);
        }

        
        for (var i=0; i<this.outputsPos.length; i++)
        {
            color = 'yellow';
            if (this.outputs[i] != null && this.outputs[i] < 0.3) { color = 'red'; } else if (this.outputs[i] > 0.7) { color = 'green'; }
            painter.DrawCircleFilled(this.outputsPos[i].x,  this.outputsPos[i].y,  3, color);
            painter.DrawLine(this.outputsPos[i].x,  this.outputsPos[i].y,
                this.outputsPos[i].x - this.padding,  this.outputsPos[i].y, color);
        }

        //draw body 
        painter.DrawRect(  this.pos.x + this.padding,  this.pos.y - this.padding,   this.bodyWidth,   this.bodyHeight );
        //draw label/text
        painter.DrawTextCentered(this.pos.x + this.padding + this.bodyWidth/2, this.pos.y + this.bodyHeight/2 - this.padding, this.bodyText);

    }
    Update() {
        //Update the this.inputs array based on this.wiresToInputs voltages 
        for (var i=0; i<this.numInputs; i++)
        {
            if (this.inputNodes[i] != null)
            {
                this.inputs[i] = this.inputNodes[i].voltage;
            }
        }

        this.ComputeLogic();


        //Update Output
        for (var i=0; i<this.numOutputs; i++)
        {
            if (this.outputNodes[i] != null)
            {
                this.outputNodes[0].voltage = this.outputs[0];
            }
        }
    }
}


class CLK extends Component {
    constructor(pos)
    {
        super(pos);
        this.numInputs = 0;
        this.numOutputs = 1;
        this.bodyText = "CLK";
        this.Init();
    }
    Update()
    {
        if (this.outputs[0] == 1)
        {
            this.outputs[0] = 0;
        } else {
            this.outputs[0] = 1;
        }
        //console.log(this.wiresToOutputs);
        if (this.outputNodes[0] != null) {
            this.outputNodes[0].voltage = this.outputs[0];
        }
    }
}
class INV extends Component {
    constructor(pos)
    {
        super(pos);
        this.numInputs = 1;
        this.numOutputs = 1;
        this.bodyText = "INV";
        this.Init();
    }
    ComputeLogic()
    {
        for (var i=0;i<this.numInputs; i++)
        {
            if (this.inputs[i] > 0.7)
            {
                this.outputs[i] = 0;
            } else if (this.inputs[i] < 0.3 && this.inputs[i] != null)
            {
                this.outputs[i] = 1;
            } else {
                this.outputs[i] = null;
            }
        }
    }
}
class AND extends Component {
    constructor(pos)
    {
        super(pos);
        this.numInputs = 2;
        this.numOutputs = 1;
        this.bodyText = "&"; 

        this.Init();
    }

    ComputeLogic() {
        this.outputs[0] = 1;
        for (var i=0; i<this.numInputs; i++)
        {
            if (this.inputs[i] == null)
            {
                this.outputs[0] = null;
                break;
            } else if (this.inputs[i] < 0.3)
            {
                this.outputs[0] = 0;
                break;
            }
        }
    }

}
class OR extends Component {
    constructor(pos)
    {
        super(pos);
        this.numInputs = 2;
        this.numOutputs = 1;
        this.bodyText = "OR"; 

        this.Init();
    }
    ComputeLogic() {
        this.outputs[0] = 0;
        var numNull = 0;
        for (var i=0; i<this.numInputs; i++)
        {
            if (this.inputs[i] > 0.7) { 
                this.outputs[0] = 1; 
                break;
            }
            if (this.inputs[i] == null)
            {
                numNull+=1;
            }
        }
        
        if (numNull > 0 && this.outputs[0] != 1){
            this.outputs[0] = null;
        }
    }
}
class NOR extends Component {
    constructor(pos)
    {
        super(pos);
        this.numInputs = 2;
        this.numOutputs = 1;
        this.bodyText = "NOR"; 

        this.Init();
    }
    ComputeLogic() {
        this.outputs[0] = 0;
        var numNull = 0;
        for (var i=0; i<this.numInputs; i++)
        {
            if (this.inputs[i] > 0.7) { 
                this.outputs[0] = 1; 
                break;
            }
            if (this.inputs[i] == null)
            {
                numNull+=1;
            }
        }
        
        if (numNull > 0 && this.outputs[0] != 1){
            this.outputs[0] = null;
        }

        if (this.outputs[0] == 0) { this.outputs[0] = 1; }
        else if (this.outputs[0] == 1) {this.outputs[0] = 0;}
    }
}
class XOR extends Component {
    constructor(pos)
    {
        super(pos);
        this.numInputs = 2;
        this.numOutputs = 1;
        this.bodyText = "XOR"; 

        this.Init();
    }
    ComputeLogic() {
        this.outputs[0] = 0;
        for (var i=0; i<this.numInputs; i++)
        {
            if (this.inputs[i] > 0.7) { 
                if (this.outputs[0] == 0)
                {
                    this.outputs[0] = 1; 
                } else {
                    this.outputs[0] = 0;
                    break;
                }
            }
            if (this.inputs[i] == null)
            {
                this.outputs[0] == null;
                break;
            }
        }
    }
}