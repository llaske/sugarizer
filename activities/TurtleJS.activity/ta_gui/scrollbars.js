function map(value, A, B, a, b){
    return parseInt((value - A)*(b-a)/(B-A) + a);
}

var updateBackgroundPos = function() {
    var a = 0;
    var b = draw_stage.bg.height() - $(window).height();
    
    var A = 0;
    var B = vscrollArea.height() - vscroll.height();
    
    var y = map(vscroll.getPosition().y - 10, A, B, a, b);
    
    // calculating space of x position
    b = draw_stage.bg.width() - $(window).width();
    
    B = hscrollArea.width() - hscroll.width();
    
    var x = map(hscroll.getPosition().x - 10, A, B, a, b);
    
    //console.log("x: " + x + " y: " + y);
    
    draw_stage.draw_layer.x(-x);
    draw_stage.draw_layer.y(-y);
    draw_stage.layer.x(-x);
    draw_stage.layer.y(-y);
    draw_stage.draw_layer.batchDraw();
    //draw_stage.draw_tracker.group.show();
};

var vscrollArea = new Kinetic.Rect({
    x: draw_stage.stage.getWidth() - 50,
    y: 10,
    width: 40,
    height: draw_stage.stage.getHeight() - 40,
    fill: 'black',
    opacity: 0.3
});

var vscroll = new Kinetic.Rect({
    x: draw_stage.stage.getWidth() - 50,
    y: 10,
    width: 40,
    height: 70,
    fill: '#9f005b',
    draggable: true,
    dragBoundFunc: function(pos) {
        var newY = pos.y;
        if(newY < 10) {
            newY = 10;
        }
        else if(newY > draw_stage.stage.getHeight() - 100) {
            newY = draw_stage.stage.getHeight() - 100;
        }
        return {
            x: this.getAbsolutePosition().x,
            y: newY
        }
    },
    opacity: 0.9,
    stroke: 'black',
    strokeWidth: 1
});

var hscrollArea = new Kinetic.Rect({
    x: 10,
    y: draw_stage.stage.getHeight() - 50,
    width: draw_stage.stage.getWidth() - 60,
    height: 40,
    fill: 'black',
    opacity: 0.3
});

var hscroll = new Kinetic.Rect({
    x: 10,
    y: draw_stage.stage.getHeight() - 50,
    width: 130,
    height: 40,
    fill: '#9f005b',
    draggable: true,
    dragBoundFunc: function(pos) {
        var newX = pos.x;
        if(newX < 10) {
            newX = 10;
        }
        else if(newX > draw_stage.stage.getWidth() - 160) {
            newX = draw_stage.stage.getWidth() - 160;
        }
        return {
            x: newX,
            y: this.getAbsolutePosition().y
        }
    },
    opacity: 0.9,
    stroke: 'black',
    strokeWidth: 1
});

function center_scrollbars(){
    hscroll.x((hscrollArea.width() / 2) - (130/2) + 20);
    vscroll.y((vscrollArea.height() / 2) - (70/2) + 20);
    updateBackgroundPos();
}

draw_stage.scroll_layer.add(hscrollArea);
draw_stage.scroll_layer.add(vscrollArea);
draw_stage.scroll_layer.add(hscroll);
draw_stage.scroll_layer.add(vscroll);

hscroll.on('dragmove', updateBackgroundPos);
vscroll.on('dragmove', updateBackgroundPos);

center_scrollbars();
