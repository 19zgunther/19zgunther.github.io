

//HTML Elements!!!
var DrawModeElement = document.getElementById("drawMode");
var ValueInputTextElement = document.getElementById("valueInputText");
var SelectedComponentElement = document.getElementById("selectedComponent");
var MovingComponentPointElement = document.getElementById("movingComponentPoint");
var SimulationSpeedSliderElement = document.getElementById("simulationSpeedSlider");
var CircuitCanvasElement = document.getElementById("circuitCanvas");

//Settings and such
var width;
var height;
var nodeSize = 5;
var gridSize = 20;
var clickRange = 30;
var labelTextSize = 10;
var painter;

var plotManager;

//component and node stuff
var selectedComponent = null;
var components = [];
var nodes = [];

//MISC variables
var updateInterval = setInterval(Update,50);
var calcUpdateInterval = setInterval(Calculate,5);
var drawMode = "";
var movingComponentPoint = ""; //can be "start" (move startPos),"end" (move endPos), "mid" (move entire component aka both points equally) or "" (do not move anything)
var vectorMouseToStart = new Point(0,0); //These two Vector variables are only used when we are in 'movingComponentPoint = "mid" '  mode.
var vectorMouseToEnd = new Point(0,0); //These are points just because I needed a tuple with x&y and I can't be f*cked  (i'm so sorry i'm so tired...)
var labelComponentNames = true; //should we draw the component names?
var labelNodes = true; //should we draw the node names and values?
var editingComponentValue = false;

//Circuit Analysis Variables
var timeStep = 0.000001 //(1 uS)
var currentTime = 0;
var matrixA = [];
var matrixB = [];

//Debug Tools
var debugCalculate = false;
var debugGaussian = false;

//keydown variables
var shiftIsDown = false;
var controlIsDown = false;


var mousePos = new Point();


setup();
document.addEventListener('keydown', keyPressed);
document.addEventListener('mouseUp', mouseReleased);

function mouseMoved(event) {
    //mousePos.x = event.clientX;
    ///mousePos.y = event.clientY;
    mousePos = screenPointToCanvas(new Point(event.clientX, event.clientY), CircuitCanvasElement);
}

