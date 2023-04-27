///import core
///import plugins/inserthtml.js
///import plugins/undo.js
///import plugins/serialize.js
///commands 粘贴
///commandsName  PastePlain
///commandsTitle  纯文本粘贴模式
/**
 * @description 粘贴
 * @author zhanyi
 */
UE.plugins['paste'] = function () {
    function getClipboardData(callback) {
        var doc = this.document;
        if (doc.getElementById('baidu_pastebin')) {
            return;
        }
        var range = this.selection.getRange(),
            bk = range.createBookmark(),
        //创建剪贴的容器div
            pastebin = doc.createElement('div');
        pastebin.id = 'baidu_pastebin';
        // Safari 要求div必须有内容，才能粘贴内容进来
        browser.webkit && pastebin.appendChild(doc.createTextNode(domUtils.fillChar + domUtils.fillChar));
        doc.body.appendChild(pastebin);
        //trace:717 隐藏的span不能得到top
        //bk.start.innerHTML = '&nbsp;';
        bk.start.style.display = '';
        pastebin.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;left:-1000px;white-space:nowrap;top:" +
            //要在现在光标平行的位置加入，否则会出现跳动的问题
            domUtils.getXY(bk.start).y + 'px';

        range.selectNodeContents(pastebin).select(true);

        setTimeout(function () {
            if (browser.webkit) {
                for (var i = 0, pastebins = doc.querySelectorAll('#baidu_pastebin'), pi; pi = pastebins[i++];) {
                    if (domUtils.isEmptyNode(pi)) {
                        domUtils.remove(pi);
                    } else {
                        pastebin = pi;
                        break;
                    }
                }
            }
            try {
                pastebin.parentNode.removeChild(pastebin);
            } catch (e) {
            }
            range.moveToBookmark(bk).select(true);
            callback(pastebin);
        }, 0);
    }

    var me = this;

    me.setOpt({
        retainOnlyLabelPasted : false
    });

    var txtContent, htmlContent, address;

    function getPureHtml(html){
        return html.replace(/<(\/?)([\w\-]+)([^>]*)>/gi, function (a, b, tagName, attrs) {
            tagName = tagName.toLowerCase();
            if ({img: 1}[tagName]) {
                return a;
            }
            attrs = attrs.replace(/([\w\-]*?)\s*=\s*(("([^"]*)")|('([^']*)')|([^\s>]+))/gi, function (str, atr, val) {
                if ({
                    'src': 1,
                    'href': 1,
                    'name': 1
                }[atr.toLowerCase()]) {
                    return atr + '=' + val + ' '
                }
                return ''
            });
            if ({
                'span': 1,
                'div': 1
            }[tagName]) {
                return ''
            } else {

                return '<' + b + tagName + ' ' + utils.trim(attrs) + '>'
            }

        });
    }
    function filter(div) {
        var html;
        if (div.firstChild) {
            //去掉cut中添加的边界值
            var nodes = domUtils.getElementsByTagName(div, 'span');
            for (var i = 0, ni; ni = nodes[i++];) {
                if (ni.id == '_baidu_cut_start' || ni.id == '_baidu_cut_end') {
                    domUtils.remove(ni);
                }
            }

            if (browser.webkit) {

                var brs = div.querySelectorAll('div br');
                for (var i = 0, bi; bi = brs[i++];) {
                    var pN = bi.parentNode;
                    if (pN.tagName == 'DIV' && pN.childNodes.length == 1) {
                        pN.innerHTML = '<p><br/></p>';
                        domUtils.remove(pN);
                    }
                }
                var divs = div.querySelectorAll('#baidu_pastebin');
                for (var i = 0, di; di = divs[i++];) {
                    var tmpP = me.document.createElement('p');
                    di.parentNode.insertBefore(tmpP, di);
                    while (di.firstChild) {
                        tmpP.appendChild(di.firstChild);
                    }
                    domUtils.remove(di);
                }

                var metas = div.querySelectorAll('meta');
                for (var i = 0, ci; ci = metas[i++];) {
                    domUtils.remove(ci);
                }

                var brs = div.querySelectorAll('br');
                for (i = 0; ci = brs[i++];) {
                    if (/^apple-/i.test(ci.className)) {
                        domUtils.remove(ci);
                    }
                }
            }
            if (browser.gecko) {
                var dirtyNodes = div.querySelectorAll('[_moz_dirty]');
                for (i = 0; ci = dirtyNodes[i++];) {
                    ci.removeAttribute('_moz_dirty');
                }
            }
            if (!browser.ie) {
                var spans = div.querySelectorAll('span.Apple-style-span');
                for (var i = 0, ci; ci = spans[i++];) {
                    domUtils.remove(ci, true);
                }
            }

            //ie下使用innerHTML会产生多余的\r\n字符，也会产生&nbsp;这里过滤掉
            html = div.innerHTML;//.replace(/>(?:(\s|&nbsp;)*?)</g,'><');

            //过滤word粘贴过来的冗余属性
            html = UE.filterWord(html);
            //取消了忽略空白的第二个参数，粘贴过来的有些是有空白的，会被套上相关的标签
            var root = UE.htmlparser(html);
            //如果给了过滤规则就先进行过滤
            if (me.options.filterRules) {
                UE.filterNode(root, me.options.filterRules);
            }
            //执行默认的处理
            me.filterInputRule(root);
            //针对chrome的处理
            if (browser.webkit) {
                var br = root.lastChild();
                if (br && br.type == 'element' && br.tagName == 'br') {
                    root.removeChild(br)
                }
                utils.each(me.body.querySelectorAll('div'), function (node) {
                    if (domUtils.isEmptyBlock(node)) {
                        domUtils.remove(node,true)
                    }
                })
            }
            html = {'html': root.toHtml()};
            me.fireEvent('beforepaste', html, root);
            //抢了默认的粘贴，那后边的内容就不执行了，比如表格粘贴
            if(!html.html){
                return;
            }
            root = UE.htmlparser(html.html,true);
            //如果开启了纯文本模式
            if (me.queryCommandState('pasteplain') === 1) {
                me.execCommand('insertHtml', UE.filterNode(root, me.options.filterTxtRules).toHtml(), true);
            } else {
                //文本模式
                UE.filterNode(root, me.options.filterTxtRules);
                txtContent = root.toHtml();
                //完全模式
                htmlContent = html.html;

                address = me.selection.getRange().createAddress(true);
                me.execCommand('insertHtml', me.getOpt('retainOnlyLabelPasted') === true ?  getPureHtml(htmlContent) : htmlContent, true);
            }
            me.fireEvent("afterpaste", html);
        }
    }
    function extractFromRtf( rtfContent ) {
        var ret = [],
            rePictureHeader = /\{\\pict[\s\S]+?\\bliptag\-?\d+(\\blipupi\-?\d+)?(\{\\\*\\blipuid\s?[\da-fA-F]+)?[\s\}]*?/,
            wpsPictureHeader = /\{\\pict[\s\S]+?(gblip|metafile\d+)\s+(\{\\\*\\blipuid\s+[\da-fA-F]+)?\}+?/,
            rePicture = new RegExp( '(?:(' + rePictureHeader.source + '))([\\da-fA-F\\s]+)\\}', 'g' ),
            wpsPicture = new RegExp( '(?:(' + wpsPictureHeader.source + '))([\\da-fA-F]+)\\}', 'g' ),
            wholeImages,
            imageType;

        wholeImages = rtfContent.match( rePicture );
        if ( !wholeImages ) {
            wholeImages = rtfContent.match( wpsPicture );
            if(!wholeImages){
                return ret;
            }
            for ( var i = 0; i < wholeImages.length; i++ ) {
                if ( wpsPictureHeader.test( wholeImages[ i ] ) ) {
                    if ( wholeImages[ i ].indexOf( '\\pngblip' ) !== -1 ) {
                        imageType = 'image/png';
                    } else if ( wholeImages[ i ].indexOf( '\\jpegblip' ) !== -1 ) {
                        imageType = 'image/jpeg';
                    } else {
                        continue;
                    }

                    ret.push( {
                        hex: imageType ? wholeImages[ i ].replace( wpsPictureHeader, '' ).replace( /[^\da-fA-F]/g, '' ) : null,
                        type: imageType
                    } );
                }
            }
            return ret;
        }

        for ( var i = 0; i < wholeImages.length; i++ ) {
            if ( rePictureHeader.test( wholeImages[ i ] ) ) {
                if ( wholeImages[ i ].indexOf( '\\pngblip' ) !== -1 ) {
                    imageType = 'image/png';
                } else if ( wholeImages[ i ].indexOf( '\\jpegblip' ) !== -1 ) {
                    imageType = 'image/jpeg';
                } else {
                    continue;
                }

                ret.push( {
                    hex: imageType ? wholeImages[ i ].replace( rePictureHeader, '' ).replace( /[^\da-fA-F]/g, '' ) : null,
                    type: imageType
                } );
            }
        }
        return ret;
    }
    function convertHexStringToBytes( hexString ) {
        var bytesArray = [],
            bytesArrayLength = hexString.length / 2,
            i;
        for ( i = 0; i < bytesArrayLength; i++ ) {
            bytesArray.push( parseInt( hexString.substr( i * 2, 2 ), 16 ) );
        }
        return bytesArray;
    }
    function convertBytesToBase64( bytesArray ) {
        var base64characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
            base64string = '',
            bytesArrayLength = bytesArray.length,
            i;

        for ( i = 0; i < bytesArrayLength; i += 3 ) {
            var array3 = bytesArray.slice( i, i + 3 ),
                array3length = array3.length,
                array4 = [],
                j;

            if ( array3length < 3 ) {
                for ( j = array3length; j < 3; j++ ) {
                    array3[ j ] = 0;
                }
            }

            array4[ 0 ] = ( array3[ 0 ] & 0xFC ) >> 2;
            array4[ 1 ] = ( ( array3[ 0 ] & 0x03 ) << 4 ) | ( array3[ 1 ] >> 4 );
            array4[ 2 ] = ( ( array3[ 1 ] & 0x0F ) << 2 ) | ( ( array3[ 2 ] & 0xC0 ) >> 6 );
            array4[ 3 ] = array3[ 2 ] & 0x3F;

            for ( j = 0; j < 4; j++ ) {
                if ( j <= array3length ) {
                    base64string += base64characters.charAt( array4[ j ] );
                } else {
                    base64string += '=';
                }
            }

        }
        return base64string;
    }
    function createSrcWithBase64( img ) {
                return img.type ? 'data:' + img.type + ';base64,' + convertBytesToBase64( convertHexStringToBytes( img.hex ) ) : null;
    }
    me.addListener('pasteTransfer', function (cmd, plainType) {

        if (address && txtContent && htmlContent && txtContent != htmlContent) {
            var range = me.selection.getRange();
            range.moveToAddress(address, true);

            if (!range.collapsed) {

                while (!domUtils.isBody(range.startContainer)
                    ) {
                    var start = range.startContainer;
                    if(start.nodeType == 1){
                        start = start.childNodes[range.startOffset];
                        if(!start){
                            range.setStartBefore(range.startContainer);
                            continue;
                        }
                        var pre = start.previousSibling;

                        if(pre && pre.nodeType == 3 && new RegExp('^[\n\r\t '+domUtils.fillChar+']*$').test(pre.nodeValue)){
                            range.setStartBefore(pre)
                        }
                    }
                    if(range.startOffset == 0){
                        range.setStartBefore(range.startContainer);
                    }else{
                        break;
                    }

                }
                while (!domUtils.isBody(range.endContainer)
                    ) {
                    var end = range.endContainer;
                    if(end.nodeType == 1){
                        end = end.childNodes[range.endOffset];
                        if(!end){
                            range.setEndAfter(range.endContainer);
                            continue;
                        }
                        var next = end.nextSibling;
                        if(next && next.nodeType == 3 && new RegExp('^[\n\r\t'+domUtils.fillChar+']*$').test(next.nodeValue)){
                            range.setEndAfter(next)
                        }
                    }
                    if(range.endOffset == range.endContainer[range.endContainer.nodeType == 3 ? 'nodeValue' : 'childNodes'].length){
                        range.setEndAfter(range.endContainer);
                    }else{
                        break;
                    }

                }

            }

            range.deleteContents();
            range.select(true);
            me.__hasEnterExecCommand = true;
            var html = htmlContent;
            if (plainType === 2 ) {
                html = getPureHtml(html);
            } else if (plainType) {
                html = txtContent;
            }
            me.execCommand('inserthtml', html, true);
            me.__hasEnterExecCommand = false;
            var rng = me.selection.getRange();
            while (!domUtils.isBody(rng.startContainer) && !rng.startOffset &&
                rng.startContainer[rng.startContainer.nodeType == 3 ? 'nodeValue' : 'childNodes'].length
                ) {
                rng.setStartBefore(rng.startContainer);
            }
            var tmpAddress = rng.createAddress(true);
            address.endAddress = tmpAddress.startAddress;
        }
    });

    me.addListener('ready', function () {
        domUtils.on(me.body, 'cut', function () {
            var range = me.selection.getRange();
            if (!range.collapsed && me.undoManger) {
                me.undoManger.save();
            }
        });

        //ie下beforepaste在点击右键时也会触发，所以用监控键盘才处理
        domUtils.on(me.body, browser.ie || browser.opera ? 'keydown' : 'paste', function (e) {
            if ((browser.ie || browser.opera) && ((!e.ctrlKey && !e.metaKey) || e.keyCode != '86')) {
                return;
            }
            var clipboardData = e.clipboardData;
            var rtfContent;
            if(-1 < clipboardData.types.indexOf('text/rtf') ) {
                rtfContent = clipboardData.getData('text/rtf');
            }
            getClipboardData.call(me, function (div) {
                div.innerHTML = UE.filterWord(div.innerHTML);
                var wordImages=[];
                utils.each(domUtils.getElementsByTagName(div, "img"), function (img) {
                    if (img.getAttribute('src') && img.getAttribute('src').indexOf( 'file://' ) === 0  ) {
                        wordImages.push(img);
                    }
                });
                if(0 < wordImages.length && rtfContent){
                    var hexImages = extractFromRtf( rtfContent );
                    if ( wordImages.length === hexImages.length ) {
                        for ( i = 0; i < wordImages.length; i++ ) {
                            wordImages[i].setAttribute('src', createSrcWithBase64( hexImages[i] ));
                        }
                    }
                }
                filter(div);
            });
        });

    });

    me.commands['paste'] = {
        execCommand: function (cmd) {
            if (browser.ie) {
                getClipboardData.call(me, function (div) {
                    filter(div);
                });
                me.document.execCommand('paste');
            } else {
                alert(me.getLang('pastemsg'));
            }
        }
    }
};

