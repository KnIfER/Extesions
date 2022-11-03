
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
        function craft(t, p, c, s) {
            t = doc.createElement(t||'DIV');
            if(c) t.className=c;
            if(s) t.style=s;
            if(p)p.appendChild(t);
            return t;
        }
        var data=bg.d(), tabs, tab1
            ,hideImg = craft("style", document.head);
        craft("style", document.head).innerText=`.folder-icon > .item-icon{-webkit-mask-image:url("chrome-extension://${chrome.runtime.id}/images/folder_open.svg")}`;
        hideImg.innerText='.img{display:none!important}'
        
        var tabo = ge('tabos'), tab0 = ge('tabNew'), tabH=tab0.parentNode, taNow;

        var bkmkAdapter;
        bg.log('popup...', data.test)
          
        function newTabBookmark(tD, path) {
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
                    , initTab : function(tD) {
                        var ret = craft(0, 0, 'UiTab');
                        var head = craft(0, craft(0, ret, 'UiHead'), 0, 'display:flex;justify-content:space-around;');
                        var listViewP = craft(0, ret, 'UITabo');
                        var listView = craft(0, listViewP, 'ListView');
                        // var foot = craft(0, tab, 'UIFoot');
                        var loca = ret.etLoca = craft('INPUT', head);
                        loca.style.width='45%';
                        ret.etSch = craft('INPUT', head);
                        //ret.etSch.width='30%';
                        var tools = craft('DIV', head);
                        craft('BUTTON', tools, 0, 'width:2em;padding:0;').innerText = '★';
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
                                                debug('pullBkmk...', e, tD);
                                                bkmkAdapter.bindListView(ret.lv, e);
                                            });
                                        }
                                    })
                                }
                            }
                        }
                        ret.lv=listView;
                        ret.onRemove=function(){
                            var fvp=listView.fvp();
                            if(fvp) {
                                var pos = fvp.pos;
                                tD.pos=pos/listView.arr.length;
                                bg.log('saving...', pos, tD.pos, fvp.innerText.slice(0,10));
                            }
                        }
                        return ret;
                    }
                }
            }
            doc.addEventListener("mouseup",bkmkAdapter.mouseup,1);
            var ret = bkmkAdapter.initTab(tD);
            bg.pullBkmk(path, function(e){
                debug('pullBkmk...', e);
                bkmkAdapter.bindListView(ret.lv, e, tD);
            });
            ret.etLoca.value = 'chrome://bookmarks/?id='+path;
            return ret;
        }
        
        function newTabImportant(tD, path) {
            var ret = craft(0, 0, 'UiTab');
            ret.load = function() {
                // var navdata;
                // var req=new XMLHttpRequest();
                // req.open('GET','appdata.json');
                // req.responseType='application/x-www-form-urlencoded';
                // req.onreadystatechange=function(e) {
                //     if(req.readyState == 4 && req.status==200) {
                //         //alert(req.responseText);
                //         //alert(JSON.parse('{"navdata":"qwqe"}').navdata);
                //         var appdata = JSON.parse(req.responseText);
                //         if(appdata.navdata) {
                //             //alert(appdata.navdata+(appdata.navdata[0].constructor === Array ));
                //             navdata = appdata.navdata; 
                //             ret.layout(navdata);
                //         }
                //     }
                // };
                // req.send(null);
                var arr = data.favTabArr;
                if(!arr || !arr.length) {
                    var f0=data.favPlus;
                    if(!f0) {
                        f0 = data.favPlus = {url:'add',title:'添加当前标签页',favIconUrl:`chrome-extension://${chrome.runtime.id}/images/icon_add.ico`};
                    }
                    data.favTabs = {};
                    chrome.storage.local.get(['favTabs'], function(e) {
                        try{arr = JSON.parse(e.favTabs)}catch(e){}
                        if(!arr || arr.constructor!==Array || !arr.length) {
                            arr=[];
                            arr.push(f0);
                            // chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
                            //     var tab = tabs[0];
                            //     if(tab) {
                            //         var d={url:tab.url, title:tab.title, favIconUrl:tab.favIconUrl};
                            //         data.favTabs[tab.id]=d;
                            //         arr.push(d)
                            //         debug(tab, tab.id);
                            //     }
                            //     arr.push(f0)
                            //     ret.layout(data.favTabArr)
                            // })
                        }
                        ret.layout(data.favTabArr=arr);
                        // todo restore scrollTop
                    });
                } else {
                    ret.layout(arr)
                }
            }
            ret.save = function() {
                // if() {
                //     bg.saveImportabs();
                // }
            }
            ret.dblclick = function(evt, e) { // todo 等待单击事件完成
                //debug('dblclick', evt, e);
                var dt = e.data;
                if(dt.url != 'add') {
                    chrome.tabs.create({'active': true, 'url': dt.url, 'index':activeTab.index+1}, function (e) {
                        debug(e);
                    })
                }
            }
            ret.click = function(evt, e) {
                //debug('click', evt, e);
                var dt = e.data;
                if(dt.url == 'add' && dt.favIconUrl.indexOf('extension')) {
                    // 添加
                    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
                        var tab = tabs[0];
                        if(tab && !data.favTabs[tab.id]) {
                            var d={url:tab.url, title:tab.title, favIconUrl:tab.favIconUrl, tabId:tab.id};
                            data.favTabs[tab.id]=d;
                            ret.layout([d], 0, 1, e);
                            debug(tab, tab.id);
                            var arr = data.favTabArr, idx=arr.indexOf(dt)||0;
                            arr.splice(idx,0,d);
                        }
                    })
                } else {
                    focusTab(dt);
                }
            }
            function focusWnd(id) {
                chrome.windows.update(id, {focused:true}, function(e){  })
            }
            function do_focusTab(dt, e) {
                chrome.tabs.update(e.id, {active:true}, function(){})
                dt.tabId=e.id;
                data.favTabs[e.id]=dt;
                focusWnd(e.windowId);
            }
            function focusTab(dt) {
                chrome.tabs.update(dt.tabId||0, {active:true}, function(e){
                    debug('update', dt, e);
                    if(!e) {
                        chrome.tabs.query({url:dt.url}, function(e){
                            var found=e && e[0];
                            debug('激活的是同url标签页！', found, dt.url);
                            if(found) {
                                do_focusTab(dt, found);
                            }  else {
                                var idx=dt.url.lastIndexOf('#');
                                if(idx>0) {
                                    chrome.tabs.query({url:dt.url.slice(0,idx)}, function(e){
                                        if(e) {
                                            var found=e && e[0];
                                            debug('激活的是同url#标签页！', found, dt.url);
                                            if(found) {
                                                do_focusTab(dt, found);
                                            }
                                        }
                                    })
                                }
                            }
                        })
                    } else {
                        focusWnd(e.windowId);
                        if(!data.favTabs[e.id]) {
                            data.favTabs[e.id]=dt;
                        }
                    }
                })
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
        
        bg.initTabs(function(ret){
            tabH.style.maxHeight = Math.ceil(tab0.offsetHeight*2+tab0.offsetTop/2)+'px';
            tabs = ret;
            // 初始化多标签页面
            for(var i=0;i<tabs.length;i++) {
                var d=tabs[i];
                var t=d.type,title=d.timu,ico=d.ico;
                if(!title) {
                    if(t==0) title='书签';
                    if(t==1) title='重要页面';
                }
                if(!ico) {
                    if(t==0) ico='★';
                }
                var t=craft('LI',0,"tab");
                if(ico)craft('SPAN', t).innerText=ico;
                craft('SPAN', t).innerText=title;
                t.onclick = onTabClick;
                t.ondblclick = onTabDblClick;
                t.oncontextmenu = onTabMenu;
                t.d=d;
                tabH.insertBefore(t, tab0);
            }
            //tabs.now=1;
            switchTab(tabH.children[tabs.now||0]);
        })
        
        // 空出星星
        // var tabW, tabSpace, tabSpot=ge("tabSpot");
        // function resizeTabH(e) {
        //     tabW = tabH.clientWidth;
        //     var t0 = tabH.firstElementChild
        //     if(tabSpace) {
        //         tabSpace.style.marginRight='';
        //         tabSpace=0;
        //     }
        //     var m0=tabSpot.offsetWidth, mag=(parseInt(getComputedStyle(tab0).marginRight)||0);
        //     if(t0) {
        //         var top = t0.offsetTop+t0.offsetHeight/2;
        //         while(t0=t0.nextElementSibling) {
        //             if(t0.offsetTop>top) {
        //                 t0 = t0.previousElementSibling.previousElementSibling;
        //                 break;
        //             }
        //         }
        //         if(!t0||t0==tabSpot) t0 = tabSpot.previousElementSibling;
        //         while(t0 && t0.offsetLeft+t0.offsetWidth+m0+mag>tabW) {
        //             t0 = t0.previousElementSibling;
        //         }
        //         if(t0) {
        //             debug("挤下来了！B");
        //             tabSpace=t0;
        //             t0.style.marginRight=(tabW-t0.offsetLeft-t0.offsetWidth-mag)+'px';
        //         }
        //     }
        // }
        // w.addEventListener('resize', resizeTabH);
        
        tab0.onclick = function() {
            
        };
        
        function onTabClick(e) {
            var t=e.srcElement;
            while(t && !t.classList.contains('tab')) {
                t=t.parentNode;
            }
            switchTab(t);
        }
        
        function onTabDblClick(e) {
            var t=e.srcElement;
            while(t && !t.classList.contains('tab')) {
                t=t.parentNode;
            }
            e=t;
            var t0 = tabH.firstElementChild;
            var exp = tabH.style.maxHeight!='80%';
            tabH.style.maxHeight = exp?'80%':Math.ceil(t0.offsetHeight*2+t0.offsetTop/2)+'px';
            t0 = e.offsetTop;
            tabH.scrollTop = exp?t0-tabH.offsetHeight/5:t0;
        }
        
        function onTabMenu(e) {
            var t=e.srcElement;
            while(t && !t.classList.contains('tab')) {
                t=t.parentNode;
            }
            var opt={};
            var settingsArr = [''
                , [0, ['closeTab', 0], ['关闭页面'], opt.focusMode!=0
                        , [1<<10, ['focusMode', 1], '折叠页面', opt.fml==1
                            , [2|2<<10, ['expandFirst1N', 'expandFirst1', opt.expandFirst1], ['默认展开前几项：'], opt.expandFirst1N]
                            ]
                        , [1<<10, ['focusMode', 2], '限制最大高度', opt.fml==2
                            , [2|2<<10, ['expandFirst2N', 'expandFirst2', opt.expandFirst2], ['默认展开前几项：'], opt.expandFirst2N]
                            , [1, 'noNestedScroll2', ['禁止嵌套滚动', '但仍可点击翻页、滑动边缘'], opt.noNestedScroll2]
                            , [1<<10, ['limHeightMode', 0], '限制最大值', opt.limHeightMode==0]
                            , [1<<10, ['limHeightMode', 1], '固定高度值', opt.limHeightMode==1]
                            , [2, 'maxHeight2', '高度值：', opt.maxHeight2]
                            ]
                        , [1, 'autoScrollFocus', ['自动滚动至展开项'], opt.autoScrollFocus]
                        , [1, 'autoFocusOne', ['自动折叠旧展开项'], opt.autoFocusOne]
                    ]
            ];
            
            menuContext = t;
            
            if(w.SettingsBuildCard) {
                menu=makeMenu(0, settingsArr);
                setMenuPos(e);
                e.preventDefault();
                e.stopPropagation();
            } else {
                loadJs("settings.js", function(){
                    initSettings(w, doc, 'settings.css');
                    if(w.SettingsBuildCard)
                        onTabMenu(e)
                });
            }
            onMenuNone(e);
        }
        
        
		function onMenuClick(e) {
			var btn=e.button, t=e.srcElement.name;
			debug('onMenuClick', t);
			if(e.delay)
                setTimeout(dismiss_menu, 10);
            else
                dismiss_menu();
        }
        
        function switchTab(e) {
            tabs.now=[].indexOf.call(tabH.children, e);
            if(taNow) taNow.classList.remove('tab-now');
            taNow=e;
            e.classList.add('tab-now');
            var d=e.d, t=e.tabView;
            if(!t) {
                t=d.type;
                if(t==0)
                    t=newTabBookmark(d, d.path);
                else if(t==1)
                    t=newTabImportant(d, d.path);
                e.tabView=t;
            }
            var all=tabo.children, b1=1;
            for(var i=all.length-1,n;n=all[i--];) {
                if(n!=t) {
                    if(!n.hidden) {
                        n.hidden=1;
                        n.style.display='none';
                        if(n.onRemove)n.onRemove();
                    }
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
        
        window.onblur = function(){
            bg.log('onblur...');
            if(tab1 && tab1.onRemove)tab1.onRemove(1);
            if(tabs && tabs.length)
                bg.saveTabs(tabs);
        }
        
        var lastMenu, menu, menuContext;
        function setMenuPos(e) {
			if(menu) {
				var ms=menu.style;
				menu.p.style.display="block";
                var x=e.clientX,y=e.clientY;
				if(menu.revert) {
					ms.left=(x-menu.offsetWidth-10)+"px";
					ms.top=(y-menu.offsetHeight-10)+"px";
				} else {
                    var pW=menu.parentNode.offsetWidth;
                    if(x+menu.offsetWidth>pW) {
                        x=pW-menu.offsetWidth;
                        y+=2;
                    }
					ms.maxHeight=(menu.parentNode.offsetHeight-y-5)+"px";
					ms.left=x+"px";
					ms.top=y+"px";
				}
			}
		}
		function onMenuNone(e){
			e.preventDefault();
			e.stopPropagation();
		}
		function makeMenu(n,arr) {
			if(lastMenu) {
				if(n && lastMenu.n===n) {
					if(!lastMenu.p.parentNode)
						document.body.append(lastMenu.p);
					return lastMenu;
				}
				else if(lastMenu.parentNode) lastMenu.remove();
			}
			var cover = ge('menup');
			if(!cover) {
				cover = craft(0, document.body);
				cover.id='menup';
				cover.onmousewheel = function(e){
					debug('onscroll!!!',e);
					if(e.srcElement==cover) {
						dismiss_menu();
					}
				};
				cover.onmouseup=function(e){
					if(e.srcElement!==cover) {
						e.preventDefault();
						e.stopPropagation();
						var t=e.srcElement;
						debug('onmouseup!!!', t);
						if(e.button==2) {
							window.oncontextmenu=onMenuNone;
						}
						if(!t.classList.contains('sep') && t!=menu) {
							e.delay = true;
							onMenuClick(e);
						}
						if(e.button==2) {
							setTimeout(function(){window.oncontextmenu=onMenuCreate}, 20);
						}
					} 
					else dismiss_menu();
				}
			}
			var menu = craft(0, cover, 'menu', 'max-width:35%;overflow:overlay;');
        
            // var dlg = SettingsGetDialogHolder('settings');
            var host=menu;
            if(!host.cards || true) {
                if(host.cards) {
                    host.cards.forEach(function(it){it.remove()});
                    host.cards=0;
                }
                function pref(id, value, el) 
                {
                    return 1;
                }
                SettingsBuildCard(pref, arr, host);
            }

            // SettingsShowDialog(dlg);
                
			// for (var i=0,t,m;(t=arr[i++])!=null;) {
			// 	if (t) {
			// 		m=craft(0, menu);
			// 		if(Array.isArray(t)) { // 横向子集
			// 			var wid=0, wids, j=0,t1,m1;
			// 			if(Array.isArray(t[0])) { // 宽度占比
			// 				wids = t[0];
			// 				j=1;
			// 			} else {
			// 				wid = parseInt(100/t.length)+'%';
			// 			}
			// 			for (;j<t.length;j++) {
			// 				m1=craft(0, m);
			// 				m1.name=t1=t[j];
			// 				m1.innerText=t1;//trans[t1];
			// 				m1.style.width = wid?wid:(wids[j-1]+'%');
			// 				//m1.onclick=onMenuClick;
			// 			}
			// 		} else {
			// 			m.name=t;
			// 			m.innerText=t;//trans[t];
			// 			//m.onclick=onMenuClick;
			// 		}
			// 	} else {
			// 		craft(0, menu, 'sep');
			// 	}
			// }
			menu.n=n;
			menu.l=arr;
			menu.p=cover;
			lastMenu=menu;
			return menu;
		}
                
        function dismiss_menu(){
            if(menu){
                menu.p.style.display="none";
                menu=null;
            }
        }
        
        var activeTab;
        chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
            activeTab = tabs[0];
            if(activeTab) {
                debug(activeTab, activeTab.id)
            }
        })
                    