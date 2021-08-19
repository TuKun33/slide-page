// components/slide-page/index.js
const { windowWidth, windowHeight } = wx.getSystemInfoSync();
// const data = Object.keys(Array(60).fill(''))
import slideItem from './item/index.js';

Component({
	XORY: 'X',
	touchStartTime: 0,
	rectDistance: 0,
	loaded: false,
	slideLength: 3,
	activeIndex: 0,
	activeDataIndex: 0,

	options: {
		styleIsolation: 'apply-shared'
	},
	behaviors: [slideItem],
	properties: {
		data: {
			type: 'object',
			value: []
		},
		direction: {
			type: 'string',
			value: 'horizontal'
		},
		speed: {
			type: 'number',
			value: 300,
		},
		width: {
			type: 'number',
			value: windowWidth,
		},
		height: {
			type: 'number',
			value: windowHeight
		},
		initialSlide: {
			type: 'number',
			value: 0
		}
	},

	data: {
		animationData: [],
		viewData: [],
		activeIndex: 0
	},
  lifetimes: {
    attached() {
      const { direction, width, height } = this.properties
      this.XORY = direction === 'horizontal' 
        ? 'X' 
        : 'Y';
      this.rectDistance = direction === 'horizontal'
        ? width
        : height;
  
      this.activeIndex = 0
      this.activeDataIndex = 0
      this.slideLength = 3
  
      this.data.viewData = this.properties.data.slice(0, 2)
      this.syncView('viewData')
        .then(_ => {
          this.loaded = true
          this.triggerEvent('inited', {
            activeIndex: this.activeDataIndex,
            viewData: this.data.viewData
          })
        })
    },  
  },
  
	methods: {
		// handler
		touchstart(e) {
			if (!this.loaded) return;
			// var onTouchStart = this.onTouchStart
			var	XORY = this.XORY
			var	activeIndex = this.activeIndex
			var	rectDistance = this.rectDistance;

			var touch = e.changedTouches[0] || {};
			var distance = touch['client' + XORY] || 0;
			var translate = -activeIndex * rectDistance;

			this['touchStart' + XORY] = distance;
			this['translate' + XORY] = translate;
			this.touchStartTime = new Date().getTime();

			// typeof onTouchStart === 'function' && onTouchStart(this, e); //  当手指碰触到slide时执行

			this.slideAnimation(translate, 0);
		},
		touchmove(e) {
			if (!this.loaded) return;
			// var onTouchMove = this.onTouchMove,
			var XORY = this.XORY
				// onSlideMove = this.onSlideMove;

			var touch = e.changedTouches[0] || {};
			var distance = touch['client' + XORY] || 0;
			var tmpMove = this['translate' + XORY] + distance - this['touchStart' + XORY];

			// typeof onTouchMove === 'function' && onTouchMove(this, e); //  手指碰触slide并且滑动时执行

			this.slideAnimation(tmpMove, 0);

			// typeof onSlideMove === 'function' && onSlideMove(this);
		},
		touchend(e) {
			if (!this.loaded) return;
			var onTouchEnd = this.onTouchEnd
			var XORY = this.XORY
			var speed = this.properties.speed
			var touchStartTime = this.touchStartTime
			var rectDistance = this.rectDistance;

			var touch = e.changedTouches[0] || {};
			var distance = touch['client' + XORY] || 0;
			var touchEndTime = new Date().getTime();

			var action = this.action(touchStartTime, touchEndTime, this['touchStart' + XORY], distance, rectDistance);

			typeof onTouchEnd === 'function' && onTouchEnd(this, e); //  手指离开slide时执行

			this[action](speed);
		},

		/**
     * 平移动画
     * @param {Number?} translate：平移位置
     * @param {Number?} speed：过渡时长
     * @param {String?} timingFunction：过渡类型
     */
		slideAnimation(translate = 0, speed = 300, timingFunction = 'ease') {
			var XORY = this.XORY
			// var consoleException = this.consoleException;
		
			var REG = {
				SPEED: /^(0|[1-9][0-9]*|-[1-9][0-9]*)$/,
				TIMINGFUNCTION: /linear|ease|ease-in|ease-in-out|ease-out|step-start|step-end/
			};

			try {
        /**
         * 异常处理
         */
				if (!REG.SPEED.test(speed)) throw 'paramType: speed';
				if (!REG.TIMINGFUNCTION.test(timingFunction)) throw 'paramType: timingFunctions';
        /**
         * 创建一个动画实例
         */
				const animation = wx.createAnimation({
					transformOrigin: '50% 50%',
					duration: speed,
					timingFunction,
					delay: 0
				});

				animation['translate' + XORY](translate).step(); //  动画描述

				// 同步动画到视图
				this.syncView('animationData', animation.export())
			} catch (err) {
				console.error(err, 'slideAnimation[Function]');
			}
		},

		/**
     * 切换控制器
     * @param {Number} touchStartTime： 手指触碰slide时的时间戳
     * @param {Number} touchEndTime 手指离开slide时的时间戳
     * @param {Number} from： 手指触碰slide时的屏幕位置
     * @param {Number} to： 手指离开slide时的屏幕位置
     * @param {Number} wrapperDistance： slide滑动方向上的容器长度
     * @return {String}
     */
		action(touchStartTime, touchEndTime, from, to, wrapperDistance) {
			var activeIndex = this.activeIndex
			var slideLength = this.slideLength
			// var onTransitionStart = this.onTransitionStart;

			var deltaTime = touchEndTime - touchStartTime; //  手指触摸时长
			var distance = Math.abs(to - from); //  滑动距离

			var k = distance / deltaTime;

			if (to > from) {
				// typeof onTransitionStart === 'function' && onTransitionStart(this); // slide达到过渡条件时执行
				return k > 0.3 || distance > wrapperDistance / 2 
					? (activeIndex === 0 ? 'slideBack' : 'slidePrev')
					: 'slideBack';
			}

			if (to < from) {
				// typeof onTransitionStart === 'function' && onTransitionStart(this); // slide达到过渡条件时执行
				return k > 0.3 || distance > wrapperDistance / 2
					? (activeIndex === slideLength - 1 ? 'slideBack' : 'slideNext')
					: 'slideBack';
			}

			if (to = from) {
				return 'slideBack';
			}
		},

		/**
     * 同步设置到视图
     * @param {String} viewName 视图key值
     * @param {*?} prop 视图key对应得value
     */
		syncView(viewName, prop) {
			if (typeof prop === 'undefined') {
				prop = this.data[viewName]
			}
			return new Promise(resolve => {
				this.setData(defineProperty({}, "" + viewName, prop), resolve);
			})
		},

		/**
     * 切换至下一个slide
     * @param {Number?} speed (单位ms)，切换速度
     */
		slideNext(speed = 300) {
			const { data } = this.properties
			this.activeDataIndex += 1
			const targetIndex = this.activeIndex + 1

			this.slideTo(targetIndex, speed);

			const eventDetail = _ => ({
				activeIndex: this.activeDataIndex,
				previousIndex: this.activeDataIndex - 1,
				viewData: this.data.viewData
			})

			this.triggerEvent('changeStart', eventDetail())

			setTimeout(_ => {
				if (this.activeDataIndex < data.length - 1) {
					this.data.viewData = data.slice(this.activeDataIndex - 1, this.activeDataIndex + 2)
					this.syncView('viewData')
					
					if (this.activeIndex > 1 && this.activeDataIndex > 0) {
						this.activeIndex -= 1
						this.slideAnimation((-this.activeIndex) * this.rectDistance, 0)
					}
				} else {
					this.activeIndex = 2
				}

				this.triggerEvent('changeEnd', eventDetail())
				this.triggerEvent('transitionEnd', eventDetail())
			}, speed)
		},

    /**
     * 切换至上一个slide
     * @param {Number?} speed (单位ms)，切换速度
     */
		slidePrev(speed = 300) {
			const { data } = this.properties
			this.activeDataIndex -= 1
			const targetIndex = this.activeIndex - 1

			this.slideTo(targetIndex, speed);

			const eventDetail = _ => ({
				activeIndex: this.activeDataIndex,
				previousIndex: this.activeDataIndex + 1,
				viewData: this.data.viewData
			})

			this.triggerEvent('changeStart', eventDetail())

			setTimeout(_ => {
				if (this.activeDataIndex > 0) {
					this.data.viewData = data.slice(this.activeDataIndex - 1, this.activeDataIndex + 2)
					
					if (this.activeIndex === 0 && this.activeDataIndex > 0) {
						this.activeIndex = 1
						this.slideAnimation(-this.activeIndex * this.rectDistance, 0)
					}
				} else {
					this.data.viewData = data.slice(0, 2)
					this.activeIndex = 0
				}

				this.triggerEvent('changeEnd', eventDetail())
				this.triggerEvent('transitionEnd', eventDetail())
				this.syncView('viewData')
			}, speed)
		},

    /**
     * 回弹
     * @param {Number?} speed (单位ms)，切换速度
     */
		slideBack(speed = 300) {
			var XORY = this.XORY
			var activeIndex = this.activeIndex
			var rectDistance = this.rectDistance

			var translate = -activeIndex * rectDistance;

			this.slideAnimation(translate, speed);

			setTimeout(_ => {
				this.triggerEvent('transitionEnd', {
					activeIndex: this.activeDataIndex,
					previousIndex: this.activeDataIndex,
					viewData: this.data.viewData
				})
			}, speed)
		},

		/**
     * 切换到指定slide
     * @param index：必选，num，指定将要切换到的slide的索引
     * @param speed：可选，num(单位ms)，切换速度
     */
		slideTo(index, speed = 300) {
			const slideLength = this.slideLength
			const activeIndex = this.activeIndex
			const	rectDistance = this.rectDistance

			try {
				if (typeof index !== 'number') throw 'paramType: index'; //  参数类型错误
				if (index < 0 || index > slideLength - 1) throw 'bound'; //  越界

				this.activeIndex = index;

				// const eventDetail = {
				// 	activeIndex: this.activeDataIndex,
				// 	previousIndex: this.activeDataIndex + (activeIndex > index ? 1 : -1),
				// 	viewData: this.data.viewData
				// }

				// this.triggerEvent('changeStart', eventDetail)

				var translate = -index * rectDistance;
				this.slideAnimation(translate, speed);

				// 从一个slide过渡到另一个slide结束后执行
				// setTimeout(_ => {
					// this.syncView('activeIndex', this.activeIndex)
				// 	this.triggerEvent('transitionEnd', {})
				// }, speed)

			} catch (err) {
				console.error(err, 'slideTo[Function]');
			}
		}
	}
})


function defineProperty(obj, key, value) {
	if (key in obj) {
		Object.defineProperty(obj, key, {
			value: value,
			enumerable: true,
			configurable: true,
			writable: true
		});
	} else {
		obj[key] = value;
	}

	return obj;
};