// JavaScript Document
/*Function.prototype.bind=function(context){var argv=[arguments[0],this];var argc=arguments.length;for(var ii=1;ii<argc;ii++){argv.push(arguments[ii])}return bind.apply(null,argv)};

Function.prototype.shield=function(context){
	if(typeof this!='function'){
		throw new TypeException();
	}
	var bound=this.bind.apply(this,to_array(arguments));
	return function(){return bound()}
};
	
Function.prototype.defer=function(msec,clear_on_quickling_event){
	if(typeof this!='function'){
		throw new TypeError();
	}
	msec=msec||0;
	return setTimeout(this,msec,clear_on_quickling_event);
};

Number.prototype.toFixed=function(num){with(Math)return round(this.valueOf()*pow(10,num))/pow(10,num)};
*/
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(c, b) {
        if (b == null) {
            b = 0
        } else {
            if (b < 0) {
                b = Math.max(0, this.length + b)
            }
        }
        for (var a = b; a < this.length; a++) {
            if (this[a] === c) {
                return a
            }
        }
        return - 1
    }
}
Array.prototype.inArray = function (value)   
{   
   var i;   
   for (i=0; i < this.length; i++){  
       if (this[i] === value){  
           return true;   
       }  
   }  
   return false;  
};
function setLocation(url){
    window.location.href = url;
}

function confirmSetLocation(message, url){
    if( confirm(message) ) {
        setLocation(url);
    }
    return false;
}

function deleteConfirm(message, url) {
    confirmSetLocation(message, url);
}
function bind(obj, method) {
    var args = [];
    for (var ii = 2; ii < arguments.length; ii++) {
        args.push(arguments[ii])
    }
    var fn = function() {
        var _obj = obj || (this == window ? false: this);
        var _args = args.slice();
        for (var jj = 0; jj < arguments.length; jj++) {
            _args.push(arguments[jj])
        }
        if (typeof(method) == "string") {
            if (_obj[method]) {
                return _obj[method].apply(_obj, _args)
            }
        } else {
            return method.apply(_obj, _args)
        }
    };
    if (typeof method == 'string') {
        fn.name = method
    } else if (method && method.name) {
        fn.name = method.name
    }
    fn.toString = function() {
        return bind._toString(obj, args, method)
    };
    return fn
};
bind._toString = bind._toString || 
function(obj, args, method) {
    return (typeof method == 'string') ? ('late bind<' + method + '>') : ('bound<' + method.toString() + '>');
};
function to_array(obj) {
    var ret = [];
    for (var i = 0, l = obj.length; i < l; ++i) {
        ret.push(obj[i]);
    }
    return ret;
};
Function.prototype.bind = function(context) {
    var argv = [arguments[0], this];
    var argc = arguments.length;
    for (var ii = 1; ii < argc; ii++) {
        argv.push(arguments[ii])
    }
    return bind.apply(null, argv)
};
Function.prototype.shield = function(context) {
    if (typeof this != 'function') {
        throw new TypeException();
    }
    var bound = this.bind.apply(this, to_array(arguments));
    return function() {
        return bound();
    }
};
Function.prototype.defer = function(msec, clear_on_quickling_event) {
    if (typeof this != 'function') {
        throw new TypeError();
    }
    msec = msec || 0;
    return setTimeout(this, msec, clear_on_quickling_event);
};
KISSY.app('H', function() {
	var S = KISSY, DOM = S.DOM,
        debug = (-1 === window.location.toString().indexOf('__debug')) ? false : true;

    return {

        /**
         * 版本号
         */
		version: '1.0',
		
		/*
		 * 存放公用方法等
		 * */
		util: {
			/*
			 * 页面刷新
			 * */
			pageReload: function( url ) {
				url = ( url || window.location.toString() ).replace(/t=(\d)+/g, '').replace(/([&|?])+$/, '');
				url = url + ( -1 === url.indexOf('?') ? '?' : '&' ) + 't=' + KISSY.now();
				return window.location = url;
			},

			/*
			 * 解析data.responseText, s === data.responseText
			 * @return {Object}
			 * */
			parseJSON: function( s ) {
				try {
					var result = new Function('return' + s.replace(/[\n|\t|\r]/g, ''))();
				} catch(e) { HLG.log( 'parse JSON error' ); }

				return result;
			},

			

          
            /**
             * 切换小菊花 (假定小菊花在el的前面)
             * @param el
             */
            toggleFlower: function(el) {
                DOM.toggleClass([el, DOM.prev(el)], 'hidden');
            }
		},

		/*
		 * 组件,
		 */
		widget: {},
        app:{},
		/**
         * PrinHLG debug info.
         * @param msg {String} the message to log.
         * @param cat {String} the log category for the message. Default
         *        categories are "info", "warn", "error", "time" etc.
         * @param src {String} the source of the the message (opt)
         * @return {HLG}
         */
		log: function( msg, cat, src ) {
			if (debug) {
                if(src) {
                    msg = src + ': ' + msg;
                }
                if (window['console'] !== undefined && console.log) {
                    console[cat && console[cat] ? cat : 'log'](msg);
                }
            }
            return this;
		}
    };
});



 /* HLG.Dialog 简易模拟窗口
 * 
 * @creator     hlg<xiaohu@taobao.com>
 * @date		2011.05.21
 * @version		1.0
 */

