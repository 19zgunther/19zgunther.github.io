

function createNewComponent(drawMode)
{
    switch(drawMode)
    {
        case "wire": return new Wire();
        case "resistor": return new Resistor();
        case "switch": return new Switch();
        case "capacitor": return new Capacitor();
        case "inductor": return new Inductor();
        case "voltageSource2n": return new VoltageSource2n();
        case "voltageSource1n": return new VoltageSource1n();
        case "currentSource": return new CurrentSource();
        case "ground": var comp = new VoltageSource1n(); comp.SetValue(0); return comp;
    }
}



class Component {
    constructor() {
        this.name = -1;
        
        this.startPos = new Point(0,0);
        this.endPos = new Point(0,0);
        this.type = "default_component" //can be wire, resistor, capacitor, voltageSource1n, voltageSource2n, or currentSource, or inductor

        this.startNode = null;
        this.endNode = null;

        this.voltage = 5;
        this.current = 0.001;
        
        this.voltageData = new Array(5000);
        this.currentData = new Array(5000);
        this.dataStart = 0;
    }

    GetValueString() {console.error("GetValueString() not implmented for type: " + this.type)}
    GetEncodedDataString(){}
    toString() { 
        var voltage = "null";
        var current = "null";
        if (this.voltage != null) {
            voltage = this.voltage.toPrecision(3);
        }
        if (this.current != null) {
            current = this.current.toPrecision(3);
        }
        return "Type: \'"+this.type + "\'  Value: "+formatValue(this.GetValue(),this.GetStringSuffix())+"  voltage: "+voltage+"  current: "+current;
    }
    SetValue(){}
    GetValue(){}
    GetStringSuffix(){return "Null_Suffix";}
    Draw(){ console.error("Draw(painter) for Class = " + this.type + " not yet implemented"); }


    RecordData()
    {
        this.voltageData.shift(); //remove the first element in the array ( [0,1,2,3,4,5]  ->  [1,2,3,4,5])
        this.currentData.shift();
        this.voltageData.push(this.voltage); //push a new value onto the back
        this.currentData.push(this.current);
    }

    Delete() {
        //IDK maybe in the future i'll need to do something here
    }
}

class Wire extends Component {
    constructor() {
        super();
        this.type = 'wire';
    }
    GetEncodedDataString() {
        return this.type+" "+this.name+" "+"_"+" "+this.startPos.x+" "+this.startPos.y+" "+this.endPos.x+" "+this.endPos.y+" ";
    }
    Draw(p) {
        p.DrawLine(this.startPos.x,this.startPos.y,this.endPos.x,this.endPos.y);
    }

    RecordData()
    {
        if (this.startNode != null)
        {
            this.voltage = this.startNode.voltage;
        }
        this.voltageData.shift(); //remove the first element in the array ( [0,1,2,3,4,5]  ->  [1,2,3,4,5])
        this.currentData.shift();
        this.voltageData.push(this.voltage); //push a new value onto the back
        this.currentData.push(this.current);
    }
}

