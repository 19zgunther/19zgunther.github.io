
//Graphical functions ----------------------------------------------------------------------------------------------------------------
function drawWire(comp)
{
    line(comp.startPos.x,comp.startPos.y,comp.endPos.x,comp.endPos.y);
    var midpoint = findMidpoint(comp.startPos, comp.endPos);
    
    /*if (labelComponentNames == true) {
        fill(255,255,255);
        stroke(5);
        //strokeWeight(1);
        textSize(labelTextSize);
        text("W"+comp.name, midpoint.x, midpoint.y);
    }*/
}

function drawResistor(comp)
{   //draws resistor on canvas
    var startPos = comp.startPos;  //comp = a resistor Component object
    var endPos = comp.endPos;
    var dist = Math.sqrt(Math.pow(startPos.x-endPos.x,2) + Math.pow(startPos.y-endPos.y,2)); //distance between startPos and endPos (start & end positions x and y)
    var angle = Math.atan2(startPos.y-endPos.y, startPos.x-endPos.x) + Math.PI; //angle from startPos to endPos, offset by Math.PI because it works
    var len = (dist/2) - 20; //length from each point to center minus resistor box length
    line(startPos.x,startPos.y, (Math.cos(angle)*len+startPos.x), (Math.sin(angle)*len+startPos.y)); //drawing line from startPos
    line(endPos.x,endPos.y, (Math.cos(angle+Math.PI)*len+endPos.x), (Math.sin(angle+Math.PI)*len+endPos.y)); //drawing line from endPos

    var midpoint = new Point((Math.cos(angle)*dist/2+startPos.x),(Math.sin(angle)*dist/2+startPos.y)); //find the midpoint between startPos and endPos
    var height = 20; //this is the distance the points below are from the midpoint
    var angleModifier = 0.3; //how much we deviate from initial angle to draw 4 points which will make the box
    var p1 = new Point((Math.cos(angle+angleModifier)*height+midpoint.x),(Math.sin(angle+angleModifier)*height+midpoint.y)); //these 4 points make up a rectangle
    var p2 = new Point((Math.cos(angle-angleModifier)*height+midpoint.x),(Math.sin(angle-angleModifier)*height+midpoint.y));
    var p3 = new Point((Math.cos(angle+angleModifier+Math.PI)*height+midpoint.x),(Math.sin(angle+angleModifier+Math.PI)*height+midpoint.y));
    var p4 = new Point((Math.cos(angle-angleModifier+Math.PI)*height+midpoint.x),(Math.sin(angle-angleModifier+Math.PI)*height+midpoint.y));
    line(p1.x,p1.y,p2.x,p2.y); //actually drawing the box now (4 lines)
    line(p3.x,p3.y,p4.x,p4.y);
    line(p1.x,p1.y,p4.x,p4.y);
    line(p2.x,p2.y,p3.x,p3.y);
    if (labelComponentNames == true) {
        fill(255,255,255);
        stroke(5);
        //strokeWeight(1);
        textSize(labelTextSize);
        text("R"+comp.name+": "+comp.GetValueString(), midpoint.x, midpoint.y);
    }
}

