// Code to retain carset position in multi user collab
        
// Function to save and restore cursor position for single user mode

// Function to save positon

function saveRangePosition(textarea)
{
var myrange=window.getSelection().getRangeAt(0);
var sC=myrange.startContainer,eC=myrange.endContainer;

A=[];while(sC!==textarea){A.push(getNodeIndex(sC));sC=sC.parentNode}
B=[];while(eC!==textarea){B.push(getNodeIndex(eC));eC=eC.parentNode}

window.rp={"sC":A,"sO":myrange.startOffset,"eC":B,"eO":myrange.endOffset};
}

// Function to restore position

function restoreRangePosition(textarea)
{
textarea.focus();
var sel=window.getSelection(),myrange=sel.getRangeAt(0);
var x,C,sC=textarea,eC=textarea;
if (typeof rp === 'undefined') return;
C=rp.sC;x=C.length;while(x--)sC=sC.childNodes[C[x]];
C=rp.eC;x=C.length;while(x--)eC=eC.childNodes[C[x]];

myrange.setStart(sC,rp.sO);
myrange.setEnd(eC,rp.eO);
sel.removeAllRanges();
sel.addRange(myrange)
}
function getNodeIndex(n){var i=0;while(n=n.previousSibling)i++;return i}

// Functions to save and retain cursor position in multi user collab


function getLen(element){
    var caretOffset = 0;     
    var range = window.getSelection().getRangeAt(0);
        var preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretOffset = preCaretRange.toString().length;
        return caretOffset;
}
function restore(context){
        var pos = getTextNodeAtPosition(context, len);
        selection.removeAllRanges();
        var range = new Range();
        range.setStart(pos.node ,pos.position);
        selection.addRange(range);
}

function getTextNodeAtPosition(root, index){
    var lastNode = null;

    var treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT,function next(node) {
        if(index > node.textContent.length){
            index -= node.textContent.length;
            lastNode = node;
            return NodeFilter.FILTER_REJECT
        }
        return NodeFilter.FILTER_ACCEPT;
    });
    var c = treeWalker.nextNode();
    return {
        node: c? c: root,
        position: c? index:  0
    };
}

function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};
  
