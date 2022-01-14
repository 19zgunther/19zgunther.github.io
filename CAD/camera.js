
class Camera
{
    constructor()
    {
        this.walkSpeed = 0.2;
        this.runSpeed = 0.8;
        this.rotSpeed = 0.05;
        this.pos = new vec4(5,5,5,0);
        this.rot = new vec4(0,0,0,0);
        
        this.translationMat = new mat4();
        this.rotationMat = new mat4();
        this.viewMatrix = new mat4();

        this.sliding = false;
        this.slideTargetPos = new vec4();                    
        this.slideTargetPos = new vec4();

        this.update({});
    }

    update(pressedKeys)
    {
        if (pressedKeys == null) {
            console.error("player.update( ) was passed null. needs 'pressedKeys'.");
            return;
        }
        
        var movement = new vec4();
        var rot = new vec4();

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

            console.log(this.slideTargetPos.toString() +" - " + this.pos.toString()+" = " + (this.slideTargetPos.sub(this.pos)).toString() + "  ==  " + movement.toString());

            rot = (this.slideTargetRot.sub(this.rot)).mul(.2);

            if (posDif.getLength() < 0.05)
            {
                this.pos = this.slideTargetPos;
                this.rot = this.slideTargetRot;
                this.sliding = false;
                console.log("sliding = false");
            }
            
        }


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
        this.rotationMat = rotMat2.mul(rotMat1);
        this.viewMatrix = this.rotationMat.mul(this.translationMat);
    }

    setPosition(pos = new vec4())
    {
        this.pos = pos;
    }
    setRotation(rot = new vec4())
    {
        this.rot = rot;
    }
    slideToPositionAndRotation(targetPos = new vec4(), targetRot = new vec4())
    {
        this.slideTargetPos = targetPos;
        this.slideTargetRot = targetRot;
        this.sliding = true;
    }
    getViewMatrix()
    {
        return this.viewMatrix;
    }
    getPosition()
    {
        return this.pos;
    }
    getRotation()
    {
        return this.rot;
    }
    getRotationMatrix()
    {
        return this.rotationMat;
    }
    getRotationMatrixInv()
    {
        var rotMat1 = new mat4().makeRotation(0, -this.rot.y, 0);
        var rotMat2 = new mat4().makeRotation(0, 0, -this.rot.z);
        return rotMat1.mul(rotMat2);
    }
    getScreenNormalVector()
    {
        //returns a unit vector from the center out of the camera.
        //var pVec = (new vec4(0,0,-1))
        //var pVec = this.getRotationMatrixInv().mul(pVec);
        //var pVec = pVec.sub(this.getPosition());
        //return pVec;
        return ( this.getRotationMatrixInv().mul( new vec4(0,0,-1) ) ) 
    }
}




function move_camera_home_button_press()
{
    camera.slideToPositionAndRotation();
}