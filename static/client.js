let word = "";
let gissaRuta = document.getElementById("gissaRuta");
let gameKnapp = document.getElementById("game");
let uname;
var socket = io();
let color = document.getElementById("colorPicker");

//När man går med i spelet
function join(){

  uname = document.getElementById("uname");

  if(uname.value === null || uname.value === ""){
    console.log("error: Fyll i ett användarnamn");
  }else{

    socket.emit("new_player", uname.value);

    gissaRuta.type = "text";
    gameKnapp.setAttribute( "onClick", "game();" );
    gameKnapp.value = "Gissa";
    uname.type = "hidden";
  }
}

function game(){

  let gissning = gissaRuta.value;

  if(gissning === null || gissning === ""){

  }else{

    let data = [gissning, uname.value];

    socket.emit("gissning", data);
    gissaRuta.value = "";
  }
}

//Om man gissade rätt
socket.on("correct", function(data) {
  let container = document.getElementById("messages");
  let message_container = document.createElement("li");
  let message = document.createTextNode(data);
  message_container.setAttribute("class", "guessedRight");
  message_container.appendChild(message);
  container.appendChild(message_container);
});

//Om man gissade fel
socket.on("wrong", function(data) {
  let container = document.getElementById("messages");
  let message_container = document.createElement("li");
  let message = document.createTextNode(data);

  message_container.appendChild(message);
  container.appendChild(message_container);
});

socket.on("timer", function(data) {
  let timer = document.getElementById("timer");
  if(data > 0){
    timer.setAttribute("class", "show");
    timer.innerHTML = data;
  }else{
    timer.setAttribute("class", "hide");
  }
});

socket.on("alternativ", function(data){

  showAlternativ(data);

});

//Fyller upp en modal ruta med tre alternativ som den fått från servern
//Sen visar den det modala fönstret
function showAlternativ(input){
  //let data = ["Häst", "Katt", "Hund"];
  let data = input;
  let container = document.getElementById("chooseWindow");
  container.innerHTML = "";
  let div;
  let p;
  let text;
  document.getElementById("chooseWindowContainer").style.display = "block";

  for(let element of data){
    div = document.createElement("div");
    p = document.createElement("p");
    text = document.createTextNode(element);
    p.setAttribute("class", "chooseText");
    div.setAttribute("class", "option");

    //click på select diven som gör så att man kan välja ett item
    //Och döljer det modala fönstret
    div.addEventListener("click", function(){
      socket.emit("valtItem", element);
      document.getElementById("chooseWindowContainer").style.display = "none";
    });

    p.appendChild(text);
    div.appendChild(p);
    container.appendChild(div);
  }

}

socket.on("error", function(data){
  console.log(data);
});

function setdrawer(boolean){
  drawer = boolean;
}

function readyUp(){
  document.getElementById("ready").value = "Väntar";
  socket.emit("ready");

}

//Uppdaterar spelar tabellen med information om spelare
socket.on("playerinfo", function(data) {
  let playerContainer = document.getElementById("players");
  let headDiv;
  let playerinfo;
  playerContainer.innerHTML = "";
  drawer = false;

  data.forEach(function(element){
    headDiv = document.createElement("div");
    if(element.drawer){
      playerinfo = document.createTextNode(element.uname+" : "+element.points+" : Drawer");
      console.log(element.uname+" : "+uname);
      if(element.uname === uname.value){
        drawer = element.drawer;
      }else{

      }

    }else
      playerinfo = document.createTextNode(element.uname+" : "+element.points);

    headDiv.setAttribute("class", "player");
    headDiv.appendChild(playerinfo);
    playerContainer.appendChild(headDiv);
  });
});

color.addEventListener("input", function(){
  socket.emit("new_color", color.value);
  context.strokeStyle = color.value;
});

socket.on("new_color", function(data){

  context.strokeStyle = data;

});

function changeWidth(){

  context.lineWidth = document.getElementById("lineWidth").value;
  socket.emit("new_width", document.getElementById("lineWidth").value);

}

socket.on("new_width", function(data){
  context.lineWidth = data;
});
