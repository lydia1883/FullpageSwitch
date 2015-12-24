/**
 * 
 * @authors Your Name (you@example.org)
 * @date    2015-12-15 21:15:58
 * @version $Id$
 */


(function($){//将全局对象传入避免与其他框架混乱

	var _prefix=(function(temp){

		var aPrefix=["webkit","moz","o","ms"],
		props="";

		for(var i in aPrefix){

			props=aPrefix[i]+"Transition";
			if(temp.style[props]!==undefined){
				return "-"+aPrefix[i].toLowerCase()+'-';
			}
		}

		return false;
		//私有方法
	})(document.createElement(PageSwitch));

	var PageSwitch=(function(){

		function PageSwitch(element,opt){//构造函数

			this.settings=$.extend(true,$.fn.PageSwitch.defaults,opt||{});//以配置参数覆盖默认参数
			this.element=element;//属性
			this.init();//初始化
		}

		PageSwitch.prototype={
			
			//初始化插件
			init:function(){
				var me=this;
				me.selectors=me.settings.selectors;
				me.sections=me.element.find(me.selectors.sections);
				me.section=me.sections.find(me.selectors.section);
				
				me.direction=me.settings.direction == 'vertical' ? true :false;//获取页面的方向
				me.pagesCount=me.pagesCount(); 
				me.index=( me.settings.index >= 0 && me.settings.index < me.pagesCount ) ? me.settings.index : 0 ;			
				
				me.canScroll=true;

				if(!me.direction){//如果是横屏，调用layout
					me._initLayout();
				}		
				if(me.settings.pagination){
					me._initPaging();
				}
				me._initEvent();
				
			},
			//获取页面滑动数量
			pagesCount:function(){
				return this.section.length;
			},
			//获取滑动宽度或高度
			switchLength:function(){
				return this.direction ? this.element.height() : this.element.width();
			},
			prev:function(){
				var me=this;
				if(me.index>0){
					me.index--;
				}else if(me.settings.loop){
					me.index=me.pagesCount-1
				}
				me._scrollPage();
			},
			next:function(){
				var me=this;
				if(me.index<me.pagesCount){
					me.index++;
				}else if(me.settings.loop){
					me.index=0;
				}
				me._scrollPage();

			},

			//针对横屏情况进行页面布局
			_initLayout:function(){
				
				var me=this;
				var width=( me.pagesCount * 100 )+'%',
				cellWidth=(100/me.pagesCount).toFixed(2)+'%';

				me.sections.width(width);
				me.section.width(cellWidth).css("float","left");

			},
			//实现分页的dom结构及css样式
			_initPaging:function(){
				var me=this,
				pagesClass=me.selectors.pages.substring(1);
				me.activeClass=me.selectors.active.substring(1);
				var pageHTML="<ul class="+ pagesClass +">";

				for(var i=0;i<me.pagesCount;i++){
					pageHTML+="<li></li>";
				}

				pageHTML+="</ul>"
				me.element.append(pageHTML);

				var pages=me.element.find(me.selectors.pages);
				me.pageItem=pages.find("li");
				me.pageItem.eq(me.index).addClass("active");

				if(me.direction){
					pages.addClass("vertical");
				}else{

					pages.addClass("horizontal");
				}
			},
			//初始化插件事件
			_initEvent:function(){
				var me=this;
			
				me.element.on("click", me.selectors.pages+">li",function(){
				   
				   me.now=$(this).index();
				   if(me.canScroll) {
						me.index=$(this).index();
						me._scrollPage();
					}
				});

				me.element.on("mousewheel DOMMouseScorll",function(e){

					e.preventDefault();
					if(me.canScroll) {

						var delta=e.originalEvent.wheelDelta || -e.originalEvent.detail;
						if(delta > 0 && (me.index && !me.settings.loop || me.settings.loop)){
							me.prev();
						}else if( delta<0 && (me.index < (me.pagesCount-1) && !me.settings.loop ||me.settings.loop) ){
							me.next();
						}

					}
					
				});

				if(me.settings.keyBoard){

					$(window).on("keydown",function(e){
						if(me.canScroll ) {
							var keyCode=e.keyCode;
							if(keyCode==37||keyCode==38){
								me.prev();
							}
							if(keyCode==39||keyCode==40){
								me.next();
							}
						 }	
					});
				}

				$(window).resize(function(){

					var currentLen=me.switchLength(),
					  offset = me.settings.direction ? me.section.eq(me.index).offset().top : me.section.eq(me.index).offset().left;

					  if( Math.abs(offset)>currentLen/2 && me.index<(me.pagesCount-1)){
					  	me.index++;
					  }
					  if(me.index){
					  	me._scrollPage();
					  }
				});

				me.sections.on("transitionend webkitTransitionEnd oTransitionEnd",function(){
					me.canScroll=true;
					if(me.settings.callback && $.type(me.settings.callback)=='function'){
						me.settings.callback();
					}
				});
			},

			_scrollPage:function(){

					var me=this,
				    dest=me.section.eq(me.index).position();
				   if(!dest) return; 
				 
				   if(!me.canScroll){return;}
				   me.canScroll=false;			 
				   if(_prefix){

				  	me.sections.css(_prefix+"transition","all "+me.settings.duration+"ms "+me.settings.easing);
				  	var translate=me.direction ? "translateY(-"+dest.top+"px)" : "translateX(-"+dest.left+"px)";
				 	me.sections.css(_prefix+"transform",translate);

				  } else{
				  	var animateCss=me.direcition ? {top : -dest.top} : {left : -dest.left};
				  	me.sections.animate(animateCss, me.settings.duration ,function(){

				  		me.canScroll=true;
				  		if(me.settings.callback && $.type(me.settings.callback)=='function'){
							me.settings.callback();
						}
				  	});
				  }

				  if(me.settings.pagination){
				  	 me.pageItem.eq(me.index).addClass(me.activeClass).siblings("li").removeClass(me.activeClass)
				  }
				
				}
			
			};

		return PageSwitch;//返回这个对象

	})();

	$.fn.PageSwitch=function(opt){//将方法挂载到jq对象的原型上，以便共享

		return this.each(function(){//实现链式调用，返回this对象

			var me=$(this),
			    instance=me.data("PageSwitch");//存放实例
				
			if( !instance ){
				instance=new PageSwitch(me,opt);//如实例不存在，创建对象
				me.data("PageSwitch",instance);//将实例存放在PageSwitch上
			}   
			if($.type(opt)==='string') return instance[opt]();//实现init调用

			//单例模式
		});

	};

	$.fn.PageSwitch.defaults={ //默认参数

		selectors:{  
			sections:".sections", //对应相应父级容器的class
			section:".section",//对应相应子容器的class
			pages:".pages",//对应相应的分页
			active:".active"//对应相应页面选中时的class
		},

		index:0,//对应页面开始的索引值
		easing: 'ease', //对应动画效果
		duration:500,//持续时间
		loop:'false',//是否允许全屏播放
		pagination:true, //是否进行分页处理
		keyBoard:true, //是否使用键盘事件
		direction:'vertical',//滑动的方向
		callback:''	
	};

	

})(jQuery);