//Input Functions
function mousePressed(event) {
    mousePos = screenPointToCanvas(new Point(event.clientX, event.clientY), CircuitCanvasElement);

    if (editingComponentValue == true)
    {
        return;
    }

    if (drawMode != "") { //if drawMode != "", then on mousePressed we want to draw a new component, component type = drawMode
        selectedComponent = createNewComponent(drawMode);
        selectedComponent.startPos = worldRoundToGrid(mousePos); //set startPos and endPos
        selectedComponent.endPos = worldRoundToGrid(mousePos);
        selectedComponent.name = getNewComponentName();
        components.push(selectedComponent); //add the new component (which is currently selected) to 'components' array
        movingComponentPoint = "end"; /*specify which end of the component we want to be moving. In this case, we place the startPos at the initial click
                                        and the endPos follows around the cursor until the mouse button is released  */
        selectedComponent.type = drawMode; /*and of course, how could I forget, we need to let the new component know what type of component it is 
                                            (wire, resistor, capacitor, voltagSource, or currentSource)*/
        if (selectedComponent.type == "capacitor" || selectedComponent.type == "inductor")
        {
            selectedComponent.voltage = 0;
            selectedComponent.current = 0;
        }
        if (drawMode == "ground") {
            selectedComponent.type = "voltageSource1n";
            selectedComponent.voltage = 0;
        }
    } else { //if drawMode == "", then we want to (potentially) move a component.
        
        //We need to search for the nearest component (in components), and check to see if it is within clickRange;
        var bestDist = clickRange;
        var dist = 100000000000;
        for (var i=0; i<components.length; i++)  //for each component...
        { 
            dist = distToLine(components[i].startPos, components[i].endPos, mousePos); //Find the distance from the component to the mouse Position
            if (dist < bestDist) //If the dist is better (less than) the best Distance, we have found a winner! (the current best component)
            {
                bestDist = dist; 
                selectedComponent = components[i];

                //figure out which (start, mid, or end) point of selectedComponent we should move
                var midPoint = findMidpoint(components[i].startPos, components[i].endPos);
                var dS = distBetweenPoints(components[i].startPos, mousePos);
                var dM = distBetweenPoints(midPoint, mousePos);
                var dE = distBetweenPoints(components[i].endPos, mousePos);
                if (dS < dM && dS < dE) 
                {
                    movingComponentPoint = "start"; 
                } else if (dM < dS && dM < dE) {
                    vectorMouseToStart = getVector(mousePos,components[i].startPos);
                    vectorMouseToEnd = getVector(mousePos,components[i].endPos);
                    movingComponentPoint = "mid"; 
                } else {
                    movingComponentPoint = "end";
                }
            }
            /*dist = distBetweenPoints(mousePos, components[i].startPos);
            if (dist < bestDist) { bestDist = dist; movingComponentPoint = "start"; selectedComponent = components[i];}
            dist = distBetweenPoints(mousePos, components[i].endPos);
            if (dist < bestDist) { bestDist = dist; movingComponentPoint = "end"; selectedComponent = components[i];}*/
        }
    }
}
function mouseReleased() {
    //console.log("MOUSE_UP");
    movingComponentPoint = "";
}
function keyPressed(event) {
    var keyCode = event.key;
    //console.log("Key Presed:\""+keyCode+"\"");

    if (editingComponentValue == true && (keyCode == "Escape" || keyCode == "Enter")) //when we're done editing a component's value
    {
        editingComponentValue = false;
        var output = parseStringValue( ValueInputTextElement.value );
        if (output != null && output != NaN)
        {
            selectedComponent.SetValue( output );
        } else {
            console.error("Failed to parse input   ( in keyPressed(event) )");
        }
        selectedComponent = null;
        return;
    }
    
    if (editingComponentValue == true) {
        return;
    }


    switch (keyCode) {
        case "Escape":
            drawMode = "";
            selectedComponent = null;
            break;
        case "Backspace":
            deleteComponent(selectedComponent);
            selectedComponent = null;
            break;
        case "Delete":
            components = [];
            nodes = [];
            break;
        case "Shift":
            shiftIsDown = true;
            break;
        case "Control":
            controlIsDown = true;
            break;
        case "p":
            PrintCircuit();
            break;
        case "L":
            LoadCircuit("voltageSource2n 0 5 260 320 260 200 resistor 1 1000 260 200 400 200 resistor 2 1000 400 200 400 320 wire 3 _ 400 320 260 320 resistor 4 1000 400 200 540 200 wire 6 _ 540 320 400 320 currentSource 5 0.001 540 320 540 200 resistor 7 1000 540 200 640 200 resistor 8 1000 640 200 640 320 wire 9 _ 640 320 540 320 voltageSource2n 10 5 640 200 740 200 resistor 11 1000 740 200 740 320 wire 12 _ 740 320 640 320 voltageSource1n 13 0 260 320 260 360");
            break;
        case "w": drawMode = "wire"; break;
        case "r": drawMode = "resistor"; break;
        case "c": drawMode = "capacitor"; break;
        case "l": drawMode = "inductor"; break;
        case "v": drawMode = "voltageSource2n"; break;
        case "V": drawMode = "voltageSource1n"; break;
        case "g": drawMode = "ground"; break;
        case "i": drawMode = "currentSource"; break;
        case "<": plotManager.GetPlots()[0].horizontalModifier *= 2; break;
        case ">": plotManager.GetPlots()[0].horizontalModifier /= 2; break;
        case "R":
            for(var i=0; i<components.length; i++)
            {
                var c = components[i];
                if (c instanceof VoltageSource1n == true || c instanceof VoltageSource2n == true || c instanceof CurrentSource == true)
                {
                    continue;
                }
                c.voltage = 0;
                c.current = 0;
                c.voltageData = new Array(5000);
                c.currentData = new Array(5000);
                console.log(c.name);
            }
            console.log("Reset");
            break;
    }
    DrawModeElement.innerHTML = "Draw Mode: " + drawMode;
}
function keyReleased() {
    if (keyCode == SHIFT) {
        shiftIsDown = false;
    } else if (keyCode == CONTROL) {
        controlIsDown = false;
    }
}
function valueInputTextClicked() {
    if (editingComponentValue == false)
    {
        ValueInputTextElement.value = formatValue( selectedComponent.GetValue(),selectedComponent.GetStringSuffix());
        editingComponentValue = true;
    }
}
function setup() {
    width = window.innerWidth*19/20;
    height = window.innerHeight-100;
    painter = new Painter(CircuitCanvasElement);
    //canvas = createCanvas(width, height);
    //canvas.parent('simulator');
    //LoadCircuit("resistor 0 1000 300 200 440 200 voltageSource2n 1 5 300 300 300 200 voltageSource1n 2 0 300 300 300 340 wire 3 _ 300 300 440 300 resistor 4 1000 440 300 440 200");
    LoadCircuit("resistor 0 1 300 200 440 200 voltageSource2n 1 5 180 300 180 200 voltageSource1n 2 0 300 300 300 340 wire 3 _ 300 300 440 300 wire 5 _ 180 300 300 300 inductor 6 0.001 300 300 300 200 capacitor 4 0.000001 440 300 440 200 resistor 7 10 300 200 180 200");
    plotManager = new PlotManager(width, height);
    simulationSpeedSliderChanged();
}
window.onresize = function(event){
    width = window.innerWidth*19/20;
    height = window.innerHeight*6/8;
    //canvas.resize(width,height);
    plotManager.screenWidth = width;
    plotManager.screenHeight = height;
}

