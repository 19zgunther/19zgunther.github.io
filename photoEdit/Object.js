


class Object {
    constructor(image = new Image(), canvasParent = HTMLElement)
    {
        this.image = image;

        this.oldImages = [];
        
        this.canvas = document.createElement('canvas');
        this.canvas.setAttribute("class", "objectCanvas");

        this.canvas.width = image.width;
        this.canvas.height = image.height;
        this.context = this.canvas.getContext('2d');
        this.context.drawImage(this.image,0,0, this.canvas.width, this.canvas.height);
        

        //How we're going to store the data...
        this.fullSizeCanvas = document.createElement('canvas');
        this.fullSizeCanvas.width = image.width;
        this.fullSizeCanvas.height = image.height;
        this.fullSizeContext = this.fullSizeCanvas.getContext('2d');
        this.fullSizeContext.drawImage(this.image, 0,0, this.image.width, this.image.height);

        this.overlayCanvas = document.createElement('canvas');
        this.overlayCanvas.setAttribute('class', 'overlayCanvas');
        this.overlayCanvas.width = image.width + 20;
        this.overlayCanvas.height = image.height + 20;
        this.overlayPainter = new Painter(this.overlayCanvas);

        this.parentElement = document.createElement("div");
        this.parentElement.setAttribute("class", "parentElement")
        canvasParent.appendChild(this.parentElement);
        this.parentElement.appendChild(this.canvas);
        this.parentElement.appendChild(this.overlayCanvas);
        //this.canvasParent.appendChild(this.canvas);
        //this.canvas.appendChild(this.overlayCanvas);

    
        //let imgData = this.canvas.toDataURL("image/jpeg",0.75);

        //Crop is in pixels
        this.cropLeft = 0;
        this.cropRight = 0;
        this.cropTop = 0;
        this.cropBottom = 0;

        


        for (var x=0; x<this.canvas.width; x+=5)
        {
            for (var y=0; y<this.canvas.height; y+=5)
            {
                var d = getPixelData(this.context, x,y, 5, 5);
                var a = 0;
                for (var i=0; i<100; i+=4)
                {
                    a += d[i];
                    a += d[i+1];
                    a += d[i+2];
                }
                a = a/(d.length*3/4);

                a = Math.round(a/20)*20;


                for (var i=0; i<100; i+=4)
                {
                    d[i] = a;
                    d[i+1] = a;
                    d[i+2] = a;
                    d[i+3] = 255;
                }
                
                //console.log(d);
                setImageData(this.context, x,y, 5, 5, d);
            }
        }




        this.refreshOverlay();
    }

    getCanvas()
    {
        return this.canvas;
    }
    getContext()
    {
        return this.context;
    }
    getBoundingClientRect()
    {
        return this.canvas.getBoundingClientRect();
    }
    getWidth()
    {
        return this.canvas.width;
    }
    getHeight()
    {
        return this.canvas.width;
    }
    getAspectRatio()
    {
        var r = this.canvas.getBoundingClientRect();
        return r.width/r.height;
    }



    refreshOverlay(selectedObject)
    {
        var border = 10;
        var rect = this.canvas.getBoundingClientRect();
        this.overlayCanvas.style.left = (rect.left - border) + "px";
        this.overlayCanvas.style.top = (rect.top- border) + "px";
        this.overlayCanvas.width = this.canvas.width + border*2;
        this.overlayCanvas.height = this.canvas.height + border*2;

        const p = new Painter(this.overlayCanvas);
        p.Clear();

        if (this != selectedObject)
        {
            return;
        }
        
        p.SetStrokeWidth(1);
        var rs = 10 //RectSize;
        var color = 'black';

        p.DrawRectFilled( 0, 0, rs, rs, color);                                                             //Top Left
        p.DrawRectFilled( this.overlayCanvas.width - rs, 0, rs, rs, color);                                 //Top Right
        p.DrawRectFilled( 0, this.overlayCanvas.height - rs, rs, rs, color);                                //Bottom left
        p.DrawRectFilled( this.overlayCanvas.width - rs, this.overlayCanvas.height - rs, rs, rs, color);    //Bottom right

        p.DrawRectFilled( (this.overlayCanvas.width -rs)/2, 0, rs, rs, color);                                  //top middle
        p.DrawRectFilled( (this.overlayCanvas.width -rs)/2, this.overlayCanvas.height - rs, rs, rs, color);     //bottom middle
        p.DrawRectFilled( 0, (this.overlayCanvas.height -rs)/2, rs, rs, color);                                 //left middle
        p.DrawRectFilled( this.overlayCanvas.width - rs, (this.overlayCanvas.height -rs)/2, rs, rs, color);     //right middle    
    }



    setPosition(x,y)
    {
        this.canvas.style.left = x;
        this.canvas.style.top = y;
    }

    _movePosition(dx, dy)
    {
        this.canvas.style.left += x;
        this.canvas.style.right += y;
    }


    setWidth(width = 100)
    {
        this.canvas.width = width;
        //this.context.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
    }
    setHeight(height = 100)
    {
        this.canvas.height = height;
        //this.context.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
    }
    setAspectRatio(ratio = 1)
    {
        //ratio = w/h   -->   h = w/ratio
        this._setSize(Math.round(this.canvas.width), Math.round(this.canvas.width/ratio));
    }

    crop(cropLeft = 0, cropRight = 0, cropTop = 0, cropBottom = 0)
    {
        this.cropLeft += cropLeft;
        this.cropRight += cropRight;
        this.cropTop += cropTop;
        this.cropBottom += cropBottom;
        this._setSize(this.getWidth(), this.getHeight());
        this._movePosition(cropLeft, cropTop);
    }

    _setSize(w=300,h=300)
    {
        //Save canvas to image
        var myImage = new Image();
        myImage.src = this.fullSizeCanvas.toDataURL();
        this.oldImages.push(this.image);
        this.image = myImage;
        var canv = this.canvas;
        var cont = this.context;

        var cl = this.cropLeft;
        var cr = this.cropRight;
        var ct = this.cropTop;
        var cb = this.cropBottom;

        const obj = this;


        //Once the image loads, paint it back to the new canvas width;
        myImage.onload = function (ev) {
            obj.canvas.width = w - obj.cropLeft - obj.cropRight;
            obj.canvas.height = h - obj.cropTop - obj.cropBottom;
            //cont.drawImage(myImage, -this.cropLeft, -this.cropTop, canv.width+this.cropRight, canv.height+this.cropBotton);
            cont.drawImage(myImage, -obj.cropLeft,-obj.cropTop, w, h);
        };

        /*var imageData = this.context.getImageData(0,0,this.canvas.width, this.canvas.height);
        this.canvas.width = w;
        this.canvas.height = h;
        
        this.context.putImageData(imageData, 0, 0, 0, 0, this.canvas.width, this.canvas.height);*/
    }

    _drawImage(image = Image)
    {
        this.context.drawImage(image, 0, 0, this.canvas.width, this.canvas.height);
    }
}

/*
var p=context.createImageData(width,height);
    console.log(data.length);
    for (var i=0; i<data.length; i++)
    {
        p.data[i] = data[i];
    }
    //p.data = data;
    context.putImageData(p,x,y);
*/