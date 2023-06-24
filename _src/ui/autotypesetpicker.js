///import core
///import uicore
(function () {
    var utils = baidu.editor.utils,
        UIBase = baidu.editor.ui.UIBase;

    var AutoTypeSetPicker = baidu.editor.ui.AutoTypeSetPicker = function (options) {
        this.initOptions(options);
        this.initAutoTypeSetPicker();
    };
    AutoTypeSetPicker.prototype = {
        initAutoTypeSetPicker:function () {
            this.initUIBase();
        },
        getHtmlTpl:function () {
            var me = this.editor,
                opt = me.options.autotypeset,
                lang = me.getLang("autoTypeSet");

            var fontFamilyList = me.options['fontfamily'] || [];
            var fontFamilyHtml = '<select name="defaultFontFamily">';
            fontFamilyHtml += '<option value="" '+(!opt["defaultFontFamily"] ? "selected=\"selected\"" : "")+'>'+lang.defaultFontFamily+'</option>';
            for (var i = 0, ci; ci = fontFamilyList[i]; i++) {
                var langLabel = me.getLang('fontfamily')[ci.name] || "";
                (function (key, val) {
                    fontFamilyHtml += '<option value="'+utils.unhtml(val)+'"'+((opt["defaultFontFamily"] && opt["defaultFontFamily"] == val) ? "selected=\"selected\"" : "")+'>'+key+'</option>'
                })(ci.label || langLabel, ci.val)
            }
            fontFamilyHtml += '</select>';

            var fontsizelist = me.options['fontsize'] || [];
            var fontSizeHtml = '<select name="defaultFontsize">';
            fontSizeHtml += '<option value="" '+(!opt["defaultFontsize"] ? "selected=\"selected\"" : "")+'>'+lang.defaultFontsize+'</option>';
            for (var i = 0, ci; ci = fontsizelist[i]; i++) {
                fontSizeHtml += '<option value="'+ci+'"'+((opt["defaultFontsize"] && opt["defaultFontsize"] == ci) ? "selected=\"selected\"" : "")+'>'+ci+'</option>'
            }
            fontSizeHtml += '</select>';

            var lineHeightList = me.options['lineheight'] || [];
            var lineHeightHtml = '<select name="lineheight">';
            lineHeightHtml += '<option value="" '+(!opt["lineheight"] ? "selected=\"selected\"" : "")+'>'+lang.lineHeight+'</option>';
            for (var i = 0, ci; ci = lineHeightList[i]; i++) {
                lineHeightHtml += '<option value="'+ci+'"'+((opt["lineheight"] && opt["lineheight"] == ci) ? "selected=\"selected\"" : "")+'>'+ci+'</option>'
            }
            lineHeightHtml += '</select>';

            var rowSpacingList = me.options['rowspacing'] || [];

            var rowSpacingTopHtml = '<select name="rowspacingtop">';
            rowSpacingTopHtml += '<option value="" '+(!opt["rowspacingtop"] ? "selected=\"selected\"" : "")+'>'+lang.rowspacingtop+'</option>';
            for (var i = 0, ci; ci = rowSpacingList[i]; i++) {
                rowSpacingTopHtml += '<option value="'+ci+'"'+((opt["rowspacingtop"] && opt["rowspacingtop"] == ci) ? "selected=\"selected\"" : "")+'>'+ci+'</option>'
            }
            rowSpacingTopHtml += '</select>';

            var rowSpacingBottomHtml = '<select name="rowspacingbottom">';
            rowSpacingBottomHtml += '<option value="" '+(!opt["rowspacingbottom"] ? "selected=\"selected\"" : "")+'>'+lang.rowspacingbottom+'</option>';
            for (var i = 0, ci; ci = rowSpacingList[i]; i++) {
                rowSpacingBottomHtml += '<option value="'+ci+'"'+((opt["rowspacingbottom"] && opt["rowspacingbottom"] == ci) ? "selected=\"selected\"" : "")+'>'+ci+'</option>'
            }
            rowSpacingBottomHtml += '</select>';

            var hCenterHtml='';
            for(var i=1;i<=6;i++){
                hCenterHtml += '<label><input type="checkbox" name="hcenterh' + i +'" '+ (opt["hcenterh"+i] ? "checked" : "") + '>' + me.getLang("paragraph")['h'+i] + '</label>';
            }

            var textAlignInputName = 'textAlignValue' + me.uid,
                imageBlockInputName = 'imageBlockLineValue' + me.uid,
                symbolConverInputName = 'symbolConverValue' + me.uid;

            return '<div id="##" class="edui-autotypesetpicker %%">' +
                '<div class="edui-autotypesetpicker-body">' +
                '<table >' +
                '<tr><td nowrap><label><input type="checkbox" name="mergeEmptyline" ' + (opt["mergeEmptyline"] ? "checked" : "" ) + '>' + lang.mergeLine + '</label></td><td colspan="2"><label><input type="checkbox" name="removeEmptyline" ' + (opt["removeEmptyline"] ? "checked" : "" ) + '>' + lang.delLine + '</label></td></tr>' +
                '<tr><td nowrap><label><input type="checkbox" name="removeClass" ' + (opt["removeClass"] ? "checked" : "" ) + '>' + lang.removeFormat + '</label></td><td colspan="2"><label><input type="checkbox" name="indent" ' + (opt["indent"] ? "checked" : "" ) + '>' + lang.indent + '</label>&nbsp;<label><input type="checkbox" name="removeSpace" ' + (opt["removeSpace"] ? "checked" : "" ) + '>' + lang.removeSpace + '</label></td></tr>' +
                '<tr>' +
                '<td nowrap rowspan="2"><label><input type="checkbox" name="textAlign" ' + (opt["textAlign"] ? "checked" : "" ) + '>' + lang.alignment + '</label></td>' +
                '<td colspan="2" id="' + textAlignInputName + '">' +
                '<label><input type="radio" name="'+ textAlignInputName +'" value="left" ' + ((opt["textAlign"] && opt["textAlign"] == "left") ? "checked" : "") + '>' + me.getLang("justifyleft") + '</label>' +
                '<label><input type="radio" name="'+ textAlignInputName +'" value="center" ' + ((opt["textAlign"] && opt["textAlign"] == "center") ? "checked" : "") + '>' + me.getLang("justifycenter") + '</label>' +
                '<label><input type="radio" name="'+ textAlignInputName +'" value="right" ' + ((opt["textAlign"] && opt["textAlign"] == "right") ? "checked" : "") + '>' + me.getLang("justifyright") + '</label>' +
                '</td>' +
                '<tr>' +
                '<td>' +
                '<label><input type="checkbox" name="ignoreCaption"' + (opt["ignoreCaption"] ? "checked" : "") + '>' + lang.ignoreCaption + '</label>' +
                '</td>' +
                '</tr>' +
                '<tr>' +
                '<td nowrap><label>' + me.getLang("customstyle")["tc"] + '</label></td>' +
                '<td colspan="2">' + hCenterHtml + '</td>' +
                '</tr>' +
                '<tr>' +
                '<td nowrap><label><input type="checkbox" name="imageBlockLine" ' + (opt["imageBlockLine"] ? "checked" : "" ) + '>' + lang.imageFloat + '</label></td>' +
                '<td nowrap id="'+ imageBlockInputName +'">' +
                '<label><input type="radio" name="'+ imageBlockInputName +'" value="none" ' + ((opt["imageBlockLine"] && opt["imageBlockLine"] == "none") ? "checked" : "") + '>' + me.getLang("default") + '</label>' +
                '<label><input type="radio" name="'+ imageBlockInputName +'" value="left" ' + ((opt["imageBlockLine"] && opt["imageBlockLine"] == "left") ? "checked" : "") + '>' + me.getLang("justifyleft") + '</label>' +
                '<label><input type="radio" name="'+ imageBlockInputName +'" value="center" ' + ((opt["imageBlockLine"] && opt["imageBlockLine"] == "center") ? "checked" : "") + '>' + me.getLang("justifycenter") + '</label>' +
                '<label><input type="radio" name="'+ imageBlockInputName +'" value="right" ' + ((opt["imageBlockLine"] && opt["imageBlockLine"] == "right") ? "checked" : "") + '>' + me.getLang("justifyright") + '</label>' +
                '</td>' +
                '</tr>' +
                '<tr><td nowrap><label><input type="checkbox" name="removeImageSize" ' + (opt["removeImageSize"] ? "checked" : "" ) + '>' + lang.removeImageSize + '</label></td><td colspan="2"><label>' + lang.imageWidth + '</label><input type="text" size="5" style="width:40px;" name="imageWidth" value="'+opt["imageWidth"]+'"></td></tr>' +
                '<tr><td nowrap><label><input type="checkbox" name="clearFontFamily" ' + (opt["clearFontFamily"] ? "checked" : "" ) + '>' + lang.removeFontFamily + '</label></td><td colspan="2"><label>' + lang.defaultFontFamily + '</label>'+fontFamilyHtml+'</td></tr>' +
                '<tr><td nowrap><label><input type="checkbox" name="clearFontSize" ' + (opt["clearFontSize"] ? "checked" : "" ) + '>' + lang.removeFontsize + '</label></td><td colspan="2"><label>' + lang.defaultFontsize + '</label>'+ fontSizeHtml +'</td></tr>' +
                '<tr><td nowrap><label>' + lang.lineHeight + '</label>'+ lineHeightHtml +'</td><td colspan="2"><label>' + lang.rowspacingtop + '</label>'+ rowSpacingTopHtml +'<label>' + lang.rowspacingbottom + '</label>'+ rowSpacingBottomHtml +'</td></tr>' +
                '<tr><td nowrap colspan="3"><label><input type="checkbox" name="removeEmptyNode" ' + (opt["removeEmptyNode"] ? "checked" : "" ) + '>' + lang.removeHtml + '</label></td></tr>' +
                '<tr><td nowrap colspan="3"><label><input type="checkbox" name="pasteFilter" ' + (opt["pasteFilter"] ? "checked" : "" ) + '>' + lang.pasteFilter + '</label></td></tr>' +
                '<tr>' +
                '<td nowrap><label><input type="checkbox" name="symbolConver" ' + (opt["bdc2sb"] || opt["tobdc"] ? "checked" : "" ) + '>' + lang.symbol + '</label></td>' +
                '<td id="' + symbolConverInputName + '">' +
                '<label><input type="radio" name="bdc" value="bdc2sb" ' + (opt["bdc2sb"] ? "checked" : "" ) + '>' + lang.bdc2sb +
                '</label><label><input type="radio" name="bdc" value="tobdc" ' + (opt["tobdc"] ? "checked" : "" ) + '>' + lang.tobdc + '</label></td>' +
                '<td nowrap align="right"><button >' + lang.run + '</button></td>' +
                '</tr>' +
                '</table>' +
                '</div>' +
                '</div>';


        },
        _UIBase_render:UIBase.prototype.render
    };
    utils.inherits(AutoTypeSetPicker, UIBase);
})();