H.add('widget~Dialog', function( HLG ) {
	var S = KISSY, DOM = S.DOM, Event = S.Event, doc = document, IE = S.UA.ie,
		DP = Dialog.prototype, _id_counter = 0,
/* 默认HTML
<div class="ui-dialog ui-dialog-dd">
	<div class="ui-dialog-hd">hd</div>
	<div class="ui-dialog-bd">bd</div>
	<div class="ui-dialog-ft"><a class="close" href="#close" title="关闭"></a></div>
</div>
<div class="ui-dialog-mask"></div>
*/	
		defConfig = {
			ID: null,
			head: 'Title',
			body: '<div class="ui-dialog-loading">正在加载，请稍候...</div>',
			foot: '<a href="javascript:;" class="close">close</a>',
			center: true,
			width: '580px',
			zIndex: '10001',
			keypress: true,
			mask: false,
			drag: false,
			maskClassName: 'ui-dialog-mask',
			close: true,
			className: 'ui-dialog',
			classNameHd: 'ui-dialog-hd',
		    classNameBd: 'ui-dialog-bd',
			classNameFt: 'ui-dialog-ft'
		},
		/**
		 * 所有自定义事件列表
		 */
		CHANGE_HEADER = "changeHeader",	//修改hd
		CHANGE_BODY = "changeBody",		//修改bg
		CHANGE_FOOTER = "changeFooter",	//修改ft
		CENTER = "center",					//center后
		BEFORE_SHOW = "beforeShow",		//show之前
		SHOW = "show",						//show
		BEFORE_HIDE = "beforeHide",		//hide之前
		HIDE = "hide"						//hide
    ;

		
	function Dialog (config) {
		
		var self = this; 
        if (!(self instanceof Dialog)) { 
            return new Dialog(config); 
        } 	   
		
		this.config = S.merge(defConfig, config || {});

		var self = this, cfg = self.config, k;
		self._createHTML();

		if(true === cfg.keypress) Event.on(doc, 'keypress', function(evt) {
			if (27 === evt.keyCode && 200 === self._status) {
				self.hide();
			}
		});

	}
	//
	S.mix(DP, S.EventTarget);

	S.mix(DP, {
		
		/*
		 * 内部状态码 400为hide, 200为show
		 *
		 * */
		_status: 400,

		/**
		 * 居中 return this
		 */
		center: function() { 
			var self = this, elem = this.elem, x, y,
				elemWidth = elem.offsetWidth,
				elemHeight = elem.offsetHeight,
				viewPortWidth = DOM.viewportWidth(),
                viewPortHeight = DOM.viewportHeight();
               
            if (elemWidth < viewPortWidth) {
                x = (viewPortWidth / 2) - (elemWidth / 2) + DOM.scrollLeft();
            } else {
                x = DOM.scrollLeft();
            }

            if (elemHeight < viewPortHeight) {
                y = (viewPortHeight / 2) - (elemHeight / 2) + DOM.scrollTop();
            } else {
                y = DOM.scrollTop();
			}

            DOM.css(elem, { left: x, top: y });
			DOM.css(self.mask, 'height', DOM.docHeight() + 'px');

            self.fire( CENTER );
            return self;
		},
		
		/**
		 * setHeader
		 */
		setHeader: function(str) {
            var self = this;
            str = str + "";
			self.elemHead.innerHTML = str;
			
			self.fire( CHANGE_HEADER );
			return self;
		},
		
		/**
		 * setbody
		 */
		setBody: function(str) {
            var self = this;
            if(str.nodeType) { // 如果是节点元素, 清空elemBody, 再插入节点元素
				self.elemBody.innerHTML = '';
				self.elemBody.appendChild(str);
			} else {
				str = str + "";
				self.elemBody.innerHTML = str;
            }

			self.fire( CHANGE_BODY );
			return self;
		},
		
		/**
		 * setFooter
		 */
		setFooter: function(str) {
            var self = this;
            str = str + "";
			self.elemFoot.innerHTML = str;
			
			self.fire( CHANGE_FOOTER );
			return self;
        },

		/**
		 * show
		 */
        show: function() {
			 
            var self = this, cfg = this.config;
            self.fire( BEFORE_SHOW );
			
			if(true === cfg.center) self.center();
			
            DOM.css(self.elem, "visibility", "");
			DOM.css(self.mask, "visibility", "");
			if(IE && 6 === IE) {
				DOM.addClass(doc.body, 'fix-select');
			}			
			self._status = 200;
			self.fire( SHOW );
			
			return self;
		},
		
		/**
		 * hide
		 */
        hide: function() {
            var self = this,  cfg = self.config;
			if ( 400 === self._status ) return;
		    self.fire( BEFORE_HIDE );	

            DOM.css(self.elem, "top", 0);
            DOM.css(self.elem, "visibility", "hidden");
            DOM.css(self.mask, "visibility", "hidden");
            DOM.css(self.mask, "height", 0);
			if(IE && 6 === IE) {
				DOM.removeClass(doc.body, 'fix-select');
			}
			self._status = 400;
			self.fire( HIDE );

			return self;
		},
		
		
		_createHTML: function() {
			var self = this, cfg = self.config;

			self.elem = doc.createElement('dialog');
			self.elem.id = cfg.ID || 'ui-dialog-' + _id_counter++;
			self.elem.className = cfg.className;
			DOM.css(self.elem, 'width', cfg.width);
			DOM.css(self.elem, 'visibility', 'hidden');
			DOM.css(self.elem, 'z-index', cfg.zIndex);
			//hd
			self.elemHead = doc.createElement('hd');
			self.elemHead.className = cfg.classNameHd;
			self.elemHead.innerHTML = cfg.head;
			
			//bd
			self.elemBody = doc.createElement('bd');
            self.elemBody.className = cfg.classNameBd;
            self.setBody( cfg.body );

			// 注册关闭按钮
			if(true === cfg.close) {
                //ft
                self.elemFoot = doc.createElement('ft');
                self.elemFoot.className = cfg.classNameFt;
                self.elemFoot.innerHTML = cfg.foot;
                Event.on(DOM.query('a.close', self.elemFoot), 'click', function(evt) {
					evt.preventDefault();
					self.hide();
				});
			}
		    
            //append
			self.elem.appendChild(self.elemHead);
            self.elem.appendChild(self.elemBody);
            self.elem.appendChild(self.elemFoot);
			doc.body.appendChild(self.elem);
			
			// 初始化遮罩层
			if(true === cfg.mask) {
				self.mask = doc.createElement('mask');
				self.mask.id = self.elem.id + '_' + cfg.maskClassName;
				self.mask.className = cfg.maskClassName;
                DOM.css(self.mask, 'height', DOM.docHeight() + 'px');
                DOM.css(self.mask, 'visibility', 'hidden');
				DOM.css(self.mask, 'z-index', self.config.zIndex - 1)
				doc.body.appendChild(self.mask);
			}
			
			// 初始化拖拽
			if(true === cfg.drag) {
				
				DOM.addClass(self.elem, 'ui-dialog-dd');
				S.use('dd',function(){
					  var node = S.one('#'+self.elem.id);
				          self.DD =  new S.Draggable({
					                         node:node,
					                         handlers:[S.one('.'+cfg.classNameHd)],
					                         shim:true				
					                  });
					       self.DD.on("drag", function(ev) {
                                   if (ev.left < 0||ev.top<0) return;
                                            node.offset(ev);
                                   });
					})
			}

		}
	});

    H.widget.Dialog = Dialog;
    
   H.widget.DialogMgr = {
        /* 存储已初始化的dialog */
        list: {},
        /**
            * 返回H.util.Dialog对象
            */
        get: function(id, config) {
            if(!id || !this.list[id]) {
                var D = new H.widget.Dialog(config);
                id = !id ? D.elem.id : id;
                this.list[id] = D;
            }
            return this.list[id];
        }
    };
});
/* vim: set et sw=4H=4 sHLG=4 fdm=indent ff=unix fenc=gbk: */
/**
 *H.Msg 简易消息提示
 *
 * @creator     小虎<xiaohu@taobao.com>
 * @date		2010.06.23
 * @version		1.0
 */
 H.add('widget~msg', function( HLG ) {
	var S = KISSY, DOM = S.DOM, Event = S.Event,doc = document,
		HIDDEN = 'hidden';
	
	function Msg(el) {
		if(el==null) {
			this.elem = doc.createElement('div'); 
			DOM.css(this.elem, 'width', '140px');
			DOM.css(this.elem, 'height', '40px');
			DOM.css(this.elem, 'text-align', 'center');
			DOM.css(this.elem, 'vertical-align', 'middle');
			DOM.css(this.elem, 'line-height', '40px');
			DOM.css(this.elem, 'position', 'absolute');
			DOM.css(this.elem, 'background-color', '#fff');
			doc.body.appendChild(this.elem);
		}else{
			this.elem = DOM.get(el);
		}
		DOM.css(this.elem, 'z-index', 10001);
		
		
	}

	S.mix(Msg.prototype, {
		
		/*
		 * 
		 * 设置消息
		 *
		 * @param value {String} 消息内容
         * @param h {Boolean} 默认 true, 自动隐藏
         * @param type {Boolean} 显示消息类型, error or warn
		 * @return {Boolean} 是否成功
		 *
		 * */
		val: function( value, type, h ) {
			if ( S.isString( value ) ) {
				h =  h === undefined ? true : !!h;
				this.elem.innerHTML = value;
				this.show( type );
				if ( h ) this.hide( h );
			}
			return this;
        },

        loading: function() {
            return this.val( '正在处理，请稍后...', 1, false );
        },

		show: function( type ) {
			var elem = this.elem;
            DOM.css( elem, 'opacity', 1);
            DOM.removeClass( elem, 'error' );
            DOM.removeClass( elem, HIDDEN );
            return type + '' - 0 === 0 ? DOM.addClass( elem, 'error' ) : '';
		},
		/**
		 * 居中 return this
		 */
		center: function() { 
			var self = this, elem = this.elem, x, y,
				elemWidth = elem.offsetWidth,
				elemHeight = elem.offsetHeight,
				viewPortWidth = DOM.viewportWidth(),
                viewPortHeight = DOM.viewportHeight();
     
            if (elemWidth < viewPortWidth) {
                x = (viewPortWidth / 2) - (elemWidth / 2) + DOM.scrollLeft();
            } else {
                x = DOM.scrollLeft();
            }

            if (elemHeight < viewPortHeight) {
                y = (viewPortHeight / 2) - (elemHeight / 2) + DOM.scrollTop();
            } else {
                y = DOM.scrollTop();
			}

            DOM.css(elem, { left: x, top: y });
            return self;
		},
	   // 初始化遮罩层
		mask:function() {
			      
				var self = this,mask = doc.createElement('mask');
				    self.mask = mask;
					DOM.css(mask, 'height', DOM.docHeight() + 'px');
                	DOM.css(mask, 'opacity', '0.3');
					DOM.css(mask, 'background-color','#000');
					DOM.css(mask, 'height', DOM.docHeight() + 'px');
					DOM.css(mask, {position: 'absolute', top:'0px', left:'0px',right:'0px',bottom:'0px'});
                	DOM.css(mask, 'width','100%');
	            	DOM.css(mask, 'filter','alpha(opacity=0.3)');
					DOM.css(mask, 'z-index', 10000)
					doc.body.appendChild(mask);
			},
		/*
		 * 隐藏
		 *
		 * @param b {Boolean} 是否延时隐藏, 默认false
		 * */
		hide: function( b ) {
			var self = this;
            if ( true === b ) {
                // 已延迟了, 重新开始
                if ( self.timer ) {
                    self.timer.cancel();
                }
		        self.timer = S.later(function() {
					
					var p = { opacity:0 },
						a = S.Anim( self.elem, p, 0.3 );
                        DOM.addClass( self.elem, HIDDEN );
						DOM.remove(self.mask);
                        self.timer = null;	
					a.run();
                }, 3000);
                return;
			}

			DOM.addClass( self.elem, HIDDEN );
		}
	});

	 H.util.Msg = Msg;
});

