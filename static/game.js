var socket;
socket = io.connect();
//game variables

var cvs = document.getElementById("canvas");
var ctx = cvs.getContext("2d");

var started = false;
var button = document.getElementById("play")
button.onclick = function() {
    var name = document.getElementById('name').value;
    if (name != "") {
        socket.emit('new player');
        socket.emit("name", name);
        started = true;
        // console.log(started);
        document.getElementById("main-page").style.display = "none";
        cvs.style.display = "block";
        
        init();
        start();
    }
}

var degrees = 180 / Math.PI;

//fix blur
let dpi = window.devicePixelRatio;

function fix_dpi() {
    //get CSS height
    //the + prefix casts it to an integer
    //the slice method gets rid of "px"
    let style_height = +getComputedStyle(cvs).getPropertyValue("height").slice(0, -2);
    //get CSS width
    let style_width = +getComputedStyle(cvs).getPropertyValue("width").slice(0, -2);
    //scale the canvas
    cvs.setAttribute('height', style_height * dpi);
    cvs.setAttribute('width', style_width * dpi);
}

var gameMap = {
    
    width: 1800,
    height: 1000,
    x: 0,
    y: 0
    
}

var movement = {
    
    up: false,
    down: false,
    left: false,
    right: false
    
}

var mysocketid;

var mouseX = cvs.width / 2;
var mouseY = cvs.height / 2;


function drawPlayer(player) {
    //arm
    ctx.beginPath();
    ctx.strokeStyle = "#91AA9D";
    ctx.lineCap = "round";
    ctx.lineWidth = 5;

    ctx.moveTo(player.playerX + player.radius * Math.sin(player.mouseAngle + -1), player.playerY + player.radius * Math.cos(player.mouseAngle + -1));

    ctx.lineTo(player.playerX + player.radius * 1.8 * Math.sin(player.mouseAngle), player.playerY + player.radius * 1.8 * Math.cos(player.mouseAngle));

    ctx.stroke();
    
    //player outer circle
//      ctx.fillStyle = "#bf0000";
    ctx.fillStyle = "#91AA9D"
    ctx.beginPath();
    ctx.arc(player.playerX, player.playerY, player.radius + 3, 0, 2 * Math.PI)
    ctx.fill();
    
    //player                
//      ctx.fillStyle = 'red';
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(player.playerX, player.playerY, player.radius, 0, 2 * Math.PI)
    ctx.fill();
}

function drawOtherPlayer(player, me, playerXOffset, playerYOffset) {

    var otherPlayerX = playerXOffset - me.xOffsetForPlayer;
    var otherPlayerY = playerYOffset - me.yOffsetForPlayer;

    //arm
    ctx.beginPath();
    ctx.strokeStyle = "#bf0000";
    ctx.lineCap = "round";
    ctx.lineWidth = 5;

    ctx.moveTo(otherPlayerX + player.radius * Math.sin(player.mouseAngle + -1), otherPlayerY + player.radius * Math.cos(player.mouseAngle + -1));

    ctx.lineTo(otherPlayerX + player.radius * 1.8 * Math.sin(player.mouseAngle), otherPlayerY + player.radius * 1.8 * Math.cos(player.mouseAngle));

    ctx.stroke();
    
    //player outer circle
    
    ctx.beginPath();
    ctx.fillStyle = "#bf0000";
    // console.log(otherPlayerX) 
    // console.log(otherPlayerY)
    ctx.arc(otherPlayerX, otherPlayerY, player.radius + 3, 0, 2 * Math.PI)
    ctx.fill();
    //player
    
    ctx.beginPath();
    ctx.fillStyle = 'red';
    ctx.arc(otherPlayerX, otherPlayerY, player.radius, 0, 2 * Math.PI);
    ctx.fill();

}

function drawHealthBar(player) {
    var healthToDraw = player.health/100;
    // console.log(healthToDraw)
    ctx.fillStyle = "white"
    ctx.fillRect(player.playerX - player.radius, player.playerY + player.radius + 20, player.radius*2, 10)
ctx.fillStyle = "green"
        ctx.fillRect(player.playerX - player.radius, player.playerY + player.radius + 20, player.radius*2 * healthToDraw, 10)
    if (player.health < 1) {
        document.getElementById("death-screen").style.display = "block";
        // console.log("dead")
        socket.removeAllListeners();
        socket.disconnect();
        // console.log(player.health)
    } /*else {
        document.getElementById("death-screen").style.display = "block";
        // console.log("dead")
        socket.disconnect();
    }*/
    
}

