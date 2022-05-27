



class ML
{
    constructor(columnInfo = [2,3,2]){
        this.columnInfo = columnInfo;

        this.layers = []; //in form this.columns[layer][node][weight]   or this.columns[layer][column][row]

        for (let i=1; i<columnInfo.length; i++)
        {
            let numNodes = this.columnInfo[i];
            let numWeights = this.columnInfo[i-1];
            let layer = [];
            for (let n=0; n<numNodes; n++)
            {
                let nodeWeights = [];
                for (let w=0; w<numWeights; w++)
                {
                    nodeWeights.push( Math.random() );
                }
                layer.push(nodeWeights);
            }
            this.layers.push(layer);
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
        }
        return temp;
    }
    getModelNodeValues(input)
    {
        let nodes = [];
        let temp = input;
        for(let i=0; i<this.layers.length; i++)
        {
            nodes.push(temp);
            temp = this._multiplyLayers(temp, this.layers[i]);
        }
        nodes.push(temp);
        return nodes;
    }
}





//Snake Game
{
    const canvasElement = document.getElementById("snakeCanvas");
    const neuralNetworkCanvasElement = document.getElementById('snakeNeuralNetworkCanvas');
    const p = new Painter(canvasElement);
    const ctx = p.ctx;

    let numCells = 10;
    let cellWidth = null //set in setup();
    let width = null; //set in setup()
    let height = null;

    let snake = [[4,5]];
    let apple = [6,6];
    let snakeDirection = 'right';
    let playingGame = false;

    let ml = null;


    setup();

    let timeInterval = 300;
    let updateInterval = setInterval(updateML, timeInterval);

    function setup() {

        //resize snake canvas element
        let bb = canvasElement.getBoundingClientRect();
        canvasElement.width = bb.width;
        canvasElement.height = bb.height;
        width = bb.width;
        height = bb.height;

        //resize neural network canvas element
        bb = neuralNetworkCanvasElement.getBoundingClientRect();
        neuralNetworkCanvasElement.width = bb.width;
        neuralNetworkCanvasElement.height = bb.height;

        p.Clear('black');


        cellWidth = width/numCells;// ml = parent.getChild(0.1, i);
        drawGrid();
        moveApple();


        /*
        let bestScore = 0;
        let bestMachine = null;
        let columnInfo = [8,10,4];
        let parent = new ML(columnInfo);
        let bestScores = [];


        //Make a timer so it stops training after 1 minute max
        let endTime = new Date().getTime() + 60000;
        //let endTime = new Date().getTime() + 60000*5;

        for (let gen=1; gen<100000; gen++)
        {
            bestScore = 0;
            bestMachine = null;
            for (let i=0; i<1000; i++)
            {
                let ml;
                if (gen == 1 || i < 50)
                {
                    ml = new ML(columnInfo)
                } else if (i < 300) {
                    ml = parent.getChild(0.5, i);
                } else if (i < 600) {
                    ml = parent.getChild(0.2, i);
                } else {
                    ml = parent.getChild(0.08, i);
                }

                let score = 0;
                for (let run=0; run<10; run++)
                {
                    score += runGame(ml)/10;
                }
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

            if (bestScore > 10000 || new Date().getTime() > endTime)
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


        //Print model to console
        let output = String(columnInfo) + "\n";
        for (let L=0; L<ml.layers.length; L++)
        {
            for (let n=0; n<ml.layers[L].length; n++)
            {
                output += String(ml.layers[L][n]) + "\n";
            }
        }
        console.log(output);*/

        let save = `8,10,10,4
        -4.301710864366431,0.8662122606768411,1.1815877436088114,1.0847635608384516,-5.241861141685687,-1.8299297473243439,0.34553485035888576,-0.1899122894103982
        0.7533939233257715,0.3095522126485506,-4.461460603006369,2.2856850215507403,1.3309034319273414,-2.5345078678943893,-2.981137278557868,2.6992790643843345
        -2.6808032997628253,1.3872016260507192,-2.9643615172680926,0.38499877303442054,-0.10572151951231669,-1.3487323126134108,1.1125222132563417,0.45369296735462084
        -0.7244513031025619,-0.4206188279382823,-1.79901867838158,2.496762598372312,-0.4988391677561467,2.555137252632325,2.6919422782212745,-0.61043964894226
        9.433381048721587,0.04230699290750192,0.7562853986111919,-2.8343402515383636,1.4846597263164327,3.7896703276538743,-4.3135148130439935,-4.749813390226505
        -0.7165376683106196,2.23962521820843,3.983768816693241,0.9489563987851103,2.6506367652754963,0.5051573752102725,-1.050790825110574,-0.23517876658393788
        -1.5068217661505272,0.0675143348384955,-2.7221760571506297,-0.4969373015389831,1.849386509014579,2.8871263335867434,-0.2182860947298163,-3.8127395077623034
        3.0992486119949074,3.824916103877781,1.2473649224631254,-4.25930813509154,-0.8640800728091689,1.6944800825593405,3.4100380663603547,2.3183469089262156
        -0.6024066236773991,1.7083896882800724,-0.268029594446071,4.183144847279945,0.3336953643501869,-2.4445592026939953,4.179786440119175,-1.4635650521270869
        -2.370574433055779,-1.934980702861551,-0.33695470449544757,-1.313869008316951,-3.172824416307877,4.241848559572513,-0.24772755736147004,2.3666312304510497
        5.740989152865147,0.4353338658323215,2.9115007127818937,3.045065001410826,0.019131468252866324,-2.7143196804608327,0.05918275487146055,0.4198132140620723,-0.2366715951514961,-1.7598007234633544
        2.4596356004979443,-0.261768863721437,-0.5859825531421338,-1.5574612029074335,0.16456988616612064,1.3000508987098085,-1.5726432361079137,-2.3837977222073525,4.235627432057616,1.7344641496359416
        2.782471362737879,11.053329931279553,-0.4302912467050509,-0.6530565581983133,-0.3103771869707364,0.661723409568373,-0.6808362062185177,1.9525058231104766,5.010335912015359,2.3683803278447653
        0.7359250274894823,-0.8559818534917099,1.5080693561526344,2.5094474475227693,-0.523999052970141,0.8470676567124787,2.2646811454991465,-1.769078231721421,1.2672035667660069,-2.8471969881187507
        2.6823650459607262,2.6382719011787046,2.1410957628481895,3.621460427090228,-1.4488862368165047,1.1251494576604189,-0.3851355832237723,-2.6267008726335375,-0.8768104404393816,0.7167702142376996
        0.8317640944991626,-0.31061312127159346,3.649702647089296,0.3694762957479669,0.5511716235475193,0.8498805683141659,0.10708788091442856,1.1915295865302948,0.841556967637685,2.0548276795896894
        -0.6853821313340533,-1.4771788296863382,-0.8420893602167365,4.28869615888004,-2.040377467477414,-0.6221814715201991,0.3194234322217486,-3.6744256636934107,-1.413506921367058,2.810872340543967
        -4.116426038204628,0.9595796475199717,-3.5168127762926247,-1.3621766486128437,1.1508814516588863,-1.5916995666390867,-2.309812055978227,4.038075225716055,-2.531329293222493,-2.1969801045487816
        2.140380747850108,-1.5824219728791757,0.049935960572716764,5.086314357451586,2.886746247130925,1.1103830937058174,5.155424340758232,1.9541697647402563,-7.788571642720999,0.1901574910082118
        2.912993028398849,-1.4697902061507726,-2.895543518713862,-2.3297322703709127,-0.7983749147115159,-0.779913350850535,0.0634269677508531,-3.123576495681885,8.801591658581968,2.1487808961328483
        2.2587201896052442,-0.4596836106164247,-0.7325407139066019,2.8478155348482397,3.838207231547655,-1.7523821848270131,-2.0229785668554277,3.775466858176975,4.233858628930847,-2.3566193878638364
        1.0272221226477485,4.586574489893042,-2.6521569306450017,1.410254786295645,-1.0727969486940108,-1.2420371687676612,-1.0333176359796588,3.8217202665942582,0.506448102804281,1.6123646393087823
        -2.6278967133002937,4.790060644999243,-4.276574892499845,2.765063070545908,0.30615083784168107,2.8497247399282863,-0.12035819517699453,2.9851791861556753,3.1726599983872052,3.991737099280756
        2.230077038043694,0.27863508085563415,0.6158852243937618,-1.8474460393042769,0.13336468220404354,5.2618747641522035,5.590067467641053,2.1764997875103136,4.985709687213263,6.138971756031425`;


        save = `8,10,10,4
        -4.301710864366431,0.8662122606768411,1.1815877436088114,1.0847635608384516,-5.241861141685687,-1.8299297473243439,0.34553485035888576,-0.1899122894103982
        0.7533939233257715,0.3095522126485506,-4.461460603006369,2.2856850215507403,1.3309034319273414,-2.5345078678943893,-2.981137278557868,2.6992790643843345
        -2.6808032997628253,1.3872016260507192,-2.9643615172680926,0.38499877303442054,-0.10572151951231669,-1.3487323126134108,1.1125222132563417,0.45369296735462084
        -0.7244513031025619,-0.4206188279382823,-1.79901867838158,2.496762598372312,-0.4988391677561467,2.555137252632325,2.6919422782212745,-0.61043964894226
        9.433381048721587,0.04230699290750192,0.7562853986111919,-2.8343402515383636,1.4846597263164327,3.7896703276538743,-4.3135148130439935,-4.749813390226505
        -0.7165376683106196,2.23962521820843,3.983768816693241,0.9489563987851103,2.6506367652754963,0.5051573752102725,-1.050790825110574,-0.23517876658393788
        -1.5068217661505272,0.0675143348384955,-2.7221760571506297,-0.4969373015389831,1.849386509014579,2.8871263335867434,-0.2182860947298163,-3.8127395077623034
        3.0992486119949074,3.824916103877781,1.2473649224631254,-4.25930813509154,-0.8640800728091689,1.6944800825593405,3.4100380663603547,2.3183469089262156
        -0.6024066236773991,1.7083896882800724,-0.268029594446071,4.183144847279945,0.3336953643501869,-2.4445592026939953,4.179786440119175,-1.4635650521270869
        -2.370574433055779,-1.934980702861551,-0.33695470449544757,-1.313869008316951,-3.172824416307877,4.241848559572513,-0.24772755736147004,2.3666312304510497
        5.740989152865147,0.4353338658323215,2.9115007127818937,3.045065001410826,0.019131468252866324,-2.7143196804608327,0.05918275487146055,0.4198132140620723,-0.2366715951514961,-1.7598007234633544
        2.4596356004979443,-0.261768863721437,-0.5859825531421338,-1.5574612029074335,0.16456988616612064,1.3000508987098085,-1.5726432361079137,-2.3837977222073525,4.235627432057616,1.7344641496359416
        2.782471362737879,11.053329931279553,-0.4302912467050509,-0.6530565581983133,-0.3103771869707364,0.661723409568373,-0.6808362062185177,1.9525058231104766,5.010335912015359,2.3683803278447653
        0.7359250274894823,-0.8559818534917099,1.5080693561526344,2.5094474475227693,-0.523999052970141,0.8470676567124787,2.2646811454991465,-1.769078231721421,1.2672035667660069,-2.8471969881187507
        2.6823650459607262,2.6382719011787046,2.1410957628481895,3.621460427090228,-1.4488862368165047,1.1251494576604189,-0.3851355832237723,-2.6267008726335375,-0.8768104404393816,0.7167702142376996
        0.8317640944991626,-0.31061312127159346,3.649702647089296,0.3694762957479669,0.5511716235475193,0.8498805683141659,0.10708788091442856,1.1915295865302948,0.841556967637685,2.0548276795896894
        -0.6853821313340533,-1.4771788296863382,-0.8420893602167365,4.28869615888004,-2.040377467477414,-0.6221814715201991,0.3194234322217486,-3.6744256636934107,-1.413506921367058,2.810872340543967
        -4.116426038204628,0.9595796475199717,-3.5168127762926247,-1.3621766486128437,1.1508814516588863,-1.5916995666390867,-2.309812055978227,4.038075225716055,-2.531329293222493,-2.1969801045487816
        2.140380747850108,-1.5824219728791757,0.049935960572716764,5.086314357451586,2.886746247130925,1.1103830937058174,5.155424340758232,1.9541697647402563,-7.788571642720999,0.1901574910082118
        2.912993028398849,-1.4697902061507726,-2.895543518713862,-2.3297322703709127,-0.7983749147115159,-0.779913350850535,0.0634269677508531,-3.123576495681885,8.801591658581968,2.1487808961328483
        2.2587201896052442,-0.4596836106164247,-0.7325407139066019,2.8478155348482397,3.838207231547655,-1.7523821848270131,-2.0229785668554277,3.775466858176975,4.233858628930847,-2.3566193878638364
        1.0272221226477485,4.586574489893042,-2.6521569306450017,1.410254786295645,-1.0727969486940108,-1.2420371687676612,-1.0333176359796588,3.8217202665942582,0.506448102804281,1.6123646393087823
        -2.6278967133002937,4.790060644999243,-4.276574892499845,2.765063070545908,0.30615083784168107,2.8497247399282863,-0.12035819517699453,2.9851791861556753,3.1726599983872052,3.991737099280756
        2.230077038043694,0.27863508085563415,0.6158852243937618,-1.8474460393042769,0.13336468220404354,5.2618747641522035,5.590067467641053,2.1764997875103136,4.985709687213263,6.138971756031425`;
        ml = new ML();
        ml.load(save);

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

        //let currentDirection = 0; //0=up, 1=right, 2=down, 3=left
        let score = 0;
        let scoreMultiplier = 10;

        let head = snake[snake.length-1];
        let tick = 0;

        let board = [];
        for (let i=0; i<numCells+2;i++)
        {
            let row = [];
            for (let j=0; j<numCells+2;j++)
            {
                row.push(0);
            }
            board.push(row);
        }

        while( tick<(10+score*10) && tick < 1000)
        {
            tick += 1;

            for (let i=0; i<numCells+2;i++)
            {
                for (let j=0; j<numCells+2;j++)
                {
                    board[i][j] = 0;
                }
            }
            for (let i=0; i<snake.length; i++)
            {
                board[snake[i][0]+1][snake[i][1]+1] = 1;
            }

            //get ml decision.
            head = snake[snake.length-1];
            let input = [
                //1/(head[0]+1), 
                //1/(numCells - head[0]),
                //1/(head[1]+1), 
                //1/(numCells - head[1]),
                Number( head[0] < apple[0] ),
                Number( head[0] == apple[0] ),
                Number( head[1] < apple[1] ),
                Number( head[1] == apple[1] ),
                board[ head[0]     ][ head[1] + 1 ], //x-1, left
                board[ head[0] + 2 ][ head[1] + 1 ], //x+2, right 
                board[ head[0] + 1 ][ head[1]     ], //y-1, bottom
                board[ head[0] + 1 ][ head[1] + 2 ], //y+2, top

                board[ head[0] + 2 ][ head[1] + 2 ], //y+2, top
                board[ head[0] + 2 ][ head[1] + 0 ], //y+2, top
                board[ head[0] + 0 ][ head[1] + 2 ], //y+2, top
                board[ head[0] + 0 ][ head[1] + 0 ], //y+2, top
            ];

            let output = ml.compute(input);

            //Move snake
            let maxVal = Math.max(...output);
            head = snake[snake.length-1];
            if (maxVal == output[0]) // up
            {
                snake.push( [head[0], head[1]-1] );
                //currentDirection = 0;
            } else if (maxVal == output[1]) //right
            {
                snake.push( [head[0]+1, head[1]] );
                //currentDirection = 1;
            } else if (maxVal == output[2]) //down
            {
                snake.push( [head[0], head[1]+1] );
                //currentDirection = 2;
            } else {//left
                snake.push( [head[0]-1, head[1]] );
                //currentDirection = 3;
            }

            //Check if we are on top of apple && move apple if eaten
            if (head[0] == apple[0] && head[1] == apple[1])
            {
                score += 1;
                apple[0] = Math.floor(Math.random()*numCells*0.5 + 0.25*numCells);
                apple[1] = Math.floor(Math.random()*numCells*0.5 + 0.25*numCells);
            } else {
                snake.shift();
            }


            //Make sure snake is within borders
            head = snake[snake.length-1];
            if (head[0] < 0 || head[0] >= numCells || head[1]<0 || head[1]>=numCells)
            {
                //return  tick + score*scoreMultiplier;
                return score*scoreMultiplier - tick;
            }

            
            //make sure snake is not overlapping
            for (let i=0; i<snake.length-1; i++)
            {
                if (snake[i][0] == head[0] && snake[i][1] == head[1])
                {
                    return score*scoreMultiplier - tick;
                }
            }

        }
        //return  score*scoreMultiplier;
        return score*scoreMultiplier - tick;
    }
    function updateML()
    {
        p.Clear('#111111');
        p.SetStrokeWidth(1);
        //draw grid
        for (let i=1; i<numCells; i++)
        {
            p.DrawLine(i*cellWidth, 0, i*cellWidth, height, '#aaaaaa');
            p.DrawLine(0, i*cellWidth, width, i*cellWidth, '#aaaaaa');
        }
        //draw Snake
        for (let i=0; i<snake.length; i++){
            let x = snake[i][0];
            let y = snake[i][1];
            p.DrawRectFilled( x*cellWidth + 3, y*cellWidth + 3, cellWidth-6, cellWidth-6, rgbToHex(0,255-(snake.length-i)*10,0) );
        }
        head = snake[snake.length-1];
        p.DrawCircleFilled(head[0]*cellWidth + cellWidth/2, head[1]*cellWidth + cellWidth/2, cellWidth/10, 'green');

        //draw apple
        p.DrawCircleFilled( apple[0]*cellWidth + cellWidth/2, apple[1]*cellWidth + cellWidth/2, cellWidth/3, 'red' );



        let board = [];
        for (let i=0; i<numCells+2;i++)
        {
            let row = [];
            for (let j=0; j<numCells+2;j++)
            {
                row.push(0);
            }
            board.push(row);
        }

        for (let i=0; i<snake.length; i++)
        {
            board[snake[i][0]+1][snake[i][1]+1] = 1;
        }

        //get ml decision.
        head = snake[snake.length-1];
        const input = [
            Number( head[0] < apple[0] ),
            Number( head[0] == apple[0] ),
            Number( head[1] < apple[1] ),
            Number( head[1] == apple[1] ),
            board[ head[0]     ][ head[1] + 1 ], //x-1, left
            board[ head[0] + 2 ][ head[1] + 1 ], //x+2, right 
            board[ head[0] + 1 ][ head[1]     ], //y-1, bottom
            board[ head[0] + 1 ][ head[1] + 2 ], //y+2, top

            //board[ head[0] + 2 ][ head[1] + 2 ], //y+2, top
            //board[ head[0] + 2 ][ head[1] + 0 ], //y+2, top
            //board[ head[0] + 0 ][ head[1] + 2 ], //y+2, top
            //board[ head[0] + 0 ][ head[1] + 0 ], //y+2, top
        ];
        const output = ml.compute(input);




        //Draw Network.
        const painter = new Painter(neuralNetworkCanvasElement);
        painter.Clear('#555555');

        /*
        const nodeValues = ml.getModelNodeValues(input);
        const columnPadding = neuralNetworkCanvasElement.width / ( nodeValues.length + 1);
        const nodeRadius = Math.min(neuralNetworkCanvasElement.width, neuralNetworkCanvasElement.height) / 40;
        let columnX = columnPadding;
        for (let c=0; c<nodeValues.length; c++)
        {
            const rowYPadding = neuralNetworkCanvasElement.height / ( nodeValues[c].length + 1);
            let rowY = rowYPadding;
            let maxNodeValue = 1; //get the max node value, so we can scale the color of each column from black to white
            for(let n=0; n<nodeValues[c].length; n++) { maxNodeValue = Math.max(maxNodeValue, nodeValues[c][n]); }
            

            for(let n=0; n<nodeValues[c].length; n++)
            {
                const nodeValue = Math.floor( Math.max(Math.min(15*nodeValues[c][n]/maxNodeValue, 15), 2) ).toString(16);
                const nodeColor = "#"+nodeValue+nodeValue+nodeValue+nodeValue+nodeValue+nodeValue;
                painter.DrawCircleFilled(columnX, rowY, nodeRadius,  nodeColor);
                rowY += rowYPadding;
            }
            columnX += columnPadding;
        }

        //Draw Network.
        const painter = new Painter(neuralNetworkCanvasElement);
        painter.Clear('#050505');
        
        const nodeValues = ml.getModelNodeValues(input);
        const columnPadding = neuralNetworkCanvasElement.width / ( nodeValues.length + 1);
        const nodeRadius = Math.min(neuralNetworkCanvasElement.width, neuralNetworkCanvasElement.height) / 40;
        let columnX = columnPadding;
        for (let c=0; c<nodeValues.length; c++)
        {
            const rowYPadding = neuralNetworkCanvasElement.height / ( nodeValues[c].length + 1);
            let rowY = rowYPadding;
            let maxNodeValue = 1; //get the max node value, so we can scale the color of each column from black to white
            for(let n=0; n<nodeValues[c].length; n++) { maxNodeValue = Math.max(maxNodeValue, nodeValues[c][n]); }
            

            for(let n=0; n<nodeValues[c].length; n++)
            {
                const nodeValue = Math.floor( Math.max(Math.min(15*nodeValues[c][n]/maxNodeValue, 15), 2) ).toString(16);
                const nodeColor = "#"+nodeValue+nodeValue+nodeValue+nodeValue+nodeValue+nodeValue;
                painter.DrawCircleFilled(columnX, rowY, nodeRadius,  nodeColor);
                rowY += rowYPadding;
            }
            columnX += columnPadding;
        }*/



        /////////////////////////////////////////////////////////////////////////////
        //Drawing the neural Network
        //First, getting constants and values
        const nodeValues = ml.getModelNodeValues(input);
        let maxNumNodesPerColumn = 1;
        let maxNodeValueInEachColumn = [];
        for (let c=0; c<nodeValues.length; c++)
        {
            maxNumNodesPerColumn = Math.max(maxNumNodesPerColumn, nodeValues[c].length);
            let maxNodeVal = 1;
            for (let n=0; n<nodeValues[c].length; n++)
            {
                maxNodeVal = Math.max(maxNodeVal, nodeValues[c][n]);
            }
            maxNodeValueInEachColumn.push(maxNodeVal);
        }
        const nodeVerticalPadding = neuralNetworkCanvasElement.height / (maxNumNodesPerColumn + 1);
        const nodeHorizontalPadding = neuralNetworkCanvasElement.width / (nodeValues.length + 1);
        let columnVerticalPadding = [];
        for (let c=0; c<nodeValues.length; c++)
        {
            columnVerticalPadding.push(  (maxNumNodesPerColumn - nodeValues[c].length)*0.5*nodeVerticalPadding  );
        }

        const nodeRadius =  Math.floor( neuralNetworkCanvasElement.height / (maxNumNodesPerColumn*4) );

        //Drawing...
        for (let c=0; c<nodeValues.length; c++)
        {
            for (let n=0; n<nodeValues[c].length; n++)
            {

                //Draw Weights
                if (c!=0)
                {
                    let weightValues = [];
                    let maxWeightValue = 0;
                    for (let w=0; w<ml.layers[c-1][n].length; w++)
                    {
                        const weightValue =   Math.min( Math.max(ml.layers[c-1][n][w] * nodeValues[c-1][n], 0), 15) ;
                        weightValues.push(weightValue);
                        maxWeightValue = Math.max(maxWeightValue, weightValue);
                        //const weightColor = "#" + weightValue + weightValue + weightValue + weightValue + weightValue + weightValue;
                        //painter.DrawLine( c*nodeHorizontalPadding,  columnVerticalPadding[c-1] + (w+1)*nodeVerticalPadding, (c+1)*nodeHorizontalPadding, columnVerticalPadding[c] + (n+1)*nodeVerticalPadding, weightColor);
                    }

                    for (let w=0; w<ml.layers[c-1][n].length; w++)
                    {
                        const weightValue = Math.floor( weightValues[w]*15/maxWeightValue ).toString(16);
                        const weightColor = "#" + weightValue + weightValue + weightValue + weightValue + weightValue + weightValue;
                        painter.DrawLine( c*nodeHorizontalPadding,  columnVerticalPadding[c-1] + (w+1)*nodeVerticalPadding, (c+1)*nodeHorizontalPadding, columnVerticalPadding[c] + (n+1)*nodeVerticalPadding, weightColor);
                    }
                }

                //Draw nodes
                const nodeValueScaled = Math.floor(Math.max(nodeValues[c][n]*15 / maxNodeValueInEachColumn[c], 0)).toString(16);
                const nodeColor = '#' + nodeValueScaled + nodeValueScaled + nodeValueScaled + nodeValueScaled + nodeValueScaled + nodeValueScaled;
                console.log(nodeColor);
                painter.DrawCircleFilled( (c+1)*nodeHorizontalPadding, columnVerticalPadding[c] + (n+1)*nodeVerticalPadding, nodeRadius,  nodeColor);
            }
        }

        






        

        //Move snake
        const maxVal = Math.max(...output);
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
            failed = true;
        }

        //make sure snake is not overlapping
        for (let i=0; i<snake.length-1; i++)
        {
            if (snake[i][0] == head[0] && snake[i][1] == head[1])
            {
                failed = true;
                break;
            }
        }

        //If the snake ml lost, reset.
        if (failed)
        {
            snake = [[1,2],];//[4,5]];
            snake[0][0] = Math.floor(Math.random()*numCells*0.5 + 0.25*numCells);
            snake[0][1] = Math.floor(Math.random()*numCells*0.5 + 0.25*numCells);
            apple[0] = Math.floor(Math.random()*numCells*0.5 + 0.25*numCells);
            apple[1] = Math.floor(Math.random()*numCells*0.5 + 0.25*numCells);
        }
    } 
    function train() {
        let bestScore = 0;
        let bestMachine = null;
        let columnInfo = [8,10,4];
        let parent = new ML(columnInfo);
        let bestScores = [];


        //Make a timer so it stops training after 1 minute max
        let endTime = new Date().getTime() + 60000;
        //let endTime = new Date().getTime() + 60000*5;

        for (let gen=1; gen<100000; gen++)
        {
            bestScore = 0;
            bestMachine = null;
            for (let i=0; i<1000; i++)
            {
                let ml;
                if (gen == 1 || i < 50)
                {
                    ml = new ML(columnInfo)
                } else if (i < 300) {
                    ml = parent.getChild(0.5, i);
                } else if (i < 600) {
                    ml = parent.getChild(0.2, i);
                } else {
                    ml = parent.getChild(0.08, i);
                }

                let score = 0;
                for (let run=0; run<10; run++)
                {
                    score += runGame(ml)/10;
                }
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

            if (bestScore > 10000 || new Date().getTime() > endTime)
            {
                break;
            }
        }

        ml = parent;

        const maxScore = Math.max(...bestScores);
        console.log("best score: "+maxScore);


        //Print model to console
        let output = String(columnInfo) + "\n";
        for (let L=0; L<ml.layers.length; L++)
        {
            for (let n=0; n<ml.layers[L].length; n++)
            {
                output += String(ml.layers[L][n]) + "\n";
            }
        }
        console.log(output);

    }
}