H.add('widget~asyncRequest', function(HLG) {
	var S = KISSY, DOM = S.DOM, Event = S.Event, doc = document;
	
	function asyncRequest(uri) {

       var self = this; 
        if (!(self instanceof asyncRequest)) { 
            return new asyncRequest(uri); 
        } 	   
	    this.uri = '';
        this.method = 'GET';
        this.data = null;
        this.bootloadable = true;
        this.resList = [];
        if (uri != undefined) {
            this.setURI(uri)
        }
    };
	
	S.mix(asyncRequest.prototype,{
		
		handleSuccess: function() {return undefined},
        handleFailure: function(o) {
           alert(o.desc)
        },
        mapRes: function() {
            var links = document.getElemenHLGByTagName("link");
            var scripHLG = document.getElemenHLGByTagName("script");
            if (links.length) {
                for (var i = 0, l = links.length; i < l; i++) {
                    this.resList.push(links[i].href)
                }
            }
            if (scripHLG.length) {
                for (var i = 0, l = scripHLG.length; i < l; i++) {
                    this.resList.push(scripHLG[i].src)
                }
            }
        },
        setMethod: function(m) {
            this.method = m.toString().toUpperCase();
            return this
        },
        getMethod: function() {
            return this.method
        },
        setData: function(obj) {
            this.data = obj;
            return this
        },
        getData: function() {
            return this.data
        },
        setURI: function(uri) {
            this.uri = uri;
            return this
        },
        getURI: function() {
            return this.uri.toString()
        },
        setHandle: function(fn) {
            handleSuccess = fn;
            return this
        },
        setErrorHandle: function(fn) {
        	//alert(fn);
            HLG.widget.asyncRequest.prototype.handleFailure = fn;
//             this.handleFailure = fn;
            //alert(this.handleFailure);
            return this
        },
        dispatchResponse: function(o) {
			handleSuccess(o);
            var onload = o.onload;
            if (onload) {
                try { (new Function(onload))()
              
			    } catch(exception) {
                   // HLG.widget.msgBox.setMsg('执行返回数据中的脚本出错').setAutohide().show()
                }
            }
        },
        disableBootload: function() {
            this.bootloadable = false;
            return this
        },
        enableBootload: function() {
            this.bootloadable = true;
            return this
        },
        interpretResponse: function(data, textStatus, xhr) {
        	var self = HLG.widget.asyncRequest.prototype;
			
            if (data.ajaxExpired) {
                window.location = data.ajaxRedirect;
                return
            }
            if (data.error) {
            	//alert(this.handleFailure);
                var fn = self.handleFailure
            } else {
                var fn = self.dispatchResponse
            }       
            //alert(fn);
            fn = fn.shield(null, data);
            fn = fn.defer.bind(fn);
			/*
            if (this.bootloadable) {
                var bootload = data.bootload;
                if (bootload) {
                    Bootloader.loadResources(response.bootload, fn, false)
                } else {
                    fn()
                }
            } else {
                fn()
            }
			*/
			fn();
        },
        dispatchErrorResponse: function(o) {
            alert('dispatchErrorResponse error');
			//HLG.widget.msgBox.setMsg('与服务器交互出错，请检查网络是否连接正常').setAutohide().show()
        },
        send: function() {
        	var self = this;
            if (self.method == "GET" && self.data) {
                self.uri += ((self.uri.indexOf('?') == -1) ? '?': '&') + self.data;
                self.data = null
            }
            S.ajax({
				type:self.method,
			    url:self.uri,
			    data:self.data,
		        success:this.interpretResponse,
				error:this.dispatchErrorResponse,
			    dataType:'json'
			})
        }
	})
	H.widget.asyncRequest = asyncRequest;
});

  //分页 组件
