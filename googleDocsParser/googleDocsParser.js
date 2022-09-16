





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

class Matrix_OLD
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



class Container
{
    constructor(ctx, rawString="")
    {
        this.ctx = ctx;
        this.rawString = rawString;

        console.log("initial string: " + rawString);

        let string = this.rawString;


        //Search for greek letters
        for (let i=0; i<string.length; i++)
        {
            if (string[i] == "\\")
            {
                i++;
                for (let j=0; j<greekLetters.length; j++)
                {
                    if (match(string, greekLetters[j].code, i))
                    {
                        //console.error("MATCH", greekLetters[j].code);
                        const sc = new SpecialCharacter(ctx, greekLetters[j].value);
                        const ID = String.fromCharCode(subContainerOn);
                        containerMap.set(ID, sc); //update map
                        subContainerOn++;
                        string = string.substring(0, i-1) + ID + string.substring(i+greekLetters[j].code.length, string.length);
                        i = -1;
                        break;
                    }
                }
            }
        }
        
        //search for matrices
        for (let i=0; i<string.length; i++)
        {
            if (match(string, "mat", i))
            {
                const substring = getEnclosedString(string, i+3);
                const subContainer = new Matrix(this.ctx, substring);                    //create new Container
                const subContainerIDChar= String.fromCharCode(subContainerOn); //Create container char ID (to be put into string)
                //console.log("Matrix substring: ", substring);
                containerMap.set(subContainerIDChar, subContainer); //update map
                subContainerOn++;  //increment subContainerOn
                //string = (string.substring(0,openPIndex) + subContainerIDChar + string.substring(closePIndex+1, string.length));
                string = (string.substring(0,i)+subContainerIDChar  +string.substring(i+5+substring.length, string.length));
                //console.log("replaced matrix. new string: " + string);
                i=-1;
                continue;
            }
        }

        //replace all parenthesis with
        let openPIndex = null;
        let closePIndex = null;
        for(let i=0; i<string.length; i++)
        {
            const c = string[i];
            if (c == "(")
            {
                openPIndex = i;
            }
            if (c == ")" && openPIndex != null)
            {
                closePIndex = i;
                const substring = string.substring(openPIndex+1, closePIndex); //get text between parenthesis
                const subContainer = new Container(this.ctx, substring);                    //create new Container
                const subContainerIDChar= String.fromCharCode(subContainerOn); //Create container char ID (to be put into string)
                containerMap.set(subContainerIDChar, subContainer); //update map
                subContainerOn++;  //increment subContainerOn
                string = (string.substring(0,openPIndex) + subContainerIDChar + string.substring(closePIndex+1, string.length));
                //console.log("replaced parenthesis. new string: " + string);
                openPIndex = null;
                closePIndex = null;
                i=-1;
                continue;
            }
        }

        //Next, replace all []_[]
        for (let i=0; i<string.length; i++)
        {
            const c = string[i];
            if (c == "_" && i > 0 && i < string.length-1)
            {
                let preString = string[i-1];
                let postString = string[i+1];
                let preContainer = containerMap.get(preString);
                let postContainer = containerMap.get(postString); 
                //console.log("preString: " + preString + "  posString: " + postString);
                if (preContainer == null)
                {
                    preContainer = new Container(this.ctx, preString);
                    const preContainerIdChar= String.fromCharCode(subContainerOn); //Create container char ID (to be put into string)
                    containerMap.set(preContainerIdChar, preContainer); //update map
                    subContainerOn++;  //increment subContainerOn
                    //string[i-1] = preContainerIdChar;
                    string = (string.substring(0,i-1) + preContainerIdChar + string.substring(i, string.length));
                }

                if (postContainer == null)
                {
                    postContainer = new Container(this.ctx, postString);
                    const postContainerIdChar= String.fromCharCode(subContainerOn); //Create container char ID (to be put into string)
                    containerMap.set(postContainerIdChar, postContainer); //update map
                    subContainerOn++;  //increment subContainerOn
                    //string[i+1] = postContainerIdChar;
                    string = (string.substring(0,i+1) + postContainerIdChar + string.substring(i+2, string.length));
                }

                preContainer.addSubscript(postContainer);
                string = (string.substring(0,i) + string.substring(i+2, string.length));
                i = -1;
                //console.log("replaced subscript. new string: " + string);
            }
        }
        this.string = string;
        console.log("final string: " + this.string);
    }
    addSubscript(subscriptContainer)
    {
        if (this.subscriptContainer != null)
        {
            this.subscriptContainer.addSubscript(subscriptContainer);
        } else {
            this.subscriptContainer = subscriptContainer;
        }
        this.dimensions = null;
    }
    toString()
    {
        let s = "";
        for (let i=0; i<this.string.length; i++)
        {
            const c = this.string[i];
            const container = containerMap.get(c);
            if (container != null)
            {
                s += container.toString();
            } else {
                s += c;
            }
        }
        s +="";
        if (this.subscriptContainer != null)
        {
            s = "(" + s + ")_("+this.subscriptContainer.toString()+")";
        }
        return s;
    }
    getDimensions()
    {
        if (this.dimensions == null)
        {
            let width = 1;
            let ascent = 1;
            let descent = 1;
            for (let i=0; i<this.string.length; i++)
            {
                const c = this.string[i];
                const con = containerMap.get(c);
                if (con != null)
                {
                    let ret = con.getDimensions();
                    width += ret.width;
                    ascent = Math.max(ascent, ret.ascent);
                    descent = Math.max(descent, ret.descent);
                } else {
                    let m = this.ctx.measureText(c);
                    width += m.width;
                    ascent = Math.max(ascent, m.fontBoundingBoxAscent);
                    descent = Math.max(descent, m.fontBoundingBoxDescent);
                }
            }

            if (this.subscriptContainer != null)
            {
                let ret = this.subscriptContainer.getDimensions();
                width += ret.width;
                //ascent = Math.max(ascent, ret.ascent);
                descent = Math.max(descent, ret.descent+5);
            }

            this.dimensions = {
                width: width,
                ascent: ascent,
                descent: descent,
            };
        }
        return this.dimensions;
    }
    render(startX, startY)
    {
        const initialFontSize = parseFontSize(this.ctx.font);
        let xOffset = 0;
        let descent = 1;
        for (let i=0; i<this.string.length; i++)
        {
            const c = this.string[i];
            const con = containerMap.get(c);
            if (con != null)
            {
                let ret = con.render(startX+xOffset, startY);
                console.log(ret);
                xOffset += ret.width;
                descent = Math.max(ret.descent);
            } else {
                let m = this.ctx.measureText(c);
                this.ctx.fillText(c, startX + xOffset, startY);
                xOffset += m.width;
            }
        }

        if (this.subscriptContainer != null)
        {
            this.ctx.font = Math.round(initialFontSize*fontSizeSubscriptMultiplier) + "px" + fontType;
            this.subscriptContainer.render(startX+xOffset, startY+5+descent);
            this.ctx.font = initialFontSize + "px" + fontType;
        }
        return this.dimensions;
    }
}

