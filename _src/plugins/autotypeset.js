/**
 * 自动排版
 * @file
 * @since 1.2.6.1
 */

/**
 * 对当前编辑器的内容执行自动排版， 排版的行为根据config配置文件里的“autotypeset”选项进行控制。
 * @command autotypeset
 * @method execCommand
 * @param { String } cmd 命令字符串
 * @example
 * ```javascript
 * editor.execCommand( 'autotypeset' );
 * ```
 */

UE.plugins['autotypeset'] = function(){

    this.setOpt({'autotypeset': {
        mergeEmptyline: true,           //合并空行
        removeClass: true,              //去掉冗余的class
        removeEmptyline: false,         //去掉空行
        removeSpace:false,              //去掉空格
        textAlign:"left",               //段落的排版方式，可以是 left,right,center,justify 去掉这个属性表示不执行排版
        imageBlockLine: "center",       //图片的浮动方式，独占一行剧中,左右浮动，默认: center,left,right,none 去掉这个属性表示不执行排版
        removeImageSize:false,          //清除图片尺寸
        imageWidth: "",                 //图片的宽度
        pasteFilter: false,             //根据规则过滤没事粘贴进来的内容
        clearFontSize: false,           //去掉所有的内嵌字号，使用编辑器默认的字号
        clearFontFamily: false,         //去掉所有的内嵌字体，使用编辑器默认的字体
        defaultFontsize: "",            //默认字号
        defaultFontFamily: "",          //默认字体
        rowspacingtop: "",              //段前距
        rowspacingbottom: "",           //段后距
        lineheight:"",                  //行高
        removeEmptyNode: false,         // 去掉空节点
        //可以去掉的标签
        removeTagNames: utils.extend({div:1},dtd.$removeEmpty),
        indent: false,                  //行首缩进
        indentValue : '2em',            //行首缩进的大小
        bdc2sb: false,                  //全角转半角
        tobdc: false,                   //半角转全角
        hcenterh1: false,               //标题居中
        hcenterh2: false,
        hcenterh3: false,
        hcenterh4: false,
        hcenterh5: false,
        hcenterh6: false,
        captionCenter:false,            //图片后面的说明居中
    }});

    var me = this,
        opt = me.options.autotypeset,
        remainClass = {
            'selectTdClass':1,
            'pagebreak':1,
            'anchorclass':1
        },
        remainTag = {
            'li':1
        },
        tags = {
            div:1,
            p:1,
            section:1,
            //trace:2183 这些也认为是行
            blockquote:1,center:1,h1:1,h2:1,h3:1,h4:1,h5:1,h6:1,
            span:1
        },
        titleElement = {h1:1,h2:1,h3:1,h4:1,h5:1,h6:1},
        highlightCont;
    //升级了版本，但配置项目里没有autotypeset
    if(!opt){
        return;
    }

    readLocalOpts();

    function isLine(node,notEmpty){
        if(!node || node.nodeType == 3)
            return 0;
        if(domUtils.isBr(node))
            return 1;
        if(node && node.parentNode && tags[node.tagName.toLowerCase()]){
            if(highlightCont && highlightCont.contains(node)
                ||
                node.getAttribute('pagebreak')
            ){
                return 0;
            }

            return notEmpty ? !domUtils.isEmptyBlock(node) : domUtils.isEmptyBlock(node,new RegExp('[\\s'+domUtils.fillChar
                +']','g'));
        }
    }

    function removeNotAttributeSpan(node){
        if(!node.style.cssText){
            domUtils.removeAttributes(node,['style']);
            if(node.tagName.toLowerCase() == 'span' && domUtils.hasNoAttributes(node)){
                domUtils.remove(node,true);
            }
        }
    }
    function autotype(type,html){

        var me = this,cont;
        if(html){
            if(!opt.pasteFilter){
                return;
            }
            cont = me.document.createElement('div');
            cont.innerHTML = html.html;
        }else{
            cont = me.document.body;
        }
        var nodes = domUtils.getElementsByTagName(cont,'*');
        var lastImage = false;

        // 行首缩进，段落方向，段间距，段内间距
        for(var i=0,ci;ci=nodes[i++];){

            if(me.fireEvent('excludeNodeinautotype',ci) === true){
                continue;
            }
             //font-size
            if(opt.clearFontSize && ci.style.fontSize){
                domUtils.removeStyle(ci,'font-size');
                removeNotAttributeSpan(ci);
            }
            //font-family
            if(opt.clearFontFamily && ci.style.fontFamily){
                domUtils.removeStyle(ci,'font-family');
                removeNotAttributeSpan(ci);
            }

            if(isLine(ci)){
                //合并空行
                if(opt.mergeEmptyline ){
                    var next = ci.nextSibling,tmpNode,isBr = domUtils.isBr(ci);
                    while(isLine(next)){
                        tmpNode = next;
                        next = tmpNode.nextSibling;
                        if(isBr && (!next || next && !domUtils.isBr(next))){
                            break;
                        }
                        domUtils.remove(tmpNode);
                    }
                }
                 //去掉空行，保留占位的空行
                if(opt.removeEmptyline && domUtils.inDoc(ci,cont) && !remainTag[ci.parentNode.tagName.toLowerCase()] ){
                    if(domUtils.isBr(ci)){
                        next = ci.nextSibling;
                        if(next && !domUtils.isBr(next)){
                            continue;
                        }
                    }
                    domUtils.remove(ci);
                    continue;
                }
            }
            if(isLine(ci,true) && ci.tagName != 'SPAN'){
                if(opt.defaultFontsize && !ci.style.fontSize){
                    ci.style.fontSize = opt.defaultFontsize + 'px';
                }
                if(opt.defaultFontFamily && !ci.style.fontFamily){
                    ci.style.fontFamily	 = opt.defaultFontFamily;
                }
                if(opt.indent){
                    ci.style.textIndent = opt.indentValue;
                }
                if(opt.textAlign){
                    ci.style.textAlign = opt.textAlign;
                }
                if(opt.captionCenter && ci.tagName=='P' && lastImage){
                    ci.style.textAlign = "center";
                }
                if(titleElement[ci.tagName.toLowerCase()] && opt["hcenter"+ci.tagName.toLowerCase()]){
                    ci.style.textAlign = "center";
                }
                if(opt.lineheight){
                    ci.style.lineHeight = (opt.lineheight == "1" ? "normal" : opt.lineheight + 'em') ;
                }
                if(opt.rowspacingtop){
                    ci.style.marginTop = opt.rowspacingtop+ 'px';
                }
                if(opt.rowspacingbottom){
                    ci.style.marginBottom = opt.rowspacingbottom+ 'px';
                }
            }

            //去掉class,保留的class不去掉
            if(opt.removeClass && ci.className && !remainClass[ci.className.toLowerCase()]){
                if(highlightCont && highlightCont.contains(ci)){
                     continue;
                }
                domUtils.removeAttributes(ci,['class']);
            }
            if(ci.tagName.toLowerCase() == 'img' && !ci.getAttribute('emotion') && !ci.getAttribute('word_img') && -1==ci.className.indexOf("anchorclass")){
                lastImage = true;
                //清理宽度高度
                if(opt.removeImageSize){
                    domUtils.removeStyle(ci,'width');
                    domUtils.removeStyle(ci,'height');
                    domUtils.removeAttributes(ci,['width','height']);
                }

                //图片宽度设定
                if(opt.imageWidth && !domUtils.getStyle(ci,'width')){
                    var img = ci;
                    if(img.width > opt.imageWidth){
                        domUtils.setStyle(img,'width',opt.imageWidth+'px');
                        domUtils.setStyle(img,'height','auto');
                    }
                }
            } else {
                lastImage = false;
            }
            //表情不处理
            if(opt.imageBlockLine && ci.tagName.toLowerCase() == 'img' && !ci.getAttribute('emotion') && -1==ci.className.indexOf("anchorclass") ){
                if(html){
                    var img = ci;
                    switch (opt.imageBlockLine){
                        case 'left':
                        case 'right':
                        case 'none':
                            var pN = img.parentNode,tmpNode,pre,next;
                            while(dtd.$inline[pN.tagName] || pN.tagName == 'A'){
                                pN = pN.parentNode;
                            }
                            tmpNode = pN;
                            if(tmpNode.tagName == 'P' && domUtils.getStyle(tmpNode,'text-align') == 'center'){
                                if(!domUtils.isBody(tmpNode) && domUtils.getChildCount(tmpNode,function(node){return !domUtils.isBr(node) && !domUtils.isWhitespace(node)}) == 1){
                                    pre = tmpNode.previousSibling;
                                    next = tmpNode.nextSibling;
                                    if(pre && next && pre.nodeType == 1 &&  next.nodeType == 1 && pre.tagName == next.tagName && domUtils.isBlockElm(pre)){
                                        pre.appendChild(tmpNode.firstChild);
                                        while(next.firstChild){
                                            pre.appendChild(next.firstChild);
                                        }
                                        domUtils.remove(tmpNode);
                                        domUtils.remove(next);
                                    }else{
                                        domUtils.setStyle(tmpNode,'text-align','');
                                    }
                                }
                            }
                            domUtils.setStyle(img,'float', opt.imageBlockLine);
                            break;
                        case 'center':
                            if(me.queryCommandValue('imagefloat') != 'center'){
                                pN = img.parentNode;
                                domUtils.setStyle(img,'float','none');
                                tmpNode = img;
                                while(pN && domUtils.getChildCount(pN,function(node){return !domUtils.isBr(node) && !domUtils.isWhitespace(node)}) == 1
                                    && (dtd.$inline[pN.tagName] || pN.tagName == 'A')){
                                    tmpNode = pN;
                                    pN = pN.parentNode;
                                }
                                var pNode = me.document.createElement('p');
                                domUtils.setAttributes(pNode,{
                                    style:'text-align:center'
                                });
                                tmpNode.parentNode.insertBefore(pNode,tmpNode);
                                pNode.appendChild(tmpNode);
                                domUtils.setStyle(tmpNode,'float','');
                            }
                    }
                } else {
                    var range = me.selection.getRange();
                    range.selectNode(ci).select();
                    me.execCommand('imagefloat', opt.imageBlockLine);
                }

            }

            //去掉冗余的标签
            if(opt.removeEmptyNode){
                if(opt.removeTagNames[ci.tagName.toLowerCase()] && domUtils.hasNoAttributes(ci) && domUtils.isEmptyBlock(ci)){
                    domUtils.remove(ci);
                }
            }
        }
        //去掉空格
        if(opt.removeSpace ){
            var root = UE.htmlparser(cont.innerHTML);
            root.traversal(function(node){
                if(node.type == 'text'){
                    node.data = node.data.replace(/ /g,'').replace(/&nbsp;/ig,'');
                }
            });
            cont.innerHTML = root.toHtml()
        }
        if(opt.tobdc){
            var root = UE.htmlparser(cont.innerHTML);
            root.traversal(function(node){
                if(node.type == 'text'){
                    node.data = ToDBC(node.data)
                }
            });
            cont.innerHTML = root.toHtml()
        }
        if(opt.bdc2sb){
            var root = UE.htmlparser(cont.innerHTML);
            root.traversal(function(node){
                if(node.type == 'text'){
                    node.data = DBC2SB(node.data)
                }
            });
            cont.innerHTML = root.toHtml()
        }
        if(html){
            html.html = cont.innerHTML;
        }
    }
    if(opt.pasteFilter){
        me.addListener('beforepaste',autotype);
    }

    function DBC2SB(str) {
        var result = '';
        for (var i = 0; i < str.length; i++) {
            var code = str.charCodeAt(i); //获取当前字符的unicode编码
            if (code >= 65281 && code <= 65373)//在这个unicode编码范围中的是所有的英文字母已经各种字符
            {
                result += String.fromCharCode(str.charCodeAt(i) - 65248); //把全角字符的unicode编码转换为对应半角字符的unicode码
            } else if (code == 12288)//空格
            {
                result += String.fromCharCode(str.charCodeAt(i) - 12288 + 32);
            } else {
                result += str.charAt(i);
            }
        }
        return result;
    }
    function ToDBC(txtstring) {
        txtstring = utils.html(txtstring);
        var tmp = "";
        var mark = "";/*用于判断,如果是html尖括里的标记,则不进行全角的转换*/
        for (var i = 0; i < txtstring.length; i++) {
            if (txtstring.charCodeAt(i) == 32) {
                tmp = tmp + String.fromCharCode(12288);
            }
            else if (txtstring.charCodeAt(i) < 127) {
                tmp = tmp + String.fromCharCode(txtstring.charCodeAt(i) + 65248);
            }
            else {
                tmp += txtstring.charAt(i);
            }
        }
        return tmp;
    }

    function readLocalOpts() {
        var cookieOpt = me.getPreferences('autotypeset');
        utils.extend(me.options.autotypeset, cookieOpt);
    }

    me.commands['autotypeset'] = {
        execCommand:function () {
            me.removeListener('beforepaste',autotype);
            if(opt.pasteFilter){
                me.addListener('beforepaste',autotype);
            }
            autotype.call(me)
        }

    };

};

