



class ObjRenderer
{
    constructor(canvasElement, objText, camPos = new vec4(0,0,25), clearColor = new vec4(.1,.1,.1,0.5), reflectivity = 0.5)
    {
        this.canvasElement = canvasElement;
        this.objText = objText;
        this.reflectivity = reflectivity;

        let bb = this.canvasElement.getBoundingClientRect();
        this.canvasElement.width = Math.round(bb.width);
        this.canvasElement.height = Math.round(bb.height);
        this.easyGl = new EasyGL(this.canvasElement, clearColor);
        this.id = "ID"+String(Math.random());

        this.easyGl.setPerspective(null, canvasElement.width/canvasElement.height);
        this.easyGl.enableRenderingReverseFaces(true);
        this.easyGl.setCameraPosition(camPos);

        this.mouseIsDown = false;

        this._parseObject(this.objText);
    }
    setPerspective(FOV, aspectRatio, zNear, zFar)
    {
        this.easyGl.setPerspective(FOV, aspectRatio, zNear, zFar);
    }
    setCameraPosition(x,y,z)
    {
        this.easyGl.setCameraPosition(x,y,z);
    }
    setCameraRotation(x,y,z)
    {
        this.easyGl.setCameraRotation(x,y,z);
    }
    setObjectPosition(x,y,z)
    {
        for (let i=0; i<this.vertices.length; i++)
        {
            this.easyGl.setObjectPosition(this.id+i,x,y,z);
        }
    }
    getObjectPosition()
    {
        return this.easyGl.getObjectPosition(this.id+"0");
    }
    getObjectRotation()
    {
        return this.easyGl.getObjectRotation(this.id+"0");
    }
    setObjectRotation(x,y,z)
    {
        for (let i=0; i<this.vertices.length; i++)
        {
            this.easyGl.setObjectRotation(this.id+i,x,y,z);
        }
    }
    _parseObject(text)
    {
        const lines = text.split("\n");
        lines.push("g end");

        let vs = [];
        let is = [];
        let ns = [];
        let cs = [];

        let vertices =  [];//[new vec4(1,0,0,), new vec4(0,1,0,), new vec4(-1,0,0)];
        let indices = [];//[0,1,2];
        let normals = [];//[new vec4(1,1,1), new vec4(1,1,1), new vec4(1,1,1)];
        let colors = [];//[new vec4(1,0,0,1), new vec4(1,0,0,1), new vec4(1,0,0,1),];
        let indOffset = 1;
        let color = new vec4(Math.random(), Math.random(), Math.random(), 1);
        let ret;
        const colorMap = new Map();
        for (let i=0; i<Math.min(lines.length, 1000000); i++)
        {
            const L = lines[i];
            if (L[0] == "v" && L[1] != "n")
            {
                let v = this._parseVertice(L);
                vertices.push(v);
                colors.push(color)
            } else if (L[0] == "v" && L[1] == "n") {
                normals.push(this._parseVertice(L).scaleToUnit());
            } else if (L[0] == "f") {
                ret = this._parseIndices(L);
                indices.push(ret[0]-indOffset, ret[1]-indOffset, ret[2]-indOffset);
            } else if (L[0] == "g" && L[1] == " ")
            {
                color = colorMap.get(L); 
                if (color == null)
                {
                    color = new vec4(Math.random(), Math.random(), Math.random(), 1);
                    colorMap.set(L, color);
                }

                if (vertices.length > 3)// && L[2] == "7" && L[3] == "7")
                {
                    vs.push(vertices);
                    is.push(indices);
                    ns.push(normals);
                    cs.push(colors);
                }
                indOffset += vertices.length;
                vertices = [];
                indices = [];
                normals = [];
                colors = [];
            }
        }

        for (let i=0; i<vs.length; i++)
        {
            this.easyGl.createObject(this.id+i, new vec4(), new vec4(), new vec4(1,1,1), vs[i], is[i], ns[i], cs[i], false, this.reflectivity);
        }
        this.vertices = vs;
        this.indices = is;
        this.normals = ns;
        this.colors = cs;
    }
    _parseVertice(line, multiplier = 100)
    {
        let numbers = this._getNumbersFromString(line);
        return new vec4(numbers[0]*multiplier, numbers[1]*multiplier, numbers[2]*multiplier);
    }
    _parseIndices(line)
    {
        let numbers = this._getNumbersFromString(line);
        return [numbers[0], numbers[2], numbers[4]];
    }
    _getNumbersFromString(string)
    {
        string += "  ";
        let currentNumber = "";
        let numbers = [];
        for (let i=0; i<string.length; i++)
        {
            const c = string[i];
            const charCode = string.charCodeAt(i);
            if (c == "e" || c == "-" || c == "." || (charCode >= 48 && charCode <= 57))
            {
                currentNumber += c;
            } else if (currentNumber != "") {
                numbers.push(Number(currentNumber));
                currentNumber = "";
            }
        }
        return numbers;
    }
    render()
    {
        for (let i=0; i<this.vertices.length; i++)
        {
            this.easyGl.renderObject(this.id+i);
        }
    }
    resize()
    {
        this.easyGl.setPerspective(null, this.canvasElement.width/this.anvasElement.height);
    }
    eventListener(event)
    {
        if (event.type == "mousedown")
        {
            this.mouseIsDown = true;
        } else if (event.type == "mouseup")
        {
            this.mouseIsDown = false;
        } else if (event.type == "mousemove" && this.mouseIsDown)
        {
            let dx = event.movementX;
            let dy = event.movementY;
            objRenderer.setObjectRotation( objRenderer.getObjectRotation().add(0, dx/100, dy/100));
            //console.log(dx, dy);
        }
    }
}


