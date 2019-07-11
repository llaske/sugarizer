// Code to retain carset position in multi user collab
        
// Function to save and restore cursor position for single user mode

// Function to save positon

function saveRangePosition(textarea)
{
var range=window.getSelection().getRangeAt(0);
var sC=range.startContainer,eC=range.endContainer;

A=[];while(sC!==textarea){A.push(getNodeIndex(sC));sC=sC.parentNode}
B=[];while(eC!==textarea){B.push(getNodeIndex(eC));eC=eC.parentNode}

window.rp={"sC":A,"sO":range.startOffset,"eC":B,"eO":range.endOffset};
}

// Function to restore position

function restoreRangePosition(textarea)
{
textarea.focus();
var sel=window.getSelection(),range=sel.getRangeAt(0);
var x,C,sC=textarea,eC=textarea;
if (typeof rp === 'undefined') return;
C=rp.sC;x=C.length;while(x--)sC=sC.childNodes[C[x]];
C=rp.eC;x=C.length;while(x--)eC=eC.childNodes[C[x]];

range.setStart(sC,rp.sO);
range.setEnd(eC,rp.eO);
sel.removeAllRanges();
sel.addRange(range)
}
function getNodeIndex(n){var i=0;while(n=n.previousSibling)i++;return i}

// Functions to save and retain cursor position in multi user collab

function saveCaretPosition(context){
    var selection = window.getSelection();
    var range = selection.getRangeAt(0);
    range.setStart(  context, 0 );
    var len = range.toString().length;

    return function restore(){
        var pos = getTextNodeAtPosition(context, len);
        selection.removeAllRanges();
        var range = new Range();
        range.setStart(pos.node ,pos.position);
        selection.addRange(range);

    }
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

