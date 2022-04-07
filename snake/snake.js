


class ML_OLD {
    constructor(columnInfo = [2,3,2]){
        this.columnInfo = columnInfo;
        this.numColmns = columnInfo.length;

        this.weights = [];
        this.nodes = [];

        //initializing weights
        for (var c=0; c<columnInfo.length-1; c++)
        {
            let w = new Array(columnInfo[c]*columnInfo[c+1]);
            for (var i=0; i<columnInfo[c]*columnInfo[c+1]; i++)
            {
                w[i] = Math.random()/2 + 0.25;
            }
            this.weights.push(w);
        }

        //initializing nodes
        for (var c=0; c<columnInfo.length; c++)
        {
            let no = [];//= new Array(columnInfo[c]);
            for (var n=0; n<columnInfo[c]; n++)
            {
                no.push(0);
            }
            this.nodes.push(no);
        }

        console.log(this.nodes);
        console.log(this.weights);
    }

    calc(input = [])
    {
        if (input.length != this.columnInfo[0])
        {
            console.error("ML.calc(input) requires input to be an array. the length must be correct..");
            return;
        }

        //load input into nodes
        for (var i=0; i<this.nodes[0].length; i++)
        {
            this.nodes[0][i] = input[i];
        }

        for (var c=1; c<this.nodes.length; c++)
        {
            console.log("C: "+c);
            let numOfWeights = this.nodes[c-1].length;
            for (var n=0; n<this.nodes[c].length; n++)
            {
                console.log("  N: "+n);
                this.nodes[c][n] = 0;
                for (var w=0; w<numOfWeights; w++)
                {
                    console.log("    W: " +w);
                    this.nodes[c][n] += this.weights[c-1][w + n*numOfWeights] * this.nodes[c-1][w];
                }
            }
        }

        console.log(this.nodes);


    }
}

class ML
{
    constructor(columnInfo = [2,3,2]){
        this.columnInfo = columnInfo;

        this.layers = []; //in form this.columns[layer][node][weight]   or this.columns[layer][column][row]

        for (var i=1; i<columnInfo.length; i++)
        {
            let numNodes = this.columnInfo[i];
            let numWeights = this.columnInfo[i-1];
            let layer = [];
            for (var n=0; n<numNodes; n++)
            {
                let nodeWeights = [];
                for (var w=0; w<numWeights; w++)
                {
                    //nodeWeights.push( Math.random() );
                    nodeWeights.push(0.5);
                }
                layer.push(nodeWeights);
            }
            this.layers.push(layer);
        }
        console.log(this.layers);

    }

    _multiplyLayers(input, layer)
    {
        //takes in matrices in form: mat[node][weight]
        var output = [];
        for (var i=0; i<layer.length; i++)
        {
            let sum = 0;
            for (var j=0; j<layer[i].length; j++)
            {
                sum += input[j]*layer[i][j];
            }
            output.push(sum);
        }
        return output;
    }

    compute(input)
    {
        let temp = input;
        for(var i=0; i<this.layers.length; i++)
        {
            temp = this._multiplyLayers(temp, this.layers[i]);
        }
        return temp;
    }
}







