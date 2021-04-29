//Elements
var simulatorElement = document.getElementById("Simulator");
var voltagePotentialText = document.getElementById("VoltagePotentialText");
var electricFieldMagnitudeText = document.getElementById("ElectricFieldMagnitudeText");
var GridSizeInputElement = document.getElementById("GridSizeInput");
var NewParicleChargeInputElement = document.getElementById("NewParticleChargeInput");
var SelectedParticleChargeInputElement = document.getElementById("SelectedParticleChargeInput");
var arrowBrightnessSliderElement = document.getElementById("ArrowBrightnessSlider");
var TEST = document.getElementById("TEST");
var canvas = null;

//Screen Settings
var updateInterval = setInterval(Update,50);
var width;
var height;
var arrowSize;
var sensorSize;
var particleSize;
var gridSize;

//world settings
var arrowBrightnessMultiplier = 50;
var mouseClickDistance = 20; //in pixels
var selectedParticle = null;
var prevSelectedParticle = null;
var selectedSensor = null;
var moveSelectedParticle = false;
var moveSelectedSensor = false;
var changingParticleCharge = false;
var snapToGrid = true;
var gridUnits = 1;      //0.01 = cm, 1=m, 1000 = km per grid line
var minNumberMinorGridLines = 50;
var majorGridLineOpacity = 150;     //out of 255
var minorGridLineOpacity = 70;      //out of 255


//Objects

var particles = [];     //an array of particle objects
var sensors = [];
var cursorArrow;        //an arrow which follows your cursor around

//Misc
const k = 9*Math.pow(10,9); //phsyics constant
var avgArrowBrightness = 0;
var selectedParticleRingThickness = 5;
var needUpdate = true;

var GraphCanvas = null;
var ArrowCanvas = null;
var ParticleCanvas = null;
var EquipotentialCanvas = null;
var updateCounter = 0;


