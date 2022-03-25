
//Sketch-specific Variables
const createSketchMenuElement = document.getElementById('createSketchMenu');
const createSketchMenuCanvasElement = document.getElementById('createSketchCanvas');
const sketchMenuElement = document.getElementById('sketchMenu');

var planeId = 'xzPlane';
var createSketchMenuIsOpen = false;

var currentSketch = null;



//Shows create-sketch menu
function createSketchMenu_show()
{
    createSketchMenuIsOpen = true;
    //enable menu
    createSketchMenuElement.style.display = 'block';

    //Center sketch menu in glCanvas
    const glCanvasRect = glCanvasElement.getBoundingClientRect();
    const createSketchMenuElementRect = createSketchMenuElement.getBoundingClientRect();
    createSketchMenuElement.style.left = glCanvasRect.left + glCanvasRect.width/2 - createSketchMenuElementRect.width/2;
    createSketchMenuElement.style.top = glCanvasRect.top + glCanvasRect.height/2 - createSketchMenuElementRect.height/2;

    planeId = 'xzPlane'

    createSketchMenu_planeButton_onclick();
}

//Hides create-sketch menu
function createSketchMenu_hide()
{
    createSketchMenuIsOpen = false;
    createSketchMenuElement.style.display = 'none';
}

//button handler for create-sketch menu (for plane selection buttons)
function createSketchMenu_planeButton_onclick(element)
{
    var p = new Painter(createSketchMenuCanvasElement);
    p.Clear('lightgrey');
    var center = new Point(createSketchMenuCanvasElement.width/2, createSketchMenuCanvasElement.width*7/11);

    var pR = new Point((center.x + createSketchMenuCanvasElement.width)/2, (center.y + createSketchMenuCanvasElement.height)/2); //pointRight
    var pL = new Point(center.x/2, (center.y + createSketchMenuCanvasElement.height)/2); //pointLeft
    var pU=  new Point(center.x, center.y/2); //pointUp


    if (element != null)
    {
        planeId = element.id;
    }
    
    switch (planeId)
    {
        case 'xzPlane': p.DrawTriangleFilled(center.x, center.y, (center.x + createSketchMenuCanvasElement.width)/2, (center.y + createSketchMenuCanvasElement.height)/2, center.x/2, (center.y + createSketchMenuCanvasElement.height)/2, rgbToHex(255,0,255));
                        p.DrawTriangleFilled(center.x,  createSketchMenuCanvasElement.height, (center.x + createSketchMenuCanvasElement.width)/2, (center.y + createSketchMenuCanvasElement.height)/2, center.x/2, (center.y + createSketchMenuCanvasElement.height)/2, rgbToHex(255,0,255));
                        document.getElementById(planeId).style.opacity = '100%';
                        break;
        case 'xyPlane': var corner = new Point( (center.x+createSketchMenuCanvasElement.width)/2, (center.y+createSketchMenuCanvasElement.height)/2 - center.y/2 );
                        p.DrawTriangleFilled(center.x, center.y, (center.x + createSketchMenuCanvasElement.width)/2, (center.y + createSketchMenuCanvasElement.height)/2, corner.x, corner.y, rgbToHex(255,255,0));
                        p.DrawTriangleFilled(center.x, center.y, center.x, center.y /2, corner.x, corner.y, rgbToHex(255,255,0));
                        break;
        case 'yzPlane': var corner = new Point( (center.x)/2, (center.y+createSketchMenuCanvasElement.height)/2 - center.y/2 );
                        p.DrawTriangleFilled(center.x, center.y, center.x/2, (center.y + createSketchMenuCanvasElement.height)/2, corner.x, corner.y, rgbToHex(0,255,255));
                        p.DrawTriangleFilled(center.x, center.y, center.x, center.y /2, corner.x, corner.y, rgbToHex(0,255,255));
                        break;
    }

    p.DrawLine(center.x, center.y, 0, createSketchMenuCanvasElement.height, 'blue');
    p.DrawLine(center.x, center.y, createSketchMenuCanvasElement.width, createSketchMenuCanvasElement.height, 'red');
    p.DrawLine(center.x, center.y, createSketchMenuCanvasElement.width/2, 0, 'ggreen');
}