function drawOtherPlayerHealthBar(player, me, playerXOffset, playerYOffset) {

    var otherPlayerX = playerXOffset - me.xOffsetForPlayer;
    var otherPlayerY = playerYOffset - me.yOffsetForPlayer;

    var healthToDraw = player.health/100;
    // console.log(healthToDraw)
    ctx.fillStyle = "white"
    ctx.fillRect(otherPlayerX - player.radius, otherPlayerY + player.radius + 20, player.radius*2, 10)

    ctx.fillStyle = "green"
    ctx.fillRect(otherPlayerX - player.radius, otherPlayerY + player.radius + 20, player.radius*2 * healthToDraw, 10)

}   

function displayPlayerName(player) {
     if (player.name != undefined) {
        var name = player.name;
        ctx.fillStyle = "white";
        ctx.font = "20px Helvetica"
        ctx.textAlign = "center";
        ctx.fillText(name, player.playerX, player.playerY - player.radius - 20)
        ctx.fill()
    }
    
}

function displayOtherPlayerName(player, me, playerXOffset, playerYOffset) {

    var otherPlayerX = playerXOffset - me.xOffsetForPlayer;
    var otherPlayerY = playerYOffset - me.yOffsetForPlayer;

     if (player.name != undefined) {
        var name = player.name;
        ctx.fillStyle = "white";
        ctx.font = "20px Helvetica"
        ctx.textAlign = "center";
        ctx.fillText(name, otherPlayerX, otherPlayerY - player.radius - 20)
        ctx.fill()
    }
    
}



function drawGrid(player) {

    var linegap = 50;
    var numberoflinesX = gameMap.width * 2 / linegap + 5;
    var numberoflinesY = gameMap.height * 4 / linegap + 5;
    var linesdrawnX = 0;
    var linesdrawnY = 0;
//    var linecolor = "#E1E9ED";
    var linecolor = "#0a0a0a";
    ctx.lineWidth = 2;

    while (linesdrawnX <= numberoflinesX) {

        ctx.beginPath();
        ctx.strokeStyle = linecolor;
        ctx.moveTo(0, player.mapY - gameMap.height + linesdrawnX*linegap);
        ctx.lineTo(gameMap.width, player.mapY - gameMap.height + linesdrawnX*linegap);
        ctx.stroke();
        linesdrawnX ++;

    }

    while (linesdrawnY <= numberoflinesY) {

        ctx.beginPath();
        ctx.strokeStyle = linecolor;
        ctx.moveTo(player.mapX - gameMap.width + linesdrawnY * linegap, 0);
        ctx.lineTo(player.mapX - gameMap.width + linesdrawnY * linegap, gameMap.height);
        ctx.stroke();
        linesdrawnY ++;

    }

}