H.add('widget~showPages', function( HLG ) { 
  
  var S = KISSY, DOM = S.DOM, Event = S.Event, doc = document;
  
  function showPages(name) { //初始化属性 
			 var self = this; 
                 if (!(self instanceof showPages)) { 
                         return new showPages(name); 
                 } 	
				this.pageNum = 4    
			    this.name = name;      //对象名称
                this.page = 1;         //当前页数
                this.pageCount = 200;    //总页数
                this.argName = 'page'; //参数名	
			
           }

S.mix(showPages.prototype,{
      jump:function(){
			      return undefined;
			},
	  //进行当前页数和总页数的验证
     checkPages: function(){ 
			     if (isNaN(parseInt(this.page))) this.page = 1;
			     if (isNaN(parseInt(this.pageCount))) this.pageCount = 1;
			     if (this.page < 1) this.page = 1;
			     if (this.pageCount < 1) this.pageCount = 1;
			     if (this.page > this.pageCount) this.page = this.pageCount;
			     this.page = parseInt(this.page);
			     this.pageCount = parseInt(this.pageCount);
            },
		//生成html代码	  
     _createHtml: function(mode){ 
	   
              var self = this,
			      strHtml = '', prevPage = this.page - 1, nextPage = this.page + 1;   
              if (mode == '' || typeof(mode) == 'undefined') mode = 0;
              switch (mode) {
                   case 1 : //模式1 (页数)
                          /* strHtml += '<span class="count">Pages: ' + this.page + ' / ' + this.pageCount + '</span>';*/
                           strHtml += '<span class="number">';
                           if (this.page != 1) strHtml += '<span title="Page 1"><a href="javascript:' + self.name  + '.toPage(1);">1</a></span>';
                           if (this.page >= 5) strHtml += '<span>...</span>';
                           if (this.pageCount > this.page + 2) {
                                    var endPage = this.page + 2;
                              } else {
                                        var endPage = this.pageCount; 
                                   }
                          for (var i = this.page - 2; i <= endPage; i++) {
                          if (i > 0) {
                               if (i == this.page) {
                                    strHtml += '<span title="Page ' + i + '">' + i + '</span>';
                              } else {
                                   if (i != 1 && i != this.pageCount) {
                                         strHtml += '<span title="Page ' + i + '"><a href="javascript:' + self.name + '.toPage(' + i + ');">' + i + '</a></span>';
                                    }
                              }
                              }
                              }
                          if (this.page + 3 < this.pageCount) strHtml += '<span>...</span>';
                          if (this.page != this.pageCount) strHtml += '<span title="Page ' + this.pageCount + '"><a href="javascript:' + self.name + '.toPage(' + this.pageCount + ');">' + this.pageCount + '</a></span>';
                        
                                      strHtml += '</span><br />';
                                 break;
								 
						 case 2 : //模式2 (前后缩略,页数,首页,前页,后页,尾页)
                          /* strHtml += '<span class="count">Pages: ' + this.page + ' / ' + this.pageCount + '</span>';*/
                           strHtml += '<span class="number">';
                           if (prevPage < 1) {
                           strHtml += '<span title="First Page" >第一页</span>';
                           strHtml += '<span title="Prev Page">上一页</span>';
                           } else {
                                  strHtml += '<span title="First Page"><a href="javascript:' + self.name + '.toPage(1);">第一页</a></span>';
                                  strHtml += '<span title="Prev Page"><a href="javascript:' + self.name + '.toPage(' + prevPage + ');">上一页</a></span>';
                                }
                           if (this.page != 1) strHtml += '<span title="Page 1"><a href="javascript:' + self.name  + '.toPage(1);">1</a></span>';
                           if (this.page >= 5) strHtml += '<span>...</span>';
                           if (this.pageCount > this.page + 2) {
                                    var endPage = this.page + 2;
                              } else {
                                        var endPage = this.pageCount; 
                                   }
                          for (var i = this.page - 2; i <= endPage; i++) {
                          if (i > 0) {
                               if (i == this.page) {
                                    strHtml += '<span title="Page ' + i + '">' + i + '</span>';
                              } else {
                                   if (i != 1 && i != this.pageCount) {
                                         strHtml += '<span title="Page ' + i + '"><a href="javascript:' + self.name + '.toPage(' + i + ');">' + i + '</a></span>';
                                    }
                              }
                              }
                              }
                          if (this.page + 3 < this.pageCount) strHtml += '<span>...</span>';
                          if (this.page != this.pageCount) strHtml += '<span title="Page ' + this.pageCount + '"><a href="javascript:' + self.name + '.toPage(' + this.pageCount + ');">' + this.pageCount + '</a></span>';
                          if (nextPage > this.pageCount) {
                                strHtml += '<span title="Next Page">下一页</span>';
                                strHtml += '<span title="Last Page">最后一页</span>';
                             } else {
                                       strHtml += '<span title="Next Page"><a href="javascript:' + self.name + '.toPage(' + nextPage + ');">下一页</a></span>';
                                       strHtml += '<span title="Last Page"><a href="javascript:' + self.name +'.toPage(' + this.pageCount + ');">最后一页</a></span>';
                                   }
                                      strHtml += '</span><br />';
                                 break;		 
                       }
               return strHtml;
			   
            },
      //页面跳转 返回将跳转的页数
      toPage:function(page){ 
                 var turnTo = 1;
                 if (typeof(page) == 'object') {
                      turnTo = page.options[page.selectedIndex].value;
                 } else {
                      turnTo = page;
                 }
				
              this.jump(turnTo,'','');
			  
              },
			  
        //显示html代码
	  printHtml:function(contian,mode){ 
	                
                    this.checkPages();
                    DOM.html(contian,this._createHtml(mode));
					return this;
                  },
	  //设置总页数			  
	  setPageCount:function(pagecount){
		               this.pageCount=pagecount;
	 	               return this;
		           },			    
	  getPageCount:function(){
                       return this.pageCount;
	           	   },
	  //设置跳转 执行函数
      setRender: function(fn){
				 this.jump = fn;
				 return this;
		         },	
     setPageNum:function(page_num){
	            	   this.pageNum = page_num;
		               return this;
		        },
	 setPage:function(page){
		                this.page = page;  
		                return this; 
		      }   	   
		 
				  	   
})

H.widget.showPages = showPages;
});

 //循环倒计时
