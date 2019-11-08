var context = document.getElementById('canvas').getContext("2d");
var canvas = document.getElementById('canvas');
context = canvas.getContext("2d");
context.strokeStyle = "#ff0000";
context.lineJoin = "round";
context.lineWidth = 5;

var clickX = [];
var clickY = [];
var clickDrag = [];
var paint;
let drawer = false;

function addClick(x, y, dragging) {
    clickX.push(x);
    clickY.push(y);
    clickDrag.push(dragging);
}

//Rensar clientens canvas och ber servern rensa alla andra clienters canvaser
function clearClient(){
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  socket.emit("clear");
}

//Rensar din canvas om servern ber om det
function clearServer(){
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}

//Ritar ut vad som ritas på clienten
function drawNew() {
    var i = clickX.length - 1
    let first = false;

    if (!clickDrag[i]) {
        if (clickX.length == 0) {
            context.beginPath();
            context.moveTo(clickX[i], clickY[i]);
            context.stroke();
            first = true;
        } else {
            context.closePath();

            context.beginPath();
            context.moveTo(clickX[i], clickY[i]);
            context.stroke();
        }
    } else {
        context.lineTo(clickX[i], clickY[i]);
        context.stroke();
    }
    let data = [clickX[i],clickY[i],clickDrag[i], first];

    socket.emit("drawCords", data);

}

//Speglar vad som ritas på en client till alla andra clienter
//index 0 = Är x kordinaten
//index 1 = Är y kordinaten
//index 2 = är en boolean som förklarar om det är en fortsättningen på en linje
//index 3 = är en boolean som förklara om det är en början på en ny linje
function drawFromServer(data){

  if (!data[2]) {
      if (data[3]) {
          context.beginPath();
          context.moveTo(data[0], data[1]);
          context.stroke();
      } else {
          context.closePath();

          context.beginPath();
          context.moveTo(data[0], data[1]);
          context.stroke();
      }
  } else {
      context.lineTo(data[0], data[1]);
      context.stroke();
  }
}

function mouseDownEventHandler(e) {
    paint = true;
    var x = e.pageX - canvas.offsetLeft;
    var y = e.pageY - canvas.offsetTop;
    if (paint && drawer) {
        addClick(x, y, false);
        drawNew();
    }
}

function touchstartEventHandler(e) {
    paint = true;
    if (paint && drawer) {
        addClick(e.touches[0].pageX - canvas.offsetLeft, e.touches[0].pageY - canvas.offsetTop, false);
        drawNew();
    }
}

function mouseUpEventHandler(e) {
    context.closePath();
    paint = false;
}

function mouseMoveEventHandler(e) {
    var x = e.pageX - canvas.offsetLeft;
    var y = e.pageY - canvas.offsetTop;
    if (paint && drawer) {
        addClick(x, y, true);
        drawNew();
    }
}

function touchMoveEventHandler(e) {
    if (paint && drawer) {
        addClick(e.touches[0].pageX - canvas.offsetLeft, e.touches[0].pageY - canvas.offsetTop, true);
        drawNew();
    }
}

function setUpHandler(isMouseandNotTouch, detectEvent) {
    removeRaceHandlers();
    if (isMouseandNotTouch) {
        canvas.addEventListener('mouseup', mouseUpEventHandler);
        canvas.addEventListener('mousemove', mouseMoveEventHandler);
        canvas.addEventListener('mousedown', mouseDownEventHandler);
        mouseDownEventHandler(detectEvent);
    } else {
        canvas.addEventListener('touchstart', touchstartEventHandler);
        canvas.addEventListener('touchmove', touchMoveEventHandler);
        canvas.addEventListener('touchend', mouseUpEventHandler);
        touchstartEventHandler(detectEvent);
    }
}

function mouseWins(e) {
    setUpHandler(true, e);
}

function touchWins(e) {
    setUpHandler(false, e);
}

function removeRaceHandlers() {
    canvas.removeEventListener('mousedown', mouseWins);
    canvas.removeEventListener('touchstart', touchWins);
}

//skickar cordinater och lite annan information till servern
socket.on("serverCord", function(data){

  drawFromServer(data);

});

//ber servern rensa alla clienters canvas
socket.on("clear", function(){
  clearServer();
});

canvas.addEventListener('mousedown', mouseWins);
canvas.addEventListener('touchstart', touchWins);