/*
8,10,8,5,4
1.8410933223107926,1.2128389388183716,3.727897906783687,-0.2493567927364203,-0.7959368256544774,0.004702459898647787,1.1555266559738024,0.46905762139639834
-1.04015480101327,1.8158344834495763,0.4723202082934051,1.0024961276215882,0.045842686768593106,0.4850560461881643,2.2969571295421853,1.0336474481610023
0.898595080318316,4.123388495748243,-0.40183712479328315,-0.13739505374479968,-0.5548705189769823,0.7199430051527568,-1.6627971049765005,1.1008875511604643
2.4087533606344973,-0.7704056459582086,0.9005523286461807,-1.668796569983991,-0.30970446474215274,-0.5435125516052827,-0.07850245667969113,0.25958327785539764
-2.250127442222729,0.644553686678488,1.6341675240090054,-0.24250216332731436,3.4088521655886934,0.0727744280217075,-1.4398892554683194,1.0737009605862704
-0.5287723678463176,1.229509695745696,-0.9440665991391023,1.0395978521913762,1.4721319345605404,-0.738756300962754,1.708498917274651,0.6604244727168568
0.7080627016168992,-2.065663091076898,2.200487416286615,-0.752584080514073,1.484666827135958,1.897552484250978,0.21950288043242064,0.23888840759082816
0.694031430263469,1.6281933788810439,1.3678157021150519,1.4502697728612137,-0.8621497310075061,0.6112566920974267,-0.015440522829646572,0.3371257976380487
0.6729157526286998,0.9187226037458447,-1.3129778603402698,-1.1108581617379591,2.3874943302329523,-0.06942028756184675,1.7985814396452946,1.6245065408126764
0.5953252083145769,0.2982134998727152,1.2389591633216537,-0.4957282919191379,2.7009591194799123,-2.1558770979408237,1.562195065532094,-2.405379985581021
0.7276263457397839,0.027212587056128147,0.23715522609331832,0.5172192778173861,1.7850121007042534,1.835643362129063,0.4957436091484438,-0.8076298865831036,0.6318230787257799,-1.4895967930172058
0.9399742431687443,1.7475421820661527,-0.6732911824295953,-0.08439704497422679,-0.373975959037142,2.8272138586869087,-1.1875095066706642,2.3382492824589955,-1.2840168896547666,-1.8928401634031429
-0.6122550243260817,1.2522280609025913,0.6905133269118356,1.3975666013302797,0.6941639575819337,-1.1915197143508232,0.6187415292094492,-0.21517985037532347,1.2544385965227107,-1.5539722793391753
1.7680354714995585,2.008337216284545,0.5194101526193438,0.5316134611272456,1.907117776895414,0.10322137443078955,2.5669337979841664,-1.4896479238466056,-0.6592310506802703,1.1132484344786593
0.9976658070580542,-1.5729194959972443,2.169604651316832,1.145722526064665,-0.8349152357846613,-1.2714910924227127,0.6182106755127349,-0.5875298940037927,2.494672197108438,0.22602473995855335
1.4442529993381117,2.0430815605764985,1.9913938446405455,1.981205585067253,2.1576391726881203,1.6186223893933178,1.5948940821053683,1.2597970281342652,-0.0019646279316543544,0.9256442632632795
0.4206041583325862,-2.082504014410429,-1.3514697163048628,-1.0087632262448931,3.328840756677573,-0.5877064492477061,1.391481457332654,0.9336156019035853,-0.4582092920630833,0.15889473604386053
-0.08152709698756286,-1.006113446764105,-0.39115171944733834,1.025349761223617,0.7459315227154041,1.7848645887660157,0.5855443801723649,1.3765464376752823,-1.4166074652555363,1.450403514353553
1.3321041627205576,3.2656950314977573,2.5581169635224037,1.5997509213324423,-0.5586451831611681,-2.095446125461023,2.165489323730745,0.044740674821569744
1.5496552747839016,-0.9495229210351869,1.8886647994842698,1.1597672520888538,1.0121423821515343,-0.6758413608212592,0.7114973028361893,0.4051750868504338
-1.7066911205746569,0.2867333108490518,0.029465911238159483,0.8378649568245005,1.4578930429714971,-1.2365363220404717,2.0234577851381155,0.080704302247575
0.6026889379663064,0.04197027171241784,0.445252320972833,2.409376455036396,2.7321232574259393,-0.8909317503071581,1.3993837006895418,0.814246812963455
2.4138561203453666,0.24238040136562153,0.5072473506654196,-1.3912339361579913,-0.6265307051044684,-1.7311066768801453,2.027828344812938,1.2475956644790562
1.4398116959526073,1.8278759662173258,-0.45857291567101516,-0.39242156889794894,1.409869580144705
0.15836415259141373,0.011387378530133156,0.9530095895711211,0.5610524768141013,1.718067634224101
1.7457802688515296,0.34027175096855156,0.7964880399630797,0.5471211719146745,0.6950198332709512
2.260497638060939,2.0418123048381083,0.3437675966250463,-2.085075461016245,1.3050910406128289
*/