class Resistor extends Component {
    constructor() {
        super();
        this.type = 'resistor';
        this.resistance = 1000;
    }
    GetEncodedDataString() {
        return this.type+" "+this.name+" "+this.GetValue()+" "+this.startPos.x+" "+this.startPos.y+" "+this.endPos.x+" "+this.endPos.y+" ";
    }
    SetValue(val)
    {   
        val = Number(val)
        if (val == NaN || val == null)
        {
            console.error("Component passed NaN or null in .SetValue(val)");
        }
        this.resistance = val;
    }
    GetValue() {
        return this.resistance;
    }
    GetStringSuffix() {
        return "Ω";
    }
    Draw(p) {

        var startPos = this.startPos; 
        var endPos = this.endPos;
        var dist = Math.sqrt(Math.pow(startPos.x-endPos.x,2) + Math.pow(startPos.y-endPos.y,2)); //distance between startPos and endPos (start & end positions x and y)
        var angle = Math.atan2(startPos.y-endPos.y, startPos.x-endPos.x) + Math.PI; //angle from startPos to endPos, offset by Math.PI because it works
        var len = (dist/2) - 20; //length from each point to center minus resistor box length
        var p5 = new Point((Math.cos(angle)*len+startPos.x), (Math.sin(angle)*len+startPos.y));
        var p6 = new Point((Math.cos(angle+Math.PI)*len+endPos.x), (Math.sin(angle+Math.PI)*len+endPos.y));
        

        var midpoint = new Point((Math.cos(angle)*dist/2+startPos.x),(Math.sin(angle)*dist/2+startPos.y)); //find the midpoint between startPos and endPos
        var height = 20; //this is the distance the points below are from the midpoint
        var angleModifier = 0.3; //how much we deviate from initial angle to draw 4 points which will make the box
        var p1 = new Point((Math.cos(angle+angleModifier)*height+midpoint.x),(Math.sin(angle+angleModifier)*height+midpoint.y)); //these 4 points make up a rectangle
        var p2 = new Point((Math.cos(angle-angleModifier)*height+midpoint.x),(Math.sin(angle-angleModifier)*height+midpoint.y));
        var p3 = new Point((Math.cos(angle+angleModifier+Math.PI)*height+midpoint.x),(Math.sin(angle+angleModifier+Math.PI)*height+midpoint.y));
        var p4 = new Point((Math.cos(angle-angleModifier+Math.PI)*height+midpoint.x),(Math.sin(angle-angleModifier+Math.PI)*height+midpoint.y));
        

        //Draw lines from endpoints to box
        p.DrawLine(startPos.x,startPos.y, p5.x, p5.y); //drawing line from startPos
        p.DrawLine(endPos.x,endPos.y, p6.x, p6.y); //drawing line from endPos
        
        //actually drawing the box now (4 lines)
        p.DrawLine(p1.x,p1.y,p2.x,p2.y); 
        p.DrawLine(p3.x,p3.y,p4.x,p4.y);
        p.DrawLine(p1.x,p1.y,p4.x,p4.y);
        p.DrawLine(p2.x,p2.y,p3.x,p3.y);

        if (labelComponentNames == true) {
            //fill(255,255,255);
            //stroke(5);
            //strokeWeight(1);
            //textSize(labelTextSize);
            //text("R"+this.name+": "+comp.GetValueString(), midpoint.x, midpoint.y);
        }
    }
}