function simulationSpeedSliderChanged()
{
    //Range from 1 to 1000
    var val = Number(SimulationSpeedSliderElement.value);
    //console.log(val);
    if (val <= 1)
    {
        clearInterval(calcUpdateInterval);
        return;
    }
    val = (31 - val);
    val = val*val;
    val = Math.max(val, 1);
    val = Math.min(val, 1000);
    //now val = value between 1 and 1000
    
    //remove old update interval and add new one!
    console.log("Calc Interval = "+val+"ms");
    clearInterval(calcUpdateInterval);
    calcUpdateInterval = setInterval(Calculate, val );
}

function AddPlotButtonClick()
{
    if (selectedComponent != null)
    {
        //var MYNEWPLOT = new Plot(selectedComponent);
        //plotManager.AddPlot(MYNEWPLOT);
        plotManager.AddPlotOfComponent(selectedComponent);
    }
}

function RemovePlotButtonClick()
{
    if (selectedComponent != null)
    {
        plotManager.RemovePlotOfComponent(selectedComponent);
    }
}







function Update() {
    //move the endpoint, the startpoint, or the entirety of the selected component     //THIS IF STATEMENT SHOULD BE PUT SOMEWHERE ELSE PROBABLY
    //console.log("movingComp: " + movingComponentPoint + "   selectedComp: " + selectedComponent);
    if (movingComponentPoint == "end" && selectedComponent != null) 
    {
        selectedComponent.endPos = worldRoundToGrid(mousePos.copy()); //move endPos
    } else if (movingComponentPoint == "start" && selectedComponent != null) 
    {
        selectedComponent.startPos = worldRoundToGrid(mousePos.copy()); //move startPos
    } else if (movingComponentPoint == "mid" && selectedComponent != null) 
    {
        selectedComponent.startPos = worldRoundToGrid(mousePos.copy().add(vectorMouseToStart));
        selectedComponent.endPos = worldRoundToGrid(mousePos.copy().add(vectorMouseToEnd));
    } else if (selectedComponent != null){
        if (selectedComponent.startPos.equals(selectedComponent.endPos))
        {
            deleteComponent(selectedComponent);
        }
    }

    if (selectedComponent != null)
    {
        SelectedComponentElement.innerHTML = "Selected Component: " + selectedComponent.toString();
    } else {
        SelectedComponentElement.innerHTML = "Selected Component: None";
    }

    UpdateDisplay(painter); //this updates the entire display (in graphics file)
    plotManager.Draw(painter);

    //Misc
    //???????????
    if (editingComponentValue == false && selectedComponent != null && selectedComponent.type != "wire")
    {
        ValueInputTextElement.style.width = "100px";
        ValueInputTextElement.value = formatValue( selectedComponent.GetValue(),  selectedComponent.GetStringSuffix());
    } else if (editingComponentValue == false){
        ValueInputTextElement.style.width = "5px";
    }
}


