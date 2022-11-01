function initGridTab(win, docu, host){
	(function(){
		var debug = console.log
		var doc=docu, w=win, fd=doc, sty;
		function ge(e){return fd.getElementById(e)};
		function craft(t, p, c) {
			t = doc.createElement(t||'DIV');
			if(c)t.className=c;
			if(p)p.appendChild(t);
			return t;
		}
		var dom = `<link id="sty" rel="stylesheet" href="sortable.css" type="text/css" />
	<div id="APP" class="mask ovis">
	<div class="mask" id="mask" ></div>
	<div id="gridview" class="mask">
		<div class="appo" >
			<div id="grid">
				<div id="grido" class="col"> </div>
			</div>
		</div> 
	</div> 
	<div id="drpMask" class="mask"></div>
	<table id="folderview" border="0" bordercolor="#ff0000" cellpadding="5" hidden class="d_hide">
		<tr height="auto">
			<td>
				<div id="foldo"></div>
			</td>
		</tr>
		<tr height="auto" valign="top">
			<td><hr/><span id='folderName' contentEditable=true>文件夹名称</span></td>
		</tr>
	</table>
</div>`;
		if(!host.shadow) {
			if(host.attachShadow) {
				host.shadow = host.attachShadow({mode: 'open'});
				fd = host.shadow;
			} else {
				host.shadow = host;
			}
		}
		host.shadow.innerHTML = dom;
		debug('fd???', fd, fd.styleSheets[0])
	
		var APPGrid, FolderGrid, ActiveGrid
			, drpMask = ge('drpMask')
			, drpMask1 = ge('mask')
			, foldo = ge('foldo')
			, gridview = ge('gridview')
			, folderview = ge('folderview')
			, folderName = ge('folderName')
			, draggingFolder
			, grido = ge('grido')
			, app = ge('APP');
		drpMask.ondragover = drpMask1.ondragover = allowDrop;
		drpMask.onclick = drpMask1.onclick = onDrawerClick;
		folderName.onkeydown = onInputKeyDown;
		function allowDrop(event, ghostEl) {
			var target = foverStart;
			if(FolderGrid && target && target.hovable) {
				if(event instanceof DragEvent)
					event.preventDefault();
				var time = new Date().getTime();
				if(foverTarget!=target) {
					if(foverTarget) {
						nullFovering();
					}
					foverStar = time;
					foverTarget = target;
				}
				if(foverStar>0 && time-foverStar>500) {
					debug('人计有失 天算无漏');
					foverComitted = true;
					SameGroup(1);
					dissmissDrawer();
					debug(ghostEl);
				}
			}
		}
		function onDrawerClick(e) {
			debug('onDrawerClick');
			dissmissDrawer();
			e.preventDefault();
			e.stopPropagation();
			w.multiDragElements = mainDragEls;
		}
		w.allowDrop = allowDrop;

		var tmSwapFolder, tmIgnoreFolder, swapWithFolder, overFolder;
		var foverStart, foverTarget, foverComitted
			, hoverStart, hoverTarget, hoverCommitted
			, folderItem
			, mainDragEls = [], folderDragEls = [];
		w.multiDragElements = mainDragEls;
		var funSort = {
			down : function(e){
				//debug(e.target)
				funSort.nullHovering();
				nullFovering();
				funSort.d = e.target; // downTarget
				funSort.gridis = 0;//readMode||!funSort.d.classList.contains('fimg');
				//debug('wrappedOnDownFunc', e.target, funSort.grid);
				w.disani = hoverCommitted = foverStart = overFolder = foverComitted = 0;
			}
			, hover : function(target) { // CommitHoverTarget
				var time = new Date().getTime();
				if(hoverTarget!=target) {
					if(hoverTarget) {
						funSort.nullHovering();
					}
					hoverStart = time;
					hoverTarget = target;
				}
				if(hoverStart>0 && time-hoverStart>500) {
					hoverCommitted = true;
					hoverTarget.classList.add('icon_h');
					debug('汝之为替 速尔授命');
					return true;
				}
				return 0;
			}
			, hoved : function(toAppend) { // CommitHoverTarget
				var doit = hoverTarget && hoverCommitted;
				if(!toAppend) return doit;
				if(doit) {
					var original = hoverTarget.data, urls = original.url;
					if(urls.constructor !== Array) {
						urls = [{url:urls, title:original.title}];
						original.url = urls;
					}
					toAppend.forEach(function (ch, i) {
						//console.log(taI);
						if(ch.url.constructor === Array) {
							ch.url.forEach(function (taII, j) {
								urls.push(taII);
							});
						} else {
							//console.log('push', taI);
							urls.push(ch);
						}
					});
					console.log('copy done...', original);
					invalidateFolder(hoverTarget);
				}
			}
			, foled : function(evt) { // RemoverFolder
				if(evt.target==grido && overFolder && !tmIgnoreFolder) {
					debug('RemoverFolder!!!')
					tmIgnoreFolder = setTimeout(() => {
						//debug('RemoverFolder::removed');
						overFolder = null;
						tmIgnoreFolder = null;
					}, 800);
				}
			}
			, nullHovering : function () { // nullHovering
				hoverCommitted = false;
				if(hoverTarget) {
					hoverTarget.classList.remove('icon_h')
					hoverTarget = null;
				}
				hoverStart = 0;
			}
			, foved : function(){ // ComitFoverTarget
				if(foverTarget && foverComitted) {
					var target = folderItem;
					if(target) {
						var original = target.data;
						var url=[];
						var childs = foldo.childNodes, ln = childs.length;
						for (var i = 0; i < ln; i++) {
							//console.log(childs[i]);
							if(childs[i].data) { // ghostEl
								url.push(childs[i].data);
							}
						}
						original.url=url;
						invalidateFolder(target);
						debug('folder commit done...', original, target);
					}
					return 1;
				}
				return 0;
			}
			, postDrop : function(isMultiDragisMultiDrag){ // postDrop
				debug('postDrop', isMultiDragisMultiDrag)
				if(isMultiDragisMultiDrag) {
					folderDragEls.forEach(function (multiDragElement, i) {
						mainDragEls.push(multiDragElement)
					});
					folderDragEls = [];
				}
				w.multiDragElements = mainDragEls;
			}
			, trace : function() { // printCallStack
				throw 1;
			}
			, click : onItemClicked 
		};

		function SameGroup(same) {
			FolderGrid.options.group=same?'appoug':'null';
			w._prepareGroup(FolderGrid.options);
		}
		function nullFovering() {
			hoverCommitted = false;
			if(hoverTarget) {
				hoverTarget.classList.remove('icon_h')
				hoverTarget = null;
			}
			hoverStart = 0;
		}

		var readMode=0;
		app.addEventListener('click', function(e){
			e = e.target;
			debug('click', e);
			if(e===grido||e===foldo||e===app) {
				ActiveGrid.multiDrag._deselectMultiDrag();
			} else  if(readMode||e.classList.contains('fnam')){
				onItemClicked(e);
			}
		});


		function onInputKeyDown(e){
			// debug(e);
			if(e.keyCode==13&&e.target.id==='folderName') {
				onDrawerClick(e);
			}
		}

		var minW=0, itemWidth, itemCount, iconWidth, imaLeft, pmaLeft;
		function wrappedResizeFunc(e){
			var ss = fd.styleSheets[0];
			if(!ss) return;
			var devW = document.body.clientWidth;
			minW = Math.min(devW, app.clientWidth);
			itemWidth = Math.floor(minW/5)  + -1;
			itemCount = Math.floor(devW/itemWidth);
			var maxIC = 8;
			if(itemCount>maxIC) {
				itemWidth = Math.floor(devW/maxIC)  + -1;
				itemCount=maxIC;
			}
			//debug('resize', devW)
			var item_width = (itemWidth)*itemCount;
			iconWidth = itemWidth*0.72;
			var icon_pad = iconWidth*0.3/2;
			var icon_width = iconWidth*0.7;
			imaLeft = (itemWidth-iconWidth)/2
			pmaLeft = (devW-item_width)/2;
			var rules = ss.rules?ss.rules:ss.cssRules;
			//alert(0+"_"+document.documentElement.clientWidth+"_"+document.documentElement.clientHeight);
			for(var i=0;i<rules.length;i++)
			{
				var cssquery = rules[i].selectorText, tmp;
				//console.log(cssquery);
				switch(cssquery) {
					case ".item-sqr":
						rules[i].style.width=itemWidth+"px";
						rules[i].style.height=(itemWidth+12)+"px";
					break;
					case ".fimg":
						tmp = icon_width+"px";
						rules[i].style.width=tmp;
						rules[i].style.height=tmp;
						rules[i].style.marginLeft=imaLeft+"px";
						rules[i].style.padding=icon_pad+'px';
					break;
					case ".fimg img":
						var iconSmallWidth = (itemWidth*0.75*0.40);
						tmp = iconSmallWidth+"px";
						var margin = (iconWidth-iconSmallWidth*2)/3+"px";
						rules[i].style.width=tmp;
						rules[i].style.height=tmp;
						rules[i].style.margin=margin;
					break;
					case ".appo":
						rules[i].style.marginLeft=pmaLeft+"px";
					break;
					case "#drpMask":
						rules[i].style.marginLeft=-pmaLeft+"px";
					break;
					case "#foldo":
					case "#folderview":
						var panel_width = (itemWidth*(itemCount-1));
						rules[i].style.width=panel_width+"px";
					break;
				}
			}
		}
		function retrySz(){
			wrappedResizeFunc();
			if(minW<=0 && minW-->-5) {
				setTimeout(retrySz, 10)
			} else {
				folderview.hidden=0;
			}
		}
		host.onAttach=function(){
			minW=0;
			w.addEventListener('resize',wrappedResizeFunc);
			retrySz();
		}
		host.onRemove=function(){
			folderview.hidden=1;
			w.removeEventListener('resize',wrappedResizeFunc);
			// todo 保存列表位置
		}

		ActiveGrid = AppGrid = new Sortable(grido, {
			multiDrag: true,
			swapThreshold: 0.34,
			invertSwap: true,
			selectedClass: 'selected', 
			animation: 300,
			ghostClass: 'blue-background-class',
			group:"appoug",
			root:true,
			forceFallback: false,
			sort:true,
			funs:funSort,
			onStart: function (evt) {
				draggingFolder = evt.item.f_;
				//debug('onStart', draggingFolder);
			},
			onEnd: function (evt) {
				draggingFolder = null;
				//debug(onEnd);
				
				 //undo the move in html
				 var tagName = evt.item.tagName;
				 var items = evt.from.getElementsByTagName(tagName);
				 if (evt.oldIndex > evt.newIndex) {
					 evt.from.insertBefore(evt.item, items[evt.oldIndex+1]);
				 }
				 else {
					 evt.from.insertBefore(evt.item, items[evt.oldIndex]);
				 }
			},
			onMove(evt) {
				debug('onMove', evt);
				//https://github.com/SortableJS/Sortable/issues/1615#issuecomment-529704348
				if ((evt.related.f_||evt.originalEvent.shiftKey) && evt.related !== overFolder) {
					debug('starting timeout')
					clearTimeout(tmSwapFolder);
					if(tmIgnoreFolder)
						clearTimeout(tmIgnoreFolder);
					swapWithFolder = false;
					overFolder = evt.related;
					tmSwapFolder = setTimeout(function() {
						swapWithFolder = true;
					}, 500); // FOLDER_SWAP_TIMEOUT
				} else if (swapWithFolder) {
					//overFolder = null;
				}

				if (evt.related === overFolder && !swapWithFolder) {
				return false;
				}
			}
		});
		
		function layoutChildren(arr, gridEl, keyFun){
			var childs = gridEl.childNodes, ln = childs.length
				, isFolder=gridEl==foldo;
			for (var i = 0; i < ln; i++) {
				gridEl.removeChild(childs[0]);
			}
			ln = arr.length;
			if(!keyFun) keyFun=function(e){
				return e==0?'url':e==1?'title':'favIconUrl';
			};
			var keyFun=[keyFun(0), keyFun(1), keyFun(2)];
			for (var i = 0; i < ln; i++) {
				var data = arr[i];
				var urls = data[keyFun[0]];
				var item = craft('DIV', 0, 'item-sqr')
				if(isFolder) item.infolder=1;
				var iconItem;
				if(urls.constructor === Array) { //is folder
					iconItem = craft('DIV', item, 'fimg')
					iconItem.style.position='relative';
					item.f_=item;
					var size = Math.min(urls.length, 4);
					for (var j = 0; j < size; j++) {
						var iconSmallItem = document.createElement('img');
						iconSmallItem.className = 'fimg_'+j;
						iconSmallItem.src = urls[j].url+'/favicon.ico';
						iconItem.appendChild(iconSmallItem);
					}
				} else {
					iconItem = craft('IMG', item, 'fimg')
					//iconItem.src = urls+'/favicon.ico';
					var favicon = data[keyFun[2]];
					if(!favicon) favicon="chrome://favicon/size/48/"+urls+"";
					iconItem.src = favicon;
				}
				var title = craft('SPAN', item, 'fnam');
				title.innerText=data[keyFun[1]];
				
				item.iconItem=iconItem;
				item.textItem=title;
				item.hovable=1;
				item.data=data;
				gridEl.appendChild(item);
			}
		}

		function invalidateFolder(item){
			var iI = item.data;
			var urls = iI.url;
			var ikonItem = item.iconItem;
			var ti;
			if(ikonItem.tagName==='IMG'){
				item.f_ = item;
				item.removeChild(ikonItem);
				ikonItem = craft('DIV', 0, 'fimg');
				ikonItem.style.position='relative';
				item.classList.add('icon_h')
				item.prepend(ikonItem);
				item.iconItem=ikonItem;
				ti = '';
				setTimeout(() => {
					item.classList.remove('icon_h')
				}, 80);
			} else {
				item.classList.remove('icon_h')
			};
			if(draggingFolder && (ti||iI.title)==='') {
				ti=draggingFolder.data.title;
			}
			if(ti!=undefined) {
				iI.title=ti;
			}
			var childs = ikonItem.childNodes, ln = childs.length;
			for (var i = 0; i < ln; i++) {
				ikonItem.removeChild(childs[0]);
			}
			var size = Math.min(urls.length, 4);
			for (var j = 0; j < size; j++) {
				//console.log(urls[j]);
				var iconSmallItem = document.createElement('img');
				iconSmallItem.className = 'fimg_'+j;
				iconSmallItem.src = urls[j].url+'/favicon.ico';
				ikonItem.appendChild(iconSmallItem);
			}
			item.textItem.innerText=iI.title;
		}

		FolderGrid = new Sortable(ge('foldo'), {
			multiDrag: true,
			swapThreshold: 0.34,
			invertSwap: true,
			selectedClass: 'selected', 
			animation: 300,
			ghostClass: 'blue-background-class',
			funs:funSort,
			onStart: function (evt) {
				//console.log('onStart');
				foverStart = evt.item;
			},
			onEnd: function (evt) {
				//console.log('onEnd');
				foverStart = null;
			},
		});
			
		function onItemClicked(e) {
			//console.log('onItemClicked', e);
			if(!e) e=funSort.d;
			var item=e;
			while(item && !item.classList.contains('item-sqr'))
				item = item.parentNode
			if(item) {
				var showDrawer = readMode;
				if(e==item.iconItem) { // 正主
				}
				else if(e==item.textItem) { // 名称
					showDrawer = true;
				}
				if(showDrawer) {
					var jsonData = item.data;
					if(jsonData&&jsonData.url) {
						var urls = jsonData.url;
						if(urls.constructor === Array) {
							folderItem = item;
							var devH = document.documentElement.clientHeight;
							debug('openning folder...', jsonData, item);
							var colCount = Math.max(itemCount-1, 1);
							var rowCount = Math.ceil(urls.length/colCount);
							var itemHeight = (itemWidth+32);
							var rowMax = Math.floor((devH-100)/itemHeight);
							debug(rowMax, rowCount);
							rowCount = Math.min(rowMax, rowCount)*itemHeight;
							
							var currentX = item.offsetLeft+itemWidth/2+imaLeft;
							var currentY = item.offsetTop+iconWidth/2;
							
							var top = item.offsetTop - (rowCount/2);
							
							var min = document.documentElement.scrollTop;
							var max = min+devH-rowCount-100;
							
							top = Math.min(max, Math.max(min, top));
							
							folderview.style.top = top+3+'px';
							foldo.style.height = (rowCount)+'px';
							
							debug(top, min, max, 'height='+rowCount, 'devH='+devH);
														
							var left=32;
							debug(111,item.offsetLeft, document.documentElement.clientWidth/2-itemWidth/2);
							if(item.offsetLeft>document.documentElement.clientWidth/2-itemWidth/2){
								left=(itemWidth-left);
							}
							folderview.style.left = left+3+'px';
							folderview.style.transformOrigin = (currentX-left)+'px '+(currentY-top-gridview.scrollTop)+'px';
							
							folderName.innerText = jsonData.title;
							
							drpMask.hidden=0;
							folderview.classList.remove('d_hide')
							gridview.classList.add('ovis')
							
							layoutChildren(urls, foldo);
							
							SameGroup(0);
							
							w.multiDragElements = folderDragEls;
							ActiveGrid = FolderGrid;
							deselect = false;
						}
					}
					//console.log(e.parentNode.data);
				}
				item.iconItem.classList.add('ihover')
				setTimeout(() => {
					item.iconItem.classList.remove('ihover')
				}, 300);
			}
		};

		function dissmissDrawer() {
			drpMask.hidden=1;
			folderview.classList.add('d_hide')
			gridview.classList.remove('ovis')
			ActiveGrid = AppGrid;
			if(folderItem) {
				var jsonData = folderItem.data;
				var newTitle = folderName.innerText;
				//console.log('111', DrawerGrid.dragEl);
				if(jsonData.title!=newTitle) {
					jsonData.title=newTitle;
					invalidateFolder(folderItem);
					if(!foverStart) {
						console.log('//todo delay a sec and save');
					}
				}
			}
			//folderview.style.visibility='hidden';
		}
		dissmissDrawer();
		host.layout=function(arr, keyFun) {
			layoutChildren(arr, grido, keyFun);
		}
		host.load();
	})()
}