function drawCapacitor(comp)
{
    var startPos = comp.startPos;
    var endPos = comp.endPos;
    var dist = Math.sqrt(Math.pow(startPos.x-endPos.x,2) + Math.pow(startPos.y-endPos.y,2));
    var angle = Math.atan2(startPos.y-endPos.y, startPos.x-endPos.x) + Math.PI;
    var len = (dist/2) - 7;
    var midpoint = new Point((Math.cos(angle)*dist/2+startPos.x),(Math.sin(angle)*dist/2+startPos.y));

    var height = 20;
    var angleModifier = Math.PI/2-0.3;
    var ps = new Point((Math.cos(angle)*len+startPos.x),(Math.sin(angle)*len+startPos.y));
    var pe = new Point((Math.cos(angle+Math.PI)*len+endPos.x), (Math.sin(angle+Math.PI)*len+endPos.y));
    line(startPos.x,startPos.y, ps.x, ps.y);
    line(endPos.x,endPos.y, pe.x, pe.y);
    var p1 = new Point((Math.cos(angle+angleModifier)*height+midpoint.x),(Math.sin(angle+angleModifier)*height+midpoint.y));
    var p2 = new Point((Math.cos(angle-angleModifier)*height+midpoint.x),(Math.sin(angle-angleModifier)*height+midpoint.y));
    var p3 = new Point((Math.cos(angle+angleModifier+Math.PI)*height+midpoint.x),(Math.sin(angle+angleModifier+Math.PI)*height+midpoint.y));
    var p4 = new Point((Math.cos(angle-angleModifier+Math.PI)*height+midpoint.x),(Math.sin(angle-angleModifier+Math.PI)*height+midpoint.y));
    line(p1.x,p1.y,p2.x,p2.y);
    line(p3.x,p3.y,p4.x,p4.y);


    var size = 5;
    if (comp.voltage > 0) { 
        var p5 = new Point(pe.x + 15*Math.cos(angle+Math.PI/3), pe.y + 15*Math.sin(angle+Math.PI/3));
        var p6 = new Point(p5.x + size*2*Math.cos(angle), p5.y + size*2*Math.sin(angle));
        var p7 = new Point(p5.x + size*1.5*Math.cos(angle+Math.PI/4), p5.y + size*1.5*Math.sin(angle+Math.PI/4));
        var p8 = new Point(p5.x + size*1.5*Math.cos(angle-Math.PI/4), p5.y + size*1.5*Math.sin(angle-Math.PI/4));
        line(p5.x,p5.y,p6.x,p6.y);
        line(p7.x,p7.y,p8.x,p8.y);
    } else {
        var p5 = new Point(ps.x + 15*Math.cos(angle+Math.PI/3), ps.y - 15*Math.sin(angle+Math.PI/3));
        var p6 = new Point(p5.x - size*2*Math.cos(angle), p5.y - size*2*Math.sin(angle));
        var p7 = new Point(p5.x - size*1.5*Math.cos(angle+Math.PI/4), p5.y - size*1.5*Math.sin(angle+Math.PI/4));
        var p8 = new Point(p5.x - size*1.5*Math.cos(angle-Math.PI/4), p5.y - size*1.5*Math.sin(angle-Math.PI/4));
        line(p5.x,p5.y,p6.x,p6.y);
        line(p7.x,p7.y,p8.x,p8.y);
    }


    if (labelComponentNames == true) {
        fill(255,255,255);
        stroke(5);
        //strokeWeight(1);
        textSize(labelTextSize);
        text("C"+comp.name+": "+comp.GetValueString(), midpoint.x, midpoint.y);
    }
}