function PrintCircuit() {
    var s = "";
    for(var i=0; i<components.length; i++)
    {
        s += components[i].GetEncodedDataString();
    }
    console.log(s);
    return s;
}


/*This function takes a string and generates the components.
*   It is used at start to load the initial circuit, and whenever we want to load a saved circuit
*   See PrintCircuit() and component.GetString() to see more about the format: "TYPE NAME VALUE START.X START.Y END.X END.Y". 
*/
function LoadCircuit(dataString) {
    /* inputs data in the form "TYPE NAME VALUE startPos.x startPos.y endPos.x endPos.y" */
    //Start by splitting the dataString by spaces
    var dataArray = dataString.split(" "); 
    components = [];
    nodes = [];
    selectedComponent = null;

    if (dataArray.length % 7 != 0)  //We know the dataArray should be a multiple of 7 in length because of the format (see desc. above)
    {
        console.error("Error: Cannot load data in Load function because the number of terms in the input string is incorrect (not mod 7 = 0)");
        return;
    }
    
    var numComponents = dataArray.length/7;
    var type;
    var numComponents = dataArray.length/7;
    var c;
    for (var i=0; i<numComponents; i++)
    {
        type = dataArray[i*7+0];
        if (type == 'wire')
        {
            c = new Wire();
        } else if (type == 'resistor') {
            c = new Resistor();
        } else if (type == 'capacitor') {
            c = new Capacitor();
        } else if (type == 'inductor') {
            c = new Inductor();
        } else if (type == 'voltageSource2n') {
            c = new VoltageSource2n();
        } else if (type == 'voltageSource1n') {
            c = new VoltageSource1n();
        } else if (type == 'currentSource') {
            c = new CurrentSource();
        }
        
        c.name = Number(dataArray[i*7+1]);
        c.SetValue(Number(dataArray[i*7+2]));
        c.startPos = new Point(Number(dataArray[i*7+3]),Number(dataArray[i*7+4]));
        c.endPos = new Point(Number(dataArray[i*7+5]),Number(dataArray[i*7+6]));
        components.push(c);
    }
    
    CenterCircuit(); //Center the circuit to 
}


//Centers the circuit to the center of the screen
function CenterCircuit()
{
    //now, lets center the circuit to the best of our ability!
    var maxPoint = new Point(0,0); //arbitrary small point (upper left corner of screen)
    var minPoint = new Point(10000,10000); //arbitrary large point (lower right in screen)
    for (var i=0; i<components.length; i++)
    {
        maxPoint.x = Math.max( components[i].startPos.x, components[i].endPos.x, maxPoint.x );
        minPoint.x = Math.min( components[i].startPos.x, components[i].endPos.x, minPoint.x );
        
        maxPoint.y = Math.max( components[i].startPos.y, components[i].endPos.y, maxPoint.y );
        minPoint.y = Math.min( components[i].startPos.y, components[i].endPos.y, minPoint.y );
    }
    
    var curCenter = worldRoundToGrid(new Point((maxPoint.x+minPoint.x)/2, (maxPoint.y+minPoint.y)/2));
    var wantedCenter = worldRoundToGrid(new Point(width/2, height/2));
    var diff = new Point(curCenter.x-wantedCenter.x, curCenter.y-wantedCenter.y);
    for (var i=0; i<components.length; i++)
    {
        components[i].startPos.x -= diff.x;
        components[i].endPos.x -= diff.x;
        components[i].startPos.y -= diff.y;
        components[i].endPos.y -= diff.y;
    }
}