class Capacitor extends Component {
    constructor() {
        super();
        this.type = 'capacitor';
        this.capacitance = 0.000001;
    }
    GetEncodedDataString() {
        return this.type+" "+this.name+" "+this.GetValue()+" "+this.startPos.x+" "+this.startPos.y+" "+this.endPos.x+" "+this.endPos.y+" ";
    }
    SetValue(val)
    {   
        val = Number(val)
        if (val == NaN || val == null)
        {
            console.error("Component passed NaN or null in .SetValue(val)");
        }
        this.capacitance = val;
    }
    GetValue() {
        return this.capacitance;
    }
    GetStringSuffix() {
        return "F";
    }
    Draw(p) {
        var startPos = this.startPos;
        var endPos = this.endPos;
        var dist = Math.sqrt(Math.pow(startPos.x-endPos.x,2) + Math.pow(startPos.y-endPos.y,2));
        var angle = Math.atan2(startPos.y-endPos.y, startPos.x-endPos.x) + Math.PI;
        var len = (dist/2) - 7;
        var midpoint = new Point((Math.cos(angle)*dist/2+startPos.x),(Math.sin(angle)*dist/2+startPos.y));

        var height = 20;
        var angleModifier = Math.PI/2-0.3;
        var ps = new Point((Math.cos(angle)*len+startPos.x),(Math.sin(angle)*len+startPos.y));
        var pe = new Point((Math.cos(angle+Math.PI)*len+endPos.x), (Math.sin(angle+Math.PI)*len+endPos.y));
        p.DrawLine(startPos.x,startPos.y, ps.x, ps.y);
        p.DrawLine(endPos.x,endPos.y, pe.x, pe.y);
        var p1 = new Point((Math.cos(angle+angleModifier)*height+midpoint.x),(Math.sin(angle+angleModifier)*height+midpoint.y));
        var p2 = new Point((Math.cos(angle-angleModifier)*height+midpoint.x),(Math.sin(angle-angleModifier)*height+midpoint.y));
        var p3 = new Point((Math.cos(angle+angleModifier+Math.PI)*height+midpoint.x),(Math.sin(angle+angleModifier+Math.PI)*height+midpoint.y));
        var p4 = new Point((Math.cos(angle-angleModifier+Math.PI)*height+midpoint.x),(Math.sin(angle-angleModifier+Math.PI)*height+midpoint.y));
        p.DrawLine(p1.x,p1.y,p2.x,p2.y);
        p.DrawLine(p3.x,p3.y,p4.x,p4.y);


        var size = 5;
        if (this.voltage > 0) { 
            var p5 = new Point(pe.x + 15*Math.cos(angle+Math.PI/3), pe.y + 15*Math.sin(angle+Math.PI/3));
            var p6 = new Point(p5.x + size*2*Math.cos(angle), p5.y + size*2*Math.sin(angle));
            var p7 = new Point(p5.x + size*1.5*Math.cos(angle+Math.PI/4), p5.y + size*1.5*Math.sin(angle+Math.PI/4));
            var p8 = new Point(p5.x + size*1.5*Math.cos(angle-Math.PI/4), p5.y + size*1.5*Math.sin(angle-Math.PI/4));
            p.DrawLine(p5.x,p5.y,p6.x,p6.y);
            p.DrawLine(p7.x,p7.y,p8.x,p8.y);
        } else {
            var p5 = new Point(ps.x + 15*Math.cos(angle+Math.PI/3), ps.y - 15*Math.sin(angle+Math.PI/3));
            var p6 = new Point(p5.x - size*2*Math.cos(angle), p5.y - size*2*Math.sin(angle));
            var p7 = new Point(p5.x - size*1.5*Math.cos(angle+Math.PI/4), p5.y - size*1.5*Math.sin(angle+Math.PI/4));
            var p8 = new Point(p5.x - size*1.5*Math.cos(angle-Math.PI/4), p5.y - size*1.5*Math.sin(angle-Math.PI/4));
            p.DrawLine(p5.x,p5.y,p6.x,p6.y);
            p.DrawLine(p7.x,p7.y,p8.x,p8.y);
        }


        if (labelComponentNames == true) {
            //fill(255,255,255);
            //stroke(5);
            //strokeWeight(1);
            //textSize(labelTextSize);
            //text("C"+comp.name+": "+comp.GetValueString(), midpoint.x, midpoint.y);
        }
    }
}

class Inductor extends Component {
    constructor() {
        super();
        this.type = 'inductor';
        this.inductance = 0.001;
    }
    GetEncodedDataString() {
        return this.type+" "+this.name+" "+this.GetValue()+" "+this.startPos.x+" "+this.startPos.y+" "+this.endPos.x+" "+this.endPos.y+" ";
    }
    SetValue(val)
    {   
        val = Number(val)
        if (val == NaN || val == null)
        {
            console.error("Component passed NaN or null in .SetValue(val)");
        }
        this.inductance = val;
    }
    GetValue() {
        return this.inductance;
    }
    GetStringSuffix() {
        return "H";
    }