/*
8,7,6,5,4
-0.6837457103298591,0.14694495809027394,1.1005319207802926,-1.016161536783875,0.1355779684165709,1.9153898616726905,-0.3052326764479038,0.9598852371182921
0.9170095964733224,2.046690946746587,2.7910462559758935,-0.6801076184366175,1.2727478577465037,0.450842536035671,1.740793753149192,1.5263214754576158
0.6188332402716689,0.09256640887512405,0.9621235014540217,1.5459319598257573,1.7735933422344794,1.3642429727450913,0.8602730641892611,2.430744322337921
-0.44246929926238837,0.06846230123553057,0.34121542121109033,-0.4508295273226191,1.2323432147649596,0.4196973311987873,-0.007286843349512559,-0.35204403031472603
1.772934248666367,0.48033507096440503,1.6946995224750327,0.9378425854730305,1.3348603418507576,1.8988681151864524,0.9113890862805797,0.9892343825658396
0.028620404825041613,0.8850114190760817,0.09441018979970506,1.0061234604006424,-0.1231514713195141,1.0221282386727246,-0.9458163177039175,-0.09410830855414601
1.1964162424261844,0.8581133972898569,-1.6201844437750772,0.004231546270673889,1.312733659779202,-0.5527129860424438,0.31833662132752455,2.022618975533846
1.0051694794205368,0.5983802765299148,0.03292839778438423,0.49390501551540383,-0.42916633781923424,0.11553491326452534,0.6167499003911011
-2.0364198892556744,0.553238770813071,-0.2093822433521023,-0.07992858657895197,1.9040819884678217,-0.12833541867420822,1.0678494952278206
0.9749778460163347,1.6880029947910022,-2.3625841042447493,1.5870718905135173,1.311519680822368,1.8416867111876876,-1.1203139157595121
0.298870782481001,2.1272553638418485,0.4286615024435399,0.5806490056226629,0.3611875154253995,0.49147317503873783,0.8317963748456697
0.9668293876630041,-0.6370527107036262,-0.08818067956876122,0.9757182017543067,-0.8621124471793907,2.178704322115226,1.720103106953277
0.2889296509491591,0.46894629961196915,-0.377256475891522,-0.8650277950184715,0.7113233555509644,0.6382129732884987,-2.4137106857348347
1.7660436998484605,-0.8956596954777083,2.1793861414116726,0.018076591723912377,0.8864434264661921,1.1538931444127554
0.12915383416061246,-0.14164279060857618,-1.0316632366497978,0.09140033131625871,3.840929338858976,0.04670771002208645
0.8519448316691437,1.9386947912391572,-0.12055591797601528,-0.7777901920726805,0.7216226634994272,-0.9917105732570686
0.774370716817719,0.0024268309405943295,0.13142333931789202,-1.7075934305667022,-0.2171740818139382,0.23049879609846477
1.7464269893769266,1.4174190346755258,-1.4405136962134886,0.4568017705149976,2.5804392632936777,2.743036296705523
1.0285330355696896,1.4479571481126872,0.04751550229325322,0.2024924848106513,0.49772058267051594
0.5952027915217463,-1.0618583880028476,2.2249257116969314,1.1590636914944814,-0.4769803980012711
0.11809053097452851,-0.8926885790433214,-1.280818722389864,0.6997239766513358,2.169562169481377
0.03573763022015131,1.4168478764874768,-1.3230167054815716,1.7307743007210439,2.4896651372613947
*/


