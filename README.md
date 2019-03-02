v1.0.2
====
bug: 修复热更新时自动清空文件问题。  
优化： 1、新增 npm run dev => 输出sourcemap版本的js  
      2、新增 npm run build => 输出不含有soucemap版本的js

***注意：html中的css,js,less不做转译编译。（gulp机制）考虑webpack优化***



v1.0.1
====
### 打包新增

##### 支持静态资源上传阿里云，替换原静态资源

#### 新增dest目录作为静态资源目录



v1.0.0
=====
项目目录
-----
![Alt text](https://yxs-web.oss-cn-beijing.aliyuncs.com/477420a67b3eca7d986b3bdb605fa493.jpg)

开发环境
------
默认文件启动地址位于files中

`npm run start`

启动服务,实现本地热更新，支持less,es6。

源码目录必须保持与demo目录一致。

页面引用js会压缩成一个，all.min.js与all.js。  
页面引用css会压缩成一个，all.min.css与all.css。 
压缩必须将页面应用改为all.min.js与all.min.css  

线上环境
----

***命令行只支持字符串与数字类型*** 

`npm run build` 

#### 如果不传参数则打包files下面的全部目录，输出到相应的build的文件夹下面。
`npm run build --filename="<your filename>"`  

### 如果打包某一个文件就传递一个文件的名字
`npm run build --filename="['<your filename1>,'<your filename2>']"`  

### 如果打包某多个文件就传递一个数组。


打包后输入两个目录 rev与build文件。  
rev存放版本对应的key。  
build存放打包后的文件。结构与源码目录保持一致
暂不支持静态资源上传的阿里云 

***注意：目前打包不扫描，less文件，即修改less文件需要开发环境先编译至css文件中***