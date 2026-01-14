const selectionEl = document.querySelector('#selection-area');
let startX = null;
let startY = null;
let endX = null;
let endY = null;
let selecting = false;

document.addEventListener('mousedown', (e) => {
    if(selecting)return;
    selecting = true;
    startX = e.clientX;
    startY = e.clientY;
    selectionEl.style.left = `${startX}px`;
    selectionEl.style.top = `${startY}px`;
    selectionEl.style.width = '0px';
    selectionEl.style.height = '0px';
})
document.addEventListener('mousemove', (e) => {
    if(!selecting)return;
    if(startX === null || startY === null)return;
    tempX = e.clientX;
    tempY = e.clientY;
    //if moving left / upwards, change temporary start to temp X 
    if(tempX < startX)selectionEl.style.left = `${tempX}px`;
    if(tempY < startY)selectionEl.style.top = `${tempY}px`;
    let rectWidth = Math.abs(startX - tempX);
    let rectHeight = Math.abs(startY - tempY);
    selectionEl.style.width = `${rectWidth}px`;
    selectionEl.style.height = `${rectHeight}px`;
});
document.addEventListener('mouseup', (e) => {
    if(!selecting)return;
    selecting = false;

    // update view for user + reverse startX and endX if end is lower than start -> same for Y
    endX = e.clientX;
    endY = e.clientY;
    if(endX < startX){
        let temp = startX;
        startX = endX;
        endX = temp;
    }
    if(endY < startY){
        let temp = startY;
        startY = endY;
        endY = temp;
    }

    let width = Math.abs(startX - endX);
    let height = Math.abs(startY - endY);
    selectionEl.style.width = `${width}px`;
    selectionEl.style.height = `${height}px`;

    const rect = {x:startX, y:startY, endX:endX, endY:endY, width:width, height:height};
    miyotanAPI.selection(rect)
});

