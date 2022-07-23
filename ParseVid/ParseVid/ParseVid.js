
function parseVid(){
	var xmlRequest = new XMLHttpRequest();
	
	var url;
	
	if(window._largat) {
		url=window._largat;
		if(url.href) {
			url=url.href;
		}
	}
	var ret=[];
	var customLoad = false;
	if(url && url == window._largat_dir) {
		var name = "美妞 - "+document.title+".mp4";
		customLoad = 1;
		if(url.startsWith("http://filea1.zhaojiuwanwu.top/sxts2")) {
			xmlRequest.onload = function (e) {	
				var text = xmlRequest.responseText;	
				//console.log(xmlRequest);
				try{
					var json=JSON.parse(text); 
					ret = [name, json.url];	
					console.error(json.url);
					if(window._tvideo) {
						window._tvideo.src = json.url;
						window._tvideo.play();
					}
				} catch (e){
					console.error(xmlRequest.responseText);
					console.error("fail@"+xmlRequest.responseURL);
					console.error(e);
				}
			}
			//url = window.player_data.url;
			url = document.getElementsByClassName("am-panel-bd")[0].children[0].innerHTML;
			var st = url.indexOf('"url":"');
			var ed = url.indexOf('"', st+10);
			url = url.substring(st+7, ed);
			url = url.replace(/\\/g, "")
			console.log(url);
		} else {
			return [name, url];
		}
	} else {
		if(!url||url.indexOf("/u/")<0) {
			url = location.href;
		}
	}
	//xmlRequest.setRequestHeader("User-Agent", "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Mobile Safari/537.36 Edg/88.0.705.50");
	if(!customLoad) {
		xmlRequest.onload = function (e) {
			var text = xmlRequest.responseText;
			try{
				//console.log(text);
				var st = text.indexOf("window.pageData=");
				var ed = text.indexOf("}</script>", st);
				if(st&&ed) {
					text = text.substring(st+16, ed+1);
					var pageData=JSON.parse(text);
					// console.log(pageData);
					var user = pageData.user;
					var video = pageData.video;
					var url = video.srcNoMark;
					user = user.name + " " + "[" + user.id + "]" + " - " + video.caption + ".mp4";
					ret = [user, url];
					console.log(ret);
				}
			} catch (e){
				console.log(xmlRequest.responseText);
				console.log("fail@"+xmlRequest.responseURL);
				
			}
		}
	}

	xmlRequest.open("GET", url, false);
	
	xmlRequest.send();
	
	return ret;
}

parseVid()

	