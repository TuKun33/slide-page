const dailys = require('../../mock/dailys.js')

Page({
	data: {
		dailys
	},
	onShareAppMessage() {
		return {
			path: this.route
		}
	}
})