//Call this to calculate the entire circuit.
function Calculate() {
    currentTime += timeStep;

    for (var i=0; i<components.length; i++)
    {
        components[i].RecordData();
    }
    
    
    
    FindNodes();
    MakeMatrices();
    if (debugCalculate == true) {console.log("initial Matrices:"); PrintMatrices(matrixA, matrixB);}
    ApplyVoltageSources();
    if (debugCalculate == true) {console.log("After applying Voltage Sources:");PrintMatrices(matrixA, matrixB);}
    UpdateMatrices();
    if (debugCalculate == true) {console.log("After Updating.. : ");PrintMatrices(matrixA, matrixB);}

    CheckVoltageSources();

    GaussianElimination(matrixA, matrixB);
    if (debugCalculate == true) {console.log("\n\n\n\nGaussianElimination:");PrintMatrices(matrixA, matrixB);}

    //CheckVoltageSources();

    CheckForSingleRow(matrixA,matrixB);

    CheckVoltageSources();

    CalcCurrents();

}


//Finds all of the nodes
function FindNodes() {
    //Start by removing all old nodes and data
    nodes = [];
    if (components.length == 0) { return; }
    for(var i=0; i<components.length; i++)
    {
        components[i].startNode = null;
        components[i].endNode = null;
    }

    //now find all of the intersections between components
    var points = [];
    var comp;
    var node;
    for(var i=0; i<components.length; i++)
    {
        comp = components[i];
        if (isPointInList(points, comp.startPos) == false)
        {
            points.push(comp.startPos);
        }
        if (isPointInList(points, comp.endPos) == false && comp.type != "voltageSource1n")  //but ignore the endNode for voltageSource1n components
        {
            points.push(comp.endPos);
        }
    }

    //console.log("points: " + points);

    //now, make those points into nodes (it's just easier this way)
    for (var i=0; i<points.length; i++)
    {
        node = new Node();
        node.points.push(points[i]);
        node.name = getNewNodeName();
        nodes.push(node);
    }

    //now, for each component, find the nodes which corrospond to the component's startPos and endPos, and give that information to the nodes.
    for (var i=0; i<components.length; i++)
    {
        comp = components[i];
        for (var j=0; j<nodes.length; j++)
        {
            node = nodes[j];
            if (isSamePoint(comp.startPos, node.points[0]) == true) //we can do this because the nodes only have 1 point in their "points" list.
            {
                node.startComponents.push(comp);
                comp.startNode = node;
            } else if (isSamePoint(comp.endPos, node.points[0]) == true) {
                node.endComponents.push(comp);
                comp.endNode = node;
            }
        }
    }

    //Finally, combine all nodes which are between wire components.
    for (var i=0; i<components.length; i++) 
    {
        if (components[i].type == "wire")
        {
            combineNodes(components[i].startNode, components[i].endNode);
        }
    }

    //Rename nodes so they're all named 0 though nodes.length-1
    for (var i=0; i<nodes.length; i++)
    {
        nodes[i].name = i;
    }

    //console.log("nodes: " + nodes);
}

//Creates New Matrices
function MakeMatrices() {
    //initialize matrixA and matrixB. We will be solving using the Ax=B form
    matrixA = [];
    matrixB = [];
    var row = [];
    for (var i=0; i<nodes.length; i++)
    {
        row = [];
        for (var j=0; j<nodes.length; j++)
        {
            row.push(0);
        }
        matrixA.push(row);
        matrixB.push(0);
    }

    //Now, lets populate the matrix with resistor and current variables!
    var node;
    for(var i=0; i<nodes.length; i++) { //for each node
        node = nodes[i];
        //console.log(node.name);
    
        for (var j=0; j<node.startComponents.length; j++) //for each startComponent in node[i]
        {
            if (node.startComponents[j].type == "wire") {
                //if it's a wire, do nothing.
            } else if (node.startComponents[j].type == "resistor") {
                matrixA[node.name][node.startComponents[j].endNode.name] -= 1/node.startComponents[j].resistance;
                matrixA[node.name][node.name] += 1/node.startComponents[j].resistance;
            } else if (node.startComponents[j].type == "currentSource" || node.startComponents[j].type == "inductor") {
                matrixB[node.name] -= node.startComponents[j].current;
            }
            //console.log(node.startComponents[j].type);
        }

        for (var j=0; j<node.endComponents.length; j++) //for each endComponent in node[i]
        {
            if (node.endComponents[j].type == "wire") {
                //if it's a wire, do nothing.
            } else if (node.endComponents[j].type == "resistor") {
                matrixA[node.name][node.endComponents[j].startNode.name] -= 1/node.endComponents[j].resistance;
                matrixA[node.name][node.name] += 1/node.endComponents[j].resistance;
            } else if (node.endComponents[j].type == "currentSource" || node.endComponents[j].type == "inductor") {
                matrixB[node.name] += node.endComponents[j].current;
            }
            //console.log(node.endComponents[j].type);
        }
    }
}

