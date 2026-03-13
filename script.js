const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let components = [];
let wires = [];

let undoStack = [];
let redoStack = [];

let selectedType = null;
let wiring = false;
let startPoint = null;

canvas.addEventListener("click", handleCanvasClick);

function addComponent(type){
selectedType = type;
wiring = false;
}

function startWire(){
wiring = true;
selectedType = null;
}

function saveState(){

const state = {
components: JSON.parse(JSON.stringify(components)),
wires: JSON.parse(JSON.stringify(wires))
};

undoStack.push(state);
redoStack = [];

}

function snapToGrid(value){
return Math.round(value/20)*20;
}

function handleCanvasClick(e){

const rect = canvas.getBoundingClientRect();

const x = snapToGrid(e.clientX - rect.left);
const y = snapToGrid(e.clientY - rect.top);

if(selectedType){

saveState();

components.push({
type:selectedType,
x:x,
y:y,
on:false
});

draw();
}

else if(wiring){

if(!startPoint){
startPoint = {x,y};
}

else{

saveState();

wires.push({
x1:startPoint.x,
y1:startPoint.y,
midX:x,
midY:startPoint.y,
x2:x,
y2:y
});

startPoint = null;

draw();
}

}
}

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height);

drawGrid();

components.forEach(c=>{

if(c.type=="battery"){

ctx.fillStyle="blue";
ctx.fillRect(c.x-20,c.y-20,40,40);

ctx.fillStyle="white";
ctx.font="14px Arial";
ctx.fillText("B",c.x-5,c.y+5);
}

else if(c.type=="resistor"){

ctx.fillStyle="brown";
ctx.fillRect(c.x-25,c.y-10,50,20);

ctx.fillStyle="white";
ctx.font="14px Arial";
ctx.fillText("R",c.x-5,c.y+5);
}

else if(c.type=="led"){

ctx.beginPath();
ctx.arc(c.x,c.y,15,0,Math.PI*2);

if(c.on){
ctx.shadowColor="lime";
ctx.shadowBlur=20;
ctx.fillStyle="lime";
}else{
ctx.shadowBlur=0;
ctx.fillStyle="red";
}

ctx.fill();
ctx.shadowBlur=0;

ctx.fillStyle="black";
ctx.font="12px Arial";
ctx.fillText("LED",c.x-12,c.y+30);
}

else if(c.type=="bulb"){

ctx.beginPath();
ctx.arc(c.x,c.y,18,0,Math.PI*2);

ctx.fillStyle = c.on ? "yellow" : "#ddd";
ctx.fill();

ctx.strokeStyle="black";
ctx.stroke();

ctx.fillStyle="black";
ctx.fillText("Bulb",c.x-15,c.y+30);
}

else if(c.type=="capacitor"){

ctx.strokeStyle="black";
ctx.lineWidth=3;

ctx.beginPath();
ctx.moveTo(c.x-10,c.y-20);
ctx.lineTo(c.x-10,c.y+20);
ctx.stroke();

ctx.beginPath();
ctx.moveTo(c.x+10,c.y-20);
ctx.lineTo(c.x+10,c.y+20);
ctx.stroke();

ctx.fillStyle="black";
ctx.fillText("C",c.x-5,c.y+35);
}

else if(c.type=="switch"){

ctx.strokeStyle="black";

ctx.beginPath();
ctx.moveTo(c.x-20,c.y);
ctx.lineTo(c.x,c.y-10);
ctx.stroke();

ctx.beginPath();
ctx.moveTo(c.x,c.y-10);
ctx.lineTo(c.x+20,c.y);
ctx.stroke();

ctx.fillStyle="black";
ctx.fillText("SW",c.x-10,c.y+25);
}

else if(c.type=="arduino"){

ctx.fillStyle="#0a7f6f";
ctx.fillRect(c.x-40,c.y-25,80,50);

ctx.fillStyle="white";
ctx.font="12px Arial";
ctx.fillText("Arduino",c.x-28,c.y+5);
}

});

wires.forEach(w=>{

ctx.beginPath();

ctx.moveTo(w.x1,w.y1);
ctx.lineTo(w.midX,w.midY);
ctx.lineTo(w.x2,w.y2);

ctx.strokeStyle="black";
ctx.lineWidth=3;
ctx.stroke();

drawDot(w.midX,w.midY);

});

}

function drawDot(x,y){

ctx.beginPath();
ctx.arc(x,y,4,0,Math.PI*2);
ctx.fillStyle="black";
ctx.fill();
}

function drawGrid(){

ctx.strokeStyle="#eee";

for(let x=0;x<canvas.width;x+=20){
ctx.beginPath();
ctx.moveTo(x,0);
ctx.lineTo(x,canvas.height);
ctx.stroke();
}

for(let y=0;y<canvas.height;y+=20){
ctx.beginPath();
ctx.moveTo(0,y);
ctx.lineTo(canvas.width,y);
ctx.stroke();
}

}

function simulate(){

let batteryExists = components.some(c=>c.type=="battery");
let led = components.find(c=>c.type=="led");
let bulb = components.find(c=>c.type=="bulb");

if(batteryExists && wires.length>0){

if(led) led.on = true;
if(bulb) bulb.on = true;

}
else{

if(led) led.on = false;
if(bulb) bulb.on = false;

}

draw();
}

function undo(){

if(undoStack.length === 0) return;

const currentState = {
components: JSON.parse(JSON.stringify(components)),
wires: JSON.parse(JSON.stringify(wires))
};

redoStack.push(currentState);

const prevState = undoStack.pop();

components = prevState.components;
wires = prevState.wires;

draw();
}

function redo(){

if(redoStack.length === 0) return;

const currentState = {
components: JSON.parse(JSON.stringify(components)),
wires: JSON.parse(JSON.stringify(wires))
};

undoStack.push(currentState);

const nextState = redoStack.pop();

components = nextState.components;
wires = nextState.wires;

draw();
}

draw();