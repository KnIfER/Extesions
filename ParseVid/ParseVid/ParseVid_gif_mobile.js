
function parseVid(){
	var idstr=/o\/(.+)\?/.exec(location.href);
	if(idstr&&idstr[1]){
		idstr = idstr[1];
	} else {
		idstr="";
	}
	var caption = document.getElementsByClassName("video-info-title")[0].innerText;
	var idx = caption.indexOf("#");
	//if(idx>0) caption = caption.substring(0, idx);
	var user = document.getElementsByClassName("profile-user-name-title")[0].innerText;
	
	var title = user + "("+idstr+")" + " - " + caption + ".mp4";
	var url = document.getElementsByClassName("player-video")[0].src;
	console.log('下载', title, url);
	return [title, url];
}

parseVid()

	