    Draw(p) {
        //draws inductor on canvas
        var startPos = this.startPos;  //comp = a resistor Component object
        var endPos = this.endPos;
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

        p.DrawLine(startPos.x,startPos.y, ps1.x, ps1.y); //drawing line from startPos
        p.DrawLine(endPos.x,endPos.y, pe1.x, pe1.y); //drawing line from endPos
        
        p.DrawArc(ps2.x,ps2.y, 5, 0+angle, Math.PI+angle);
        p.DrawArc(ps3.x,ps3.y, 5, 0+angle, Math.PI+angle);
        p.DrawArc(pe2.x,pe2.y, 5, 0+angle, Math.PI+angle);
        p.DrawArc(pe3.x,pe3.y, 5, 0+angle, Math.PI+angle);


        //this is all for drawing the arrow next to the inductor specifying current direction
        var height = 13;
        len = dist/2 - 15;
        var p1 = new Point((Math.cos(angle)*len+startPos.x+Math.cos(angle+Math.PI/2)*height), (Math.sin(angle)*len+startPos.y+Math.sin(angle+Math.PI/2)*height));
        var p2 = new Point((Math.cos(angle+Math.PI)*len+endPos.x+Math.cos(angle+Math.PI/2)*height), (Math.sin(angle+Math.PI)*len+endPos.y+Math.sin(angle+Math.PI/2)*height));
        var p3;
        var p4;
        var armLength = 5;

        if (this.current < 0)
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

        if (this.current != 0)
        {
            p.DrawLine(p1.x,p1.y,p2.x,p2.y);
            p.DrawLine(p1.x,p1.y,p3.x,p3.y);
            p.DrawLine(p1.x,p1.y,p4.x,p4.y);
        }




        if (labelComponentNames == true) {
            //fill(255,255,255);
            //stroke(5);
            //strokeWeight(1);
            //textSize(labelTextSize);
            //text("L"+comp.name+": "+comp.GetValueString(), midpoint.x, midpoint.y);
        }
    }
}

class VoltageSource1n extends Component {
    constructor() {
        super();
        this.type = 'voltageSource1n';
        this.voltage = 5;
    }
    GetEncodedDataString() {
        return this.type+" "+this.name+" "+this.GetValue()+" "+this.startPos.x+" "+this.startPos.y+" "+this.endPos.x+" "+this.endPos.y+" ";
    }
    SetValue(val)
    {   
        val = Number(val)
        if (val == NaN || val == null)
        {
            console.error("Component passed NaN or null in .SetValue(val)");
            return;
        }
        this.voltage = val;
    }
    GetValue() {
        return this.voltage;
    }
    GetStringSuffix() {
        return "V";
    }

    Draw(p) {
        p.DrawLine(this.startPos.x,this.startPos.y,this.endPos.x,this.endPos.y);
        //strokeWeight(2);
        p.DrawLine(this.endPos.x - 10, this.endPos.y, this.endPos.x + 10, this.endPos.y);
        if (this.startPos.y > this.endPos.y) //slope down, so draw number below.
        {
            //fill(255,255,255);
            //stroke(5);
            //strokeWeight(1);
            //textSize(labelTextSize);
            //text("Vn"+comp.name+": "+comp.GetValueString(), comp.endPos.x-8, comp.endPos.y-5);
        } else {
           // fill(255,255,255);
            //stroke(5);
            //strokeWeight(1);
            //textSize(labelTextSize);
            //text("Vn"+comp.name+": "+comp.GetValueString(), comp.endPos.x-8, comp.endPos.y+10);
        }
    }
}

class VoltageSource2n extends Component {
    constructor() {
        super();
        this.type = 'voltageSource2n';
        this.voltage = 5;
    }
    GetEncodedDataString() {
        return this.type+" "+this.name+" "+this.GetValue()+" "+this.startPos.x+" "+this.startPos.y+" "+this.endPos.x+" "+this.endPos.y+" ";
    }
    SetValue(val)
    {   
        val = Number(val)
        if (val == NaN || val == null)
        {
            console.error("Component passed NaN or null in .SetValue(val)");
        }
        this.voltage = val;
    }
    GetValue() {
        return this.voltage;
    }
    GetStringSuffix() {
        return "V";
    }

