import * as utility from '@core/assets/js/components/utility';

export default function menu(component) {
    // Global vars
    var mobileIcon = component.querySelector('.mobile-menu-icon'),
        mobileMenu = component.querySelector('.mobile-menu');

    // Detect touch support
    var eventType = (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) ? "touchend" : "click";

    // Event
    utility.addEventListener(document, eventType, function (e) {
        var target = utility.getTarget(e);

        if (target === mobileIcon || target.parentNode === mobileIcon) {
            openMenu();
        } else if (utility.hasClass(target, "close-svg") || utility.hasClass(target, "mobile-menu-overlay")) {
            closeMenu();
        }
    });

    function openMenu() {
        utility.addClass(component, 'menu-open');
        createOverlay();
    }

    function closeMenu() {
        utility.removeClass(component, 'menu-open');
    }

    function createOverlay() {
        if (!component.querySelector('.mobile-menu-overlay')) {
            var overlay = document.createElement("div");
            utility.addClass(overlay, "mobile-menu-overlay");
            mobileMenu.parentNode.insertBefore(overlay, mobileMenu);
        }
    }
}
