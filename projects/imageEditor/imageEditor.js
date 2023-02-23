


class GUIChannelPlot
{
    constructor(canvasElement)
    {
        this.canvasElement = canvasElement;
        let bb = canvasElement.getBoundingClientRect();
        this.canvasElement.width = bb.width;
        this.canvasElement.height = bb.height;
        this.ctx = canvasElement.getContext('2d');

        this.points = [{x:0,y:bb.height}, {x:bb.width/4, y:bb.height*3/4}, {x:bb.width/2, y:bb.height/2}, {x:bb.width*3/4, y:bb.height/4}, {x:bb.width, y:0}];
        this.circleRadius = 5;

        this.maxClickDist = 20;
        this.mouseIsDown = false;
        this.state = null;
        this.selectedPointIndex = 0;

        this.valueMap = [];
        this.render();
    }
    getValue(input = 0)
    {
        //return input * 2;
        return this.valueMap[ Math.max(0, Math.min(255, Math.round(input))) ];
    }
    getNearestPointIndex(point)
    {
        let nearestPointIndex = null;
        let bestDist = this.maxClickDist;
        for (let i in this.points)
        {
            let dist = Math.sqrt(Math.pow(this.points[i].x - point.x, 2) + Math.pow(this.points[i].y - point.y, 2));
            if (dist < bestDist)
            {
                bestDist = dist;
                nearestPointIndex = i;
            }
        }
        return nearestPointIndex;
    }
    render()
    {
        //clear canvas
        this.ctx.fillStyle = 'black'
        this.ctx.fillRect(0,0,this.canvasElement.width, this.canvasElement.height);

        //draw circles
        this.ctx.fillStyle = "rgb(100,100,120)";
        this.ctx.strokeStyle = "rgba(200,200,180)";
        for (let i in this.points)
        {
            const P = this.points[i];
            this.ctx.beginPath();
            this.ctx.arc( Math.round(P.x) , Math.round(P.y), this.circleRadius, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.closePath();
        }

        //draw line..............
        //First, connect the dots
        let lines = [];
        for (let i=0; i<this.points.length-1; i++)
        {
            lines.push({sp: {x:this.points[i].x, y:this.points[i].y}, ep: {x:this.points[i+1].x, y:this.points[i+1].y}});
        }
        
        //Find midpoints, divide, and average to create spline
        for (let r=0; r<4; r++)
        {
            let newLines = [];
            let pMidPoint2 = null;
            for (let i=0; i<lines.length; i++)
            {
                let midPoint1 = {x: (lines[i].sp.x*3 + lines[i].ep.x)/4, y: (lines[i].sp.y*3 + lines[i].ep.y)/4};
                let midPoint2 = {x: (lines[i].sp.x + lines[i].ep.x*3)/4, y: (lines[i].sp.y + lines[i].ep.y*3)/4};

                if (i == 0)
                {
                    newLines.push({sp:lines[i].sp, ep:midPoint1});
                }
                if (pMidPoint2 != null)
                {
                    newLines.push({sp:pMidPoint2, ep:midPoint1});
                }
                newLines.push({sp:midPoint1, ep:midPoint2});
                if (i == lines.length-1)
                {
                    newLines.push({sp:midPoint2, ep:lines[i].ep});
                }
                pMidPoint2 = midPoint2;
            }
            lines = newLines;
        }

        //render the line segments
        this.ctx.strokeStyle='green';
        for (let i in lines)
        {
            this.ctx.beginPath();
            this.ctx.moveTo(lines[i].sp.x, lines[i].sp.y);
            this.ctx.lineTo(lines[i].ep.x, lines[i].ep.y);
            this.ctx.stroke();
            this.ctx.closePath();
        }

        //Update value map, based on spline
        this.valueMap = [];
        for (let i=0; i<257; i++)
        {
            this.valueMap.push(0);
        }

        
        let width = this.canvasElement.width;
        let height = this.canvasElement.height;

        for (let l in lines)
        {
            const L = lines[l];
            const sx = (L.sp.x / width) * 255;
            const sy = ((height - L.sp.y) / height) * 255;
            const ex = (L.ep.x / width) * 255;
            const ey = ((height - L.ep.y) / height) * 255;

            //const slope = (ey-sy) / (ex-sx);
            const dist = Math.ceil(ex) - Math.floor(sx);
            for (let i=Math.floor(sx); i<=Math.ceil(ex); i++)
            {
                let temp = (i - sx) / dist;
                this.valueMap[i] = Math.round((1-temp)*sy + temp*ey);
            }
        }
        //console.log(this.valueMap);
    }
    eventListener(event = null)
    {
        //console.log(event, this);
        if (event == null) { return; }
        let curMousePos = {x:0,y:0};
        switch(event.type)
        {
            case "mousemove":
                curMousePos.x = event.offsetX; 
                curMousePos.y = event.offsetY; break;
            case "mousedown":
                curMousePos.x = event.offsetX; 
                curMousePos.y = event.offsetY; break;
            case "mouseup":
                curMousePos.x = event.offsetX; 
                curMousePos.y = event.offsetY; break;
            case "mouseout":
                curMousePos.x = event.offsetX; 
                curMousePos.y = event.offsetY; break;
            case "dblclick":
                curMousePos.x = event.offsetX; 
                curMousePos.y = event.offsetY; break;
        }    

        if (this.state == "draggingPoint")
        {
            //Dragging State
            if (this.selectedPointIndex > 0)
            {
                if (curMousePos.x < this.points[this.selectedPointIndex-1].x)
                {
                    curMousePos.x = this.points[this.selectedPointIndex-1].x;
                }
            }
            // if (this.selectedPointIndex < this.points.length-1)
            // {
            //     if (curMousePos.x > this.points[this.selectedPointIndex + 1].x)
            //     {
            //         curMousePos.x = Number(this.points[this.selectedPointIndex + 1].x);
            //     }
            // }
            this.points[this.selectedPointIndex] = curMousePos;
            if (event.type == "mouseup")// || event.type == "mouseout")
            {
                this.state = null;
            }
            this.render();
        } else {
            //Default State
            if (event.type == "mousedown")
            {
                let nearestCompIndex = this.getNearestPointIndex(curMousePos);
                if (nearestCompIndex != null)
                {
                    this.selectedPointIndex = nearestCompIndex;
                    this.state = "draggingPoint";
                }
            }
        }
    }
}




var canvasElement = document.getElementById("mainCanvas");
var ctx = canvasElement.getContext('2d');
ctx.willReadFrequently = true;
var fileInputElement = document.getElementById("fileInput");
var imageElement = document.getElementById("tempHiddenImg");

var rChannelCanvasElement = document.getElementById("rChannelCanvas");
var gChannelCanvasElement = document.getElementById("gChannelCanvas");
var bChannelCanvasElement = document.getElementById("bChannelCanvas");

var RFunctor = new GUIChannelPlot( rChannelCanvasElement );
var GFunctor = new GUIChannelPlot( gChannelCanvasElement );
var BFunctor = new GUIChannelPlot( bChannelCanvasElement );

//Add event listeners for each GUIChannelPlot obj
let eventNamess = ["mousemove", "mousedown", "mouseup", "mouseout", "dblclick"];
eventNamess.forEach( eventName => {
    rChannelCanvasElement.addEventListener(eventName, function(e){ RFunctor.eventListener(e); update(); });
    gChannelCanvasElement.addEventListener(eventName, function(e){ GFunctor.eventListener(e); update(); });
    bChannelCanvasElement.addEventListener(eventName, function(e){ BFunctor.eventListener(e); update(); });
});

function convolveRGBA(data = [], width = 16, height = 16, matrix = [], matrixWidth = 3)
{
    output = [];
    for (let x=0; x<height; x++)
    {
        for (let y=0; y<width; y++)
        {
            let val = [0,0,0];
            for (let x2=0; x2<matrixWidth; x2++)
            {
                for (let y2=0; y2<matrixWidth; y2++)
                {
                    let tx = x+x2;
                    let ty = y+y2;
                    if (tx < width && ty < height)
                    {
                        val[0] += data[4*(tx*width + ty) ] * matrix[x2*matrixWidth+y2];
                        val[1] += data[4*(tx*width + ty)+1] * matrix[x2*matrixWidth+y2];
                        val[2] += data[4*(tx*width + ty)+2] * matrix[x2*matrixWidth+y2];
                    }
                }
            }
            output.push(val[0], val[1], val[2], 255);
        }
    }
    for (let i in output)
    {
        output[i] = Math.max(0, Math.min(255, output[i]));
    }
    return output;
}
function convolve(data = [], width = 16, height = 16, matrix = [], matrixWidth = 3, clampOutputValuesToRange = false)
{
    let output = [];
    const matWidthDiv2 = Math.ceil(matrixWidth/2);
    let val=0;
    let tx=0;
    let ty=0;
    for (let x=0; x<height; x++)
    {
        for (let y=0; y<width; y++)
        {
            val = 0;
            for (let x2=0; x2<matrixWidth; x2++)
            {
                for (let y2=0; y2<matrixWidth; y2++)
                {
                    tx = x+x2 - matWidthDiv2;
                    ty = y+y2 - matWidthDiv2;
                    if (tx >= 0 && ty >= 0 && tx < width && ty < height)
                    {
                        val += data[tx*width + ty] * matrix[x2*matrixWidth+y2];
                    }
                }
            }
            output.push(val);
        }
    }
    if (clampOutputValuesToRange)
    {
        for (let i in output)
        {
            output[i] = Math.max(0, Math.min(255, output[i]));
        }
    }
    return output;
}
function averageImages(images = [])
{
    let newImg = [];
    for (let i in images[0])
    {
        let val = 0;
        for (let j in images)
        {
            val += images[j][i];
        }
        newImg.push(val / images.length)
    }
    return newImg;
}
function insertBWImageInImageData(imageData = [], bwImage = [])
{
    for (let i=0; i<imageData.length; i+=4)
    {
        let i2 = Math.floor(i/4);
        imageData[i+3] = 255; 
        imageData[i  ] = bwImage[i2];
        imageData[i+1] = bwImage[i2];
        imageData[i+2] = bwImage[i2];
    }
}
function insertRGBAImageInImageData(imageData = [], image = [])
{
    for (let i=0; i<imageData.length; i+=4)
    {
        imageData[i+3] = 255; 
        imageData[i  ] = image[i  ];
        imageData[i+1] = image[i+1];
        imageData[i+2] = image[i+2];
    }
}
function medianConvolveBW(imageData=[], width=16, height=16, medianWidth=4)
{
    const w = Math.round(medianWidth/2);

    let newImg = [];
    for (let x=0; x<height; x++)
    {
        for (let y=0; y<width; y++)
        {
            let vals = [];
            for (let x2=-w; x2<w+1; x2++)
            {
                for (let y2=-w; y2<w+1; y2++)
                {
                    let tx = x+x2;
                    let ty = y+y2;
                    if (tx >= 0 && ty >= 0 && tx < width && ty < height)
                    {
                        vals.push(imageData[tx*width+ty]);
                    }
                }
            }
            vals.sort();
            newImg.push(vals[Math.round(vals.length/2)]);
        }
    }
    return newImg;
}
function medianConvolveRGBA(imageData=[], width=16, height=16, radius=4)
{
    //const w = Math.round(medianWidth/2);

    let newImg = [];
    for (let x=0; x<height; x++)
    {
        for (let y=0; y<width; y++)
        {
            let vals = [[],[],[]];
            for (let x2=-radius; x2<radius; x2++)
            {
                for (let y2=-radius; y2<radius; y2++)
                {
                    let tx = x+x2;
                    let ty = y+y2;
                    if (tx >= 0 && ty >= 0 && tx < width && ty < height)
                    {
                        vals[0].push(imageData[(tx*width+ty)*4    ]);
                        vals[1].push(imageData[(tx*width+ty)*4 + 1]);
                        vals[2].push(imageData[(tx*width+ty)*4 + 2]);
                    }
                }
            }
            vals[0].sort();
            vals[1].sort();
            vals[2].sort();
            let middle = Math.round(vals.length/2)
            newImg.push(vals[0][middle], vals[1][middle], vals[2][middle], 255);
        }
    }
    return newImg;
}
function convertRGBAToBW(rgbData)
{
    let newImg = [];
    let temp = 0;
    for (let i=0; i<rgbData.length; i+=4)
    {
        temp=rgbData[i] + rgbData[i+1] + rgbData[i+2];
        newImg.push(Math.min(255, Math.max(0, temp/3)));
    }
    return newImg;
}
function convertBWToRGBA(bwData)
{
    let newImg = [];
    for (let i in bwData)
    {
        newImg.push(bwData[i], bwData[i], bwData[i], 255);
    }
    return newImg;
}



setup();
function setup()
{
    //Resze canvas to fix pixels
    // const bb = canvasElement.getBoundingClientRect();
    // canvasElement.width = Math.round(bb.width);
    // canvasElement.height = Math.round(bb.height);

    //clear canvas
    // ctx.fillStyle = 'black';
    // ctx.fillRect(0,0,canvasElement.width, canvasElement.height);

    update();
}

function loadImgUserSelect()
{
    imageElement.addEventListener("load", function(e){
        update();
    });
    imageElement.src = URL.createObjectURL( fileInputElement.files[0] );
    imageElement.style.display = "None";
}
function update()
{
    //Update size of canvas, and render initial view
    if (imageElement == null) { return; }
    canvasElement.width = imageElement.width;
    canvasElement.height = imageElement.height;
    const bb = canvasElement.getBoundingClientRect();
    const imageAspectRatio = imageElement.height/imageElement.width;
    canvasElement.style.height = Math.round(bb.width * imageAspectRatio) + "px";

    if (canvasElement.width == 0 || canvasElement.height == 0) { return; }

    //Draw original image
    ctx.drawImage(imageElement, 0, 0);

    //get image
    const image = ctx.getImageData(0,0,canvasElement.width, canvasElement.height);
    let imageData = image.data;
    let bwImageData = []; 
    for (let i=0; i<imageData.length; i+=4)
    {
        imageData[i  ] = RFunctor.getValue(imageData[i  ]);
        imageData[i+1] = GFunctor.getValue(imageData[i+1]);
        imageData[i+2] = BFunctor.getValue(imageData[i+2]);
        bwImageData.push((imageData[i  ] + imageData[i+1] + imageData[i+2])/3);
    }

    const gaussian5x5Filter = [1/256,4/256,6/256,4/256,1/256,  4/256,16/256,24/256,16/256,4/256,  6/256,24/256,36/256,24/256,6/256,  4/256,16/256,24/256,16/256,4/256, 1/256,4/256,6/256,4/256,1/256]
    const horizFilter = [1,1,1, 0,0,0, -1,-1,-1];
    const vertFilter = [1,0,-1, 1,0,-1, 1,0,-1];
    const horizFilter2 = [-1,-1,-1, 0,0,0, 1,1,1];
    const vertFilter2 = [-1,0,1, -1,0,1, -1,0,1];
    const diagFilter1 = [1,0,-1,0,0,0, 1,0,-1,0,0,0, 1,0,-1,0,0,0, 1,0,-1,0,0,0, 1,0,-1,0,0,0, 1,0,-1,0,0,0];
    const diagFilter2 = [1,1,1,1,1,1,  0,0,0,0,0,0, -1,-1,-1,-1,-1,-1, 0,0,0,0,0,0, 0,0,0,0,0,0, 0,0,0,0,0,0,];


    // bwImageData = convolve(bwImageData, image.width, image.height, gaussian5x5Filter, 5);
    // bwImageData = convolve(bwImageData, image.width, image.height, gaussian5x5Filter, 5);
    // const bwHorizFilterImage = convolve(bwImageData, image.width, image.height, horizFilter, 3, true);
    // const bwVertFilterImage  = convolve(bwImageData, image.width, image.height, vertFilter, 3, true);
    // const bwHorizFilterImage2 = convolve(bwImageData, image.width, image.height, horizFilter2, 3, true);
    // const bwVertFilterImage2  = convolve(bwImageData, image.width, image.height, vertFilter2, 3, true);
    // const bwCombinedFilterImage = averageImages([bwHorizFilterImage, bwVertFilterImage, bwHorizFilterImage2, bwVertFilterImage2]);

    let newImg = convolveRGBA(imageData, image.width, image.height, gaussian5x5Filter, 5, true);
    const bwHorizFilterImage = convolveRGBA(newImg, image.width, image.height, horizFilter, 3, true);
    const bwVertFilterImage  = convolveRGBA(newImg, image.width, image.height, vertFilter, 3, true);
    const bwHorizFilterImage2 = convolveRGBA(newImg, image.width, image.height, horizFilter2, 3, true);
    const bwVertFilterImage2  = convolveRGBA(newImg, image.width, image.height, vertFilter2, 3, true);
    let bwCombinedFilterImage = averageImages([bwHorizFilterImage, bwVertFilterImage, bwHorizFilterImage2, bwVertFilterImage2]);
    bwCombinedFilterImage = convertRGBAToBW(bwCombinedFilterImage);

    //insertBWImageInImageData(imageData, bwCombinedFilterImage);


    console.log("done with convolution");

    for (let run=0; run<1; run++)
    {
        let newImg = [];
        for (let x=0; x<image.height; x++)
        {
            for (let y=0; y<image.width; y++)
            {
                let vals = [[],[],[]];
                let LOW = -5;
                let HIGH = 6;
                let edgePercent = bwCombinedFilterImage[x*image.width + y]/255;
                LOW  += Math.round(edgePercent*20);
                HIGH -= Math.round(edgePercent*20);
                LOW = Math.min(0,LOW);
                HIGH = Math.max(1,HIGH);
                for (let x2=LOW; x2<HIGH; x2++)
                {
                    for (let y2=LOW; y2<HIGH; y2++)
                    {
                        let tx = x2+x;
                        let ty = y2+y;
                        if (tx >= 0 && ty >= 0 && tx < image.width && ty < image.height)
                        {
                            let i = 4*(tx*image.width + ty);
                            vals[0].push(imageData[i  ]);  
                            vals[1].push(imageData[i+1]);
                            vals[2].push(imageData[i+2]);                             
                        }
                    }
                }

                // 
                // if (vals[0].length < 1) { continue; }
                // vals[0].sort();
                // vals[1].sort();
                // vals[2].sort();
                // let index = Math.floor(vals[0].length/2);
                // newImg.push(vals[0][index], vals[1][index], vals[2][index], 255);

                const len = vals[0].length;
                for (let i=1; i<len; i++)
                {
                    vals[0][0] += vals[0][i];
                    vals[1][0] += vals[1][i];
                    vals[2][0] += vals[2][i];
                }
                newImg.push(vals[0][0]/len, vals[1][0]/len, vals[2][0]/len, 255);

            }
        }

        for (let i in imageData)
        {
            imageData[i] = newImg[i];
        }
    }

    //image.data = 

    //let newImg = convolve4Stride(imageData, image.width, image.height, gaussian5x5Filter, 5);
    //let newImg = medianConvolve(imageData, image.width, image.height, 1);
    //let newImg = convolve4Stride(imageData, image.width, image.height, horizFilter, 3);
    //insertImageInImageData(imageData, newImg);
    
    //let newImg = medianConvolve(imageData, image.width, image.height, 1);
    // newImg = convolve4Stride(newImg, image.width, image.height, gaussian5x5Filter, 5);
    // newImg = medianConvolve(newImg, image.width, image.height, 1);
    // newImg = convolve4Stride(newImg, image.width, image.height, gaussian5x5Filter, 5);
    // newImg = convolve4Stride(newImg, image.width, image.height, gaussian5x5Filter, 5);
    // newImg = convolve4Stride(newImg, image.width, image.height, gaussian5x5Filter, 5);
    // newImg = convolve4Stride(newImg, image.width, image.height, gaussian5x5Filter, 5);
    // insertImageInImageData(imageData, newImg);

    ctx.putImageData(image, 0, 0);

    RFunctor.render();
    GFunctor.render();
    BFunctor.render();
}