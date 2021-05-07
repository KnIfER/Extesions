
var imgs = document.getElementsByTagName("IMG");

for(var i=0;i<imgs.length;i++) {
	imgs[i].src = imgs[i].src;
	//console.log(imgs[i]);
}
var ids,a;

ids=["Post-RichText"];
if(!a) {
	for(var i=0;i<1;i++) {
		a = document.getElementsByClassName(ids[i])[0];
		if(a) break;
	}
}

if(!a) {
	ids=["ARTICLE"];
	for(var i=0;i<1;i++) {
		a = document.getElementsByTagName(ids[i])[0];
		if(a) break;
	}
}


console.log(a);

if(!a) {
	a=document.body;
}

a.innerHTML;

