// ==UserScript==
// @name         推特
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://twitter.com/*
// @icon         https://www.google.com/s2/favicons?domain=twitter.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var cc=0;
    function doit(){
        var e=document.evaluate("/html/body/div/div/div/div[2]/main/div/div/div/div/div/div[2]/div/div/div[2]/div[3]/div", document).iterateNext();
        if(e) {
            e.click();
        } else if(cc<6){
            cc++;
            setTimeout(doit, 255);
        }
    }
    function doitAll(){
        //var e=document.evaluate("/html/body/div/div/div/div[2]/main/div/div/div/div/div/div[2]/div/div/div[2]/div[3]/div", document).iterateNext();
        //if(e) {
        //    e.click();
        //}
		var e;
        try{
        e = document.getElementsByClassName("css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0");
        [].forEach.call(e, function(n){
            n.children[0].click();
        });
        } catch(n){};
        setTimeout(doitAll, 255);
    }
    doitAll();
})();