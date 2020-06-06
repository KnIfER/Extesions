function selectedText() {
    const selection = window.getSelection();
    return (selection.toString() || '').trim();
}

function isValidElement() {
    if (window.pdFlag&0x100) return true;
    
    // if (document.activeElement.getAttribute('contenteditable')) 
    //     return false;

    const invalidTags = ['INPUT', 'TEXTAREA'];
    const nodeName = document.activeElement.nodeName.toUpperCase();
    if (invalidTags.includes(nodeName)) {
        return false;
    } else {
        return true;
    }
}