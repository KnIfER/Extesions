// ==UserScript==
// @name         MeToo蜜桃社
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://www.mitaoshe2019.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var item=document.getElementById("lovexin12");
    document.body.removeChild(item);

    item=document.getElementById("lovexin14");
    document.body.removeChild(item);

    item=document.getElementsByClassName("login_panel")[0];
    document.body.removeChild(item);


    item=document.getElementsByClassName("body_img")[0];
    document.body.removeChild(item);
    document.body.prepend(item);


    item=item.getElementsByTagName("IMG")[0];
    //item.style="height:100%;width:auto";
    item.style="height:"+window.innerHeight+"px";
    // Your code here...
})();