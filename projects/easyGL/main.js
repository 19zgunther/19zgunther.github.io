



const c1Color = new vec4(.6,.3,.3,1);
const c2Color = new vec4(.3,.6,.3,1);
const c3Color = new vec4(.3,.3,.6,1);
const c4Color = new vec4(.6,.3,.6,1);
const c5Color = new vec4(.3,.1,.2,1);

const easyglInstances = [];



window.addEventListener('resize', resize);
document.addEventListener('resize', resize);

resize();
function resize(event)
{

    //Adjust for mobile view
    try {
        if (window.innerHeight > window.innerWidth)
        {
            const divs = document.getElementsByClassName('flexDiv');
            for (let i=0; i< divs.length-1; i++)
            {
                divs[i].style.flexWrap='wrap';
            }

            const canvases = document.getElementsByClassName('daCanvas');
            for (let i=0; i<canvases.length; i++)
            {
                canvases[i].style.width='98vw';
                canvases[i].style.height='50vw'
            }
        }
    } catch (e){
        console.error("Failed to adjust for width: ",e);
    }

    for (let i=0; i<easyglInstances.length; i++)
    {
        easyglInstances[i].resizeListener(event);
    }

}


//canvas 1
{

    const canvasElement = document.getElementById( "c1" );
    const easygl = new EasyGL( canvasElement );
    easyglInstances.push(easygl);
    easygl.setClearColor(c1Color);
    easygl.setCameraPosition( 0, 0, 2 );
    easygl.setPerspective();
    easygl.createObject( 'myObject1' );
    easygl.setObjectReflectivity('myObject1', 0.6);
    
    let t=0;


    let updateInterval = setInterval( update, 100 );


    function update() {
        t += 0.03;
        easygl.setObjectRotation( 'myObject1', t, t/2, t/3 );
        easygl.clear();
        easygl.renderAll();
    }

    canvasElement.addEventListener('mouseenter', function() {
        clearInterval(updateInterval);
        updateInterval = setInterval(update, 20);
    });
    canvasElement.addEventListener('mouseleave', function() {
        clearInterval(updateInterval);
        updateInterval = setInterval(update, 100);
    });


}

//canvas 2
{

    const canvasElement = document.getElementById( "c2" );
    const easygl = new EasyGL( canvasElement );
    easyglInstances.push(easygl);
    easygl.setClearColor(c2Color);
    easygl.setCameraPosition( 0, 0, 3 );
    easygl.setPerspective();

    let sphere = generateSphereMesh(1,0.7,0);
    easygl.createObject( 's1' , null, null, null, sphere.vertices, sphere.indices, sphere.normals, sphere.colors);
    easygl.setObjectPosition( 's1' , 0,2,0);
    easygl.setObjectReflectivity('s1', 0.6);

    sphere = generateSphereMesh(2,0.7,0);
    easygl.createObject( 's2' , null, null, null, sphere.vertices, sphere.indices, sphere.normals, sphere.colors);
    easygl.setObjectPosition( 's2' , 0,0,0);
    easygl.setObjectReflectivity('s2', 0.6);

    sphere = generateSphereMesh(3,0.7,0);
    easygl.createObject( 's3' , null, null, null, sphere.vertices, sphere.indices, sphere.normals, sphere.colors);
    easygl.setObjectPosition( 's3' , 0,-2,0);
    easygl.setObjectReflectivity('s3', 0.6);
    
    //easygl.setObjectRotation( 'myObject1', 0.8, .1, 1);

    let t=0;
    let updateInterval = setInterval( update, 100 );
    function update() {
        t += 0.1;
        easygl.setDirectionalLightingDirection( 
            Math.cos(t), 
            Math.sin(t/2), 
            Math.sin(t/3) );
        easygl.clear();
        easygl.renderAll();
    }

    canvasElement.addEventListener('mouseenter', function() {
        clearInterval(updateInterval);
        updateInterval = setInterval(update, 20);
    });
    canvasElement.addEventListener('mouseleave', function() {
        clearInterval(updateInterval);
        updateInterval = setInterval(update, 100);
    });


}

