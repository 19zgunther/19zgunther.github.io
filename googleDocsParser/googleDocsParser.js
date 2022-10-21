

class Container
{
    constructor(ctx, rawString="", globalData,  isNumber = false)
    {
        this.globalData = globalData;
        if (this.globalData == null)
        {
            this.globalData = {
                containerMap: new Map(),
                subContainerOn: 1,
            };
        }
        this.ctx = ctx;
        this.rawString = rawString;
        this.isNumber = isNumber;

        console.log("initial string: " + rawString);

        let string = this.rawString;

        if (!this.isNumber)
        {
            string = this._findAndReplaceNumbers(string);
            string = this._findAndReplaceGreekLetters(string);
            string = this._findAndReplaceMatrices(string);
            string = this._findAndReplaceParenthesis(string);
            string = this._findAndReplaceSubSuperscripts(string);
        }

        this.string = string;
        console.log("final string: " + this.string);
        return;
        //now, let's check for declarations.
        for (let i=0; i<string.length; i++)
        {
            if (match(string, "let", i))
            {
                const startIndex = i+3;
                let middleIndex = null;
                let endIndex = null;
                for (let j=i+3; j<string.length; j++)
                {
                    if (string[j] == "=" && middleIndex == null)
                    {
                        middleIndex = j;
                    }
                    if (string[j] == ";")
                    {
                        endIndex = j;
                        break;
                    }
                }
                if (endIndex == null || middleIndex == null) { console.log("Failed");continue; }
                const variableSubstring = string.substring(startIndex, middleIndex).replace(" ", "");
                let valueSubstring = string.substring(middleIndex+1, endIndex).replace(" ","");

                console.log("var: " + variableSubstring+"\nval: " + valueSubstring);
                let run = true;
                while (run)
                {
                    if (valueSubstring.includes("+"))
                    {
                        for (let j=0; j<valueSubstring.length; j++)
                        {
                            
                        }
                    }
                    run = false;
                }
                for (let j=0; j<valueSubstring.length; j++)
                {

                }
                definitionMap.set(variableSubstring, valueSubstring);
            }
        }
    }
    _findAndReplaceGreekLetters(string)
    {
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
                        const sc = new SpecialCharacter(ctx, greekLetters[j].value, this.globalData);
                        const ID = String.fromCharCode(this.globalData.subContainerOn);
                        this.globalData.containerMap.set(ID, sc); //update map
                        this.globalData.subContainerOn++;
                        string = string.substring(0, i-1) + ID + string.substring(i+greekLetters[j].code.length, string.length);
                        i = -1;
                        break;
                    }
                }
            }
        }
        return string;
    }
    _findAndReplaceMatrices(string)
    {
        //search for matrices
        for (let i=0; i<string.length; i++)
        {
            if (match(string, "mat", i))
            {
                const substring = getEnclosedString(string, i+3);
                const subContainer = new Matrix(this.ctx, substring, this.globalData);                    //create new Container
                const subContainerIDChar= String.fromCharCode(this.globalData.subContainerOn); //Create container char ID (to be put into string)
                //console.log("Matrix substring: ", substring);
                this.globalData.containerMap.set(subContainerIDChar, subContainer); //update map
                this.globalData.subContainerOn++;  //increment this.globalData.subContainerOn
                //string = (string.substring(0,openPIndex) + subContainerIDChar + string.substring(closePIndex+1, string.length));
                string = (string.substring(0,i)+subContainerIDChar  +string.substring(i+5+substring.length, string.length));
                //console.log("replaced matrix. new string: " + string);
                i=-1;
                continue;
            }
        }
        return string;
    }
    _findAndReplaceParenthesis(string)
    {
        let openPIndex = null;
        let closePIndex = null;
        //et openPIndices = [-1];
        for(let i=0; i<string.length; i++)
        {
            const c = string[i];
            if (c == "(")
            {
                openPIndex = i;
                //openPIndices.push(i);
            }
            if (c == ")" && openPIndex != null)
            {
                if (openPIndex == 0 && i >= string.length-1) {  console.log("() is full lenght");break; }
                closePIndex = i;
                const substring = string.substring(openPIndex, closePIndex+1); //get text between parenthesis
                const subContainer = new Container(this.ctx, substring, this.globalData);                    //create new Container
                const subContainerIDChar= String.fromCharCode(this.globalData.subContainerOn); //Create container char ID (to be put into string)
                this.globalData.containerMap.set(subContainerIDChar, subContainer); //update map
                this.globalData.subContainerOn++;  //increment this.globalData.subContainerOn
                string = (string.substring(0,openPIndex) + subContainerIDChar + string.substring(closePIndex+1, string.length));
                //console.log("replaced parenthesis. new string: " + string);
                //console.log("openP: " + openPIndex+ "  closeP: " + closePIndex);
                openPIndex = null;
                closePIndex = null;
                i=-1;
                continue;
            }
        }
        return string;
    }
    _findAndReplaceNumbers(string)
    {
        /*for (let i=0; i<string.length; i++)
        {
            let startIndex = null;
            let charCode = string.charCodeAt(i);
            while(((charCode >= 48 && charCode <= 57) || string[i] == ".") && i < string.length)
            {
                if (startIndex == null)
                {
                    startIndex = i;
                }
                i+=1;
            }
            if (startIndex != null)
            {
                const substring = string.substring(startIndex, i);
                const num = Number(substring);
                if (!isNaN(num))
                {
                    this.globalData.containerMap.set(String.fromCharCode(this.globalData.subContainerOn), new NumberContainer(ctx, num, this.globalData));
                    const newString = string.substring(0,startIndex) + String.fromCharCode(this.globalData.subContainerOn) + string.substring(i, string.length);
                    console.log("number found. string: " +string + " num: " + num + " substring: " + substring + "  newString:"+newString);
                    string = newString;
                    this.globalData.subContainerOn++;
                    i = -1;
                    continue;
                }
            }
        }*/
        let number = "";
        for (let i=0; i<string.length; i++)
        {
            const charCode = string.charCodeAt(i);
            if ((charCode >=48 && charCode <= 57) || string[i] == ".")
            {
                number += string[i];
                //console.log(charCode + ", " +string[i]);
            } else if (number.length > 0)
            {
                const num = Number(number);
                if (isNaN(num)) { console.log("not a number: " + number);continue; }
                const id = String.fromCharCode(this.globalData.subContainerOn);
                this.globalData.subContainerOn++;
                const con = new NumberContainer(this.ctx, number, this.globalData);
                //console.log("creating number: " + number);
                this.globalData.containerMap.set(id, con);
                string = string.substring(0, i-number.length) + id + string.substring(i, string.length);
                number = "";
                i = 0;
            }
        }
        if (number.length > 0)
        {
            const num = Number(number);
            if (isNaN(num)) { console.log("not a number: " + number);return string; }
            const id = String.fromCharCode(this.globalData.subContainerOn);
            this.globalData.subContainerOn++;
            const con = new NumberContainer(this.ctx, number, this.globalData);
            //console.log("creating number: " + number);
            this.globalData.containerMap.set(id, con);
            string = string.substring(0, string.length-number.length) + id;   
        }
        return string;
    }
    _findAndReplaceSubSuperscripts(string)
    {
        for (let i=0; i<string.length; i++)
        {
            const c = string[i];
            if (c == "_" && i > 0 && i < string.length-1)
            {
                let preString = string[i-1];
                let postString = string[i+1];
                let preContainer = this.globalData.containerMap.get(preString);
                let postContainer = this.globalData.containerMap.get(postString); 
                if (preContainer == null)
                {
                    preContainer = new Container(this.ctx, preString, this.globalData);
                    const preContainerIdChar= String.fromCharCode(this.globalData.subContainerOn); //Create container char ID (to be put into string)
                    this.globalData.containerMap.set(preContainerIdChar, preContainer); //update map
                    this.globalData.subContainerOn++;  //increment this.globalData.subContainerOn
                    string = (string.substring(0,i-1) + preContainerIdChar + string.substring(i, string.length));
                }

                if (postContainer == null)
                {
                    postContainer = new Container(this.ctx, postString, this.globalData);
                    const postContainerIdChar= String.fromCharCode(this.globalData.subContainerOn); //Create container char ID (to be put into string)
                    this.globalData.containerMap.set(postContainerIdChar, postContainer); //update map
                    this.globalData.subContainerOn++;  //increment this.globalData.subContainerOn
                    string = (string.substring(0,i+1) + postContainerIdChar + string.substring(i+2, string.length));
                }

                preContainer.addSubscript(postContainer);
                string = (string.substring(0,i) + string.substring(i+2, string.length));
                i = -1;
                continue;
            }
            if (c == "^" && i > 0 && i < string.length-1)
            {
                let preString = string[i-1];
                let postString = string[i+1];
                let preContainer = this.globalData.containerMap.get(preString);
                let postContainer = this.globalData.containerMap.get(postString); 
                if (preContainer == null)
                {
                    preContainer = new Container(this.ctx, preString, this.globalData);
                    const preContainerIdChar= String.fromCharCode(this.globalData.subContainerOn); //Create container char ID (to be put into string)
                    this.globalData.containerMap.set(preContainerIdChar, preContainer); //update map
                    this.globalData.subContainerOn++;  //increment this.globalData.subContainerOn
                    string = (string.substring(0,i-1) + preContainerIdChar + string.substring(i, string.length));
                }

                if (postContainer == null)
                {
                    postContainer = new Container(this.ctx, postString, this.globalData);
                    const postContainerIdChar= String.fromCharCode(this.globalData.subContainerOn); //Create container char ID (to be put into string)
                    this.globalData.containerMap.set(postContainerIdChar, postContainer); //update map
                    this.globalData.subContainerOn++;  //increment this.globalData.subContainerOn
                    string = (string.substring(0,i+1) + postContainerIdChar + string.substring(i+2, string.length));
                }

                preContainer.addSuperscript(postContainer);
                string = (string.substring(0,i) + string.substring(i+2, string.length));
                i = -1;
                continue;
            }
        }
        return string;
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
    addSuperscript(superscriptContainer)
    {
        if (this.superscriptContainer != null)
        {
            this.superscriptContainer.addSubscript(superscriptContainer);
        } else {
            this.superscriptContainer = superscriptContainer;
        }
        this.dimensions = null;
    }
    toString()
    {
        let s = "";
        for (let i=0; i<this.string.length; i++)
        {
            const c = this.string[i];
            const container = this.globalData.containerMap.get(c);
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
            //const string = String(this.string);
            for (let i=0; i<this.string.length; i++)
            {
                const c = this.string[i];
                const con = this.globalData.containerMap.get(c);
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

            if (this.superscriptContainer != null)
            {
                let ret = this.superscriptContainer.getDimensions();
                width += ret.width;
                ascent = Math.max(ascent, ret.ascent+5);
            }

            this.dimensions = {
                width: width,
                ascent: ascent,
                descent: descent,
            };
        }
        if (this.isNumber)
        {
            console.log("Number dimensions: ",this.string, this.dimensions);
        }
        return this.dimensions;
    }
    render(ctx, startX, startY)
    {
        this.ctx = ctx;
        const initialFontSize = parseFontSize(this.ctx.font);
        const updateTheseDimensions = this.getDimensions();
        let xOffset = 0;
        let descent = 1;
        let ascent = 1;
        for (let i=0; i<this.string.length; i++)
        {
            const c = this.string[i];
            const con = this.globalData.containerMap.get(c);
            if (con != null)
            {
                let ret = con.render(this.ctx, startX+xOffset, startY);
                //console.log(con);
                xOffset += ret.width;
                descent = Math.max(descent, ret.descent);
                ascent = Math.max(ascent, ret.ascent);
            } else {
                let m = this.ctx.measureText(c);
                this.ctx.fillText(c, startX + xOffset, startY);
                xOffset += m.width;
            }
        }

        if (this.subscriptContainer != null)
        {
            this.ctx.font = Math.round(initialFontSize*fontSizeSubscriptMultiplier) + "px" + fontType;
            this.subscriptContainer.render(this.ctx, startX+xOffset, startY+5+descent);
            this.ctx.font = initialFontSize + "px" + fontType;
        }
        if (this.superscriptContainer != null)
        {
            this.ctx.font = Math.round(initialFontSize*fontSizeSubscriptMultiplier) + "px" + fontType;
            this.superscriptContainer.render(this.ctx, startX+xOffset, startY-5-ascent);
            this.ctx.font = initialFontSize + "px" + fontType;
        }
        return this.getDimensions();
    }
}

class Matrix
{
    constructor(ctx, rawString="", globalData)
    {
        this.globalData = globalData;
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
                    const n = this.globalData.containerMap.get(row[j][0]);
                    if (n instanceof Number)
                    {
                        console.log("fond n: " + n);
                        continue;
                    }
                    if (row[j][0] == "\\")
                    {
                        row[j] = new SpecialCharacter(this.ctx, row[j], this.globalData);
                    } else {
                        row[j] = new Container(this.ctx, row[j], this.globalData);
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
    addSuperscript(superscriptContainer)
    {
        if (this.superscriptContainer != null)
        {
            this.superscriptContainer.addSubscript(superscriptContainer);
        } else {
            this.superscriptContainer = superscriptContainer;
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
            let columnWidths = [];
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

                    if (c >= columnWidths.length)
                    {
                        columnWidths.push( ret.width );
                    }
                    columnWidths[c] = Math.max(columnWidths[c], ret.width);
                }
                maxRowWidth = Math.max(maxRowWidth, rowWidth);
                rowDescents.push(rowDescent);
                rowAscents.push(rowAscent);
            }

            let matrixWidth = this.columnPadding*(2+columnWidths.length);
            for (let i=0; i<columnWidths.length; i++)
            {
                matrixWidth += columnWidths[i];
            }

            let subscriptWidth = 1;
            let superscriptWidth = 1;
            if (this.subscriptContainer != null)
            {
                subscriptWidth = this.subscriptContainer.getDimensions().width;
            }
            if (this.superscriptContainer != null)
            {
                superscriptWidth = this.superscriptContainer.getDimensions().width;
            }

            let totalHeight = (maxCellAscent+maxCellDescent)*this.rows.length + rowPadding*(this.rows.length-1);
            let ascent = totalHeight/2;
            let descent = totalHeight/2;
            //let width = maxCellWidth*maxNumInRow + columnPadding*maxNumInRow;
            //let width = this.columnPadding*(2+columnWidths.length) + maxRowWidth;
            this.dimensions = {
                maxCellWidth: maxCellWidth,
                maxCellAscent: maxCellAscent,
                maxCellDescent: maxCellDescent,
                maxCellHeight: maxCellAscent+maxCellDescent,
                columnWidths: columnWidths,
                width: matrixWidth + Math.max(subscriptWidth, superscriptWidth),
                matrixWidth: matrixWidth,
                ascent: ascent,
                descent: descent,
                height: totalHeight,
            };
            console.log(this.dimensions);
        }
        return this.dimensions;
    }
    render(ctx, startX, startY)
    {
        this.ctx = ctx;
        const initialFontSize = parseFontSize(this.ctx.font);
        const updateTheseDimensions = this.getDimensions();
        //let maxYOffset = 1;
        //let maxXOffset = 1;
        ctx.strokeRect(startX+this.columnPadding/2, startY-this.dimensions.height/2, this.dimensions.matrixWidth-this.columnPadding, this.dimensions.height);
        ctx.fillStyle = "white";
        ctx.fillRect(startX+this.columnPadding*3/2, startY-this.dimensions.height/2-5, this.dimensions.matrixWidth-this.columnPadding*3, this.dimensions.height+10);
        ctx.fillStyle = "black";
        for (let r=0; r<this.rows.length; r++)
        {
            const row = this.rows[r];
            const yOffset = - this.dimensions.ascent + this.dimensions.maxCellHeight*(r+1);
            let xOffset = this.columnPadding;
            for (let c=0; c<row.length; c++)
            {
                xOffset += this.dimensions.columnWidths[c]/2;
                const cell = row[c];
                const dim = cell.getDimensions();
                cell.render(this.ctx, startX+xOffset-dim.width/2, startY+yOffset);
                //maxYOffset = Math.max(maxYOffset, yOffset);
                //maxXOffset = Math.max(maxXOffset, xOffset);
                xOffset += this.dimensions.columnWidths[c]/2 + this.columnPadding;
            }
        }
        if (this.subscriptContainer != null)
        {
            this.ctx.font = Math.round(initialFontSize*fontSizeSubscriptMultiplier) + "px" + fontType;
            this.subscriptContainer.render(this.ctx, startX+this.dimensions.matrixWidth, startY+this.dimensions.height/2);
            this.ctx.font = initialFontSize + "px" + fontType;
        }
        if (this.superscriptContainer != null)
        {
            this.ctx.font = Math.round(initialFontSize*fontSizeSubscriptMultiplier) + "px" + fontType;
            this.superscriptContainer.render(this.ctx, startX+this.dimensions.matrixWidth, startY-this.dimensions.height/2);
            this.ctx.font = initialFontSize + "px" + fontType;
        }
        return updateTheseDimensions;
    }
}

class SpecialCharacter extends Container
{
    constructor(ctx, rawString, globalData)
    {
        rawString = rawString.replace("\\","");
        super(ctx, rawString, globalData);
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
    render(ctx, startX, startY)
    {
        this.ctx = ctx;
        const initialFontSize = parseFontSize(this.ctx.font);
        const updateTheseDimensions = this.getDimensions();
        this.ctx.fillText(this.rawString, startX, startY);

        /*if (this.subscriptContainer != null)
        {
            this.ctx.font = Math.round(initialFontSize*fontSizeSubscriptMultiplier) + "px" + fontType;
            this.subscriptContainer.render(startX+this.dimensions.characterWidth, startY+5+this.dimensions.descent);
            this.ctx.font = initialFontSize + "px" + fontType;
        }*/
        if (this.subscriptContainer != null)
        {
            this.ctx.font = Math.round(initialFontSize*fontSizeSubscriptMultiplier) + "px" + fontType;
            this.subscriptContainer.render(this.ctx, startX+this.dimensions.characterWidth, startY+5+this.dimensions.descent);
            this.ctx.font = initialFontSize + "px" + fontType;
        }
        if (this.superscriptContainer != null)
        {
            this.ctx.font = Math.round(initialFontSize*fontSizeSubscriptMultiplier) + "px" + fontType;
            this.superscriptContainer.render(this.ctx, startX+this.dimensions.characterWidth, startY-5-this.dimensions.ascent);
            this.ctx.font = initialFontSize + "px" + fontType;
        }
        return this.dimensions;
    }
}

class NumberContainer extends Container
{
    constructor(ctx, rawString="", globalData)
    {
        console.log("creating number: " + rawString);
        super(ctx, rawString, globalData, true);
        //console.log(rawString);
    }
    getDimensions()
    {
        if (this.dimensions == null)
        {
            let width = 1;
            let ascent = 1;
            let descent = 1;
            //const string = String(this.string);
            /*for (let i=0; i<this.string.length; i++)
            {
                const c = this.string[i];
                const con = this.globalData.containerMap.get(c);
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
            }*/

            let ret = this.ctx.measureText(String(this.string));
            width = ret.width;
            ascent = ret.fontBoundingBoxAscent;
            descent = ret.fontBoundingBoxDescent;

            if (this.subscriptContainer != null)
            {
                let ret = this.subscriptContainer.getDimensions();
                width += ret.width;
                //ascent = Math.max(ascent, ret.ascent);
                descent = Math.max(descent, ret.descent+5);
            }

            if (this.superscriptContainer != null)
            {
                let ret = this.superscriptContainer.getDimensions();
                width += ret.width;
                ascent = Math.max(ascent, ret.ascent+5);
            }

            this.dimensions = {
                width: width,
                ascent: ascent,
                descent: descent,
            };
        }
        return this.dimensions;
    }
    render(ctx, startX, startY)
    {
        this.ctx = ctx;
        const initialFontSize = parseFontSize(this.ctx.font);
        const updateTheseDimensions = this.getDimensions();
        let xOffset = 0;
        let descent = 1;
        let ascent = 1;

        let ret = this.ctx.measureText(String(this.string));
        this.ctx.fillText(String(this.string), startX, startY);
        xOffset+=ret.width;
        descent+=ret.fontBoundingBoxDescent;
        ascent+=ret.fontBoundingBoxAscent;
        /*for (let i=0; i<this.string.length; i++)
        {
            const c = this.string[i];
            const con = this.globalData.containerMap.get(c);
            if (con != null)
            {
                let ret = con.render(this.ctx, startX+xOffset, startY);
                //console.log(con);
                xOffset += ret.width;
                descent = Math.max(descent, ret.descent);
                ascent = Math.max(ascent, ret.ascent);
            } else {
                let m = this.ctx.measureText(c);
                this.ctx.fillText(c, startX + xOffset, startY);
                xOffset += m.width;
            }
        }*/

        if (this.subscriptContainer != null)
        {
            this.ctx.font = Math.round(initialFontSize*fontSizeSubscriptMultiplier) + "px" + fontType;
            this.subscriptContainer.render(this.ctx, startX+xOffset, startY+5+descent);
            this.ctx.font = initialFontSize + "px" + fontType;
        }
        if (this.superscriptContainer != null)
        {
            this.ctx.font = Math.round(initialFontSize*fontSizeSubscriptMultiplier) + "px" + fontType;
            this.superscriptContainer.render(this.ctx, startX+xOffset, startY-5-ascent);
            this.ctx.font = initialFontSize + "px" + fontType;
        }
        return this.getDimensions();
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
//var containerMap = new Map();
//var subContainerOn = 1;
//var definitionMap = new Map();


function onTextInputChange()
{
    //containerMap = new Map();
    //subContainerOn = 1;

    ctx.fillStyle = "white";
    ctx.fillRect(0,0,Math.round(canvasElement.width), Math.round(canvasElement.height));
    ctx.fillStyle = "black";
    ctx.strokeStyle = "black";
    ctx.font = fontSize + "px" + fontType;

    let string = textInputElement.value;
    let con= new Container(ctx, string);
    let dim = con.getDimensions();
    let ret = con.render(ctx, 2,dim.ascent+2);
    console.log(ret);

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


//test();

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