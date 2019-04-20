export default Behavior({
	methods: {
		onCoverLoaded(e) {
			const i = +e.currentTarget.dataset.i
			this.setData({
				[`data[${i}].coverLoaded`]: true
			})
		},
		handleAudioPlay(e) {
			this.triggerEvent('audioplay', e)
		}
	}
})