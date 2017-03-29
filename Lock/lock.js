/*! 
 * title:  web移动端九宫格锁屏组件
 * author: 黄一凡
 * date  : 2017.03.28
 * github: https://github.com/xbx0119/UI-Component/tree/master/Lock
 * demo  : http://www.norma0119.cn/Lock/
 *
 */
function Lock() {
	// 密码
	this.password = [];
	// 密码暂存数组
	this.store = []; 
	// 当前所处状态（单选框） 0:设置密码 1:再次输入以确认密码 2:验证密码
	this.state = 0;
	// 文本提示信息 
	this.info = "";

	this.canvas = {
		ctx: document.getElementById('canvas').getContext('2d'),
		width: 0,
		height: 0,
		radius: 20
	}

	/**
	 * 九宫格锁屏组件初始化
	 * 添加触屏事件
	*/
	this.init = function() {
		var that = this;

		// 初始化画布
		this.initCanvas();

		//单选框选择模式
		var set = document.getElementById('set'),
			check = document.getElementById('check');

		that.registerTouch();

		// 设置密码事件
		set.addEventListener('click', function() {
			// localStorage.setItem("password", null);
			that.setState(0);
		});

		// 验证密码
		check.addEventListener('click', function() {
			that.setState(2);
		});

		set.click();

		// 禁止浏览器默认事件
		document.ontouchmove = function(e) {
			e.preventDefault();
		}
	}
}

/**
 * 注册触屏事件
 *
 */
Lock.prototype.registerTouch = function() {
	var that = this;

	var tmp = null;// 设置密码暂存数组

	var area = document.getElementById('canvas'),
		// 密码区相对视口的左右距离
		areaLeft = area.offsetLeft,
		areaTop = area.offsetTop;

	var flag;
	// 触屏开始
	area.addEventListener('touchstart', function(event) {
		flag = false;
		tmp = []; // 清空暂存数组
		// 触点起始位置 相对于canvas
		var startX = event.touches[0].clientX - areaLeft,
			startY = event.touches[0].clientY - areaTop;

		//判断起始点是否在密码点上
		//若在,设置起始圆心，开始绘制路径
		if(that.canvas.ctx.isPointInPath(startX, startY)) {
			flag = true;
			// 确定所在圆心
			var i = parseInt(startX / (that.canvas.width / 3)),
				j = parseInt(startY / (that.canvas.height / 3)),
				x = parseInt(that.canvas.width / 6 * (2 * i + 1)),
				y = parseInt(that.canvas.height / 6 * (2 * j + 1));
			// 推入起始点密码
			tmp.push(3 * j+ i + 1);

			that.canvas.ctx.beginPath();
			that.canvas.ctx.lineWidth = 10;
			that.canvas.ctx.strokeStyle = "orange";
			that.canvas.ctx.fillStyle = "orange";

			// 绘制初始点
			that.canvas.ctx.moveTo(x, y);
			that.canvas.ctx.arc(x, y, that.canvas.radius - 3, 0, 2 * Math.PI);
			// 回归圆心
			that.canvas.ctx.moveTo(x, y);
			that.canvas.ctx.fill();
			that.canvas.ctx.stroke();
		}
		return false;
	});

	// 手指移动
	area.addEventListener('touchmove', function(event) {
		var 
			// 获取touch对象,包含坐标等信息
			touch = event.touches[0],
			// 触点相对canvas的左右偏移坐标
			x = touch.clientX - areaLeft, 
			y = touch.clientY - areaTop,
			// n m 为密码点坐标,0 ~ 2
			n = parseInt(x / (that.canvas.width / 3)),
			m = parseInt(y / (that.canvas.height / 3)),
			// 对应的圆心坐标
			rx = parseInt(that.canvas.width / 6 * (2 * n + 1)),
			ry = parseInt(that.canvas.height / 6 * (2 * m + 1));

		// 如果当前触点在密码点上,判断位于哪一个密码点处
		if(flag && rx - that.canvas.radius <= x && x <= rx + that.canvas.radius && ry - that.canvas.radius <= y && y <= ry + that.canvas.radius) {
			if(0 <= n && n <= 2 && 0 <= m && m <= 2) {
				var num = 3 * m + n + 1;
				if(tmp.indexOf(num) < 0) {
					tmp.push(num);
					// 绘制路径
					that.canvas.ctx.lineTo(rx, ry);

					that.canvas.ctx.moveTo(rx, ry);
					that.canvas.ctx.arc(rx, ry, that.canvas.radius - 3, 0, 2 * Math.PI);
					// 回归圆心
					that.canvas.ctx.moveTo(rx, ry);
					that.canvas.ctx.fill();

					that.canvas.ctx.stroke();					
				}
			}
		}
		return false;
	});

	// 触控结束，触发设置密码事件 setPassword()
	area.addEventListener('touchend', function(event) {
		console.log(tmp)
		// 验证密码模式
		if(that.state === 2) {
			that.checkPassword(tmp);
		}else if(that.state === 1) {
			// 再次输入确认密码
			that.confirmPassword(tmp);
		}else {
			// state = 0设置密码模式
			that.setPassword(tmp);
		}
		that.canvas.ctx.beginPath();
		return false;
	});
}