//A general refreshing function which 
function UpdateMatrices() {
    //This function checks through each node to see if it has a known voltage. If the node's voltage is known, then it is applied to the Matrices.
    for (var i=0; i<nodes.length; i++)
    {
        if (nodes[i].voltage != -65536) //if the voltage is NOT null
        {
            matrixB[i] = 0; 
            for (var j=0; j<nodes.length; j++)
            {
                matrixA[i][j] = 0; //clear the row
                matrixB[j] -= matrixA[j][i]*nodes[i].voltage; //apply the voltage to all other rows 
                matrixA[j][i] = 0; //clear column
            }
        }
    }
}


function UpdateMatricesSpecific(node) {
    //This function checks through each node to see if it has a known voltage. If the node's voltage is known, then it is applied to the Matrices.
    var i = node.name;
    matrixB[i] = 0; 
    for (var j=0; j<nodes.length; j++)
    {
        matrixA[i][j] = 0; //clear the row
        matrixB[j] -= matrixA[j][i]*nodes[i].voltage; //apply the voltage to all other rows 
        matrixA[j][i] = 0; //clear column
    }
}

//apply voltage sources to the matrices
function ApplyVoltageSources() {
    for (var i = 0; i < components.length; i++) //for each component
    {
        if (components[i].type == "voltageSource2n" || components[i].type == "capacitor") //if the component is a voltage source
        {
            if (components[i].startNode.voltage != -65536 && components[i].endNode.voltage == -65536) //if the startNode voltage is known and endNode is not known
            {
                //If the startNode is known, (the neg side of the voltage source), then we KNOW the endNode voltage. Let's apply it to the matrices.
                components[i].endNode.voltage = components[i].startNode.voltage + components[i].voltage;
            } else if (components[i].endNode.voltage != -65536 && components[i].startNode.voltage == -65536) //if the endNode voltage is known and the startNode is not known.
            {
                //If the endNode is known, (the pos side of the voltage source), then we KNOW the startNode voltage. Let's apply it to the matrices.
                components[i].startNode.voltage = components[i].endNode.voltage - components[i].voltage;
            } else if (components[i].startNode.voltage == -65536 && components[i].endNode.voltage == -65536) //If both nodes are unknown, reduce!
            {
                //ahh yes this is where the fuckery begins. I need to somehow reduce all of the connected voltage sources to this. Wish me luck
                //console.log("vs ID: " + (components[i].name));
                //In this case, we can simplify the endNode (pos side).     endNode = startNode + voltage
                var comp = components[i];
                var startNode = comp.startNode;
                var endNode = comp.endNode;
                var voltage = comp.voltage;


                if (startNode.forwardingAddress != -1)
                {
                    voltage += startNode.forwardingVoltage;
                    startNode = nodes[startNode.forwardingAddress];
                }
                
                matrixB[startNode.name] += matrixB[endNode.name]; //add the b matrix endNode row to startNode row
                for (var j=0; j<nodes.length; j++) //add the a matrix endNode row to the startNode row
                {
                    matrixA[startNode.name][j] += matrixA[endNode.name][j]; //add endNode row to startNode.row
                    matrixA[endNode.name][j] = 0; //clear row
                }
                matrixA[endNode.name][endNode.name] = 1;
                matrixA[endNode.name][startNode.name] = -1;
                matrixB[endNode.name] = voltage;

                endNode.forwardingAddress = startNode.name;
                endNode.forwardingVoltage = voltage;
            }
            //PrintMatrices(matrixA, matrixB);
        } else if (components[i].type == "voltageSource1n") //this is for applying KNOWN voltage nodes
        {
            components[i].startNode.voltage = components[i].voltage;
            UpdateMatricesSpecific(components[i].startNode);
        }
    }
    UpdateMatrices();
}


