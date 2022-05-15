// ==UserScript==
// @name         丰满胴体的诱惑_M1MM
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.m1mm.com/*
// @icon         https://www.google.com/s2/favicons?domain=m1mm.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var item=document.getElementById("content");
    item.parentElement.removeChild(item);
    document.body.prepend(item);

    item.style="text-align: center";


    item=item.getElementsByTagName("IMG")[0];
    //item.style="height:100%;width:auto";
    item.style="height:"+window.innerHeight+"px";



    // Your code here...
})();