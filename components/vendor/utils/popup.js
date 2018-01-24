/*
弹出层组件
@jslover 20140817
DEMO
 $('body').popup({
   title:'提示',
   formId:'form1',
   id:'pop-1'
 });
 手动关闭
 $("#pop-1").trigger("close");
 */
(function ($) {
    //队列
    var queue = [];
    //默认值配置
    var defaults = {
        id:'',
        formId:null,
        title:"提示",
        message:"",
        cnacel:"取消",
        onCancel: function(){},
        ok:"确认",
        onOk: function(){},
        cancelOnly:false,
        okClass:'button',
        cancelClass:'button',
        onShow:function(){},
        onHide:function(){},
        closeOnOk:true,
        hideTitle:false,
        //重写样式
        popClass:''
    };
    //弹出层类
    var Popup = (function () {
        var Popup = function (containerEl, opts) {
            this.container = containerEl;
            if (!this.container) {
                this.container = document.body;
            }
            try {
                if (typeof (opts) === "string" || typeof (opts) === "number"){
                    opts = {
                        message: opts,
                        cancelOnly: "true",
                        cnacel: "取消",
                        hideTitle:true
                    };
                }
                var _this = this;
                var opts = $.extend({},defaults,opts);
                if(!opts.title){
                    opts.hideTitle = true;
                }
                if(!opts.id){
                    opts.id='popup-' + Math.floor(Math.random()*1000);
                }
                for(var k in opts){
                    _this[k] = opts[k];
                }
                queue.push(this);
                if (queue.length == 1){
                    this.show();
                }
            } catch (e) {
                console.log("配置错误：" + e);
            }

        };

        Popup.prototype = {

            show: function () {
                var _this = this;
                var markup = '<div id="' + this.id + '" class="car-popup hidden '+ this.popClass + '">';
                if(!_this.hideTitle){
                    markup += '<h4 class="alert_tt">' + this.title + '</h4>';
                }
                markup +='<div class="content-body signup_alert">' + this.message + '</div>'+
                         '<div class="button_box" style="clear:both;">'+
                             '<a href="javascript:;" class="car-popup-cancel ' + this.cancelClass + '">' + this.cnacel + '</a>'+
                             '<a href="javascript:;" class="car-popup-ok ' + this.okClass + '"  >' + this.ok + '</a>'+
                        ' </div>'+
                     '</div>';
                $(this.container).append($(markup));
                //添加外部表单
                if(this.formId){
                    var $content =  $(this.container).find('.content-body');
                    var $form = $('#'+this.formId);
                    this.$formParent = $form.parent();
                    $form.appendTo($content);
                }

                var $wrap = $("#" + this.id);
                $wrap.bind("close", function () {
                    _this.hide();
                });

                if (this.cancelOnly) {
                    $wrap.find('.car-popup-ok').hide();
                    $wrap.find('.car-popup-cancel').addClass('center');
                }
                $wrap.find('A').each(function () {
                    var button = $(this);
                    button.bind('click', function (e) {
                        if (button.hasClass('car-popup-cancel')) {
                            _this.onCancel.call(_this.onCancel, _this);
                            _this.hide();
                        } else if(button.hasClass('car-popup-ok')){
                            _this.onOk.call(_this.onOk, _this);
                            if (_this.closeOnOk)
                                _this.hide();
                        }
                        e.preventDefault();
                    });
                });
                _this.positionPopup();
                Mask.show(0.3);
                $wrap.bind("orientationchange", function () {
                    _this.positionPopup();
                });

                //force header/footer showing to fix CSS style bugs
                $wrap.find("header").show();
                $wrap.find("footer").show();
                setTimeout(function(){
                    $wrap.removeClass('hidden');
                    _this.onShow(_this);
                },50);
            },

            hide: function () {
                var _this = this;
                $('#' + _this.id).addClass('hidden');
                Mask.hide();
                _this.remove();
            },

            remove: function () {
                var _this = this;
                if(_this.onHide){
                    _this.onHide.call();
                }
                var $wrap = $("#" + _this.id);
                if(_this.formId){

                    var $form = $('#'+_this.formId);
                    $form.appendTo(_this.$formParent);
                }

                $wrap.unbind("close");
                $wrap.find('.car-popup-ok').unbind('click');
                $wrap.find('.car-popup-cancel').unbind('click');
                $wrap.unbind("orientationchange").remove();
                queue.splice(0, 1);
                if (queue.length > 0)
                    queue[0].show();
            },
            positionPopup: function () {
                var $wrap = $('#' + this.id);
                var w0 = $(window).width()||360
                    ,h0 = $(window).height()||500
                    ,w1 = $wrap[0].clientWidth||300
                    ,h1 = $wrap[0].clientHeight||100;

                $wrap.css("top", ((h0 / 2.5) + window.pageYOffset) - (h1 / 2) + "px")
                     .css("left", (w0 / 2) - (w1 / 2) + "px");
            }
        };
        return Popup;
    })();
    //遮罩类-单例
    var Mask = {
        isShow : false
        ,show:function(opacity){
            if (this.isShow){
                return;
            }
            opacity = opacity ? " style='opacity:" + opacity + ";'" : "";
            $('body').prepend($("<div id='car-pop-mask'" + opacity + "></div>"));
            $('#car-pop-mask').bind("touchstart", function (e) {
                e.preventDefault();
            }).bind("touchmove", function (e) {
                e.preventDefault();
            });
            this.isShow = true;
        }
        ,hide:function(){
            this.isShow = false;
            $('#car-pop-mask').unbind("touchstart")
                .unbind("touchmove")
                .remove();
        }
    };

    //注册到对象
    $.fn.popup = function (opts) {
        return new Popup(this[0], opts);
    };
})(Zepto);
