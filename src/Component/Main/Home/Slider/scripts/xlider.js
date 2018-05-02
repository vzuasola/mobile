import * as utility from '@core/assets/js/components/utility';

/**
 * Slider
 *
 * @param options must be array
 * Available options:
 *     selector: The parent wrapper of slider items
 *     innerSelector: Inner selector between the slider parent wrapper and slider items.
 *     childClassSelector: child slider class selector
 *     auto: for automatic start of transition
 *     controls: for adding of controls(prev and next) to slider
 *     pager: for adding of pager/ticker selector to slider
 *     speed: for adding custom transition speed to slider
 *     currentSlide: for custom start slide index
 */
export default function Slider(options) {
    "use strict";

    var $this = this,
        $pagerSelector,
        $previous,
        $next,
        slideInterval = null,
        $selector,
        $slides;

    /**
     * Initiate Functions
     */
    this.init = function () {
        setOptions();

        $selector = document.querySelector($this.options.selector);
        $slides = $selector.querySelector($this.options.innerSelector).children;

        utility.forEach($slides, function (elem) {
            elem.className = $this.options.childClassSelector + " slides-item";
        });

        $slides[$this.options.currentSlide].className = $this.options.childClassSelector + " slides-item showing slides-item--showNext";

        // Check if main slider exists
        if ($selector && ($slides.length > 1)) {
            if ($this.options.auto) {
                slideInterval = setInterval(nextSlide, $this.options.speed);
            }

            if ($this.options.controls) {
                initControls();
            }

            if ($this.options.pager) {
                initPager();
            }

            // Init the main slider. We set the first dot and slide to be shown onload.
            $slides[$slides.length - 1].className = $this.options.childClassSelector + " slides-item slides-item--hidePrevious";
        }
    }

    /**
     * Map Slider Options
     */
    function setOptions() {
        // Default options
        $this.defaults = {
            selector: ".banner",
            innerSelector: ".banner-slides",
            childClassSelector: "banner-slides-item",
            auto: true,
            controls: true,
            pager: true,
            speed: 4000,
            currentSlide: 0
        };

        // Extend options
        $this.options = options || {};

        for (var name in $this.defaults) {
            if ($this.options[name] === undefined) {
                $this.options[name] = $this.defaults[name];
            }
        }
    }

    /**
     * Intiate controller
     */
    function initControls() {
        createControls();
        onclickControls();
    }

    /**
     * Create slider controller
     */
    function createControls() {
        var iconPrev = "<svg viewBox='0 0 70.233 162.231'><path d='M21.782 54.001L64.614 0l5.619 4.213L9.131 81.467l61.102 76.551-5.619 4.213L0 81.467l21.782-27.466'/></svg>";
        var iconNext = "<svg viewBox='0 0 70.233 162.231'><path d='M48.451 108.229L5.619 162.23 0 158.017l61.102-77.254L0 4.212 5.619 0l64.614 80.764-21.782 27.465'/></svg>";
        var previousHtml = "<span class='" + $this.options.selector.substring(1) + " slider-button btn-prev'>" + iconPrev + "</span>";
        var nextHtml = "<span class='" + $this.options.selector.substring(1) + " slider-button btn-next'>" + iconNext + "</span>";
        var controllerHtml = "<div class='slider-controls'>" + previousHtml + nextHtml + "</div>";

        $selector.insertAdjacentHTML('beforeend', controllerHtml);
        $previous = $selector.querySelector("." + $this.options.selector.substring(1) + ".btn-prev");
        $next = $selector.querySelector("." + $this.options.selector.substring(1) + ".btn-next");
    }

    /**
     * Onclick function for control buttons
     */
    function onclickControls() {
        utility.addEventListener($next, "click", function (e) {
            pauseSlideshow();
            nextSlide();
            playSlideshow();
            utility.preventDefault(e);
        });
        utility.addEventListener($previous, "click", function (e) {
            pauseSlideshow();
            previousSlide();
            playSlideshow();
            utility.preventDefault(e);
        });
    }

    /**
     * Create and Initiate slider pager
     */
    function initPager() {
        var pagerHtml = "<div class='slider-pager'></div>";
        $selector.insertAdjacentHTML("beforeend", pagerHtml);
        var $pagerContainer = $selector.querySelector(".slider-pager");

        for (var j = 0; j < $slides.length; j++) {
            // Create pager button element
            pagerHtml = "<button class='pager-item' data-index='" + j + "'></button>";
            $pagerContainer.insertAdjacentHTML("beforeend", pagerHtml);

            var $pager = $selector.querySelectorAll(".pager-item");
            onclickPager($pager, j);
        }

        $pagerSelector = document.querySelectorAll($this.options.selector + " .pager-item");
        $pagerSelector[$this.options.currentSlide].className = "pager-item active";
    }

    /**
     * Onclick function for control pager
     */
    function onclickPager($pager, j) {
        utility.addEventListener($pager[j], "click", function () {
            var dataIndex = parseInt(this.getAttribute("data-index"));
            pauseSlideshow();
            goToSlide(dataIndex);
            playSlideshow();
        });
    }

    // Next Slide
    function nextSlide() {
        goToSlide($this.options.currentSlide + 1);
    }

    // Previous Slide
    function previousSlide() {
        goToSlide($this.options.currentSlide - 1);
    }

    // Go to nth slide
    // Add relevant classes for current and previous slides
    function goToSlide(n) {
        if ($this.options.pager) {
            utility.forEach($pagerSelector, function (elem) {
                utility.removeClass(elem, "active");
            });
        }

        utility.forEach($slides, function (elem) {
            elem.className = $this.options.childClassSelector + " slides-item";
        });

        $this.options.currentSlide = (n + $slides.length) % $slides.length;
        $slides[$this.options.currentSlide].className = $this.options.childClassSelector + " slides-item showing slides-item--showNext";

        if ($this.options.pager) {
            utility.addClass($pagerSelector[$this.options.currentSlide], "active");
        }
        // Fix out of bounds for previous slide index when current slide is 0
        var prevIndex = (($this.options.currentSlide) === 0) ? ($slides.length - 1) : ($this.options.currentSlide - 1);
        $slides[prevIndex].className = $this.options.childClassSelector + " slides-item slides-item--hidePrevious";
    }

    // Pauses slideshow when triggered
    function pauseSlideshow() {
        clearInterval(slideInterval);
    }

    // Plays slideshow when triggered
    function playSlideshow() {
        if ($this.options.auto) {
            slideInterval = setInterval(nextSlide, $this.options.speed);
        }
    }
}