H.add('widget~countdown', function( HLG ) { 
  
  var S = KISSY, DOM = S.DOM, Event = S.Event, doc = document;

  function countdown(contain,last_time) { //初始化属性 
			 var self = this; 
                 if (!(self instanceof countdown)) { 
                         return new countdown(contain,last_time); 
                 } 
				 self.init(contain,last_time);	    
           }
S.mix(countdown.prototype,{
		init:function(contain,last_time){
				 var n = last_time || 1440; //剩余分钟数
				 var self = this;
                 var newendtime = function() {
                            var now = new Date(),
                                add = n * 60 * 1000;
                                self.endtime = new Date(now.getTime() + add);
							    if(self.timer!=null){
							    		self.timer.cancel();
							    		self.timer = S.later(fresh, 1000 /*1s*/, true/*setInterval*/, null/*context*/,self.endtime);
								}
                             return self.endtime;
                          }
                     self.endtime = newendtime();
					 DOM.append(DOM.create(' <span class="day">10</span>天<span class="hour">19</span>时<span class="min">19</span>分<span class="sec">26</span>秒分 '),DOM.get(contain));
					   
                var fresh = function(data) {
                            var nowtime = new Date(),
							    endtime = data,
                                leftsecond = parseInt((endtime.getTime() - nowtime.getTime()) / 1000);
                                d = parseInt((leftsecond / 86400) % 30);
                                h = parseInt((leftsecond / 3600) % 24);
                                m = parseInt((leftsecond / 60) % 60);
                                s = parseInt(leftsecond % 60);
                                DOM.html(DOM.get(contain+' .day'), d);
                                DOM.html(DOM.get(contain+' .hour'), h);
                                DOM.html(DOM.get(contain+' .min'), m);
                                DOM.html(DOM.get(contain+' .sec'), s);
                        }
               S.later(newendtime, n * 60000/*1s*/, true/*setInterval*/, null/*context*/, null);
			   self.timer = S.later(fresh, 1000 /*1s*/, true/*setInterval*/, null/*context*/, self.endtime);
			}     
				  	   
})

H.widget.countdown = countdown;
});




