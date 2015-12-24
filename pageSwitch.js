/**
 * 
 * @authors Your Name (you@example.org)
 * @date    2015-12-24 13:43:11
 * @version $Id$
 */

;(function ($){

	   var _prefix=(function(temp){//定义私有方法

		var aPrefix=["webkit","moz","o","ms"],
		props="";

		for(var i in aPrefix){
			props=aPrefix[i]+"Transition";

			if(temp.style[props] !==undefined){

				return "-"+aPrefix[i].toLowerCase()+"-";
			}
		}
		return false;
	})(document.createElement(PageSwitch));

  var PageSwitch=(function(){

  	function PageSwitch(element,options){

  		this.settings=$.extend(true,$.fn.PageSwitch.Defaults,options);//配置参数覆盖默认
  		this.element=element;//将属性挂载到对象上
  		this.init();//初始化函数
  	}
  	PageSwitch.prototype={

  		init:function(){//初始化插件 dom 布局 分页 绑定事件

  			var me=this;
  			me.selectors=me.settings.selectors;
  			me.sections=me.element.find(me.selectors.sections);
  			me.section=me.element.find(me.selectors.section);   //选取dom元素

  			me.direction=me.settings.direction == 'vertical' ? true :false;
  			//看方向为竖屏返回true
  			me.pagesCount=me.pagesCount();
  			me.index=( me.settings.index >= 0 && me.settings.index < me.pagesCount ) ? me.settings.index : 0;

  			me.canScroll=true;

  			if(!me.direction){
  				me._initLayout();
  			}
  			if(me.settings.pagination){
  				me._initPaging();
  			}
  			me._initEvent();

  		},
  		pagesCount:function(){//获取滑动页面的数量
  		
  			return this.section.length;
  		
  		},
  		switchLength:function(){//获取滑动的宽度或高度

  			return this.direction ? this.element.height() :this.element.width();
  		},
  		prev:function(){

  			var me=this;
  			if(me.index>0){
  				me.index--;
  			}
  			else if(me.settings.loop){

  				me.index=me.pagesCount-1;
  			}
  			me._scrollPage();
  		},
  		next:function(){
  			var me=this;
  			if(me.index<me.pagesCount){
  				me.index++;
  			}
  			else if(me.settings.loop){

  				me.index=0;
  			}
  			me._scrollPage();

  		},
  		_initLayout:function(){//针对横屏的情况布局
  			var me=this;
  			var width=(me.pagesCount * 100)+'%';
  			var cellWidth=(100 / me.pagesCount).toFixed(2)+'%';

  			me.sections.width(width);
  			me.section.width(cellWidth).css("float","left");  			

  		},
  		_initPaging:function(){//实现分页的dom结构


  			var me=this,
  			sClass=me.selectors.pages.substring(1);
  			me.activeClass=me.selectors.active.substring(1);
  			var pageHTML="<ul class="+sClass+">";
  			for(var i=0;i<me.pagesCount;i++){
  				pageHTML+="<li></li>";

  			} 
  			pageHTML+="</ul>";
  			me.element.append(pageHTML);

  			var pages=me.element.find(me.selectors.pages);
  			me.pageItem=pages.find("li");
  			me.pageItem.eq(me.index).addClass(me.activeClass);

  			if(me.direction){
  				pages.addClass("vertical");
  			}else{

  				pages.addClass("horizontal");
  			}

  		},
  		_initEvent:function(){//初始化插件事件

  			var me=this;
  			me.element.on('click', me.selectors.pages+" li" , function(){
  				me.index=$(this).index();
  				me._scrollPage();
  			});

  			me.element.on("mousewheel DOMMouseScroll",function(e){

            e.preventDefault();
	  			if(me.canScroll){
	  			  var delta=e.originalEvent.wheelDelta || -e.originalEvent.detail;

	  			  if(delta>0 && ( me.index && !me.settings.loop || me.settings.loop)){
	  			  	me.prev();
	  			  }else if( delta<0 &&  ( me.index <( me.pagesCount-1  ) && !me.settings.loop || me.settings.loop ) ){
	  			  	me.next();
	  			  }

    			}
  			});

  			if(me.settings.keyboard){
  				$(window).on('keydown',function(e){

  					if(me.canScroll){
    					var keyCode=e.keyCode;
    					if(keyCode==37 || keyCode==38){
    						me.prev();
    					}else if(keyCode==39 || keyCode==40){
    						me.next();
    					} 	
  					}				
  			
  				});
  			}
  			$(window).resize(function(){

  				var currentLength=me.switchLength(),
  				offset=me.settings.direction ? me.section.eq(me.index).offset().top : me.section.eq(me.index).offset().left ;

  				if(Math.abs(offset) > currentLength/2 && me.index < (me.pagesCount-1) ){
  					me.index++;
  				}
  				if(me.index){
  					me._scrollPage();
  				}
  			});

  			me.sections.on("transitionend webkitTransitionEnd oTransitionEnd otransitionend",function(){
  					
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

		    me.canScroll=false;

			 if(_prefix){
			 	me.sections.css(_prefix+"transition","all "+me.settings.duration+"ms "+me.settings.easing);
				var translate=me.direction ? "translateY(-"+dest.top+"px)" :"translateX(-"+dest.left+"px)";
			 	me.sections.css(_prefix+"transform",translate);
			 }else{
			 	var animateCss=me.direction ? {top:-dest.top} :{left:-dest.left}
			 	me.sections.animate(animateCss,me.settings.duration,function(){
			   	me.canScroll=true;	

			 		if(me.settings.callback && $.type(me.settings.callback)=='function'){
	  					me.settings.callback();
	  				}

			 	});
			 }

			 if(me.settings.pagination){
			 	me.pageItem.eq(me.index).addClass(me.activeClass).siblings("li").removeClass(me.activeClass);
			 }
		}

  	};

  	return PageSwitch;

  })();

  $.fn.PageSwitch=function(options){

  	  return this.each(function(){//返回this以便链式调用
	  	  	 var me=$(this),   //对象集合中其中当前哪个
	  	  	 instance=me.data("PageSwitch");//标记
	  	  	 if(!instance){
	  	  	 	instance=new PageSwitch(me,options);   
	  	  	 	me.data("PageSwitch",instance);//如果没有创建对象赋予其
	  	  	 }  
	  	  	 if($.type(options)==='string'){

	  	  	 	return instance[options]();
	  	  	 }
  	  });
  }
     $.fn.PageSwitch.Defaults={
       selectors:{
       	 sections:".sections",
       	 section:".section",
       	 pages:".pages",
       	 active:".active"
       },
       index:0,
       easing:"ease",
       duration:500,
       loop:false,
       pagination:true,
       keyboard:true,
       direction:'vertical',
       callback:''
     }

})(jQuery);