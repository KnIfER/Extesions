

	
	window.addEventListener("contextmenu", function(e){
		var t=e.srcElement;
		while(t.className&&t.className.indexOf("work-card-thumbnail")==0) {
			//t = t.childNodes[0];
			var t = t.childNodes[0].innerHTML;
			var st = t.indexOf("CacheKey");
			if(st>0){
				var ed=t.indexOf(".", st);
				t = t.substring(st+9, ed);
				t = location.href.replace("profile", "u")+"/"+t;
				window._largat = t;
				console.log('下载', t);
			}
		}
	})
	