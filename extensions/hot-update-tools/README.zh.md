## 介绍
游戏接入热更新，需要生成`project.manifest`和`version.manifest`文件。

本插件可以帮助你快速生成`manifest`文件，并且提供了本地测试的一些实用功能。

[插件在线体验](https://tidys.github.io/hot-update-tools-online/main.html)

![plugin.png](https://download.cocos.com/CocosStore/resource/c43323b690b14087a328e80a102b5178/c43323b690b14087a328e80a102b5178.png)


## 参考资料

- [官方热更新教程]( https://github.com/cocos-creator/tutorial-hot-update)
- [插件文档](https://tidys.github.io/#/docs/hot-update-tools/README)
- [配套的热更新参考工程](https://github.com/tidys/plugin-case-hot-update)


## 使用教程

![use.gif](https://download.cocos.com/CocosStore/resource/813a62e4accb43079455fe45a1d2ca73/813a62e4accb43079455fe45a1d2ca73.gif)

1. 构建Android项目，必须要构建！
2. 打开插件，插件会自动识别到构建的Android项目。
3. 输入版本号。
4. 输入资源服务器地址，如果要本地测试，直接点击`使用本机IP`即可。
5. 点击`生成热更包`，会生成`version.zip`。
  
    ![versionzip.png](https://download.cocos.com/CocosStore/resource/14206f0e25144ebf8352834b82b2bea8/14206f0e25144ebf8352834b82b2bea8.png)

6. 将`version.zip`上传到资源服务器。
7. 游戏对接热更新逻辑，[参考DEMO](https://github.com/tidys/plugin-case-hot-update)
8. 测试热更新是否正常。

## 本地测试

![test.png](https://download.cocos.com/CocosStore/resource/fb3ff6ae56744bca96dc4fd25099c242/fb3ff6ae56744bca96dc4fd25099c242.png)

插件支持热更新直接在本地测试，不需要上传到资源服务器。

当本地测试通过后，再切换到正式资源服务器即可。


## 热更新常见问题
1. 为什么我更新不到任何资源？

   仔细检查资源服务器的manifest版本号、apk的manifest版本号

2. 为什么游戏更新后还是旧的？

    仔细检查搜索路径（search paths）,`main.js`头部代码有添加搜索路径的逻辑，插件会自动追加。

90%的热更新失败，原因都是以上2个问题。



## 联系作者 
- 邮箱 xu_yanfeng@126.com
- [点击加入CocosCreator插件开发交流：224756137](https://qm.qq.com/q/DzWjXvQtk6)
- 微信号 xu__yanfeng

    ![](https://download.cocos.com/CocosStore/markdown/0aa4773f76bb4f998bf0b1078752f128/0aa4773f76bb4f998bf0b1078752f128.jpg)
 

## 购买须知 
本产品为付费虚拟商品，一经购买成功概不退款，请支付前谨慎确认购买内容。 