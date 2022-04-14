/***********************************************************************************************
*  Code Written by Zack Gunther
*  If you would like to copy or use this code email me at 19zgunther@gmail.com to ask permission.
************************************************************************************************/

class Camera
{
    constructor()
    {
        this.walkSpeed = 0.2;
        this.runSpeed = 0.8;
        this.rotSpeed = 0.05;
        this.position = new vec4(4,4,4,0);
        
        this.translationMatrix = new mat4();
        this.rot = new vec4();
        this.rotationMatrix = new mat4();
        this.viewMatrix = new mat4();

        this.sliding = false;
        this.slideTargetPos = new vec4();                    
        this.slideTargetRot = new vec4();
        this.slideTargetProjectionMatrix = null;

        this.update({});
    }
    update_OLD(pressedKeys)
    {
        if (pressedKeys == null) {
            console.error("player.update( ) was passed null. needs 'pressedKeys'.");
            return;
        }
        

        var movement = new vec4();
        var rot = new vec4();
        //For normal moving and such
        if (this.sliding == false) {

            var speed = this.walkSpeed;
            if (pressedKeys['Control'])
            {
                speed = this.runSpeed;
            }
            //Update Position
            if (pressedKeys['w'])
            {
                movement.x -= Math.sin(this.rot.y)*speed;
                movement.z += Math.cos(this.rot.y)*speed;
            }
            if (pressedKeys['s'])
            {
                movement.x += Math.sin(this.rot.y)*speed;
                movement.z -= Math.cos(this.rot.y)*speed;
            }
            if (pressedKeys['d'])
            {
                movement.x -= Math.cos(this.rot.y)*speed;
                movement.z -= Math.sin(this.rot.y)*speed;
            }
            if (pressedKeys['a'])
            {
                movement.x += Math.cos(this.rot.y)*speed;
                movement.z += Math.sin(this.rot.y)*speed;
            }
            if (pressedKeys[' '])
            {
                movement.y -= speed;
            }
            if (pressedKeys['Shift'])
            {
                movement.y += speed;
            }        
            

            //Update Rotation
            if (pressedKeys['ArrowUp'])
            {
                rot.z -= this.rotSpeed;
            }
            if (pressedKeys['ArrowDown'])
            {
                rot.z += this.rotSpeed;
            }
            if (pressedKeys['ArrowLeft'])
            {
                rot.y -= this.rotSpeed;
            }
            if (pressedKeys['ArrowRight'])
            {
                rot.y += this.rotSpeed;
            }
        } else {
            //Implement sliding...

            var posDif = this.slideTargetPos.sub(this.pos);
            movement = (posDif).mul(-.1);

            //console.log(this.slideTargetPos.toString() +" - " + this.pos.toString()+" = " + (this.slideTargetPos.sub(this.pos)).toString() + "  ==  " + movement.toString());

            rot = (this.slideTargetRot.sub(this.rot)).mul(.2);

            if (posDif.getLength() < 0.05)
            {
                this.pos = this.slideTargetPos;
                this.rot = this.slideTargetRot;
                this.sliding = false;
                //console.log("sliding = false");
            }
            
        }

        //If we're editing a sketch, we want our position and rotation to be fixed relative to the plane we're editing
        /*if (typeof editingSketch != 'undefined') //Make sure the file with the sketch vairables has been defined
        {
            if (editingSketch && this.sliding == false && currentSketch != null)
            {
                movement = new vec4();
                rot = new vec4();

                if (pressedKeys['w'])
                {
                    movement.y -= 0.1;
                }
                if (pressedKeys['s'])
                {
                    movement.y += 0.1;
                }
                if (pressedKeys['d'])
                {
                    movement.x -= 0.1;
                }
                if (pressedKeys['a'])
                {
                    movement.x += 0.1;
                }

                movement = currentSketch.grid.getRotationMatrix().mul(movement);

            }  
        }*/
        

        //Update Matrices
        this.rot = this.rot.add(rot);
        var rotMat1 = new mat4().makeRotation(0, this.rot.y, 0);
        var rotMat2 = new mat4().makeRotation(0, 0, this.rot.z);
        var rotMat3 = rotMat1.mul(rotMat2);


        //movement = rotMat3.mul(movement);
        this.pos.x -= movement.x;
        this.pos.y -= movement.y;
        this.pos.z -= movement.z;

        this.translationMat = (new mat4()).makeTranslation(new vec4(-this.pos.x, -this.pos.y, -this.pos.z));
        this.rotationMatrix = rotMat2.mul(rotMat1);
        this.viewMatrix = this.rotationMatrix.mul(this.translationMat);

        var detailsElement = document.getElementById('cameraPositionDetailsElement');
        detailsElement.innerHTML = "Position: " + this.pos.toString() + "<br>Normal: "+this.getScreenNormalVector().toString();
    }
    update(pressedKeys)
    {
        if (pressedKeys == null) {
            console.error("player.update( ) was passed null. needs 'pressedKeys'.");
            return;
        }

        let movement = new vec4();
        let rotation = new vec4();
        //For normal moving and such
        if (this.sliding == false) {

            var speed = this.walkSpeed;
            if (pressedKeys['Control'])
            {
                speed = this.runSpeed;
            }
            //Update Position
            if (pressedKeys['w'])
            {
                movement.z -= speed;
            }
            if (pressedKeys['s'])
            {
                movement.z += speed;
            }
            if (pressedKeys['d'])
            {
                movement.x += speed;
            }
            if (pressedKeys['a'])
            {
                movement.x -= speed;
            }
            if (pressedKeys[' '])
            {
                movement.y += speed;
            }
            if (pressedKeys['Shift'])
            {
                movement.y -= speed;
            }
        
            

            //Update Rotation
            if (pressedKeys['ArrowUp'])
            {
                rotation.x -= this.rotSpeed;
            }
            if (pressedKeys['ArrowDown'])
            {
                rotation.x += this.rotSpeed;
            }
            if (pressedKeys['ArrowLeft'])
            {
                rotation.y -= this.rotSpeed;
            }
            if (pressedKeys['ArrowRight'])
            {
                rotation.y += this.rotSpeed;
            }

        } else {
            //Implement sliding...

            var posDif = this.slideTargetPos.sub(this.position);
            //console.log(this.position.toString() + "   " + posDif.toString() + "   "+this.slideTargetPos.toString());
            movement = posDif.mul(0.1);

            var rotDif = this.slideTargetRot.sub(this.rot);
            rotation = rotDif.mul(0.1);

            if (posDif.getLength() < 0.05)
            {
                this.position = this.slideTargetPos;
                this.rot = this.slideTargetRot;
                this.sliding = false;
                console.log("sliding = false");
            }


            
        }

        /*let currentTime = new Date().getTime();
        if (this.lastUpdateTime != null)
        {
            let dt = currentTime - this.lastUpdateTime;
            movement.muli(dt/100);
            rotation.muli(dt/100);
            console.log("dt: " + dt);
        }
        this.lastUpdateTime = currentTime;*/

        this.rot = this.rot.add(rotation);
        this.rotationMatrix = (  new mat4().makeRotation(0, 0, this.rot.x + this.rot.z)  ).mul(  new mat4().makeRotation(0,this.rot.y,0)  );

        if (this.sliding == false) {
            this.position = this.position.add((  new mat4().makeRotation(0,-this.rot.y,0).mul(movement)));
        } else {
            this.position = this.position.add( movement );
        }

        this.translationMatrix.makeTranslation(-this.position.x, -this.position.y, -this.position.z);
        this.viewMatrix = this.rotationMatrix.mul(this.translationMatrix);
    }
    setPosition(pos = new vec4())
    {
        this.position = pos;
    }
    setRotation(rot = new vec4())
    {
        //console.log("Camera does not have a well defined rotatio. Don't use this.");
        this.rotationMatrix.makeRotation(rot.x, rot.y, rot.z);
    }
    slideTo(targetPos = new vec4(5,5,5), targetRot = new vec4(), targetProjectionMatrix = null)
    {
        this.slideTargetPos = targetPos;
        this.slideTargetRot = targetRot;
        this.slideTargetProjectionMatrix = targetProjectionMatrix;
        this.sliding = true;
    }
    getViewMatrix()
    {
        return this.viewMatrix;
    }
    getPosition()
    {
        return this.position;
    }
    getRotation()
    {
        //console.error("Camera does not have a well defined rotation. Find a different way.");
        //var rotatedPoint = this.rotationMatrix.mul(new vec4(0,0,1));
        //this.rotation.z =
        return new vec4(0, this.rot.y, this.rot.x + this.rot.z);
    }
    getRotationMatrix()
    {
        return this.rotationMatrix;
    }
    getRotationMatrixInv()
    {
        /*
        var rotMat1 = new mat4().makeRotation(0, -this.rot.y, 0);
        var rotMat2 = new mat4().makeRotation(0, 0, -this.rot.z);
        return rotMat1.mul(rotMat2);*/
        //return new mat4().makeRotation(0, 0, -this.rot.x - this.rot.z).mul(  new mat4().makeRotation(0,-this.rot.y,0) );
    }
    getScreenNormalVector()
    {
        //returns a unit vector from the center out of the camera.
        //var pVec = (new vec4(0,0,-1))
        //var pVec = this.getRotationMatrixInv().mul(pVec);
        //var pVec = pVec.sub(this.getPosition());
        //return pVec;
        //var vec = ( this.getRotationMatrix() ).mul( new vec4(0,0,1) );


        //var vec = ( ( new mat4() ).makeRotation(0,this.rot.y,this.rot.x + this.rot.z) ).mul( new vec4(0,0,1,1));
        //vec = ( ( new mat4() ).makeRotation(0,this.rot.y,0) ).mul( vec );


        let vec = new mat4().makeRotation(0, -this.rot.y, -this.rot.x - this.rot.z).mul(new vec4(0,0,-1));

        //vec.x = -vec.x;
        //vec.z = -vec.z;
        //vec.y = -vec.y;
        return vec;
    }
}