//Button in create-sketch menu, actually starts the creation of a new sketch
function createSketchMenu_createButton_onclick()
{
    //Hide create-sketch menu
    createSketchMenu_hide();
    console.log("Creating sketch. Plane: " + planeId);

    var pos;
    var camPos;
    var rot;

    switch (planeId)
    {
        case 'xzPlane': camPos = new vec4(0,10,0);  pos = new vec4(0,0,0);  rot = new vec4(0,0,Math.PI/2); break;
        case 'xyPlane': camPos = new vec4(0,0,10);  pos = new vec4(0,0,0);  rot = new vec4(0,0,0); break;
        case 'yzPlane': camPos = new vec4(10,0,0);  pos = new vec4(0,0,0);  rot = new vec4(0,-Math.PI/2,0); break;
        case 'customPlane': rot = new vec4(0, 0, Math.PI/8);  camPos = ((new mat4()).makeRotation(rot)).mul(new vec4(0,0,10)); break;
    }

    //Make View Orthogonal
    //updateCameraSettings(document.getElementById('orthogonalViewCheckbox'));

    //Move to correct Position
    /*
    console.log("sliding cam to pos: " + camPos + "  rot: " + rot );
    camera.slideTo( camPos, rot);
    projectionType == 'orthogonal';

    sketchMenuElement.style.display='flex';
    currentSketch = new Sketch(pos, rot);
    sketches.push(currentSketch);*/

    enterSketch(new Sketch(pos, rot))
}

//setting everything necessary for being in a sketch
function enterSketch(sketch)
{
    if (sketch instanceof Sketch == false)
    {
        console.error("function enterSketch() requires a sketch to be passed as an argument.");
        return;
    }

    //Move to correct Position
    //console.log("sliding cam to pos: " + camPos + "  rot: " + rot );
    //camera.slideTo( camPos, rot);
    camera.slideTo(  sketch.getPosition(), sketch.getRotation()  );
    //projectionType == 'orthogonal';

    //Make sure we're up to date
    currentSketch = sketch;
    if (isComponentInList(sketches, sketch) == false)
    {
        sketches.push(sketch);
    }

    //enable sketchMenu HTML element
    sketchMenuElement.style.display='flex';
}

//Leaving a sketch - cleanup & etc.
function exit_sketch()
{
    sketchMenuElement.style.display='none';
    currentSketch = null;
    move_camera_home_button_press();
}

//create-sketch menu - keypress handler
function createSketchMenu_keyPressed(event)
{
    var keyCode = event.key;
    pressedKeys[keyCode] = true;
    console.log(keyCode);

    if (keyCode == "Escape" || keyCode == "X"|| keyCode == "x")
    {
        if (createSketchMenuIsOpen)
        {
            createSketchMenu_hide();
        }
    }
}



function sketchMenu_cellClick(element)
{
    if (element instanceof HTMLElement)
    {
        switch(element.id)
        {
            case 'line': currentSketch.componentDrawType = 'line'; break;
            case 'circle': currentSketch.componentDrawType = 'circle'; break;
        }
        currentComponent = null;
    }
}





class Sketch{
    constructor(position = new vec4(), rotation = new vec4()) {
        console.log("Sketch constructor    Pos: " + position.toString() + "   Rot: " + rotation.toString());

        this.position = position;
        this.rotation = rotation;
        this.translation = new vec4(); //for position offset relative to this.position.

        this.targetTranslation;
        this.targetZoom;
        this.sliding = false;


        //This is the only grid the user will see while editing the sketch, and will always be at the default position and rotation
        this.grid = new Grid(new vec4(),new vec4(), 1, new vec4(1,1,1,1)); //Grid which is the background.


        //Internal matrices are used for drawing internal objects: the Grid and the Sketch Components.
        //External matrices are used for drawing external object: all other objects in the world.
        //the projection matrix is global.
        this.projectionMatrix = new mat4()  //.makeOrthogonal(zoom, aspect, zNear, zFar);
        this.projectionMatrixInv;           //We use the inverse of the projectionMatrix for raycasting, and don't want to have to recalculate it a ton
        this.externalTranslationMatrix = new mat4()//Created using this.position + this.translation.
        this.externalRotationMatrix = new mat4() //Created using this.rotation
        this.externalViewMatrix = new mat4(); //Created using externalRotationMatrix & externalTranslationMatrix
        this.internalViewMatrix = new mat4(); //Created using this.translation, and no rotation.
        this.objectMatrix = new mat4(); //Used for when we're not editing the sketch, and want to draw it like a normal component

        //Just a useful identityMatrix placeholder incase we need one.
        this.identityMatrix = new mat4().makeIdentity();


        this.updateProjectionMatrix();
        this.updateMatrices();



        this.vertices = [];
        this.normals = [];
        this.colors = [];
        this.indices = [];
        this.buffers = initBuffers(this.vertices, this.normals, this.colors, this.indices);

        this.depressedKeys = {};
        this.mouseCanvasPos = new vec4();
        this.mouseGLPos = new vec4();
        this.mouseGridPosition = new vec4();


        this.componentDrawType = 'line';
        this.snapDist = 0.1;

        this.currentComponent = null;
        this.previousComponents = [];                //holds previous [currentComponent, movingPoint] tuples.
        this.currentComponentMovingPoint = null;
        this.components = [];
        //this.components.push( new line(new vec4(), new vec4(1,1,0,0))  );

        this.constraintManager = new ConstraintManager();


        this._updateBuffers();
    }


