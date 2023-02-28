///import core
///import plugins\inserthtml.js
///commands 插入框架
///commandsName  InsertFrame
///commandsTitle  插入Iframe
///commandsDialog  dialogs\insertframe

UE.plugins['insertframe'] = function() {
    var me = this;
    function deleteIframe(){
        me._iframe && delete me._iframe;
    }

    function switchIframe(root,ineditor){
        utils.each(root.getNodesByTagName('iframe'),function(node){
            var className = node.getAttr('class');
            if(className && className.indexOf('ueditor_baidumap') != -1){
                var url = node.getAttr('src');
                if(url){
                    var index = url.indexOf("dialogs/map/show.html");
                    if(index){
                        url = url.substring(index,url.length);
                        var HOME_URL = me.options.UEDITOR_HOME_URL;
                        var BASE_URL =  me.options.UEDITOR_BASE_URL;
                        if(ineditor) {
                            node.setAttr("src", HOME_URL + (/\/$/.test(HOME_URL) ? '':'/') + url);
                        } else {
                            node.setAttr("src", BASE_URL + (/\/$/.test(BASE_URL) ? '':'/') + url);
                        }
                    }
                }
            }
        })
    }

    me.addOutputRule(function(root){
        switchIframe(root,true);
    });

    me.addInputRule(function(root){
        switchIframe(root,false);
    });

    me.addListener("selectionchange",function(){
        deleteIframe();
    });
};

