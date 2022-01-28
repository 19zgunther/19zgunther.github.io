



const canvasElement = document.getElementById('myCanvas');
const equationTextboxElement = document.getElementById('equationTextbox');

//const yScalarSliderElement = document.getElementById('yScalarSlider');
//const xScalarSliderElement = document.getElementById('xScalarSlider');




var updateInterval;
var p;

var yScalar = -500;
var yOffset = 600 - 300;
var xScalar = 0.06;
var xOffset = 50;


setup();
function setup()
{
    equationTextboxElement.value = '-980/(3030 + x)';
    updateInterval = setInterval(Update, 1000);
    p = new Painter(canvasElement);
}

function updateSettings()
{
    var temp = Number(document.getElementById('yScalarSlider').value);
    if (isNaN(temp)==false && temp != null)
    {
        yScalar = temp;
    }
    temp = Number(document.getElementById('xScalarSlider').value);
    if (isNaN(temp)==false && temp != null)
    {
        xScalar = temp;
    }
    temp = Number(document.getElementById('yOffsetSlider').value);
    if (isNaN(temp)==false && temp != null)
    {
        yOffset = temp;
    }
    temp = Number(document.getElementById('xOffsetSlider').value);
    if (isNaN(temp)==false && temp != null)
    {
        xOffset = temp;
        document.getElementById('xOffset')
    }
}


function Update()
{ 
    p.Clear('white');
    p.SetStrokeWidth(2);

    //computeEquation2(equationTextboxElement.value, 10.0);
    
    var height = 600;
    var width = 600;

    var minXVal = 0;
    var maxXVal = 10000;

    var pr = 0; //previos result
    var pi = 0;  //precious i

    p.DrawLine(0, yOffset, width, yOffset);

    for (var i=minXVal; i<=maxXVal; i+= 1)
    {

        var x = Math.pow(10,i/2000);

        var result = computeEquation2(equationTextboxElement.value, x);
        if (result == null || isNaN(result))
        {
            //console.error("failed to compute equation on x = " + i + "  result = " + result);
            //break;
            continue;
        }

        if (i%2000 == 0)
        {
            console.log(i);
            p.DrawLine(i*xScalar+xOffset, height, i*xScalar+xOffset, 0,'black');
            p.DrawText(i*xScalar+xOffset+2, height/2 +20, '10', 'black' );
            p.DrawText(i*xScalar+xOffset+10, height/2 + 10, (i/2000).toPrecision(1), 'black' );
        }


        p.DrawLine(pi*xScalar + xOffset, pr*yScalar + yOffset, i*xScalar + xOffset, result*yScalar + yOffset, 'red');
        pr = result;
        pi = i;
    }

    //var result = computeEquation(topTextboxElement.value, bottomTextboxElement.value, xval);
}


//Get substring of string excluding stard and end indexes
function getSubstringExclusive(string, startI, endI)
{
    var out = "";
    for (var i=startI+1; i<endI; i++)
    {
        out += string[i];
    }
    return out;
}

//Get substring of string excluding stard and end indexes
function getSubstringInclusive(string, startI, endI)
{
    var out = "";
    for (var i=startI; i<=endI; i++)
    {
        out += string[i];
    }
    return out;
}

//insert/replace substring in text, removing all chars in text between startI and endI inclusive, and replacing them with subString
function replaceSubstringInclusive(text, subString, startI,endI)
{
    var texti = 0;
    var out = "";
    while(texti < text.length)
    {
        if (texti < startI)
        {
            out += text[texti];
        }

        if (texti == startI)
        {
            out += subString;
        }

        if (texti > endI)
        {
            out += text[texti];
        }
        texti += 1;
    }
    return out;
}


function replaceSubstringWithSubstring(text, ss, newss)
{
    if (ss == newss)
    {
        console.error("replaceSubstringWithSubstring. ss == newss");
        return;
    }
    var i=0;
    var lenOfss = ss.length;
    var changed = false;
    while(i < text.length)
    {
        
        if (  getSubstringInclusive(text, i, i+lenOfss-1) == ss )
        {
            text = replaceSubstringInclusive(text, newss, i, i+lenOfss-1);
            changed = true;
        }

        i++;
    }
    if (changed == true)
    {
        return replaceSubstringWithSubstring(text, ss, newss);
    }
    return text;
}



