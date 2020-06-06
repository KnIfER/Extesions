/* global Popup, rangeFromPoint, TextSourceRange, selectedText, isEmpty, getSentence, isConnected, addNote, getTranslation, isValidElement*/
class PLODFront {
    constructor(win) {
        this.point = null;
        this.notes = null;
        this.sentence = null;
        this.audio = {};
        win.pdFlag = 247;
        //window.activateKey = 16; // shift 16, ctl 17, alt 18
        this.timeout = null;
        this.mousemoved = false;
        this.selecting = false;
        
        this.win = win;
    
        this.KeyMap = [0, 16, 17, 18];

        win.addEventListener('mousemove', e => this.onMouseMove(e));
        //window.addEventListener('mousedown', e => this.onMouseDown(e));
        win.addEventListener('dblclick', e => this.onDoubleClick(e));
        win.addEventListener('keydown', e => this.onKeyDown(e));

        chrome.runtime.onMessage.addListener(this.onBgMessage.bind(this));
        win.addEventListener('message', e => this.onFrameMessage(e));
        //document.addEventListener('selectionend', e => this.userSelectionChanged(e));
        //document.addEventListener('"selectstart"', e => this.uponSelectionStart(e));
       // if(win.document) {
            win.document.addEventListener('selectionchange', e => this.uponSelectionChanged(e));
            win.document.addEventListener('mouseup', e => this.uponMouseup(e));
        //} else {
        //    window.addEventListener('onload',this.wrappedOnLoadFunc.bind(this));
        //}
    }
    
    wrappedOnLoadFunc(){
        this.win.document.addEventListener('selectionchange', e => this.uponSelectionChanged(e));
        this.win.document.addEventListener('mouseup', e => this.uponMouseup(e));
    }

    onMouseMove(e) {
        this.mousemoved = true;
        this.point = e;
    }
    
    onKeyDown(e) {
        if (!isValidElement()) return;
        
        console.log("onKeyDown", );

        if (this.point !== null && (e.keyCode || e.charCode)===this.KeyMap[(window.pdFlag>>2)&0x3]) {
			var exp = 0;//selectedText();
			if(!exp) {
				const range = rangeFromPoint({x:this.point.clientX, y:this.point.clientY});
				if (range == null) return;
				let textSource = new TextSourceRange(range);
				textSource.selectText();
				this.mousemoved = false;
				exp = selectedText();
			}
			if(exp) {
				sendToPD(exp, 3);
			}
        }
    }

    onDoubleClick(e) {
		//console.log("onDoubleClick "+window.enabled+' '+this.enabled)
		this.selecting = false;
		
        this.mousemoved = false;
		
        if (this.timeout) clearTimeout(this.timeout);
        
        if (!(this.win.pdFlag&0x1)) return;
		
        if (!isValidElement()) return;

		console.log('onDoubleClick');
			
		this.SendSelection(0)
    }

    uponSelectionChanged(e) {
        if (!(this.win.pdFlag&0x2) || !this.mousemoved) return;

        if (this.timeout) clearTimeout(this.timeout);

		this.selecting = true;
		
		//console.log('userSelectionChanged');
    }
	
    uponMouseup(e) {
        if(this.selecting) {
			//console.log('uponMouseup');
			
			// wait 180 ms after the last selection change event
			this.timeout = setTimeout(() => {
			    this.onSelectionEnd(e);
			    //var selEndEvent = new CustomEvent('selectionend');
			    //window.dispatchEvent(selEndEvent);
			}, 180);
		}
    }
	
    uponSelectionStart(e) {
        console.log("uponSelectionStart");
    }
	
    async onSelectionEnd(e) {
        if (!(this.win.pdFlag&0x2))
            return;

        if (!isValidElement())
            return;
		
		console.log('onSelectionEnd');
		
        // reset selection timeout
        this.timeout = null;
		this.selecting = false;

		this.SendSelection(1)
    }
	
	SendSelection(src) {
		var exp = selectedText();
		if(exp) {
			sendToPD(exp, src);
		}
	}
	
    onBgMessage(request, sender, callback) {
        const { action, params } = request;
        const method = this[action];

        if (typeof(method) === 'function') {
            params.callback = callback;
            method.call(this, params);
        }

        callback();
    }
	
	//APIs
    setFrontendOptions(params) {
        let { options, callback } = params;
        this.win.pdFlag = options.firstflag;
		console.log("api_setFrontendOptions"+options.enabled)
        //callback();
    }
	
    onFrameMessage(e) {
        const { action, params } = e.data;
        const method = this[action];
        if (typeof(method) === 'function') {
            method.call(this, params);
        }
    }

}

window.plodfront = new PLODFront(window);

//var _Frames_ = window.frames;
//Object.keys(_Frames_).forEach(key => {
//    var win = _Frames_[key];
//    if(win && win.addEventListener) {
//        win.plodfront = new PLODFront(win);
//    }
//});
//window.plodfront = new PLODFront(window);

//console.log(window.plodfront);