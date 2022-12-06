
class Player
{
    constructor()
    {
        this.walkSpeed = 0.2;
        this.runSpeed = 0.8;
        this.rotSpeed = 0.05;
        this.pos = new vec4(0,-50,0);
        this.rot = new vec4();
        
        this.translationMat = new mat4();
        this.rotationMat = new mat4();
        this.viewMatrix = new mat4();

        this.update();
    }

    update(pressedKeys)
    {
        if (pressedKeys == null) {return;}

        var speed = this.walkSpeed;
        if (pressedKeys['Control'])
        {
            speed = this.runSpeed;
        }
        //Update Position
        if (pressedKeys['w'])
        {
            this.pos.x -= Math.sin(this.rot.y)*speed;
            this.pos.z += Math.cos(this.rot.y)*speed;
        }
        if (pressedKeys['s'])
        {
            this.pos.x += Math.sin(this.rot.y)*speed;
            this.pos.z -= Math.cos(this.rot.y)*speed;
        }
        if (pressedKeys['d'])
        {
            this.pos.x -= Math.cos(this.rot.y)*speed;
            this.pos.z -= Math.sin(this.rot.y)*speed;
        }
        if (pressedKeys['a'])
        {
            this.pos.x += Math.cos(this.rot.y)*speed;
            this.pos.z += Math.sin(this.rot.y)*speed;
        }
        if (pressedKeys[' '])
        {
            this.pos.y -= speed;
        }
        if (pressedKeys['Shift'])
        {
            this.pos.y += speed;
        }

        //Update Rotation
        if (pressedKeys['ArrowUp'])
        {
            this.rot.z -= this.rotSpeed;
        }
        if (pressedKeys['ArrowDown'])
        {
            this.rot.z += this.rotSpeed;
        }
        if (pressedKeys['ArrowLeft'])
        {
            this.rot.y -= this.rotSpeed;
        }
        if (pressedKeys['ArrowRight'])
        {
            this.rot.y += this.rotSpeed;
        }

        //Update Matrices
        this.translationMat = new mat4().makeTranslation(this.pos.x, this.pos.y, this.pos.z);
        var rotMat1 = new mat4().makeRotation(0, this.rot.y, 0);
        var rotMat2 = new mat4().makeRotation(0, 0, this.rot.z);
        this.viewMatrix = rotMat2.mul(rotMat1.mul(this.translationMat));
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
}

