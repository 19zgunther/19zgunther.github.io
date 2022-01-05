
class Player
{
    constructor()
    {
        this.walkSpeed = 0.2;
        this.runSpeed = 0.8;
        this.rotSpeed = 0.05;
        this.pos = new vec4(0,0,0);
        this.rot = new vec4(0,0,0);
        
        this.translationMat = new mat4();
        this.rotationMat = new mat4();
        this.viewMatrix = new mat4();

        this.update();
    }

    update(pressedKeys)
    {
        if (pressedKeys == null) {return;}

        var movement = new vec4();

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

        //movement = this.rotationMat.mul(movement);
        
        var rot = new vec4();

        //Update Rotation
        if (pressedKeys['ArrowUp'])
        {
            rot.z -= this.rotSpeed;
            //this.rot.z -= Math.cos(this.rot.y) * this.rotSpeed;
            //this.rot.x += Math.sin(this.rot.y) * this.rotSpeed;
        }
        if (pressedKeys['ArrowDown'])
        {
            rot.z += this.rotSpeed;
            //this.rot.z += Math.cos(this.rot.y) * this.rotSpeed;
            //this.rot.x -= Math.sin(this.rot.y) * this.rotSpeed;
        }
        if (pressedKeys['ArrowLeft'])
        {
            rot.y -= this.rotSpeed;
        }
        if (pressedKeys['ArrowRight'])
        {
            rot.y += this.rotSpeed;
        }

        //Update Matrices
        this.rot = this.rot.add(rot);
        var rotMat1 = new mat4().makeRotation(0, this.rot.y, 0);
        var rotMat2 = new mat4().makeRotation(0, 0, this.rot.z);
        var rotMat3 = rotMat1.mul(rotMat2);

        
        //this.rot = this.rot.add(rotMat3.mul(new vec4(1,1,0,0)));



        //movement = rotMat3.mul(movement);
        this.pos.x += movement.x;
        this.pos.y += movement.y;
        this.pos.z += movement.z;

        this.translationMat = new mat4().makeTranslation(this.pos);
        this.rotationMat = rotMat2.mul(rotMat1);
        this.viewMatrix = this.rotationMat.mul(this.translationMat);
        //this.viewMatrix = rotMat2.mul(rotMat1.mul(this.translationMat));
        //this.viewMatrix = rotMat3.mul(this.translationMat);
        //this.viewMatrix = (r).mul(this.translationMat);
        //this.viewMatrix = (new mat4().makeRotation(this.rot)).mul(this.translationMat);
    }

    setPosition(pos)
    {
        this.pos = pos;
    }
    setRotation(rot)
    {
        this.rot = rot;
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
        return ( this.getRotationMatrixInv().mul( new vec4(0,0,-1) ) ).sub( this.getPosition() )
    }
}