const canvasElement = document.getElementById("mainCanvas");
canvasElement.addEventListener("mousedown", eventListener);
canvasElement.addEventListener("mouseup", eventListener);
canvasElement.addEventListener("mousemove", eventListener);

var objRenderer = new ObjRenderer(canvasElement, objDataText, new vec4(0,0,30));
objRenderer.setObjectRotation(new vec4(0,0,-1.55));

let updateInterval = setInterval(render, 60);

function render()
{
    objRenderer.render();
    objRenderer.setObjectRotation( objRenderer.getObjectRotation().add(0.00, 0.01, 0));
}

function eventListener(e)
{
    //console.log(e);
    objRenderer.eventListener(e);
}

/*
let bb = canvasElement.getBoundingClientRect();
canvasElement.width = Math.round(bb.width); canvasElement.height = Math.round(bb.height);
const easyGl = new EasyGL(canvasElement, new vec4(0,.1,0,0.5));

easyGl.setPerspective(null, canvasElement.width/canvasElement.height);
easyGl.enableRenderingReverseFaces(true);
easyGl.setCameraPosition(0,0,25);
//easyGl.createObject("myObj");


const lines = objDataText.split("\n");
lines.push("g end");

let vs = [];
let is = [];
let ns = [];
let cs = [];

let vertices =  [];//[new vec4(1,0,0,), new vec4(0,1,0,), new vec4(-1,0,0)];
let indices = [];//[0,1,2];
let normals = [];//[new vec4(1,1,1), new vec4(1,1,1), new vec4(1,1,1)];
let colors = [];//[new vec4(1,0,0,1), new vec4(1,0,0,1), new vec4(1,0,0,1),];
let indOffset = 1;
let color = new vec4(Math.random(), Math.random(), Math.random(), 1);
for (let i=0; i<Math.min(lines.length, 1000000); i++)
{
    const L = lines[i];
    if (L[0] == "v" && L[1] != "n")
    {
        let v = parseVertice(L);
        vertices.push(v);
        colors.push(color)
    } else if (L[0] == "v" && L[1] == "n") {
        normals.push(parseVertice(L).scaleToUnit());
    } else if (L[0] == "f") {
        ret = parseIndices(L);
        indices.push(ret[0]-indOffset, ret[1]-indOffset, ret[2]-indOffset);
    } else if (L[0] == "g" && L[1] == " ")
    {
        color = new vec4(Math.random(), Math.random(), Math.random(), 1);
        if (vertices.length > 3)// && L[2] == "7" && L[3] == "7")
        {
            vs.push(vertices);
            is.push(indices);
            ns.push(normals);
            cs.push(colors);
        }
        indOffset += vertices.length;
        vertices = [];
        indices = [];
        normals = [];
        colors = [];
        console.log("new obj: " + L);
    }
}

for (let i=0; i<vs.length; i++)
{
    easyGl.createObject("myObj"+i, new vec4(), new vec4(), new vec4(1,1,1), vs[i], is[i], ns[i], cs[i]);
    console.log(easyGl.getObjectData("myObj"+i));
}

//OBJ_PCB_GuitarPedal_071022.obj

//render();
let updateInterval = setInterval(render, 70);
function render()
{
    easyGl.setCameraPosition(new vec4(0,0,25));

    easyGl.clear();
    easyGl.renderAll();

    for (let i=0; i<vs.length; i++)
    {
        easyGl.setObjectRotation("myObj"+i, easyGl.getObjectRotation("myObj"+i).add(0.01,0.05,0.02) );
    }
}
function resize()
{
    easyGl.setPerspective(null, canvasElement.width/canvasElement.height);
}


function parseVertice(line, multiplier = 100)
{
    let numbers = getNumbersFromString(line);
    return new vec4(numbers[0]*multiplier, numbers[1]*multiplier, numbers[2]*multiplier);
}
function parseIndices(line)
{
    let numbers = getNumbersFromString(line);
    return [numbers[0], numbers[2], numbers[4]];
}
function getNumbersFromString(string)
{
    string += "  ";
    let currentNumber = "";
    let numbers = [];
    for (let i=0; i<string.length; i++)
    {
        const c = string[i];
        const charCode = string.charCodeAt(i);
        if (c == "e" || c == "-" || c == "." || (charCode >= 48 && charCode <= 57))
        {
            currentNumber += c;
        } else if (currentNumber != "") {
            numbers.push(Number(currentNumber));
            currentNumber = "";
        }
    }
    return numbers;
}





*/