//If we resize, get rid of all the arrows and particles. We'll just remake them
window.onresize = function(event){
    //clear();
    setup();
    for(const p in particles)
    {
        p.posx = worldToScreen(screenToWorldRound(p.posx));
        p.posy = worldToScreen(screenToWorldRound(p.posy));
    }
    for(const s in sensors)
    {
        s.posx = worldToScreen(screenToWorldRound(s.posx));
        s.posy = worldToScreen(screenToWorldRound(s.posy));
    }
    updateCounter = 0;
}
function CreateNewParticle()
{   //This function is EXCLUSIVELY called by "onClick = ...." in the html
    var charge = Number(NewParicleChargeInputElement.value)*0.000000001;
    selectedParticle = new Particle(charge, particleSize, mouseX,mouseY);
    particles.push(selectedParticle);
    moveSelectedParticle= true;
    SelectedParticleChargeInputElement.value = selectedParticle.charge*1000000000;
    selectedSensor = null;
}
function CreateNewSensor() {
    selectedSensor = new Sensor(0,0,sensorSize);
    selectedParticle = null;
    sensors.push(selectedSensor);
    moveSelectedSensor = true;
}
function DeleteParticle(particle) {
    for(var i=0; i<particles.length; i++)
    {
        if (particles[i] == particle)
        {
            particles.splice(i,1);
        }
    }
    updateCounter = 0;
}
function DeleteSensor(sensor) {
    for(var i=0; i<sensors.length; i++)
    {
        if (sensors[i] == sensor)
        {
            sensors.splice(i,1);
            sensor.Delete();
        }
    }
}
function mousePressed() {
    var rect = SelectedParticleChargeInputElement.getBoundingClientRect();
    var dx = (rect.right+rect.left)/2 - mouseX;
    var dy = (rect.top+rect.bottom)/2 - mouseY;
    var dist = Math.sqrt(dx*dx+dy*dy);
    var minDist = mouseClickDistance;


    //selectedParticle = null;
    //selectedParticle = prevSelectedParticle;
    //selectedSensor = null;
    for(var i=0; i<particles.length; i++)
    {
        dx = particles[i].posx-mouseX;
        dy = particles[i].posy-mouseY;
        dist = Math.sqrt(dx*dx+dy*dy);
        if (dist < minDist)
        {
            moveSelectedParticle = true;
            moveSelectedSensor = false;
            minDist = dist;
            selectedParticle = particles[i];
            selectedSensor = null;
            SelectedParticleChargeInputElement.value = selectedParticle.charge*1000000000;
        }
    }
    for(var i=0; i<sensors.length; i++)
    {
        dx = sensors[i].posx-mouseX;
        dy = sensors[i].posy-mouseY;
        dist = Math.sqrt(dx*dx+dy*dy)
        if (dist < minDist)
        {
            moveSelectedSensor = true;
            moveSelectedParticle = false;
            selectedParticle = null;
            minDist = dist;
            selectedSensor = sensors[i];
        }
    }

    



}
function mouseReleased() {
    if (selectedParticle != null)
    {
        if (snapToGrid == true)
        {
            selectedParticle.posx = worldToScreen(screenToWorldRound(selectedParticle.posx));
            selectedParticle.posy = worldToScreen(screenToWorldRound(selectedParticle.posy));
        }
    }
    if (selectedSensor != null)
    {
        if (snapToGrid == true)
        {
            selectedSensor.posx = worldToScreen(screenToWorldRound(selectedSensor.posx));
            selectedSensor.posy = worldToScreen(screenToWorldRound(selectedSensor.posy));
        }
    }
    moveSelectedParticle = false;
    moveSelectedSensor = false;
}
function keyPressed() {
    if ((keyCode == DELETE || keyCode == BACKSPACE) && changingParticleCharge == false)
    {
        if (selectedParticle != null)
        {
            DeleteParticle(selectedParticle);
        }
        if (selectedSensor != null)
        {
            DeleteSensor(selectedSensor);
        }
        selectedParticle = null;
        selectedSensor = null;
    } else if (keyCode == ESCAPE)
    {
        changingParticleCharge = false;
        if (selectedParticle != null)
        {
            if (snapToGrid == true)
            {
                selectedParticle.posx = worldToScreen(screenToWorldRound(selectedParticle.posx));
                selectedParticle.posy = worldToScreen(screenToWorldRound(selectedParticle.posy));
            }
        }
        if (selectedSensor != null)
        {
            if (snapToGrid == true)
            {
                selectedSensor.posx = worldToScreen(screenToWorldRound(selectedSensor.posx));
                selectedSensor.posy = worldToScreen(screenToWorldRound(selectedSensor.posy));
            }
        }
        selectedParticle = null;
        selectedSensor = null;
    }
}
function NewParticleChargeClick() {
    selectedSensor = null;
    selectedParticle = null;
}
function SelectedParticleChargeInputClick() {
    changingParticleCharge = true;
}



