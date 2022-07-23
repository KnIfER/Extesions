
	
	//console.log("content!!!");

	window.addEventListener("sniffurl", function(e){
		console.log("sniffurl!!!", e, e.detail);
		chrome.runtime.sendMessage("get-sniffed-url", function(data) { 
			console.log("sniffurl=", data);
			if(e.detail && e.detail.cb) {
				//e.detail.cb(data);
				var backEvt = new CustomEvent(e.detail.cb, {detail : data});
				window.dispatchEvent(backEvt, function(data) { });;
			}
		});
	});
	