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


function deleteComponent(comp) {
    //Remove the comp component from the components list.
    //  Completed by iterating through and then splicing out the component once we find it
    if (comp == selectedComponent)
    {
        selectedComponent = null;
    }
    comp.Delete();
    removeComponentFromList(components, comp);
    /*
    for(var i=0; i<components.length; i++)
    {
        if (components[i] == comp)
        {
            components.splice(i,1);
            comp.Delete(); //Let's just let the component know it's done. IDK if this will be used. Seems like a good idea though :-D
        }
    }*/
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
    return Math.floor((Math.random() * 1000000));
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
    if (Math.abs(numeric_value) < 0.000000000001) { return "0"+suffix; }
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
    if (string_value == null) {return null;}
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
        if (isNaN(Number(string_value[i])) == true && string_value[i] != '.' && string_value[i] != '-')
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
    //console.log(o);
    var val = Number(o);
    //console.log(val);
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

function removeObjectFromList(list, object)
{
    for(var i=0; i<list.length; i++)
    {
        if (list[i] == object)
        {
            list.splice(i,1);
        }
    }
}

function combineNodes(node1, node2)
{
    //This function takes two nodes and combines them into one. It is intended to be used for removing wires from the circuit.
    if (node1 instanceof Node == false || node2 instanceof Node == false) //just check to make sure it's not null... was running into issues here and it's good for debugging
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

    //make sure all of the components lose references to the node2
    for (var i=0; i<components.length; i++)
    {
        if (components[i].startNode != null && components[i].startNode.equals(node2))
        {
            components[i].startNode = node1;
        }
        if (components[i].endNode != null && components[i].endNode.equals(node2))
        {
            components[i].endNode = node1;
        }
    }

    //delete node2 and return node1!
    deleteNode(node2);
    return node1;
}





