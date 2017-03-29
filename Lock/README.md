# 九宫格手势密码锁 Lock 组件 说明文档

##简介：
本组件旨在实现一个九宫格手势密码锁功能，应该比较好理解，就不太多解释了。 
大致说明一下实现本组件所需的、以及实现过程中用过的但最终没用到的、觉得值得提一下的知识点吧。
1. Flex布局
2. canvas绘图
3. js移动端触屏事件
4. 客户端检测 


## 基本思路
讲述一下实现的思路，刚拿到题目还是有点点懵逼，不知道从哪里开始下手。不管怎么样，先把大致的页面写出来。

### 一.刚开始是分为三个区域的，分别是九宫格密码区#password，文本显示区#info，单项模式选择区#radio。其中九宫格密码区原先我是这么实现的。
```html
<div id="password">
	<span class="dot"></span>
	<span class="dot"></span>
	<span class="dot"></span>
	<span class="dot"></span>
	<span class="dot"></span>
	<span class="dot"></span>
	<span class="dot"></span>
	<span class="dot"></span>
	<span class="dot"></span>
</div>
```
这也是前面提到涉及到Flex布局知识点的地方。通过Flex布局很轻松的就能将 3 * 3 的原点均匀的分布在div#password中。通过一个div里面九个span很容易实现九宫格的样子，但是存在一个问题，后期无法实现在触屏滑动时绘制路径，于是又将里面的九个span替换成一个canvas，通过canvas绘制九个密码圆点和路径。

### 二.然后需要给页面上的一系列元素添加事件，代码参照lock.js。大致思路是： 
创建一个Lock类型，Lock类型的属性和方法说明如下：
```javascript
function Lock() {
	this.password;   // 数组 || 成功设置的密码，这个属性其实可以去掉，反正密码是要存在localStorage里面的
	this.store;      // 数组 || 密码暂存数组，存储第一遍输入还没有确定的密码
	this.state;      // 数字 || 当前所处状态（单选框） 0:设置密码 1:再次输入以确认密码 2:验证密码
	this.info;       // 字符串 || 文本提示信息 
	this.canvas;     // 对象 || canvas相关信息，包括绘图对象、canvas的长宽和密码点的半径

	// 九宫格组件初始化，包括调用canvas九宫格的构建和单选框点击事件的添加
	this.init = function() { }    
}

// 添加canvas的触屏事件，包括touchstart、touchmove、touchend，在事件中包含对密码点路径的绘制和对暂存密码的设置
Lock.prototype.registerTouch = function() {}   

// 设置状态 0:设置密码 1:再次输入以确认密码 2:验证密码
Lock.prototype.setState = function(mod) {}  

// 设置密码，根据绘制的密码和当前状态选择执行操作
Lock.prototype.setPassword = function(tmp) {}

// 确认密码，对第二次输入的密码与第一次比对
Lock.prototype.confirmPassword = function(tmp) {} 

// 验证密码，将localStorage中的密码与输入的密码比对
Lock.prototype.checkPassword = function(tmp) {}  

// 显示文字信息
Lock.prototype.showInfo = function(text) {} 

// 重置canvas区域，清除之前输入的密码轨迹
Lock.prototype.reset = function() {}    

// 初始化canvas，绘制九宫格
Lock.prototype.initCanvas = function() {}     
```















