
class FPC {
    constructor(position = new vec4(), rotation = new vec4())
    {
        this.position = position;
        this.rotation = rotation;

        this.velocity = new vec4();
        this.isFalling = true;

        //Constants
        this.movementSpeed = 4;
        this.rotationSpeed = 2;
        this.jumpSpeed = 15;
        this.fallSpeed = -2;
        this.mouseSensitivityMultiplier = 4;

        //Variables remembering which keys are down
        this.pressedKeys = new Map();
        this.mouseIsDown = false;

        this.translationMatrix = new mat4();
        this.rotationMatrix = new mat4();
        
        //Boolean to prevent excessive matrix operations
        this.viewMatNeedsUpdate = true;
        this.pUpdateTime = new Date().getTime();
    }

    update() {
        const currentTime = new Date().getTime();
        const dTime = (currentTime - this.pUpdateTime)/1000;
        this.pUpdateTime = currentTime;
        let mspeed = this.movementSpeed * dTime * (this.isFalling ? 0.2 : 1); //half speed if falling/is in air
        const rspeed = this.rotationSpeed * dTime;
        const jspeed = this.jumpSpeed * dTime;
        const fspeed = this.fallSpeed * dTime;

        let posChange = new vec4();


        const bb = 0.4;
        const feetYOffset = -1.1;
        const headYOffset = -0.1;
        const belowFeetYOffset = -1.9;
        const aboveHeadYOffset = 0.5;
        const pos = this.getPosition().muli(1,1,-1);
        const belowFeet = chunkManager.getBlock(pos.add(0,belowFeetYOffset));
        const feet = chunkManager.getBlock(pos.add(0,feetYOffset));
        const head = chunkManager.getBlock(pos);
        const aboveHead = chunkManager.getBlock(pos.add(0,aboveHeadYOffset));

        //used below keyboard input.
        const feetXp = chunkManager.getBlock(pos.add(bb, feetYOffset, 0));
        const feetXm = chunkManager.getBlock(pos.add(-bb, feetYOffset, 0));
        const feetZp = chunkManager.getBlock(pos.add(0, feetYOffset, bb));
        const feetZm = chunkManager.getBlock(pos.add(0, feetYOffset, -bb));
        const headXp = chunkManager.getBlock(pos.add(bb, headYOffset, 0));
        const headXm = chunkManager.getBlock(pos.add(-bb, headYOffset, 0));
        const headZp = chunkManager.getBlock(pos.add(0, headYOffset, bb));
        const headZm = chunkManager.getBlock(pos.add(0, headYOffset, -bb));


        //determine if falling or not, and adjust velocity.
        if ((belowFeet == null || belowFeet < 0) && pos.y > 0) // falling = true
        {
            this.isFalling = true;
            this.velocity.addi(0,fspeed,0);
        } else {
            this.velocity.y = 0; //falling = false;
            this.isFalling = false;
        }

        //Keyboard input
        if (this.pressedKeys.get('shift') == true)
        {
            this.viewMatNeedsUpdate = true;
            mspeed *= 1.5
            //posChange.y -= mspeed;
        } 
        if (this.pressedKeys.get('w') == true)
        {
            this.viewMatNeedsUpdate = true;
            posChange.x += Math.sin(this.rotation.y)*mspeed; 
            posChange.z += Math.cos(this.rotation.y)*mspeed;
        }
        if (this.pressedKeys.get('s') == true)
        {
            this.viewMatNeedsUpdate = true;
            posChange.x -= Math.sin(this.rotation.y)*mspeed; 
            posChange.z -= Math.cos(this.rotation.y)*mspeed;
        }
        if (this.pressedKeys.get('a') == true)
        {
            this.viewMatNeedsUpdate = true;
            posChange.x -= Math.cos(this.rotation.y)*mspeed; 
            posChange.z += Math.sin(this.rotation.y)*mspeed;
        }
        if (this.pressedKeys.get('d') == true)
        {
            this.viewMatNeedsUpdate = true;
            posChange.x += Math.cos(this.rotation.y)*mspeed; 
            posChange.z -= Math.sin(this.rotation.y)*mspeed;
        }
        if (this.pressedKeys.get(' ') == true && this.isFalling == false)
        {
            this.viewMatNeedsUpdate = true;
            posChange.y += jspeed;
        }

        //rotation input
        if (this.pressedKeys.get('arrowright') == true)
        {
            this.viewMatNeedsUpdate = true;
            this.rotation.y += rspeed;
        }
        if (this.pressedKeys.get('arrowleft') == true)
        {
            this.viewMatNeedsUpdate = true;
            this.rotation.y -= rspeed;
        }
        if (this.pressedKeys.get('arrowup') == true)
        {
            this.viewMatNeedsUpdate = true;
            this.rotation.z -= rspeed;
        }
        if (this.pressedKeys.get('arrowdown') == true)
        {
            this.viewMatNeedsUpdate = true;
            this.rotation.z += rspeed;
        }

        //only allow movement along x axis if no block is going to be hit.
        if ((feetXp != null && feetXp >= 0 && posChange.x > 0) || 
            (headXp != null && headXp >= 0 && posChange.x > 0) )
        {
            posChange.x = 0;
            this.velocity.x = 0;
        }
        if ((feetXm != null && feetXm >= 0 && posChange.x < 0) ||
            (headXm != null && headXm >= 0 && posChange.x < 0) )
        {
            posChange.x = 0;
            this.velocity.x = 0;
        }
        if ((feetZm != null && feetZm >= 0 && posChange.z > 0) ||
            (headZm != null && headZm >= 0 && posChange.z > 0) )
        {
            posChange.z = 0;
            this.velocity.z = 0;
        } 
        if ((feetZp != null && feetZp >= 0 && posChange.z < 0) || 
        (headZp != null && headZp >= 0 && posChange.z < 0) )
        {
            posChange.z = 0;
            this.velocity.z = 0;
        }

        if (aboveHead != null && aboveHead >= 0 && (this.velocity.y > 0 || posChange.y > 0))
        {
            posChange.y = 0;
            this.velocity.y = 0;
        }
        //console.log(aboveHead, posChange.y);
        this.velocity.addi(posChange);

        

        this.position.addi(this.velocity);

        if (this.isFalling)
        {
            this.velocity.muli(0.9, 0.9, 0.9);
        } else {
            this.velocity.muli(0.2, 0.9, 0.2);
        }

    }
    setPosition(pos=new vec4(), y=0,z=0)
    {
        if (!(pos instanceof vec4))
        {
            pos = new vec4(pos,y,z);
        }
        this.position = pos.copy();
    }
    setRotation(rot=new vec4(), y=0,z=0)
    {
        if (!(rot instanceof vec4))
        {
            rot = new vec4(rot,y,z);
        }
        this.rotation = rot.copy();
    }
    getPosition()
    {
        return this.position.copy();
    }
    getRotation()
    {        
        const yMat = new mat4().makeRotation(0,this.rotation.y, 0);
        const xMat = new mat4().makeRotation(0,0,this.rotation.z);
        this.rotationMatrix = xMat.mul(yMat);
        let r = getRotationFromRotationMatrix(this.rotationMatrix);
        return r;
    }
    getViewMatrix()
    {
        console.error("FPC.getViewMatrix(). DO NOT USE THIS FUNCTION.");
        return;
        if (this.viewMatNeedsUpdate == true)
        {
            this.translationMatrix.makeTranslation(-this.position.x, -this.position.y, this.position.z);
            const yMat = new mat4().makeRotation(0,this.rotation.y, 0);
            const zMat = new mat4().makeRotation(0,0,this.rotation.x);
            this.rotationMatrix = zMat.mul(yMat);
            this.viewMatNeedsUpdate = false;
        }
        return this.rotationMatrix.mul( this.translationMatrix );
    }
    eventListener(event)
    {
        switch (event.type)
        {
            case 'keydown': this.pressedKeys.set(event.key.toLowerCase(), true); break;
            case 'keyup': this.pressedKeys.set(event.key.toLowerCase(), false); break;
            case 'mousedown': this.mouseIsDown = true; break;
            case 'mouseup': this.mouseIsDown = false; break;
            case 'mousemove': 
                if (this.mouseIsDown)
                {
                    this.viewMatNeedsUpdate = true;
                    this.rotation.y -= event.movementX*this.mouseSensitivityMultiplier/1000;
                    this.rotation.z -= event.movementY*this.mouseSensitivityMultiplier/1000;
                }
                break;
        }
    }