function start() {


    socket.on("connect", function() {
        
        if (started == true) {
            mysocketid = socket.id;
        }
    })

    socket.on("yoursocketid", function(socketid) {
        mysocketid = socketid;
    });

    document.addEventListener('keydown', function(e) {
        
        switch (e.keyCode) {
                
            case 65: //A
                movement.left = true;
                break;
            case 87: //W
                movement.up = true;
                break;
            case 68: //D
                movement.right = true;
                break;
            case 83: //S
                movement.down = true;
                break;
                
        }
        
    });

    document.addEventListener('keyup', function(e) {
        
        switch (event.keyCode) {
                
            case 65: //A
                movement.left = false;
                break;
            case 87: //W
                movement.up = false;
                break;
            case 68: //D
                movement.right = false;
                break;
            case 83: //S
                movement.down = false;
                break;
        }
        
    });

    cvs.addEventListener("mousemove", function(e) {
                
        mouseX = e.x;
        mouseY = e.y;
        angle = Math.atan2(mouseX - cvs.width / 2, mouseY - cvs.height / 2);

        socket.emit("mouseAngle", angle);
                
    });

    cvs.addEventListener("mousedown", function(e) {
                
        mouseX = e.x;
        mouseY = e.y;
        angle = Math.atan2(mouseX - cvs.width / 2, mouseY - cvs.height / 2);

        var click = {
            "angle": angle              
        }

        socket.emit("shoot", click);
                
    });


    setInterval(function() {
        
        socket.emit('movement', movement);
        
        
    }, 1000/60);

    var gamePlayers = {};
    var gameProjectiles = [];

    socket.on('players', function(players) {

        gamePlayers = players;
        
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.fillRect(0, 0, cvs.width, cvs.height);
        
        mysocketid = socket.id;
        
        var xOffsetForMe = 0;
        var yOffsetForMe = 0;
        
        if (players[mysocketid] != undefined) {
            
            //outer map
            ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
            ctx.beginPath();
            ctx.fillRect(0, 0, 1500, 1500);
            ctx.fill();
            //inner map
            ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
            ctx.fillRect(players[socket.id].mapX, players[socket.id].mapY, gameMap.width, gameMap.height);
            drawGrid(players[socket.id]);
            xOffsetForMe = players[mysocketid].xOffsetForPlayer;
            yOffsetForMe = players[mysocketid].yOffsetForPlayer;
                
            
        }

        for (var id in players) {
            
            var player = players[id]; 
            var me = players[mysocketid]
 
            if (players[mysocketid] != undefined) {
                
                if (mysocketid == id) {

                    drawPlayer(me)
                    drawHealthBar(me)
                    displayPlayerName(me);
                    

                } else {
                    
                    var playerXOffset = player.playerX - player.mapX;
                    var playerYOffset = player.playerY - player.mapY;
                    if (me != undefined) {
                        drawOtherPlayer(player, me, playerXOffset, playerYOffset)
                        drawOtherPlayerHealthBar(player, me, playerXOffset, playerYOffset)
                        displayOtherPlayerName(player, me, playerXOffset, playerYOffset);

                    }
                }




            }
        }

        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 4, 0 * degrees, 360 * degrees)
        ctx.fill();

    });


    socket.on('projectiles', function(projectiles) {
            var me = gamePlayers[mysocketid]
            gameProjectiles = projectiles;

            projectiles.forEach(function (projectile, index) {
                var player = gamePlayers[projectile.playerId]
                if (projectile.playerId == mysocketid && gamePlayers != undefined && gamePlayers[mysocketid] != undefined) {

                    //if projectile is mine
                    projectile.xOffsetForPlayer = gamePlayers[projectile.playerId].xOffsetForPlayer
                    projectile.yOffsetForPlayer = gamePlayers[projectile.playerId].yOffsetForPlayer
                    //draw projectile
                    ctx.fillStyle = "white";
                    ctx.beginPath();
                    ctx.arc(projectile.x - projectile.xOffsetForPlayer, projectile.y - projectile.yOffsetForPlayer, projectile.radius, 0, 2 * Math.PI)
                    ctx.fill();


                    if (gamePlayers[mysocketid].mapX > projectile.x - projectile.xOffsetForPlayer - projectile.radius || gamePlayers[mysocketid].mapX + gamePlayers[mysocketid].mapWidth < projectile.x - projectile.xOffsetForPlayer + projectile.radius || gamePlayers[mysocketid].mapY > projectile.y - projectile.yOffsetForPlayer - projectile.radius || gamePlayers[mysocketid].mapY + gamePlayers[mysocketid].mapHeight < projectile.y - projectile.yOffsetForPlayer + projectile.radius) {
                        
                        socket.emit("deleteProjectile", projectile)

                    }

                } else {
                    //if projectile is not mine
                    if (gamePlayers != undefined && gamePlayers[mysocketid] != undefined && gamePlayers[projectile.playerId] != undefined) {
                        var playerXOffset = gamePlayers[projectile.playerId].playerX - gamePlayers[projectile.playerId].mapX;
                        var playerYOffset = gamePlayers[projectile.playerId].playerY - gamePlayers[projectile.playerId].mapY;
                        
                        var otherPlayerX = playerXOffset - me.xOffsetForPlayer;
                        var otherPlayerY = playerYOffset - me.yOffsetForPlayer;
                        ctx.fillStyle = "white";
                        ctx.beginPath();
                        ctx.arc(otherPlayerX - gamePlayers[projectile.playerId].playerX + projectile.x - player.xOffsetForPlayer, otherPlayerY - gamePlayers[projectile.playerId].playerY + projectile.y - player.yOffsetForPlayer, projectile.radius, 0, 2 * Math.PI)
                        ctx.fill();

                        var dist = Math.hypot(otherPlayerX - gamePlayers[projectile.playerId].playerX + projectile.x - player.xOffsetForPlayer - me.playerX, otherPlayerY - gamePlayers[projectile.playerId].playerY + projectile.y - player.yOffsetForPlayer - me.playerY)
                        // console.log(dist - player.radius - me.radius)
                        var hit;
                        if (Math.abs(dist - player.radius - me.radius) < 1) {
                            hit = true;
                            if (hit == true) {
                            
                                var hit = [projectile, me]
                                // socket.emit("deleteProjectile", projectile)
                                // console.log("hit")

                                socket.emit("decreaseHealth", hit)
                                hit = false;
                            }
                        }
                }
            }
        });

    });

}


function resizeCanvas() {
    
    cvs.width = window.innerWidth;
    cvs.height = window.innerHeight;
    socket.emit("cvsWidth", cvs.width);
    socket.emit("cvsHeight", cvs.height);
    
}

function init() {
//    fix_dpi();
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    
}


