const menu = document.querySelector('.menu');
const li = document.querySelector('li')

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

let isDown = false;
let isLineDrawingStarted = false;
let activeElem;
let isElementActive = false;
let deltaX;
let deltaY;
let startX;
let startY;

const elems = [];
const lines = [];

class Line {
    constructor(startX,startY,pos,elem){
        this.startX = startX;
        this.startY = startY;
        this.endX = startX;
        this.endY = startY;
        this.active = false;
        this.startPos = pos;
        this.endPos = null;
        this.startElem = elem;
        this.endElem = null;
    }

    draw(){
        ctx.beginPath();
        ctx.moveTo(this.startX,this.startY);
        if(Math.abs(this.endX - this.startX) > Math.abs(this.endY - this.startY)){
            ctx.lineTo((this.endX - this.startX) / 2 + this.startX,this.startY);
            ctx.lineTo((this.endX - this.startX) / 2 + this.startX, this.endY);
        } else {
            ctx.lineTo(this.startX,(this.endY- this.startY) / 2 + this.startY);
            ctx.lineTo(this.endX,(this.endY - this.startY) / 2 + this.startY);
        }
        ctx.lineTo(this.endX,this.endY);
        ctx.stroke();
    }
}

class Elem {
    constructor(color){
        this.x = 0;
        this.y = 0;
        this.w = 100;
        this.h = 100;
        this.x1 = this.x + this.w;
        this.y1 = this.y + this.h;
        this.color = color;
        this.active = false;
    }

    draw(x,y){
        this.x = x;
        this.y = y;
        this.x1 = x + this.w;
        this.y1 = y + this.h;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x,this.y,this.w,this.h);
        ctx.beginPath();
        ctx.arc(this.x,this.y + this.w / 2,5,0,Math.PI*2,false);
        ctx.arc(this.x + this.h / 2,this.y,5,0,Math.PI*2,false);
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x1,this.y + this.w / 2,5,0,Math.PI*2,false);
        ctx.arc(this.x + this.h / 2,this.y1,5,0,Math.PI*2,false);
        ctx.fill();
    }

    checkIfMouseInside(x,y){
        if(this.x < x && this.x1 > x && this.y < y && this.y1 > y){
            return true
        }
        return false
    }

    checkIfMouseInsideCircles(x,y){
        if(this.x - 5 < x && this.x + 5 > x && this.y + this.w / 2 - 5 < y && this.y + this.w / 2 + 5 > y){
            return [true,1]
        }
        if(this.x + this.h / 2 - 5 < x && this.x + this.h / 2 + 5 > x && this.y - 5 < y && this.y + 5 > y){
            return [true,2]
        }
        if(this.x1 - 5 < x && this.x1 + 5 > x && this.y + this.w / 2 - 5 < y && this.y + this.w / 2 + 5 > y){
            return [true,3]
        }
        if(this.x + this.h / 2 - 5 < x && this.x + this.h / 2 + 5 > x && this.y1 - 5 < y && this.y1 + 5 > y){
            return [true,4]
        }
        return [false,0]
    }
}

const generateColor = () => {
    let hexSet = "0123456789ABCDEF";
    let finalHexString = "#";
    for (let i = 0; i < 6; i++) {
      finalHexString += hexSet[Math.ceil(Math.random() * 15)];
    }
    return finalHexString;
  }

li.addEventListener('click', () => {
    const elem = new Elem(generateColor());
    elem.draw(0,0);
    elems.push(elem);
})

canvas.addEventListener('mousedown', e => {
    elems?.forEach((elem,i) => {
        if(elem.checkIfMouseInsideCircles(e.clientX,e.clientY)[0] && !isLineDrawingStarted){
            isLineDrawingStarted = true;
            const line = new Line(e.clientX,e.clientY,elem.checkIfMouseInsideCircles(e.clientX,e.clientY)[1],elem);
            line.active = true;
            lines.push(line);
            return;
        }

        if(elem.checkIfMouseInside(e.clientX,e.clientY) && !isElementActive){
            isElementActive = true;
            activeElem = i;
            deltaX = e.clientX - elem.x;
            deltaY = e.clientY - elem.y;
            elem.active = true;
            isDown = true;
        }
    })
})

canvas.addEventListener("mousemove", e => {
    if(isLineDrawingStarted){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        lines?.forEach(line => {
            if(line.active){
                line.endX = e.clientX;
                line.endY = e.clientY;
            }
            line.draw()
        })
        elems?.forEach( elem => {
            elem.draw(elem.x,elem.y);
        })
    }

    if(isDown){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        elems?.forEach((elem) => {
            if(elem.active){
                elem.draw(e.clientX - deltaX,e.clientY - deltaY);
                console.log('Рисую')
            } else {
                elem.draw(elem.x,elem.y);
            }
            lines?.forEach(line => {
                if(elem === line.startElem){
                    switch (line.startPos) {
                        case 1: 
                                line.startX = elem.x;
                                line.startY = elem.y + elem.w / 2;
                                break;
                        case 2: 
                                line.startX = elem.x + elem.h / 2;
                                line.startY = elem.y;
                                break;
                        case 3: 
                                line.startX = elem.x1;
                                line.startY = elem.y + elem.h / 2;
                                break;
                        case 4: 
                                line.startX = elem.x + elem.h / 2;
                                line.startY = elem.y1;
                                break;
                    }
                } else if (elem === line.endElem){
                    switch (line.endPos) {
                        case 1: 
                                line.endX = elem.x;
                                line.endY = elem.y + elem.w / 2;
                                break;
                        case 2: 
                                line.endX = elem.x + elem.h / 2;
                                line.endY = elem.y;
                                break;
                        case 3: 
                                line.endX = elem.x1;
                                line.endY = elem.y + elem.h / 2;
                                break;
                        case 4: 
                                line.endX = elem.x + elem.h / 2;
                                line.endY = elem.y1;
                                break;
                    }
                }
                line.draw();
            })
        })
    } 
})

canvas.addEventListener('mouseup', (e) => {
    elems?.forEach(elem => {
        if(elem.checkIfMouseInsideCircles(e.clientX,e.clientY)[0] && isLineDrawingStarted){
            lines.forEach(line => {
                if(line.active){
                    line.endElem = elem;
                    line.endPos = elem.checkIfMouseInsideCircles(e.clientX,e.clientY)[1];
                }
            })
        }
    })
    isDown = false;
    isLineDrawingStarted = false;
    elems[activeElem].active = false;
    lines.forEach(line => {
        line.active = false;
    })
    isElementActive = false;
})