function drawInductor(comp)
{
    //draws inductor on canvas
    var startPos = comp.startPos;  //comp = a resistor Component object
    var endPos = comp.endPos;
    var dist = Math.sqrt(Math.pow(startPos.x-endPos.x,2) + Math.pow(startPos.y-endPos.y,2)); //distance between startPos and endPos (start & end positions x and y)
    var angle = Math.atan2(startPos.y-endPos.y, startPos.x-endPos.x) + Math.PI; //angle from startPos to endPos, offset by Math.PI because it works
    
    var midpoint = new Point((Math.cos(angle)*dist/2+startPos.x),(Math.sin(angle)*dist/2+startPos.y)); //find the midpoint between startPos and endPos

    //drawing the arcs
    var len = (dist/2) - 20; //length from each point to center minus resistor box length
    var ps1 = new Point((Math.cos(angle)*len+startPos.x), (Math.sin(angle)*len+startPos.y));
    var pe1 = new Point((Math.cos(angle+Math.PI)*len+endPos.x), (Math.sin(angle+Math.PI)*len+endPos.y));
    len = (dist/2 - 15);
    var ps2 = new Point((Math.cos(angle)*len+startPos.x), (Math.sin(angle)*len+startPos.y));
    var pe2 = new Point((Math.cos(angle+Math.PI)*len+endPos.x), (Math.sin(angle+Math.PI)*len+endPos.y));
    len = (dist/2 - 5);
    var ps3 = new Point((Math.cos(angle)*len+startPos.x), (Math.sin(angle)*len+startPos.y));
    var pe3 = new Point((Math.cos(angle+Math.PI)*len+endPos.x), (Math.sin(angle+Math.PI)*len+endPos.y));

    line(startPos.x,startPos.y, ps1.x, ps1.y); //drawing line from startPos
    line(endPos.x,endPos.y, pe1.x, pe1.y); //drawing line from endPos
    
    arc(ps2.x,ps2.y, 10,10, 0+angle, Math.PI+angle);
    arc(ps3.x,ps3.y, 10,10, 0+angle, Math.PI+angle);
    arc(pe2.x,pe2.y, 10,10, 0+angle, Math.PI+angle);
    arc(pe3.x,pe3.y, 10,10, 0+angle, Math.PI+angle);


    //this is all for drawing the arrow next to the inductor specifying current direction
    var height = 13;
    len = dist/2 - 15;
    var p1 = new Point((Math.cos(angle)*len+startPos.x+Math.cos(angle+Math.PI/2)*height), (Math.sin(angle)*len+startPos.y+Math.sin(angle+Math.PI/2)*height));
    var p2 = new Point((Math.cos(angle+Math.PI)*len+endPos.x+Math.cos(angle+Math.PI/2)*height), (Math.sin(angle+Math.PI)*len+endPos.y+Math.sin(angle+Math.PI/2)*height));
    var p3;
    var p4;
    var armLength = 5;

    if (comp.current < 0)
    {
        p3 = new Point(p1.x + Math.cos(angle+Math.PI/4)*armLength, p1.y + Math.sin(angle+Math.PI/4)*armLength);
        p4 = new Point(p1.x + Math.cos(angle-Math.PI/4)*armLength, p1.y + Math.sin(angle-Math.PI/4)*armLength);
    } else {
        
        p3 = new Point(p2.x - Math.cos(angle+Math.PI/4)*armLength, p2.y - Math.sin(angle+Math.PI/4)*armLength);
        p4 = new Point(p2.x - Math.cos(angle-Math.PI/4)*armLength, p2.y - Math.sin(angle-Math.PI/4)*armLength);
        var q = p1;
        p1 = p2;
        p2 = q;
    }

    if (comp.current != 0)
    {
        line(p1.x,p1.y,p2.x,p2.y);
        line(p1.x,p1.y,p3.x,p3.y);
        line(p1.x,p1.y,p4.x,p4.y);
    }




    if (labelComponentNames == true) {
        fill(255,255,255);
        stroke(5);
        //strokeWeight(1);
        textSize(labelTextSize);
        text("L"+comp.name+": "+comp.GetValueString(), midpoint.x, midpoint.y);
    }
}

function drawVoltageSource1n(comp)
{
    line(comp.startPos.x,comp.startPos.y,comp.endPos.x,comp.endPos.y);
    //strokeWeight(2);
    line(comp.endPos.x - 10, comp.endPos.y, comp.endPos.x + 10, comp.endPos.y);
    if (comp.startPos.y > comp.endPos.y) //slope down, so draw number below.
    {
        fill(255,255,255);
        stroke(5);
        //strokeWeight(1);
        textSize(labelTextSize);
        text("Vn"+comp.name+": "+comp.GetValueString(), comp.endPos.x-8, comp.endPos.y-5);
    } else {
        fill(255,255,255);
        stroke(5);
        //strokeWeight(1);
        textSize(labelTextSize);
        text("Vn"+comp.name+": "+comp.GetValueString(), comp.endPos.x-8, comp.endPos.y+10);
    }
    /*
    if (labelComponentNames == true) {
        //fill(255,255,255);
        //strokeWeight(1);
        textSize(labelTextSize);
        text(comp.name, midpoint.x, midpoint.y);
    }*/
}

