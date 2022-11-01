
		var bg = chrome.extension.getBackgroundPage();
            
        if(bg.fakePP) {
            if(new Date().getTime()-bg.fakePP<400) {
                //bg.log('打酱油');
                setTimeout(function(){window.close()},200);
                throw 1;
            }
            bg.fakePP=0;
        }
        var debug = console.log
        var doc=document, w=window;
        function ge(e){return doc.getElementById(e)};
        function craft(t, p, c) {
            t = doc.createElement(t||'DIV');
            if(c)t.className=c;
            if(p)p.appendChild(t);
            return t;
        }
        var data=bg.d(), tabs = bg.initTabs(), tab1
            ,hideImg = craft("style", document.head);
        craft("style", document.head).innerText=`.folder-icon > .item-icon{-webkit-mask-image:url("chrome-extension://${chrome.runtime.id}/images/folder_open.svg")}`;
        hideImg.innerText='.img{display:none!important}'
        
        var tabo = ge('tabos'), tab0 = ge('tabNew'), tabH=tab0.parentNode;

        var bkmkAdapter;
        bg.log('popup...', data.test)
          
        function newBookmarkTab(tD, path) {
            if(!bkmkAdapter) {
                bkmkAdapter = {
                    bindFunction:function(lst,row,pos){
                        if(!row.icon) {
                            var w=row._=row;//craft(0, row, 'item-wrap');
                            w.classList.add('item-wrap');
                            row.dot = craft('P', w, 'dot');
                            row.icon = craft(0, craft(0, w, 'item-icon'), 'img');
                            row.lv = craft('DIV', w, 'item-tlv');
                            row.t = craft('P', row.lv, 'item-title');
                            row.st = craft('P', row.lv, 'item-subtitle');
                        }
                        var bk = lst.arr[pos];
                        if(!bk) {
                            bk={title:''}
                        }
                        //debug(bk)
                        row.bk=bk;
                        row.t.innerText = bk.title||' ';
                        var href = bk.url;
                        var icon = row.icon;
                        
                        row.lv.href = href;
                        row.lv.draggable=true; // 模拟拖拽
                        row.lv.ondragstart = bkmkAdapter.dragStart;
                        row.lv.onmousedown = bkmkAdapter.mousedown;
                        row.lv.ondblclick  = bkmkAdapter.dblclick;
                        
                        
                        if(bk.dateGroupModified!=undefined ^ row.folder) {
                            row.folder = !row.folder;
                            if(row.folder) {
                                row._.classList.add('folder-icon')
                                icon.style.backgroundImage='';
                            } else {
                                row._.classList.remove('folder-icon')
                            }
                        }
                        if(href) {
                            row.st.innerText = href;
                            if(!row.folder) {
                                icon.style.backgroundImage = "url(\"chrome://favicon/"+href+"\")";
                            }
                        } else {
                            icon.style.backgroundImage = ''
                        }
                    }
                    , findRow : function(e) {
                        var t=e.srcElement, row=0;
                        while(t=t.parentNode) {
                            if(!row && t.classList.contains('item'))
                                row=t
                            else if(t.classList.contains('ListView'))
                                break;
                        }
                        if(t && row) return [t,row]
                        return 0
                    }
                    , dblclick : function(e) {
                        var t=bkmkAdapter.findRow(e);
                        if(t) {
                            t=t[1].lv.href;
                            if(t) {
                                window.open(t);
                            }
                        }
                    }
                    , mousedown : function(e) {
                        if(e.button==1) {
                            var t=bkmkAdapter.findRow(e);
                            if(t) {
                                bkmkAdapter.hot(e.r=t[1])
                                e.lv=t=t[0]
                                e.sy=t.scrollTop;
                                t.classList.add('mousedown');
                                bkmkAdapter.downEvt=e;
                            }
                            if(0) return false; // 禁止自动滚动
                        }
                    }
                    , hot : function(e) {
                        var hs=bkmkAdapter.hots;
                        if(e){
                            if(!hs) hs=bkmkAdapter.hots=[];
                            e.classList.add('hot'); 
                            hs.push(e);
                        }
                        else if(hs){
                            for(var i=0,h;h=hs[i++];)
                                h.classList.remove('hot')
                            hs.length=0;
                        }
                    }
                    , fixScroll : function(e) {
                        e.srcElement.scrollTop=bkmkAdapter.fixedY;
                    }
                    , mouseup : function(e) {
                        //debug('👆', e.button==1, e.srcElement);
                        bkmkAdapter.hot()
                        if(e.button==1) {
                            var te=bkmkAdapter.downEvt;
                            if(!te) return;
                            var t=te.lv, row=te.r;
                            if(row && t) {
                                t.classList.remove('mousedown');
                                if(e.srcElement==te.srcElement
                                    && t.scrollTop==te.sy
                                    && te.clientX==te.clientX && te.clientY==te.clientY
                                    ) {
                                    // 触发鼠标中键点击，不要再滚了！
                                    window.open(row.lv.href||'about:blank')
                                    bkmkAdapter.fixedY=t.scrollTop;
                                    t.onscroll=bkmkAdapter.fixScroll;
                                    setTimeout(t.onclick=function(){
                                        t.onscroll=t.onclick=0;
                                        t.classList.remove('mousedown');
                                    },300);
                                    var time=new Date().getTime();
                                    //if(!bg.fakePP || time-bg.fakePP>1000) {
                                    if(1) {
                                        bg.fakePP=time;
                                        chrome.browserAction.openPopup(function(e){
                                            if(e)e.close();
                                            //if(e)setTimeout(function(){e.close()},100);
                                            debug(e)
                                            te=chrome.runtime.lastError
                                        });
                                    }
                                }
                                bkmkAdapter.downEvt=0;
                            }
                        }
                    }
                    , dragStart : function(e) {
                        e.dataTransfer.setData('url', e.srcElement.href);
                    }
                    , bindListView : function(listView, arr, tD) {
                        var adapter={
                            size:arr.length
                            ,bifun:this.bindFunction
                        }
                        listView.arr = arr;
                        bg.initListView(listView, adapter, 30, 'px', window);
                        var p=0;
                        if(tD)
                            p=tD.pos;
                        listView.reset(adapter, p);
                        if(hideImg) {
                            requestAnimationFrame(function(){hideImg.remove();hideImg=0}, 200);
                        }
                    }
                    , initListView : function(tD) {
                        var tab = craft(0, 0, 'UiTab');
                        var head = craft(0, tab, 'UiHead');
                        var listViewP = craft(0, tab, 'UITabo');
                        var listView = craft(0, listViewP, 'ListView');
                        // var foot = craft(0, tab, 'UIFoot');
                        var loca = tab.etLoca = craft('INPUT', head);
                        tab.etSch = craft('INPUT', head);
                        loca.onkeydown = function(e){
                            debug(e);
                            if(e.key=='Enter') {
                                var t=loca.value+'';
                                var idx=t.indexOf('=');
                                if(idx) {
                                    idx=parseInt(t.slice(idx+1))
                                } else {
                                    idx=parseInt(t)
                                }
                                if(typeof idx==='number') {
                                    var p=idx+'';
                                    chrome.bookmarks.get(p, function(e){
                                        if(e&&e.length) {
                                            tD.path=p;
                                            bg.pullBkmk(p, function(e){
                                                debug('pullBkmk...', e);
                                                bkmkAdapter.bindListView(ret.lv, e);
                                            });
                                        }
                                    })
                                }
                            }
                        }
                        tab.lv=listView;
                        tab.onRemove=function(){
                            var fvp=listView.fvp();
                            if(fvp) {
                                var pos = fvp.pos;
                                tD.pos=pos/listView.arr.length;
                                bg.log('saving...', pos, tD.pos, fvp.innerText.slice(0,10));
                            }
                        }
                        return tab;
                    }
                }
            }
            doc.addEventListener("mouseup",bkmkAdapter.mouseup,1);
            var ret = bkmkAdapter.initListView(tD);
            bg.pullBkmk(path, function(e){
                debug('pullBkmk...', e);
                bkmkAdapter.bindListView(ret.lv, e, tD);
            });
            ret.etLoca.value = 'chrome://bookmarks/?id='+path;
            return ret;
        }
        
        function newImportantTab(tD, path) {
            var ret = craft(0, 0, 'UiTab');
            ret.load = function() {
                var navdata;
                var req=new XMLHttpRequest();
                req.open('GET','appdata.json');
                req.responseType='application/x-www-form-urlencoded';
                req.onreadystatechange=function(e) {
                    if(req.readyState == 4 && req.status==200) {
                        //alert(req.responseText);
                        //alert(JSON.parse('{"navdata":"qwqe"}').navdata);
                        var appdata = JSON.parse(req.responseText);
                        if(appdata.navdata) {
                            //alert(appdata.navdata+(appdata.navdata[0].constructor === Array ));
                            navdata = appdata.navdata; 
                            ret.layout(navdata);
                        }
                    }
                };
                req.send(null);
                
                // if(!data.favTabArr||1) {
                //     data.favTabArr = [{url:'',title:'添加当前标签页',favIconUrl:`chrome-extension://${chrome.runtime.id}/images/icon_add.ico`}];
                //     data.favTabs = {};
                //     chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
                //         var tab = tabs[0];
                //         if(tab) {
                //             var d={url:tab.url, title:tab.title, favIconUrl:tab.favIconUrl};
                //             data.favTabs[tab.id]=d;
                //             data.favTabArr.push(d)
                //             debug(tab, tab.id);
                //         }
                        
                //         ret.layout(data.favTabArr)
                //     })
                // } else {
                //     ret.layout(data.favTabArr)
                // }
                    
            }
            if(w.initGridTab) {
                initGridTab(w, doc, ret);
            } else {
                loadJs('gridtab.js', function(){
                    // if(bg.initSortable) {
                    //     bg.initSortable(doc, w);
                    //     initGridTab(w, doc, ret);
                    //     ret.onAttach();
                    // } else {
                        bg.loadSortable(function() {
                            bg.initSortable(doc, w);
                            initGridTab(w, doc, ret);
                            ret.onAttach();
                        });
                    // }
                });
            }
            return ret;
        }
        
        function loadJs(url,callback){
			var e=document.createElement('script');
			e.type="text/javascript";
			e.onload=callback;
			e.src=url;
			document.body.appendChild(e);
		}
        
        // 初始化多标签页面
        for(var i=0;i<tabs.length;i++) {
            var d=tabs[i];
            var t=d.type,title=d.timu;
            if(!title) {
                if(t==0) title='书签';
                if(t==1) title='重要页面';
            }
            var t=craft('LI',0,"tab");
            t.onclick = onClickTab;
            t.d=d;
            craft('SPAN', t).innerText=title;
            tabH.insertBefore(t, tab0);
        }
        
        tab0.onclick = function() {
            
        };
        
        function onClickTab(e) {
            var t=e.srcElement;
            while(t && !t.classList.contains('tab')) {
                t=t.parentNode;
            }
            switchTab(t);
        };
        
        function switchTab(e) {
            tabs.now=[].indexOf.call(tabH.children, e);
            var d=e.d, t=e.tabView;
            if(!t) {
                t=d.type;
                if(t==0)
                    t=newBookmarkTab(d, d.path);
                else if(t==1)
                    t=newImportantTab(d, d.path);
                e.tabView=t;
            }
            var all=tabo.children, b1=1;
            for(var i=all.length-1,n;n=all[i--];) {
                if(n!=t) {
                    n.hidden=1;
                    n.style.display='none';
                    if(n.onRemove)n.onRemove();
                }
                else b1=0;
            }
            tab1=t;
            var b1=t.parentNode!=tabo;
            if(t.hidden || b1) {
                t.hidden=0;
                t.style.display='';
                if(b1)tabo.append(t);
                if(t.onAttach)t.onAttach();
            }
        }
        
        //switchTab(tabH.children[tabs.now||0]);
        switchTab(tabH.children[1]);
        
        window.onblur = function(){
            bg.log('onblur...');
            if(tab1 && tab1.onRemove)tab1.onRemove();
            if(tabs.length)
                bg.saveTabs(tabs);
        }
        
        
        chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
            var tab = tabs[0];
            if(tab) {
                debug(tab, tab.id)
            }
        })
                    