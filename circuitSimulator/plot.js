
class Plot {
    constructor(comp){
        this.component = comp;
        this.voltageScale = 5;
        this.currentScale = 5;
        this.autoScale = true;
    }
    Draw(pos, height, width)
    {
        if (pos == null)
        {
            DrawPlot(this.component, new Point(0,0), this.voltageScale, this.currentScale, 200, 200, this.autoScale);
        }
        DrawPlot(this.component, pos, this.voltageScale, this.currentScale, height, width, this.autoScale);
    }
}


class PlotManager {
    constructor(screenWidth, screenHeight) {
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.plotHeight = Math.max(100, screenHeight/4);
        this.plots = [];
    }
    addPlot(plot)
    {
        this.plots.push(plot);
    }

    Draw()
    {
        var plotWidth = (this.screenWidth-20)/this.plots.length;
        for(var i=0; i<this.plots.length; i++)
        {
            this.plots[i].Draw(new Point(5+i*plotWidth, this.screenHeight-this.plotHeight/2), this.plotHeight, plotWidth);
        }
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











