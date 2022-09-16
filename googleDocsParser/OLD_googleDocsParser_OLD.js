





class Element
{
    constructor(ctx, string, exponent = "", subsript = "")
    {
        this.ctx = ctx;
        this.string = string;
        this.measure = this.ctx.measureText(this.string);
        this.width = this.measure.width;
        this.height = this.measure.fontBoundingBoxAscent + this.measure.fontBoundingBoxDescent;
        
        this.exponent = exponent;
        this.exponentMeasure = this.ctx.measureText(this.exponent);
        this.exponentWidth = this.exponentMeasure.width;
        this.exponentHeight = this.exponentMeasure.fontBoundingBoxAscent + this.exponentMeasure.fontBoundingBoxDescent;

        this.subsript = subsript;
        this.subsriptMeasure = this.ctx.measureText(this.subsript);
        this.subsriptWidth = this.subsriptMeasure.width;
        this.subsriptHeight = this.subsriptMeasure.fontBoundingBoxAscent + this.subsriptMeasure.fontBoundingBoxDescent;
        
        if (isNaN(this.subscriptWidth))
        {
            this.subscriptWidth = 0;
        }
        if (isNaN(this.exponentWidth))
        {
            this.exponentWidth = 0;
        }

        //this.height = this.measure.actualBoundingBoxAscent + this.measure.actualBoundingBoxDescent;
        //console.log(this.measure);
    }
    getString()
    {
        return this.string;
    }
    render(ctx, x, y)
    {
        /*ctx.strokeStyle = "red";
        ctx.moveTo(x-5,y);
        ctx.lineTo(x+5,y);
        ctx.moveTo(x,y-5);
        ctx.lineTo(x,y+5);
        ctx.stroke();*/
        ctx.font = fontSize + fontType;
        ctx.fillText(this.string, x, y+this.height/2);
        ctx.font = smallerFontSize + fontType;
        ctx.fillText(this.exponent,x+this.width, y-this.measure.actualBoundingBoxAscent*3/4);
        ctx.fillText(this.subsript,x+this.width, y+this.height/2+this.subsriptMeasure.actualBoundingBoxAscent);
        //console.log(Math.max(this.exponentWidth + this.subscriptWidth))
        return this.width + Math.max(this.exponentWidth + this.subscriptWidth);
    }
    renderCentered(ctx, x, y)
    {
        ctx.fillText(this.string, x-this.width/2, y+this.height/2);
        return this.width;
    }
    addExponent(exponent)
    {
        this.exponent = exponent;
        this.exponentMeasure = this.ctx.measureText(this.exponent);
        this.exponentWidth = this.exponentMeasure.width;
        this.exponentHeight = this.exponentMeasure.fontBoundingBoxAscent + this.exponentMeasure.fontBoundingBoxDescent;
        if (isNaN(this.exponentWidth))
        {
            this.exponentWidth = 0;
        }
    }
    addSubscript(subsript)
    {
        this.subsript = subsript;
        this.subsriptMeasure = this.ctx.measureText(this.subsript);
        this.subsriptWidth = this.subsriptMeasure.width;
        this.subsriptHeight = this.subsriptMeasure.fontBoundingBoxAscent + this.subsriptMeasure.fontBoundingBoxDescent;
        if (isNaN(this.subscriptWidth))
        {
            this.subscriptWidth = 0;
        }
    }
}

class SubSuperScript
{
    constructor(ctx, string)
    {
        
    }
}

class Matrix
{
    constructor(ctx, string = "")
    {
        this.ctx = ctx;
        this.string = string;
        this.rows = [];
        //this.columnPadding = 3;
        //this.rowPadding = 3;
        this.padding = 5;
        for (let i=0; i<string.length;i++)
        {
            let c = string[i];

            let row = ",";
            row = getEnclosedString(string, i);
            
            if (row == null)
            {
                continue;
            }
            i += row.length+1;
            row = row.split(",");
            for (let j=0; j<row.length; j++)
            {
                row[j] = new Element(this.ctx, row[j]);
            }
            this.rows.push(row);
        }


    }
    render(ctx, xOffset, yMiddle)
    {
        let columnWidths = [];
        let rowHeights = [];
        let maxHeight = 0;
        const padding = this.padding;
        for (let i=0; i<this.rows.length; i++)
        {
            let rH = 2;
            for (let j=0; j<this.rows[i].length; j++)
            {
                rH = Math.max(rH, Math.ceil(this.rows[i][j].height));
                if (columnWidths.length > j)
                {
                    columnWidths[j] = Math.max(columnWidths[j], Math.ceil(this.rows[i][j].width));
                } else {
                    columnWidths.push(Math.max(2, Math.ceil(this.rows[i][j].width)));
                }
            }
            rowHeights.push(rH);
            maxHeight += rH;
        }

        let maxWidth = 0;
        for (let i=0; i<columnWidths.length; i++)
        {
            maxWidth += columnWidths[i];
        }

        //let yStart = yMiddle + rowHeights[0]/2- maxHeight/2;
        //let startX = 0;

        let y = padding;
        for (let r=0; r<this.rows.length; r++)
        {
            let x = padding*2;
            for(let c=0; c<this.rows[r].length;c++)
            {
                this.rows[r][c].renderCentered(ctx, xOffset+x+columnWidths[c]/2, yMiddle+y-maxHeight/2);
                x += columnWidths[c] + padding;
            }
            y += rowHeights[r] + padding;
        }

        const totalHeight = maxHeight + rowHeights.length*padding;
        ctx.beginPath();
        ctx.moveTo(xOffset + padding*2, yMiddle - totalHeight/2 - padding*2);
        ctx.lineTo(xOffset, yMiddle - totalHeight/2 - padding*2);
        ctx.lineTo(xOffset, yMiddle + totalHeight/2 + padding*2);
        ctx.lineTo(xOffset + padding*2, yMiddle + totalHeight/2 + padding*2);
        const xOff = maxWidth + padding*(columnWidths.length+2);
        ctx.moveTo(xOff + xOffset - padding*2, yMiddle - totalHeight/2 - padding*2);
        ctx.lineTo(xOff + xOffset, yMiddle - totalHeight/2 - padding*2);
        ctx.lineTo(xOff + xOffset, yMiddle + totalHeight/2 + padding*2);
        ctx.lineTo(xOff + xOffset - padding*2, yMiddle + totalHeight/2 + padding*2);
        ctx.stroke();

        return xOff;
    }
}