function CheckVoltageSources() {
    for (var i=0; i<components.length; i++)
    {
        if (components[i].type == "voltageSource2n" || components[i].type == "capacitor")
        {
            if (components[i].startNode.voltage != -65536 && components[i].endNode.voltage == -65536)
            {
                components[i].endNode.voltage = components[i].startNode.voltage + components[i].voltage;
                //console.log("setting node " + components[i].endNode.name + " to " + components[i].endNode.voltage + " volts.");
                CheckVoltageSources();
            } else if (components[i].startNode.voltage == -65536 && components[i].endNode.voltage != -65536)
            {
                components[i].startNode.voltage = components[i].endNode.voltage - components[i].voltage;
                //console.log("setting node " + components[i].endNode.name + " to " + components[i].endNode.voltage + " volts.");
                CheckVoltageSources();
            } else if (components[i].startNode.voltage != -65536 && components[i].endNode.voltage != -65536)
            {
                //console.log("Both nodes are known");
            }
        }
    }

}


function PrintMatrices(matA, matB) {
    var s = "";
    for (var row=0; row<matA.length; row++)
    {
        for (var col=0; col<matA.length; col++)
        {
            var cs = (Math.round(matA[row][col]*10000)/10000).toString();
            var l = cs.length;
            while (l < 8)
            {
                l += 1;
                s += " ";
            }
            s += cs;
        }
        s += "   |   " + (Math.round(matB[row]*10000)/10000).toString() + "\n";
    }
    s += "\n";
    console.log(s);
}


function GaussianElimination(matA, matB) {
    //start by making new matrices with only unknown nodes (without any blank rows and columns)
    var mA = [];
    var mB = [];
    mA = matA;
    mB = matB;

    //now  that we have matA and B, we can start the Gaussian Elimination
    var stop = false;
    for(var col=0; col<mA.length-1; col++)
    {
        for(var row=mA.length-1; row>col; row-=1)
        {
            if (debugGaussian == true ) {console.log("col: " + col + "   row: " + row);}
            

            if (mA[row][col] == 0) //check to make sure the value we're trying to remove isn't 0. If it is, just skip.
            {
                if (debugGaussian == true)
                {
                    console.log("mat[row:"+row+"][col:"+col+"] == 0. Skipping");
                }
                continue;
            }

            var row2 = -1;
            for (var i=row - 1; i >= 0; i -= 1) //Find the "row2,col" we're going to use to reduce "row,col"
            {
                if (mA[i][col] != 0)
                {
                    row2 = i;
                    break;
                }
            }

            if (row2 == - 1) //if we didn't find a row2, just skip. This means we cannot reduce/remove anymore items in the column
            {
                if (debugGaussian == true ){console.log("could not find a row2");}
                continue;
            }

            var coef = mA[row][col]/mA[row2][col]; //calculate the coef we will multiply row2 by to reduce row1
            for (var i=0; i<mA.length; i++) //apply the coef*row2 to row1.
            {
                mA[row][i] -= mA[row2][i]*coef;
            }
            mB[row] -= mB[row2]*coef; //whatever we do to matrixA we must also do to matrixB
            if (debugGaussian == true ){PrintMatrices(mA,mB);}
        }
        if (stop == true)
        {
            break;
        }
    }

}


function CheckForSingleRow(A,B) {
    var numInRow = 0;
    var rowIndex = -1;
    for(var i=0; i<A.length; i++) //for each row
    {
        numInRow = 0;
        rowIndex = -1;
        for (var j=0; j<A[i].length; j++) //for each in row
        {
            if (A[i][j] != 0)
            {
                numInRow += 1;
                rowIndex = j;
            }
        }
        if (numInRow == 1)
        {   

            nodes[rowIndex].voltage = B[i]/A[i][rowIndex];
            A[i][rowIndex] = 0;
            B[i] = 0;

            UpdateMatricesSpecific(nodes[rowIndex]);
            CheckForSingleRow(A,B);
            return true;
        }
    }
    return false;
}