class Matrix
{
    constructor(ctx, rawString="")
    {
        this.ctx = ctx;
        this.rawString = rawString;
        let string = rawString;

        this.columnPadding = 4;
        this.rowPadding = 4;

        this.rows = [];
        let startPIndex = null;
        let endPIndex = null;
        let numOpen = 0;
        for (let i=0; i<string.length; i++)
        {
            const c = string[i];
            if (c == "(")
            {
                if (startPIndex == null)
                {
                    startPIndex = i;
                }
                numOpen += 1;
            }
            if (c == ")" && startPIndex != null && numOpen == 1)
            {
                endPIndex = i;

                const substring = string.substring(startPIndex+1, endPIndex);
                let row = substring.split(",");
                for(let j=0; j<row.length; j++)
                {
                    if (row[j][0] == "\\")
                    {
                        row[j] = new SpecialCharacter(this.ctx, row[j]);
                    } else {
                        row[j] = new Container(this.ctx, row[j]);
                    }
                }
                this.rows.push(row);
                string = string.substring(0, startPIndex) + string.substring(endPIndex+1, string.length);
                startPIndex = null;
                endPIndex = null;
                i = -1;
                numOpen = 0;
                continue;
            } else if (c == ")" && startPIndex != null)
            {
                numOpen -= 1;
            }
        }
    }
    addSubscript(subscriptContainer)
    {
        if (this.subscriptContainer != null)
        {
            this.subscriptContainer.addSubscript(subscriptContainer);
        } else {
            this.subscriptContainer = subscriptContainer;
        }
        this.dimensions = null;
    }
    toString()
    {
        return "MATRIX";
    }
    getDimensions()
    {
        if (this.dimensions == null)
        {
            const columnPadding = this.columnPadding;
            const rowPadding = this.rowPadding;
            let maxNumInRow = 1;
            let maxRowWidth = 1;
            let maxCellWidth = 1;
            let maxCellAscent = 1;
            let maxCellDescent = 0;
            let rowAscents = [];
            let rowDescents = [];
            for (let r=0; r<this.rows.length; r++)
            {
                const row = this.rows[r];
                maxNumInRow = Math.max(maxNumInRow, row.length);
                let rowWidth = 1;
                let rowAscent = 1;
                let rowDescent = 0;
                for (let c=0; c<row.length; c++)
                {
                    const con = row[c];
                    const ret = con.getDimensions();
                    rowWidth += ret.width;
                    maxCellWidth = Math.max(maxCellWidth, ret.width);
                    maxCellAscent = Math.max(maxCellAscent, ret.ascent);
                    maxCellDescent = Math.max(maxCellDescent, ret.descent);
                    rowAscent = Math.max(rowAscent, ret.ascent);
                    rowDescent = Math.max(rowDescent, ret.descent);
                }
                maxRowWidth = Math.max(maxRowWidth, rowWidth);
                rowDescents.push(rowDescent);
                rowAscents.push(rowAscent);
            }

            let totalHeight = (maxCellAscent+maxCellDescent)*this.rows.length + rowPadding*(this.rows.length-1);
            let ascent = totalHeight/2;
            let descent = totalHeight/2;
            let width = maxCellWidth*maxNumInRow + columnPadding*maxNumInRow;
            this.dimensions = {
                maxCellWidth: maxCellWidth,
                maxCellAscent: maxCellAscent,
                maxCellDescent: maxCellDescent,
                maxCellHeight: maxCellAscent+maxCellDescent,
                width: width,
                ascent: ascent,
                descent: descent,
                height: totalHeight,
            };
        }
        return this.dimensions;
    }
    render(startX, startY)
    {
        const initialFontSize = parseFontSize(this.ctx.font);
        const updateTheseDimensions = this.getDimensions();
        let maxYOffset = 1;
        let maxXOffset = 1;
        ctx.strokeRect(startX-this.dimensions.maxCellWidth, startY-this.dimensions.height/2, this.dimensions.width+this.columnPadding, this.dimensions.height);
        ctx.fillStyle = "white";
        ctx.fillRect(startX-this.dimensions.maxCellWidth+this.columnPadding, startY-this.dimensions.height/2 - 3, this.dimensions.width-this.columnPadding, this.dimensions.height+6);
        ctx.fillStyle = "black";
        for (let r=0; r<this.rows.length; r++)
        {
            const row = this.rows[r];
            const yOffset = - this.dimensions.ascent + this.dimensions.maxCellHeight*(r+1);
            for (let c=0; c<row.length; c++)
            {
                const xOffset = this.dimensions.maxCellWidth*(c) + this.columnPadding*(c-1);
                const cell = row[c];
                const dim = cell.getDimensions();
                cell.render(startX+xOffset-dim.width/2, startY+yOffset);
                maxYOffset = Math.max(maxYOffset, yOffset);
                maxXOffset = Math.max(maxXOffset, xOffset);
            }
        }
        if (this.subscriptContainer != null)
        {
            this.ctx.font = Math.round(initialFontSize*fontSizeSubscriptMultiplier) + "px" + fontType;
            this.subscriptContainer.render(startX+maxXOffset+this.columnPadding*2, startY+maxYOffset+5);
            this.ctx.font = initialFontSize + "px" + fontType;
        }
        if (this.superscriptContainer != null)
        {
            this.ctx.font = Math.round(initialFontSize*fontSizeSubscriptMultiplier) + "px" + fontType;
            this.superscriptContainer.render(startX+maxYOffset, startY-5);
            this.ctx.font = initialFontSize + "px" + fontType;
        }
        return updateTheseDimensions;
    }
}

