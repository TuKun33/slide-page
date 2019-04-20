# 滑动翻页组件

#### 封装此组件主要为了解决原生swiper item过多带来的性能问题
-

## Question 
1. 滑动过快小概率会闪屏（animate.transform切换时带来的闪动，可能item渲染内容过多闪动更明显）
2. 目前功能较单一，欢迎issue

## Get

> git clone https://github.com/TuKun33/slide-page.git

> 请直接用小程序开发工具导入预览


## Usage

复制 `components/*` 到你的`components/slide-page/` 目录

pages/index.json
```json
"components": {
	"slide-page": "components/slide-page/index"
}
```
pages/index.js
```javascript

Page({
	data: {
		slideData: [{...}, ...]
	},

	/**
	 * @param {object} e.detail - { activeIndex, previoursIndex, viewData }
	 */
	onSlideChangeStart(e) {},
	onSlideChangeEnd(e) {},
	onSlideTransitionStart(e) {},
	onSlideTransitionEnd(e) {}
})
```

pages/index.wxml
```xml
<slide-page
	data="{{ slideData }}"
	bind:changeStart="onSlideChangeStart"
	bind:changeEnd="onSlideChangeEnd"
	bind:transitionStart="onSlideTransitionStart"
	bind:transitionEnd="onSlideTransitionEnd"
	/>
```

components/slide-page/item/*
```xml
这是你自己改写的部分
处理 slide-item 的渲染与逻辑
```

#### 详细用法请参考代码

