function XOMan(innerc, outerc, editor,num){
	this.svgwidth = null;
	this.svgheight = null;
	this.xomanpic = null;
	this.stroke = outerc;
	this.fill = innerc;
	this.colnumber = num;

	this.xoSVG = function(innercol,outercol){
        this.svgwidth = 240 * editor.scale;
        this.svgheight = 260 * editor.scale;
        var svgstring = this.header() + 
            '<g>' +
            '<g id="XO">' + 
            '<path id="Line1" d="M'+(165.5 * editor.scale).toFixed(1)+','+(97 * editor.scale).toFixed(1)+' C'+(120 * editor.scale).toFixed(1)+','+(140.5 * editor.scale).toFixed(1)+' '+(120 * editor.scale).toFixed(1)+','+(140.5 * editor.scale).toFixed(1)+' '+(74.5 * editor.scale).toFixed(1)+','+(188 * editor.scale).toFixed(1)+'" stroke="'+outercol+'" stroke-width="'+(37 * editor.scale).toFixed(1)+'" stroke-linecap="round" fill="none" visibility="visible" />' +
            '<path id="Line2" d="M'+(165.5 * editor.scale).toFixed(1)+','+(188 * editor.scale).toFixed(1)+' C'+(120 * editor.scale).toFixed(1)+','+(140.5 * editor.scale).toFixed(1)+' '+(120 * editor.scale).toFixed(1)+','+(140.5 * editor.scale).toFixed(1)+' '+(74.5 * editor.scale).toFixed(1)+','+(97 * editor.scale).toFixed(1)+'" stroke="'+outercol+'" stroke-width="'+(37 * editor.scale).toFixed(1)+'" stroke-linecap="round" fill="none" visibility="visible" />' +
            '<path id="Fill1" d="M'+(165.5 * editor.scale).toFixed(1)+','+(97 * editor.scale).toFixed(1)+' C'+(120 * editor.scale).toFixed(1)+','+(140.5 * editor.scale).toFixed(1)+' '+(120 * editor.scale).toFixed(1)+','+(140.5 * editor.scale).toFixed(1)+' '+(74.5 * editor.scale).toFixed(1)+','+(188 * editor.scale).toFixed(1)+'" stroke="'+innercol+'" stroke-width="'+(17 * editor.scale).toFixed(1)+'" stroke-linecap="round" fill="none" visibility="visible" />' +
            '<path id="Fill2" d="M'+(165.5 * editor.scale).toFixed(1)+','+(188 * editor.scale).toFixed(1)+' C'+(120 * editor.scale).toFixed(1)+','+(140.5 * editor.scale).toFixed(1)+' '+(120 * editor.scale).toFixed(1)+','+(140.5 * editor.scale).toFixed(1)+' '+(74.5 * editor.scale).toFixed(1)+','+(97 * editor.scale).toFixed(1)+'" stroke="'+innercol+'" stroke-width="'+(17 * editor.scale).toFixed(1)+'" stroke-linecap="round" fill="none" visibility="visible" />' +
            '<circle id="Circle" cx="'+(120 * editor.scale).toFixed(1)+'" cy="'+(61.5 * editor.scale).toFixed(1)+'" r="'+(27.5 * editor.scale).toFixed(1)+'" fill="'+innercol+'" stroke="'+outercol+'" stroke-width="'+(11 * editor.scale).toFixed(1)+'" visibility="visible" />'+'</g></g>\n'+this.footer();
        return svgstring;
	}

	this.header = function(){
        return '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="'+this.svgwidth.toFixed(0)+'px" height="'+this.svgheight.toFixed(0)+'px" xml:space="preserve">\n';
	}

    this.footer = function(){
        return '</svg>';
    }

    this.updateSVG = function(icol, ocol, number){
    	this.stroke = ocol;
		this.fill = icol;
		this.colnumber = number;

    	var svg = this.xoSVG(icol,ocol);
    	var svg = window.btoa(svg);
		var bitmap = new createjs.Bitmap('data:image/svg+xml;base64,'+svg);
		bitmap.x = editor.stage.canvas.width/2-this.svgwidth/2;
    	bitmap.y = editor.stage.canvas.height/2-this.svgheight/2;
    	editor.stage.removeChild(this.xomanpic);
    	this.xomanpic = bitmap;
    	editor.stage.addChild(this.xomanpic);
    	editor.stage.update();
    }

    this.init = function(){
    	this.stroke = outerc;
		this.fill = innerc;
		this.colnumber = num;
		
    	var svg = this.xoSVG(innerc,outerc);
    	var svg = window.btoa(svg);
    	var bitmap = new createjs.Bitmap('data:image/svg+xml;base64,'+svg);
    	bitmap.x = editor.stage.canvas.width/2-this.svgwidth/2;
    	bitmap.y = editor.stage.canvas.height/2-this.svgheight/2;
    	this.xomanpic = bitmap;
    	editor.stage.addChild(this.xomanpic);
    	editor.stage.update();
    }
}