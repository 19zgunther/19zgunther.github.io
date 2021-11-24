
class Point { //oh yea.... and I use this as a VECTOR sometimes so HAVE FUN trying to figure out what I'm doing :-D (i'm so sorry)
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
    add(p2) {
        return new Point(this.x + p2.x, this.y + p2.y);
    }
    sub(p2) {
        return new Point(this.x - p2.x, this.y - p2.y);
    }
    equals(p2) {
        if (this.x == p2.x && this.y == p2.y)
        {
            return true;
        } else {
            return false;
        }
    }
    copy()
    {
        return new Point(this.x, this.y);
    }
}


//Utility functions ----------------------------------------------------------------------------------------------------------------
function worldRoundToGrid(p) {
    //Just round the point object p to the nearest gridsize
    p.x = Math.round(p.x/gridSize)*gridSize;
    p.y = Math.round(p.y/gridSize)*gridSize;
    return p;
}

function screenPointToCanvas(point, canvas)
{
    var rect = canvas.getBoundingClientRect();
    point = point.sub(new Point(rect.left, rect.top));
    return point;
}


function distBetweenPoints(p1,p2) {
    //Find the distance between two points (point objects) P1 and P2
    return Math.sqrt(Math.pow(p1.x-p2.x,2) + Math.pow(p1.y-p2.y,2));
}
function findMidpoint(p1,p2) {
    //Find the midpoint (return the object) between p1 and p2
    var slopeY = (p2.y-p1.y);
    var slopeX = (p2.x-p1.x);
    return new Point(p1.x+slopeX/2, p1.y+slopeY/2);
}
function distToLine(L1,L2,P) {
    /*This function finds the distance between line(L1,L2) and point P
    L1 = line end 1 (a Point object),  L2 = line end 2 (a Point object),  P = point (a Point object)

    We are going to do this by turning the line into a series of points and finding the nearest point to P 
        We will find the total length of the line and put points along the line every ...idk yet... amount (see below)*/
    var len = distBetweenPoints(L1,L2); //len = line length (dist from L1 to L2)
    var numPoints = len/10; //number of points, every 10 pixels or so.
    var incrementY = (L2.y-L1.y)/numPoints; //what we will increment the x and y positions by each time in the loop
    var incrementX = (L2.x-L1.x)/numPoints;
    var curPoint = new Point(L1.x,L1.y);
    var bestDist = 10000000000;
    var dist = 10000000000000;
    for (var i=0; i<numPoints; i++)
    {
        dist = distBetweenPoints(curPoint,P);
        bestDist = Math.min(bestDist,dist);
        /* //DEBUG TOOLS BELOW
        fill(255,0,0); 
        circle(curPoint.x,curPoint.y,10); */
        curPoint.y += incrementY;
        curPoint.x += incrementX;
    }
    return bestDist;
}
function deleteComponent(comp) {
    //Remove the comp component from the components list.
    //  Completed by iterating through and then splicing out the component once we find it
    if (comp == selectedComponent)
    {
        selectedComponent = null;
    }
    for(var i=0; i<components.length; i++)
    {
        if (components[i] == comp)
        {
            components.splice(i,1);
            comp.Delete(); //Let's just let the component know it's done. IDK if this will be used. Seems like a good idea though :-D
        }
    }
}
function deleteNode(node) {
    //Remove the comp component from the components list.
    //  Completed by iterating through and then splicing out the component once we find it
    for(var i=0; i<nodes.length; i++)
    {
        if (nodes[i] == node)
        {
            nodes.splice(i,1);
            node.Delete(); //Let's just let the component know it's done. IDK if this will be used. Seems like a good idea though :-D
        }
    }
}
function getVector(p1,p2)
{
    return new Point(p2.x-p1.x, p2.y-p1.y);
}
function isSamePoint(p1,p2)
{
    if (p1 == null || p2 == null) {return false;}
    if (p1.x == p2.x && p1.y == p2.y) 
    {
        return true;
    } 
    return false;
}


