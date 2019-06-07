// Script to making iframe editable
var showingSourceCode = false;
var isInEditMode = true;

function enableEditMode() {
    richTextField.document.designMode = 'on' ;
}
// function to get source html of iframe
function toggleSource(){
    if(showingSourceCode){
        richTextField.document.getElementsByTagName('body')[0].innerHTML = richTextField.document.getElementsByTagName('body')[0].textContent ;
        showingSourceCode = false;
    } else {
            richTextField.document.getElementsByTagName('body')[0].textContent = richTextField.document.getElementsByTagName('body')[0].innerHTML ;
            showingSourceCode = true;
        }
}
// function to get back to edit mode
function toggleEdit(){
    if(isInEditMode){
        richTextField.document.designMode = 'off' ;
        isInEditMode = false;
    } else {
            richTextField.document.designMode = 'on' ;
            isInEditMode = true;
        }
}        

        