    Draw(p) {
        var startPos = this.startPos;
        var endPos = this.endPos;
        var dist = Math.sqrt(Math.pow(startPos.x-endPos.x,2) + Math.pow(startPos.y-endPos.y,2));
        var angle = Math.atan2(startPos.y-endPos.y, startPos.x-endPos.x) + Math.PI;
        var len = (dist/2) - 7;
        var midpoint = new Point((Math.cos(angle)*dist/2+startPos.x),(Math.sin(angle)*dist/2+startPos.y));

        var height1 = 20;
        var height2 = 10;
        var angleModifier = Math.PI/2-0.3;
        p.DrawLine(startPos.x,startPos.y, (Math.cos(angle)*len+startPos.x), (Math.sin(angle)*len+startPos.y));
        p.DrawLine(endPos.x,endPos.y, (Math.cos(angle+Math.PI)*len+endPos.x), (Math.sin(angle+Math.PI)*len+endPos.y));
        var p1 = new Point((Math.cos(angle+angleModifier)*height1+midpoint.x),(Math.sin(angle+angleModifier)*height1+midpoint.y));
        var p2 = new Point((Math.cos(angle-angleModifier)*height1+midpoint.x),(Math.sin(angle-angleModifier)*height1+midpoint.y));
        var p3 = new Point((Math.cos(angle+angleModifier+Math.PI)*height2+midpoint.x),(Math.sin(angle+angleModifier+Math.PI)*height2+midpoint.y));
        var p4 = new Point((Math.cos(angle-angleModifier+Math.PI)*height2+midpoint.x),(Math.sin(angle-angleModifier+Math.PI)*height2+midpoint.y));
        p.DrawLine(p1.x,p1.y,p2.x,p2.y);
        p.DrawLine(p3.x,p3.y,p4.x,p4.y);

        if (labelComponentNames == true) {
            //fill(255,255,255);
            //stroke(5);
            //strokeWeight(1);
            //textSize(labelTextSize);
            //text("Vs"+this.name+": "+this.GetValueString(), midpoint.x, midpoint.y);
        }
    }
}

class CurrentSource extends Component {
    constructor() {
        super();
        this.type = 'voltageSource1n';
        this.current = 5;
    }
    GetEncodedDataString() {
        return this.type+" "+this.name+" "+this.GetValue()+" "+this.startPos.x+" "+this.startPos.y+" "+this.endPos.x+" "+this.endPos.y+" ";
    }
    SetValue(val)
    {   
        val = Number(val)
        if (val == NaN || val == null)
        {
            console.error("Component passed NaN or null in .SetValue(val)");
        }
        this.current = val;
    }
    GetValue() {
        return this.current;
    }
    GetStringSuffix() {
        return "A";
    }

    Draw(p) {
        var startPos = this.startPos;
        var endPos = this.endPos;
        var dist = Math.sqrt(Math.pow(startPos.x-endPos.x,2) + Math.pow(startPos.y-endPos.y,2));
        var angle = Math.atan2(startPos.y-endPos.y, startPos.x-endPos.x) + Math.PI;
        var len = (dist/2) - 15;
        var midpoint = new Point((Math.cos(angle)*dist/2+startPos.x),(Math.sin(angle)*dist/2+startPos.y));
        //fill(0,0,0,0);
        p.DrawArc(midpoint.x, midpoint.y, 15, 0, Math.PI*2);

        var height = 10;
        var angleModifier = Math.PI/2-0.3;
        p.DrawLine(startPos.x,startPos.y, (Math.cos(angle)*len+startPos.x), (Math.sin(angle)*len+startPos.y));
        p.DrawLine(endPos.x,endPos.y, (Math.cos(angle+Math.PI)*len+endPos.x), (Math.sin(angle+Math.PI)*len+endPos.y));
        var p1 = new Point((Math.cos(angle)*height+midpoint.x),(Math.sin(angle)*height+midpoint.y));
        var p2 = new Point((Math.cos(angle+Math.PI)*height+midpoint.x),(Math.sin(angle+Math.PI)*height+midpoint.y));

        var p3 = new Point((Math.cos(angle+Math.PI/2)*height+midpoint.x),(Math.sin(angle+Math.PI/2)*height+midpoint.y));
        var p4 = new Point((Math.cos(angle-Math.PI/2)*height+midpoint.x),(Math.sin(angle-Math.PI/2)*height+midpoint.y));
        p.DrawLine(p1.x,p1.y,p2.x,p2.y);
        p.DrawLine(p3.x,p3.y,p1.x,p1.y);
        p.DrawLine(p4.x,p4.y,p1.x,p1.y);

        if (labelComponentNames == true) {
            //fill(255,255,255);
            //stroke(5);
            //strokeWeight(1);
            //textSize(labelTextSize);
            //text("I"+this.name+": "+this.GetValueString(), midpoint.x, midpoint.y);
        }
    }
}