    update()
    {
        this._updateMovement();
        this._updateBuffers();

        //If the selected component have changed, update previouseComponents
        if (this.previousComponents.length > 0 && 
            ( this.currentComponent != this.previousComponents[this.previousComponents.length-1][0] || this.currentComponentMovingPoint != this.previousComponents[this.previousComponents.length-1][1] ) &&
            ( this.currentComponent != null && this.currentComponentMovingPoint != '' && this.currentComponentMovingPoint != null)  )
        {
            //if previousComponents.length is greater than 0 and the currentComponent & movingPoint are non-null and not in the previousComponentslist
            this.previousComponents.push( [this.currentComponent, this.currentComponentMovingPoint] );
        }
    }
    updateProjectionMatrix()
    {
        this.projectionMatrix.makeOrthogonal(zoom, aspect, zNear, zFar);
        this.projectionMatrixInv = this.projectionMatrix.invert();
    }
    updateMatrices()
    {
        //Simply update all matrices (beside projectionMatrices)
        this.externalRotationMatrix.makeRotation(this.rotation.x, this.rotation.y, this.rotation.z);
        var pos = this.position.mul(-1).add(    new mat4().makeRotation(-this.rotation.x, -this.rotation.y, -this.rotation.z).mul(this.translation)    );
        this.externalTranslationMatrix.makeTranslation(pos);
        this.externalViewMatrix = this.externalRotationMatrix.mul(this.externalTranslationMatrix);

        this.internalViewMatrix.makeTranslation(this.translation.x, this.translation.y, this.translation.z);

        this.objectMatrix = this.externalRotationMatrix.mul( new mat4().makeTranslation(this.position) );
    }
    _updateMovement()
    {
        //Where we adjust the translation (positiion) of the sketch camera relative to the plane
        if ( this.sliding == false )
        {
            var movement = new vec4();
            if (this.depressedKeys['w'] || this.depressedKeys['W'])
            {
                movement.y += 0.1;
            }
            if (this.depressedKeys['s'] || this.depressedKeys['S'])
            {
                movement.y -= 0.1;
            }
            if (this.depressedKeys['d'] || this.depressedKeys['D'])
            {
                movement.x += 0.1;
            }
            if (this.depressedKeys['a'] || this.depressedKeys['A'])
            {
                movement.x -= 0.1;
            }

            if (movement.x != 0 || movement.y != 0)
            {
                this.translation = this.translation.sub(movement);
                this.updateMatrices();
            }
        } else {
            //Sliding! Slide to current location
            var posDif = this.targetTranslation.sub(this.translation);
            var movement = posDif.mul(0.1);

            this.translation = this.translation.add(movement);

            zoom -= (zoom - this.targetZoom)*0.1;
            orthogonal_zoomSliderElement.value = zoom;

            if (posDif.getLength() < 0.05)
            {
                this.sliding = false;
                console.log("sliding = false");
            }
            this.updateMatrices()
            this.updateProjectionMatrix();
        }
    }
    _updateBuffers(forceUpdate = false)
    {
        var needsUpdate = false;
        for (var i=0; i<this.components.length; i++)
        {
            if (this.components[i].getHasChanged())
            {
                needsUpdate = true;
            }
        }
        if (needsUpdate || forceUpdate)
        {
            console.log("updating vertices");
            this.vertices = [];
            this.normals = [];
            this.colors = [];
            this.indices = [];

            var v;
            var n;
            var c;
            var ind;

            for (var i=0; i<this.components.length; i++)
            {
                [v,ind,n,c] = this.components[i].getData();
                var startInd = Math.round(this.vertices.length/3);
                this.vertices = this.vertices.concat(v);
                this.normals = this.normals.concat(n);
                this.colors = this.colors.concat(c);
                console.log(v +" "+ind+" " + n + " " +c);
                for (var j=0; j<ind.length; j++)
                {
                    this.indices.push(ind[j] + startInd);
                }
                this.components[i].hasChanged = false;
            }
            console.log(this.vertices);
            console.log(this.indices);
            console.log(this.colors);
            console.log(this.normals);
            
            this.buffers = initBuffers(this.vertices, this.normals, this.colors, this.indices);
        }
    }
    

