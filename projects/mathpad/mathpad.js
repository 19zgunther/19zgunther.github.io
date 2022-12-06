

//For Row Reduction
{
    const matrixGridElement = document.getElementById('matrixGrid');
    const matrixNumColumnsElement = document.getElementById('matrixNumColumns');
    const matrixNumRowsElement = document.getElementById('matrixNumRows');

    const rowReducedMatrixGridElement = document.getElementById('rowReducedMatrix');




    var numC = Number(matrixNumColumnsElement.value);
    var numR = Number(matrixNumRowsElement.value);
    var mat = [[0]]; // in  form   mat[row#][column#]
    var rrmat = [[0]];


    setup();

    function setup() {
        makeMatrix();
    }

    function makeMatrix()
    {
        numC = Number(matrixNumColumnsElement.value);
        numR = Number(matrixNumRowsElement.value);
        let html = ""
        for (var r=0; r <numR; r++)
        {   
            html += "<div style='display: flex;'>";
            for (var c=0; c<numC; c++)
            {
                html += "<input class='matrixInput' id=\'c" + c + "r" + r + "\' type='number' value='0' style='width:3vmax' onchange=buildMatrixArrays()></input> "
            }
            html += "</div>";
        }
        matrixGridElement.innerHTML = html;
        buildMatrixArrays();
    }

    function buildMatrixArrays()
    {
        mat = [];
        for (var r=0; r<numR; r++)
        {
            let row = []
            for (var c=0; c<numC; c++)
            {
                let val = Number(document.getElementById('c' + c + 'r' + r).value);
                row.push(val);
            }
            mat.push(row);
        }
        //console.log(mat);
        rowReduce();
    }

    function rowReduce()
    {
        rrmat = copyMatrix(mat);
        for (var c=0; c<numC; c++)
        {
            for (var r=numR-1; r>c; r--)
            {
                if (rrmat[r][c] != 0)
                {
                    //x * mat[c][c] = mat[r][c]
                    let multiplier = rrmat[r][c] / rrmat[c][c];

                    for (var c2=c; c2<numC; c2++)
                    {
                        rrmat[r][c2] -= rrmat[c][c2] * multiplier;
                    }
                }
            }
        }
        displayRowReducedMatrix();
    }

    function displayRowReducedMatrix()
    {
        let html = ""
        for (var r=0; r <numR; r++)
        {   
            html += "<div style='display: flex;'>";
            for (var c=0; c<numC; c++)
            {
                html += "<div class='matrixOutput' type='number' value='0' style='height: fit-content; width:3vmax; text-align:center;' onchange=buildMatrixArrays()>"+rrmat[r][c]+"</div> "
            }
            html += "</div>";
        }
        rowReducedMatrixGridElement.innerHTML = html;
    }

    function copyMatrix(mat)
    {
        let cpy = [];
        for (var i=0; i<mat.length; i++)
        {
            let row = [];
            for (var j=0; j<mat[i].length; j++)
            {
                row.push(mat[i][j]);
            }
            cpy.push(row);
        }
        return cpy;
    }

}


//For determinant
{
    makeMatrix();
    function makeMatrix()
    {

        numC = 3;  // Number(matrixNumColumnsElement.value);
        numR = 3;  // Number(matrixNumRowsElement.value);
        let html = ""
        for (var r=0; r <numR; r++)
        {   
            html += "<div style='display: flex;'>";
            for (var c=0; c<numC; c++)
            {
                html += "<input class='matrixInput' id=\'DET_c" + c + "r" + r + "\' type='number' value='0' style='width:3vmax' onchange=calcDeterminant()></input> "
            }
            html += "</div>";
        }
        document.getElementById('DET_input').innerHTML = html;
    }

    function calcDeterminant()
    {
        let mat = [];
        for (var r=0; r<numR; r++)
        {
            let row = []
            for (var c=0; c<numC; c++)
            {
                let val = Number(document.getElementById('DET_c' + c + 'r' + r).value);
                row.push(val);
            }
            mat.push(row);
        }   
        console.log(mat);

        let d1 = (mat[1][1]*mat[2][2] - mat[1][2]*mat[2][1]);
        let d2 = (mat[1][0]*mat[2][2] - mat[1][2]*mat[2][0]);
        let d3 = (mat[1][0]*mat[2][1] - mat[1][1]*mat[2][0]);

        console.log(d1,d2,d3);
        
        let ans = mat[0][0]*d1 + (-mat[0][1]*d2) + mat[0][2]*d3;
        //let ans = mat[0][0]*(mat[1][1]*mat[2][2] - mat[1][2]*mat[2][1])  -  mat[0][1]*(mat[1][0]*mat[2][2] - mat[1][2]*mat[2][0])  +  mat[0][2]*(mat[1][0]*mat[2][1] - mat[1][1]*mat[2][0]);
        
        document.getElementById('DET_output').innerHTML = ans;
    }

}


