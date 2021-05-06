//elements
var background = document.getElementById("GameBackground");
var player = document.getElementById("Player");
var ground = document.getElementById("Ground");
var centerText = document.getElementById("CenterText");
var scoreText = document.getElementById("ScoreText");

//physics
var acceleration = -0.004;
var velocity = 0;
var jumpVelocity = 0.3;
var maxPosy = 80;
var posy=maxPosy;
var jumpInterval;
var jumping = false;
var buttonUp = true;
var runInterval;

//animation for running
var frame = 0;
var numFrames = 2;

//gameplay
var enemiesUpdateInterval;
var scoreUpdateInterval;
var enemies = [];
var enemiesPos = [];
var mode = 0;
var playerXpos = parseInt(window.getComputedStyle(player).getPropertyValue("left"));
var score = 0;
var enemyMoveAmount = 3;



function Update() {
    if (enemies.length == 0) {
        if (Math.random() < 0.01 + score/100000)
        {
            GenerateNewEnemy();
        }
    }
    for(var i=0; i<enemies.length;i++)
    {
        var x = parseInt(window.getComputedStyle(enemies[i]).getPropertyValue("left"));
        if (x < 0)
        {
            var e = enemies[i];
            enemies.splice(i,1);
            e.remove();
        } else {
            enemies[i].style.left = x-enemyMoveAmount + "px";
        }

        if (x + 20 > playerXpos && x - 20 < playerXpos && posy>76)
        {
            centerText.innerHTML = "Game Over!<br/>Final Score = " + score +"<br/> Press any key to try again!";
            clearInterval(enemiesUpdateInterval);
            clearInterval(jumpInterval);
            clearInterval(runInterval);
            clearInterval(scoreUpdateInterval);
            mode = 0;
        }
    }
    if (Math.random() < 0.003 + score/10000)
    {
        GenerateNewEnemy();
    }
}

function GenerateNewEnemy() {
    var e = document.createElement("div");
    e.setAttribute("class", "Enemy");
    background.append(e);
    enemies.push(e);
}

function PlayerRun() {
    if (jumping)
    {
        player.src = 'f0.png';
        frame = 1;
    } else { 
        player.src = 'f'+frame+'.png';
        frame += 1;
        if (frame > numFrames)
        {
            frame = 0;
        }
    }
}
function PlayerJump() {
    posy -= velocity;
    player.style.top = posy+"%";
    velocity += acceleration;
    if (posy > maxPosy)
    {
        clearInterval(jumpInterval);
        jumping = false;
    }
}

function UpdateScore() {
    score += 1;
    scoreText.innerHTML = "Score = " + score;
    enemyMoveAmount += 0.05;
}


document.addEventListener("keydown", event => {
    if(mode == 1 && jumping == false && buttonUp==true)
    {
        clearInterval(jumpInterval);
        posy = maxPosy;
        velocity = jumpVelocity;
        jumpInterval = setInterval(PlayerJump,1);
        jumping = true;
        buttonUp = false;
    }

    if (mode == 1 && jumping == true && buttonUp == true)
    {
        velocity -= 0.3;
        buttonUp = false;
    }

    if(mode == 0)
    {
        var x;
        for(var i=0; i<enemies.length; i++)
        {
            x = enemies.pop(i);
            x.remove();
        }
        for(var i=0; i<enemies.length; i++)
        {
            x = enemies.pop(i);
            x.remove();
        }
        jumping = false;
        posy = maxPosy;
        PlayerJump();
        score = -1;
        UpdateScore();
        mode = 1;
        enemyMoveAmount = 3;
        centerText.innerHTML = "";
        runInterval = setInterval(PlayerRun,200);
        enemiesUpdateInterval = setInterval(Update,10);
        scoreUpdateInterval = setInterval(UpdateScore,1000);
    }
})

document.addEventListener("mousedown", event =>{
    if(mode == 1 && jumping == false && buttonUp==true)
    {
        clearInterval(jumpInterval);
        posy = maxPosy;
        velocity = jumpVelocity;
        jumpInterval = setInterval(PlayerJump,1);
        jumping = true;
        buttonUp = false;
    }

    if (mode == 1 && jumping == true && buttonUp == true)
    {
        velocity -= 0.3;
        buttonUp = false;
    }

    if(mode == 0)
    {
        var x;
        for(var i=0; i<enemies.length; i++)
        {
            x = enemies.pop(i);
            x.remove();
        }
        for(var i=0; i<enemies.length; i++)
        {
            x = enemies.pop(i);
            x.remove();
        }
        jumping = false;
        posy = maxPosy;
        PlayerJump();
        score = -1;
        UpdateScore();
        mode = 1;
        enemyMoveAmount = 3;
        centerText.innerHTML = "";
        runInterval = setInterval(PlayerRun,200);
        enemiesUpdateInterval = setInterval(Update,10);
        scoreUpdateInterval = setInterval(UpdateScore,1000);
    }
})


document.addEventListener("keyup", event => {
    buttonUp = true;
})

document.addEventListener("mouseup", event => {
    buttonUp = true;
})