    setMovementSpeed(speed = 0.15)
    {
        this.movementSpeed = speed;
    }
    setRotationSpeed(speed = 0.08)
    {
        this.rotationSpeed = speed;
    }
    setMouseSensitivity(speed = 2)
    {
        this.mouseSensitivityMultiplier = speed;
    }
    getMovementSpeed()
    {
        return this.movementSpeed;
    }
    getRotationSpeed()
    {
        return this.rotationSpeed;
    }
    getMouseSensitivity()
    {
        return this.mouseSensitivityMultiplier;
    }
}

class Player {
    constructor()
    {
        //first person controller
        this.fpc = new FPC(new vec4(5,30,5), new vec4(0,2,0));

        this.inventory = [];
        for (let i=0; i<40; i++) { this.inventory.push(null); }

        //this.inventory[2] = {type:0,quantity:11};
        this.inMenu = false;
        this.shiftIsDown = false;
        this.menuState = 'idle';

        this.stackSize = 99;
        this.inventoryRowHeight = 0.2;
        this.inventoryColumnWidth = 0.2;
        this.inventoryItemScale = new vec4(.08,.08,.08);
        this.inventoryItemRotation = new vec4(.5,.5,0.6);
        this.inventoryItemTextScale = new vec4(.05,.05,0.05);
        this.inventoryItemTextOffset = new vec4(0.02, 0.02, -0.2);

        this.inventorySelectIndex = 0;
        this.inventorySelectOverlayColor = new vec4(1,1,1,0.4);
        this.inventoryOverlayColor = new vec4(1,1,1,0.2);

        this.uiElementsIds = [];

        easyGl.createObject("inventoryBarOverlay", new vec4(-this.inventoryColumnWidth/2, -1+this.inventoryRowHeight, .99), null, new vec4(this.inventoryColumnWidth*5, this.inventoryRowHeight/2, 1), [-1,1,0, 1,1,0, 1,-1,0, -1,-1,0], [0,1,2, 0,3,2], null, this.inventoryOverlayColor, true);
        easyGl.createObject("inventoryOverlay", new vec4(-this.inventoryColumnWidth/2, -1+this.inventoryRowHeight*5/2, .99), null, new vec4(this.inventoryColumnWidth*5, this.inventoryRowHeight*2, 1), [-1,1,0, 1,1,0, 1,-1,0, -1,-1,0], [0,1,2, 0,3,2], null, this.inventoryOverlayColor, true);


        this.createUIGraphics();
        this.setInventorySelect();
    }
    collectItem(blockType = 0, quantity = 1)
    {
        for (let i=0; i<this.inventory.length; i++)
        {
            const el = this.inventory[i];
            if (el != null && el.type == blockType)
            {
                while (quantity > 0 && el.quantity < this.stackSize)
                {
                    el.quantity++;
                    quantity--;
                }
                if (quantity == 0) 
                {
                    this.createUIGraphics(); 
                    return; 
                }
            }
        }

        //if we get here, we need to create a new stack
        for (let i=0; i<this.inventory.length; i++)
        {
            let el = this.inventory[i];
            if (el == null)
            {
                el = {type:blockType, quantity:0};
                this.inventory[i] = el;
                while (quantity > 0 && el.quantity < this.stackSize)
                {
                    el.quantity++;
                    quantity--;
                }
                if (quantity == 0) 
                { 
                    this.createUIGraphics();
                    return;
                }
            }
        }
    }
    removeItem(inventoryIndex=this.inventorySelectIndex, quantity=1)
    {
        const el = this.inventory[inventoryIndex];
        if (el == null)
        {
            return null;
        }
        el.quantity -= quantity;
        if (el.quantity < 1)
        {
            this.inventory[inventoryIndex] = null;
        }
        this.createUIGraphics();
        return el.type;
    }
    setInventorySelect(index, saveIndex=true)
    {
        if (isNaN(index))
        {
            index = this.inventorySelectIndex;
        }
        if (saveIndex)
        {
            this.inventorySelectIndex = index;
        }
        easyGl.createObject("inventorySelectOverlay", new vec4(-this.inventoryColumnWidth*(5-index%10), -1+this.inventoryRowHeight*(1+Math.floor(index/10)), 0.9), null, new vec4(this.inventoryColumnWidth/2, this.inventoryRowHeight/2, 1), [-1,1,0, 1,1,0, 1,-1,0, -1,-1,0], [0,1,2, 0,3,2], null, this.inventorySelectOverlayColor, true);
    }
    createUIGraphics()
    {
        
        let y = -1+this.inventoryRowHeight;
        let x = -this.inventoryColumnWidth*5;
        let z = 0;
        this.uiElementsIds = [];
        for (let i=0; i<this.inventory.length; i++)
        {
            if (i % 10 == 0 && i != 0)
            {
                x = -this.inventoryColumnWidth*5;
                y += this.inventoryRowHeight;
            }

            const el = this.inventory[i];
            if (el == null) {
                easyGl.deleteObject("iE"+i);
                easyGl.deleteObject("iEQT"+i);
            }

            if (el != null)
            {
                easyGl.createObject("iE"+i, new vec4(x,y,z), this.inventoryItemRotation , this.inventoryItemScale, null, null, null, blockColors[el.type], true);
                easyGl.createText("iEQT"+i, el.quantity, new vec4(x+this.inventoryItemTextOffset.x,y+this.inventoryItemTextOffset.y,z+this.inventoryItemTextOffset.z), new vec4(), this.inventoryItemTextScale, new vec4(0,0,0,1), true);
                this.uiElementsIds.push("iE"+i);
                this.uiElementsIds.push("iEQT"+i);
            }
            x += this.inventoryColumnWidth;
        }
    }
    _getInventoryUIIndexFromMouseEvent(event)
    {
        let aspectRatio = canvasElement.width/canvasElement.height;
        let mx = ((event.offsetX*2)/canvasElement.width - 1)*aspectRatio;   //mouseX and mouseY, scale X using aspect ratio
        let my = 1 - (event.offsetY*2)/canvasElement.height;
        
        let dy = this.inventoryRowHeight/2;     //half of row height
        let dx = this.inventoryColumnWidth/2;   //half of row width

        let y = -1+this.inventoryRowHeight;     //inventory bar/row y
        let x = -this.inventoryColumnWidth*5;   //inventory column x

        let index = null;

        for (let j=0; j<4; j++) 
        {
            y = -1+this.inventoryRowHeight*(j+1);
            x = -this.inventoryColumnWidth*5;
            for (let i=0; i<10; i++)
            {  
                if (x+dx > mx && x-dx < mx && y+dy > my && y-dy < my)
                {
                    index = j*10 + i;
                    break;
                }
                x += this.inventoryColumnWidth;
            }
            if (index != null)
            {
                break;
            }
        }
        console.log(index);
        return {
            index: index,
            mouseX: mx,
            mouseY: my
        };
    }
    getBlockQuantityInHand()
    {
        return this.inventory[this.inventorySelectIndex].quantity;
    }
    getBlockTypeInHand()
    {
        return this.inventory[this.inventorySelectIndex].type;
    }
    eventListener(event)
    {

        if (event.type == "keydown")
        {
            switch(event.key.toLowerCase())
            {
                case "e": this.inMenu = !this.inMenu; break;
                case "escape": this.inMenu = !this.inMenu; break;
                case "shift": this.shiftIsDown = true; break;
                case "i": this.collectItem("0", 40); this.collectItem("3", 80); this.collectItem("2", 40); this.collectItem("4", 80); this.collectItem("TNT", 80); break;
                case "1": this.setInventorySelect(0); break; //easyGl.setObjectPosition("itemBarSelectOverlay", -itemBarWidth + itemBarIncrement/2, null, null); itemBarSelectedNum = 1; break;
                case "2": this.setInventorySelect(1); break; //easyGl.setObjectPosition("itemBarSelectOverlay", -itemBarWidth + itemBarIncrement*3/2, null, null); itemBarSelectedNum = 2; break;
                case "3": this.setInventorySelect(2); break; //easyGl.setObjectPosition("itemBarSelectOverlay", -itemBarWidth + itemBarIncrement*5/2, null, null); itemBarSelectedNum = 3;break;
                case "4": this.setInventorySelect(3); break; //easyGl.setObjectPosition("itemBarSelectOverlay", -itemBarWidth + itemBarIncrement*7/2, null, null); itemBarSelectedNum = 4;break;
                case "5": this.setInventorySelect(4); break; //easyGl.setObjectPosition("itemBarSelectOverlay", -itemBarWidth + itemBarIncrement*9/2, null, null); itemBarSelectedNum = 5;break;
                case "6": this.setInventorySelect(5); break; //easyGl.setObjectPosition("itemBarSelectOverlay", -itemBarWidth + itemBarIncrement*11/2, null, null); itemBarSelectedNum = 6;break;
                case "7": this.setInventorySelect(6); break; //easyGl.setObjectPosition("itemBarSelectOverlay", -itemBarWidth + itemBarIncrement*13/2, null, null); itemBarSelectedNum = 7;break;
                case "8": this.setInventorySelect(7); break; //easyGl.setObjectPosition("itemBarSelectOverlay", -itemBarWidth + itemBarIncrement*15/2, null, null); itemBarSelectedNum = 8;break;
                case "9": this.setInventorySelect(8); break; //easyGl.setObjectPosition("itemBarSelectOverlay", -itemBarWidth + itemBarIncrement*17/2, null, null); itemBarSelectedNum = 9;break;
                case "0": this.setInventorySelect(9); break; //easyGl.setObjectPosition("itemBarSelectOverlay", -itemBarWidth + itemBarIncrement*19 /2, null, null); itemBarSelectedNum = 10;break;
            }
        }

        if (event.type == "keyup")
        {
            switch(event.key.toLowerCase())
            {
                case "shift": this.shiftIsDown = false; break;
            }
        }

        if (!this.inMenu)
        {
            this.fpc.eventListener(event);
        }

        if (this.inMenu)
        {
            if (this.menuState != "idle" && this.menuState != "draggingItem")
            {
                this.menuState = "idle";
            }

            if (this.menuState == "idle")
            {
                if (event.type == "mousedown")
                {
                    let ret = this._getInventoryUIIndexFromMouseEvent(event);
                    if (ret.index != null && this.inventory[ret.index] != null)
                    {
                        //console.log(this.inventory[ret.index]);
                        this.menuState="draggingItem";
                        this.indexDraggingFrom = ret.index;
                        return;
                    }
                }
            }

            if (this.menuState == "draggingItem")
            {
                if (event.type == "mousemove")
                {
                    let ret = this._getInventoryUIIndexFromMouseEvent(event);
                    let mouseX = ret.mouseX;
                    let mouseY = ret.mouseY;
                    easyGl.setObjectPosition("iE"+this.indexDraggingFrom, new vec4(mouseX, mouseY));
                    easyGl.setObjectPosition("iEQT"+this.indexDraggingFrom, new vec4(mouseX + this.inventoryItemTextOffset.x, mouseY+this.inventoryItemTextOffset.y, this.inventoryItemTextOffset.z));
                    if (ret.index != null)
                    {
                        this.setInventorySelect(ret.index, false);
                    }
                }

                if (event.type == "mousedown")
                {
                    let ret = this._getInventoryUIIndexFromMouseEvent(event);
                    while(ret.index != null) {
                        if (ret.index == this.indexDraggingFrom)//if we clicked same slot, just stop moving
                        {
                            this.menuState = "idle";
                            break;
                        }

                        if (this.inventory[ret.index] == null && this.shiftIsDown && this.inventory[this.indexDraggingFrom].quantity > 1) //if there's nothing in the new slot & shift is down, place 1 from stack
                        {
                            this.inventory[ret.index] = {
                                type: this.inventory[this.indexDraggingFrom].type,
                                quantity:1,
                            };
                            this.inventory[this.indexDraggingFrom].quantity -= 1;
                            if (this.inventory[this.indexDraggingFrom].quantity < 1)
                            {
                                this.inventory[this.indexDraggingFrom] = null;
                            }
                            break;
                        }

                        if (this.inventory[ret.index] == null && (!this.shiftIsDown || this.inventory[this.indexDraggingFrom].quantity == 1))//if there's nothing in new slot and shift is up OR we only have 1, move to new place
                        {
                            this.inventory[ret.index] = this.inventory[this.indexDraggingFrom];
                            this.inventory[this.indexDraggingFrom] = null;
                            this.menuState = "idle";
                            break;
                        }
                        

                        if (this.inventory[ret.index] != null && this.shiftIsDown && this.inventory[ret.index].type == this.inventory[this.indexDraggingFrom].type) //add one to stack
                        {
                            if (this.inventory[ret.index].quantity < this.stackSize)
                            {
                                //add 1
                                this.inventory[ret.index].quantity += 1;
                                this.inventory[this.indexDraggingFrom].quantity -= 1;
                                if (this.inventory[this.indexDraggingFrom].quantity < 1)
                                {
                                    this.inventory[this.indexDraggingFrom] = null;
                                }
                            } else {
                                let temp = this.inventory[ret.index];
                                this.inventory[ret.index] = this.inventory[this.indexDraggingFrom];
                                this.inventory[this.indexDraggingFrom] = temp;
                            }
                        }


                        if (this.inventory[ret.index] != null && !this.shiftIsDown && this.inventory[ret.index].type == this.inventory[this.indexDraggingFrom].type)//if combining stacks with same type
                        {
                            this.inventory[ret.index].quantity += this.inventory[this.indexDraggingFrom].quantity;
                            this.menuState = "idle";
                            if (this.inventory[ret.index].quantity > this.stackSize)
                            {
                                this.inventory[this.indexDraggingFrom].quantity = this.inventory[ret.index].quantity - this.stackSize;
                                this.inventory[ret.index].quantity = this.stackSize;
                                this.menuState = "draggingItem";
                            } else {
                                this.inventory[this.indexDraggingFrom] = null;
                            }
                            break;
                        }

                        if (this.inventory[ret.index] != null && this.inventory[ret.index].type != this.inventory[this.indexDraggingFrom].type)//if placing stack on stack with different type, switch
                        {
                            let temp = this.inventory[ret.index];
                            this.inventory[ret.index] = this.inventory[this.indexDraggingFrom];
                            this.inventory[this.indexDraggingFrom] = temp;
                            break;
                        }

                        break;
                    }

                    this.createUIGraphics();
                    this.setInventorySelect();
                }

                


                /*
                if (event.type == "mousedown" && this.shiftIsDown == false)
                {
                    let ret = this._getInventoryUIIndexFromMouseEvent(event); 
                    console.log(ret);
                    if (ret.index != null)
                    {
                        if (this.inventory[ret.index] == null) //if we're placing block in inventory and the slot is empty
                        {
                            if (ret.index == this.indexDraggingFrom)
                            {
                                this.menuState = "idle";
                                this.setInventorySelect();
                            } else {
                                //move to new inventory index, only if there's no item in that inventory slot
                                this.inventory[ret.index] = this.inventory[this.indexDraggingFrom];
                                this.inventory[this.indexDraggingFrom] = null;
                                this.menuState = "idle";
                                this.setInventorySelect();
                            }
                        } else { //if the inventory slot is already populated, either combine or replace (place and pick up other pile)

                            if (ret.index == this.indexDraggingFrom)
                            {
                                this.menuState = "idle";
                            } else {
                                if (this.inventory[ret.index].type == this.inventory[this.indexDraggingFrom].type)
                                {  //same type, so combine
                                    this.inventory[ret.index].quantity += this.inventory[this.indexDraggingFrom].quantity;
                                    if (this.inventory[ret.index].quantity > this.stackSize)
                                    {
                                        this.inventory[this.indexDraggingFrom].quantity = this.inventory[ret.index].quantity - this.stackSize;
                                        this.inventory[ret.index].quantity = this.stackSize;
                                        this.menuState = "draggingItem";
                                    }
                                } else {
                                    let temp = this.inventory[ret.index];
                                    this.inventory[ret.index] = this.inventory[this.indexDraggingFrom];
                                    this.inventory[this.indexDraggingFrom] = temp;
                                    this.menuState = "draggingItem";
                                }
                            }
                        }
                    } else {
                        this.menuState = "idle";
                        this.setInventorySelect();
                    }
                    this.createUIGraphics();
                }

                
                if (event.type == "mousedown" && this.shiftIsDown)
                {
                    let ret = this._getInventoryUIIndexFromMouseEvent(event); 
                    if (ret.index != null)
                    { 
                        if (this.inventory[ret.index] == null) //we want to place 1 from the pile we're moving into position
                        {
                            this.inventory[ret.index] = {
                                type: this.inventory[this.indexDraggingFrom].type,
                                quantity: 1
                            };
                            this.inventory[this.indexDraggingFrom].quantity -= 1;
                            if (this.inventory[this.indexDraggingFrom].quantity < 1)
                            {
                                this.inventory[this.indexDraggingFrom] = null;
                                this.menuState = "idle";
                            }
                        } else { //we want to place 1 from the pile we're moving into position, stop moving current index, and pick up new index
                            //let temp = this.inventory[ret.index];
                            //this.inventory[ret.index] = {
                            //    type:this.inventory[this.indexDraggingFrom].type,
                            //    quantity:this.inventory[this.indexDraggingFrom].quantity
                            //};

                            //this.inventory[this.indexDraggingFrom] = temp;
                            //this.menuState = "draggingItem";
                        }
                    }
                    this.setInventorySelect();
                    this.createUIGraphics();
                }*/
            }
            return;
        }

        let blockType = null;
        let blockPos = null;
        let faceBlockPos = null;

        //Get block pointed at type, block position , and face block pos
        if (event.type == "mousedown" || event.type == "mousemove" || event.type == "custommousemove" || event.type == "mouseup")
        {
            //let ret = easyGl.getObjectFromScreen(event.offsetX, event.offsetY);
            //console.log(ret);
            //if (ret == null) { return; }

            let pPos;
            let pos = this.fpc.getPosition().copy().mul(1,1,-1);
            const stepVec = new mat4().makeRotation(this.fpc.rotation.x, Math.PI - this.fpc.rotation.y, this.fpc.rotation.z).mul( new vec4(0,0,selectedStepDist) );
            for (let i=0; i<selectDistance; i+=selectedStepDist)
            {
                pPos = pos.copy();
                pos.addi(stepVec);
                const ret = chunkManager.getBlock(pos);
                if (ret != null && ret >= 0)
                {
                    //console.log("mousedown || mousemove: found block.");
                    blockType = ret;
                    blockPos = pos.round(1); //important...
                    faceBlockPos = pPos.round(1);
                    break;
                }
            }
        }
        if (event.type == "mousedown" && event.which == 1)//left click, start mining.
        {
            mouseIsDown = true;
            if (blockType != null)
            {
                //console.log("Start mining @ " + blockPos.toString(.1))
                blockMiningStartTime = Date.now(); 
                blockMiningPos = blockPos;
                blockMiningType = blockType;
            }
        }
        if (event.type == "mousedown" && event.which == 3 && faceBlockPos != null)//right click down - start placing..
        {
            blockMiningType = null;
            blockMiningPos = null;
            this.blockStartPlacingPos = faceBlockPos.copy();
        }
        if (event.type == "mouseup" && event.which == 3 && faceBlockPos != null)//right click up - place blocks
        {
            blockMiningType = null;
            blockMiningPos = null;

            if (this.blockStartPlacingPos.equals(faceBlockPos))
            {
                const blockType = player.removeItem();
                chunkManager.setBlock(faceBlockPos, blockType);
            } else {
                const vec = faceBlockPos.sub(this.blockStartPlacingPos);
                const dist = vec.getLength();
                const stepDist = 0.2;
                const step = vec.mul(stepDist/dist);
                let pos = this.blockStartPlacingPos.copy();
                let pPos = new vec4();
            
                let positions = [];
                let type = this.getBlockTypeInHand();
                let numBlocksAvailable = this.getBlockQuantityInHand();
                let numBlocksPlaced = 0;
                for (let i=0; i<dist; i+=stepDist)
                {
                    if (!pPos.equals(pos.copy().round(1)))
                    {
                        if (numBlocksAvailable <= numBlocksPlaced)
                        {
                            break;
                        }
                        positions.push(pos);
                        let b = chunkManager.getBlock(pos);

                        if (isNaN(b) || b < 0)
                        {
                            numBlocksPlaced++;
                        }
                        
                        pPos = pos.copy().round(1);
                        positions.push(pPos);
                    }
                    pos.addi(step)
                }
                this.removeItem(this.inventorySelectIndex, numBlocksPlaced);
                chunkManager.setBlock(positions, type);
            }

        }
        if (event.type == "mouseup") //stop mining...
        {
            mouseIsDown = false;
            blockMiningPos = null;
            blockMiningType = null;
        }
        if (event.type == "mousemove" || event.type == "custommousemove") 
        {
            if (blockMiningPos != null)
            {
                if (blockPos == null || !(blockMiningPos.x == blockPos.x && blockMiningPos.y == blockPos.y && blockMiningPos.z == blockPos.z))
                {
                    //if mose moved and currently-looking-at block is different, stop mining
                    blockMiningPos = null;
                    blockMiningType = null;
                    if (blockPos != null && mouseIsDown == true)
                    {
                        blockMiningStartTime = Date.now(); 
                        blockMiningPos = blockPos;
                        blockMiningType = blockType;
                    }
                }
            }
        }
    }
    update()
    {
        this.fpc.update();
    }
    render()
    {
        const scaleMatrix = new mat4().makeScale(canvasElement.height/canvasElement.width,1,1);
        const identityMatrix = new mat4().makeIdentity();
        /*for (let i=0; i<this.uiElementsIds.length; i++)
        {
            const id = this.uiElementsIds[i];
            if (id == undefined)
            {
                continue;
            }
            easyGl.renderObjectCustomView(id, scaleMatrix, identityMatrix);
        }*/
        for (let i=0; i< ((this.inMenu)? this.inventory.length: 10 ); i++)
        {
            const id = "iE"+i;
            const id2 = "iEQT"+i;
            if (easyGl.getObjectExists(id))
            {
                easyGl.renderObjectCustomView(id, scaleMatrix, identityMatrix);
                easyGl.renderObjectCustomView(id2, scaleMatrix, identityMatrix);
            }
            
        }
        easyGl.renderObjectCustomView("inventorySelectOverlay", scaleMatrix, identityMatrix);
        
        if (this.inMenu)
        {
            easyGl.renderObjectCustomView("inventoryOverlay", scaleMatrix, identityMatrix);
        }
        easyGl.renderObjectCustomView("inventoryBarOverlay", scaleMatrix, identityMatrix);
        
        //easyGl.createObject("hde2");
        //easyGl.renderObjectCustomView("hde2", scaleMatrix, identityMatrix);
    }
}