    draw(gl, projectionMatrix = null, viewMatrix = null)
    {

        if (projectionMatrix == null || viewMatrix == null)
        {
            //Draw Grid
            this.grid.draw(gl, this.projectionMatrix, this.internalViewMatrix);

            //Draw Lines
            DrawDefault(gl, this.projectionMatrix, this.internalViewMatrix, this.identityMatrix, this.indices, this.buffers, false);

            //Draw constraints
            this.constraintManager.draw(gl, this.projectionMatrix, this.internalViewMatrix);
        
        } else {
            //Draw Lines
            DrawDefault(gl, projectionMatrix, viewMatrix, this.objectMatrix, this.indices, this.buffers, false);
        }
    }


    slideTo(translation = new vec4(), zoom_ = zoom)
    {
        this.targetTranslation = translation;
        this.targetZoom = zoom_;
        this.sliding = true;
    }



    keyPressed(event)
    {
        var keyCode = event.key;
        this.depressedKeys[keyCode] = true;
        console.log(keyCode + " Down");

        switch ( keyCode )
        {
            case 'Escape':
                if (this.currentComponent != null) 
                { 
                    if (this.currentComponent instanceof line && this.componentDrawType == 'line')
                    {
                        this._removeComponent(this.currentComponent);
                        //this.constraintManager.removeComponent(this.currentComponent);
                    }
                    //console.log("removed list of components: " + this.components);
                    this.currentComponent = null;
                    this.pCurrentComponent = null;
                    this.componentDrawType == '';
                    this._updateBuffers(true);
                } else if (this.componentDrawType != '')
                {
                    this.componentDrawType = '';
                }
                this._updateBuffers();
                break;
        }
    }
    keyReleased(event)
    {
        var keyCode = event.key;
        this.depressedKeys[keyCode] = false;
    }
    mouseMoved(event)
    {
        this.mouseGridPosition = this._getMouseGridPosition(event);
        
        if (this.currentComponent != null && this.currentComponentMovingPoint != '')
        {
            //this.currentComponent.setPosition(this.mouseGridPosition, this.currentComponentMovingPoint);
            this.constraintManager.requestPointMove(this.currentComponent, this.currentComponentMovingPoint, this.mouseGridPosition);
            this._updateBuffers();
        }
        //console.log("CurComp: " + (this.currentComponent) + "  point: " + this.currentComponentMovingPoint);
    }
    mouseDown(event)
    {
        console.log('mouseDown');
        this.mouseGridPosition = this._getMouseGridPosition(event);
        


        var closestComp = null;
        var closestCompPointType = null;

        [closestComp, closestCompPointType] = this._getClosestComponentToMouseGridPosition();

        //console.log('closestComp: ' + closestComp);


        var stoppedMovingPoint = false;
        console.log(this.components.length);
        //console.log("CurComp: " + this.currentComponent + "  point: " + this.currentComponentMovingPoint);

        if (this.currentComponent != null)
        {
            //We have a selected component...
            if (this.currentComponentMovingPoint != '' && this.currentComponentMovingPoint != null)
            {
                //We have a component, and we're moving one of it's points
                //this.currentComponent.setPosition(this.mouseGridPosition, this.currentComponentMovingPoint);
                this.constraintManager.requestPointMove(this.currentComponent, this.currentComponentMovingPoint, this.mouseGridPosition);
                if (this.componentDrawType == 'line')
                {
                    //If we are currently drawing 'line' and want to continue drawing more lines (otherwise, just moving component point)
                    if (this.currentComponentMovingPoint == 'end')
                    {
                        var newComp = new line(this.mouseGridPosition,this.mouseGridPosition);

                        //Create coincidental constraint
                        //var coincidentalConstraint = new coincidental_constraint(this.currentComponent, 'end', newComp, 'start');
                        //this.currentComponent.addConstraint(coincidentalConstraint);
                        //newComp.addConstraint(coincidentalConstraint);

                        this.constraintManager.addCoincidentalConstraint(newComp, 'start', this.currentComponent, 'end');
                        this.constraintManager.addDistanceConstraint(this.currentComponent, 'start', this.currentComponent, 'end');

                        this.currentComponent = newComp;
                        this.components.push(this.currentComponent);
                    }
                } else if (this.componentDrawType == 'circle') {
                    this.currentComponentMovingPoint = '';
                } else {
                    this.currentComponentMovingPoint = '';
                }
                stoppedMovingPoint = true;

            } else {
                if (this.componentDrawType == 'circle')
                {
                    this.currentComponent = new circle(this.mouseGridPosition); 
                    this.currentComponentMovingPoint = 'other';
                    this.components.push(this.currentComponent);
                }
            }
        } else if (this.componentDrawType != '' && this.componentDrawType != null) {
            switch (this.componentDrawType)
            {
                case 'line': this.currentComponent = new line(this.mouseGridPosition); this.currentComponentMovingPoint = 'end'; break;
                case 'circle': this.currentComponent = new circle(this.mouseGridPosition); this.currentComponentMovingPoint = 'other';break;
            }
            if (this.currentComponent != null)
            {
                this.components.push(this.currentComponent);
            }
        }
        if (this.componentDrawType == '' && stoppedMovingPoint == false) {
            //Here, we have no component selected and we're not trying to draw any new of components of type this.componentDrawType

            if (closestComp != null)
            {
                this.currentComponentMovingPoint = closestCompPointType;
                this.currentComponent = closestComp;
                //console.log("new current comp: " + this.currentComponent + "  point: " + this.currentComponentMovingPoint);
            }

        }
        //console.log("CurComp: " + (typeof this.currentComponent) + "  point: " + this.currentComponentMovingPoint);
        this._updateBuffers();


    }
    mouseUp(event)
    {
        this.mouseGridPosition = this._getMouseGridPosition(event);
        /*
        if (this.currentComponent != null)
        {
            if (this.currentComponentMovingPoint == 'start')
            {
                this.currentComponent.setStartPosition(this.mouseGridPosition);
                this.currentComponent = null;
                this.currentComponentMovingPoint = null;
            } else if (this.currentComponentMovingPoint == 'end')
            {
                this.currentComponent.setEndPosition(this.mouseGridPosition);
                this.currentComponent = null;
                this.currentComponentMovingPoint = null;
            } else {
                this.currentComponent = null;
                this.currentComponentMovingPoint = null;
            }
        }*/
    }
    mouseWheel(event)
    {
        console.log('mouseWheel');
        //Adjust zoom
        if (event.wheelDelta>0)
        {
            zoom = zoom / 1.1;
        } else {
            zoom = zoom * 1.1;
        }
        //console.log(zoom);

        //Save data to slider
        orthogonal_zoomSliderElement.value = zoom;

        //Update projection matrix
        this.updateProjectionMatrix();

        //Translate accordingly so mouseGridPosition stays the same
        var nGridPos = this._getGridPositionFromCanvasPosition(this.mouseCanvasPos);
        var dif = this.mouseGridPosition.sub(nGridPos);
        this.translation = this.translation.sub(dif);

        //Update matrices (applying translation)
        this.updateMatrices()
    }

