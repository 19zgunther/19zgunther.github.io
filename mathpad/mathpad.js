

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