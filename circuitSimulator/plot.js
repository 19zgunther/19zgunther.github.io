
const PlotYAxisIntervals = [1000,500,100,50,25,20,15,10,8,5,4,3,2,1,0.5,0.25,0.2,0.1,0.05,0.025,0.02,0.01,0.005,0.0025,0.002,0.001,0.0005,0.00025,0.0002,0.0001];

class Plot {
    constructor(comp){
        this.component = comp;
        //this.voltageScale = 5;
        //this.currentScale = 5;
        //this.timeScale = 1;
        this.autoYScaleEnable = false;
        this.voltageYAxisGridScaleIndex = 13; //index of PlotYAxisIntervals[13] = 1
        this.currentYAxisGridScaleIndex = 13; 

        this.numGridLines = 5; //must be an odd number...?
    }
    Draw(pos = null, width = null, height = null)
    {
        
        /*
        if (pos == null)
        {
            //DrawPlot(this.component, new Point(0,0), this.voltageScale, this.currentScale, 200, 200, this.autoScale, this.timeScale);
            DrawPlot(this, pos, width, height, PlotYAxisIntervals[this.yAxisGridScaleIndex], this.timeScale, this.autoYScaleEnable);
        }
        //DrawPlot(this.component, pos, this.voltageScale, this.currentScale, height, width, this.autoScale, this.timeScale);
        DrawPlot(this, pos, width, height, PlotYAxisIntervals[this.yAxisGridScaleIndex], this.timeScale);
        */

        strokeWeight(1);
        stroke(200);
        textSize(10);

        //drawing the outside box
        line(pos.x, pos.y, pos.x+width, pos.y);
        line(pos.x, pos.y, pos.x, pos.y+height);
        line(pos.x+width, pos.y+height, pos.x+width, pos.y);
        line(pos.x+width, pos.y+height, pos.x, pos.y+height);


        var lineStep = height/(this.numGridLines+1); //num pixels per vertical division
        var curY = pos.y +lineStep;
        
        //drawing the horizontal lines and vertical axis grid text
        stroke(100);
        for (var i=0; i<this.numGridLines; i++)
        {
            stroke(100);
            line(pos.x+70, curY, pos.x+width, curY);
            stroke(0,0,0);
            fill(0,200,0);
            text(Number(((this.numGridLines-1)/2-i)*PlotYAxisIntervals[this.voltageYAxisGridScaleIndex]).toPrecision(4), pos.x, curY+5);
            stroke(0,0,0);
            fill(200,200,0);
            text(Number(((this.numGridLines-1)/2-i)*PlotYAxisIntervals[this.currentYAxisGridScaleIndex]).toPrecision(4), pos.x+40, curY+5);
            curY += lineStep;
        }

        var data = this.component.voltageData
        stroke(255)
        var plotStartPoint = new Point(  pos.x + width , pos.y + height/2  ) //vertically middle, horizontally rightmost
        //line(plotStartPoint.x, plotStartPoint.y, plotStartPoint.x +-10, plotStartPoint.y)

        var voltageScaler = lineStep / PlotYAxisIntervals[this.voltageYAxisGridScaleIndex];
        //var timeScaler = 
        var p1 = new Point();
        var p2 = new Point();
        

        stroke(0,255,0);
        var scaleTooSmall = true;
        for (var i=1; i<min(data.length, width); i++ )
        {
            p1.x = pos.x + width - i - 1;
            p1.y =  pos.y + height/2 - voltageScaler * data[data.length - i];
            p2.x = pos.x + width - i;
            p2.y =  pos.y + height/2 - voltageScaler * data[data.length - i - 1];

            line(p1.x, p1.y, p2.x, p2.y);

            //check if the plot goes outside of the box
            if (p1.y < pos.y || p1.y > p1.y + height || p2.y < pos.y || p2.y > pos.y + height)
            {
                this.IncreaseVoltageYScale();
                return;
            } 
            
            //check if the plot is too small (needs to be streched vertically)
            if (scaleTooSmall == true && (p1.y < pos.y + height*3/8 || p1.y > p1.y + height*5/8 || p2.y < pos.y + height*3/8 || p2.y > pos.y + height*5/8))
            {
                scaleTooSmall = false;
            } 
        }
        if (scaleTooSmall)
        {
            this.DecreaseVoltageYScale();
        }

    }

    SetComponent(newComponentToPlot = null)
    {
        if (newComponentToPlot != null)
        {
            this.component = newComponentToPlot;
        }
    }
    SetAutoScale(shouldScaleAutomatically = true)
    {
        this.autoScale = shouldScaleAutomatically;
    }

    IncreaseVoltageYScale() 
    {
        this.voltageYAxisGridScaleIndex -= 1;
        this.voltageYAxisGridScaleIndex = max(this.voltageYAxisGridScaleIndex, 0);
    }

    DecreaseVoltageYScale()
    {
        this.voltageYAxisGridScaleIndex += 1;
        this.voltageYAxisGridScaleIndex = min(this.voltageYAxisGridScaleIndex, PlotYAxisIntervals.length-1);
    }

    GetAutoScale()
    {
        return this.autoScale;
    }
    GetComponent()
    {
        return this.component;
    }
}


class PlotManager {
    constructor(screenWidth, screenHeight) {
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.plotHeight = Math.max(100, screenHeight/4);
        this.plots = [];
        this.gapBetweenPlots = 10;
    }

    AddPlot(plot = null)
    {
        if (plot != null)
        {
            this.plots.push(plot);
        }
    }

    AddPlotOfComponent(component = null)
    {
        if (component != null)
        {
            this.plots.push(new Plot(component));
        }
    }

    RemovePlotOfComponent(component_of_plot = null)
    {
        var tempList = [];
        for (var i=0; i<this.plots.length; i++)
        {
            if (this.plots[i].component.name == component_of_plot.name)
            {

            } else {
                tempList.push(this.plots[i]);
            }
        }
        this.plots = tempList;
    }

    RemovePlot(plot = null)
    {
        var tempList = [];
        for (var i=0; i<this.plots.length; i++)
        {
            if (this.plots[i] == plot)
            {

            } else {
                tempList.push(this.plots[i]);
            }
        }
        this.plots = tempList;
    }

    Draw()
    {
        var plotWidth = ( this.screenWidth - this.gapBetweenPlots*(this.plots.length-1) ) / this.plots.length;
        var xPos = 0;
        var yPos = this.screenHeight - this.plotHeight;
        for(var i=0; i<this.plots.length; i++)
        {
            if (components.includes(this.plots[i].GetComponent()) == false)
            {
                console.log("HERE");
                this.RemovePlot(this.plots[i]);
                return;
            }

            this.plots[i].Draw(new Point(xPos, yPos), plotWidth, this.plotHeight);
            xPos += plotWidth;
            xPos += this.gapBetweenPlots;
        }
    }

    GetPlots()
    {
        return this.plots;
    }
}









class Slider {
    constructor(pos, width, thickness) {
        this.width = width;
        this.thickness = thickness;
        this.pos = pos;
        this.val = 0.5;
    }
    Draw() {
        DrawSlider(pos, width, thickness, val);
    }
}