    _getMouseGridPosition(event)
    {
        var rect = glCanvasElement.getBoundingClientRect();
        this.mouseCanvasPos.x = event.clientX - rect.left;
        this.mouseCanvasPos.y = event.clientY - rect.top;
        this.mouseGLPos = new vec4(2*this.mouseCanvasPos.x/glCanvasElement.width - 1, -(2*this.mouseCanvasPos.y/glCanvasElement.height - 1), 0);
        return this.projectionMatrixInv.mul(this.mouseGLPos).sub(this.translation).round(this.snapDist);
    }
    _getGridPositionFromCanvasPosition(canvasPos)
    {   
        var gl_pos = new vec4(2*canvasPos.x/glCanvasElement.width - 1, -(2*canvasPos.y/glCanvasElement.height - 1), 0);
        return this.projectionMatrixInv.mul(gl_pos).sub(this.translation);
    }
    _getClosestComponentToMouseGridPosition(maxDist = 1, scaleWithZoom = true) //returns [component, pointTypeString]
    {
        if (scaleWithZoom)
        {
            // 2* 1/zoom <- number of grid units on screen
            maxDist = maxDist * ((2*1/zoom)/50);
        }

        var tempDist = 0;
        var pointType = null;
        var comp = null;
        var compPoint = null;
        for (var i=0; i<this.components.length; i++)
        {
            [tempDist, pointType] = this.components[i].getDistToPos(this.mouseGridPosition, maxDist);
            if (tempDist < maxDist)
            {
                comp = this.components[i];
                compPoint = pointType;
            }
        }
        return [comp, compPoint];
    }
    _removeComponent(comp)
    {
        removeComponentFromList(this.components, this.currentComponent);
        this.constraintManager.removeComponent(comp);
    }

    getPosition()
    {
        return this.position;
    }
    getRotation()
    {
        return this.rotation;
    }
    getProjectionMatrix()
    {
        return this.projectionMatrix;
    }
    getViewMatrix()
    {
        return this.externalViewMatrix;
    }
}





var nameID = 0;


class Component {
    constructor(type = 'default_component')
    {
        this.name = type + nameID;
        nameID += 1;
        this.constraints = [];
    }
    setPosition()
    {
        console.error("Component.setPosition() - not implemented");
    }
    getPosition()
    {
        console.error("Component.getPosition() - not implemented");
    }
    getDistToPos()
    {
        console.log("Component.getDistToPos() - not implemented");
    }
    getData()
    {
        console.log("Component.getData() - not implemented");
    }
    getHasChanged()
    {
        return this.hasChanged;
    }
    addConstraint(constraint)
    {
        this.constraints.push(constraint);
    }
}