function computeEquation2(text, xval)
{

    text = '0+'+text;
    text = replaceSubstringWithSubstring(text, ' ', '');
    //text = replaceSubstringWithSubstring(text, 'x', xval);

    text = replaceSubstringWithSubstring(text, '+-', '-');
    text = replaceSubstringWithSubstring(text, '--', '+');
    text = replaceSubstringWithSubstring(text, '++', '+');
    text = replaceSubstringWithSubstring(text, 'pi', 'π');
    text = replaceSubstringWithSubstring(text, 'Pi', 'π');
    text = replaceSubstringWithSubstring(text, 'PI', 'π');

    var dict = {};
    dict['x'] = Number(xval);
    dict['e'] = Math.e;
    dict['π'] = Math.PI;
    var dictIndex = 65;


    //We'll start by parsing all numbers out of the text, and putting them into a dictionary.
    var numS = -1; //current number start & end
    var numE = -1;

    var newEq = "";
    for (var i=0; i<text.length; i++)
    {
        var n = Number(text[i]);
        var c = text[i];
        if ((isNaN(n) == false && n != null ) || c == '.') 
        {
            //It is a number!
            if (numS == -1)
            {
                numS = i;
                numE = i;
            } else {
                numE = i;
            }
        } else {
            //it is not a number..
            
            if (numS != -1 && (c != 'x' && c != 'e' && c != 'π'))
            {
                var numberParsed = Number(getSubstringInclusive(text, numS, numE));
                if (isNaN(numberParsed) || numberParsed == null)
                {
                    console.error("Error parsing in computeEquation2.");
                    return;
                }
                var charV = String.fromCharCode(dictIndex);
                dictIndex += 1;

                //Store value in dict
                dict[charV] = numberParsed;
                newEq += charV; //add charV to newEquation
                numS = -1;
                numE = -1;
            }
            newEq += c;
        }
    }

    if (numE == text.length-1)
    {
        var numberParsed = Number(getSubstringInclusive(text, numS, numE));
        if (isNaN(numberParsed) || numberParsed == null)
        {
            console.error("Error parsing in computeEquation2.");
            return;
        }
        var charV = String.fromCharCode(dictIndex);
        dictIndex += 1;

        //Store value in dict
        dict[charV] = numberParsed;
        newEq += charV; //add charV to newEquation
        numS = -1;
        numE = -1;
    }

    //console.log("Calling compute2 on: " + newEq);
    var res = compute2(newEq, dict, dictIndex);
    if (res.length == 1)
    {
        //console.log(dict[res]);
        return dict[res];
    } else {
        console.error("Compute2 returned: "+ res);
    }
}

function compute2(text, dict, dictIndex)
{
    //PEMDAS
    //Reduce all parentheses
    var sp = -1;
    var ep = -1;
    var c;
    for (var i=0; i<text.length; i++)
    {
        c = text[i];
        if (c=='(')
        {
            sp = i;
            ep = -1;
        }
        if (c ==')' || (sp != -1 && i == text.length - 1))
        {
            if (c == ')')
            {
                ep = i;
            } else {
                ep = i+1;
            }

            if (sp =='-1')
            {
                console.error("error parsing (). Equation: " + text);
                return;
            }
            var E = compute2(getSubstringExclusive(text, sp, ep), dict, dictIndex);
            var result = dict[E];
            if (result == null || isNaN(result))
            {
                console.error('error parsing(). Computing inside () returned null or NaN.');
                return;
            }
            //Alrighty, at this point we have computed what was inside the parentheses, and it gave us the number "result"
            var charV = String.fromCharCode(dictIndex);
            dictIndex += 1;
            dict[charV] = result;
            text = replaceSubstringInclusive(text, charV, sp, ep);
            i = 0;
            sp = -1;
            ep = -1;
        }
    }


    //We've gotten rid of all of those pesky parentheses at this point.
    for (var i=0; i<text.length; i++)
    {
        if (text[i] == '^')
        {
            dict[text[i-1]] = Math.pow( dict[text[i-1]], dict[text[i+1]]);
            text = replaceSubstringInclusive( text, '', i, i+1 );
            //console.log("^ - " + text);
            i=0;
        }
    }


    //Simplify multiply and divide!
    for (var i=0; i<text.length; i++)
    {
        c = text[i];
        if (text[i] == '*')
        {
            dict[text[i-1]] = dict[text[i-1]] * dict[text[i+1]];
            text = replaceSubstringInclusive( text, '', i, i+1 );
            //console.log("* - " + text);
            i=0;
        }
        if (text[i] == '/')
        {
            dict[text[i-1]] = dict[text[i-1]] / dict[text[i+1]];
            text = replaceSubstringInclusive( text, '', i, i+1 );
            //console.log("/ - " + text);
            i=0;
        }
    }

    //Down to + & - ... do it!
    for (var i=0; i<text.length; i++)
    {
        c = text[i];
        if (text[i] == '+')
        {
            dict[text[i-1]] = dict[text[i-1]] + dict[text[i+1]];
            text = replaceSubstringInclusive( text, '', i, i+1 );
            //console.log("+ - " + text);
            i=0;
        }
        if (text[i] == '-')
        {
            dict[text[i-1]] = dict[text[i-1]] - dict[text[i+1]];
            text = replaceSubstringInclusive( text, '', i, i+1 );
            //console.log("- - " + text);
            i=0;
        }
    }

    //console.log(text);
    return text;
}



