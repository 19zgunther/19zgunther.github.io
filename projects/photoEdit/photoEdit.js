const imgInput = document.getElementById('imageInput');
const ParentCanvasElement = document.getElementById('ParentCanvasElement')
//var canvas = document.getElementById("canvas");
//var context = canvas.getContext('2d');

var objects = [];
var selectedObject = null;
var vectorToSelectedObject = new Point();

var action = null; //"moving"

var t = 0;
var u = setInterval(UpdateOverlayCanvases, 200);

document.addEventListener('mousedown', mouseDown);
document.addEventListener('mousemove', mouseMove);
document.addEventListener('mouseup', mouseUp);




imgInput.addEventListener('change', function(e) {
    if(e.target.files) {
      let imageFile = e.target.files[0]; //here we get the image file
      var reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onloadend = function (e) {
        var myImage = new Image(); // Creates image object
        myImage.src = e.target.result; // Assigns converted image to image object
        myImage.onload = function(ev) {
          var x = new Object(myImage, ParentCanvasElement);
          objects.push(x);
        }
      }
    }
  });

function setPixelData(context, x, y, r,g,b,a)
{
    var p=context.createImageData(1,1);
    p.data[0]=r;
    p.data[1]=g;
    p.data[2]=b;
    p.data[3]=a;
    context.putImageData(p,x,y);
}

function setImageData(context, x,y, width, height, data)
{
    var p=context.createImageData(width,height);
    console.log(data.length);
    for (var i=0; i<data.length; i++)
    {
        p.data[i] = data[i];
    }
    //p.data = data;
    context.putImageData(p,x,y);
}

function getPixelData(context, x, y, width = 1, height = 1)
{
    return context.getImageData(x, y, width, height).data;
}


function mouseDown(event) {
    console.log(event);
    var mPos = new Point();

    var rect = ParentCanvasElement.getBoundingClientRect();
    mPos.x = event.clientX - rect.left;
    mPos.y = event.clientY - rect.top;
    if (mPos.x >=0 && mPos.x <= rect.width && mPos.y >= 0 && mPos.y < rect.height)
    {   
        //If the mouse click was within the parent canvas...

        //selectedObject = null;
        action = "";
    } else {

    }

    for (var i=0; i<objects.length; i++)
    {
        var rect = objects[i].getBoundingClientRect();
        console.log(rect);
        mPos.x = event.clientX - rect.left;
        mPos.y = event.clientY - rect.top;

        if (mPos.x >=0 && mPos.x <= rect.width && mPos.y >= 0 && mPos.y < rect.height)
        { //If within objects[i]'s boarders...
            selectedObject = objects[i];
            vectorToSelectedObject.x = event.clientX - rect.left;
            vectorToSelectedObject.y = event.clientY - rect.top;
            console.log(vectorToSelectedObject.toString());
            break;
        }
    }
    console.log("Mouse Down - SelectedCanvas: " + selectedObject);
    if (selectedObject == null) {return;}



    action = "moving";


   var newColor = [255,0,0,255];
   var d = replaceColorAroundPos(selectedObject.getCanvas(), newColor, mPos.x, mPos.y, 100)
   setImageData(selectedObject.getContext('2d'), 0,0,selectedObject.getWidth(),selectedObject.getHeight(),d);
}

function mouseMove(event) {
    UpdateOverlayCanvases();
    var mPos = new Point();

    var rect = ParentCanvasElement.getBoundingClientRect();
    mPos.x = event.clientX - rect.left;
    mPos.y = event.clientY - rect.top;
    if (mPos.x >=0 && mPos.x <= rect.width && mPos.y >= 0 && mPos.y < rect.height)
    {
        //selectedObject = null;
        //action = "";
        
    } else {
        return;
    }

    if (selectedObject != null && action == "moving")
    {
        var x = event.clientX - vectorToSelectedObject.x;
        var y = event.clientY - vectorToSelectedObject.y - document.getElementById("Header").getBoundingClientRect().height;
        selectedObject.setPosition(x,y);
    }
}

function mouseUp(event) {
    console.log("mouse up");
    action = "";
}


//Takes canvas, new color, x & y coords, and a maxColorDif number 
//returns modified image data.
function replaceColorAroundPos(canvas, newColor, x, y, maxDif = 10)
{
    const width = Math.round(canvas.width);
    const height = Math.round(canvas.height);
    const context = canvas.getContext('2d');

    x = Math.round(x);
    y = Math.round(y);

    var data = getPixelData(context,0,0,width,height);
    const color = getPixelData(context, x, y);
    

    pixelsToRemove = [x,y];
    itr = 0;

    var spotsChecked = new Set();


    for (var k = 0; k<5000001; k++) 
    {
        if (itr >= pixelsToRemove.length)
        {
            break;
        }
        x = pixelsToRemove[itr];
        y = pixelsToRemove[itr+1];
        itr += 2;

        var l = y*width*4 + x*4;
        spotsChecked.add(l);

        data[l+0] = newColor[0];
        data[l+1] = newColor[1];
        data[l+2] = newColor[2];
        data[l+3] = newColor[3];

        l -= 4;
        if (!spotsChecked.has(l)) {
            spotsChecked.add(l);
            if (x-1 >= 0 && isSameColor( color, [ data[l+0], data[l+1], data[l+2], data[l+3] ]   ,  maxDif   ))
            {
                pixelsToRemove.push(x-1);
                pixelsToRemove.push(y);
            }
        }

        l += 8;
        if (!spotsChecked.has(l)) {
            spotsChecked.add(l);
            if (x+1 < width && isSameColor( color, [ data[l+0], data[l+1], data[l+2], data[l+3] ]   ,  maxDif   ))
            {
                pixelsToRemove.push(x+1);
                pixelsToRemove.push(y);
            }
        }

        l -= 4;
        l -= width*4;
        if (!spotsChecked.has(l)) {
            spotsChecked.add(l);
            if (y-1 >= 0 && isSameColor( color, [ data[l+0], data[l+1], data[l+2], data[l+3] ]   ,  maxDif   ))
            {
                pixelsToRemove.push(x);
                pixelsToRemove.push(y-1);
            }
        }

        l += 2*width*4;
        if (!spotsChecked.has(l)) {
            spotsChecked.add(l);
            if (y+1 < height && isSameColor( color, [ data[l+0], data[l+1], data[l+2], data[l+3] ]   ,  10   ))
            {
                pixelsToRemove.push(x);
                pixelsToRemove.push(y+1);
            }
        }
    }
    return data;
}

function isSameColor(baseColor, otherColor, maxDif)
{
    if ( baseColor[0]-maxDif < otherColor[0] && baseColor[0]+maxDif > otherColor[0] &&
        baseColor[1]-maxDif < otherColor[1] && baseColor[1]+maxDif > otherColor[1] &&
        baseColor[2]-maxDif < otherColor[2] && baseColor[2]+maxDif > otherColor[2] )
    {
        return true;
    }
    return false;
}


function UpdateOverlayCanvases()
{
    /*
    var width = canvas.width;
    var height = canvas.height;
    setPixelData(context, t, t, 255, 0, 0, 0);

   
    t += 1;
    */

    for (var i=0; i<objects.length; i++)
    {
        objects[i].refreshOverlay(selectedObject);
    }


}


function setAspectRatio(ratio)
{
    if (selectedObject != null)
    {
        selectedObject.setAspectRatio(ratio);
    }
}


function revertImage(ratio)
{
    if (selectedObject != null)
    {
        selectedObject.setAspectRatio(ratio);
    }
}