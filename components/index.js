// components/slide-page/index.js
import slideItem from './item/index.js';
const { windowWidth, windowHeight } = wx.getSystemInfoSync();

Component({
  /**
   * global data
   */
	AXIS: 'X', // slide 方向
	SLIDE_ITEM_SIZE: windowWidth, // slide item 大小
	SLIDE_LENGTH: 3, // 最大渲染的 item 长度
	loaded: false,
	touchStartTime: 0,
	activeIndex: 0, // 当前
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
		// viewData: [], // 要渲染的data
		activeDataIndex: 0,
	},
  lifetimes: {
    attached() {
      const { direction, width, height } = this.properties
      this.AXIS = direction === 'horizontal' 
        ? 'X' 
        : 'Y';
      this.SLIDE_ITEM_SIZE = direction === 'horizontal'
        ? width
        : height;
  
      this.activeIndex = 0
      this.data.activeDataIndex = 0
      this.SLIDE_LENGTH = 3
  
      // this.data.viewData = this.properties.data.slice(0, 2)
			// this.data.viewData = this.properties.data
			this.syncView('activeDataIndex')
      // this.syncView('viewData')
        .then(_ => {
          this.loaded = true
          this.triggerEvent('inited', {
            activeIndex: this.data.activeDataIndex,
            // viewData: this.data.viewData
          })
        })
    },  
  },
  
	methods: {
		// handler
		touchstart(e) {
			if (!this.loaded) return;
			
			const	AXIS = this.AXIS
			const	activeIndex = this.activeIndex
			const	SLIDE_ITEM_SIZE = this.SLIDE_ITEM_SIZE;

      const touch = e.changedTouches[0] || {};
      
			var translate = -activeIndex * SLIDE_ITEM_SIZE;

      // 触摸起始位置
      this['touchStart' + AXIS] = touch['client' + AXIS] || 0;
      // 将偏移距离
      this['translate' + AXIS] = translate;
      // 触摸开始时间
			this.touchStartTime = Date.now();

			this.slideAnimation(translate, 0);
		},
		touchmove(e) {
			if (!this.loaded) return;
			
			const AXIS = this.AXIS;
			const touch = e.changedTouches[0] || {};
      const start = touch['client' + AXIS] || 0;
      // 触摸拖动距离的偏移
      var tmpMove = this['translate' + AXIS] + start - this['touchStart' + AXIS];
      console.log(tmpMove)

			this.slideAnimation(tmpMove, 0);
		},
		touchend(e) {
			if (!this.loaded) return;

			const AXIS = this.AXIS
			const speed = this.properties.speed
			const touchStartTime = this.touchStartTime
			const SLIDE_ITEM_SIZE = this.SLIDE_ITEM_SIZE;

			const touch = e.changedTouches[0] || {};
			var end = touch['client' + AXIS] || 0;
			var touchEndTime = Date.now();

			var action = this.action(touchStartTime, touchEndTime, this['touchStart' + AXIS], end, SLIDE_ITEM_SIZE);

			this[action](speed);
		},

		/**
     * 平移动画
     * @param {number} [translate=0] 平移位置
     * @param {number} [speed=300] 过渡时长
     * @param {string} [timingFunction='ease'] 过渡类型
     */
		slideAnimation(translate = 0, speed = 300, timingFunction = 'ease') {
      const AXIS = this.AXIS
      
			const REG = {
				SPEED: /^(0|[1-9][0-9]*|-[1-9][0-9]*)$/,
				TIMINGFUNCTION: /linear|ease|ease-in|ease-in-out|ease-out|step-start|step-end/
			};

			try {
				if (!REG.SPEED.test(speed)) throw 'paramType: speed';
				if (!REG.TIMINGFUNCTION.test(timingFunction)) throw 'paramType: timingFunctions';
       
				const animation = wx.createAnimation({
					transformOrigin: '50% 50%',
					duration: speed,
					timingFunction,
					delay: 0
				});

				animation['translate' + AXIS](translate).step(); //  动画描述
				// 同步动画到视图
				this.syncView('animationData', animation.export())
			} catch (err) {
				console.error(err, 'slideAnimation[Function]');
			}
		},

		/**
     * 获取操作，统一处理
     * @param {number} touchStartTime 手指触碰slide时的时间戳
     * @param {number} touchEndTime 手指离开slide时的时间戳
     * @param {number} from 手指触碰slide时的屏幕位置
     * @param {number} to 手指离开slide时的屏幕位置
     * @param {number} wrapperDistance slide滑动方向上的容器长度
     * @return {string} actionName
     */
		action(touchStartTime, touchEndTime, from, to, wrapperDistance) {
			const activeIndex = this.activeIndex
			const deltaTouchTime = touchEndTime - touchStartTime; //  手指触摸时长
			const distance = Math.abs(to - from); //  滑动距离

			const k = distance / deltaTouchTime;

			// slide达到过渡条件时执行
			this.triggerEvent('transitionStart', {
				activeIndex: this.data.activeDataIndex
			})

			if (to > from) {
				return k > 0.3 || distance > wrapperDistance / 2 
					? (activeIndex === 0 ? 'slideBack' : 'slidePrev')
					: 'slideBack';
			}

			if (to < from) {
				return k > 0.3 || distance > wrapperDistance / 2
					? (activeIndex === this.SLIDE_LENGTH - 1 ? 'slideBack' : 'slideNext')
					: 'slideBack';
			}

			if (to = from) {
				return 'slideBack';
			}
		},

		/**
     * 同步到视图
     * @param {string} viewName 视图key值
     * @param {*} [prop] 视图key对应得value
     */
		syncView(viewName, prop) {
			if (typeof prop === 'undefined') {
				prop = this.data[viewName]
			} else {
				this.data[viewName] = prop
			}
			return new Promise(resolve => {
				this.setData(defineProperty({}, "" + viewName, prop), resolve);
			})
		},

		/**
     * 切换至下一个slide
     * @param {number} [speed=300] (单位ms)，切换速度
     */
		slideNext(speed = 300) {
      this.data.activeDataIndex += 1
      
			const { data } = this.properties
      const { activeDataIndex } = this.data

			const targetIndex = this.activeIndex + 1
			this.slideTo(targetIndex, speed);

			const eventDetail = _ => ({
				activeIndex: activeDataIndex,
				previousIndex: activeDataIndex - 1,
        // viewData: this.data.viewData
        viewData: data.filter((_, i) => (i >= activeDataIndex - 1 && i <= activeDataIndex + 1))
			})

			this.triggerEvent('changeStart', eventDetail())

			setTimeout(_ => {
				if (activeDataIndex < data.length - 1) {
					// this.data.viewData = data.slice(this.data.activeDataIndex - 1, this.data.activeDataIndex + 2)
					// this.syncView('viewData')
					
					if (this.activeIndex > 1 && activeDataIndex > 0) {
						this.activeIndex -= 1
						this.slideAnimation((-this.activeIndex) * this.SLIDE_ITEM_SIZE, 0)
					}
				} else {
					this.activeIndex = 2
				}

				this.syncView('activeDataIndex')

				this.triggerEvent('changeEnd', eventDetail())
				this.triggerEvent('transitionEnd', eventDetail())
			}, speed)
		},

    /**
     * 切换至上一个slide
     * @param {number} [speed=300] (单位ms)，切换速度
     */
		slidePrev(speed = 300) {
      this.data.activeDataIndex -= 1

      const { data } = this.properties
      const { activeDataIndex } = this.data

			const targetIndex = this.activeIndex - 1
			this.slideTo(targetIndex, speed);

			const eventDetail = _ => ({
				activeIndex: activeDataIndex,
				previousIndex: activeDataIndex + 1,
        // viewData: this.data.viewData
        viewData: data.filter((_, i) => (i >= activeDataIndex - 1 && i <= activeDataIndex + 1))
			})

			this.triggerEvent('changeStart', eventDetail())

			setTimeout(_ => {

				if (this.data.activeDataIndex > 0) {
					// this.data.viewData = data.slice(this.data.activeDataIndex - 1, this.data.activeDataIndex + 2)
					
					if (this.activeIndex === 0 && this.data.activeDataIndex > 0) {
						this.activeIndex = 1
						this.slideAnimation(-this.activeIndex * this.SLIDE_ITEM_SIZE, 0)
					}
				} else {
					// this.data.viewData = data.slice(0, 2)
					this.activeIndex = 0
				}
				this.syncView('activeDataIndex')

				this.triggerEvent('changeEnd', eventDetail())
				this.triggerEvent('transitionEnd', eventDetail())
				// this.syncView('viewData')
			}, speed)
		},

    /**
     * 回弹
     * @param {number} [speed=300] (单位ms)，切换速度
     */
		slideBack(speed = 300) {
      
      const { data } = this.properties
      const { activeDataIndex } = this.data
			const activeIndex = this.activeIndex
			const SLIDE_ITEM_SIZE = this.SLIDE_ITEM_SIZE

			var translate = -activeIndex * SLIDE_ITEM_SIZE;

			this.slideAnimation(translate, speed);

			setTimeout(_ => {
				this.triggerEvent('transitionEnd', {
					activeIndex: activeDataIndex,
					previousIndex: data.length > 1 ? (activeDataIndex > 0 ? activeDataIndex - 1 : 1) : activeDataIndex,
          // viewData: this.data.viewData
          viewData: data.filter((_, i) => (i >= activeDataIndex - 1 && i <= activeDataIndex + 1))
				})
			}, speed)
		},

		/**
     * 切换到指定slide
     * @param {number} index 索引
     * @param {number} [speed=300] 切换速度
     */
		slideTo(index, speed = 300) {
			const SLIDE_LENGTH = this.SLIDE_LENGTH
			const activeIndex = this.activeIndex
			const	SLIDE_ITEM_SIZE = this.SLIDE_ITEM_SIZE

			try {
				if (typeof index !== 'number') throw 'paramType: index'; //  参数类型错误
				if (index < 0 || index > SLIDE_LENGTH - 1) throw 'bound'; //  越界

				this.activeIndex = index;

				// const eventDetail = {
				// 	activeIndex: this.data.activeDataIndex,
				// 	previousIndex: this.data.activeDataIndex + (activeIndex > index ? 1 : -1),
				// 	viewData: this.data.viewData
				// }

				// this.triggerEvent('changeStart', eventDetail)

				var translate = -index * SLIDE_ITEM_SIZE;
				this.slideAnimation(translate, speed);

				// 从一个slide过渡到另一个slide结束后执行
				// setTimeout(_ => {
					// this.syncView('activeIndex', this.activeIndex)
					// this.triggerEvent('transitionEnd', {})
				// }, speed)

			} catch (err) {
				console.error(err, 'slideTo[Function]');
			}
		}
	}
})

/**
 * defineProperty
 * @param {object} [obj={}]
 * @param {string} key
 * @param {*} value
 * @return {object} obj
 */
function defineProperty(obj = {}, key, value) {
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