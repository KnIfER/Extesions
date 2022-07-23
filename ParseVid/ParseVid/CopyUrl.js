
	var cc=10;
	function fuckBizhan(){
		console.log("fuckBizhan");
		// var x=document.querySelector("body > div.app-ctnr > div.wrapper > div > div.list-filter-bar.clearfix > div.pic-type-box > div:nth-child(2)");

		//if(x&&x.click) {
		//	x.click();
		//}
		
		var x=document.querySelector("#area-tag-list > div.tab__bar-wrap > div:nth-child(2) > div:nth-child(2)")

		if(x&&x.click) {
			x.click();
		} else if(cc>0){
			cc-=1;
			setTimeout(fuckBizhan, 200);
		}
	}
	var url=location.href;
	if(url.startsWith('https://live.bilibili.com/p/') || url.startsWith('https://live.bilibili.com/p/all'))
		setTimeout(fuckBizhan, 200);


    const style = document.createElement("style");

    style.innerHTML = ".Modal-wrapper{display:none;z-index=0;}";

    document.head.appendChild(style);

    document.querySelector("html").style=""

    var zhihuFucker = setInterval(fuckZhiHu, 200);


    function fuckZhiHu(){
        var x=document.getElementsByClassName('Button Modal-closeButton Button--plain')[0];
        if(x&&x.click) {
            x.click();
            clearInterval(zhihuFucker);
            document.head.removeChild(style);
        }
    }
	