function CalcCurrents() {
    //clear components we don't know
    for (var i=0; i<components.length; i++)
    {
        if (components[i].type == "resistor" || components[i].type == "voltageSource2n" || components[i].type == "voltageSource1n" || components[i].type == "capacitor")
        {
            components[i].current = -65536;
        }
    }

    for (var i=0; i<nodes.length; i++)
    {
        nodes[i].currentOut = 0;
        nodes[i].numCurrentsOut = 0;
    }

    //find resistor currents
    for (var i=0; i<components.length; i++)
    {
        if (components[i].type == "resistor")
        {
            components[i].current = (components[i].startNode.voltage - components[i].endNode.voltage)/components[i].resistance;
            
            components[i].startNode.currentOut += components[i].current;
            components[i].startNode.numCurrentsOut += 1;
            components[i].endNode.currentOut -= components[i].current;
            components[i].endNode.numCurrentsOut += 1;
        } else if (components[i].type == "inductor")
        {
            if (components[i].startNode == null || components[i].endNode == null || components[i].endNode.voltage == -65536 || components[i].startNode.voltage == -65536) { 
                //console.error("Continuing");
                components[i].voltage = 0;
                components[i].current = 0;
            } else if (components[i].startNode == components[i].endNode) {
                components[i].voltage = 0;
                components[i].current = 0;
            } else {
                components[i].voltage = Math.min( Math.max((components[i].startNode.voltage - components[i].endNode.voltage),-1000000000), 1000000000);
                components[i].current += timeStep * components[i].voltage/components[i].inductance;
            }
            
            components[i].startNode.currentOut += components[i].current;
            components[i].startNode.numCurrentsOut += 1;
            components[i].endNode.currentOut -= components[i].current;
            components[i].endNode.numCurrentsOut += 1;
        } else if (components[i].type == "currentSource")
        {
            components[i].startNode.currentOut += components[i].current;
            components[i].startNode.numCurrentsOut += 1;
            components[i].endNode.currentOut -= components[i].current;
            components[i].endNode.numCurrentsOut += 1;
        }
    }

    var foundAnother = true;
    while (foundAnother == true)
    {
        foundAnother = false;
        for (var i=0; i<nodes.length; i++)
        {
            if (nodes[i].numCurrentsOut == nodes[i].startComponents.length + nodes[i].endComponents.length - 1)
            {
                //console.log("Node: " +nodes[i].name);
                for (var j=0; j<nodes[i].startComponents.length; j++)
                {
                    if (nodes[i].startComponents[j].current == -65536)
                    {
                        nodes[i].startComponents[j].current = -nodes[i].currentOut;
                        foundAnother = true;
                        //console.log("Comp: " + nodes[i].startComponents[j].type +" "+nodes[i].startComponents[j].name + " current = " + nodes[i].startComponents[j].current);
                        break;
                    }
                }

                if (foundAnother == true)
                {
                    break;
                }
                
                for (var j=0; j<nodes[i].endComponents.length; j++)
                {
                    if (nodes[i].endComponents[j].current == -65536)
                    {
                        nodes[i].endComponents[j].current = nodes[i].currentOut;
                        foundAnother = true;
                        //console.log("Comp: " + nodes[i].endComponents[j].type +" "+nodes[i].endComponents[j].name + " current = " + nodes[i].endComponents[j].current);

                        break;
                    }
                }

                if (foundAnother == true)
                {
                    break;
                }

            }
        }
    }

    //Update capacitors
    for (var i=0; i<components.length; i++)
    {
        if (components[i].type == "capacitor")
        {
            if (components[i].startNode == components[i].endNode)
            {
                components[i].voltage = 0;
            } else {
                components[i].voltage -= timeStep * components[i].current/components[i].capacitance;
            }
            

        }
    }
}

