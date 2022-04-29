


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
                    nodeWeights.push( Math.random() );
                    //nodeWeights.push(0.5);
                }
                layer.push(nodeWeights);
            }
            this.layers.push(layer);
        }
       // console.log(this.layers);
    }

    getChild(randomModifier = 0.01)
    {
        const ml = new ML(this.columnInfo);
        for (let L=0; L<this.layers.length; L++)
        {
            for (let n=0; n<this.layers[L].length; n++)
            {
                for (let w=0; w<this.layers[L][n].length; w++)
                {
                   // ml.layers[L][n][w] = this.layers[L][n][w];
                   ml.layers[L][n][w] = Math.random()*randomModifier + this.layers[L][n][w] -randomModifier/2;
                }
            }
        }

        //let L = Math.floor(ml.layers.length * Math.random());
        //let n = Math.floor(ml.layers[L].length * Math.random());
        //let w = Math.floor(ml.layers[L][n].length * Math.random());
        //ml.layers[L][n][w] = Math.random()*randomModifier + this.layers[L][n][w] -randomModifier/2;
        return ml;
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
    let currentDirection = 0;

    let ml = null;


    setup();

    let timeInterval = 500;
    let updateInterval = setInterval(updateML, timeInterval);

    function setup() {
        p.Clear('black');
        width = 500;
        canvasElement.width = 500;
        canvasElement.height = 500;

        cellWidth = width/numCells;
        drawGrid();
        moveApple();


        let bestScore = 0;
        let bestMachine = null;
        let columnInfo = [8,10,4];
        let parent = new ML(columnInfo);
        let bestScores = [];




        for (let gen=1; gen<1000; gen++)
        {
            bestScore = 0;
            bestMachine = null;
            for (let i=0; i<1000; i++)
            {
                let ml;
                if (gen == 1 || i < 200)
                {
                    ml = new ML(columnInfo)
                } else {
                    ml = parent.getChild(0.1, i);
                }

                let score = 0;
                for (let run=0; run<10; run++)
                {
                    score += runGame(ml);
                }
                score = score/10;
                if (bestScore < score && score != undefined)
                { 
                    bestScore = score; 
                    bestMachine = ml;
                }
            }

            //if (gen%100 == 0) {}
            console.log(bestScore);
            parent = bestMachine;
            bestScores.push(bestScore);

            if (bestScore > 1000)
            {
                break;
            }
        }

        ml = parent;

        const maxScore = Math.max(...bestScores);
        console.log("best score: "+maxScore);

        const cnvs = document.getElementById('graphCanvas');
        const bb = cnvs.getBoundingClientRect();
        cnvs.width = bb.width;
        cnvs.height = bb.height;
        const p2 = new Painter(cnvs);
        p2.Clear('white');
        for (let i=0; i<bestScores.length; i++)
        {
            p2.DrawLine(i, bb.height, i, bb.height-(bestScores[i]/maxScore)*bb.height, 'red');
        }


        /*for (let L = 0; L < ml.layers.length; L++)
        {
            for (let n=0; n<ml.layers[L].length; n++)
            {

            }
        }*/

        //console.log(bestScore);
        //console.log(bestMachine);

        //let child = bestMachine.getChild();
        //console.log(child);
        //console.log(runGame(child));

        playingGame = true;
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

    function reset()
    {
        snake = [[1,2],];//[4,5]];
        snake[0][0] = Math.floor(Math.random()*numCells*0.5 + 0.25*numCells);
        snake[0][1] = Math.floor(Math.random()*numCells*0.5 + 0.25*numCells);
        apple[0] = Math.floor(Math.random()*numCells*0.5 + 0.25*numCells);
        apple[1] = Math.floor(Math.random()*numCells*0.5 + 0.25*numCells);
    }



    function runGame(ml, numCells = 6)
    {
        
        /*  Inputs are:
        *       Is head.x < apple.x?
                Is head.x > apple.x?
                Is head.y < apple.y?
                Is head.y > apple.y?

            Outputs (4) are: 
                up, right, down, left
        */

        const apple = [Math.floor(Math.random()*numCells*0.5 + 0.25*numCells), Math.floor(Math.random()*numCells*0.5 + 0.25*numCells)];
        const snake = [[Math.floor(Math.random()*numCells*0.5 + 0.25*numCells), Math.floor(Math.random()*numCells*0.5 + 0.25*numCells)], ];

        let currentDirection = 0; //0=up, 1=right, 2=down, 3=left
        let score = 0;
        let scoreMultiplier = 10;

        let head = snake[snake.length-1];
        let tick = 0;
        while( tick<(10+score*10) && tick < 500)
        {
            tick += 1;

            //get ml decision.
            head = snake[snake.length-1];
            let input = [
                //Number( head[0] < apple[0] ),
                //Number( head[0] > apple[0] ),
                //Number( head[1] < apple[1] ),
                //Number( head[1] > apple[1] ),
                //Number( currentDirection == 0),
                //Number( currentDirection == 1),
                //Number( currentDirection == 2),
                //Number( currentDirection == 3),
                1/(head[0]+1), 
                1/(numCells - head[0]),
                1/(head[1]+1), 
                1/(numCells - head[1]),
                Number( head[0] < apple[0] ),
                Number( head[0] == apple[0] ),
                Number( head[1] < apple[1] ),
                Number( head[1] == apple[1] ),
            ];

            if (currentDirection == 0) { input[2] = 1;}
            if (currentDirection == 1) { input[0] = 1;}
            if (currentDirection == 2) { input[3] = 1;}
            if (currentDirection == 3) { input[1] = 1;}

            let output = ml.compute(input);

            //Move snake
            let maxVal = Math.max(...output);
            head = snake[snake.length-1];
            if (maxVal == output[0]) // up
            {
                snake.push( [head[0], head[1]-1] );
                currentDirection = 0;
            } else if (maxVal == output[1]) //right
            {
                snake.push( [head[0]+1, head[1]] );
                currentDirection = 1;
            } else if (maxVal == output[2]) //down
            {
                snake.push( [head[0], head[1]+1] );
                currentDirection = 2;
            } else {//left
                snake.push( [head[0]-1, head[1]] );
                currentDirection = 3;
            }

            //Check if we are on top of apple && move apple if eaten
            if (head[0] == apple[0] && head[1] == apple[1])
            {
                score += 1;
                apple[0] = Math.floor(Math.random()*numCells*0.5 + 0.25*numCells);
                apple[1] = Math.floor(Math.random()*numCells*0.5 + 0.25*numCells);
            } else {
            
            }
            snake.shift();


            //Make sure snake is within borders
            head = snake[snake.length-1];
            if (head[0] < 0 || head[0] >= numCells || head[1]<0 || head[1]>=numCells)
            {
                //return  tick + score*scoreMultiplier;
                return score*scoreMultiplier - tick;
            }

            /*
            //make sure snake is not overlapping
            for (var i=0; i<snake.length-1; i++)
            {
                if (snake[i][0] == head[0] && snake[i][1] == head[1])
                {
                    return tick + score*scoreMultiplier;
                }
            }*/

        }
        //return  score*scoreMultiplier;
        return score*scoreMultiplier - tick;
    }


    function updateML()
    {
        p.Clear('gray');
        //draw Snake
        for (let i=0; i<snake.length; i++){
            let x = snake[i][0];
            let y = snake[i][1];
            p.DrawRectFilled( x*cellWidth + 3, y*cellWidth + 3, cellWidth-6, cellWidth-6, rgbToHex(0,255-(snake.length-i)*10,0) );
        }

        //draw apple
        p.DrawCircleFilled( apple[0]*cellWidth + 3 + cellWidth/2, apple[1]*cellWidth + 3 + cellWidth/2, cellWidth/2-10, 'red' );

        //console.log(snake);
        //get ml decision.
        let head = snake[snake.length-1];
        let input = [
            1/(head[0]+1), 
            1/(numCells - head[0]),
            1/(head[1]+1), 
            1/(numCells - head[1]),
            Number( head[0] < apple[0] ),
            Number( head[0] == apple[0] ),
            Number( head[1] < apple[1] ),
            Number( head[1] == apple[1] ),
        ];
        
        if (currentDirection == 0) { input[2] = 1;}
        if (currentDirection == 1) { input[0] = 1;}
        if (currentDirection == 2) { input[3] = 1;}
        if (currentDirection == 3) { input[1] = 1;}

        let output = ml.compute(input);

        //Move snake
        let maxVal = Math.max(...output);
        head = snake[snake.length-1];
        if (maxVal == output[0]) // up
        {
            snake.push( [head[0], head[1]-1] );
            currentDirection = 0;
        } else if (maxVal == output[1]) //right
        {
            snake.push( [head[0]+1, head[1]] );
            currentDirection = 1;
        } else if (maxVal == output[2]) //down
        {
            snake.push( [head[0], head[1]+1] );
            currentDirection = 2;
        } else {//left
            snake.push( [head[0]-1, head[1]] );
            currentDirection = 3;
        }
        
        //Check if we are on top of apple && move apple if eaten
        if (head[0] == apple[0] && head[1] == apple[1])
        {
            apple[0] = Math.floor(Math.random()*numCells*0.5 + 0.25*numCells);
            apple[1] = Math.floor(Math.random()*numCells*0.5 + 0.25*numCells);
        } else {
            snake.shift();
        }

        //Make sure snake is within borders
        let failed = false;
        head = snake[snake.length-1];
        if (head[0] < 0 || head[0] >= numCells || head[1]<0 || head[1]>=numCells)
        {
            //return tick + score*0;
            failed = true;
        }

        //make sure snake is not overlapping
        /*for (var i=0; i<snake.length-1; i++)
        {
            if (snake[i][0] == head[0] && snake[i][1] == head[1])
            {
                //return tick + score*100;
                failed = true;
                break;
            }
        }*/

        if (failed)
        {
            snake = [[1,2],];//[4,5]];
            snake[0][0] = Math.floor(Math.random()*numCells*0.5 + 0.25*numCells);
            snake[0][1] = Math.floor(Math.random()*numCells*0.5 + 0.25*numCells);
            apple[0] = Math.floor(Math.random()*numCells*0.5 + 0.25*numCells);
            apple[1] = Math.floor(Math.random()*numCells*0.5 + 0.25*numCells);
        }
    } 




}