const textInputElement = document.getElementById("textInput");
const canvasElement = document.getElementById("mainCanvas");
let bb = canvasElement.getBoundingClientRect();
canvasElement.width = Math.round(bb.width);
canvasElement.height = Math.round(bb.height);
const ctx = canvasElement.getContext("2d");

var elements = [];
var fontSize = "20px";
var smallerFontSize = "15px";
var fontType = " serif";


function onTextInputChange()
{
    ctx.fillStyle = "white";
    ctx.fillRect(0,0,Math.round(canvasElement.width), Math.round(canvasElement.height));
    ctx.fillStyle = "black";
    ctx.strokeStyle = "black";
    //ctx.moveTo(0,100);
    //ctx.lineTo(1000,100);
    //ctx.stroke();
    ctx.font = fontSize + fontType;

    let string = textInputElement.value;

    elements = [];

    for (let i=0; i<string.length; i++)
    {
        const c = string[i];
        if (c == "m")
        {
            if (match(string, "mat", i))
            {
                i += 3;
                let enclosedString = getEnclosedString(string, i);
                //console.log("enclosed string: " +enclosedString);
                if (enclosedString != null)
                {
                    elements.push( new Matrix(ctx, enclosedString) );
                    i += enclosedString.length+1;
                    continue;
                }
            }
        }
        if (c == "^")
        {
            i++;
            let enclosedString = getEnclosedString(string, i);
            if (enclosedString != null)
            {
                elements[elements.length-1].addExponent(enclosedString);
                if (enclosedString.length > 1)
                {
                    i += enclosedString.length + 1;
                } else {
                    
                }
                continue;
            }
        }
        if (c == "_")
        {
            i++;
            let enclosedString = getEnclosedString(string, i);
            if (enclosedString != null)
            {
                elements[elements.length-1].addSubscript(enclosedString);
                if (enclosedString.length > 1)
                {
                    i += enclosedString.length + 1;
                } else {
                    
                }
                continue;
            }
        }
        
        elements.push( new Element(ctx, string[i]));
        
        
    }

    let x = 10;
    let y = 100;
    for (let i=0; i<elements.length; i++)
    {
        x += elements[i].render(ctx, x, y);
    }
}


function match(string, substring, startIndex)
{
    //console.log("string: " + string + "  substring; " + substring + "  startIndex: " + startIndex);
    let maxIndex = Math.min(string.length, substring.length + startIndex);
    let j=0;
    for (let i=startIndex; i<maxIndex; i++)
    {
        if (string[i] != substring[j])
        {
            //console.log("false: " + string[startIndex] + ", " + substring[j]);
            return false;
        }
        j++;
    }
    return true;
}

function getEnclosedString(string, startIndex)
{
    let numOpen = 0;
    let openChar = "(";
    let searchForChar = ")";
    let inside = "";

    if (string[startIndex] != "(" && string[startIndex] != "[")
    {
        return string[startIndex];
    }

    for (let i=startIndex; i<string.length; i++)
    {
        let c = string[i];

        if (numOpen == 0)
        {
            if (c == "(")
            {
                openChar = "(";
                searchForChar = ")";
                numOpen++;
                continue;
            } else if (c == "[")
            {
                openChar = "["
                searchForChar = "[";
                numOpen++;
                continue;
            }
        }
        
        if (numOpen == 1 && c == searchForChar)
        {
            numOpen--;
            return inside;
        }

        if (numOpen > 0 && c == openChar)
        {
            numOpen++;
        }
        if (numOpen > 0 && c == searchForChar)
        {
            numOpen--;
        }

        if (numOpen > 0)
        {
            inside += c;
        }
    }
    return null;
}

// mat[[1,2,3],[1,3,4],[2,4,5]]
// mat((1,2,3),(1,2,3),(1,2,3))