class line extends Component{
    constructor(startPos = new vec4(), endPos = new vec4())
    {
        super('line');
        this.setPosition(endPos, 'end');
        this.setPosition(startPos, 'start');
        this.hasChanged = true;
        this.color = new vec4(0,0,0.8,1);
    }
    setPosition(pos, pointName)
    {
        /*
        var otherComp;
        var otherCompPoint;
        for(var i=0; i<this.constraints.length; i++)
        {
            [otherComp, otherCompPoint] =this.constraints[i].isOfPoint(this, pointName)
            if (otherComp != null)
            {
                //there is a constraint dealing with the point we're trying to move
                if (this.constraints[i] instanceof coincidental_constraint)
                {
                    otherComp.setPosition(pos, otherCompPoint);
                }
            }
        }*/


        if (pointName == 'start')
        {
            this.startPosition = pos;
            this.hasChanged = true;
        } else if (pointName == 'end')
        {
            this.endPosition = pos;
            this.hasChanged = true;
        } else {
            console.error("Line.setPosition(pos, pointName) error: unknown pointName");
        }
    }
    getPosition(pointName)
    {
        if (pointName == 'start')
        {
           return this.startPosition;
        } else if (pointName == 'end')
        {
            return this.endPosition;
        } else {
            console.error("Line.getPosition( pointName) error: unknown pointName");
        }
    }
    getDistToPos(posVec, maxDist)
    {
        var d = Math.min(10000, distanceBetweenPoints(this.startPosition, posVec) );
        var foundBetter = null; 
        if (d < maxDist)
        {
            maxDist = d;
            foundBetter = 'start';
        }
        d = Math.min(10000, distanceBetweenPoints(this.endPosition, posVec) );
        if (d < maxDist)
        {
            maxDist = d;
            foundBetter = 'end';
        }
        return [maxDist, foundBetter];
    }
    getData()
    {
        if (this.hasChanged)
        {
            this.vertices = [this.startPosition.x,this.startPosition.y, 0, this.endPosition.x, this.endPosition.y, 0 ];
            this.indices = [0,1];
            this.normals = [0,0,0, 0,0,0];
            this.colors = [this.color.x, this.color.y, this.color.z, this.color.a, this.color.x, this.color.y, this.color.z, this.color.a];
        }
        return [this.vertices, this.indices, this.normals, this.colors];
    }
    getAttribute(attribName)
    {
        if (attribName == 'start')
        {
            return this.startPosition;
        } else if (attribName == 'end')
        {
            return this.endPosition;
        }
        return null;
    }
}

class circle extends Component{
    constructor(centerPos = new vec4(), otherPos = new vec4())
    {
        super('circle');
        this.setPosition(centerPos, 'center');
        this.setPosition(otherPos, 'other');
        this.radius = .1;
        this.hasChanged = true;
        this.color = new vec4(0,0.1,0.7,1);
    }
    setPosition(pos, pointName)
    {
        if (pos instanceof vec4) {
            if (pointName == 'center')
            {
                this.centerPosition = pos;
                this.hasChanged = true;
            } else if (pointName == 'other')
            {
                this.otherPosition = pos;
                this.radius = distanceBetweenPoints(this.centerPosition, this.otherPosition);
                this.hasChanged = true;
            } else {
                console.error("circle.setPosition(pos, pointName) error: unknown pointName");
            }
        } else {
            console.error('circle.setPosition(pos, pointName) error: unknown pos type. needs vec4.');
        }
    }
    getPosition(pointName)
    {
        if (pointName == 'center')
        {
           return this.centerPosition;
        } else if (pointName == 'other')
        {
            return this.otherPosition;
        } else {
            console.error("Circle.getPosition( pointName) error: unknown pointName");
        }
    }
    getDistToPos(posVec, maxDist)
    {
        var d = Math.min(10000, distanceBetweenPoints(this.centerPosition, posVec) );
        console.log("d: " + d + "  this.radius: " + this.radius +"   ans: "+ (d - this.radius) + "  maxdist: " + maxDist);
        var foundBetter = null; 
        if (d < maxDist)
        {
            maxDist = d;
            foundBetter = 'center';
        }
        if (Math.abs(d - this.radius) < maxDist)
        {
            maxDist = d - this.radius;
            foundBetter = 'other';
        }
        return [maxDist, foundBetter];
    }
    getData()
    {
        if (this.hasChanged)
        {
            this.vertices = [];
            this.indices = [];
            this.normals = [];
            this.colors = [];

            var step = 0.1;
            var numTimes = 0;
            for (var j=0; j<Math.PI*2; j+=step)
            {
            
                this.vertices.push( this.centerPosition.x + Math.cos(j) * this.radius);
                this.vertices.push( this.centerPosition.y + Math.sin(j) * this.radius);
                this.vertices.push( 0 );

                this.indices.push(  numTimes  );
                this.normals.push(0,0,0);
                this.colors.push(this.color.x, this.color.y, this.color.z, this.color.a);

                if (j != 0) {
                    this.indices.push(  numTimes  );
                }
                numTimes += 1;
            }

            this.indices.push(  0  );
            numTimes += 1;

            if (numTimes%2==1)
            {
                numTimes += 1;
                this.indices.push(  0  );
            }

            this.vertices.push(this.centerPosition.x-this.radius/10, this.centerPosition.y, 0,    this.centerPosition.x, this.centerPosition.y-this.radius/10,0, this.centerPosition.x, this.centerPosition.y, 0);
            var n = this.vertices.length/3
            this.indices.push(n-3, n-1, n-2, n-1);
            this.colors.push(this.color.x, this.color.y, this.color.z, this.color.a/2);
            this.colors.push(this.color.x, this.color.y, this.color.z, this.color.a/2);
            this.colors.push(this.color.x, this.color.y, this.color.z, this.color.a/2);
            this.normals.push(0,0,0, 0,0,0, 0,0,0);
        }
        return [this.vertices, this.indices, this.normals, this.colors];
    }
    getAttribute(attribName)
    {
        if (attribName == 'center')
        {
            return this.startPosition;
        } else if (attribName == 'radius')
        {
            return this.radius;
        }
        return null;
    }
}





