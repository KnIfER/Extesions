/* global plodback, localizeHtmlPage, utilAsync, optionsLoad, optionsSave */
function onOptionChanged(e) {
    if (!e.originalEvent) return;
    onOptionChanged_internal();   
}

async function onOptionChanged_internal() {
    let options = {};
    var firstflag = 0;
    if($('#enabled').prop('checked')) firstflag|=0x1;
    if($('#slicable').prop('checked')) firstflag|=0x2;
    
    var hotkey = Number($('#hotkey').val());
    const KeyMapR = {0:0, 16:1, 17:2, 18:3};
    hotkey = KeyMapR[hotkey];
    firstflag|=(hotkey&0x3)<<2;
    
    if($('#doubleT').prop('checked')) firstflag|=0x10;
    if($('#sliceT').prop('checked')) firstflag|=0x20;
    if($('#menuT').prop('checked')) firstflag|=0x40;
    if($('#hotT').prop('checked')) firstflag|=0x80;
    if($('#editable').prop('checked')) firstflag|=0x100;
    options.firstflag = firstflag;
    await plodback().opt_optionsChanged(options, true);
}

function onMoreOptions() {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('options.html'));
    }
}

async function onReady() {
    localizeHtmlPage();
    let options = await optionsLoad();
    var firstflag = options.firstflag;
    console.log(firstflag);
    $('#enabled').prop('checked', firstflag&0x1);
    $('#enabled').change(onOptionChanged);
    $('#slicable').prop('checked', firstflag&0x2);
    $('#slicable').change(onOptionChanged);
    
    $('#hotkey').val(KeyMap[(firstflag>>2)&0x3]);
    $('#hotkey').change(onOptionChanged);
    
    $('#doubleT').prop('checked', firstflag&0x10);
    $('#doubleT').change(onOptionChanged);
    $('#sliceT').prop('checked', firstflag&0x20);
    $('#sliceT').change(onOptionChanged);
    $('#menuT').prop('checked', firstflag&0x40);
    $('#menuT').change(onOptionChanged);
    $('#hotT').prop('checked', firstflag&0x80);
    $('#hotT').change(onOptionChanged);
    $('#menuT').change(onOptionChanged);
    $('#editable').prop('checked', firstflag&0x100);
    $('#editable').change(onOptionChanged);
    $('#more').click(onMoreOptions);
}

$(document).ready(utilAsync(onReady));