

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
            //output.push( (sum<1)?0:1 );
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
    getCost(input, output)
    {
        const ret = this.compute(input);
        let cost = 0;
        for (let i=0; i<output.length; i++)
        {
            cost += Math.abs(ret[i] - output[i]);
        }
        return cost;
    }
    stochastic(input = [], output = [], trainingConstant = 0.0001)
    {
        /// \theta = \theta - a*gradient(theta)
        /// gradient(theta) = x_i * (x^T*theta - y)
        const nodeValues = this.getModelNodeValues(input);
        //console.log(nodeValues);
        for (let layerOn = this.layers.length-1; layerOn > -1; layerOn-=1)
        {
            const xs = nodeValues[layerOn];
            //console.log("output: " + output);
            //console.log("Layer on: " + layerOn);
            for (let node=0; node<output.length; node++)
            {
                const y = output[node];
                //console.log("Layers:", this.layers);
                //console.log("Layer on: " + layerOn);
                //console.log(this.layers[layerOn])
                let thetas = this.layers[layerOn][node];
                let gradient = -y;
                for (let i=0; i<thetas.length; i++)
                {
                    gradient += thetas[i]*xs[i];
                }
                let gradients = [];
                for (let i=0; i<xs.length; i++)
                {
                    gradients.push(gradient * xs[i]);
                }
                for (let i=0; i<gradients.length; i++)
                {
                    thetas[i] -= trainingConstant*gradients[i];
                }
                //console.log(gradients);
            }
            output = xs;
        }
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




    

const columnInfo = [9,7,2];

const trainingData = 
[
    {
        input:[1,0,0, 1,0,0, 1,0,0],
        output:[1,0]
    },
    {
        input:[0,1,0, 0,1,0, 0,1,0],
        output:[1,0]
    },
    {
        input:[0,0,1, 0,0,1, 0,0,1],
        output:[1,0]
    },

    {
        input:[1,1,1, 0,0,0, 0,0,0],
        output:[0,1]
    },
    {
        input:[ 0,0,0,1,1,1, 0,0,0],
        output:[0,1]
    },
    {
        input:[0,0,0,0,0,0,1,1,1],
        output:[0,1]
    },
];

let ml = new ML(columnInfo);
let bestCost = 0;

for (let i=0; i<trainingData.length; i++)
{
    bestCost += ml.getCost(trainingData[i].input, trainingData[i].output);
}

for (let j=0; j<1000; j++)
{
    for (let i=0; i<trainingData.length; i++)
    {
        ml.stochastic(trainingData[i].input, trainingData[i].output);
    }
}

let newCost = 0;
for (let i=0; i<trainingData.length; i++)
{
    newCost += ml.getCost(trainingData[i].input, trainingData[i].output);
    const ret = ml.compute(trainingData[i].input, trainingData[i].output);
    for (let j=0; j<ret.length; j++)
    {
        console.log(ret[j]+" vs "+trainingData[i].output[j]);
    }
}

console.log("Initial cost: " + bestCost + "\nNew cost: " + newCost);



/*
for (let i=0; i<trainingData.length; i++)
{
    bestCost += ml.getCost(trainingData[i].input, trainingData[i].output);
}
console.log(bestCost);


for (let gen = 0; gen < 10000; gen++)
{
    //ml = ml.getChild();
    //ml = ml.getChild(0.2);
    for (let m = 0; m < 1000; m++)
    {
        

        const layer = Math.floor(Math.random() * (ml.layers.length)) ;
        const node = Math.floor(Math.random()* ml.layers[layer].length);
        const weight = Math.floor(Math.random() * ml.layers[layer][node].length);
        const dif = (0.5 - Math.random());
        //console.log(layer, node, weight);

        
        //console.log(ml.layers[layer][node][weight]);
        let cost2 = 0;

        ml.layers[layer][node][weight] += dif;

        let i = Math.floor(Math.random()*trainingData.length);
        let t = 0;
        while (t < 5)
        {
            cost2 += ml.getCost(trainingData[i].input, trainingData[i].output);
            i+=1;
            if (i >= trainingData.length)
            {
                i-=trainingData.length;
            }
            t++;
        }
        
        if (cost2 < bestCost)
        {
            console.log("BETTER: " + cost2);
            bestCost = cost2;
        } else {
            ml.layers[layer][node][weight] -= dif;
            //console.log("cost2: " + cost2);
        }
    }
}


for (let i=0; i<trainingData.length; i++)
{
    //cost2 += ml.getCost(trainingData[i].input, trainingData[i].output);
    let ret = ml.compute(trainingData[i].input);// trainingData[i].output);
    for (let j=0; j<ret.length; j++)
    {
        console.log(ret[j].toFixed(2) + " vs " + trainingData[i].output[j]);
    }
}*/
console.log(ml);

console.log("done");