//canvas 3
{


    const canvasElement = document.getElementById( "c3" );
    const easygl = new EasyGL( canvasElement );
    easyglInstances.push(easygl);
    easygl.setClearColor(c3Color);
    easygl.setPerspective();
    easygl.createObject( 'myObject1' );
    easygl.createObject( 'myObject2' );
    easygl.createObject( 'myObject3' );
    easygl.setObjectPosition( 'myObject1', 1, 1, 1,);
    easygl.setObjectPosition( 'myObject2', -1, -1, -1,);
    easygl.setObjectRotation( 'myObject1', 0.8, .1, 1);
    easygl.setObjectColor( 'myObject1', new vec4(1,0,0,1));
    easygl.setObjectColor( 'myObject2', new vec4(0,1,0,1));
    easygl.setObjectColor( 'myObject3', new vec4(0,0,1,1));

    easygl.setObjectReflectivity('myObject1', 0.2);
    easygl.setObjectReflectivity('myObject2', 0.5);
    easygl.setObjectReflectivity('myObject3', 0.7);

    let t=0;
    let updateInterval = setInterval( update, 100 );
    function update() {
        t += 0.03;
        easygl.setObjectRotation( 'myObject2', t,t,t);
        easygl.setCameraPosition( 4*Math.cos(t), 0, -4*Math.sin(t) );
        easygl.setCameraRotation( 0, -t -Math.PI/2, 0);
        easygl.clear();
        easygl.renderAll();
    }

    canvasElement.addEventListener('mouseenter', function() {
        clearInterval(updateInterval);
        updateInterval = setInterval(update, 20);
    });
    canvasElement.addEventListener('mouseleave', function() {
        clearInterval(updateInterval);
        updateInterval = setInterval(update, 100);
    });

}

//canvas 4
{


    const canvasElement = document.getElementById( "c4" );
    const easygl = new EasyGL( canvasElement );
    easyglInstances.push(easygl);
    easygl.setClearColor(c4Color);
    easygl.setPerspective();

    const sphere = generateSphereMesh(3,1);

    easygl.createObject( 'myObject1' );
    easygl.createObject( 'myObject2' );
    easygl.createObject( 'myObject3' , null, null, null, sphere.vertices, sphere.indices, sphere.normals, sphere.colors);
    easygl.setObjectPosition( 'myObject1', -1, 0, 0,);
    easygl.setObjectPosition( 'myObject2', 1, 0, 0,);
    easygl.setObjectPosition( 'myObject3', 0, 0, 0,);

    easygl.setObjectReflectivity('myObject1', 0.6);
    easygl.setObjectReflectivity('myObject2', 0.6);
    easygl.setObjectReflectivity('myObject3', 0.6);

    easygl.setObjectColor( 'myObject1', new vec4(1,0,0,1));
    easygl.setObjectColor( 'myObject2', new vec4(0,1,0,1));
    //easygl.setObjectColor( 'myObject3', new vec4(0,0,1,1));


    


    let t=0;
    let updateInterval = setInterval( update, 100 );
    function update() {
        t += 0.03;

        easygl.setObjectColor( 'myObject3', new vec4(0,0,1,Math.sin(t*3)/2+0.5));

        easygl.setCameraPosition( 4*Math.cos(t/2),0, -4*Math.sin(t/2) );
        easygl.setCameraRotation( 0, -t/2 -Math.PI/2, 0, 0);


        easygl.setObjectRotation( 'myObject3', t/10, t/11, t/12);

        easygl.clear();
        easygl.renderAll();
    }

    canvasElement.addEventListener('mouseenter', function() {
        clearInterval(updateInterval);
        updateInterval = setInterval(update, 20);
    });
    canvasElement.addEventListener('mouseleave', function() {
        clearInterval(updateInterval);
        updateInterval = setInterval(update, 100);
    });

}