/*
8,10,10,10,10,4
1.0508696099068306,1.0739682853694772,-1.3560684826367697,2.694614216827492,-2.6354890748357493,-1.4312821700558747,0.3896249888911178,1.3539929897089604
1.6083027063491482,-2.1599066995508074,-4.0150830315140835,0.6580183944993744,-0.7932570298551902,-2.131934052129349,-1.2271188722913748,3.9627464546751563
0.6822440137468532,2.2177928729555836,3.884971908050718,-2.008395762483231,-0.3302865998312421,-0.8447548481194067,-0.508343722909639,5.097687702563034
0.12474313368042225,2.437931614518084,-1.8497105113329042,-0.8756493823981684,-0.01950129909144434,-1.6566711579203877,-2.096228839721564,3.4744659922076093
0.3245505034287654,1.0005791310726113,-1.2509857146701338,2.5792793225048127,1.2222203092614978,-0.1612675817485677,-0.6590587633981605,-1.5971088957793467
3.1235983800157694,3.1247097695010044,0.46081606120398927,-2.170528872241872,-2.9352068352101157,-1.3506367717891463,-0.16759975137534205,3.9585748185444216
1.7493440050994782,-0.6860656584198166,2.4697189988076858,-2.977969547836472,1.0094024400746988,-0.594698674111063,1.8673157685242951,3.6108018955305607
-3.8915620435124874,3.7857949642066218,3.122793939313969,4.872935871445966,1.70939426197921,3.7078289234906303,-2.2857162998505545,3.5082178257416214
4.838070358627503,0.06127152812289861,-2.8596577407762123,0.1283889087358972,2.822049334250975,-1.6210800053665329,1.9445847458021206,-3.888217185618004
2.4987022736016007,-1.7041764179308965,3.6054298833959,-1.4374245475896283,0.4799204958863101,0.6848206618435014,0.06018669781773842,3.221023598534508
-2.1486248261731693,3.2369314140993404,1.544639401221235,0.5754725685428296,0.3808875139488924,0.19927525737440177,2.3264429208850466,-5.692623767547002,-0.3716441776312919,0.9229331106565312
-0.5114316120002597,4.035171298654279,0.7983511953291746,-1.1817483395025332,1.2958596744434123,3.0164913915319373,-2.168365940868306,0.6187672922687063,-2.171468371096164,1.4827723363396004
-0.8745988295158755,1.7992233067507757,6.403639844981814,-0.3828722651632222,0.9139056145389637,4.272054831655374,1.2679157069052307,0.5328579188537914,-0.7385130168460884,1.4707798459886556
0.09423371215988538,1.741624605638528,1.388776497851441,2.756823255561823,2.5295781186307678,1.214518503629664,1.4339121691681258,-1.234361096061404,2.8788195782868238,-0.7477006693548222
4.112461747513431,0.6829380578505369,1.9314835293247061,-3.0000218637760105,1.8665783688706838,-1.8474257891505368,-1.179061977533379,-0.3132245700876803,1.0174240789249787,-0.5475241824030513
0.5242170344215626,1.6978711549593095,3.641270702290957,2.04242349443737,2.2054153854738288,-0.9100106285138186,-1.860869582106671,-0.920554262149603,2.068590095645522,-3.119093675800806
2.8156144774863963,0.3818423762929415,-1.5558768651841577,-3.972399350778789,-1.6694582418461978,2.371770137565674,0.4869784308661788,1.1325864761956952,-0.9669125911475807,-3.7847888441112327
1.3826953333669652,4.570252044710638,3.4527816260260678,0.5015807661654372,2.4741568702601358,1.1726346349244967,3.253017386900579,0.2630640369512675,0.8458557626100034,-0.41445380755913563
2.6661807186663737,-7.36076375111977,1.269626842392436,1.439140654573645,5.1451998859039785,4.0032312652688455,0.058312823036263235,-1.3613421704716402,1.64116257468608,0.20165589976212203
2.631066141354308,-1.5142058432771581,0.8886774476169801,-2.838547360489522,3.4452277812697734,1.5497478273708374,0.5208803190048547,-0.9951387173044705,0.07488414975112365,-2.8077683695291924
1.3345381390629831,-1.7937606919486262,-3.9282187715242043,0.2498112157988722,2.5855211658498676,1.5365202063614023,-0.4648973080131828,2.381007250282915,4.068651778300542,0.835198003184244
-1.0679681089769768,2.058253966441257,1.2651686346772753,-1.9218974824089397,-0.14253492271768922,-0.6974061015711717,-1.3712436144432392,1.3983968236478501,-3.097763219295469,-0.5515072531857494
-1.8524291643972872,0.39231958371505177,-1.5207470065000934,-1.0776654167535626,0.18682647580524717,1.29718231450335,-0.748970328784218,0.99398716765866,0.0850438104841596,0.22496487202720897
2.7698822297251966,0.001735376021094484,-0.2518517513390667,1.58013796346202,1.7536116071589083,-3.511774849909211,-0.7965222254158212,-2.5862233655193037,-0.6688755307584066,-0.042659305323038924
1.892487094503324,-2.5330427390098156,-1.3982655526470447,2.5887945241487453,4.450844275261167,2.394733926061812,1.7999485274637503,0.7265966015013344,-0.947675655996389,-1.5288880093446418
-0.5212438890698786,-1.4656836734959227,-1.2097991330658184,1.9072325304339302,2.412022600622026,1.5494074400823639,0.6078749175080345,-0.110132722497922,1.424759253578126,-1.128218467547027
-1.581177557277856,2.213342077947864,-1.9885844015865872,-2.606643445352557,2.9385131984485624,0.8124486746819539,1.0338549198367648,-0.054245099762939314,-0.04775055917408354,0.6216170561363544
-0.9108502019260664,-4.6403463544323245,2.0457517760752744,1.0382793750161639,-0.33675485947894046,-0.8224964888294942,-1.352212242757243,1.5254644633472818,2.3975100549372614,-1.0829096948189754
2.556829634077103,-2.480626619246241,1.3202450101643568,-1.808357522398058,3.8553218250875645,-6.7377529103104985,1.938882617913243,0.3689638245644044,0.9993861781587365,1.332453295338409
0.524471465516349,-4.1246596150037504,1.608897897219343,-2.202694089154338,1.2855648451264166,4.25339793766009,4.402540830326294,2.9455475250742262,3.1730319220792302,4.371820349540029
1.7167919486177032,0.5812488783655599,-0.3090882784666151,3.674422114493452,-1.7250190732525073,3.3786432039714565,-2.631811418781355,1.7427688998006539,2.4961762026261067,-4.952925047268997
-1.8358282676021094,2.8850249394831957,2.182812949705846,1.979171350142872,2.188432672123619,0.8607392686273511,0.6562744597039397,1.8453764164233375,0.5693186821203456,1.6842325042000101
2.9392562137850033,2.4367099414190725,1.108302962830362,-2.0318744647444364,3.7589647134261988,-0.690136135689703,1.4310744127983317,-0.8501142999851731,-2.40408371376097,1.6758176739080222
-2.489710687887453,1.8934132186367545,-2.892367187839415,-2.031375405986523,6.454799891548934,1.140083252373498,-1.5988678857587642,-3.2302813613977346,-1.706548195765573,3.5239619507341358
2.4873951876429894,3.917694033290133,2.0215754902249543,0.9276935854995995,-2.730969558682985,-1.447282299978395,-0.34108228617597963,2.252517668373935,-1.3350857528050077,5.833918523411711
5.126505317122618,-0.7151202996948502,-1.1008606975112838,2.6434463688832492,2.692068589801446,1.4438065837154888,1.1255049439449578,2.8117917918170385,0.269423332405945,3.452028788059159
1.9546499693673107,2.704838388097833,0.4068244807968051,1.5258844097594857,-0.6148666917958261,-0.9615971851786822,-0.40112573104218563,-1.7574050161000474,-0.5874984492057534,1.6053283891297199
-0.7603629377427136,1.2706504074982268,-1.2417219855502801,3.39524988983156,0.013799465377215013,1.2884532345041895,3.8752983135083,0.4887616476003928,2.9223112923372354,-0.8069139007774471
-1.24963533765127,0.9169321946062716,-2.265262350934498,-0.7845895925015444,1.3810738887732048,-0.2081416184625251,-1.1642564467121959,1.3507722591165634,-0.8732005335452083,0.21348409785970382
-3.9326700145401428,-0.5051707121002177,2.841658357770607,1.7502249940274093,0.3041298788735791,2.3264667723490797,0.6525055472395201,1.109542771352788,0.2518224735391178,-3.650302604720842
2.9418114600282474,0.5529824634908712,2.2476534282790928,2.3227777806855845,-3.2473707556890377,0.56786376535287,0.8841980671938929,0.6990124790398584,1.5789486716686658,1.3337644554118722
3.9769506824451026,-2.06415607873482,0.6854331277288015,2.5230801547339743,6.489402208117029,1.7945434266972655,0.13140870134039945,1.6139162532923588,-0.8404486485733788,-0.23550643067387556
2.339501163750354,1.392885875208137,-0.20821224243015382,-3.5064275595701275,2.884935383573779,1.402755034655079,1.3208536002316833,-0.800192036964126,0.5607319959982161,-0.45102615906109855
0.43538427338649577,4.466466356458402,2.004301672372055,-1.0933248128661746,1.2622411378382519,-0.1805893698093521,0.7883821058621319,1.1210183694335851,-2.0815332029513973,-0.39492569951838635
*/