class Chunk
{
    constructor(easyGl, position = new vec4(), chunkSize = 50, seaLevel=25)
    {
        this.blocks = []; //index of block = x*100 + z*10 + y;
        this.heightMap = [];
        //this.blockColors = [new vec4(0.4,0.4,0.4,1), new vec4(0,0.7,0,1), new vec4(0.7,0.7,0.7,1), new vec4(0,0.5,0.5,1)];
        this.uniqueId = Math.random();
        this.uniqueId2 = this.uniqueId + 1;
        this.position = position;

        this.edits = [];

        this.easyGl = easyGl;

        this.maxY = Math.max(chunkSize*2, 40);
        this.maxX = chunkSize;
        this.maxZ = chunkSize;
        this.seaLevel = seaLevel;

        const maxY = this.maxY;
        const maxX = this.maxX;
        const maxZ = this.maxZ;
        //const blockColors = this.blockColors;

        //generate terrain
        for (let x=0; x<maxX; x++)
        {
            for (let z=0; z<maxZ; z++)
            {
                const rx = x + this.position.x; //real X
                const rz = z + this.position.z;
                const h = this._heightFunction(rx,rz);
                this.heightMap.push(h);
                for (let y=0; y<h; y++)
                {
                    if (h-y < 2)
                    {
                        this.blocks.push(1); // create grass
                    } else if (h-y<4){
                        this.blocks.push(2); // create dirt                 
                    } else {
                        this.blocks.push(3); //create stone
                    }
                }
                for (let y=h; y<maxY; y++) //add air blocks...
                {
                    this.blocks.push(-1);
                }
            }
        }

        
        //generate trees
        for (let x=2; x<maxX-2; x++)
        {
            for (let z=2; z<maxZ-2; z++)
            {
                const rx = x + this.position.x; //real X
                const rz = z + this.position.z;
                let ry = seaLevel;
                if (x >= 0 && x < maxX && z >= 0 && z < maxZ)
                {
                    ry = this.heightMap[x*maxZ + z];
                } else {
                    ry = this._heightFunction(rx, rz);
                }
                
                const t = this._treeFunction(rx,ry,rz);

                if (t>0)
                {
                    //this.setBlock(new vec4())
                    this.blocks[x*this.maxY*this.maxZ+z*this.maxY+ry+t] = 5;
                    for (let i=-2; i<t; i++)
                    {
                        if (this.blocks[x*this.maxY*this.maxZ+z*this.maxY+ry+i] < 0)
                        {
                            this.blocks[x*this.maxY*this.maxZ+z*this.maxY+ry+i] = 4;
                            
                            if (i > 2)
                            {
                                for (let a=0; a<6.28; a+=0.3)
                                {
                                    let sa = Math.round(Math.sin(a));
                                    let ca = Math.round(Math.cos(a));
                                    this.blocks[(x+sa)*this.maxY*this.maxZ+(z+ca)*this.maxY+ry+i] = 5;
                                }
                            }
                        }
                    }
                    
                }
            
                //const h = this._heightFunction(rx,rz);
                //this.heightMap.push(h);
            }
        }

        this.createGlObject();
    }
    getBlock(pos, y, z)
    {
        //convert to x, y, z
        let x = pos;
        if (pos instanceof vec4)
        {
            y = pos.y;
            z = pos.z;
            x = pos.x;
        }

        //shift to chunk-local
        //x = Math.round(x - this.position.x);
        //y = Math.round(y - this.position.y);
        //z = Math.round(z - this.position.z);

        if (x < 0 || x >= this.maxX || z < 0 || z >= this.maxZ)
        {
            console.error("Trying to get block out of bounds of chunk",x,y,z)
            return -2;
        }
        return this.blocks[x*this.maxY*this.maxZ+z*this.maxY+y];
    }
    setBlock(positions, type, suppressGlUpdate = false, onlyReplaceAir = false)
    {
        if (!(positions instanceof Array))
        {
            positions = [positions];
        }

        let block = null;
        let pos;
        let numBlocksPlaced = 0;
        for (let i=0; i<positions.length; i++)
        {   
            pos = positions[i];
            block = this.blocks[pos.x*this.maxY*this.maxZ+pos.z*this.maxY+pos.y];
            if  (!onlyReplaceAir || (onlyReplaceAir && (isNaN(block) || block < 0)))
            {
                this.blocks[pos.x*this.maxY*this.maxZ+pos.z*this.maxY+pos.y] = type;
                numBlocksPlaced++;
            }
        }
        if (!suppressGlUpdate)
        {
            this.createGlObject();
        }
        return numBlocksPlaced;
    }
    breakBlock(pos, suppressGlUpdate = false)
    {
        const type =  this.blocks[pos.x*this.maxY*this.maxZ+pos.z*this.maxY+pos.y];
        this.blocks[pos.x*this.maxY*this.maxZ+pos.z*this.maxY+pos.y] = -1;
        if (type >= 0)
        {
            const e = new FloatingBlock(new vec4(pos.x+this.position.x, pos.y + this.position.y, pos.z + this.position.z), type, this.easyGl);
            e.velocity.x = 3 - Math.random()*6;
            e.velocity.y = 3 - Math.random()*6;
            e.velocity.z = 3 - Math.random()*6;
            entities.push( e );
        }

        if (!suppressGlUpdate)
        {
            this.createGlObject();
        }
        return 1;
    }
    _colorFunction(color, rx,ry,rz)
    {
        if (color instanceof vec4)
        {
            color.x += 0.02 * (Math.sin(rx) + Math.cos(rx/1.3) + Math.sin(rz/2) + Math.cos(rz/0.987) + Math.sin(ry));
            color.y += 0.02 * (Math.sin(rx/2) + Math.cos(rx/0.33) + Math.sin(rz/0.01) + Math.cos(rz/0.419)+ Math.cos(ry));
            color.z += 0.02 * (Math.sin(rx) + Math.cos(rx/1.2) + Math.sin(rz/0.2) + Math.cos(rz/.12)+ Math.sin(ry/1.425));
            color.x = Math.max(0, Math.min(1, color.x));
            color.y = Math.max(0, Math.min(1, color.y));
            color.z = Math.max(0, Math.min(1, color.z));
        }
        return color;
    }
    _heightFunction(rx, rz)
    {
        const hash = this.seaLevel + 2*Math.sin(rx/3 + 1) + 2*Math.cos(rx/17 + 2) + 2*Math.cos(rz/5)*Math.cos(rz/13) + Math.cos((rz+rx)/5) + 2*Math.sin(rz/23) + Math.sin(rx/7) + 2*Math.cos((rz+rx)/23);
        return  Math.floor(Math.max(3, Math.min(this.maxY-3, hash)));
    }
    _treeFunction(rx,ry,rz)
    {
        const hash = Math.sin(rx/2.23) + Math.sin(rz/2.23) + Math.sin(rx/2.2) + Math.sin(rz/3.73) + Math.sin(rx+rz/5);
        if (Math.abs(rx)%4 < 3)
        {
            return 0;
        }
        if (Math.abs(rz)%5 < 4)
        {
            return 0;
        }
        if (hash > 3.5)
        {
            return Math.round(Math.abs(Math.sin(rx/0.673)) + Math.abs(Math.sin(rx/1.3)) + Math.abs(Math.sin(ry)) + 4);
        } else {
            return 0;
        }
    }
    createGlObject()
    {
        const maxY = this.maxY;
        const maxX = this.maxX;
        const maxZ = this.maxZ;
        //const blockColors = this.blockColors;

        //now, make vertices, indices, etc
        let v = [];
        let i = [];
        let c = [];
        let n = [];
        for (let x=0; x<maxX; x++)
        {
            for (let z=0; z<maxZ; z++)
            {
                for (let y=0; y<maxY; y++)
                {
                    const b = this.blocks[x*maxY*maxZ+z*maxY+y];
                    const rx = x + this.position.x; //real X
                    const ry = y + this.position.y;
                    const rz = z + this.position.z;

                    if (b < 0 || b > blockColors.length - 1 || blockOpacities[b] == 1) // continue if block is air or is opaque
                    {
                        continue;
                    }

                    //onsole.log(blockColors, b);
                    let color = blockColors[b].copy();
                    color = this._colorFunction(color, rx, ry, rz);

                    let below = -2; //don't render if out of bounds
                    let above = -2; //don't render if out of bounds
                    let left = -1;
                    let right = -1;
                    let front = -1;
                    let back = -1;

                    if (y > 0) //check below
                    {
                        below = this.blocks[x*maxY*maxZ+z*maxY+y-1];   
                    }
                    if (y < maxY-1)
                    {
                        above = this.blocks[x*maxY*maxZ+z*maxY+y+1];
                    }
                    if (x > 0) //check left
                    {
                        left = this.blocks[(x-1)*maxY*maxZ+z*maxY+y];
                    }
                    if (x+1<maxX) //check right
                    {
                        right = this.blocks[(x+1)*maxY*maxZ+z*maxY+y];
                    }
                    if (z > 0) //check front
                    {
                        front = this.blocks[x*maxY*maxZ+(z-1)*maxY+y];
                    }
                    if (z+1<maxZ) //check back
                    {
                        back = this.blocks[x*maxY*maxZ+(z+1)*maxY+y];
                    }

                    if (below == -1 || blockOpacities[below] == 1) //if block below is air...
                    {
                        let ind = v.length/3;
                        v.push( x - 0.5, y - 0.5, z - 0.5);
                        v.push( x + 0.5, y - 0.5, z - 0.5);
                        v.push( x + 0.5, y - 0.5, z + 0.5);
                        v.push( x - 0.5, y - 0.5, z + 0.5);
                        i.push(ind, ind+1, ind+2, ind, ind+2, ind+3);
                        c.push(color.x, color.y, color.z, color.a,   color.x, color.y, color.z, color.a,   color.x, color.y, color.z, color.a,   color.x, color.y, color.z, color.a  );
                        n.push(0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0);
                    }
                    if (above == -1 || blockOpacities[above] == 1) //if block above is air, add top
                    {
                        let ind = v.length/3;
                        v.push( x - 0.5, y + 0.5, z - 0.5);
                        v.push( x + 0.5, y + 0.5, z - 0.5);
                        v.push( x + 0.5, y + 0.5, z + 0.5);
                        v.push( x - 0.5, y + 0.5, z + 0.5);
                        i.push(ind, ind+2, ind+1, ind, ind+3, ind+2);
                        c.push(color.x, color.y, color.z, color.a, color.x, color.y, color.z, color.a, color.x, color.y, color.z, color.a, color.x, color.y, color.z, color.a  );
                        n.push(0,1,0, 0,1,0, 0,1,0, 0,1,0);
                    }
                    
                    if (left == -1 || blockOpacities[left] == 1) //if block left is air, add left
                    {
                        let ind = v.length/3;
                        v.push( x - 0.5, y - 0.5, z - 0.5);
                        v.push( x - 0.5, y + 0.5, z - 0.5);
                        v.push( x - 0.5, y + 0.5, z + 0.5);
                        v.push( x - 0.5, y - 0.5, z + 0.5);
                        i.push(ind, ind+2, ind+1, ind, ind+3, ind+2);
                        c.push(color.x, color.y, color.z, color.a, color.x, color.y, color.z, color.a, color.x, color.y, color.z, color.a, color.x, color.y, color.z, color.a  );
                        n.push(-1,0,0, -1,0,0, -1,0,0, -1,0,0,);
                    }
                    if (right == -1 || blockOpacities[right] == 1) //if block above is air, add top
                    {
                        let ind = v.length/3;
                        v.push( x + 0.5, y - 0.5, z - 0.5);
                        v.push( x + 0.5, y + 0.5, z - 0.5);
                        v.push( x + 0.5, y + 0.5, z + 0.5);
                        v.push( x + 0.5, y - 0.5, z + 0.5);
                        i.push(ind, ind+1, ind+2, ind, ind+2, ind+3);
                        c.push(color.x, color.y, color.z, color.a, color.x, color.y, color.z, color.a, color.x, color.y, color.z, color.a, color.x, color.y, color.z, color.a  );
                        n.push(1,0,0, 1,0,0, 1,0,0, 1,0,0,);
                    }

                    if (front == -1 || blockOpacities[front] == 1) //if block above is air, add top
                    {
                        let ind = v.length/3;
                        v.push( x - 0.5, y - 0.5, z - 0.5);
                        v.push( x - 0.5, y + 0.5, z - 0.5);
                        v.push( x + 0.5, y + 0.5, z - 0.5);
                        v.push( x + 0.5, y - 0.5, z - 0.5);
                        i.push(ind, ind+1, ind+2, ind, ind+2, ind+3);
                        c.push(color.x, color.y, color.z, color.a, color.x, color.y, color.z, color.a, color.x, color.y, color.z, color.a, color.x, color.y, color.z, color.a  );
                        n.push(0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1);
                    }
                    if (back == -1 || blockOpacities[back] == 1) //if block above is air, add top
                    {
                        let ind = v.length/3;
                        v.push( x - 0.5, y - 0.5, z + 0.5);
                        v.push( x - 0.5, y + 0.5, z + 0.5);
                        v.push( x + 0.5, y + 0.5, z + 0.5);
                        v.push( x + 0.5, y - 0.5, z + 0.5);
                        i.push(ind, ind+2, ind+1, ind, ind+3, ind+2);
                        c.push(color.x, color.y, color.z, color.a, color.x, color.y, color.z, color.a, color.x, color.y, color.z, color.a, color.x, color.y, color.z, color.a  );
                        n.push(0,0,1, 0,0,1, 0,0,1, 0,0,1);
                    }
                }
            }
        }
        this.easyGl.deleteObject(this.uniqueId);
        this.easyGl.createObject(this.uniqueId, this.position, null, null, v, i, n, c);

        //create all transparent objects as independedent gl objects
        let incrementor = 1;
        for (let x=0; x<maxX; x++)
        {
            for (let z=0; z<maxZ; z++)
            {
                for (let y=0; y<maxY; y++)
                {
                    const b = this.blocks[x*maxY*maxZ+z*maxY+y];
                    const rx = x + this.position.x; //real X
                    const ry = y + this.position.y;
                    const rz = z + this.position.z;

                    if (!(b >= 0 && blockOpacities[b] == 1))
                    {
                        continue;
                    }

                    //onsole.log(blockColors, b);
                    let color = blockColors[b].copy();
                    color = this._colorFunction(color, rx, ry, rz);

                    this.easyGl.deleteObject(this.uniqueId+this.uniqueId);
                    this.easyGl.createObject(this.uniqueId+incrementor, new vec4(rx,ry,rz), new vec4(), new vec4(1,1,1), null, null, null, color);
                    incrementor++;
                }
            }
        }
    }
    enableRender(enable = true)
    {
        this.easyGl.setObjectHide(this.uniqueId, !enable);
    }
}