console.log(Dofbot());
function test()
{
    const size = 20;
    const step = 0.5;
    const maxDepth = 1;
    const speed = 3;
    let string = "";
    for (let x=0; x<size; x+=step)
    {
        for (let z=0; z<size;z+=step)
        {
            let y = Math.sin((x+z)) -1.3;
            string += speed+" "+x+" "+(Math.round(y*10)/10)+" "+z+" ";
        }
        string += 9+" "+x+" "+10+" "+size+" ";
        string += 9+" "+x+" "+10+" "+0+" ";
        string += 9+" "+(x+1)+" "+10+" "+0+" ";
    }
    console.log(string);
}
function test1()
{
    const size = 20;
    const step = 0.5;
    const maxDepth = 1;
    const speed = 3;
    let string = "";
    /*for (let x=0; x<size; x+=step)
    {
        for (let z=0; z<size;z+=step)
        {
            let y = Math.sin((x+z)) -1.3;
            string += speed+" "+x+" "+(Math.round(y*10)/10)+" "+z+" ";
        }
        string += 9+" "+x+" "+10+" "+size+" ";
        string += 9+" "+x+" "+10+" "+0+" ";
        string += 9+" "+(x+1)+" "+10+" "+0+" ";
    }*/
    let y = "-0.5";
    string += "9 0 0 0 ";
    string += toCode(speed, 0, y, 0);
    for (let x = 0; x<10; x++)
    {
        let z = Math.sin(x);
        string += toCode(speed, x, y, z);
    }
    string += toCode(9, 9, 0, Math.sin(9));
    string += toCode(9, 0, 0, 0);
    string += toCode(speed, 0, y, 2);

    for (let x = 0; x<10; x++)
    {
        let z = Math.sin(x);
        string += toCode(speed, x, y, z+2);
    }
    string += toCode(9, 9, 0, Math.sin(9)+2);
    string += toCode(9, 0, 0, 0);
    console.log(string);

    const ins = string.split(" ");

    const cnvs = document.createElement("canvas");
    document.body.appendChild(cnvs);
    const w = 500;
    const h = 500;
    const sx = 10;
    const sy = 10;
    cnvs.style.width = w+"px";
    cnvs.style.height = h+"px";
    cnvs.setAttribute("style", "width: "+w+"px; height: "+h+"px;");
    cnvs.width = w;
    cnvs.height = h;

    const ctx = cnvs.getContext('2d');

    ctx.beginPath();
    ctx.strokeStyle="red";
    ctx.moveTo(0,0);
    ctx.lineTo(sx*10,sy*10);
    for (let i=0; i<ins.length; i+=4)
    {
        let x = Number(ins[i+1])+sx;
        let z = Number(ins[i+3])+sy;
        let y = Number(ins[i+2]);
        if (y < 0)
        {
            ctx.strokeStyle = "red";
            ctx.lineTo(x*10, z*10);
            ctx.stroke();
        }
    }
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(sx*10,sy*10);
    for (let i=0; i<ins.length; i+=4)
    {
        let x = Number(ins[i+1])+sx;
        let z = Number(ins[i+3])+sy;
        let y = Number(ins[i+2]);
        if (y >= 0)
        {
            ctx.strokeStyle = "blue";
            ctx.lineTo(x*10, z*10);
            ctx.stroke();
        }
    }
    ctx.closePath();
    ctx.stroke();



}


