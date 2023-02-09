/**
 * video插件， 为UEditor提供视频插入支持
 * @file
 * @since 1.2.6.1
 */

UE.plugins['video'] = function (){
    var me =this;

    /**
     * 创建插入视频字符窜
     * @param url 视频地址
     * @param width 视频宽度
     * @param height 视频高度
     * @param align 视频对齐
     * @param poster 封面图
     * @param classname  css类名
     * @param type  类型支持video、embed
     */
    function creatInsertStr(url,width,height,id,align,poster,classname,type){

        url = utils.unhtmlForUrl(url);
        poster = utils.unhtmlForUrl(poster);
        align = utils.unhtml(align);
        classname = utils.unhtml(classname);

        width = parseInt(width, 10) || 0;
        height = parseInt(height, 10) || 0;

        var str;
        switch (type){
            case 'image':
                str = '<img ' + (id ? 'id="' + id+'"' : '') + (poster ? ' poster="' + poster + '"': '') +  ' width="'+ width +'" height="' + height + '" _url="'+url+'" class="' + classname.replace(/\bvideo-js\b/, '') + '"'  +
                    ' src="' + me.options.UEDITOR_HOME_URL+'themes/default/images/spacer.gif" style="background-image:url('+me.options.UEDITOR_HOME_URL+'themes/default/images/videologo.gif)'+(poster ? ' ,url(' + poster + ')': '')+';background-repeat:no-repeat,no-repeat;background-position: center center,center center;background-size: auto,contain;border:1px solid gray;'+(align ? 'float:' + align + ';': '')+'" />'
                break;
            case 'embed':
                str = '<embed type="application/x-shockwave-flash" class="' + classname + '" pluginspage="http://www.macromedia.com/go/getflashplayer"' +
                    ' src="' +  utils.html(url) + '" width="' + width  + '" height="' + height  + '"'  + (align ? ' style="float:' + align + '"': '') + (poster ? ' poster="' + poster + '"': '') +
                    ' wmode="transparent" play="true" loop="false" menu="false" allowscriptaccess="never" allowfullscreen="true" >';
                break;
            case 'video':
                var ext = url.substr(url.lastIndexOf('.') + 1);
                if(ext == 'ogv') ext = 'ogg';
                if('mp3'==ext || 'mid' == ext){
                  str = '<audio' + (id ? ' id="' + id + '"' : '') + ' class="' + classname + ' video-js" ' + (align ? ' style="float:' + align + '"': '') +
                    ' controls preload="none" src="' + url + '">" /></audio>';
                }else{
                  str = '<video' + (id ? ' id="' + id + '"' : '') + ' class="' + classname + ' video-js" ' + (align ? ' style="float:' + align + '"': '') + (poster ? ' poster="' + poster + '"': '') +
                    ' controls preload="none" width="' + width + '" height="' + height + '" src="' + url + '" data-setup="{}">' +
                    '<source src="' + url + '" type="video/' + ext + '" /></video>';
                }
                break;
        }
        return str;
    }

    function switchImgAndVideo(root,img2video){
        utils.each(root.getNodesByTagName(img2video ? 'img' : 'embed video audio'),function(node){
            var className = node.getAttr('class');
            if(className && className.indexOf('edui-faked-video') != -1){
                var html = creatInsertStr( img2video ? node.getAttr('_url') : node.getAttr('src'),node.getAttr('width'),node.getAttr('height'),null,node.getStyle('float') || '',node.getAttr('poster'),className,img2video ? 'embed':'image');
                node.parentNode.replaceChild(UE.uNode.createElement(html),node);
            }
            if(className && className.indexOf('edui-upload-video') != -1){
                var html = creatInsertStr( img2video ? node.getAttr('_url') : node.getAttr('src'),node.getAttr('width'),node.getAttr('height'),null,node.getStyle('float') || '',node.getAttr('poster'),className,img2video ? 'video':'image');
                node.parentNode.replaceChild(UE.uNode.createElement(html),node);
            }
        })
    }

    me.addOutputRule(function(root){
        switchImgAndVideo(root,true)
    });
    me.addInputRule(function(root){
        switchImgAndVideo(root)
    });

    /**
     * 插入视频
     * @command insertvideo
     * @method execCommand
     * @param { String } cmd 命令字符串
     * @param { Object } videoAttr 键值对对象， 描述一个视频的所有属性
     * @example
     * ```javascript
     *
     * var videoAttr = {
     *      //视频地址
     *      url: 'http://www.youku.com/xxx',
     *      //视频宽高值， 单位px
     *      width: 200,
     *      height: 100,
     *      poster: 'http://www.youku.com/xxx'
     * };
     *
     * //editor 是编辑器实例
     * //向编辑器插入单个视频
     * editor.execCommand( 'insertvideo', videoAttr );
     * ```
     */

    /**
     * 插入视频
     * @command insertvideo
     * @method execCommand
     * @param { String } cmd 命令字符串
     * @param { Array } videoArr 需要插入的视频的数组， 其中的每一个元素都是一个键值对对象， 描述了一个视频的所有属性
     * @example
     * ```javascript
     *
     * var videoAttr1 = {
     *      //视频地址
     *      url: 'http://www.youku.com/xxx',
     *      //视频宽高值， 单位px
     *      width: 200,
     *      height: 100,
     *      poster: 'http://www.youku.com/xxx'
     * },
     * videoAttr2 = {
     *      //视频地址
     *      url: 'http://www.youku.com/xxx',
     *      //视频宽高值， 单位px
     *      width: 200,
     *      height: 100,
     *      poster: 'http://www.youku.com/xxx'
     * }
     *
     * //editor 是编辑器实例
     * //该方法将会向编辑器内插入两个视频
     * editor.execCommand( 'insertvideo', [ videoAttr1, videoAttr2 ] );
     * ```
     */

    /**
     * 查询当前光标所在处是否是一个视频
     * @command insertvideo
     * @method queryCommandState
     * @param { String } cmd 需要查询的命令字符串
     * @return { int } 如果当前光标所在处的元素是一个视频对象， 则返回1，否则返回0
     * @example
     * ```javascript
     *
     * //editor 是编辑器实例
     * editor.queryCommandState( 'insertvideo' );
     * ```
     */
    me.commands["insertvideo"] = {
        execCommand: function (cmd, videoObjs, type){
            videoObjs = utils.isArray(videoObjs)?videoObjs:[videoObjs];
            var html = [],id = 'tmpVedio', cl;
            for(var i=0,vi,len = videoObjs.length;i<len;i++){
                vi = videoObjs[i];
                cl = (type == 'upload' ? 'edui-upload-video video-js':'edui-faked-video');
                html.push(creatInsertStr( vi.url, vi.width || 600,  vi.height || 400, id + i, null, vi.poster , cl, 'image'));
            }
            me.execCommand("inserthtml",html.join(""),true);
            var rng = this.selection.getRange();
            for(var i= 0,len=videoObjs.length;i<len;i++){
                var img = this.document.getElementById('tmpVedio'+i);
                domUtils.removeAttributes(img,'id');
                rng.selectNode(img).select();
                me.execCommand('imagefloat',videoObjs[i].align)
            }
        },
        queryCommandState : function(){
            var img = me.selection.getRange().getClosedNode(),
                flag = img && (img.className == "edui-faked-video" || img.className.indexOf("edui-upload-video")!=-1);
            return flag ? 1 : 0;
        }
    };
};