//OLD & UNUSED
function computeEquation(text, xval)
{
    var value = 0;
    text = replaceSubstringWithSubstring(text, ' ', '');
    text = replaceSubstringWithSubstring(text, 'x', xval);
    value = Number(compute(text));


    if (isNaN(value) == false && value != null)
    {
        return value;
    } else {
        console.log("Value Returned: "+value);
        return null;
    }
}
function compute(text)
{

    //console.log("Calc '" + text +"', x="+xval);

    //Find inner parenthesis
    var openP = -1;
    var closeP = -1;
    for (var i=0; i<text.length; i++)
    {
        if (text[i] == '(')
        {
            openP = i;
        }
        if (text[i] == ')')
        {
            closeP = i;
            break;
        }
    }
    if (closeP != -1 && openP != -1)
    {
        //console.log("found parenthesis");
        var ss = getSubstringExclusive(text, openP, closeP);
        var val = compute(ss);

        if (val == null) { 
            console.error('compute for finding inner parenthesis failed.');
            return null; 
        }
        text = replaceSubstringInclusive(text, val, openP, closeP);

        //console.log('text after parenthesis:  ' + text);
        return compute(text);
    }


    //Exponents!
    var exp = -1;
    var num1Start = -1;
    var num1End = -1;
    var num2Start = -1;
    var num2End = -1;
    for (var i=0; i<text.length;i++)
    {

        
        if ((isNaN(Number(text[i])) == false && Number(text[i]) != null) || text[i] == '.')
        {
            if (num1Start == -1)
            {
                num1Start = i;
            }
            continue;
        } else if (num1Start != -1)
        {
            num1End = i-1;
            if (text[i] == '^')
            {
                exp = i;
                i += 1;
                num2Start = i;
                while (i<text.length)
                {
                    if ((isNaN(Number(text[i])) == false && Number(text[i]) != null) || text[i] == '.')
                    {
                        //still part of the number...
                    } else {
                        //Number has ended!
                        num2End = i-1;
                        break;
                    }
                    i++;
                }
                break;
            } else {
                num1Start = -1;
            }
        }
    }
    if (num2End == -1)
    {
        num2End = text.length-1;
    }

    if (exp != -1)
    {
        var n1 = Number(getSubstringInclusive(text, num1Start, num1End));
        var n2 = Number(getSubstringInclusive(text, num2Start, num2End));
        text = replaceSubstringInclusive(text, (Math.pow(n1,n2)).toString(), num1Start, num2End);
        return compute(text);
    }





    //Find multiply & divice
    var num1Start = -1;
    var num1End = -1;
    var num2Start = -1;
    var num2End = -1;
    var textInbetweenNumbers = '';
    for (var i=0; i<text.length; i++)
    {
        var char = text[i];
        if (num1End == -1)
        {
            if (isNaN(Number(char)) == false && Number(char) != null) //if it's a numberic value
            {
                if (num1Start == -1)
                {
                    num1Start = i;
                }
            } else if (num1Start != -1 && char == '.') {
                //that's fine. it's a decimal number
            } else  if (num1Start != -1) { //not a number and not a decimal point
                num1End = i-1;
                i -= 1;
            }
        } else {
            if (num2End == -1)
            {
                if (isNaN(Number(char)) == false && Number(char) != null) //if it's a numberic value
                {
                    if (num2Start == -1)
                    {
                        num2Start = i;
                    }
                    if (i == text.length - 1)
                    {
                        num2End = i;
                        i -= 1;
                    }
                } else if (num2Start != -1 && char == '.') {
                    //that's fine. it's a decimal number
                } else  if (num2Start != -1) { //not a number and not a decimal point
                    num2End = i-1;
                }
            } else {
                //At this point, we have numbers 1 & 2.



                textInbetweenNumbers = getSubstringExclusive(text, num1End, num2Start);
                var n1 = Number(getSubstringInclusive(text, num1Start, num1End));
                var n2 = Number(getSubstringInclusive(text, num2Start, num2End));
                //console.log("n1: " + n1 + "  n2: " + n2 + "  operator: " + textInbetweenNumbers);

                


                var wasAbleToReplace = false;
                if ( (textInbetweenNumbers == '/' || textInbetweenNumbers == '*' || textInbetweenNumbers =='/-' || textInbetweenNumbers == '*-') && 
                    (num1Start-1 < 0 || text[num1Start-1] == '+' || text[num1Start-1] == '-') && 
                    (num2End+1 >= text.length || text[num2End+1] == '+' || text[num2End+1] == '-' || text[num2End+1] == '*' || text[num2End+1] == '/') )
                {
                    if (textInbetweenNumbers == '*')
                    {
                        text = replaceSubstringInclusive(text, (n1*n2).toString(), num1Start, num2End);
                        wasAbleToReplace = true;
                    } else if (textInbetweenNumbers == '/')
                    {
                        text = replaceSubstringInclusive(text, (n1/n2).toString(), num1Start, num2End);
                        wasAbleToReplace = true;
                    } else if (textInbetweenNumbers == '*-')
                    {
                        text = replaceSubstringInclusive(text, (n1* (-n2)).toString(), num1Start, num2End);
                        wasAbleToReplace = true;
                    } else if (textInbetweenNumbers == '/-')
                    {
                        text = replaceSubstringInclusive(text, (n1/(-n2)).toString(), num1Start, num2End);
                        wasAbleToReplace = true;
                    }
                } else if (
                    (textInbetweenNumbers == '+' || textInbetweenNumbers == '-' || textInbetweenNumbers == "+-" || textInbetweenNumbers == '--') && 
                    (num1Start-1 < 0 || text[num1Start-1] == '+' || text[num1Start-1] == '-') && 
                    (num2End+1 >= text.length || text[num2End+1] == '+' || text[num2End+1] == '-')
                )
                {
    
                    if (textInbetweenNumbers == '+')
                    {
                        text = replaceSubstringInclusive(text, (n1+n2).toString(), num1Start, num2End);
                        wasAbleToReplace = true;
                    } else if (textInbetweenNumbers == '-')
                    {
                        text = replaceSubstringInclusive(text, (n1-n2).toString(), num1Start, num2End);
                        wasAbleToReplace = true;
                    } else if (textInbetweenNumbers == "+-")
                    {
                        text = replaceSubstringInclusive(text, (n1+(-n2)).toString(), num1Start, num2End);
                        wasAbleToReplace = true;
                    } else if (textInbetweenNumbers == '--')
                    {
                        text = replaceSubstringInclusive(text, (n1+n2).toString(), num1Start, num2End);
                        wasAbleToReplace = true;
                    } else {
                        console.log(textInbetweenNumbers);
                    }
                }

                text = replaceSubstringWithSubstring(text, '+-', '-');
                text = replaceSubstringWithSubstring(text, '--', '+');

                if (wasAbleToReplace == true)
                {
                   // console.log("Successfully replaced! current text = " + text);
                    
                    return compute(text);
                    //i = -1;
                } else {
                    //console.log("Failed to replace!");

                    if (textInbetweenNumbers != '*' && textInbetweenNumbers != '/' && textInbetweenNumbers != '*-' && textInbetweenNumbers != '/-' &&
                    textInbetweenNumbers != '+' && textInbetweenNumbers != '-' && textInbetweenNumbers != '+-' && textInbetweenNumbers != '--')
                    {
                        console.error("cannot compute. invalid operator: " + textInbetweenNumbers + "  text: " + text);
                        return null;
                    }

                    num1Start = num2Start;
                    num1End = num2End;
                    num2Start = -1;
                    num2End = -1;
                    i -=1;
                }
            }
        }
    }

    //console.log('final string: ' + text);

    return text;

    //console.log("N1: " + n1 + "   N2: " + n2 + "   Operator: " + textInbetweenNumbers);

}
