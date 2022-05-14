// ==UserScript==
// @name         Log与F1屏蔽器
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        *://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        unsafeWindow
// ==/UserScript==

(function() {
    'use strict';

unsafeWindow.log = console.log;
unsafeWindow.debug = console.log;
unsafeWindow.queryByAttr=function(aAttribute, aValue, abody) {
		return SearchElement(abody||document.body);
		function ElementVerifier(ele) {
			var Element = ele;
			if (Element.nodeName!=='#text' && ele.getAttribute(aAttribute)===aValue)
				//return eval('Element.' + aAttribute + '==\\'' + aValue + '\\'?true:false;');
				return ele;
			return 0;
		}
		function SearchElement(ele) {
			if (!ele) return 0;
			return ElementVerifier(ele) 
				|| SearchElement(ele.firstChild) 
				|| SearchElement(ele.nextSibling);
		}
	}
	
window.addEventListener('keydown', (e)=>{
    //log(e.code);
	if(e.code==='F1'){
		e.preventDefault();
	}
});

})();