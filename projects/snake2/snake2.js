

function maxInList(list)
{
    let maxi = -100000000;
    let maxIndex = -1;
    for (let i=0; i<list.length; i++)
    {
        if (list[i] > maxi)
        {
            maxi = list[i];
            maxIndex = i;
        }
    }
    return {
        index: maxIndex,
        value: maxi
    };
}
function getGridValue(grid, gridWidth, x, y, outOfBoundsValue = -1)
{
    if (x < 0 || y < 0 || x >= gridWidth || y >= gridWidth)
    {
        return outOfBoundsValue;
    }
    return grid[x*gridWidth+y];
}
function copyList(L)
{
    let temp = [];
    for (let i in L)
    {
        temp.push(L[i]);
    }
    return temp;
}
function distBetweenPoints(p1=[0,0],p2=[1,1])
{
    return Math.sqrt(  Math.pow(p1[0]-p2[0],2) + Math.pow(p1[1]-p2[1], 2) );
}

class ML
{
    constructor(columnInfo = [2,3,2]){
        this.columnInfo = columnInfo;

        this.avgWeight = 0.5;
        this.avgWeights = [];//[0]*this.columnInfo.length;

        this.layers = []; //in form this.columns[layer][node][weight]   or this.columns[layer][column][row]

        this.numWeightsInEachLayer = [];

        for (let i=1; i<columnInfo.length; i++)
        {
            let numNodes = this.columnInfo[i];
            let numWeights = this.columnInfo[i-1];
            let layer = [];
            let totalNumWeights = 0;
            for (let n=0; n<numNodes; n++)
            {
                let nodeWeights = [];
                for (let w=0; w<numWeights; w++)
                {
                    nodeWeights.push( 0.5 - Math.random() );
                    totalNumWeights++;
                }
                layer.push(nodeWeights);
            }
            this.layers.push(layer);
            this.avgWeights.push(0);
            this.numWeightsInEachLayer.push(totalNumWeights);
        }
    }
    load(text = '')
    {
        try {
            let arr = text.split('\n');
            let layerArr = arr[0].split(',');

            //set columnInfo
            this.columnInfo = []; //in form this.columns[layer][node][weight]   or this.columns[layer][column][row]
            for (let i=0; i<layerArr.length; i++)
            {
                this.columnInfo.push( Number(layerArr[i]) );
            }

            //load all weights into wArr
            let wArr = [];
            for (let i=1; i<arr.length; i++)
            {
                wArr = wArr.concat(arr[i].split(','));
            }

            //load all weights from wArr into the this.layers[]
            this.layers = [];
            let count = 0;
            for (let i=1; i<this.columnInfo.length; i++)
            {
                let numNodes = this.columnInfo[i];
                let numWeights = this.columnInfo[i-1];
                let layer = [];
                for (let n=0; n<numNodes; n++)
                {
                    let nodeWeights = [];
                    for (let w=0; w<numWeights; w++)
                    {
                        nodeWeights.push( wArr[count] );
                        if (wArr[count] == undefined)
                        {
                            throw "Ml.load(): not enough weights for given columnInfo.";
                        }
                        count += 1;
                    }
                    layer.push(nodeWeights);
                }
                this.layers.push(layer);
            }
        } catch (ex){
            console.error("Ml.load(): Failed to load() weights. Error: " + ex);
        }
    }
    toString()
    {
        //Print model to console
        let output = String(columnInfo) + "\n";
        for (let L=0; L<this.layers.length; L++)
        {
            for (let n=0; n<this.layers[L].length; n++)
            {
                output += String(this.layers[L][n]) + "\n";
            }
        }
        return output;
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
        let output = [];
        for (let i=0; i<layer.length; i++)
        {
            let sum = 0;
            for (let j=0; j<layer[i].length; j++)
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
        for(let i=0; i<this.layers.length; i++)
        {
            temp = this._multiplyLayers(temp, this.layers[i]);
            temp = this.activationFunction(temp);
        }
        return temp;
    }
    activationFunction(vals = [])
    {
        for (let i=0; i<vals.length; i++)
        {
            vals[i] = this._fx(vals[i]);
        }
        return vals;
    }
    _fx(x)
    {
        if (x>0) { return 1 + x/10}
        if (x>-1) { return x;}
        return -1+x/10;
        if (x>0) {return x;}
        return x/100.0;
    }
    _fxPrime(x)
    {
        if (x>1 || x<-1) {return 0.1;}
        return 1;
        if (x > 0)
        {
            return 1;
        }
        return 0.01;
    }
    getModelNodeValues(input)
    {
        let nodes = [];
        let temp = input;
        for(let i=0; i<this.layers.length; i++)
        {
            nodes.push(temp);
            temp = this._multiplyLayers(temp, this.layers[i]);
            temp = this.activationFunction(temp);
        }
        nodes.push(temp);
        return nodes;
    }
    punishResponsibleNeurons(input = [], outputNeuronIndex = 0, punishMultiplier = 0.9)
    {
        const nodeValues = this.getModelNodeValues(input);

        //Node value is in form: neuron values in columns, 2d array

        let responsibleNeuron = outputNeuronIndex;
        let weightColumnOn = this.layers.length-1;
        for (let i=nodeValues.length-1; i>=1; i--)
        {
            const prevLayerNodes = nodeValues[i-1];
            let weights = this.layers[weightColumnOn];
            const numWeightsInLayer = this.numWeightsInEachLayer[weightColumnOn];
            weightColumnOn -= 1;

            weights = weights[responsibleNeuron]; // we only want the weights leading to the respondible neuron
            
            let largestVal = -100000000;
            let largestValIndex = -1;
            for (let j=0; j<weights.length; j++)
            {
                let curVal = weights[j] * prevLayerNodes[j];
                if (curVal > largestVal)
                {
                    largestVal = curVal;
                    largestValIndex = j;
                }
            }
            //now, we have the weight index. Let's modify it.
            
            //const m = 1 - (1 - punishMultiplier) * numWeightsInLayer;
            weights[largestValIndex] *= punishMultiplier;
            responsibleNeuron = largestValIndex;
        }
        this.randomlyModifyWeights();
    }
    randomlyModifyWeights(randomMultiplier = 0.0001)
    {
        return;
        let avgWeight = 0;
        let numWeights = 0;
        let add = 1;

        for (let i=0; i<this.layers.length; i++)
        {
            add = 1;
            if (this.avgWeights[i] < 0.1)
            {
                add = 1.01;
            } else {
                add = 0.999;
            }
            this.avgWeights[i] = 0;
            numWeights = 0;
            for (let j=0; j<this.layers[i].length; j++)
            {
                for (let k=0; k<this.layers[i][j].length; k++)
                {
                    this.layers[i][j][k] = Math.min(2, Math.max(0, this.layers[i][j][k] + (0.5 - Math.random()) * randomMultiplier));
                    //avgWeight += this.layers[i][j][k];
                    this.layers[i][j][k] *= add;
                    this.avgWeights[i] += this.layers[i][j][k];
                    numWeights++;
                }
            }
            this.avgWeights[i] /= numWeights;
        }
        //this.avgWeight = avgWeight/numWeights;
        //console.log("Avg weight: " + this.avgWeight);
    }
    learnBatch(inputs, outputs, learningConstant = 0.0001, iterations = 10, batchSize = 100, printDebug = False, printCost = False)
    {
        let adjustedLearningConstant = learningConstant/batchSize
        //Create gradients array
        let gradients = []
        for (let l in this.layers)
        {
            let layer = [];
            for(let n in this.layers[l])
            {
                let temp = [];
                for (let w in this.layers[l][n])
                {
                    temp.push(0);
                }
                layer.push(temp);
            }
            gradients.push(layer)
        }
        
        for (let itr=0; itr<iterations;itr++)
        {
            //Find gradient descent
            for (let i_=0; i_<batchSize; i_++)
            {
                const i = Math.floor(Math.random()*inputs.length);  //Generate index
                const X = inputs[i];
                const Y = outputs[i];

                let nodeValues = this.getModelNodeValues(X);
                let xys = [];
                for (let n in nodeValues)
                {
                    let temp = [];
                    for (let n2 in nodeValues[n])
                    {
                        temp.push(0);
                    }
                    xys.push(temp);
                }
                
                //For output layer...
                let lastLayer = nodeValues.length - 1;
                for (let n=0; n<nodeValues[lastLayer].length; n++)
                {
                    const x = nodeValues[lastLayer][n] - Y[n];
                    const y = this._fxPrime(nodeValues[lastLayer][n]);
                    const xy = x*y;
                    for(let n2=0; n2<nodeValues[lastLayer-1].length; n2++)
                    {
                        const z = nodeValues[lastLayer-1][n2]
                        const grad = xy*z
                        gradients[lastLayer-1][n][n2] += grad
                        xys[lastLayer-1][n2] += this.layers[lastLayer-1][n][n2] * xy
                    }
                }
                for (let l = nodeValues.length-2; l > 0; l-=1)
                {
                    for (let n=0; n<nodeValues[l].length; n++)
                    {
                        const x = xys[l][n];
                        const y = this._fxPrime(nodeValues[l][n]);
                        const xy = x*y
                        //console.log(x,y,xy);
                        for (let n2 in nodeValues[l-1])
                        {
                            const z = nodeValues[l-1][n2]
                            const grad = xy*z
                            gradients[l-1][n][n2] += grad
                            xys[l-1][n2] += this.layers[l-1][n][n2] * xy
                        }
                    }
                }

            
            }
            //Apply gradients array
            let num0 = 0;
            let num = 0;
            for (let l in this.layers)
            {
                for (let n in this.layers[l])
                {
                    for (let w in this.layers[l][n])
                    {
                        const v = adjustedLearningConstant * gradients[l][n][w];
                        num++;
                        if (v == 0) { num0 ++;}
                        if (!isNaN(v)) 
                        {
                            this.layers[l][n][w] -= v;
                            gradients[l][n][w] = 0;
                        } else {
                            
                            console.log("Gradient was NaN");
                        }
                        if (isNaN(this.layers[l][n][w]))
                        {
                            this.layers[l][n][w] = Math.random();
                        }
                    }
                }
            }
        }
    }
}



class Snake
{
    constructor(startPos = [0,0], ml = null)
    {
        this.positions= [startPos];
        let val = Math.random();
        if (val > 0.75)
        {
            this.positions.push( [startPos[0]+1, startPos[1]]);
        } else if (val > 0.5)
        {
            this.positions.push( [startPos[0], startPos[1]+1]);
        }  else if (val > 0.25)
        {
            this.positions.push( [startPos[0], startPos[1]-1]);
        }  else
        {
            this.positions.push( [startPos[0]-1, startPos[1]]);
        }
        
        this.learningDataInputs = [];
        this.learningDataOutputs = [];
        this.ml = ml;
        if (ml == null)
        {
            this.ml = new ML([25,25,25,10,4]);
        }   
        this.inputs = [];
        this.isDead = false;
        //this.score = 0;
        this.age = 0;
        this.numApplesConsumed = 0;

        this.prevDirX = 0;
        this.prevDirY = 0;
        this.numTurns = 0;

        this.headOffsetLow = 2;
        this.headOffsetHigh = 3;

        for (let i=0; i<49; i++)
        {
            this.inputs.push(0);
        }
    }
    update(grid = [], gridWidth = 10)
    {
        this.age += 1;
        //this.score += UPDATE_REWARD;
        let headX = this.positions[0][0];
        let headY = this.positions[0][1];
        let itr = 0;
        let nearestApple = null;
        let nearestAppleDist = 1000000;
        let nearestAppleDir = null;
        for (let i=headX-this.headOffsetLow; i<headX+this.headOffsetHigh; i++)
        {
            for (let j=headY-this.headOffsetLow; j<headY+this.headOffsetHigh; j++)
            {
                this.inputs[itr] = getGridValue(grid, GRID_WIDTH, i,j, WALL_VALUE);
                if (this.inputs[itr] == APPLE_VALUE)
                {
                    const d = distBetweenPoints([headX, headY], [i,j]);
                    if (d < nearestAppleDist)
                    {
                        nearestAppleDist = d;
                        nearestApple = [i,j];
                        nearestAppleDir = [ (i-headX)/d, (j-headY)/d ];
                        nearestAppleDist = 0;
                    }
                }
                itr+=1;
            }
        }
        //console.log("apple dist: ", nearestAppleDist);
        //console.log("   dir:", nearestAppleDir);

        const up = getGridValue(grid, GRID_WIDTH, headX, headY+1, WALL_VALUE);
        const down = getGridValue(grid, GRID_WIDTH, headX, headY-1, WALL_VALUE);
        const left = getGridValue(grid, GRID_WIDTH, headX-1, headY, WALL_VALUE);
        const right = getGridValue(grid, GRID_WIDTH, headX+1, headY, WALL_VALUE);
        const appleIsNearby = up == APPLE_VALUE || down == APPLE_VALUE || left == APPLE_VALUE || right == APPLE_VALUE;
        const output = this.ml.compute(this.inputs);
        let ret = maxInList(output);
        if (ret.index == 0)
        {
            //up
            headY += 1;
        } else if (ret.index == 1)
        {
            //down
            headY -= 1;
        } else if (ret.index == 2)
        {
            //left
            headX -= 1;
        } else
        {
            //right
            headX += 1;
        }


        if (this.learningDataInputs.length > 1000000)
        {
            console.log("culling learning data");
            this.learningDataInputs = [];
            this.learningDataOutputs = [];
        }
        if (this.learningDataInputs.length > 1)
        {
            this.ml.learnBatch(this.learningDataInputs, this.learningDataOutputs, WEIGHT_MODIFIER, 1, GRAD_DESCENT_ITERS_PER_UPDATE, false, false);
        }

        if (nearestApple != null)
        {
            if (distBetweenPoints([headX, headY], nearestApple) <= nearestAppleDist)
            {
                //Went towards apple   
            } else {
                //Went away from nearest apple
            }
            let temp = [-10,-10,-10,-10];
            if (nearestAppleDir[0] >= 0)
            {
                if (nearestAppleDir[1] >= 0)
                {
                    //up or right
                    if (up != WALL_VALUE) { temp[0] = 10; }
                    if (right != WALL_VALUE) { temp[3] = 10; }
                } else {
                    //down or right
                    if (down != WALL_VALUE) { temp[1] = 10; }
                    if (right != WALL_VALUE) { temp[3] = 10; }
                }
            } else {
                if (nearestAppleDir[1] >= 0)
                {
                    //up or left
                    if (up != WALL_VALUE) { temp[0] = 10; }
                    if (left != WALL_VALUE) { temp[2] = 10; }
                } else {
                    //down or left
                    if (down != WALL_VALUE) { temp[1] = 10; }
                    if (left != WALL_VALUE) { temp[2] = 10; }
                }
            }
            this.learningDataInputs.push( copyList(this.inputs) );
            this.learningDataOutputs.push( temp );
        }

        const headGridVal = getGridValue(grid, GRID_WIDTH, headX, headY, WALL_VALUE);
        // if (appleIsNearby)
        // {
        //     this.ml.randomlyModifyWeights(0.001);
        //     let temp = [0,0,0,0];
        //     if (up    == APPLE_VALUE) { temp[0]=100;}
        //     if (down  == APPLE_VALUE) { temp[1]=100;}
        //     if (left  == APPLE_VALUE) { temp[2]=100;}
        //     if (right == APPLE_VALUE) { temp[3]=100;}
        //     this.learningDataInputs.push( copyList(this.inputs) );
        //     this.learningDataOutputs.push( temp );

        //     if (headGridVal != APPLE_VALUE)
        //     {
        //         //We didn't go for the apple... punish
        //         //this.ml.punishResponsibleNeurons(this.inputs, ret.index, 1 - WEIGHT_MODIFIER/4.0);
        //     } else {
        //         //Reward. Got apple!
        //         //this.ml.punishResponsibleNeurons(this.inputs, ret.index, 1 + WEIGHT_MODIFIER);
        //     }
        // }

        if (headGridVal == WALL_VALUE)
        {
            //Hit a wall. Punish.
            this.isDead = true;

            if (up != WALL_VALUE || down != WALL_VALUE || left != WALL_VALUE || right != WALL_VALUE)
            {
                this.ml.randomlyModifyWeights(0.001);
                let temp = [-10,-10,-10,-10];
                if (up    != WALL_VALUE) { temp[0]=10;}
                if (down  != WALL_VALUE) { temp[1]=10;}
                if (left  != WALL_VALUE) { temp[2]=10;}
                if (right != WALL_VALUE) { temp[3]=10;}
                this.learningDataInputs.push( copyList(this.inputs) );
                this.learningDataOutputs.push( temp );
            }
            return;
        }


        //now, update tail
        this.positions.unshift([headX,headY]);
        if (headGridVal == APPLE_VALUE)
        {
            this.numApplesConsumed++;
        } else if (this.positions.length > 2){
            let p = this.positions.pop();
            //grid[p[0]*GRID_WIDTH+p[1]] = 0;
        }
        grid[headX*GRID_WIDTH+headY] = WALL_VALUE;
    }
    getChild(gridWidth = 10)
    {
        let x = Math.round(Math.random() * gridWidth);
        let y = Math.round(Math.random() * gridWidth);
        const s = new Snake( [x,y] )
        // if (Math.random() > 0.1)
        // {
        //     s.ml = this.ml.getChild(Math.random()/50);
        // }
        s.ml = this.ml;
        return s;
    }
}

//Snake Game//////////////////////////////
{
    const canvasElement = document.getElementById("snakeCanvas");
    let bb = canvasElement.getBoundingClientRect();
    canvasElement.width = Math.round(bb.width);
    canvasElement.height = Math.round(bb.height);

    const snakeNeuralNetworkCanvas = document.getElementById("snakeNeuralNetworkCanvas");
    bb = snakeNeuralNetworkCanvas.getBoundingClientRect();
    snakeNeuralNetworkCanvas.width = Math.round(bb.width);
    snakeNeuralNetworkCanvas.height = Math.round(bb.height);
    var nnColorMultiplier = 60;

    //const neuralNetworkCanvasElement = document.getElementById('snakeNeuralNetworkCanvas');
    var p = new Painter(canvasElement);
    var p2 = new Painter(snakeNeuralNetworkCanvas);

    var cellWidthPx;

    //var averageAges = [];
    var avgNumApplesConsumed = 0;
    var WEIGHT_MODIFIER = 0.001;
    var GRAD_DESCENT_ITERS_PER_UPDATE = 2;
    var RANDOM_PRUNE_PERCENTAGE = 0.1;

    var previousRenderTime = Date.now();
    var renderDelayMs = 50;
    var updateOn = 0;

    var UPDATE_INTERVAL; //set in setup()

    var WALL_VALUE = -1;
    var APPLE_VALUE = 1;
    var NUM_APPLES = 30;
    var NUM_SNAKES = 20;
    var GRID_WIDTH = 32;


    var AVERAGE_AGE = 0;
    var AVERAGE_APPLES_CONSUMED = 0;


    let apples = []; //initialized in setup()
    let snakes = [];
    setup();
    function setup()
    {
        //create all of the snakes
        snakes = [];
        apples = [];
        for (let i=0; i<NUM_SNAKES; i++)
        {
            let x = Math.round(Math.random() * GRID_WIDTH);
            let y = Math.round(Math.random() * GRID_WIDTH);
            snakes.push( new Snake( [x,y]) )
        }
        for (let i=0; i<NUM_SNAKES; i++)
        {
            snakes[i].ml = snakes[0].ml;
        }

        //Create all of the apples
        for (let i=0; i<NUM_APPLES; i++)
        {
            let x = Math.round(Math.random() * GRID_WIDTH);
            let y = Math.round(Math.random() * GRID_WIDTH);
            apples.push([x,y]);
        }
        clearInterval(UPDATE_INTERVAL)

        cellWidthPx = canvasElement.width / GRID_WIDTH;
        UPDATE_INTERVAL = setInterval(update, 20);
    }

    simulationSpeedSliderUpdate();

    function simulationSpeedSliderUpdate()
    {
        let val = document.getElementById("speedSlider").value;
        val *= 31/100;
        val *= val;
        val = 1000 - val;

        clearInterval(UPDATE_INTERVAL);
        UPDATE_INTERVAL = setInterval(update, val);
        document.getElementById("speedSliderText").innerText = val.toPrecision(4) + "ms";

        WEIGHT_MODIFIER = document.getElementById("weightSlider").value / 10000;
        document.getElementById("weightSliderText").innerText = WEIGHT_MODIFIER.toPrecision(5);
    
        GRAD_DESCENT_ITERS_PER_UPDATE = document.getElementById("gradDescentIterSlider").value;
        document.getElementById("gradDescentIterSliderText").innerText = Math.round(GRAD_DESCENT_ITERS_PER_UPDATE);

        RANDOM_PRUNE_PERCENTAGE = document.getElementById("randomPruneSlider").value / 100;
        document.getElementById("randomPruneSliderText").innerText = RANDOM_PRUNE_PERCENTAGE.toPrecision(3);
        
        val = Math.max(1,document.getElementById("numSnakesSlider").value);
        document.getElementById("numSnakesSliderText").innerText = val.toPrecision(3);
        while (val < snakes.length)
        {
            snakes.pop();
        }
        while (val > snakes.length)
        {
            let x = Math.round(Math.random() * GRID_WIDTH);
            let y = Math.round(Math.random() * GRID_WIDTH);
            snakes.push( new Snake( [x,y], snakes[0].ml) );
        }
    
    }
    function randomlyPruneWeights()
    {
        const ml = snakes[0].ml;
        if (ml instanceof ML)
        {
            for (let l in ml.layers)
            {
                for (let n in ml.layers[l])
                {
                    for (let w in ml.layers[l][n])
                    {
                        if (Math.random() < RANDOM_PRUNE_PERCENTAGE)
                        {
                            ml.layers[l][n][w] = 0;
                        }
                    }
                }
            }
        }
    }

    function renderSnakeGame()
    {
        p.ClearTransparent();

        //Draw grid
        for (let i=0; i<GRID_WIDTH*cellWidthPx*1.2; i+=cellWidthPx)
        {
            p.DrawLine(i,0,i,canvasElement.height, 'rgb(90,90,90)');
            p.DrawLine(0,i,canvasElement.width,i, 'rgb(90,90,90)');
        }
        
        //draw apples
        for (let i=0; i<apples.length; i++)
        {
            p.DrawRectFilled(apples[i][0]*cellWidthPx, apples[i][1]*cellWidthPx, cellWidthPx, cellWidthPx, 'rgb(200,30,30)');
        }

        //draw snakes
        AVERAGE_AGE = AVERAGE_AGE*0.98;
        AVERAGE_APPLES_CONSUMED = AVERAGE_APPLES_CONSUMED*0.98;
        const snakeCellPadding = 3;
        for (let i=0; i<snakes.length; i++)
        {
            const s = snakes[i];
            AVERAGE_AGE += 0.02*s.age/snakes.length;
            AVERAGE_APPLES_CONSUMED += 0.02 * s.numApplesConsumed / snakes.length;
            let pos;
            //let pos2;
            //const pad = cellWidthPx/3;
            for (let j=0; j<s.positions.length; j++)
            {
                pos = s.positions[j];
                p.DrawRectFilled(pos[0]*cellWidthPx+3, pos[1]*cellWidthPx+3, cellWidthPx-6, cellWidthPx-6, 'green');
                // if (j+1 < s.positions.length) //if it's not the last cell...
                // {
                //     pos2 = s.positions[j+1];
                //     pos2[0] = (pos[0] + pos2[0])/2;
                //     pos2[1] = (pos[1] + pos2[1])/2;
                //     p.DrawRectFilled(pos2[0]*cellWidthPx+pad, pos2[1]*cellWidthPx+pad, cellWidthPx-pad*2, cellWidthPx-pad*2, 'blue');
                // }
            }
            p.DrawRectFilled(s.positions[0][0]*cellWidthPx + 5, s.positions[0][1]*cellWidthPx + 5, 5, 5, 'blue');
        }
        p.SetTextColor("white");
        p.SetTextSize(20);
        p.DrawText(10,30,"Average Age: "+AVERAGE_AGE.toPrecision(3));
        p.DrawText(10,50,"Average Apples Consumed: "+AVERAGE_APPLES_CONSUMED.toPrecision(3));
    }

    function renderNeuralNetwork()
    {
        //Neural Network
        //p2.Clear("black");
        p2.ClearTransparent();
        const ml = snakes[0].ml;
        const layers = ml.layers;

        let x = 0;
        let xStep = snakeNeuralNetworkCanvas.width/layers.length;
        let yMultiplier = 33;
        let maxC = 0;
        let avgC = 0;
        let numWeights = 0;
        
        for (let i=0; i<layers.length; i++)
        {
            let j_yMultiplier = snakeNeuralNetworkCanvas.height / layers[i].length;
            for (let j=0; j<layers[i].length; j++)
            {
                let k_yMultiplier = snakeNeuralNetworkCanvas.height / layers[i][j].length;
                for (let k=0; k<layers[i][j].length; k++)
                {
                    let r = Math.min(255, Math.max(0, layers[i][j][k]*nnColorMultiplier));
                    let b = Math.min(255, Math.max(0, -layers[i][j][k]*nnColorMultiplier));
                    maxC = Math.max(maxC, Math.max(r,b));
                    avgC += r + b;
                    numWeights++;
                    if (r < 20 && b < 20) { continue;}
                    p2.DrawLine(x,k*k_yMultiplier, x+xStep,j*j_yMultiplier+k_yMultiplier/2, rgbToHex(r,0,b));
                }
            }
            x += xStep; 
        }
        avgC /= numWeights;
        if (avgC < 80)
        {
            nnColorMultiplier *= 1.05;
        } else {
            nnColorMultiplier /= 1.05;
        }
    }

    function update()
    {
        updateOn += 1;

        //Check for rendering
        let render = false;
        if (Date.now() - renderDelayMs > previousRenderTime)
        {
            render = true;
            previousRenderTime = Date.now();
            renderNeuralNetwork();
            renderSnakeGame();
        }

        //create grid
        let grid = []
        for (let i=0; i<GRID_WIDTH*GRID_WIDTH; i++)
        {
            grid.push(0);
        }

        //load the apples into the grid
        for (let i=0; i<apples.length; i++)
        {
            grid[apples[i][0]*GRID_WIDTH + apples[i][1]] = APPLE_VALUE;
        }


        //put snakes into grid, and check for eaten apples
        for (let i=0; i<snakes.length; i++)
        {
            const s = snakes[i];
            for (let j=0; j<s.positions.length; j++)
            {
                const pos = s.positions[j];
                grid[pos[0]*GRID_WIDTH + pos[1]] = WALL_VALUE;
            }
            const head = s.positions[0];
            for (let j=0; j<apples.length; j++)
            {
                if (apples[j][0] == head[0] && apples[j][1] == head[1])
                {
                    apples[j][0] = Math.round(Math.random() * GRID_WIDTH);
                    apples[j][1] = Math.round(Math.random() * GRID_WIDTH);
                }
            }
        }

        //update each snake
        for (let i=0; i<snakes.length; i++)
        {
            const s = snakes[i];
            s.update(grid, GRID_WIDTH);
            if (s.isDead)//|| s.score < KILL_SCORE_THRESHOLD)
            {
                avgNumApplesConsumed = avgNumApplesConsumed*0.99 + s.numApplesConsumed * 0.01;
                snakes[i].age = 0;
                snakes[i].numApplesConsumed = 0;
                let x = Math.round(Math.random() * GRID_WIDTH);
                let y = Math.round(Math.random() * GRID_WIDTH);
                snakes[i].positions = [[x,y]]
                snakes[i].isDead = false;
            }
        }
    }


}