/*
8,10,10,10,4
1.8147255196211753,3.420033428818645,-4.520876225912474,0.5024011157342261,-4.457937913418881,-2.2136280005750617,0.3639682607730029,0.23808284415779987
3.991753629849304,-0.31673103633718236,1.8111660220908616,-0.41565569847355954,-1.9130677152769622,1.553720666298492,0.7547655788464556,0.27814940203793614
1.772984334226113,-1.600699209397715,1.0371931233160903,1.9917267142557757,1.3811469988383511,-3.9364777147891488,-0.513524885088505,-2.119286597455711
0.9048719690679744,2.8009368081916826,-0.7185904012049662,-1.8057381168847224,0.027081133879708896,-2.036287805397353,1.0060282183639027,0.4220539602110701
3.517436543559218,-2.079391016668674,0.3733101373106251,-0.4509453910759412,0.5616644744831799,1.5762494883364826,1.375114368415368,0.5802908427444394
0.38048688646124473,1.0005887092245387,-0.41630594668088217,-1.4832101456615154,0.3037187233602696,0.5093223217473103,-4.055524748969636,0.4931073906420159
1.803084087861796,2.0488848241889053,0.2742446543109155,4.094528595298704,-3.912635057490252,-3.845174768685352,-1.8944564112104665,1.6603294943791258
0.4757564554670559,0.04941601790177527,2.7593851570276833,0.8263187517799485,-1.0650922080027359,-1.1922670726994238,-0.3899927179965733,-2.4122867454185473
-1.7945794619101292,-3.568288401187199,-0.47520684226063825,0.7298320020062075,-2.999160176307992,0.005907093494192606,-0.9400390274335904,3.0135459615122113
4.038360119072356,-0.2406707742924973,-1.8956863338997898,2.7197234080980017,1.9659613438416517,2.586831629518618,-1.5285730555473105,2.5833453840630467
0.3706231753668292,5.194980102354018,1.3637769781621076,2.5718428947038463,2.5059706991160953,-1.0270632468097558,-0.18647857540120635,-2.938381096219323,6.608442730248162,-0.1471201835406462
-1.1486592470471308,-2.528047103638774,1.020770683392608,5.266367067834407,3.290424539126051,2.874655992848383,-0.18898349056673613,1.8978052957756333,2.8114588906378164,3.703288340875599
0.004954751301353338,0.7675565985354877,3.167731787162937,2.2141529754439535,-2.469273829065429,3.4774831992622275,3.6476119719412394,-1.871539440525189,0.19773934564783766,-0.3220441772988224
0.8161806689231648,-2.133036271460706,-1.1754198317944131,0.03823182830651928,1.7586965393093588,3.3463714060365013,2.8518397944051013,-0.1296640705512793,0.31886708251287565,0.5274775776218686
2.6142758579284977,0.2942125982031141,-3.207401594298505,-1.7312763687473478,-0.17194258719227953,3.168375068832921,0.6968852514745802,-0.5036043097694906,2.1185428054786732,-1.4099030332993652
-2.5559116988927424,4.82277625514229,3.1702352242252854,0.5551510296529301,-0.43319589263319125,0.4073832086622574,-1.5490969635787029,-4.414490468224,-5.100795411026762,0.031761968784992684
-1.620080797680373,5.000974661314469,-2.462187432531534,-1.4594089166549284,0.372192549448807,0.22006554494170547,1.1691848899315884,-4.049921987778511,1.1886116500189428,2.2193963239483767
1.6781638536801773,0.1766283980397738,-3.822454953445801,6.240699013583527,0.974603681973751,1.2586462000799559,1.5869367925897273,-1.3062535737348362,0.3236112735043347,0.4991925279106665
2.2591630186742666,0.7746405466691442,-1.3194234781471916,-1.107361206764999,0.03186908616901343,0.14277280624073746,-0.07081624842507303,-2.070381702999894,0.6142651729854508,2.4115170979118905
2.6941371707356647,-2.4244781842075227,-0.9266101044494774,-1.4794403791492288,0.1952726244873507,-3.3233994009418892,-0.910647824082731,-2.709118814015851,3.697904176503932,1.7895235100436175
-0.196364819858455,0.15773317322105476,2.9928519422404434,-1.1592112817583937,1.4941149189290814,-1.323299081882327,-1.1627249429264792,-1.1728829649052852,2.7709181629982598,3.014238467261855
1.224030730167096,-0.008029462150868805,-0.7741086543402949,4.57613109924671,3.4031486099469297,4.5432503010855765,0.798326910873294,0.1589014380720393,-1.239415295475849,0.9285484742887785
5.523837781428939,1.9541358734577332,5.258414309451226,-3.8584333534265904,-2.1374719431808096,2.64577096925541,1.064557838028227,4.380760034560106,0.6759943159331305,-3.2185317734390404
-1.6121320336391354,-5.4206429668296705,1.347450115164718,0.8381292121403233,2.0633841561812827,0.05884260907446848,-1.997170803506819,-1.2852347275998703,-1.7806922352983399,0.35085723188454165
-1.705806941173485,1.3469055870847009,-0.475220330628114,3.8582572005994895,-1.493963881951365,3.67201917944274,-2.6006905949093326,1.5678024911339645,3.7942424691110803,1.484531135956377
3.835546423724967,-4.055912328225282,-0.3496503133928834,-1.180669957115658,2.7021605771036388,1.1435222414414978,4.752811154252762,-0.2211640230766527,1.5634789964350706,2.3799909971521926
3.9165290726880886,0.8630606813627991,2.0270456956211547,0.1955612487535874,-2.5143057599927303,2.422049316918831,3.4492671690364096,4.155541391998408,4.227135248333455,5.659991460044945
1.728717341666674,-2.4816792877492535,1.6233227177539788,3.503534349659386,-5.055605638683474,-0.9521679100668367,0.4149941790992395,0.6556247106887069,-1.0452328915157747,0.6287423485440166
-1.5120392276839012,-2.9134032118308504,2.217633081304832,0.19830133067173292,1.3717760077569157,1.0461719887896161,0.10460677436688673,-1.4683428472134565,5.734195760781821,-0.43569706589436963
-1.562902270698297,1.816120640396693,-0.45939170635247495,-0.9939219777302444,-2.0265479537951854,-2.455519777467913,1.8499445330382824,4.893139059127859,1.3961429383783506,-1.1084879361787603
4.238695975538358,5.219809312308236,2.6063955170100184,0.3250741967226839,1.4468319764923572,1.1484496719335013,-2.2183232312495806,-1.7340578371660977,1.5530598751714833,1.4804233451125577
0.22793909798952702,-2.5736874278745536,4.091999998858416,3.549783436227714,0.7102818691551794,0.18129529236536837,1.9386889418282154,0.9218032933774024,1.1301758257045929,-0.6312118723362753
-1.959705197099703,0.09434349852576088,-4.873609021324217,1.6644198178474856,-3.733018876914948,-0.8585828417820136,-4.216743171191545,-2.785432211100396,-1.4421092162583675,-3.3621617723556483
-0.08708167182620755,2.106728167744047,-0.7881674842846473,2.7132338166568606,-3.254974624342007,1.642436175558559,1.0285861449220841,2.5958845613763457,-0.30940445701182184,1.8278867612475402
*/