function drawVoltageSource2n(comp)
{
    var startPos = comp.startPos;
    var endPos = comp.endPos;
    var dist = Math.sqrt(Math.pow(startPos.x-endPos.x,2) + Math.pow(startPos.y-endPos.y,2));
    var angle = Math.atan2(startPos.y-endPos.y, startPos.x-endPos.x) + Math.PI;
    var len = (dist/2) - 7;
    var midpoint = new Point((Math.cos(angle)*dist/2+startPos.x),(Math.sin(angle)*dist/2+startPos.y));

    var height1 = 20;
    var height2 = 10;
    var angleModifier = Math.PI/2-0.3;
    line(startPos.x,startPos.y, (Math.cos(angle)*len+startPos.x), (Math.sin(angle)*len+startPos.y));
    line(endPos.x,endPos.y, (Math.cos(angle+Math.PI)*len+endPos.x), (Math.sin(angle+Math.PI)*len+endPos.y));
    var p1 = new Point((Math.cos(angle+angleModifier)*height1+midpoint.x),(Math.sin(angle+angleModifier)*height1+midpoint.y));
    var p2 = new Point((Math.cos(angle-angleModifier)*height1+midpoint.x),(Math.sin(angle-angleModifier)*height1+midpoint.y));
    var p3 = new Point((Math.cos(angle+angleModifier+Math.PI)*height2+midpoint.x),(Math.sin(angle+angleModifier+Math.PI)*height2+midpoint.y));
    var p4 = new Point((Math.cos(angle-angleModifier+Math.PI)*height2+midpoint.x),(Math.sin(angle-angleModifier+Math.PI)*height2+midpoint.y));
    line(p1.x,p1.y,p2.x,p2.y);
    line(p3.x,p3.y,p4.x,p4.y);

    if (labelComponentNames == true) {
        fill(255,255,255);
        stroke(5);
        //strokeWeight(1);
        textSize(labelTextSize);
        text("Vs"+comp.name+": "+comp.GetValueString(), midpoint.x, midpoint.y);
    }
}

function drawCurrentSource(comp)
{
    var startPos = comp.startPos;
    var endPos = comp.endPos;
    var dist = Math.sqrt(Math.pow(startPos.x-endPos.x,2) + Math.pow(startPos.y-endPos.y,2));
    var angle = Math.atan2(startPos.y-endPos.y, startPos.x-endPos.x) + Math.PI;
    var len = (dist/2) - 15;
    var midpoint = new Point((Math.cos(angle)*dist/2+startPos.x),(Math.sin(angle)*dist/2+startPos.y));
    //fill(0,0,0,0);
    circle(midpoint.x, midpoint.y, 30);

    var height = 10;
    var angleModifier = Math.PI/2-0.3;
    line(startPos.x,startPos.y, (Math.cos(angle)*len+startPos.x), (Math.sin(angle)*len+startPos.y));
    line(endPos.x,endPos.y, (Math.cos(angle+Math.PI)*len+endPos.x), (Math.sin(angle+Math.PI)*len+endPos.y));
    var p1 = new Point((Math.cos(angle)*height+midpoint.x),(Math.sin(angle)*height+midpoint.y));
    var p2 = new Point((Math.cos(angle+Math.PI)*height+midpoint.x),(Math.sin(angle+Math.PI)*height+midpoint.y));

    var p3 = new Point((Math.cos(angle+Math.PI/2)*height+midpoint.x),(Math.sin(angle+Math.PI/2)*height+midpoint.y));
    var p4 = new Point((Math.cos(angle-Math.PI/2)*height+midpoint.x),(Math.sin(angle-Math.PI/2)*height+midpoint.y));
    line(p1.x,p1.y,p2.x,p2.y);
    line(p3.x,p3.y,p1.x,p1.y);
    line(p4.x,p4.y,p1.x,p1.y);

    if (labelComponentNames == true) {
        fill(255,255,255);
        stroke(5);
        //strokeWeight(1);
        textSize(labelTextSize);
        text("I"+comp.name+": "+comp.GetValueString(), midpoint.x, midpoint.y);
    }
}

