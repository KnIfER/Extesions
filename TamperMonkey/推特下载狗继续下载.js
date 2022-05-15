// ==UserScript==
// @name         推特下载狗继续下载
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
    document.addEventListener("contextmenu", function(e){
            for(var i=0;i<e.path.length;i++) {
                if(e.path[i].tagName==='ARTICLE'){
                    e.path[i].style.backgroundColor = '#fad4d7';
                    var x;
                    while(x=document.getElementById('current_target')) {x.id=''}
                    e.path[i].id="current_target";
                    e.preventDefault();
                    break;
                }
            }
        })

        var cc=0;
        function closeLogin() {
            var e=document.querySelector("#layers > div:nth-child(2) > div > div > div > div > div > div.css-1dbjc4n.r-1awozwy.r-1kihuf0.r-18u37iz.r-1pi2tsx.r-1777fci.r-1pjcn9w.r-xr3zp9.r-1xcajam.r-ipm5af.r-g6jmlv > div.css-1dbjc4n.r-14lw9ot.r-1867qdf.r-1jgb5lz.r-pm9dpa.r-1ye8kvj.r-1rnoaur.r-13qz1uu > div > div.css-1dbjc4n.r-1h3ijdo.r-136ojw6 > div > div > div > div.css-1dbjc4n.r-1habvwh.r-1pz39u2.r-1777fci.r-15ysp7h.r-s8bhmr > div > div");
            if(e) e.click();
            else if(++cc<5) setTimeout(closeLogin, 350);
        }
        setTimeout(closeLogin, 350);
    // Your code here...
})();