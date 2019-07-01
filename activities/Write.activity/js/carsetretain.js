// Code to retain carset position in multi user collab
        

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

C=rp.sC;x=C.length;while(x--)sC=sC.childNodes[C[x]];
C=rp.eC;x=C.length;while(x--)eC=eC.childNodes[C[x]];

range.setStart(sC,rp.sO);
range.setEnd(eC,rp.eO);
sel.removeAllRanges();
sel.addRange(range)
}
function getNodeIndex(n){var i=0;while(n=n.previousSibling)i++;return i}