function setup() {
    //initialize global variables
    width = window.innerWidth;
    height = window.innerHeight*1;
    arrowSize = Math.min(width,height)/75;
    sensorSize = arrowSize*2;
    particleSize = Math.min(width,height)/30;
    gridSize = Math.min(width,height)/minNumberMinorGridLines;

    //Create a new canvas
    canvas = createCanvas(width, height);
    canvas.parent('sketch-container-main');


    //Handling The Background Grid
    if (GraphCanvas == null) {
        GraphCanvas = new p5(P5GridSketch);
        GraphCanvas.resizeCanvas(width, height);
        GraphCanvas.Update();
    } else {
        GraphCanvas.resizeCanvas(width, height);
        GraphCanvas.Update();
    }

    if (ArrowCanvas == null) {
        ArrowCanvas = new p5(P5ArrowSketch);
    }

    if (ParticleCanvas == null) {
        ParticleCanvas = new p5(P5ParticleSketch);
    }

    if (EquipotentialCanvas == null) {
        EquipotentialCanvas = new p5(P5EquipotentialSketch);
    }

    //creating the cursor arrow
    cursorArrow = new Arrow(arrowSize, mouseX, mouseY);

    //Misc
    GridSizeInputElement.value = "1";
    NewParicleChargeInputElement.value = "1";


    particles.push(new Particle(1*Math.pow(10,-9),particleSize, worldToScreen(35), worldToScreen(15)));
    particles.push(new Particle(-1*Math.pow(10,-9),particleSize, worldToScreen(45), worldToScreen(25)));
    particles.push(new Particle(1*Math.pow(10,-9),particleSize, worldToScreen(35), worldToScreen(25)));


}
function Update() {
    TEST.innerHTML = changingParticleCharge;
    updateCounter += 1;
    if (moveSelectedParticle == true && (cursorArrow.posx != mouseX || cursorArrow.posy != mouseY))
    {
        updateCounter = 0;
    }
    if (updateCounter < 4)
    {
        //Arrows
        ArrowCanvas.Update();

        //Equipotentials
        EquipotentialCanvas.Update();
    }
    clear(); //Clear the canvas
    
    //Updating Cursor Arrow
    cursorArrow.posx = mouseX;
    cursorArrow.posy = mouseY;
    cursorArrow.Update();          //if you're wondering, we draw this arrow later with the rest of them
    voltagePotentialText.innerHTML = "Voltage Potential: " + Math.round(cursorArrow.GetVoltage()*1000)/1000;
    electricFieldMagnitudeText.innerHTML = "Electric Field Magnitude: " + Math.round(cursorArrow.mag*1000)/1000;


    //Updating Selected Particle and Sensor
    if (selectedParticle != null && moveSelectedParticle == true) {
        if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height)
        {
            selectedParticle.posx = mouseX;
            selectedParticle.posy = mouseY;
        }
    }
    if (selectedSensor != null && moveSelectedSensor == true) {
        if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height)
        {
            selectedSensor.posx = mouseX;
            selectedSensor.posy = mouseY;
        }
    }

    //Draw Particles
    ParticleCanvas.Update();

    
    //Draw Sensors
    for(var i=0; i<sensors.length; i++)
    {
        sensors[i].Update();
    }
    for(var i=0; i<sensors.length; i++)
    {
        sensors[i].Draw();
    }

    //MISC
    gridUnits = parseFloat(GridSizeInputElement.value)/10;  //Updating grid units - we need to divide by 10 because we have 10 minor grid line divisions between major grid lines
    if (changingParticleCharge == true)
    {
        if (selectedParticle.charge != Number(SelectedParticleChargeInputElement.value)/1000000000)
        {
            selectedParticle.charge = Number(SelectedParticleChargeInputElement.value)/1000000000;
            updateCounter = 0;
        }
    }
    if (selectedParticle == null)
    {
        SelectedParticleChargeInputElement.value = "";
    }
    if (arrowBrightnessMultiplier != arrowBrightnessSliderElement.value/500)
    {
        arrowBrightnessMultiplier = arrowBrightnessSliderElement.value/500;
        updateCounter = 0;
    }

}


