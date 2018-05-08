import * as utility from '@core/assets/js/components/utility';

export default function Swipe(element) {

	this.element = element;
	var $this = this;

	// These events for firefox and webkit-based browsers
	this.element.addEventListener('touchstart', function (evt) {
		$this.start.call($this, evt);
	});
	this.element.addEventListener('touchmove', function (evt) {
		$this.move.call($this, evt);
	});
	this.element.addEventListener('touchend', function (evt) {
		$this.end.call($this, evt);
	});

	// If we want to support pointer events, we need to make sure mouse events are disabled.
	if (window.navigator.msPointerEnabled) {
		this.element.addEventListener('MSPointerDown', function (evt) {
			$this.start.call($this, evt);
		});
		this.element.addEventListener('MSPointerMove', function (evt) {
			$this.move.call($this, evt);
		});
		this.element.addEventListener('MSPointerUp', function (evt) {
			$this.end.call($this, evt);
		});
	} else {
		//These events for all browsers that support mouse events
		this.element.addEventListener('mousedown', function (evt) {
			$this.start.call($this, evt);
		});
		this.element.addEventListener('mousemove', function (evt) {
			$this.move.call($this, evt);
		});
		this.element.addEventListener('mouseup', function (evt) {
			$this.end.call($this, evt);
		});
	}

	this.swipeLeftEvent = new CustomEvent('swipeleft');
	this.swipeRightEvent = new CustomEvent('swiperight');
}

Swipe.prototype.start = function (evt) {
	//We need to know where we started from later to make decisions on the nature of the event.
	this.initialLocation = this.getPosition(evt);
	console.log("this.initialLocation ", this.initialLocation);
	this.inProgress = true;
	this.startTime = new Date();
}

Swipe.prototype.move = function (evt) {
	if (!this.inProgress) {
		return false;
	}

	var currentLocation = this.getPosition(evt, this.element);
	var verticalDelta = Math.abs(currentLocation.y - this.initialLocation.y);

	if (verticalDelta > 50) {
		this.inProgress = false;
	}
}

Swipe.prototype.end = function (evt) {
	var timeDelta = new Date() - this.startTime;

	if (timeDelta > 700) {
		return;
	}

	if (!this.inProgress) {
		return;
	}

	var currentLocation = this.getPosition(evt, this.element);
	var delta = Math.abs(currentLocation.x - this.initialLocation.x);

	if (delta < 100)
		return;

	if (currentLocation.x > this.initialLocation.x) {
		//If you end to the right of where you started, you swipe right.
		this.element.dispatchEvent(this.swipeRightEvent, evt);
	} else if (currentLocation.x < this.initialLocation.x) {
		//If you end to the left of where you started, you swipe left.
		this.element.dispatchEvent(this.swipeLeftEvent, evt);
	}
}

Swipe.prototype.getPosition = function(evt) {
	var pageX, pageY;

	if (evt.touches) {
		//If this is a touch event
		pageX = evt.changedTouches[0].pageX;
		pageY = evt.changedTouches[0].pageY;
	} else {
		//If this is a mouse or pointer event
		pageX = evt.pageX;
		pageY = evt.pageY;
	}

	return {
		y: pageY,
		x: pageX
	};
}