class ChunkManager
{
    constructor(easyGl, chunkSize = 40, seaLevel = 20)
    {
        this.easyGl = easyGl;
        this.chunkSize = chunkSize;
        this.seaLevel = seaLevel;

        this.chunks = [];//new Chunk(easyGl)];
        this.chunkMap = new Map();
        this.renderDistance = 3;
        for (let x = -this.renderDistance; x < this.renderDistance; x++)
        {
            for (let z = -this.renderDistance; z < this.renderDistance; z++)
            {
                const chunkX = x*this.chunkSize;
                const chunkZ = z*this.chunkSize;
                const c = new Chunk(this.easyGl, new vec4(chunkX,0,chunkZ), this.chunkSize, this.seaLevel);
                this.chunks.push( c );
                this.chunkMap.set(chunkX+','+chunkZ, c);
            }
        }
    }
    getBlock(pos)
    {
        const ret = this._parsePosition(pos);
        const c = this.chunkMap.get(ret.chunkX+','+ret.chunkZ);
        if (c instanceof Chunk)
        {
            return c.getBlock(ret.x,ret.y,ret.z);
        }
        console.error("out of bounds...?");
    }
    setBlock(positions = [], type, suppressGlUpdate = false, onlyReplaceAir = false)
    {
        const e = spawnEntityByName(type, positions);
        if (e != null)
        {
            return;
        }

        if (positions instanceof vec4)
        {
            positions = [positions];
        }
        let chunks = new Set();
        let numBlocksSet = 0;
        for(let i=0; i<positions.length; i++)
        {
            const ret = this._parsePosition(positions[i]);
            const c = this.chunkMap.get(ret.chunkX+','+ret.chunkZ);
            const pos = new vec4(ret.x, ret.y, ret.z);
            numBlocksSet += c.setBlock(pos, type, true, onlyReplaceAir);
            chunks.add(c);
        }
        if (!suppressGlUpdate)
        {
            chunks.forEach((c) => {c.createGlObject();});
        }
        return numBlocksSet;
    }
    breakBlock(positions = [], suppressGlUpdate = false)
    {
        if (positions instanceof vec4)
        {
            positions = [positions];
        }
        let chunks = new Set();
        for(let i=0; i<positions.length; i++)
        {
            const ret = this._parsePosition(positions[i]);
            const c = this.chunkMap.get(ret.chunkX+','+ret.chunkZ);
            c.breakBlock(ret, true);
            chunks.add(c);
        }
        if (!suppressGlUpdate)
        {
            chunks.forEach((c) => {c.createGlObject();});
        }
    }
    refreshChunk(position)
    {
        if (!(position instanceof Array))
        position = [position];

        let chunksChecked = new Set();
        for (let i=0; i<position.length; i++)
        {
            const ret = this._parsePosition(position[i]);
            const c = this.chunkMap.get(ret.chunkX+','+ret.chunkZ);
            if (!chunksChecked.has(c))
            {
                c.createGlObject();
            } else {
                chunksChecked.add(c);
            }
        }
    }
    _parsePosition(pos)
    {
        pos = pos.copy();
        pos.x = Math.round(pos.x);
        pos.y = Math.round(pos.y);
        pos.z = Math.round(pos.z);
        const chunkX = Math.floor(pos.x/this.chunkSize) * this.chunkSize;
        const chunkZ = Math.floor(pos.z/this.chunkSize) * this.chunkSize;
        let x = pos.x % this.chunkSize;
        let z = pos.z % this.chunkSize;
        let y = pos.y;

        while ( z < 0 )
        {
            z += this.chunkSize;
        }

        while ( x < 0 )
        {
            x += this.chunkSize;
        }

        return {
            chunkX:chunkX,
            chunkZ:chunkZ,
            x:x,
            y:y,
            z:z,
        };
    }
    update(fpcPosition = new vec4())
    {
        const ret = this._parsePosition(fpcPosition);

        //Disable all chunks
        for (let i=0; i<this.chunks.length; i++)
        {
            this.chunks[i].enableRender(false);
        }

        //enable rendering
        for (let x=-this.renderDistance+ret.chunkX/this.chunkSize; x < this.renderDistance+ret.chunkX/this.chunkSize; x++)
        {
            for (let z=-this.renderDistance+ret.chunkZ/this.chunkSize; z < this.renderDistance+ret.chunkZ/this.chunkSize; z++)
            {
                const chunkX = x*this.chunkSize;
                const chunkZ = z*this.chunkSize;
                const c = this.chunkMap.get(chunkX+","+chunkZ);
                if (c instanceof Chunk)
                {
                    c.enableRender(true);
                } else {
                    //chunk DNE
                    const c = new Chunk(this.easyGl, new vec4(chunkX,0,chunkZ), this.chunkSize, this.seaLevel);
                    this.chunks.push( c );
                    this.chunkMap.set(chunkX+','+chunkZ, c);
                }
            }
        }
    }
}

