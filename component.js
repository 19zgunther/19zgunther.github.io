

class Component {
    constructor() {
        this.name = -1;
        
        this.startPos = new Point(0,0);
        this.endPos = new Point(0,0);
        this.type = "wire" //can be wire, resistor, capacitor, voltageSource1n, voltageSource2n, or currentSource, or inductor

        this.startNode = null;
        this.endNode = null;

        this.resistance = 1000;
        this.capacitance = 0.01;
        this.voltage = 5;
        this.current = 0.001;
        this.inductance = 0.01;
    }
    Delete() {
        //IDK maybe in the future i'll need to do something here
    }
    GetString() {
        var s = this.type+" "+this.name+" ";
        if (this.type == "wire")
        {
            s += "_ ";
        } else if (this.type == "resistor")
        {
            s += this.resistance + " ";
        } else if (this.type == "capacitor")
        {
            s += this.capacitance + " ";
        } else if (this.type == "inductor")
        {
            s += this.inductance + " ";
        } else if (this.type == "voltageSource1n")
        {
            s += this.voltage + " ";
        } else if (this.type == "voltageSource2n")
        {
            s += this.voltage + " ";
        } else if (this.type == "currentSource")
        {
            s += this.current + " ";
        }

        return s+this.startPos.x+" "+this.startPos.y+" "+this.endPos.x+" "+this.endPos.y+" ";
    }

    GetValueString() {
        return "";
    }

    SetValue(str)
    {
        var num = Number(str);
        if (this.type == "wire")
        {

        } else if (this.type == "resistor")
        {
            this.resistance = num;
        } else if (this.type == "capacitor")
        {
            this.capacitance = num;
        } else if (this.type == "inductor")
        {
            this.inductance = num;
        } else if (this.type == "voltageSource1n")
        {
            this.voltage = num;
        } else if (this.type == "voltageSource2n")
        {
            this.voltage = num;
        } else if (this.type == "currentSource")
        {
            this.current = num;
        }
    }

    GetValue()
    {
        if (this.type == "wire")
        {
            return null;
        } else if (this.type == "resistor")
        {
            return this.resistance;
        } else if (this.type == "capacitor")
        {
            return this.capacitance;
        } else if (this.type == "inductor")
        {
            return this.inductance;
        } else if (this.type == "voltageSource1n")
        {
            return this.voltage;
        } else if (this.type == "voltageSource2n")
        {
            return this.voltage;
        } else if (this.type == "currentSource")
        {
            return this.current;
        }
    }
}