function toCode(speed,x,y,z)
{
    return speed + " " + Number(x).toFixed(2) + " " + Number(y).toFixed(2) + " " + Number(z).toFixed(2) + " ";
}

function Dofbot(q1=0,q2=0,q3=0,q4=0,q5=0.1)
{
    //note: vector and matrix implementations were custom made.
    //define PI for shorthand use
    const pi = 3.1415926535;

    //first, convert all joint angles from degrees to radians
    q1 = pi*q1/180;
    q2 = pi*q2/180;
    q3 = pi*q3/180;
    q4 = pi*q4/180;
    q5 = pi*q5/180;

    //define segment lengths
    const l0 = 61;
    const l1 = 43.5;
    const l2 = 82.85;
    const l3 = 82.85;
    const l4 = 73.85;
    const l5 = 54.57;
    
    //construct joint offset/position vectors
    const p01 = new vec4(0,0,l0+l1);
    const p12 = new vec4(0,0,0);
    const p23 = new vec4(l2,0,0);
    const p34 = new vec4(0,0,-l3);
    const p45 = new vec4(0,0,0);
    const p5T = new vec4(-l4-l5,0,0);

    //create rotation matrices (standard 4x4 matrixes)
    //see https://en.wikipedia.org/wiki/Rotation_matrix under "3 dimensions", "basic rotations" for details
    const r01 = new mat4().makeRotationZ(q1);
    const r12 = new mat4().makeRotationY(-q2);
    const r23 = new mat4().makeRotationY(-q3);
    const r34 = new mat4().makeRotationY(-q4);
    const r45 = new mat4().makeRotationX(-q5);

    //find p0T by multiplying out, and find r0T by multiplying out
    // p0T = p01 + r01(p12 + r12(p23 + r23(p34 + r34(p45 + r45*p5T))))
    const p0T = p01.add(r01.mul(p12.add(r12.mul(p23.add(r23.mul(p34.add(r34.mul(p45.add(r45.mul(p5T))))))))));

    // r0T = r01 * r12 * r23 * r34 * r45
    const r0T = r01.mul(r12.mul(r23.mul(r34.mul(r45))));

    //log results to console
    console.log("p0T:\n"+p0T.toString(0.01) + "\n\nr0T:\n" + r0T.toString(2));

    //return object containing p0T and r0T
    return {p0T: p0T, r0T:r0T};
}