//for plotter
{

    const seriesInputsContainerElement = document.getElementById('seriesInputs');
    const numSeriesElement = document.getElementById('numSeriesInput');
    const canvasElement = document.getElementById('plotterCanvas');

    const colors = [
        '#ff0000',
        '#00ff00',
        '#0000ff',
        '#aa1111',
        '#11aa11',
        '#1111aa',
        '#aaaa11',
        '#aa11aa',
        '#11aaaa',
    ];

    var numSeries = 0;

    numSeriesChanged();

    function numSeriesChanged()
    {
        let ns = Number(numSeriesElement.value);
        if (ns >= numSeries)
        {
            let out = ""
            for (var i=numSeries; i<ns; i++)
            {
                out += "<br><input id='sx"+i+"' type='text' onchange=updateCanvas()  style='width:50%;color:rgb(0,0,0);'>X"+i+" Series</input><br>";
                out += "<input id='sy"+i+"' type='text' onchange=updateCanvas()  style='width:50%;color:rgb(0,0,0);'>Y"+i+" Series</input><br>";
            }
            seriesInputsContainerElement.innerHTML += out;
        } else {
            let out = ""
            for (var i=0; i<ns; i++)
            {
                out += "<br><input id='sx"+i+"' type='text' onchange=updateCanvas()  style='width:50%;color:rgb(0,0,0);'>X"+i+" Series</input><br>";
                out += "<input id='sy"+i+"' type='text'  onchange=updateCanvas()  style='width:50%;color:rgb(0,0,0);'>Y"+i+" Series</input><br>";
            }
            seriesInputsContainerElement.innerHTML = out;
        }
        numSeries = ns;

        updateCanvas();
    }

    function parseSeriesText(seriesNum = 0)
    {
        try {
            let X = (document.getElementById("sx"+seriesNum).value).split(',');
            let Y = (document.getElementById('sy'+seriesNum).value).split(',');

            

            let xout = [];
            let yout = [];
            for (var i=0; i< Math.min(X.length, Y.length); i++ )
            {
                xout.push(Number(X[i]));
                yout.push(Number(Y[i]));
            }
            //console.log(xout, yout);
            return {
                x: xout,
                y: yout,
            };
        } catch {
            console.error("Failed to parse series");
            return {x:[], y:[]};
        }
    }

    function updateCanvas()
    {
        series = [];
        for (var i=0; i<numSeries; i++)
        {
            series.push(parseSeriesText(i));
        }
        //console.log(series);
        //Now we have an array of {x:xseries, y:yseries}

        let minx = 1000000;
        let miny = 1000000;
        let maxx = -1000000;
        let maxy = -1000000;
        //Set all min and max values
        for (var i=0; i<numSeries; i++)
        {
            let x = series[i].x;
            let y = series[i].y;
            for (var j=0; j<x.length; j++)
            {
                minx = Math.min(x[j], minx);
                miny = Math.min(y[j], miny);
                maxx = Math.max(x[j], maxx);
                maxy = Math.max(y[j], maxy);
            }
        }

        let bb = canvasElement.getBoundingClientRect();
        canvasElement.width = bb.width;
        canvasElement.height = bb.height;

        let xScale = bb.width/(maxx - minx);
        let xOffset = minx + 50;

        let yScale = bb.height/(maxy-miny);
        let yOffset = miny - 50;

        xScale *= 0.8;
        yScale *= 0.8;

        const p = new Painter(canvasElement);
        p.Clear('white');

        p.DrawLine(50, bb.height-50, 50, 0, 'black');
        p.DrawLine(50, bb.height-50, bb.width, bb.height-50, 'black');

        
        let xDivScale = Math.round((bb.width-50)/10);


        for (var i=0; i<numSeries; i++)
        {
            let x = series[i].x;
            let y = series[i].y;
            for (var j=0; j<x.length; j++)
            {
                p.DrawCircleFilled(x[j]*xScale + xOffset, bb.height - y[j]*yScale + yOffset, 5, colors[i]);
                if (j > 0)
                {
                    p.DrawLine(x[j]*xScale + xOffset, bb.height - y[j]*yScale + yOffset, x[j-1]*xScale + xOffset, bb.height - y[j-1]*yScale + yOffset, colors[i])
                }
            }   
        }


        let val = minx;
        let dval = (maxx-minx)/10;
        for (var i=0; i<20; i++)
        {
            p.DrawTextCentered(val*xScale + xOffset, bb.height-30, String( Math.round(val*4)/4 ) );
            val += dval;
        }

        val = miny;
        dval = (maxy-miny)/10;
        for (var i=0; i<20; i++)
        {
            p.DrawTextRight(40, bb.height-val*yScale + yOffset, String( Math.round(val*4)/4 ) );
            val += dval;
        }



    }
}