function getNewComponentName() { //returns the lowest unused component name.
    var name = 0;
    var foundOne = true; //have we found a new name
    for(var j=0; j<1000; j++) { //lets try this a max of 1000 times.
        foundOne = true;
        for(var i=0; i<components.length; i++)
        {
            if (components[i].name == name)
            {
                name += 1;
                foundOne = false;
                break;
            }
        }
        if (foundOne == true)
        {
            return name;
        }
    }
    return -2;
}
function getNewNodeName() { //returns the lowest unused node name.
    var name = 0;
    var foundOne = true; //have we found a new name
    for(var j=0; j<1000; j++) { //lets try this a max of 1000 times.
        foundOne = true;
        for(var i=0; i<nodes.length; i++)
        {
            if (nodes[i].name == name)
            {
                name += 1;
                foundOne = false;
                break;
            }
        }
        if (foundOne == true)
        {
            return name;
        }
    }
    return -2;
}


function formatValue(numeric_value, suffix)
{
    if (numeric_value == null || numeric_value == NaN) { return NaN; }
    var value = numeric_value;
    s = ['P','M','k','','m','u','n','p'];
    start_index = 3;

    while (Math.abs(value) < 1  &&   start_index != 0   &&   start_index != 7 )
    {
        start_index += 1;
        value = value * 1000;
    }

    while (Math.abs(value) > 1000  &&   start_index != 0   &&   start_index != 7)
    {
        start_index -= 1;
        value = value / 1000;
    }
    if (suffix != NaN && suffix != null)
    {
        return value + s[start_index] + suffix;
    } else {
        return value + s[start_index];
    }
}

function parseStringValue(string_value)
{
    //parses input in forms: "100P", "1M", "5k", "5", etc. DO NOT INCLUDE SPACES
    //how this works: s is the list of accepted suffixes which modulate the value.
    //  We run through until we find a suffix character, copy the first part of the string (the number part) over to 'o'.
    //   Then we make o a number, and multiply or divide it by 1000 until s_index is 3 (no suffix)
    s = ['P','M','k','','m','u','n','p'];
    s_index = 3;
    ind = string_value.length;
    for (var i=0; i<string_value.length; i++)
    {
        for (var j=0; j<s.length; j++)
        {
            if (string_value[i] == s[j])
            {
                s_index = j;
                ind = i;
                break;
            }
        }
        if (isNaN(Number(string_value[i])) == true && string_value[i] != '.')
        {
            ind = i;
            break;
        }
        if (ind != string_value.length)
        {
            break;
        }
    }

    
    o = ""
    for (var i=0; i<ind; i++)
    {
        o += string_value[i];
    }

    var val = Number(o);
    if (val == null || isNaN(val)) {console.error("Cannot parse input: "+string_value +"   In utilities.parseValue"); return NaN; }
    while (s_index < 3)
    {
        s_index += 1;
        val = val * 1000;
    }
    while (s_index > 3)
    {
        s_index -= 1;
        val = val/1000;
    }
    return val;
}



function isPointInList(list, point)
{
    //if (point == null) { return false; }
    for(var i=0; i<list.length; i++)
    {
        if (list[i].x == point.x && list[i].y == point.y)
        {
            return true;
        }
    }
    return false;
}
function isComponentInList(list, component)
{
    for(var i=0; i<list.length; i++)
    {
        if (list[i] == component)
        {
            return true;
        }
    }
    return false;
}
function removeComponentFromList(list, comp)
{
    for(var i=0; i<list.length; i++)
    {
        if (list[i] == comp)
        {
            list.splice(i,1);
        }
    }
}

function combineNodes(node1, node2)
{
    //This function takes two nodes and combines them into one. It is intended to be used for removing wires from the circuit.
    if (node1 == null || node2 == null) //just check to make sure it's not null... was running into issues here and it's good for debugging
    {
        console.error("error in combineNodes, one node is null! Node1: " + node1 + "  Node2: " + node2);
        return;
    }

    //copy points from node2 to node1
    for (var i=0; i<node2.points.length; i++)
    {
        node1.points.push(node2.points[i]);
    }

    //copy startComponents from node2 to node1
    for (var i=0; i<node2.startComponents.length; i++)
    {
        node1.startComponents.push(node2.startComponents[i]);
        node2.startComponents[i].startNode = node1;
    }

    //copy endComponents from node2 to node1
    for (var i=0; i<node2.endComponents.length; i++)
    {
        node1.endComponents.push(node2.endComponents[i]);
        node2.endComponents[i].endNode = node1;
    }

    //delete node2 and return node1!
    deleteNode(node2);
    return node1;
}