/*
8,10,10,4
-4.301710864366431,0.8662122606768411,1.1815877436088114,1.0847635608384516,-5.241861141685687,-1.8299297473243439,0.34553485035888576,-0.1899122894103982
0.7533939233257715,0.3095522126485506,-4.461460603006369,2.2856850215507403,1.3309034319273414,-2.5345078678943893,-2.981137278557868,2.6992790643843345
-2.6808032997628253,1.3872016260507192,-2.9643615172680926,0.38499877303442054,-0.10572151951231669,-1.3487323126134108,1.1125222132563417,0.45369296735462084
-0.7244513031025619,-0.4206188279382823,-1.79901867838158,2.496762598372312,-0.4988391677561467,2.555137252632325,2.6919422782212745,-0.61043964894226
9.433381048721587,0.04230699290750192,0.7562853986111919,-2.8343402515383636,1.4846597263164327,3.7896703276538743,-4.3135148130439935,-4.749813390226505
-0.7165376683106196,2.23962521820843,3.983768816693241,0.9489563987851103,2.6506367652754963,0.5051573752102725,-1.050790825110574,-0.23517876658393788
-1.5068217661505272,0.0675143348384955,-2.7221760571506297,-0.4969373015389831,1.849386509014579,2.8871263335867434,-0.2182860947298163,-3.8127395077623034
3.0992486119949074,3.824916103877781,1.2473649224631254,-4.25930813509154,-0.8640800728091689,1.6944800825593405,3.4100380663603547,2.3183469089262156
-0.6024066236773991,1.7083896882800724,-0.268029594446071,4.183144847279945,0.3336953643501869,-2.4445592026939953,4.179786440119175,-1.4635650521270869
-2.370574433055779,-1.934980702861551,-0.33695470449544757,-1.313869008316951,-3.172824416307877,4.241848559572513,-0.24772755736147004,2.3666312304510497
5.740989152865147,0.4353338658323215,2.9115007127818937,3.045065001410826,0.019131468252866324,-2.7143196804608327,0.05918275487146055,0.4198132140620723,-0.2366715951514961,-1.7598007234633544
2.4596356004979443,-0.261768863721437,-0.5859825531421338,-1.5574612029074335,0.16456988616612064,1.3000508987098085,-1.5726432361079137,-2.3837977222073525,4.235627432057616,1.7344641496359416
2.782471362737879,11.053329931279553,-0.4302912467050509,-0.6530565581983133,-0.3103771869707364,0.661723409568373,-0.6808362062185177,1.9525058231104766,5.010335912015359,2.3683803278447653
0.7359250274894823,-0.8559818534917099,1.5080693561526344,2.5094474475227693,-0.523999052970141,0.8470676567124787,2.2646811454991465,-1.769078231721421,1.2672035667660069,-2.8471969881187507
2.6823650459607262,2.6382719011787046,2.1410957628481895,3.621460427090228,-1.4488862368165047,1.1251494576604189,-0.3851355832237723,-2.6267008726335375,-0.8768104404393816,0.7167702142376996
0.8317640944991626,-0.31061312127159346,3.649702647089296,0.3694762957479669,0.5511716235475193,0.8498805683141659,0.10708788091442856,1.1915295865302948,0.841556967637685,2.0548276795896894
-0.6853821313340533,-1.4771788296863382,-0.8420893602167365,4.28869615888004,-2.040377467477414,-0.6221814715201991,0.3194234322217486,-3.6744256636934107,-1.413506921367058,2.810872340543967
-4.116426038204628,0.9595796475199717,-3.5168127762926247,-1.3621766486128437,1.1508814516588863,-1.5916995666390867,-2.309812055978227,4.038075225716055,-2.531329293222493,-2.1969801045487816
2.140380747850108,-1.5824219728791757,0.049935960572716764,5.086314357451586,2.886746247130925,1.1103830937058174,5.155424340758232,1.9541697647402563,-7.788571642720999,0.1901574910082118
2.912993028398849,-1.4697902061507726,-2.895543518713862,-2.3297322703709127,-0.7983749147115159,-0.779913350850535,0.0634269677508531,-3.123576495681885,8.801591658581968,2.1487808961328483
2.2587201896052442,-0.4596836106164247,-0.7325407139066019,2.8478155348482397,3.838207231547655,-1.7523821848270131,-2.0229785668554277,3.775466858176975,4.233858628930847,-2.3566193878638364
1.0272221226477485,4.586574489893042,-2.6521569306450017,1.410254786295645,-1.0727969486940108,-1.2420371687676612,-1.0333176359796588,3.8217202665942582,0.506448102804281,1.6123646393087823
-2.6278967133002937,4.790060644999243,-4.276574892499845,2.765063070545908,0.30615083784168107,2.8497247399282863,-0.12035819517699453,2.9851791861556753,3.1726599983872052,3.991737099280756
2.230077038043694,0.27863508085563415,0.6158852243937618,-1.8474460393042769,0.13336468220404354,5.2618747641522035,5.590067467641053,2.1764997875103136,4.985709687213263,6.138971756031425
*/




