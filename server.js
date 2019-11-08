//roll 0 = gissare, roll 1 = han som ritar
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
var fs = require('fs');
app.set('port', 5001);
app.use(express.static('static')); // Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});
let players = Array();
let currentDrawer;
let items = Array();
let currentItem = "";
let playerOrder = 0;
let playerIndex = 0;
let playersPlaying;
let time;
let cooldown;
let waitingForItem = false;
let playersLeft;
let item1, item2, item3;
let rounds = 0;

server.listen(5001, function() {
  console.log('Starting server on port 5001');
  fs.readFile('static/words.txt', 'UTF8', function(err, contents){
    items = contents.split(';');
    });

  

});

// När någon joinar spelet så skapar man en ny entry i Arrayen players och håller all speldata om den spelaren där
//sen kommer alla spelar calls göras till denna function
io.on('connection', function(socket) {

  console.log("connection created on " + socket.request.connection.remoteAddress + " : " + socket.request.connection.remotePort);

  socket.on("new_player", function(data) {

    //skapar en array entry för spelaren
    players[playerOrder] = {
      uname: data,
      points: 0,
      position: ++playerOrder,
      role: 0,
      drawer: false,
      ID: socket.id,
      ready: false
    };

    //Skickar information om alla spelare till alla spelare innan spelet startar
    io.emit("playerinfo", getPlayers());
  });

  socket.on("gissning", function(data) {
<<<<<<< HEAD
    if (data[0] !== null || data[0] !== "" || data[1] !== currentDrawer.name) {
=======
    if (data[0] !== null || data[0] !== "" || data[1] !== currentDrawer.uname) {
>>>>>>> 2d99b92ee89ac2431b88661fb20f38342dd26261
      if (data[0] === currentItem && time !== 0) {

        for (const [index, element] of players.entries()) {

          if (element.ID === socket.id && element.ID !== null) {

            if(time >= 25){
              players[index].points += 500;
              currentDrawer.points += 500/2;
            }else if(time >= 20){
              players[index].points += 400;
              currentDrawer.points += 400/2;
            }else if(time >= 15){
              players[index].points += 300;
              currentDrawer.points += 300/2;
            }else if(time >= 10){
              players[index].points += 200;
              currentDrawer.points += 200/2;
            }else{
              players[index].points += 100;
              currentDrawer.points += 100/2;
            }

            io.emit("correct", data[1] + " : Gissade rätt");
            io.emit("playerinfo", getPlayers());
            currentItem = "";
            playersLeft--;
            break;
          }
        }
      } else {
        io.emit("wrong", data[1] + " : " + data[0]);
      }
    } else {
      socket.emit("error", "Du måste skriva något/du får inte gissa om du ritar");
    }

  });

  socket.on("new_width", function(data){
    socket.broadcast.emit("new_width", data);
  });

  socket.on("new_color", function(data){

    console.log(data);
    socket.broadcast.emit("new_color", data);

  });

  //En ready check funktion som tar emot när en spelare klickar att de är redo för att spela
  //sen kollar den igenom för att se om alla spelare är redo att börja och om de är det så startar spelet
  socket.on("ready", function(data) {
    let ok;

    for (let element of players) {

      if (element.ID === socket.id) {
        players[element.position - 1].ready = true;
        ok = true;
        for (readyCheck of players) {

          if (readyCheck.ready) {

          } else {
            ok = false;
          }
        }
        break;
      }
    }

    if (ok) {
      start();
    } else {

    }
  });

  //Skickar ut så att clienterna kan spegla vad som ritas på dem (skickas till alla förutom sändaren)
  socket.on("drawCords", function(data) {

    socket.broadcast.emit("serverCord", data);
  });

  socket.on("clear", function() {
    socket.broadcast.emit("clear");
  })

  socket.on("getPlayerInfo", function() {
    io.emit("playerinfo", getPlayers());
  });

  //Tar emot vad de har valt och kontrollerar så att det finns på servern som ett alternativ
  //sen startar den klockan
  socket.on("valtItem", function(data) {
    if(waitingForItem){
    for (let element of items) {

      if (data === element) {
        currentItem = data;
        waitingForItem = false;
        timer();
      }
    }
  }else{
    socket.emit("error", "Väntar inte på något");
  }
  });

  //om spelaren lämnar så kommer den att söka efter denns unika socket id i listan och ta bort den från listan
  /*socket.on("disconnect", function() {
    for (const [index, element] of players.entries()) {

      if (element.ID !== null && element.ID === socket.id) {
        players.splice(index, 1);
        io.emit("playerinfo", getPlayers());
        break;
      }
    }
  });*/
});

//Sköter rund klockan så att man kan se hur mycket tid det är kvar
function timer() {
  time = 30;
  cooldown = 5;
  setInterval(function() {
    if (time >= 0 && playersLeft > 0) {
      io.emit('timer', time);
      time--;
    }else if(playersLeft === 0){

      clearInterval(this);
      playerIndex++;
      setInterval(function(){
        io.emit('timer', cooldown);
        cooldown--;
        if(cooldown == 0){
          clearInterval(this);
          io.emit('clear');
          rounds++;
          start();
        }
      }, 1000);
      
    } else {
      clearInterval(this);
      playerIndex++;
      setInterval(function(){
        io.emit('timer', cooldown);
        cooldown--;
        if(cooldown == 0){
          clearInterval(this);
          io.emit('clear');
          rounds++;
          start();
        }
      }, 1000);
      
      
    }

  }, 1000);

}

//Det är här som spelet väljer vem som ska rita och vad den får välja på
//playersLeft = players.length - 1; -1 är för att man ska räkna bort den som ritar
function start() {

  if (currentDrawer === null) {
    players[0].drawer = true;
    currentDrawer = players[0];
    io.emit("playerinfo", getPlayers());
    playersLeft = players.length - 1;
    getRandomItem();
    let alternativ = [items[item1], items[item2], items[item3]];
    waitingForItem = true;
    io.to(players[0].ID).emit("alternativ", alternativ);

  } else {

    if(players.length*5 === rounds){

      let best;

      for(let element of players){

        if(best === null || element.points > best.points){
          best = element;
        }
      }

      io.emit("winner", best.uname);

    }else{

    for(element of players){
      element.drawer = false;
    }

    if(playerIndex >= players.length){
      playerIndex = 0;
    }

    players[playerIndex].drawer = true;
    currentDrawer = players[playerIndex];
    io.emit("playerinfo", getPlayers());
    playersLeft = players.length - 1;
    getRandomItem();

    let alternativ = [items[item1], items[item2], items[item3]];
    waitingForItem = true;
    io.to(players[playerIndex].ID).emit("alternativ", alternativ);

  }
}

}

function getRandomItem(){

  item1 = Math.floor(Math.random()*items.length);

  while(true){
    item2 = Math.floor(Math.random()*items.length);
    if(item2 !== item1){
      break;
    }
  }

  while(true){
    item3 = Math.floor(Math.random()*items.length);
    if(item3 !== item1 && item3 !== item2){
      break;
    }
  }
}

//retunerar en lista med alla players
function getPlayers() {
  return players;
}