class Entity 
{
    constructor(position = new vec4(), rotation = new vec4(), easyGl)
    {
        this.position = position;
        this.rotation = rotation;
        if (!(this.position instanceof vec4))
        {
            this.position = new vec4();
        }
        if (!(this.rotation instanceof vec4))
        {
            this.rotation = new vec4();
        }
        
        this.velocity = new vec4();
        this.easyGl = easyGl;
        this.previousUpdateTime = Date.now();
        this.isDead = false;
        this.id = Math.random()*1000000;
    }
    update()
    {
        if (this.isDead)
        {
            return;
        }
    }
}

class FloatingBlock extends Entity
{
    constructor(position = new vec4(), blockType, easyGl)
    {
        super(position, new vec4(), easyGl);
        this.floatSpeed = 1;
        this.floatDist = 3;
        this.blockType = blockType;
        this.maxTime = 1000*30;
        this.startTime = Date.now();
        this.easyGl.createObject(this.id, this.position, this.rotation, new vec4(0.2,0.25,0.25,0.3), null, null, null, blockColors[this.blockType]);
    }
    update()
    {
        super.update();

        if (Date.now() -  this.startTime > this.maxTime)
        {
            this.easyGl.deleteObject(this.id);
            this.isDead = true;
            return;
        }

        this.rotation.y += Math.random()/5;
        this.rotation.z += Math.random()/10;
        this.rotation.x += Math.random()/20;
        this.velocity.x *= 0.9;
        this.velocity.z *= 0.9;
        this.velocity.y *= 0.9;

        const fpcPos = player.fpc.getPosition().mul(1,1,-1).subi(0,0.75,0);
        const distToFpc = distanceBetweenPoints(fpcPos, this.position); 
        if (distToFpc < this.floatDist)
        {
            this.velocity.addi(fpcPos.sub(this.position).mul(Math.pow(this.floatSpeed/distToFpc,2)));
            if (distToFpc < 1)
            {
                this.easyGl.deleteObject(this.id);
                player.collectItem(this.blockType);
                this.isDead = true;
                return;
            }
        }

        //Add falling
        const blockBelow = chunkManager.getBlock(this.position.sub(0,1,0));
        if (blockBelow == null || blockBelow < 0)
        {
            this.velocity.y -= 0.2;
        } else if (distToFpc > this.floatDist) {
            this.velocity.y *= 0.3;
        }
        this.position.addi(this.velocity.mul((Date.now() - this.previousUpdateTime)/1000));

        //Update easygl model
        this.easyGl.setObjectRotation(this.id, this.rotation);
        this.easyGl.setObjectPosition(this.id, this.position);

        this.previousUpdateTime = Date.now();
    }
}

