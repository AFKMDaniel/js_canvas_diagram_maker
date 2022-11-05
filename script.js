const addButton = document.querySelector('#add');
const deleteButton = document.querySelector('#delete');
const saveButton = document.querySelector('#save');
const clearButton = document.querySelector('#clear');

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

let isDown = false;
let isLineDrawingStarted = false;
let isDeleteButtonClicked = false;
let activeElem;
let isElementActive = false;
let deltaX;
let deltaY;
let startX;
let startY;

const elems = [];
const lines = [];

class Line {
    constructor(startX,startY,endX,endY,startPos,startElemId,endPos,endElemId){
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.active = false;
        this.startPos = startPos;
        this.endPos = endPos;
        this.startElemId = startElemId;
        this.endElemId = endElemId;
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
    constructor(x, y, id, color){
        this.id = id;
        this.x = x;
        this.y = y;
        this.w = 100;
        this.h = 100;
        this.x1 = this.x + this.w;
        this.y1 = this.y + this.h;
        this.color = color;
        this.active = false;
    }

    draw(){
        this.x1 = this.x + this.w;
        this.y1 = this.y + this.h;
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

const createElem = (x, y, id,color) => {
    const elem = new Elem(x, y, id,color)
    elem.draw();
    elems.push(elem);
}

const createLine = (startX,startY,endX,endY,startPos,startElemId,endPos,endElemId) => {
    const line = new Line(startX,startY,endX,endY,startPos,startElemId,endPos,endElemId);
    line.draw();
    lines.push(line);
    return line;
}

const init = () => {
    if(localStorage.elems){
        JSON.parse(localStorage.getItem('elems')).forEach( obj => {
            createElem(obj.x,obj.y,obj.id,obj.color);
        })
        JSON.parse(localStorage.getItem('lines')).forEach( obj => {
            createLine(obj.startX,obj.startY,obj.endX,obj.endY,obj.startPos,obj.startElemId,obj.endPos,obj.endElemId);
        })
    }
}

addButton.addEventListener('click', () => {
    createElem(0,0,elems.length,generateColor());
})

deleteButton.addEventListener('click', (e) => {
    if(!isDeleteButtonClicked){
        document.body.style.cursor = 'pointer';
        isDeleteButtonClicked = true;
        e.target.classList.add('active');
    } else {
        document.body.style.cursor = 'default';
        isDeleteButtonClicked = false;
        e.target.classList.remove('active');
    }

})

saveButton.addEventListener('click', () => {
    localStorage.setItem('elems', JSON.stringify(elems));
    localStorage.setItem('lines', JSON.stringify(lines));
})

clearButton.addEventListener('click', () => {
    localStorage.clear();
})

canvas.addEventListener('mousedown', e => {
    elems?.forEach((elem,i) => {
        if(elem.checkIfMouseInsideCircles(e.clientX,e.clientY)[0] && !isLineDrawingStarted){
            isLineDrawingStarted = true;
            createLine(e.clientX,e.clientY,e.clientX,e.clientY,elem.checkIfMouseInsideCircles(e.clientX,e.clientY)[1],elem.id,null,null).active = true;
            return;
        }

        if(elem.checkIfMouseInside(e.clientX,e.clientY) && isDeleteButtonClicked){
            document.body.style.cursor = 'default';
            isDeleteButtonClicked = false;
            deleteButton.classList.remove('active');
            const index = elems.indexOf(elem);
            elems.splice(index,1);
            lines?.reduceRight( (acc, line, index, object) => {
                if (elem.id === line.startElemId) {
                  object.splice(index, 1);
                }
              }, []);
            ctx.clearRect(0,0,canvas.width,canvas.height);
            elems?.forEach(elem => {
                elem.draw();
            })
            lines?.forEach((line) => {
                line.draw();
            })
            return
        }

        if(elem.checkIfMouseInside(e.clientX,e.clientY) && !isElementActive){
            isElementActive = true;
            activeElem = i;
            deltaX = e.clientX - elem.x;
            deltaY = e.clientY - elem.y;
            elem.active = true;
            isDown = true;
            return;
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
            elem.draw();
        })
    }

    if(isDown){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        elems?.forEach((elem) => {
            if(elem.active){
                elem.x = e.clientX - deltaX;
                elem.y = e.clientY - deltaY;
                elem.draw();
            } else {
                elem.draw();
            }
            lines?.forEach(line => {
                if(elem.id === line.startElemId){
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
                } else if (elem.id === line.endElemId){
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
                    line.endElemId = elem.id;
                    line.endPos = elem.checkIfMouseInsideCircles(e.clientX,e.clientY)[1];
                }
            })
        }
    })
    isDown = false;
    isLineDrawingStarted = false;
    if(elems[activeElem]) elems[activeElem].active = false;
    lines.forEach(line => {
        line.active = false;
    })
    isElementActive = false;
})

init();