class SpecialCharacter extends Container
{
    constructor(ctx, rawString)
    {
        rawString = rawString.replace("\\","");
        super(ctx, rawString);
        //console.log("NEW SPECIALCHARACTER: " + rawString);
    }
    getDimensions()
    {
        if (this.dimensions == null)
        {
            const m = this.ctx.measureText(this.rawString);
            this.dimensions = {
                width: m.width,
                characterWidth: m.width,
                ascent: m.fontBoundingBoxAscent,
                descent: m.fontBoundingBoxDescent,
            };
            if (this.subscriptContainer != null)
            {
                this.dimensions.width += this.subscriptContainer.getDimensions().width;
            }
        }
        return this.dimensions;
    }
    render(startX, startY)
    {
        const initialFontSize = parseFontSize(this.ctx.font);
        //let xOffset = 0;
        //let descent = 1;
        /*for (let i=0; i<this.string.length; i++)
        {
            const c = this.string[i];
            const con = containerMap.get(c);
            if (con != null)
            {
                let ret = con.render(startX+xOffset, startY);
                console.log(ret);
                xOffset += ret.width;
                descent = Math.max(ret.descent);
            } else {
                let m = this.ctx.measureText(c);
                this.ctx.fillText(c, startX + xOffset, startY);
                xOffset += m.width;
            }
        }*/
        //console.log("Rendering: rawString", this.rawString);
        this.ctx.fillText(this.rawString, startX, startY);

        if (this.subscriptContainer != null)
        {
            this.ctx.font = Math.round(initialFontSize*fontSizeSubscriptMultiplier) + "px" + fontType;
            this.subscriptContainer.render(startX+this.dimensions.characterWidth, startY+5+this.dimensions.descent);
            this.ctx.font = initialFontSize + "px" + fontType;
        }
        return this.dimensions;
    }
}