function Calc(posx, posy)
{
    var volt = 0;
    var negVolt = 0;
    var posVolt = 0;
    var angle = 0;
    var q;      //will hold particle charge
    var dx;     //will hold difference in x position
    var dy;     //will hold difference in y position
    var dist;   //distance
    var mag;    //magnitude
    
    var totx = 0;
    var toty = 0;

    for(var i=0;i<particles.length;i++)
    {
        q = particles[i].charge;
        dx = (particles[i].posx-posx)*gridUnits/gridSize;
        dy = (particles[i].posy-posy)*gridUnits/gridSize;
        dist = Math.sqrt(dx*dx+dy*dy);
        mag = (k*q)/(dist*dist);
        
        totx += mag*dx/dist;
        toty += mag*dy/dist;

        volt += k*q/dist;
        if (q>0) {
            posVolt += k*q/dist;
        } else {
            negVolt -= k*q/dist;
        }
    }
    angle = Math.PI*3/2-Math.atan2(toty,totx);
    mag = Math.sqrt(toty*toty+totx*totx);

    return [mag, volt, angle, posVolt, negVolt];
}
function CalcLite(posx, posy)
{
    var volt = 0;
    var q;      //will hold particle charge
    var dx;     //will hold difference in x position
    var dy;     //will hold difference in y position
    var dist;   //distance

    for(var i=0;i<particles.length;i++)
    {
        q = particles[i].charge;
        dx = (particles[i].posx-posx)*gridUnits/gridSize;
        dy = (particles[i].posy-posy)*gridUnits/gridSize;
        dist = Math.sqrt(dx*dx+dy*dy);
        volt += k*q/dist;
    }
    return volt;
}
function CalcMedium(posx, posy)
{
    var volt = 0;
    var q;      //will hold particle charge
    var dx;     //will hold difference in x position
    var dy;     //will hold difference in y position
    var dist;   //distance

    var mag = 0;
    var totx = 0;
    var toty = 0;

    for(var i=0;i<particles.length;i++)
    {
        q = particles[i].charge;
        dx = (particles[i].posx-posx)*gridUnits/gridSize;
        dy = (particles[i].posy-posy)*gridUnits/gridSize;
        dist = Math.sqrt(dx*dx+dy*dy);
        volt += k*q/dist;
        mag = (k*q)/(dist*dist);

        totx += mag*dx/dist;
        toty += mag*dy/dist;
    }

    angle = Math.PI*3/2-Math.atan2(toty,totx);
    return [volt,angle];
}


class Arrow {
    constructor(size, posx, posy)
    {
        this.size = size;
        this.posx = posx;
        this.posy = posy;
        this.volt = 0;
        this.negVolt = 0;
        this.posVolt = 0;
        this.mag = 0;
        this.angle = 0;
        this.line1 = [0,0,0,0];
        this.line2 = [0,0];
        this.line3 = [0,0];
    }
    Update()
    {
        var output = Calc(this.posx, this.posy);
        this.mag = output[0];
        this.volt = output[1];
        this.angle = output[2];
        this.posVolt = output[3];
        this.negVolt = output[4];

        this.line1[0] = this.posx- Math.sin(this.angle)*this.size;
        this.line1[1] = this.posy- Math.cos(this.angle)*this.size;
        this.line1[2] = this.posx+ Math.sin(this.angle)*this.size;
        this.line1[3] = this.posy+ Math.cos(this.angle)*this.size;

        this.line2[0] = this.posx- Math.cos(this.angle)*this.size/2;
        this.line2[1] = this.posy- Math.sin(-this.angle)*this.size/2;

        this.line3[0] = this.posx+ Math.cos(this.angle)*this.size/2;
        this.line3[1] = this.posy+ Math.sin(-this.angle)*this.size/2;

        if (this.mag > 0 && this.mag != null) {
            return this.mag;
        } else {
            return 0;
        }
    }
    Draw()
    {
        var tot= this.posVolt+this.negVolt;
        stroke(400*this.posVolt/tot, 0, 400*this.negVolt/tot, this.mag*arrowBrightnessMultiplier);
        line(this.line1[0], this.line1[1], this.line1[2],this.line1[3]);
        line(this.line2[0], this.line2[1], this.line1[2],this.line1[3]);
        line(this.line3[0], this.line3[1], this.line1[2],this.line1[3]);
    }
    GetVoltage()
    {
        return this.volt;
    }
}
class Particle {
    constructor(charge, size, posx, posy)
    {
        this.posx = posx;
        this.posy = posy;
        this.charge = charge;
        this.size = size;
    }
}
class Sensor {
    constructor(posx, posy, size) {
        this.posx = posx;
        this.posy = posy;
        this.size = size;
        //this.arrow = new Arrow(size*2,posx,posy);
        this.angle = 0;
        this.line1 = [0,0,0,0];
        this.line2 = [0,0];
        this.line3 = [0,0];
        this.mag = 0;
        this.volt = 0;
        this.text = document.createElement("div");
        this.text.setAttribute("class", "SensorText");
        simulatorElement.append(this.text);
    }
    Update()
    {
        var out = Calc(this.posx,this.posy);
        this.mag = out[0];
        this.volt = out[1];
        this.angle = out[2];
        //this.text.setAttribute("left",this.posx+"px");
        //this.text.setAttribute("top", )
        this.text.style = "left:"+this.posx+"px; top:"+this.posy+"px;";
        this.text.innerHTML = Math.round(this.mag*10)/10 + " V/m</br>" + Math.round(this.volt*10)/10 + " V";

        this.line1[0] = this.posx- Math.sin(this.angle)*this.size;
        this.line1[1] = this.posy- Math.cos(this.angle)*this.size;
        this.line1[2] = this.posx+ Math.sin(this.angle)*this.size;
        this.line1[3] = this.posy+ Math.cos(this.angle)*this.size;

        this.line2[0] = this.posx- Math.cos(this.angle)*this.size/2;
        this.line2[1] = this.posy- Math.sin(-this.angle)*this.size/2;

        this.line3[0] = this.posx+ Math.cos(this.angle)*this.size/2;
        this.line3[1] = this.posy+ Math.sin(-this.angle)*this.size/2;
    }
    Draw()
    {
        stroke(255,230,0);
        strokeWeight(2);
    
        line(this.line1[0], this.line1[1], this.line1[2],this.line1[3]);
        line(this.line2[0], this.line2[1], this.line1[2],this.line1[3]);
        line(this.line3[0], this.line3[1], this.line1[2],this.line1[3]);
        if (this == selectedSensor)
        {
            fill(255,255,255);
            circle(this.posx, this.posy, this.size/2 + selectedParticleRingThickness);
        } else {
            fill(255,230,0);
        }
        circle(this.posx, this.posy, this.size/3);
        strokeWeight(1);
    }
    Delete()
    {
        this.text.remove();
    }
}




