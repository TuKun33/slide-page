declare namespace Component {
  interface Properties {
    data: any[],
		direction?: string,
		speed?: number,
		width?: number,
		height?: number,
		initialSlide?: number
  }

  namespace Event {
    interface detail {
      activeIndex: number,
      previousIndex: number,
      viewData: any[]
    }
  }

  interface TriggerEvent {
    transitionStart(event: Event): void,
    changeStart(event: Event): void,
    changeEnd(event: Event): void
  }
}