{
    const canvasElement = document.getElementById("snakeCanvas");
    const p = new Painter(canvasElement);
    const ctx = p.ctx;


    let numCells = 10;
    let cellWidth = null //set in setup();
    let width = null; //set in setup()

    let snake = [[4,5]];
    let apple = [6,6];
    let snakeDirection = 'right';
    let playingGame = false;


    setup();

    let timeInterval = 500;
    let updateInterval = setInterval(update, timeInterval);

    function setup() {
        p.Clear('black');
        width = 500;
        canvasElement.width = 500;
        canvasElement.height =  500;

        cellWidth = width/numCells;
        drawGrid();
        moveApple();

        let ml = new ML([2,3,10]);
        let input = [0.5,0.5];
        ml.compute(input);
    }


    function update() {
        if (playingGame == true)
        {
            p.Clear('black');
            drawGrid();

            //Move the snake
            let last_pnt = snake[snake.length-1];
            let removed_pnt = null;
            switch(snakeDirection)
            {
                case "up": 
                    snake.push( [ last_pnt[0], last_pnt[1]-1] );
                    removed_pnt = snake.shift();
                    break;
                case "down":
                    snake.push( [ last_pnt[0], last_pnt[1]+1] );
                    removed_pnt = snake.shift();
                    break;
                case "left":
                    snake.push( [ last_pnt[0]-1, last_pnt[1]] );
                    removed_pnt = snake.shift();
                    break;
                case "right":
                    snake.push( [ last_pnt[0]+1, last_pnt[1]] );
                    removed_pnt = snake.shift();
                    break;
            }

            //check to see if it ate the apple
            last_pnt = snake[snake.length-1];
            if (last_pnt[0] == apple[0] && last_pnt[1] == apple[1])
            {
                snake.unshift(removed_pnt);
                moveApple();
                timeInterval = Math.floor(timeInterval*0.9);
                clearInterval(updateInterval);
                updateInterval = setInterval(update, timeInterval);
            }

            //draw Snake
            for (let i=0; i<snake.length; i++){
                let x = snake[i][0];
                let y = snake[i][1];
                p.DrawRectFilled( x*cellWidth + 3, y*cellWidth + 3, cellWidth-6, cellWidth-6, 'green' );
            }

            //draw apple
            p.DrawRectFilled( apple[0]*cellWidth + 3, apple[1]*cellWidth + 3, cellWidth-6, cellWidth-6, 'red' );


            //check to see if it hit itself or border
            if (checkForSnakeOverlap())
            {
                playingGame = false;
                p.DrawTextCentered(width/2, width/2, "Game Over!\nPress Any Key To Continue.", 'white');
                timeInterval = 500;
                clearInterval(updateInterval);
                updateInterval = setInterval(update, timeInterval);
            }
        } else {

            p.Clear('black');
            drawGrid();

            //draw Snake
            for (let i=0; i<snake.length; i++){
                let x = snake[i][0];
                let y = snake[i][1];
                p.DrawRectFilled( x*cellWidth + 3, y*cellWidth + 3, cellWidth-6, cellWidth-6, 'yellow' );
            }

            if (snake.length != 0)
            {
                snake.shift();
            }

            //draw apple
            p.DrawRectFilled( apple[0]*cellWidth + 3, apple[1]*cellWidth + 3, cellWidth-6, cellWidth-6, 'red' );
            p.DrawTextCentered(width/2, width/2, "Press Any Key To Continue.\nUse WASD or the arrow keys to move", 'white');
        }
    }

    window.onkeydown = function (e) {
        if (playingGame)
        {
            if (e.key == 'w' || e.key == 'W' || e.key == 'ArrowUp')
            {
                snakeDirection = 'up';
            }
            if (e.key == 's' || e.key == 'S' || e.key == 'ArrowDown')
            {
                snakeDirection = 'down';
            }
            if (e.key == 'a' || e.key == 'A' || e.key == 'ArrowLeft')
            {
                snakeDirection = 'left';
            }
            if (e.key == 'd' || e.key == 'D' || e.key == 'ArrowRight')
            {
                snakeDirection = 'right';
            }
        } else {
            playingGame = true;
            snakeDirection = 'right';
            timeInterval = 500;
            clearInterval(updateInterval);
            updateInterval = setInterval(update, timeInterval);
            snake = [[1,1]];
            moveApple();
        }
    }


    function drawGrid()
    {
        for (let i=1; i<numCells; i++)
        {
            p.DrawLine(i*cellWidth,0, i*cellWidth, width, '#444444');
            p.DrawLine(0, i*cellWidth, width, i*cellWidth, '#444444');
        }
    }

    function moveApple()
    {
        apple[0] = Math.max(Math.min(Math.round( Math.random() * numCells ), numCells-1),0);
        apple[1] = Math.max(Math.min(Math.round( Math.random() * numCells ), numCells-1),0);
    }
    function checkForSnakeOverlap()
    {
        for (let i=0; i<snake.length-1; i++)
        {
            if (snake[i][0] == snake[snake.length-1][0] && snake[i][1] == snake[snake.length-1][1])
            {
                return true;
            }
        }
        let i = snake.length-1;
        if (snake[i][0] < 0 || snake[i][0] >= numCells || snake[i][1] < 0 || snake[i][1] >= numCells)
        {
            return true;
        } 
        return false;
    }
}






