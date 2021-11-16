

//HTML Elements!!!
var DrawModeElement = document.getElementById("drawMode");
var ValueInputTextElement = document.getElementById("valueInputText");
var SelectedComponentElement = document.getElementById("selectedComponent");
var MovingComponentPointElement = document.getElementById("movingComponentPoint");
var SimulationSpeedSliderElement = document.getElementById("simulationSpeedSlider");

//Settings and such
var canvas;
var width;
var height;
var nodeSize = 5;
var gridSize = 20;
var clickRange = 30;
var labelTextSize = 10;
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



//Input Functions
function mousePressed() {
    if (editingComponentValue == true)
    {
        return;
    }
    if (drawMode != "") { //if drawMode != "", then on mousePressed we want to draw a new component, component type = drawMode
        selectedComponent = new Component(); //create new component
        selectedComponent.startPos = worldRoundToGrid(new Point(mouseX,mouseY)); //set startPos and endPos
        selectedComponent.endPos = worldRoundToGrid(new Point(mouseX,mouseY));
        selectedComponent.name = getNewComponentName();
        components.push(selectedComponent); //add the new component (which is currently selected) to 'components' array
        movingComponentPoint = "end"; /*specify which end of the component we want to be moving. In this case, we place the startPos at the initial click
                                        and the endPos follows around the cursor until the mouse button is released  */
        selectedComponent.type = drawMode; /*and of course, how could I forget, we need to let the new component know what type of component it is 
                                            (wire, resistor, capacitor, voltagSource, or currentSource)*/
        //var MYNEWPLOT = new Plot(selectedComponent);
        //plotManager.addPlot(MYNEWPLOT);

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
        var mousePos = new Point(mouseX, mouseY);
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
    movingComponentPoint = "";
}
function keyPressed() {
    if (editingComponentValue == true && (keyCode == ESCAPE || keyCode == ENTER))
    {
        editingComponentValue = false;
        selectedComponent = null;
        return;
    } else if (editingComponentValue == true) {
        return;
    }


    if (keyCode == ESCAPE) {
        drawMode = "";
        selectedComponent = null;
    } else if (keyCode == BACKSPACE || keyCode == DELETE) {
        if (controlIsDown == true)
        {
            components = [];
            nodes = [];
        }
        deleteComponent(selectedComponent);
        selectedComponent = null;
    } else if (keyCode == ENTER) {
        Calculate();
    } else if (keyCode == SHIFT) {
        shiftIsDown = true;
    } else if (keyCode == CONTROL) {
        controlIsDown = true;
    } else if (key == "p") { //PRINT
        var s = "";
        for(var i=0; i<components.length; i++)
        {
            s += components[i].GetString();
        }
        console.log(s);
    } else if (key == "L") { //LOAD
        //LoadCircuit("voltageSource2n 0 5 220 300 220 200 resistor 1 1000 220 200 320 200 resistor 2 1000 320 200 320 300 voltageSource2n 3 5 320 200 420 200 resistor 4 1000 420 200 420 300 wire 5 _ 420 300 320 300 wire 6 _ 320 300 220 300");
        //LoadCircuit("voltageSource2n 0 5 140 300 140 200 resistor 1 1000 220 200 320 200 resistor 2 1000 320 200 320 300 wire 6 _ 320 300 140 300 resistor 8 1000 620 200 620 300 wire 9 _ 620 300 320 300 voltageSource2n 3 5 560 200 620 200 resistor 10 1000 480 200 560 200 voltageSource2n 11 5 320 200 480 200 resistor 4 1000 220 200 140 200");
        //LoadCircuit("resistor 0 1000 460 240 460 360 currentSource 1 0.001 460 360 600 360 voltageSource2n 2 5 600 360 600 300 voltageSource2n 3 5 600 300 600 240 wire 4 _ 600 240 460 240 voltageSource1n 5 0 360 220 360 280 wire 6 _ 360 220 460 240");
        LoadCircuit("voltageSource2n 0 5 260 320 260 200 resistor 1 1000 260 200 400 200 resistor 2 1000 400 200 400 320 wire 3 _ 400 320 260 320 resistor 4 1000 400 200 540 200 wire 6 _ 540 320 400 320 currentSource 5 0.001 540 320 540 200 resistor 7 1000 540 200 640 200 resistor 8 1000 640 200 640 320 wire 9 _ 640 320 540 320 voltageSource2n 10 5 640 200 740 200 resistor 11 1000 740 200 740 320 wire 12 _ 740 320 640 320 voltageSource1n 13 0 260 320 260 360");
    } else if (key == "w") {
        drawMode = "wire";
    } else if (key == "r") {
        drawMode = "resistor";
    } else if (key == "c") {
        drawMode = "capacitor";
    } else if (key == "l") {
        drawMode = "inductor";
    } else if (key == "g") {
        drawMode = "ground";
    } else if (key == "V") {
        drawMode = "voltageSource1n";
    } else if (key == "v") {
        drawMode = "voltageSource2n";
    } else if (key == "i") {
        drawMode = "currentSource";
    } else if (key == '>') {
        var plots = plotManager.GetPlots();
        for (var i=0; i<plots.length; i++)
        {
            plots[i].timeScale = plots[i].timeScale*2;
        }
    } else if (key == '<') {
        var plots = plotManager.GetPlots();
        for (var i=0; i<plots.length; i++)
        {
            plots[i].timeScale = plots[i].timeScale/2;
        }
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
    editingComponentValue = true;
    ValueInputTextElement.value = selectedComponent.GetValue();
}
function setup() {
    width = window.innerWidth*19/20;
    height = window.innerHeight-100;
    canvas = createCanvas(width, height);
    canvas.parent('simulator');
    //LoadCircuit("resistor 0 1000 300 200 440 200 voltageSource2n 1 5 300 300 300 200 voltageSource1n 2 0 300 300 300 340 wire 3 _ 300 300 440 300 resistor 4 1000 440 300 440 200");
    LoadCircuit("resistor 0 1 300 200 440 200 voltageSource2n 1 5 180 300 180 200 voltageSource1n 2 0 300 300 300 340 wire 3 _ 300 300 440 300 wire 5 _ 180 300 300 300 inductor 6 0.001 300 300 300 200 capacitor 4 0.000001 440 300 440 200 resistor 7 10 300 200 180 200");
    plotManager = new PlotManager(width, height);
    simulationSpeedSliderChanged();
}
window.onresize = function(event){
    width = window.innerWidth*19/20;
    height = window.innerHeight*6/8;
    canvas.resize(width,height);
    plotManager.screenWidth = width;
    plotManager.screenHeight = height;
}

function simulationSpeedSliderChanged()
{
    //Range from 1 to 1000
    var val = Number(SimulationSpeedSliderElement.value);
    //console.log(val);
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
    if (movingComponentPoint == "end" && selectedComponent != null) 
    {
        selectedComponent.endPos = worldRoundToGrid(new Point(mouseX,mouseY)); //move endPos
    } else if (movingComponentPoint == "start" && selectedComponent != null) 
    {
        selectedComponent.startPos = worldRoundToGrid(new Point(mouseX,mouseY)); //move startPos
    } else if (movingComponentPoint == "mid" && selectedComponent != null) 
    {
        var mousePos = new Point(mouseX,mouseY);                                //move mid
        selectedComponent.startPos = worldRoundToGrid(mousePos.add(vectorMouseToStart));
        selectedComponent.endPos = worldRoundToGrid(mousePos.add(vectorMouseToEnd));
    } else if (selectedComponent != null){
        if (selectedComponent.startPos.equals(selectedComponent.endPos))
        {
            deleteComponent(selectedComponent);
        }
    }

    UpdateDisplay(); //this updates the entire display (in graphics file)
    plotManager.Draw();

    //Misc
    //???????????
    if (editingComponentValue == true && selectedComponent != null)
    {
        var x = ValueInputTextElement.value;
        if (ValueInputTextElement.value == "")
        {

        } else if (Number(x) != NaN)
        {
            selectedComponent.SetValue( x );
            ValueInputTextElement.value = selectedComponent.GetValue();
        }
    } else {
        ValueInputTextElement.selected = false;
    }

    if (selectedComponent != null && selectedComponent.type != "wire")
    {
        ValueInputTextElement.style.width = "100px";
        ValueInputTextElement.value = selectedComponent.GetValue();
    } else {
        ValueInputTextElement.style.width = "1px";
    }
}


function LoadCircuit(dataString) {
    /* inputs data in the form "Component-Type Name/ID Component-Specific-Value startPos.x startPos.y endPos.x endPos.y" */
    var dataArray = dataString.split(" ");
    components = [];
    nodes = [];
    selectedComponent = null;

    if (dataArray.length % 7 != 0) 
    {
        console.error("Error: Cannot load data in Load function because the number of terms in the input string is incorrect (not mod 7 = 0)");
        return;
    }
    var numComponents = dataArray.length/7;
    var c;
    var compVal;
    for (var i=0; i<numComponents; i++)
    {
        c = new Component();
        c.type = dataArray[i*7+0];
        c.name = Number(dataArray[i*7+1]);
        compVal = Number(dataArray[i*7+2]);
        if (c.type == "resistor") { c.resistance = compVal; }
        else if (c.type == "capacitor") { c.capacitance = compVal; }
        else if (c.type == "inductor") { c.inductor = compVal; }
        else if (c.type == "voltageSource2n") { c.voltage = compVal; }
        else if (c.type == "voltageSource1n") { c.voltage = compVal; }
        else if (c.type == "currentSource") { c.current = compVal; }
        c.startPos = new Point(Number(dataArray[i*7+3]),Number(dataArray[i*7+4]));
        c.endPos = new Point(Number(dataArray[i*7+5]),Number(dataArray[i*7+6]));
        components.push(c);
    }

    //now, lets center the circuit to the best of our ability!
    var maxPoint = new Point(0,0);
    var minPoint = new Point(10000,10000);
    for (var i=0; i<components.length; i++)
    {
        if (components[i].startPos.x > maxPoint.x) { maxPoint.x = components[i].startPos.x; }
        if (components[i].endPos.x > maxPoint.x) { maxPoint.x = components[i].endPos.x; }
        if (components[i].startPos.x < minPoint.x) { minPoint.x = components[i].startPos.x; }
        if (components[i].endPos.x < minPoint.x) { minPoint.x = components[i].endPos.x; }

        if (components[i].startPos.y > maxPoint.y) { maxPoint.y = components[i].startPos.y; }
        if (components[i].endPos.y > maxPoint.y) { maxPoint.y = components[i].endPos.y; }
        if (components[i].startPos.y < minPoint.y) { minPoint.y = components[i].startPos.y; }
        if (components[i].endPos.y < minPoint.y) { minPoint.y = components[i].endPos.y; }
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

    /*
    for (var i=0; i<components.length; i++)
    {
        components[i].voltageData[components[i].dataStart] = components[i].voltage;
        components[i].currentData[components[i].dataStart] = components[i].current;
        components[i].dataStart += 1;
        if (components[i].dataStart >= components[i].voltageData.length)
        {
            components[i].dataStart = 0;
        }
    }*/
    for (var i=0; i<components.length; i++)
    {
        components[i].RecordData();
        //console.log(components[i].voltageData);
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

    /*
    var s = "";
    for (var i=0; i<nodes.length; i++)
    {
        s += "Node: " + nodes[i].name + "   Voltage: " + nodes[i].voltage + "\n";
    }
    console.log(s);*/
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

    //matrixA = mA;
    //matrixB = mB;
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
            if (components[i].startNode == null || components[i].endNode == null || components[i].endNode.voltage == -65536 || components[i].startNode.voltage == -65536) { console.error("Continuing"); continue; }
            components[i].voltage = (components[i].startNode.voltage - components[i].endNode.voltage);
            components[i].current += timeStep * components[i].voltage/components[i].inductance;
            
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
            components[i].voltage -= timeStep * components[i].current/components[i].capacitance;


        }
    }
}