function screenToWorld(pixel_coordinate)
{
    return pixel_coordinate/gridSize;
}
function screenToWorldRound(pixel_coordinate)
{
    return Math.round(pixel_coordinate/gridSize);
}
function worldToScreen(world_coordinate)
{
    return gridSize*world_coordinate;
}


const P5GridSketch = p =>
{
    var canvas;
    p.setup = function() {
        canvas = p.createCanvas(width,height);
        canvas.parent('sketch-container-main');
    };
    p.Update = function() {
        p.clear();
        p.stroke(255,255,255, minorGridLineOpacity);
        for(var i=0; i<1000; i++) //Draw Vertical GridLines
        {
            if (gridSize*i > width+arrowSize) { break; }
            if (i%10==5) {
                p.stroke(255,255,255, majorGridLineOpacity);
                p.line(gridSize*i, 0, gridSize*i,height);
                p.stroke(255,255,255, minorGridLineOpacity);
            } else {
                p.line(gridSize*i, 0, gridSize*i,height);
            }
        }
        for(var i=0; i<1000; i++) //Draw Horizontal GridLines
        {
            if (gridSize*i > height+arrowSize) { break; }
            if (i%10==5) {
                p.stroke(255,255,255, majorGridLineOpacity);
                p.line(0, gridSize*i, width, gridSize*i);
                p.stroke(255,255,255, minorGridLineOpacity);
            } else {
                p.line(0, gridSize*i, width, gridSize*i);
            }
        }
    };
};