class FallingBlock extends Entity
{
    constructor(position = new vec4(), rotation = new vec4(), easyGl)
    {
        super(position, rotation, easyGl);
    }
    update()
    {
        super.update();
        
        //Add falling
        const blockBelow = chunkManager.getBlock(this.position.sub(0,1,0));
        if (blockBelow == null || blockBelow < 0)
        {
            this.velocity.y -= 0.2;
        } else {
            this.velocity.y = 0;
        }
        this.velocity.muli(0.7);
        this.position.addi(this.velocity.mul((Date.now() - this.previousUpdateTime)/1000));

        //Update easygl model
        this.easyGl.setObjectRotation(this.id, this.rotation);
        this.easyGl.setObjectPosition(this.id, this.position);
    }
}

class TNT extends FallingBlock
{
    constructor(position = new vec4(), rotation = new vec4(), easyGl)
    {
        super(position, rotation, easyGl);
        this.color = blockColors[10].copy();
        this.easyGl.createObject(this.id, this.position, null, null, null, null, null, this.color);
    }
    update()
    {
        super.update();

        if (this.start == null)
        {
            this.start = Date.now();
        }

        const dt = (Date.now() - this.start)/1000;
        this.color.a = Math.sin(2*dt)/3 + 0.5;
        easyGl.setObjectColor(this.id, this.color); //this.color.x, this.color.y, this.color.z, Math.sin(dt)/3 + 0.5 );

        if (dt > 3.14)
        {
            const x = this.position.x;
            const y = this.position.y;
            const z = this.position.z;
            let positions = [];

            for (let dy = -3; dy < 4; dy++)
            {
                positions.push(new vec4( x, y+dy, z));
                for (let r = 1; r<4-Math.abs(dy); r++)
                {
                    for (let ay=0; ay<6.28; ay+=0.5/r)
                    {
                        positions.push(new vec4( x + Math.sin(ay)*r, y+dy, z + Math.cos(ay)*r ));
                    }
                }
            }
            
            /*
            for (let x = -2; x <= 2; x++)
            {
                for (let z=-2; z<=2; z++)
                {
                    for (let y=-2; y<=2; y++)
                    {
                        positions.push( new vec4(this.position.x + x, this.position.y + y, this.position.z + z));
                    }
                }
            }*/
            chunkManager.breakBlock(positions);
            this.easyGl.deleteObject(this.id);
            this.isDead = true;
        }
    }
}


