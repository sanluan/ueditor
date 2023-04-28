## 介绍
让UEditor重新散发活力的硬核更新版本来啦！

与原版1.4.4保持最大程度兼容,不改图标！

支持word、wps文档复制粘贴图片自动上传

## v1.4.5 修改记录

1. 文件上传取消flash
1. 表情、列表图片素材本地化
1. 增加日文翻译
1. 增加word、wps文档复制图片自动上传
1. 增加base64图片自动转存
1. 移除截图工具
1. 移除webapp、音乐、图片搜索等失效功能
1. 增加视频封面设置、已上传视频选择功能
1. 一键排版增加字号、字体、行间距、段前断后距离、空格替换设置
1. 处理中文双引号不能正常转义bug
1. 增加表格左右滑动
1. 增加图片高宽比不变方式拉拽
1. 修复图片选中后不能切换焦点问题
1. 增加图片属性原尺寸提示
1. 增加三个内容模板：局部滚动布局、序号标题、左右序号标题
1. 更新jquery,webuploader,zeroclipboard等第三方插件

## 编译 ##

```
npm install grunt -g
grunt
```

Get Started

## ueditor富文本编辑器介绍

UEditor是由百度web前端研发部开发所见即所得富文本web编辑器，具有轻量，可定制，注重用户体验等特点，开源基于MIT协议，允许自由使用和修改代码。

## 入门部署和体验 ##

### 第一步：下载编辑器 ###

到官网下载ueditor最新版：[[GITEE地址]](https://gitee.com/sanluan/ueditor/releases/download/v1.4.5/ueditor-1.4.5.zip "GITEE下载地址")

### 第二步：创建demo文件 ###
解压下载的包，在解压后的目录创建demo.html文件，填入下面的html代码

```html
<!DOCTYPE HTML>
<html lang="en-US">
<head>
	<meta charset="UTF-8">
	<title>ueditor demo</title>
</head>
<body>
	<!-- 加载编辑器的容器 -->
	<script id="container" name="content" type="text/plain">这里写你的初始化内容</script>
	<!-- 配置文件 -->
	<script type="text/javascript" src="ueditor.config.js"></script>
	<!-- 编辑器源码文件 -->
	<script type="text/javascript" src="ueditor.all.js"></script>
	<!-- 实例化编辑器 -->
	<script type="text/javascript">
	    var ue = UE.getEditor('container');
	</script>
</body>
</html>
```

### 第三步：在浏览器打开demo.html ###

如果看到了下面这样的编辑器，恭喜你，初次部署成功！

![部署成功](http://fex.baidu.com/ueditor/doc/images/demo.png)

### 自定义的参数

编辑器有很多可自定义的参数项，在实例化的时候可以传入给编辑器：
```javascript
var ue = UE.getEditor('container', {
    autoHeight: false
});
```

配置项也可以通过ueditor.config.js文件修改，具体的配置方法请看[前端配置项说明](http://fex.baidu.com/ueditor/#start-config1.4 前端配置项说明.md)

### 设置和读取编辑器的内容

通getContent和setContent方法可以设置和读取编辑器的内容
```javascript
var ue = UE.getContent();
ue.ready(function(){
    //设置编辑器的内容
    ue.setContent('hello');
    //获取html内容，返回: <p>hello</p>
    var html = ue.getContent();
    //获取纯文本内容，返回: hello
    var txt = ue.getContentTxt();
});
```
