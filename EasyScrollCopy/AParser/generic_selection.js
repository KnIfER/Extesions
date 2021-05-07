

var ret = "nosel";
var sel = document.getSelection();

if(!sel.isCollapsed) {
	var range = sel.getRangeAt(0);
    var div = document.createElement("div");
    div.appendChild(range.cloneContents());
	var imgs = div.getElementsByTagName("IMG");
	for(var i=0;i<imgs.length;i++) {
		imgs[i].src = imgs[i].src;
	}
    ret = div.innerHTML;
}

ret;