//canvas 5
{

    //INIT///////////////////////////////////////////////////////////////
    //This is abasic test program to test the EasyGL & FPC libraries
    //First, get the canvas element
    const canvasElement = document.getElementById('c5');
    if (canvasElement == null) { throw "no testCanvas."; }

    //Create the EasyGL and FPC objects
    const gl = new EasyGL(canvasElement);
    easyglInstances.push(gl);
    const fpc = new FPC();

    //SETUP////////////////////////////////////////////////////////////////////////////////////
    //Add the event listeners for the FPC
    ['keydown', 'keyup'].forEach( function(e) {
        document.addEventListener(e, function(event) {fpc.eventListener(event)});
    });
    ['mousedown','mouseup','mousemove'].forEach( function(e) {
        canvasElement.addEventListener(e, function(event) {fpc.eventListener(event)});
    });

    //add event listener for window resize, so the gl canvas can be resized
    window.addEventListener('resize', function(event) {gl.resizeListener(event)} )


    //Set some basic parameters for the EasyGL instance
    gl.setPerspective(); //set to default perspective mode values
    gl.setClearColor(c5Color);

    randTexture = [];
    for (let i=0; i<256*4; i++)
    {
        randTexture.push(Math.random()*255);
    }
    gl.createTexture("randTexture", randTexture);

    //Create some EasyGL objects
    gl.createObject('t1F', new vec4(0,0,2), null, null, [-0.7,0,0, 0.7,0,0, 0,1,0],  [0,1,2, 0,2,1],  [1,0,0, 0,1,0, 0,0,1], [1,0,0,1, 1,1,0,1, 1,0,1,1]);
    gl.createObject('t2F', new vec4(0,0,-2), null, null, [-0.7,0,0, 0.7,0,0, 0,1,0],  [0,1,2, 0,2,1],  [1,0,0, 0,1,0, 0,0,1], [1,0,0,1, 0,1,0,1, 0,0,1,1]);
    gl.createObject('myCube', new vec4(2,0,0), new vec4(0,3.14/4), new vec4(1,2,3));
    gl.createTextureObject('transCube', new vec4(-2), null, null, null, null, null, null, "randTexture");
    gl.createObject('bigCube', new vec4(0,2,0), null, null, undefined, undefined, undefined, new vec4(0,1,0,1));

    gl.setObjectReflectivity('bigCube', 0.6);
    gl.setObjectReflectivity('transCube', 0.6);
    

    let newColors = [];
    for (let i=0; i<24; i++)
    {
        newColors.push(Math.random(), Math.random(), Math.random(), 1);
    }

    gl.setObjectColor('bigCube', newColors);

    fpc.setPosition(0, 2, -4);

    //RUN////////////////////////////////////////////////////////////////////////////////////
    //The update loop runs every frame
    let updateInterval = setInterval(update, 1000); //set update interval for 10ms, this determines frame rate
    let t=0;

    //Update function, which runs once every frame. 1000/10 = 100FPS
    function update()
    {
        t += 0.03;
        //Update FPC, and send data (rotation & position) to EasyGL
        fpc.update();
        gl.setCameraPosition(fpc.getPosition().mul(1,1,-1));
        gl.setCameraRotation(fpc.getRotation());

        //Randomly modify rotation and position so people know it's live...
        fpc.setPosition( fpc.getPosition().add(new vec4(Math.sin(t)/700, Math.cos(t/2)/1000, Math.sin(t/3)/2000)) );
        let rot = fpc.rotation;
        fpc.rotation = new vec4( rot.x, rot.y + Math.sin(t)/1000, rot.z + Math.cos(t)/1000 , rot.a)

        //Rendering! first, clearing the screen, then, rendering all objects
        gl.clear(); //clear the screen
        gl.renderAll(); //can also use gl.renderObject(objID) to render only specific objects instead of all objects
    }
    
    canvasElement.addEventListener('mouseenter', function() {
        clearInterval(updateInterval);
        updateInterval = setInterval(update, 20);
    });
    canvasElement.addEventListener('mouseleave', function() {
        clearInterval(updateInterval);
        //updateInterval = setInterval(update, 100);
    });

}

