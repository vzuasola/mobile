import * as utility from '@core/assets/js/components/utility';

export default function Swipe(element) {

	this.element = element;
	var $this = this;

	// firefox and webkit-based browsers
	utility.addEventListener(this.element, 'touchstart', function (e) {
		$this.start.call($this, e);
	});
	utility.addEventListener(this.element, 'touchmove', function (e) {
		$this.move.call($this, e);
	});
	utility.addEventListener(this.element, 'touchend', function (e) {
		$this.end.call($this, e);
	});

	// Support for pointer events
	if (window.navigator.msPointerEnabled) {
		utility.addEventListener(this.element, 'MSPointerDown', function (e) {
			$this.start.call($this, e);
		});
		utility.addEventListener(this.element, 'MSPointerMove', function (e) {
			$this.move.call($this, e);
		});
		utility.addEventListener(this.element, 'MSPointerUp', function (e) {
			$this.end.call($this, e);
		});
	} else {
		// Browsers that support mouse events
		utility.addEventListener(this.element, 'mousedown', function (e) {
			$this.start.call($this, e);
		});
		utility.addEventListener(this.element, 'mousemove', function (e) {
			$this.move.call($this, e);
		});
		utility.addEventListener(this.element, 'mouseup', function (e) {
			$this.end.call($this, e);
		});
	}

	this.swipeLeftEvent = new CustomEvent('swipeleft');
	this.swipeRightEvent = new CustomEvent('swiperight');
}

Swipe.prototype.start = function (evt) {
	// Get initial coordinate position
	this.initialLocation = this.getPosition(evt);

	this.inProgress = true;
	this.startTime = new Date();
}

Swipe.prototype.move = function (evt) {
	if (!this.inProgress) {
		return false;
	}

	var currentLocation = this.getPosition(evt, this.element),
		verticalDelta = Math.abs(currentLocation.y - this.initialLocation.y);

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

	var currentLocation = this.getPosition(evt, this.element),
		delta = Math.abs(currentLocation.x - this.initialLocation.x);

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