const P5ArrowSketch = p => {
    var canvas;
    var myWidth;
    var myHeight;
    p.setup = function()
    {
        myWidth = width;
        myHeight = height;
        canvas = p.createCanvas(width,height);
        canvas.parent('sketch-container-main');
    }
    p.Update = function()
    {
        if (width != myWidth || height != myHeight)
        {
            myWidth = width;
            myHeight = height;
            p.resizeCanvas(width,height);
        }
        p.clear();
        if (particles.length == 0) {return;}
        var x;
        var y;
        var P0 = [0,0];
        var P1 = [0,0];
        var P2 = [0,0];
        var P3 = [0,0];
        var out;
        var mag;
        var posVolt;
        var negVolt;
        var angle;
        for(var i=1; i<500; i+=2)
        {
            if (gridSize*i>width+arrowSize) { break; }
            for (var j=1; j<500; j+=2)
            {
                if (gridSize*j>height+arrowSize) { break; }
                x = gridSize*i;
                y = gridSize*j;
                
                out = Calc(x,y); //[mag, volt, angle, posVolt, negVolt];
                mag = out[0]
                angle = out[2];
                posVolt = out[3];
                negVolt = out[4];
                

                P0[0] = x-Math.sin(angle)*arrowSize;
                P0[1] = y-Math.cos(angle)*arrowSize;
                P1[0] = x+Math.sin(angle)*arrowSize;
                P1[1] = y+Math.cos(angle)*arrowSize;
                P2[0] = x-Math.cos(angle)*arrowSize/2;
                P2[1] = y-Math.sin(-angle)*arrowSize/2;
                P3[0] = x+Math.cos(angle)*arrowSize/2;
                P3[1] = y+Math.sin(-angle)*arrowSize/2;

                var tot= posVolt+negVolt;
                p.stroke(255*posVolt/tot, 50, 255*negVolt/tot, mag*arrowBrightnessMultiplier);
                p.line(P0[0], P0[1], P1[0],P1[1]);
                p.line(P2[0], P2[1], P1[0],P1[1]);
                p.line(P3[0], P3[1], P1[0],P1[1]);
            }
        }
    }
};

const P5ParticleSketch = p => {
    var canvas;
    var myWidth;
    var myHeight;
    p.setup = function() {
        canvas = p.createCanvas(width,height);
        canvas.parent('sketch-container-main');
    };
    p.Update = function() {
        if (width != myWidth || height != myHeight)
        {
            myWidth = width;
            myHeight = height;
            p.resizeCanvas(width,height);
        }
        p.clear();
        for (var i=0; i<particles.length; i++)
        {
            if (particles[i] == selectedParticle)
            {
                p.fill(200,200,200);
                p.circle(particles[i].posx, particles[i].posy, particles[i].size+selectedParticleRingThickness);
                p.fill(200,200,200);
            }
            if (particles[i].charge > 0)
            {
                p.fill(255,50,50);
            } else {
                p.fill(50,50,255);
            }
            
            p.circle(particles[i].posx, particles[i].posy, particles[i].size);
            
        }

    };
};