/**
 * 选择单选框
 *
 */
Lock.prototype.setState = function(mod) {
	this.state = parseInt(mod);
	if(this.state === 0) {
		this.showInfo('设置密码');
		return;
	}
	if(this.state === 1) {
		this.showInfo("请再次输入手势密码");
		return;
	}
	if(this.state === 2) {
		this.showInfo('验证密码');
		return;
	}
}

/*
 * 设置密码
 * 若不足五个点，提示用户密码太短
 * 再次输入密码确认，若不一致，提示并重置，重新开始设置密码
 * 两次输入一致，则密码设置成功，更新localStorage
 * 函数参数列表：
 * - tmp, 触屏事件中返回的密码数组
 */
Lock.prototype.setPassword = function(tmp) {
	// 判断是否合法
	if(tmp.length < 5) {
		this.showInfo("密码太短，至少需要5个点");
	}else {
		// 当前处于再次输入以确认密码模式
		if(this.state === 1) {
			this.confirmPassword(tmp);
		}
		// 当前处于初次设置密码模式
		if(this.state === 0) {
			// 设置state 为再次输入密码确认模式
			this.setState(1); 
			// 暂存密码
			this.store = tmp;
		}
	}
	// 重置
	this.reset();
}

/**
 * 再次输入确认密码
 *
 */
Lock.prototype.confirmPassword = function(tmp) {
	if(tmp.toString() === this.store.toString()) {
		this.password = this.store;
		this.showInfo("密码设置成功");
		// 记录密码到localStorage中
		localStorage.setItem("password", this.password.toString());
		document.getElementById('check').click();
	}else {
		this.setState(0);
		this.showInfo("两次输入的不一致,重新设置");
	}
	this.store = [];
}

/**
 * 验证密码
 *
 */
Lock.prototype.checkPassword = function(tmp) {
	if(localStorage.getItem('password').toString() !== tmp.toString()) {
		this.showInfo("密码错误");
	}else {
		this.showInfo("密码正确");
	}
}

/**
 * 函数参数列表：
 * - text, 传入要显示的文本
 */
Lock.prototype.showInfo = function(text) {
	var info = document.getElementById('info');
	info.innerHTML = text;
	var that = this;
	setTimeout(function() {
		that.reset();
	}, 300);
}

/**
 * 重置
 *
 */
Lock.prototype.reset = function() {
	this.initCanvas();
	console.log("清除绘制路径");
}

/**
 * 初始化画布
 */
Lock.prototype.initCanvas = function() {
	// 设置canvas的长宽
	document.getElementById('canvas').width = document.getElementById('password').clientWidth;
	document.getElementById('canvas').height = document.getElementById('password').clientHeight;
	this.canvas.width = document.getElementById('password').clientWidth;
	this.canvas.height = document.getElementById('password').clientHeight;

	this.canvas.ctx.fillStyle = "#fff";
	this.canvas.ctx.lineWidth = 0;
	this.canvas.ctx.strokeStyle = "#fff";

	// 绘制九宫格密码点
	this.canvas.ctx.beginPath();
	for(var i = 0;i <= 2; i++) {
		for(var j = 0;j <= 2;j++) {
			var x = parseInt(this.canvas.width / 6 * (2 * i + 1)),
				y = parseInt(this.canvas.height / 6 * (2 * j + 1));
			this.canvas.ctx.moveTo(x, y);
			this.canvas.ctx.arc(x, y, this.canvas.radius, 0, 2 * Math.PI);
			this.canvas.ctx.fill();
		}
	}
	this.canvas.ctx.stroke();
}


var lock = new Lock();
lock.init();