class Switch extends Component {
    constructor() {
        super();
        this.type = 'switch';
        this.switchClosed = 1; //1 = true = switch_Is_Closed, 0 = false = switch_is_open
    }
    GetEncodedDataString() {
        return this.type+" "+this.name+" "+this.GetValue()+" "+this.startPos.x+" "+this.startPos.y+" "+this.endPos.x+" "+this.endPos.y+" ";
    }
    SetValue(val)
    {   
        val = Number(val)
        if (val == NaN || val == null)
        {
            console.error("Component passed NaN or null in .SetValue(val)");
        }
        if (val == 0 || val == 1) {
            this.switchClosed = val;
        } else {
            console.error("Component type " + this.type + " was passed invalid value ("+val+"). Expected 0 or 1");
        }
    }
    GetValue() {
        return this.switchClosed;
    }
    GetStringSuffix() {
        return "B";
    }
    Draw(p) {

        var startPos = this.startPos; 
        var endPos = this.endPos;
        var dist = Math.sqrt(Math.pow(startPos.x-endPos.x,2) + Math.pow(startPos.y-endPos.y,2)); //distance between startPos and endPos (start & end positions x and y)
        var angle = Math.atan2(startPos.y-endPos.y, startPos.x-endPos.x) + Math.PI; //angle from startPos to endPos, offset by Math.PI because it works
        var len = (dist/2) - 20; //length from each point to center minus resistor box length
        var p5 = new Point((Math.cos(angle)*len+startPos.x), (Math.sin(angle)*len+startPos.y));
        var p6 = new Point((Math.cos(angle+Math.PI)*len+endPos.x), (Math.sin(angle+Math.PI)*len+endPos.y));
        

        //var midpoint = new Point((Math.cos(angle)*dist/2+startPos.x),(Math.sin(angle)*dist/2+startPos.y)); //find the midpoint between startPos and endPos
        //var height = 20; //this is the distance the points below are from the midpoint
        //var angleModifier = 0.3; //how much we deviate from initial angle to draw 4 points which will make the box
        //var p1 = new Point((Math.cos(angle+angleModifier)*height+midpoint.x),(Math.sin(angle+angleModifier)*height+midpoint.y)); //these 4 points make up a rectangle
        //var p2 = new Point((Math.cos(angle-angleModifier)*height+midpoint.x),(Math.sin(angle-angleModifier)*height+midpoint.y));
        //var p3 = new Point((Math.cos(angle+angleModifier+Math.PI)*height+midpoint.x),(Math.sin(angle+angleModifier+Math.PI)*height+midpoint.y));
        //var p4 = new Point((Math.cos(angle-angleModifier+Math.PI)*height+midpoint.x),(Math.sin(angle-angleModifier+Math.PI)*height+midpoint.y));
        

        //Draw lines from endpoints to box
        p.DrawLine(startPos.x,startPos.y, p5.x, p5.y); //drawing line from startPos
        p.DrawLine(endPos.x,endPos.y, p6.x, p6.y); //drawing line from endPos
        p.DrawCircle(p5.x,p5.y,3);
        p.DrawCircle(p6.x,p6.y,3);
        
        if (this.switchClosed == 1) {
            p.DrawLine(p5.x + Math.cos(angle+Math.PI/2)*3, p5.y + Math.sin(angle+Math.PI/2)*3,  p6.x, p6.y);
        } else {
            p.DrawLine(p5.x + Math.cos(angle+Math.PI/2)*15, p5.y + Math.sin(angle+Math.PI/2)*15,  p6.x, p6.y);
        }

        if (labelComponentNames == true) {
            //fill(255,255,255);
            //stroke(5);
            //strokeWeight(1);
            //textSize(labelTextSize);
            //text("R"+this.name+": "+comp.GetValueString(), midpoint.x, midpoint.y);
        }
    }
}
