///import core
///commands 远程图片抓取
///commandsName  catchRemoteImage,catchremoteimageenable
///commandsTitle  远程图片抓取
/**
 * 远程图片抓取,当开启本插件时所有不符合本地域名的图片都将被抓取成为本地服务器上的图片
 */
UE.plugins['catchremoteimage'] = function () {
    var me = this,
        ajax = UE.ajax;
    function test(src, urls) {
        if (src.indexOf(location.host) != -1 || /(^\.)|(^\/)/.test(src)) {
            return true;
        }
        if (urls) {
            for (var j = 0, url; url = urls[j++];) {
                if (src.indexOf(url) !== -1) {
                    return true;
                }
            }
        }
        return false;
    };
    /* 设置默认值 */
    me.addListener("afterpaste", function () {
        me.fireEvent("catchRemoteImage");
    });

    me.addListener("catchRemoteImage", function () {
        if(false !== me.options.catchRemoteImageEnable){
            var catcherLocalDomain = me.getOpt('catcherLocalDomain'),
                catcherActionUrl = me.getActionUrl(me.getOpt('catcherActionName')),
                catcherUrlPrefix = me.getOpt('catcherUrlPrefix'),
                catcherFieldName = me.getOpt('catcherFieldName');

            var remoteImages = [],
                loadingIMG =  me.options.themePath + me.options.theme + '/images/spacer.gif',
                imgs = me.document.querySelectorAll('[style*="url"],img');

            for (var i = 0, ci; ci = imgs[i++];) {
                if (ci.getAttribute("word_img")) {
                    continue;
                }
                if(ci.nodeName == "IMG"){
                    var src = ci.getAttribute("_src") || ci.src || "";
                    if ((/^(https?|ftp):/i.test(src) || /^\/\//i.test(src)) && !test(src, catcherLocalDomain) && src.indexOf(catcherUrlPrefix) === -1) {
                        remoteImages.push(src);
                        // 添加上传时的uploading动画
                        domUtils.setAttributes(ci, {
                            class: "loadingclass",
                            _src: src,
                            src: loadingIMG
                        })
                    }
                } else {
                    // 获取背景图片url
                    var backgroundImageurl = ci.style.cssText.replace(/.*\s?url\([\'\"]?/, '').replace(/[\'\"]?\).*/, '');
                    if ((/^(https?|ftp):/i.test(backgroundImageurl) || /^\/\//i.test(backgroundImageurl)) && !test(backgroundImageurl, catcherLocalDomain) && src.indexOf(catcherUrlPrefix) === -1) {
                        remoteImages.push(backgroundImageurl);
                        ci.style.cssText = ci.style.cssText.replace(backgroundImageurl, loadingIMG);
                        domUtils.setAttributes(ci, {
                            "data-background": backgroundImageurl
                        })
                    }
                }
            }

            if (remoteImages.length) {
                catchremoteimage(remoteImages, {
                    //成功抓取
                    success: function (r) {
                        try {
                            var info = r.state !== undefined ? r:eval("(" + r.responseText + ")");
                        } catch (e) {
                            return;
                        }

                        /* 获取源路径和新路径 */
                        var i, j, ci, cj, oldSrc, newSrc, list = info.list;

                        /* 抓取失败统计 */
                        var catchFailList = [];
                        /* 抓取成功统计 */
                        var catchSuccessList = [];
                        /* 抓取失败时显示的图片 */
                        var failIMG = me.options.themePath + me.options.theme + '/images/img-cracked.png';
                        for (i = 0; ci = imgs[i++];) {
                            oldSrc = ci.getAttribute("_src") || ci.src || "";
                            oldBgIMG = ci.getAttribute("data-background") || "";
                            for (j = 0; cj = list[j++];) {
                                if (oldSrc == cj.source && cj.state == "SUCCESS") {
                                    newSrc = catcherUrlPrefix + cj.url;
                                    // 上传成功是删除uploading动画
                                    domUtils.removeClasses( ci, "loadingclass" );
                                    domUtils.setAttributes(ci, {
                                        "src": newSrc,
                                        "_src": newSrc,
                                        "data-catchResult":"img_catchSuccess"   // 添加catch成功标记
                                    });
                                    catchSuccessList.push(ci);
                                    break;
                                } else if (oldSrc == cj.source && cj.state == "FAIL") {
                                    // 替换成统一的失败图片
                                    domUtils.removeClasses( ci, "loadingclass" );
                                    domUtils.setAttributes(ci, {
                                        "src": failIMG,
                                        "_src": oldSrc,
                                        "data-catchResult":"img_catchFail" // 添加catch失败标记
                                    });
                                    catchFailList.push(ci);
                                    break;
                                } else if (oldBgIMG == cj.source && cj.state == "SUCCESS") {
                                    newBgIMG = catcherUrlPrefix + cj.url;
                                    ci.style.cssText = ci.style.cssText.replace(loadingIMG, newBgIMG);
                                    domUtils.removeAttributes(ci,"data-background");
                                    domUtils.setAttributes(ci, {
                                        "data-catchResult":"img_catchSuccess"   // 添加catch成功标记
                                    });
                                    catchSuccessList.push(ci);
                                    break;
                                } else if (oldBgIMG == cj.source && cj.state == "FAIL"){
                                    ci.style.cssText = ci.style.cssText.replace(loadingIMG, failIMG);
                                    domUtils.setAttributes(ci, {
                                        "data-catchResult":"img_catchFail"   // 添加catch失败标记
                                    });
                                    catchFailList.push(ci);
                                    break;
                                }
                            }
                        }
                        me.fireEvent('catchremotesuccess')
                    },
                    //回调失败，本次请求超时
                    error: function () {
                        me.fireEvent("catchremoteerror");
                    }
                });
            }

            function catchremoteimage(imgs, callbacks) {
                var params = utils.serializeParam(me.queryCommandValue('serverparam')) || '',
                    url = utils.formatUrl(catcherActionUrl + (catcherActionUrl.indexOf('?') == -1 ? '?':'&') + params),
                    isJsonp = utils.isCrossDomainUrl(url),
                    opt = {
                        'method': 'POST',
                        'dataType': isJsonp ? 'jsonp':'',
                        'timeout': 60000, //单位：毫秒，回调请求超时设置。目标用户如果网速不是很快的话此处建议设置一个较大的数值
                        'onsuccess': callbacks["success"],
                        'onerror': callbacks["error"]
                    };
                opt[catcherFieldName] = imgs;
                ajax.request(url, opt);
            }
        }
    });

    me.commands['catchremoteimage'] = {
        execCommand:function () {
            me.fireEvent("catchRemoteImage");
        },
        queryCommandState : function() {
            var opt = me.options;
            if(false !== opt.catchRemoteImageEnable){
                var imgs = me.document.querySelectorAll('[style*="url"],img');
                for (var i = 0, ci; ci = imgs[i++];) {
                    if (ci.getAttribute("word_img") || ci.className.indexOf("loadingclass")!=-1 || ci.getAttribute("data-background")) {
                        continue;
                    }
                    if(ci.nodeName == "IMG"){
                        var src = ci.getAttribute("_src") || ci.src || "";
                        if ((/^(https?|ftp):/i.test(src) || /^\/\//i.test(src)) && !test(src, opt.catcherLocalDomain) && src.indexOf(opt.catcherUrlPrefix) === -1) {
                            return 0;
                        }
                    } else {
                        // 获取背景图片url
                        var backgroundImageurl = ci.style.cssText.replace(/.*\s?url\([\'\"]?/, '').replace(/[\'\"]?\).*/, '');
                        if ((/^(https?|ftp):/i.test(backgroundImageurl) || /^\/\//i.test(backgroundImageurl)) && !test(backgroundImageurl, opt.catcherLocalDomain) && src.indexOf(opt.catcherUrlPrefix) === -1) {
                            return 0;
                        }
                    }
                }
            }
            return -1;
        }
    };
};