const blockColors = [
    new vec4(1,.5,.5,1), //test
    new vec4(0,0.5,0,1), //green grass block
    new vec4(0.5, 0.4, 0.2, 1), //brown dirt
    new vec4(0.4,0.4,0.4,1), //stone
    new vec4(0.4,0.3,0.15,1), //wood trunk
    new vec4(0.4,0.98,0.15,0.5), //leaves
    new vec4(Math.random(),Math.random(),Math.random(),1),
    new vec4(Math.random(),Math.random(),Math.random(),1),
    new vec4(Math.random(),Math.random(),Math.random(),1),
    new vec4(Math.random(),Math.random(),Math.random(),1),
    new vec4(1,0,0,0.8) //tnt
];

const blockOpacities = [
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    0,
    1,
];


const blockMineTimes = [ 0.1,  0.15,  0.25,  0.3, .2, .2, .2, .2, .2, .2, .2, .2, .2];
const backgroundColor = new vec4(0.3,0,0.3,1);
const chunkSize = 20;
const selectedStepDist = 0.05;
const selectDistance = 6;


const menuTop = 0.3;
const menuBottom = -0.5;
const menuWidth = 0.5;


var mouseIsDown = false;
var blockMiningPos = null;
var blockMiningStartTime = null;
var blockMiningType = -1;
var itemBarSelectedNum = 0;