//Parenthesis, Exponents, Subscripts, Multiply, Divide, Add, Subtract
// ()             ^           _         



const greekLetters = [
    { code: "Alpha", value: "\u0391" },
    { code: "alpha", value: "\u03b1" },

    { code: "Beta", value: "\u0392" },
    { code: "beta", value: "\u03b2" },

    { code: "Gamma", value: "\u0393" },
    { code: "gamma", value: "\u03b3" },

    { code: "Delta", value: "\u0394" },
    { code: "delta", value: "\u03b4" },

    { code: "Epsilon", value: "\u0395" },
    { code: "epsilon", value: "\u03b5" },

    { code: "Zeta", value: "\u0396" },
    { code: "zeta", value: "\u03b6" },

    { code: "Eta", value: "\u0397" },
    { code: "eta", value: "\u03b7" },

    { code: "Theta", value: "\u0398" },
    { code: "theta", value: "\u03b8" },

    { code: "Lambda", value: "\u039b" },
    { code: "lambda", value: "\u03bb" },

    { code: "Mu", value: "\u039c" },
    { code: "mu", value: "\u03bc" },

    { code: "Pi", value: "\u03a0" },
    { code: "pi", value: "\u03c0" },

    { code: "Rho", value: "\u03a1" },
    { code: "rho", value: "\u03c1" },

    { code: "Sigma", value: "\u03a3" },
    { code: "sigma", value: "\u03c2" },

    { code: "Omega", value: "\u03a9" },
    { code: "omega", value: "\u03c9" }
    //https://unicode-table.com/en/sets/greek-symbols/
];


