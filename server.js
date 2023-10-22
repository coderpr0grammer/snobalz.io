//create app 
var express = require("express");
var http = require("http");
var path = require("path");
var socketIO = require("socket.io");

var app = express();
var server = http.Server(app);
var io = socketIO(server);


app.set("port", process.env.PORT || 5000);
app.use("/static", express.static(__dirname + "/static"));

app.get("/", function(request, response) {

    response.sendFile(path.join(__dirname, "/static/index.html"));
    
});

server.listen(5001, function() {
  console.log('Starting server on port 5001');
});

class Player {
    constructor(mapX, mapY, speed, radius, mapWidth, mapHeight, xOffsetForPlayer, yOffsetForPlayer, mouseAngle, health, snow, name) {
        this.mapX = mapX
        this.mapY = mapY
        this.playerX = null
        this.playerY = null
        this.speed = speed
        this.radius = radius
        this.mapWidth = mapWidth
        this.mapHeight = mapHeight
        this.xOffsetForPlayer = xOffsetForPlayer
        this.yOffsetForPlayer = yOffsetForPlayer
        this.mouseAngle = mouseAngle
        this.health = health
        this.snow = snow
        this.name = name
    }

    update(movement) {
        if (movement.left) {
            if (this.mapX < this.playerX - this.radius) {
                this.mapX += this.speed;
                this.xOffsetForPlayer -= this.speed;
            }
        }

        if (movement.up) {
            if (this.mapY < this.playerY - this.radius) {
                this.mapY += this.speed;
                this.yOffsetForPlayer -= this.speed;
            }
        }
        if (movement.right) {
            if (this.mapX > this.mapWidth * -1 + this.playerX + this.radius) {
                this.mapX -= this.speed;
                this.xOffsetForPlayer += this.speed;
            }
        }
        if (movement.down) {
            if (this.mapY > this.mapHeight * -1 + this.playerY + this.radius) {
                this.mapY -= this.speed;
                this.yOffsetForPlayer += this.speed;
            }
        }
    }
    
}



class Projectile {
    constructor(mapX, mapY, speed, radius, mapWidth, mapHeight, xOffsetForPlayer, yOffsetForPlayer, mouseAngle, x, y, playerId, projectileId) {
        this.mapX = mapX
        this.mapY = mapY
        this.speed = speed
        this.radius = radius
        this.mapWidth = mapWidth
        this.mapHeight = mapHeight
        this.xOffsetForPlayer = xOffsetForPlayer
        this.yOffsetForPlayer = yOffsetForPlayer
        this.playerX = null
        this.playerY = null
        this.angle = mouseAngle
        this.x = x
        this.y = y
        this.xVel = Math.sin(this.angle)
        this.yVel = Math.cos(this.angle)
        this.playerId = playerId
        this.id = projectileId
    }

    update(movement) {
        this.x += this.xVel * this.speed
        this.y += this.yVel * this.speed
    }
    
}


var players = {};
var projectiles = [];

io.on('connection', function(socket) {

    socket.on('new player', function() {
        players[socket.id] = new Player(0, 0, 5, 20, 1800, 1000, 0, 0, 0, 100, 100, "Snowman")
    });

    socket.on("cvsWidth", function(cvsWidth){
        if(players[socket.id] != undefined) {
            players[socket.id].playerX = cvsWidth / 2;
        }
    });

    socket.on("cvsHeight", function(cvsHeight) {
        if(players[socket.id] != undefined) {
            players[socket.id].playerY = cvsHeight / 2;
        }
    });

    socket.on("mouseAngle", function(angle) {
        var player = players[socket.id] || {};
        player.mouseAngle = angle;
    });

    socket.on("shoot", function(click) {
        var player = players[socket.id] || {};
        //player.playerX and player.playerY are the problems, because this will be the center of the screen always, not the center of the player
        projectiles.push(new Projectile(player.mapX, player.mapY, 6, 7, player.mapWidth, player.mapHeight, player.xOffsetForPlayer, player.yOffsetForPlayer, click.angle, player.playerX + player.xOffsetForPlayer, player.playerY + player.yOffsetForPlayer, socket.id, Math.random().toString(36).substr(2, 9)))
    })

    socket.on("deleteProjectile", function(projectile) {
        projectiles = projectiles.filter((item) => item.id != projectile.id)
    })

    socket.on("decreaseHealth", function(hit) {
        projectiles = projectiles.filter((item) => item.id != hit[0].id)

        players[socket.id].health -= 5;

    })

    socket.on('movement', function(movement) {
        // let player = players[socket.id] || {};
        if (players[socket.id] != undefined) {
            players[socket.id].update(movement)
        }

        projectiles.forEach(function(projectile) {
            projectile.update()
        })

    });

    socket.on('disconnect', function() {

        io.sockets.emit('player disconnected', "player " + socket.id + " disconnected");
        delete players[socket.id];

    });

    socket.on("name", function(name) {
        players[socket.id].name = name;
        console.log(name)
    })
});

setInterval(function() {
    io.sockets.emit('players', players);
    io.sockets.emit('projectiles', projectiles);
}, 1000 / 60);