function UpdateDisplay() {
    clear(); //clear the entire screen

    //Draw each of the components
    for (var i=0; i<components.length; i++)
    {
        //set the fill, stroke, strokeWeight for the components.
        textSize(5);
        fill(0,0,0);
        stroke(255);
        strokeWeight(1);
        if (components[i] == selectedComponent) //if the component == selectedComponent, make it more bold so we can easily see it's the selected Component
        {
            strokeWeight(3);
        }

        //these are the ends of the components
        circle(components[i].startPos.x, components[i].startPos.y, nodeSize);
        if (components[i].type != "voltageSource1n") { //we don't want to draw the "node" at the endpoint of voltageSource1n components
            circle(components[i].endPos.x, components[i].endPos.y, nodeSize);
        }
        

        //draw the appropriate component
        if (components[i].type == "wire") {
            drawWire(components[i]);
        } else if (components[i].type == "resistor") {
            drawResistor(components[i]);
        } else if (components[i].type == "capacitor") {
            drawCapacitor(components[i]);
        } else if (components[i].type == "inductor") {
            drawInductor(components[i]);
        } else if (components[i].type == "voltageSource1n") {
            drawVoltageSource1n(components[i]);
        } else if (components[i].type == "voltageSource2n") {
            drawVoltageSource2n(components[i]);
        } else if (components[i].type == "currentSource") {
            drawCurrentSource(components[i]);
        }
        
    }
    

    //Label each node
    fill(255,255,255);
    stroke(5);
    textSize(10);
    for (var i=0; i<nodes.length; i++)
    {
        var pos = nodes[i].points[0];
        text("N"+nodes[i].name +": " + Math.round(nodes[i].voltage*10000)/10000,pos.x-10,pos.y-5);
    }


    //DrawSlider(new Point(100,200), 100, 10, 0.7);
    //DrawTextbox(new Point(100,300), "auto", "auto", "auto", "10");
    //DrawButton(new Point(100,300), 100, 50, 10, "Hello");
}


function DrawPlot(comp, pos, voltageScale, currentScale, maxHeight, maxWidth, AutoScale) {
    if (comp == null || pos == null)
    {
        return;
    }

    if (AutoScale == true) {
        var maxV = 0;
        var maxC = 0;
        var index = 0;
        for (var i=0; i<Math.min(comp.voltageData.length, maxWidth); i++) {
            index = comp.dataStart-i;
            if (index < 0) { index -+ comp.voltageData.length;}
            if (Math.abs(comp.voltageData[index]) > maxV) {
                maxV = Math.abs(comp.voltageData[index]);
            }
        }
        for (var i=0; i<Math.min(comp.voltageData.length, maxWidth); i++) {
            index = comp.dataStart-i;
            if (index < 0) { index -+ comp.currentData.length;}
            if (Math.abs(comp.currentData[index]) > maxC) {
                maxC = Math.abs(comp.currentData[index]);
            }
        }

        voltageScale = Math.ceil((maxHeight/2 - 5)/maxV);
        currentScale = Math.ceil((maxHeight/2 - 5)/maxC);
        var t = Math.ceil(Number(-numLines*gridLineStep/voltageScale).toPrecision(2));
        //voltageScale = 

    }

    var gridLineStep = 25;
    var currentTextXOffset = 35;
    var textYOffset = 0;
    var numLines = Math.ceil((maxHeight/gridLineStep)/2);

    strokeWeight(1);
    textSize(10);

    //draw horizontal grids and labels
    for (var i=-numLines+1; i<numLines; i++)
    {
        stroke(100-abs(i*10));
        line(pos.x, pos.y+i*gridLineStep, pos.x+maxWidth, pos.y+i*gridLineStep);
        stroke(0,0,0);
        fill(0,200,0);
        text(Number(-i*gridLineStep/voltageScale).toPrecision(4), pos.x,pos.y+i*gridLineStep+textYOffset);
        stroke(0,0,0);
        fill(200,200,0);
        text(Number(-i*gridLineStep/currentScale).toPrecision(4), pos.x+currentTextXOffset ,pos.y+i*gridLineStep+textYOffset);
    }



    //draw voltage
    var x1 = comp.dataStart;
    var x2 = x1 - 1;
    stroke(0,255,0);
    for (var i=0; i<maxWidth; i++) 
    {
        if (x1 >= comp.voltageData.length)  {x1 = 0;}
        else if (x1 < 0)  {x1 = comp.voltageData.length-1;}
        if (x2 < 0)  {x2 = comp.voltageData.length-1;} 
        else if (x2 >= comp.voltageData.length)  {x2 = 0;}
        if (Math.abs(comp.voltageData[x1]*voltageScale) < maxHeight/2)
        {
            line(pos.x-i+maxWidth, pos.y-voltageScale*comp.voltageData[x1], pos.x-i+maxWidth-1, pos.y-voltageScale*comp.voltageData[x2]);
        }
        x1 -= 1;
        x2 -= 1;
        if (x1 == comp.dataStart)
        {
            break;
        }
    }

    //draw current
    x1 = comp.dataStart;
    x2 = x1 - 1;
    stroke(255,255,0);
    for (var i=0; i<maxWidth; i++) 
    {
        if (x1 >= comp.currentData.length)  {x1 = 0;}
        else if (x1 < 0)  {x1 = comp.currentData.length-1;}
        if (x2 < 0)  {x2 = comp.currentData.length-1;} 
        else if (x2 >= comp.currentData.length)  {x2 = 0;}
        if (abs(comp.currentData[x1]*currentScale) < maxHeight/2) {
            line(pos.x-i+maxWidth, pos.y-currentScale*comp.currentData[x1], pos.x-i+maxWidth-1, pos.y-currentScale*comp.currentData[x2]);
        }
        x1 -= 1;
        x2 -= 1;
        if (x1 == comp.dataStart)
        {
            break;
        }
    }

    

    //draw mouse vertical line
    if (mouseX > pos.x && mouseX < pos.x+maxWidth && mouseY > pos.y-maxHeight/2 && mouseY < pos.y+maxHeight/2)
    {
        var x = Math.floor(pos.x + maxWidth - mouseX);
        var index = comp.dataStart - x;
        if (index < 0) { index += comp.voltageData.length; }
        
        //getting the pixel vertical position of the voltage and current lines at [index] (where the mouse is on the plot)
        var voltagePosY = pos.y-voltageScale*comp.voltageData[index];
        var currentPosY = pos.y-currentScale*comp.currentData[index];

        if (Math.abs(voltagePosY-mouseY) < Math.abs(currentPosY-mouseY)) //if the voltage line is closer to the mouse...
        {
            stroke(0,200,0);
            fill(0,200,0);
            line(mouseX, pos.y-maxHeight/2, mouseX, pos.y+maxHeight/2);
            stroke(0,0,0);
            text(Number(comp.voltageData[index]).toPrecision(5), mouseX, mouseY);
        } else { //if the current line is closer....
            stroke(200,200,0);
            fill(200,200,0);
            line(mouseX, pos.y-maxHeight/2, mouseX, pos.y+maxHeight/2);
            stroke(0,0,0);
            text(Number(comp.currentData[index]).toPrecision(5), mouseX, mouseY);
        }
    }



    stroke(255);
    noFill();
    rect(pos.x, pos.y-maxHeight/2, maxWidth, maxHeight);
}