class ConstraintManager
{
    constructor()
    {
        this.components = [];

        this.coincidentals = [];

        this.color = new vec4(0.5,0.5,0.5,1);

        var c = this.color;
        this.coincidentals_v = [1,0,0,  .9,.44,0,  .44,.9,0,   0,1,0,  -.44,.9,0,  -.9,.44,0,  -1,0,0,  -.9,-.44,0,   -.44,-.9,0,   0,-1,0,  .44,-.9,0,  .9,-.44,0, ];
        this.coincidentals_i = [0,1,  1,2,  2,3,  3,4,  4,5,  5,6,  6,7,  7,8,  8,9,  9,10,  10,11,  11,0];
        this.coincidentals_n = [0,0,0, 0,0,0, 0,0,0, 0,0,0, 0,0,0, 0,0,0, 0,0,0, 0,0,0, 0,0,0, 0,0,0, 0,0,0,];
        this.coincidentals_c = [c.x,c.y,c.z,c.a, c.x,c.y,c.z,c.a, c.x,c.y,c.z,c.a, c.x,c.y,c.z,c.a, c.x,c.y,c.z,c.a, c.x,c.y,c.z,c.a, c.x,c.y,c.z,c.a, c.x,c.y,c.z,c.a, c.x,c.y,c.z,c.a, c.x,c.y,c.z,c.a, c.x,c.y,c.z,c.a,];


        this.distances = [];

        this._initBuffers();
    }
    removeComponent(comp)
    {   
        removeComponentFromList(this.components, comp);
        for (var i=0; i<this.coincidentals.length; i++)
        {
            var c = this.coincidentals[i];
            if (c.c1 == comp || c.c2 == comp)
            {
                this.coincidentals.splice(i,1); //remove constraint
            }
        }
        for (var i=0; i<this.distances.length; i++)
        {
            var c = this.distances[i];
            if (c.c1 == comp || c.c2 == comp)
            {
                this.distances.splice(i,1); //remove constraint
            }
        }
    }
    addCoincidentalConstraint(comp1, pointName1, comp2, pointName2)
    {
        if (isComponentInList(this.components, comp1) == false )
        {
            this.components.push(comp1);
        }
        if (isComponentInList(this.components, comp2) == false )
        {
            this.components.push(comp2);
        }

        var c = {
            c1: comp1,
            pn1: pointName1,
            c2: comp2,
            pn2: pointName2,
        };

        this.coincidentals.push(  c );
    }
    addDiststanceConstraint(comp1, pointName1, comp2, pointName2)
    {
        if (isComponentInList(this.components, comp1) == false )
        {
            this.components.push(comp1);
        }
        if (isComponentInList(this.components, comp2) == false )
        {
            this.components.push(comp2);
        }

        var dist = distanceBetweenPoints(  comp1.getPosition(pointName1), comp2.getPosition(pointName2)   );

        var c = {
            c1: comp1,
            pn1: pointName1,
            c2: comp2,
            pn2: pointName2,
            dist: dist
        };
        this.distances.push(c);
    }
    requestPointMove(component, pointName, newPointPosition, pVisitedConstraints = [])
    {
        console.log('requestPointMove: comp: ' + component.name + "  pn:"+pointName);
        var c;

        //Coincidentals
        for (var i=0; i<this.coincidentals.length; i++)
        {
            c = this.coincidentals[i];
            if (isComponentInList(pVisitedConstraints, c)) 
            {
                continue;
            }

            if (c.c1 == component && c.pn1 == pointName)
            {   
                //if the coincidental constraint deals with the current component & pointName
                pVisitedConstraints.push(c);
                var ret = this.requestPointMove(c.c2, c.pn2, newPointPosition.copy(), pVisitedConstraints);
                if (ret != null)
                {
                    c.c1.setPosition(ret, c.pn1);
                    return ret;
                }
            }

            if (c.c2 == component && c.pn2 == pointName)
            {   
                //if the coincidental constraint deals with the current component & pointName
                pVisitedConstraints.push(c);
                var ret = this.requestPointMove(c.c1, c.pn1, newPointPosition.copy(), pVisitedConstraints);
                if (ret != null)
                {
                    c.c2.setPosition(ret, c.pn2);
                    return ret;
                }
            }
        }

        //Distances
        for (var i=0; i<this.distances.length; i++)
        {
            c = this.distances[i];
            if (isComponentInList(pVisitedConstraints, c)) 
            {
                continue;
            }


            if (c.c1 == component && c.pn1 == pointName)
            {   
                //if the coincidental constraint deals with the current component & pointName
                pVisitedConstraints.push(c);
                
                var p1 = newPointPosition;
                var p2 = c.c2.getPosition(c.pn2);

                var distBetweenPoints = distanceBetweenPoints(p1, p2);

                if (distBetweenPoints != c.dist)
                {

                    var np = new vec4();
                    var angleBetweenPoints = Math.atan2(  p2.y - p1.y,  p2.x - p1.x  );
                    np.x = Math.cos(angleBetweenPoints) * c.dist;
                    np.y = Math.sin(angleBetweenPoints) * c.dist;

                    var ret = this.requestPointMove(c.c2, c.pn2, np, pVisitedConstraints);
                    if (ret != null)
                    {
                        c.c1.setPosition(newPointPosition, c.pn1);
                        return ret;
                    }
                }
            }

            if (c.c2 == component && c.pn2 == pointName)
            {   
                //if the coincidental constraint deals with the current component & pointName
                pVisitedConstraints.push(c);
                
                var p1 = c.c1.getPosition(c.pn1);
                var p2 = newPointPosition;

                var distBetweenPoints = distanceBetweenPoints(p1, p2);

                if (distBetweenPoints != c.dist)
                {

                    var np = new vec4();
                    var angleBetweenPoints = Math.atan2(  p1.y - p2.y,  p1.x - p2.x  );
                    np.x = Math.cos(angleBetweenPoints) * c.dist;
                    np.y = Math.sin(angleBetweenPoints) * c.dist;

                    var ret = this.requestPointMove(c.c1, c.pn1, np, pVisitedConstraints);
                    if (ret != null)
                    {
                        c.c1.setPosition(newPointPosition, c.pn1);
                        return ret;
                    }
                }
            }

        }


        //console.log('requestPointMove2: comp: ' + component.name + "  pn:"+pointName);

        component.setPosition(newPointPosition, pointName);
        return newPointPosition;
    }
    _initBuffers()
    {
        //initBuffers(vertices, normals, colors, indices)
        this.coincidentals_buffers = initBuffers(this.coincidentals_v, this.coincidentals_n, this.coincidentals_c, this.coincidentals_i);
    }
    draw(gl, projectionMatrix, viewMatrix)
    {
        //Draw Lines
        var mat = new mat4();
        var scale = new vec4(.02/zoom,.02/zoom,.02/zoom);
        var p;
        for (var i=0; i<this.coincidentals.length; i++)
        {
            p = this.coincidentals[i].c1.getPosition( this.coincidentals[i].pn1 );
            DrawDefault(gl, projectionMatrix, viewMatrix, mat.makeTranslationAndScale(p, scale), this.coincidentals_i, this.coincidentals_buffers, false);
        }
    }
}


function findPointSubjectTo(p0 = new vec4(), d = Number(1), v = vec4())
{
    //returns the point distance d away from p0 on ray v;
    var t = Math.sqrt( (d*d)/(v.x^2 + v.y^2)  );
    return new vec4(t*v.x + p0.x, t*v.y + v0.y,0,0);
}

function setVec4ToPosSubjectTo(p0 = new vec4(), d=Number(1), v = vec4(), p = vec4())
{
    var t = Math.sqrt( (d*d)/(v.x^2 + v.y^2)  );
    p.x = t*v.x + p0.x;
    p.y = t*v.y + p0.y;    
}