{

    class Car {
        constructor(x=0,y=0, ml = new ML([10,5,2]))
        {
            this.x = x; //float x pos
            this.y = y; //float y pos
            this.a = Math.random() * 3.14159265 * 2; //float angle, from 0 to 2PI
            this.ml = ml;
            this.tick = 0;
        }
    }

    const canvasElement = document.getElementById('carCanvas');
    const p = new Painter(canvasElement);

    //Set canvasElement shape
    let bb = canvasElement.getBoundingClientRect();
    canvasElement.width = bb.width;
    canvasElement.height = bb.height;

    //Grid width and height are image width/height
    const numColumns = 100;
    const aspectRatio = bb.width/bb.height;
    const numRows = Math.round(numColumns/aspectRatio);
    const horizScale = bb.width/numColumns;
    const vertScale = bb.height/numRows;

    //grid data
    const grid = []; //in grid[row#][column#] form
                     //in grid[y][x] form
    


    generateTrack();
    function generateTrack()
    {
        for (let r=0; r<numRows; r++)
        {
            let row = [];
            for (let w=0; w<numColumns; w++)
            {
                row.push(1);
            }
            grid.push(row);
        }

            
        let cx = numColumns/2;
        let cy = numRows/2;

        let t1 = Math.random()*10;
        let t2 = Math.random()*10;
        let t3 = Math.random()*10;

        let a1 = numColumns/30 + Math.random()*2;
        let a2 = numColumns/30 + Math.random()*3;
        let a3 = numColumns/30 + Math.random()*4;

        let r = 20;
        for (let a=0; a<Math.PI*2; a+=0.025)
        {
            r = Math.min(numRows, numColumns)/6 + Math.sin(a*3 + t1)*a1 + Math.cos(a*5 + t2)*a2 + Math.cos(a*8 + t3)*a3 + Math.random();
            let x = Math.round(  cx + Math.cos(a)*r + Math.cos(a)*10 );
            let y = Math.round(  cy + Math.sin(a)*r  );

            grid[y][x-1] = 0;
            grid[y][x] = 0;
            grid[y][x+1] = 0;

            grid[y+1][x-1] = 0;
            grid[y+1][x] = 0;
            grid[y+1][x+1] = 0;

            grid[y-1][x-1] = 0;
            grid[y-1][x] = 0;
            grid[y-1][x+1] = 0;
        }
    }


    const car = new Car(0, numRows/2);

    renderBackground();
    function renderBackground()
    {
        //clear canvas
        p.Clear('#111111');
        for (let r=0; r<numRows; r++)
        {
            for (let c=0; c<numColumns; c++)
            {
                if (grid[r][c] == 1)
                {
                    p.DrawRectFilled(c*horizScale, r*vertScale, horizScale, vertScale, 'blue');
                } else {
                    p.DrawRectFilled(c*horizScale, r*vertScale, horizScale, vertScale, 'green');
                }
            }
        }

        //p.DrawCircleFilled(car.x*horizScale, car.y*vertScale, 5, '#ff111188');
    }

    //Get start positions
    let startX = null;
    let startY = Math.round(numRows/2);
    for (let c=0; c<numColumns; c++)
    {
        if (grid[startY][c] == 0)
        {
            startX = c;
        }
    }
    if (startX == null) { console.error("Could not find startX for cars."); }

    //Generate 1000 new cars
    const cars = [];
    const columnInfo = [10,5,2]
    for (var i=0; i<1000; i++)
    {
        cars.push(  new Car(startX, startY, new ML(columnInfo))   );
    }


    //let updateInterval = setInterval(update, 10);
    function update()
    {
        renderBackground();
        let carX = 0;
        let carY = 0;
        let numFailed = 0;

        let bestCar = new Car();
        let bestCarDist = 0;//Math.sqrt( Math.pow(bestCar.x,2) + Math.pow(bestCar.y,2) );
        for (let i=0; i<cars.length; i++)
        {
            //if (cars[j].tick > bestCar.tick) {bestCar = cars[j]; }
            let newD = Math.sqrt( Math.pow(cars[i].x,2) + Math.pow(cars[i].y,2) ) - cars[i].tick/3;
            if (newD > bestCarDist) { bestCarDist = newD; bestCar = cars[i]; }
        }
        console.log("Best car tick: " + bestCar.tick);
        for (let i=0; i<cars.length; i++)
        {
            const car = cars[i];
            carX = Math.round(car.x);
            carY = Math.round(car.y);
            let gridSquare = 1;
            try { gridSquare = grid[carY][carX]; } catch { 
                //console.log(carY, carX, startX, startY);
                gridSquare = 1;
            }
            if (gridSquare != 0) { 
                cars[i].ml = bestCar.ml.getChild(0.2);
                cars[i].x = startX;
                cars[i].y = startY;
                cars[i].a = Math.random();
                cars[i].tick = 0;
                numFailed += 1;
                continue;
            }

            //Create input Data
            const inputData = [
                grid[carY-1][carX-1],
                grid[carY-1][carX],
                grid[carY-1][carX+1],

                grid[carY][carX-1],
                grid[carY][carX],
                grid[carY][carX+1],
                
                grid[carY+1][carX-1],
                grid[carY+1][carX],
                grid[carY+1][carX+1],
                
                car.a,
            ];
            const output = car.ml.compute(inputData);
            if (isNaN(output[0])) {console.log("output is NaN"); car.a = 0; output[0]=0; }
            car.a += output[0];
            car.x += Math.sin(car.a)*0.5;
            car.y += Math.cos(car.a)*0.5;
            car.tick += 1;
            p.DrawRectFilled(car.x*horizScale, car.y*vertScale, 5,5,'#ff1111');
        }
        console.log(numFailed);
    }

}