function DrawSlider(pos, width, thickness, val) {
    //position is the upper left corner of the object
    //width is how long/wide the slider is
    //thickness = the height/thickness of the slider
    //val is a value from 0 to 1 describing where the slider circle should be set to 
    
    strokeWeight(0);
    fill(150);
    rect(pos.x+thickness/2, pos.y, width-thickness, thickness);
    circle(pos.x+thickness/2, pos.y+thickness/2, thickness);
    circle(pos.x+width-thickness/2, pos.y+thickness/2, thickness);

    //centering the val
    if (val > 1) {val = 1;} 
    else if (val < 0) { val = 0;}
    fill(255);
    circle(pos.x+width*val, pos.y+thickness/2, thickness*2);
}

function DrawTextbox(pos, width, height, textSize_, text_)
{
    text_ = " " + text_;
    if (textSize_ == "default" || textSize_ == "auto" || textSize_ == null || textSize_ < 2)
    {
        textSize_ = 20;
    }
    if (width == "auto")
    {
        width = Math.max(text_.length*textSize_/1.9, 20);
    } else if (width == "defualt")
    {
        width = 50;
    }
    if (height == "auto" || height == "default")
    {
        height = textSize_;
    }
    stroke(200);
    strokeWeight(1);
    noFill();
    rect(pos.x, pos.y, width, height,4);
    stroke(0);
    fill(200);
    textSize(textSize_);
    text(text_, pos.x, pos.y+textSize_-2);
}

function DrawButton(pos, width, height, textSize_, text_, r,g,b)
{
    if (r == null)
    {
        r = 0.5;
        g = 0.5;
        b = 0.5;
    }
    stroke(0,0,0);
    fill(r*255,g*255,b*255);
    rect(pos.x,pos.y,width,height,4);
    fill(255);
    textSize(textSize_);
    text(text_, pos.x + (width - textWidth(text_))/2, pos.y+height/2+textSize_/2-2);
}