//Get canvas & set width & height
const canvasElement = document.getElementById("mainCanvas");
const bb = canvasElement.getBoundingClientRect();
canvasElement.width = bb.width;
canvasElement.height = bb.height;

//Create easyGl, Player, chunkmanager, and entities
const easyGl = new EasyGL(canvasElement, backgroundColor);
const player = new Player();
const chunkManager = new ChunkManager(easyGl, chunkSize);
const entities = [ new FloatingBlock(new vec4(6, 30, 6), 0, easyGl)];

easyGl.setSortingTimeDelayMs(100);
easyGl.resizeListener(); //resize canvas & gl
sliderInput(); //set FOV, zNear, and zFar to slider defaults
easyGl.createObject("selectOverlayCube", new vec4, new vec4, new vec4(1.1,1.1,1.1,1.1), null, null, null, new vec4(1,1,1,0.2), true); //overlay cube for mining...
easyGl.createObject("crosshair", new vec4(0,0,0), new vec4(0,0,0,0), new vec4(.02,.02,.02), [-1,0,0, 0,1,0, 1,0,0, 0,-1,0], [0,2,1,0,3,2], null, [1,0,0,1, 0,1,0,1, 0,0,1,1, 0,0,0,1], true);



canvasElement.addEventListener("mousedown", eventListener);
document.addEventListener("mouseup", eventListener);
canvasElement.addEventListener("mousemove", eventListener);
document.addEventListener("keydown", eventListener);
document.addEventListener("keyup", eventListener);

let renderInterval = setInterval(render, 50);
let slowUpdate = setInterval(chunkManagerUpdate, 1000);
 

function eventListener(event)
{
    player.eventListener(event);
}

function spawnEntityByName(name, position = new vec4(), rotation = new vec4())
{
    let e = null;
    switch(name)
    {
        case "TNT": e = new TNT(position, rotation, easyGl); break;
    }
    if (e != null)
    {
        entities.push(e);
    }
    return e;
}

//Render/update loop
function render()
{
    //Update entities
    for (let i=0; i<entities.length; i++)
    {
        entities[i].update();
        if (entities[i].isDead) //if it's dead, delete it
        {
            entities.splice(i,1);
            i--;
        }
    }

    player.update();//fpc.update();
    easyGl.setCameraPosition(player.fpc.getPosition());
    easyGl.setCameraRotation(player.fpc.getRotation());
    easyGl.enableRenderingReverseFaces(true);
    easyGl.clear();
    easyGl.renderAll();

    
    //Update mining cube
    if (blockMiningPos != null && blockMiningType != null)
    {
        //easyGl.setObjectHide("selectOverlayCube", false);
        const miningTimeElapsed = Date.now() - blockMiningStartTime;
        const percentMiningCompleted = miningTimeElapsed/(blockMineTimes[blockMiningType]*1000);
        let a = Math.max( 0.01, Math.min(percentMiningCompleted/5, 0.5)); //bound between 0.1 and 0.5, and scale so max time = 0.5
        easyGl.setObjectColor("selectOverlayCube", new vec4(1,1,1,a));
        easyGl.setObjectPosition("selectOverlayCube", blockMiningPos);
        easyGl.renderObject("selectOverlayCube");
        if (percentMiningCompleted >= 1)
        {
            //remove block
            //entities.push( new FloatingBlock(blockMiningPos, blockMiningType, easyGl) );
            //entities.push( new TNT(blockMiningPos, new vec4(), easyGl) );
            chunkManager.breakBlock(blockMiningPos);
            eventListener( {type: "custommousemove"} );
        }
    }

    easyGl.clearDepthBuffer();
    const scaleMatrix = new mat4().makeScale(canvasElement.height/canvasElement.width,1,1);
    const identityMatrix = new mat4().makeIdentity();
    easyGl.renderObjectCustomView("crosshair", scaleMatrix, identityMatrix);
    easyGl.clearDepthBuffer();
    player.render();
}

function chunkManagerUpdate()
{
    chunkManager.update(player.fpc.getPosition().mul(1,1,-1));
}

//Handle FOV, zNear, and zFar changes
function sliderInput()
{
    let zNear = Number(document.getElementById('zNearInput').value);
    let zFar = Number(document.getElementById('zFarInput').value);
    let FOV = Number(document.getElementById('fovInput').value);

    //zNear = Math.round(zNear);
    //zFar = Math.round(zFar);

    console.log("zNear: " + zNear + "\nzFar: " + zFar + "\nFOV: " + FOV);

    easyGl.setPerspective(FOV, null, zNear, zFar);
}






function test()
{
    const step = 10;
    const size = 200;
    const speed = 5;
    let s = "";
    let numIns = 0;
    for (let x=0; x<size; x+=step)
    {
        for (let z=0; z<size; z+=step)
        {
            const y = 200*Math.sin( Math.PI * 2 * x/size + z/size);
            s += speed + " " + Math.round(x) + " " + Math.round(y) + " " + Math.round(z) + " ";
            //s += "1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 ";
            numIns += 1;
        }
    }
    console.log(numIns);
    console.log(s);
}