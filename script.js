const menu = document.querySelector('.menu');
const li = document.querySelector('li')

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const elems = [];

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
    }

    checkIfMouseInside(x,y){
        console.log(`${x}, ${y}`);
        if(this.x < x && this.x1 > x && this.y < y && this.y1 > y){
            return true
        }
        return false
    }

    setActive(){
        this.active = true;
    }

    setInactive(){
        this.active = false;
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

let isDown = false;
let activeElem;
let isElementActive = false;
let deltaX;
let deltaY;

canvas.addEventListener('mousedown', e => {
    elems?.forEach((elem,i) => {
        if(elem.checkIfMouseInside(e.clientX,e.clientY) && !isElementActive){
            isElementActive = true;
            activeElem = i;
            deltaX = e.clientX - elem.x;
            deltaY = e.clientY - elem.y;
            console.log('Попал');
            elem.setActive();
            isDown = true;
        }
    })
    if (!isDown){
        console.log('Не попал');
        return;
    }
})

canvas.addEventListener("mousemove", e => {
    if(isDown){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        elems?.forEach((elem) => {
            if(elem.active){
                elem.draw(e.clientX - deltaX,e.clientY - deltaY);
                console.log('Рисую')
            } else {
                elem.draw(elem.x,elem.y);
            }
        })
    } 
})

canvas.addEventListener('mouseup', () => {
    isDown = false;
    elems[activeElem]?.setInactive();
    isElementActive = false;
})