const P5EquipotentialSketch = p => {
    var canvas;
    var myWidth;
    var myHeight;
    p.setup = function() {
        canvas = p.createCanvas(width,height);
        canvas.parent('sketch-container-main');
    };
    p.Update = function() {
        canvas.clear();

        var particle = particles[0];
        if (particles.length < 1)
        {
            return;
        }

        var v;
        var wantedVolt = 10;
        var error = wantedVolt * 0.01;
        var x = null;
        var y = null;
        
        //p.fill(200,20,20);
        for(var i=0; i<width-5;i+=2)
        {
            for (var j=0; j<height-5; j+=2)
            {
                v = CalcLite(i,j);
                if (v > wantedVolt-error && v < wantedVolt + error)
                {
                    //p.circle(i,j,5);
                    
                    x = i;
                    y = j;
                    break;
                    
                    //j += 4;
                    //p.rect()
                }
            }
            if (x != null) {
                break;
            }
        }
        
        var sx = x;
        var sy = y;
        
        var i=0; //just to make sure we don't go around too many times
        var radius = 10; //how far do we jump each time?
        var nx = 0; //"NEW" x
        var ny = 0; //"New" y
        var s;
        var t;

        p.stroke(255,0,0);

        while(i < 500)
        {
            i += 1;
            s = CalcMedium(x,y);
            angle = s[1] + Math.PI/2;
            
            t = 0;
            while (CalcLite(x+ radius*Math.sin(angle),y+radius*Math.cos(angle)) < wantedVolt)
            {
                t += 1;
                angle += 0.01;
                if (t > 100)
                {
                    break;
                }
            }
            t=0;
            while (CalcLite(x+ radius*Math.sin(angle),y+radius*Math.cos(angle)) > wantedVolt)
            {
                t += 1;
                angle -= 0.01;
                if (t > 100)
                {
                    break;
                }
            }
            nx = x+radius*Math.sin(angle);
            ny = y+radius*Math.cos(angle);
            if (x < width && nx < width && x > 0 && nx > 0 && y < height && ny < height && y > 0 && ny > 0)
            {
                p.line(x,y, x+ radius*Math.sin(angle), y+radius*Math.cos(angle));
            }
            x = nx;
            y = ny;

            /*
            if (Math.abs(sx-x) < radius/4 && Math.abs(sy-y) < radius/4)
            {
                TEST.innerHTML = "BREAKING";
                break;
            }*/
        }

    };
};
/*
this.mag = output[0];
        this.volt = output[1];
        this.angle = output[2];
        this.posVolt = output[3];
        this.negVolt = output[4];

        this.line1[0] = this.posx- Math.sin(this.angle)*this.size;
        this.line1[1] = this.posy- Math.cos(this.angle)*this.size;
        this.line1[2] = this.posx+ Math.sin(this.angle)*this.size;
        this.line1[3] = this.posy+ Math.cos(this.angle)*this.size;

        this.line2[0] = this.posx- Math.cos(this.angle)*this.size/2;
        this.line2[1] = this.posy- Math.sin(-this.angle)*this.size/2;

        this.line3[0] = this.posx+ Math.cos(this.angle)*this.size/2;
        this.line3[1] = this.posy+ Math.sin(-this.angle)*this.size/2;
        */





        //Updating and drawing each arrow
        /*
        avgArrowBrightness = 0;
        if (particles.length != 0) {
            for(var i=0; i<arrows.length; i++) {
                avgArrowBrightness += Math.min(Math.abs(arrows[i].Update(particles)),255);
            }
            for(var i=0; i<arrows.length; i++)
            {
                arrows[i].Draw();
            }
            cursorArrow.Draw();
        }
                //Add all of the arrows
        var a;
        for (var i=1; i<100; i += 2) {
            if (gridSize*i > width+arrowSize)
            {
                break;
            }
            for (var j=1; j<100; j += 2) {
                a = new Arrow(arrowSize,gridSize*i,gridSize*j);
                arrows.push(a);
                if (gridSize*j > height+arrowSize)
                {
                    break;
                }
            }
        }
        */


            /*
    //Draw Grid
    stroke(255,255,255, minorGridLineOpacity);
    for(var i=0; i<100; i++) //Draw Vertical GridLines
    {
        if (gridSize*i > width+arrowSize) { break; }
        if (i%10==5) {
            stroke(255,255,255, majorGridLineOpacity);
            line(gridSize*i, 0, gridSize*i,height);
            stroke(255,255,255, minorGridLineOpacity);
        } else {
            line(gridSize*i, 0, gridSize*i,height);
        }
    }
    for(var i=0; i<100; i++) //Draw Horizontal GridLines
    {
        if (gridSize*i > height+arrowSize) { break; }
        if (i%10==5) {
            stroke(255,255,255, majorGridLineOpacity);
            line(0, gridSize*i, width, gridSize*i);
            stroke(255,255,255, minorGridLineOpacity);
        } else {
            line(0, gridSize*i, width, gridSize*i);
        }
    }
    */
        


        /*
    //Add all of the arrows
    var a;
    for (var i=1; i<100; i += 2) {
        if (gridSize*i > width+arrowSize)
        {
            break;
        }
        for (var j=1; j<100; j += 2) {
            a = new Arrow(arrowSize,gridSize*i,gridSize*j);
            arrows.push(a);
            if (gridSize*j > height+arrowSize)
            {
                break;
            }
        }
    }*/
