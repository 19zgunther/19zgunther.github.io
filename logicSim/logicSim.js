


var equationElement = document.getElementById("EquationInput");
var canvasElement = document.getElementById("Canvas");
var selected = false;


/*
function EquationElementClicked(){
    selected = true;
}

document.addEventListener("keydown", event => {
    if (event.key == "Escape")
    {
        selected = false;
    }



    if (selected == true)
    {
        if (event.key == "Backspace")
        {
            var s = equationElement.innerHTML;
            equationElement.innerHTML = s.slice(0,-1);
        } else if (event.key == "Shift")
        {

        } else if (event.key == "Enter")
        {
            equationElement.innerHTML += "<br>"
        }
        else {
            equationElement.innerHTML += event.key;
        }
    }
});

document.addEventListener("keyup", event => {

});

*/

function setup() {
    //Create a new canvas
    //canvas = createCanvas(100, 100);
    //canvas.parent('Canvas');
    //line(0,0,100,100);
    
}



class Equation {
    constructor(doc, element) {
        this.parentDocument = doc;
        this.parentElement = element;
        this.canvas = null;
        this.selected = true;
        this.string = "12";
        this.val = 0;
        this.sketchString = p =>{
            p.setup = function() {
                this.canvas = p.createCanvas(100,100);
                this.canvas.parent(element);
            };
            p.Update = function() {
                p.line(100,0,0,100)
                var str = "";
                for(var i=0; i < str.length; i++)
                {
                    p.line(0,0,100,i*5);
                }
                p.textSize(32);
                p.text(str, 10, 30);
            };
        };
        this.sketch = new p5(this.sketchString);
        this.updateInterval = setInterval(this.sketch.Update(),50);
    }
}

var e = new Equation(document, "Canvas");