//canvas 11
{
    const canvasElement = document.getElementById( "c11" );
    const easygl = new EasyGL( canvasElement );

    randTexture = [];
    for (let i=0; i<256*4; i++)
    {
        randTexture.push(Math.random()*255);
    }

    easygl.createTexture(); //creates default texture 16x16 smiley face image
    easygl.createTexture(2, randTexture);
    easyglInstances.push(easygl);
    easygl.setClearColor(c3Color);
    easygl.setPerspective();
    easygl.createTextureObject( 'myObject1' , null, null, null, null, null, null, null, 2);
    easygl.createTextureObject( 'myObject2' ); //creates a textured object, using default texture & texture coordinates for cube
    easygl.createObject( 'myObject3' );
    easygl.setObjectPosition( 'myObject1', 1, 1, 1,);
    easygl.setObjectPosition( 'myObject2', -1, -1, -1,);
    easygl.setObjectRotation( 'myObject1', 0.8, .1, 1);
    //easygl.setObjectColor( 'myObject1', new vec4(1,0,0,1));
    //easygl.setObjectColor( 'myObject2', new vec4(0,1,0,1));
    easygl.setObjectColor( 'myObject3', new vec4(0,0,1,1));
    easygl.setObjectReflectivity('myObject1', 0.2);
    easygl.setObjectReflectivity('myObject2', 0.5);
    easygl.setObjectReflectivity('myObject3', 0.7);

    let t=0;
    let updateInterval = setInterval( update, 100 );
    function update() {
        t += 0.03;
        easygl.setObjectRotation( 'myObject2', t,t,t);
        easygl.setCameraPosition( 4*Math.cos(t), 0, -4*Math.sin(t) );
        easygl.setCameraRotation( 0, -t -Math.PI/2, 0);
        easygl.clear();
        easygl.renderAll();
    }

    canvasElement.addEventListener('mouseenter', function() {
        clearInterval(updateInterval);
        updateInterval = setInterval(update, 20);
    });
    canvasElement.addEventListener('mouseleave', function() {
        clearInterval(updateInterval);
        updateInterval = setInterval(update, 100);
    });
}
//canvas 12
{
    const canvasElement = document.getElementById( "c12" );
    const easygl = new EasyGL( canvasElement );
    easyglInstances.push(easygl);
    easygl.setClearColor(c2Color);
    easygl.setCameraPosition( 0, 0, 3 );
    easygl.setPerspective();

    let sphere = generateSphereMesh(1,0.7,0, new vec4(1,0,0,1), true);
    easygl.createObject( 's1' , null, null, null, sphere.vertices, sphere.indices, sphere.normals, sphere.colors);
    easygl.setObjectPosition( 's1' , 0,2,0);
    easygl.setObjectReflectivity('s1', 0.6);

    sphere = generateSphereMesh(2,0.7,0,  new vec4(0,1,0,1), true);
    easygl.createObject( 's2' , null, null, null, sphere.vertices, sphere.indices, sphere.normals, sphere.colors);
    easygl.setObjectPosition( 's2' , 0,0,0);
    easygl.setObjectReflectivity('s2', 0.6);

    sphere = generateSphereMesh(3,0.7,0,  new vec4(0,0,1,1), true);
    easygl.createObject( 's3' , null, null, null, sphere.vertices, sphere.indices, sphere.normals, sphere.colors);
    easygl.setObjectPosition( 's3' , 0,-2,0);
    easygl.setObjectReflectivity('s3', 0.6);
    
    //easygl.setObjectRotation( 'myObject1', 0.8, .1, 1);

    let t=0;
    let updateInterval = setInterval( update, 100 );
    function update() {
        t += 0.1;
        easygl.setDirectionalLightingDirection( 
            Math.cos(t), 
            Math.sin(t/2), 
            Math.sin(t/3) );
        easygl.clear();
        easygl.renderAll();
    }

    canvasElement.addEventListener('mouseenter', function() {
        clearInterval(updateInterval);
        updateInterval = setInterval(update, 20);
    });
    canvasElement.addEventListener('mouseleave', function() {
        clearInterval(updateInterval);
        updateInterval = setInterval(update, 100);
    });


}


/*
generateSphereMesh

//canvas 6
{


    const canvasElement = document.getElementById( "c6" );
    const easygl = new EasyGL( canvasElement );
    easygl.setClearColor(c1Color);
    easygl.setCameraPosition( 0, 0, -2 );
    easygl.setPerspective();
    const sphere = generateSphereMesh(4,1,0);
    easygl.createObject( 'myObject1' , null, null, null, sphere.vertices, sphere.indices, sphere.normals, sphere.colors);

    let t=0;


    let updateInterval = setInterval( update, 100 );


    function update() {
        t += 0.03;
        easygl.setObjectRotation( 'myObject1', t, t/2, t/3 );
        easygl.clear();
        easygl.renderAll();
    }

    canvasElement.addEventListener('mouseenter', function() {
        clearInterval(updateInterval);
        updateInterval = setInterval(update, 20);
    });
    canvasElement.addEventListener('mouseleave', function() {
        clearInterval(updateInterval);
        updateInterval = setInterval(update, 100);
    });


}
*/