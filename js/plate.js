(function (win){
		var doc = document,
			oWrapper = doc.getElementsByClassName('wrapper')[0];

		window.fn = {
			getPos: function (elem) {
				var getPosObj = elem.getBoundingClientRect(),
				cliWidth = (doc.docElement || doc.body).clientLeft,
				cliTop = (doc.docElement || doc.body).clientTop;
				
				return {
					left: getPosObj.left - cliWidth,
					top: getPosObj.top - cliTop,
					right: getPosObj.right,
					bottom: getPosObj.bottom
				}
			},
			getRePos: function (elem) {
				return {
					left: elem.offsetLeft,
					top: elem.offsetTop,
					right: elem.offsetLeft + elem.offsetWidth,
					bottom: elem.offsetTop + elem.offsetHeight
				}
			},
			getCenter: function (elem, re){
				var posObj = this["get" + ( re ? "Re" : "" ) + "Pos"](elem),
					cenLeft = posObj.left + Math.round(elem.offsetHeight / 2),
					cenTop = posObj.top +　Math.round(elem.offsetWidth / 2);

				return {
					cenLeft: cenLeft,
					cenTop: cenTop
				}
			},
			getReCenter: function (elem) {
				return this.getCenter(elem, true);
			},
			getAngelAndLen: function (elem1, elem2){
				var cen1 = this.getCenter(elem1),
					cen2 = this.getCenter(elem2);
					diffX = cen2.cenLeft - cen1.cenLeft,
					diffY = cen2.cenTop - cen1.cenTop;

				return {
					angel: Math.round((Math.atan2(diffX, diffY)*180) / Math.PI),
					len: Math.ceil(Math.sqrt(diffX * diffX + diffY * diffY)),
					diffX: diffX,
					diffY: diffY
				}
			},
			createLine: function (elem, angel){
				var line = document.createElement('div');
					line.style.border = '1px solid #000';
					line.style.width = angel.len;
					line.style.position = 'absolute';
					line.style.left = this.getCenter(elem).cenLeft - this.getPos(oWrapper).left; 
					line.style.top = this.getCenter(elem).cenTop - this.getPos(oWrapper).top;
					line.style.webkitTransform  = 'rotate('+(90-angel.angel)+'deg)';
					line.style.webkitTransformOrigin = '0 0';

				oWrapper.insertBefore(line, elem);
			},
			createAllLine: function () {
				var children = document.querySelector('.wrapper').children,
					children = Array.prototype.slice.call(children);

				this.info.list = children;

				for(var i = 0, l = children.length; i < l && children[ i + 1 ]; i++){
					this.createLine(children[i], this.getAngelAndLen(children[i], children[i+1]));
				}
			},
			extend: function (target, src) {
				for(var key in src) {
					target[key] = src[key];
				}
				return target;
			},
			info: [],
			saveInfo: function () {
				var list = this.info.list,
					info = this.info,
					elem;

				for(var i = 0, l = list.length; i < l; i++) {
					elem = list[i];
					info[i] = this.extend(
						this.getReCenter(elem),
						{
							width: elem.offsetWidth,
							height: elem.offsetHeight,
							left: fn.getPos(elem).left,
							top: fn.getPos(elem).top,
							index: i,
							className: elem.className
						}
					);
				}
			},
			init: function () {
				this.createAllLine();
				this.saveInfo();
				this.click();
			},
			// 运动
			move: function (elem, dir, src, target, callback) {
				var rtime = 2 / 0.03,
					dis = target - src,
					speed = dis / rtime,
					timer, cur = src,
					info = this.info;

				fn.click(true);

				timer = setInterval(function () {
					// 到达终点
					if(cur >= target && dis > 0 || cur <= target && dis < 0) {
						clearInterval(timer);
						cur = target;

						if(callback) {
							info[0].curIndex += info[0].step;
							callback();
						}
					}else {
						cur += speed;
					}

					elem.style[dir] = cur + 'px';

				}, 30);
			},
			moveTo: function (elem, src, target, callback) {
				var halfWidth = elem.offsetWidth / 2,
					halfHeight = elem.offsetHeight / 2;

				fn.move(elem, 'left', src.cenLeft - halfWidth, target.cenLeft - halfWidth);
				fn.move(elem, 'top', src.cenTop - halfWidth, target.cenTop - halfWidth, callback);
			},
			click: function (unbind) {
				var elems = this.info.list,
					handler;
				if(unbind) {
					handler = null;
				}else {
					handler = function (event) {
						var road = fn.queue(this);
						fn.dequeue(road);
					}
				}
				for(var i = 0, l = elems.length; i < l; i++) {
					elems[i].onclick = handler;
				}
			},
			queue: function (target) {
				var info = this.info,
					list = info.list,
					targetIndex = list.indexOf(target),
					curIndex;
				
				curIndex = info[0].curIndex || 0;
				
				if(curIndex < targetIndex) {
					info[0].step = 1;
				}else if(curIndex == targetIndex){
					info[0].step = 0;
				}else {
					info[0].step = -1;
				}

				info[0].curIndex = curIndex;
				info[0].targetIndex = targetIndex;
			},
			dequeue: function () {
				var info = this.info,
					plane = document.querySelector('.plane'),
					curIndex = info[0].curIndex;
					targetIndex = info[0].targetIndex;

				if(curIndex == targetIndex) { 			// 已到达终点
					fn.click()
					return;
				}

				this.moveTo(plane, info[curIndex], info[curIndex += info[0].step], function () {
					fn.dequeue();
				});
			}
		}

		fn.init();
	})(window);