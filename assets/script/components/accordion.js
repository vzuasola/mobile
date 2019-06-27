/**
 * CKEditor Accordion functionality.
 *
 * TODO If we can make this class OOP much better, rather than everything being
 * a giant constructor
 *
 * Usage
 * accordion({ collapsible: true });
 */
import * as utility from "@core/assets/js/components/utility";

export default function accordion(element, options) {
    "use strict";

    // Default options
    var defaults = {
        collapsible: false
    };

    // create accordion functionality if the required elements exist is available.
    var ckeditorAccordion = element.querySelectorAll('.ckeditor-accordion'),
        doc = element,
        speed = 4;

    if (ckeditorAccordion.length > 0) {
        // extend options
        options = options || {};

        for (var name in defaults) {
            if (options[name] === undefined) {
                options[name] = defaults[name];
            }
        }

        // Create simple accordion mechanism for each tab.
        utility.forEach(ckeditorAccordion, function (elem) {
            var accordion = elem,
                dt = accordion.querySelectorAll('dt'),
                dd = accordion.querySelectorAll('dd');

            utility.forEach(dt, function (item) {
                var wrap = document.createElement("div"),
                    nextSibling = utility.nextElementSibling(item),
                    divs = [item, nextSibling],
                    spanTag = document.createElement('span');

                utility.addClass(spanTag, 'arrow');
                item.appendChild(spanTag);
                wrap.className = "ckeditor-wrapper";
                utility.forEach(divs, function (item) {
                    wrap.appendChild(item);
                });

                if (item.getAttribute("data-transition-top") === "true") {
                    wrap.appendChild(item);
                }
                accordion.appendChild(wrap);
            });

            utility.forEach(dd, function (item) {
                var wrapper = document.createElement("div");
                wrapper.className = "dd_wrapper";
                wrapper.innerHTML = item.innerHTML;
                item.innerHTML = '';
                item.appendChild(wrapper);
                item.style.height = 0;
                item.style.overflow = "hidden";
                item.style.transition = "height ." + speed + "s";
            });

            // Set active accordion for <dt> with class "active" on doc ready
            utility.forEach(dt, function (item) {
                if (utility.hasClass(item, "active")) {
                    setActive(item);
                }
            });

        });

        // Add click event to body once because quick edits & ajax calls might reset the HTML.
        utility.addEventListener(doc, 'click', function (e) {
            e = e || window.event;
            var target = e.target || e.srcElement;

            // Get parent DT if target is inside of DT
            if (target.tagName !== 'DT' && (target.parentNode !== null && target.parentNode.tagName === 'DT')) {
                target = target.parentNode;
            }

            if (target.tagName === 'DT') {
                setActive(target);
            }
        });

    }

    function setActive(dt) {
        var active_accordionWrapper = dt.parentNode,
            active_dd = active_accordionWrapper.querySelector('dd'),
            active_dd_height = active_dd.scrollHeight,
            accordionWrapper = dt.parentNode.parentNode.querySelectorAll('.ckeditor-wrapper');

        if (options.collapsible) {
            if (!utility.hasClass(active_accordionWrapper, 'active')) {
                utility.forEach(accordionWrapper, function (item) {
                    utility.removeClass(item, 'active');
                    utility.removeClass(item.querySelector('dt'), 'active');
                    utility.removeClass(item.querySelector('dd'), 'active');
                    item.querySelector('dd').style.height = 0;
                });

                utility.addClass(active_accordionWrapper, 'active');
                utility.addClass(active_dd, 'active');
                active_dd.style.height = active_dd_height + 'px';
            }
        } else {
            utility.toggleClass(active_accordionWrapper, 'active');
            utility.toggleClass(active_dd, 'active');

            if (active_dd_height === 0) {
                active_dd.style.height = active_dd_height + 'px';
            } else if (utility.hasClass(active_dd, 'active')) {
                active_dd.style.height = active_dd_height + 'px';
            } else {
                active_dd.style.height = 0;
            }
        }
    }
}
