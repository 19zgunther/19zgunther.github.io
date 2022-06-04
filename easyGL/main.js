



const canvasElement = document.getElementById( "myCanvas" );
const easygl = new EasyGL( canvasElement );
easygl.setCameraPosition( 0, 0, -2 );
easygl.setPerspective();
easygl.createObject( 'myObject1' );
 
let t=0;
let updateInterval = setInterval( update, 20 );
function update() {
    t += 0.03;
    easygl.setObjectRotation( 'myObject1', t, t/2, t/3 );
    easygl.clear();
    easygl.renderAll();
}



