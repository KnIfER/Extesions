(function(document) {
	var tm;
	var prev=" ";
	function replay(){
		app.view.sequencer.play()
	}
    function makeHtml(data) {
		//console.log('makeHtml!!!');
		// detectInsertion
		data = pinyin.getFullChars(data);
		if(window.app){
			var lenA = prev.length;
			var lenB = data.length;
			var po=0, dt=lenB-lenA;
			var insert=false;
		
			app.view.sequencer.stop();
			clearTimeout(tm);
			if(data!==" ") tm = setTimeout(replay, 1500);
			
			if(lenA===" "){
				insert = true;
			} else if(dt>0){
				while(po<lenA&&prev.charAt(po)===data.charAt(po)) po++;
				// prev[po:] === data[po+dt:]
				if(prev[po]!=data[po]) {
					insert = true;
					for(var i=po,len=Math.min(lenA-po,32);i<len;i++){
						if(prev[i]!==data[i+dt]){
							insert = false;
							break;
						}
					}
				}
			}
			if(insert){
				for(var i=po,len=po+dt;i<len;i++){
					app.view.add(data.charAt(i), i, false);
				}
			} else {
				var stage = document.querySelector("#editor > div.stage > div");
				stage.innerHTML="";
				for(var i=0,len=lenB;i<len;i++){
					app.view.add(data.charAt(i), i, true);
				}
			}
		}
		prev = data;
	}

	function refreshDarkMode(bg)
	{
		if(!window._RDM) {
			loadJs("http://mdbr/darkmode.js", function(){window._RDM(bg)});
		} else {
			window._RDM(bg);
		}
	}
	var typaToneInit=1;
	/* 引擎初始化 */
	function loadJs(name,up){
		var item = document.createElement('script');
		item.src=name;
		item.async = false;
		if(up)
		{
			item.onload=up;
		}
		document.head.append(item);
	}
	function loadCss(name){
		var item = document.createElement('link');
		item.setAttribute('rel','stylesheet');
		item.setAttribute('href', name);
		item.setAttribute('type','text/css');
		document.head.append(item);
	}
	function init(name){
		var app = document.createElement('div');
		app.id="view-app";
		document.body.append(app);
		
		window._gaq = [];
		  
		console.log(name.src);
		var src_url=name.src+"/../";
		var jss=["./third-party/has.js"
		, "./third-party/jquery.js"
		, "./third-party/socket.io.js"
		, "./third-party/url.js"
		, "./third-party/jquery-ajax-array-buffer.js"
		, "./third-party/two.js"
		, "./third-party/backbone.js"
		, "./third-party/parse.js"
		, "./third-party/recorder.js"
		, "./src/trail.js"
		, "./src/keyboard.js"
		, "./src/dial.js"
		, "./src/modal.js"
		, "./src/fade.js"
		, "./src/sound.js"
		, "./src/sequencer.js"
		, "./src/visualization.js"
		, "./src/editor.js"
		, "./src/viewer.js"
		, "./src/pinyin.js"
		, "./src/app.js"];
		var up=function(){
			Parse.initialize('EGrbei7QfLM9VBgPoE1ORA7M5xtUWJRibeE3dxrp',
				'2ADcY8Vme84zjZNLZFPbDBz3JhUlsnFnkAO4RM1R');
			Parse.serverURL = src_url+'./api-dot-typatone.appspot.com/';
			Parse.serverURL = src_url+'./';
			Sound.ready(function() { $(setup); });
			/**
			 * Setup the app.
			 */
			function setup() {
			  var $window = $(window);
			  var Router = Backbone.Router.extend({
				routes: {
				  'm/:id': 'message',
				  'about': 'about',
				  '*actions': 'editor'
				}
			  });

			  $('#view-about').find('.close').bind('click', function(e) {
				$('#view-about').css('opacity', 0);
				_.delay(function() {
				  $('#view-about').prependTo(document.body);
				}, 350);
			  });

			  var route = function(id) {
				var width = $window.width();
				var height = $window.height();

				var instantiate = function(model) {

				  var app = window.app = new App(model)
					.setRouter(router)
					.appendTo($('#view-app')[0]);

				  $window
					.bind('resize orientationchange', function() {
					  app.view.resize($window.width(), $window.height());
					});

				  app.view.init(width, height, false);
				  
					window.update();
					

					document.querySelector("#editor").click();
				};

				if ((id + '').toUpperCase() === 'DEBUG') {
				  instantiate((function() {
					var model = {
					  id: 'debug',
					  timestamp: Math.random() * 24,
					  message: 'This is not a message.',
					  published: true
					};
					return {
					  id: 'debug',
					  get: function(key) {
						return model[key];
					  }
					}
				  })());
				  return;
				} else if (id) {
				  App.Models.fetch(id, instantiate);
				  return;
				} else if (url.message) {
				  instantiate((function() {
					var model = {
					  id: 'url-message',
					  timestamp: 12,
					  message: url.message,
					  published: true
					};
					return {
					  id: 'url-message',
					  get: function(key) {
						return model[key];
					  }
					}
				  })());
				  return;
				}
				instantiate();
			  }
			  var router = new Router()
				.on('route:message', route)
				.on('route:about', function() {
				  $('#view-about').appendTo(document.body)
				  route();
				  _.defer(function() {
					$('#view-about').css('opacity', 1);
				  });
				})
				.on('route:editor', route);

			  Backbone.history.start({ pushState: true });
			} 
		};
		for(var j in jss){
			loadJs(src_url+jss[j], j==jss.length-1?up:null);
		}
		jss=["./styles/keyboard.css"
			, "./styles/main.css"
			, "./styles/about.css"
		];
		for(var j in jss){
			loadCss(src_url+jss[j]);
		}
		//window.update();
	}
	window.APMD = makeHtml;
	window.init = init;
}(document));
	