const textInputElement = document.getElementById("textInput");
const canvasElement = document.getElementById("mainCanvas");
let bb = canvasElement.getBoundingClientRect();
canvasElement.width = Math.round(bb.width);
canvasElement.height = Math.round(bb.height);
const ctx = canvasElement.getContext("2d");

var elements = [];
const fontSize = 20;
const fontSizeSubscriptMultiplier = 0.8;
const fontType = " serif";

//both are reset in onTextINputChange
var containerMap = new Map();
var subContainerOn = 1;


function onTextInputChange()
{
    containerMap = new Map();
    subContainerOn = 1;

    ctx.fillStyle = "white";
    ctx.fillRect(0,0,Math.round(canvasElement.width), Math.round(canvasElement.height));
    ctx.fillStyle = "black";
    ctx.strokeStyle = "black";
    //ctx.moveTo(0,100);
    //ctx.lineTo(1000,100);
    //ctx.stroke();
    ctx.font = fontSize + "px" + fontType;

    let string = textInputElement.value;

    let con= new Container(ctx, string);
    console.log(con.toString());
    console.log(con.getDimensions());
    con.render(100,100);
    /*
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
    }*/
}


function match(string, substring, startIndex)
{
    //console.log("string: " + string + "  substring; " + substring + "  startIndex: " + startIndex);
    let maxIndex = Math.min(string.length, substring.length + startIndex);
    let j=0;
    if (string.length - startIndex < substring.length) { return false;}
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

function parseFontSize(fontString)
{
    let s = "";
    for (let i=0; i<4; i++)
    {
        if (!isNaN(Number(fontString[i])))
        {
            s += fontString[i];
        } else {
            return Number(s);
        }
    }
    return Number('notANumber');
}


test();

function test()
{
    const map = new Map();
    map.set("C", ["C0", "A1", "0"]);
    map.set("A", ["B0", "C1", "1"]);
    map.set("B", ["A0", "B1"]);



    let s = [{string:"C",tree:"C"}];
    let doneTrees = [s[0].tree];
    for (let r=0; r<500; r++)
    {
        const startString = s.shift();
        //console.log(startString);
        const poss = map.get(startString.string[0]);
        if (poss == null)
        {
            //console.log(startString);
            let int = parseInt(startString.string,2);
            //console.log(startString, int, int%3);
            doneTrees.push(startString.tree);
            continue;
        }
        for (let i=0; i<poss.length; i++)
        {
            let newS = poss[i]+startString.string.substring(1,startString.string.length);
            s.push( {
                string: newS,
                tree: startString.tree + ","+newS,
            } );
        }
    }


    console.log("done trees:", doneTrees);

    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.fillRect(0,0,canvasElement.width, canvasElement.height);
    ctx.font = "12px serif"
    ctx.fillStyle = "black";

    let rows = [1,1,1,1,1,1,1,1,1,1];
    let gridSize = 60;
    let shapeSize = 30;
    const treePosMap = new Map();
    for (let i=0; i<doneTrees.length; i++)
    {
        const tree = doneTrees.shift();
        //console.log(tree);
        const t = tree.split(",");
        const last = t[t.length-1];
        const secondToLast = t[t.length-2];
        /*let pos = treePosMap.get( secondToLast );
        if (pos == null)
        {
            pos = {
                row: 1,
                column: 1,
            };
            treePosMap.set(secondToLast, pos);
            ctx.strokeRect(pos.column*gridSize, pos.row*gridSize, shapeSize, shapeSize);
        }*/

        let row = t.length
        let column = rows[row];
        rows[row]+=1;
        //console.log(t, pos, row, column);
        //treePosMap.set(last, {row:row, column:column});
        //ctx.strokeRect(column*gridSize, row*gridSize, shapeSize, shapeSize);
        ctx.fillText(secondToLast+","+last, column*gridSize, row*gridSize);
    }


    //console.log(s);

}

function binaryToDecimal(b)
{
    let power = 0;
    let val = 0;
    for (let i=b.length-1; b>-1; b--)
    {
        if (b[i] == "1")
        {
            val += Math.pow(2,power);
        }
        power+=1;
    }
    return val;
}