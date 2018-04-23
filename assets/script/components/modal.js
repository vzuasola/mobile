/**
 * Custom modal - supports IE8
 *
 * @author lvicario
 */

import * as utility from '@core/assets/js/components/utility';
import scrollbot from '@app/assets/script/vendor/scrollbot';

var closeOverlayId = [],
    escapeCloseId = [];

export function modal(options) {
    // Default options
    var defaults = {
        selector: ".modal-trigger", // selector to trigger modal
        closeOverlayClick: true, // true/false - close modal on click on overlay
        closeTriggerClass: ".modal-close", // class to trigger to close the modal
        escapeClose: true, // close modal on escape key
        id: null, // modal id,
        onClose: null,
        maxHeight: 500
    };

    // extend options
    options = options || {};
    for (var name in defaults) {
        if (options[name] === undefined) {
            options[name] = defaults[name];
        }
    }

    // store in array the modals configured to closeOverlayClick
    if (options.id && !options.closeOverlayClick) {
        closeOverlayId.push(options.id);
    }

    // store in array the modals configured to escapeClose
    if (options.id && !options.escapeClose) {
        escapeCloseId.push(options.id);
    }

    // initiate variables
    var bodyTag = document.body,
        $this = this;

    /**
     * modal-active modal window function
     */
    function openModal() {
        // Attach event to the <body> tag
        utility.addEventListener(bodyTag, "click", function (evt) {

            // Cross browser event
            evt = evt || window.event;

            // get srcElement if target is falsy (IE8)
            var target = evt.target || evt.srcElement;

            while (target) {
                if (target.tagName === 'A') {
                    break;
                }
                target = target.parentNode;
            }

            // Trigger modal on click on element with ".modal-trigger" class
            utility.forEachElement(options.selector, function (elem) {
                if (target === elem) {
                    var targetId = elem.getAttribute('href').substr(1),
                        modalWindow = document.getElementById(targetId),
                        $modalScrollable = '#' + targetId + ' .modal-body',
                        modalScrollContainer = document.querySelector($modalScrollable).children[0];
                    if (modalWindow) {
                        utility.triggerEvent(modalWindow, 'modal.open');
                        utility.addClass(modalWindow, "modal-active");

                        // Avoid scrolling when modal is displayed
                        bodyTag.style.overflow = "hidden";
                        utility.preventDefault(evt);

                        if (utility.hasClass(modalScrollContainer, 'modal--container')) {
                            modalScrollBot(modalWindow, $modalScrollable);
                        }

                    }
                }

            });
        });

    }

    /**
     * Close modal function
     */
    function closeModal() {
        // Close modal on click on element with ".modal-close" class
        utility.addEventListener(bodyTag, "click", function (evt) {

            // Cross browser event
            evt = evt || window.event;
            // get srcElement if target is falsy (IE8)
            var target = evt.target || evt.srcElement;

            var buttonClass = options.closeTriggerClass.replace('.', '');
            // Get the parent modal of target
            var modal = utility.findParent(target, '.modal-active');

            if (utility.hasClass(target, buttonClass) && modal) {
                utility.preventDefault(evt);
                closeModalWindow(modal, target);
            }
        });

        // Close modal on click of overlay
        utility.addEventListener(bodyTag, "click", function (evt) {

            // Cross browser event
            evt = evt || window.event;
            // get srcElement if target is falsy (IE8)
            var target = evt.target || evt.srcElement;
            // Check if target is "modal-overlay" and that modal id is not in the list of closeOverlayId
            if (utility.hasClass(target, 'modal-overlay') && closeOverlayId.indexOf(target.parentNode.id) === -1) {
                closeModalWindow(target.parentNode, target);
                utility.preventDefault(evt);
            }
        });

        // Close modal on clicking Escape key
        utility.addEventListener(bodyTag, 'keydown', function (evt) {

            // Cross browser event
            evt = evt || window.event;

            if (evt.keyCode === 27) {

                utility.forEachElement('.modal-overlay', function (elem) {
                    // Check if modal id is not in the list of closeOverlayId
                    if (escapeCloseId.indexOf(elem.parentNode.id) === -1) {
                        closeModalWindow(elem.parentNode);
                    }
                });
            }
        });
    }

    /**
     * Create Overlay
     */
    function modalOverlay() {
        utility.forEachElement('.modal', function (elem) {
            if (!elem.querySelector('.modal-overlay')) {
                var overlay = document.createElement("div");
                overlay.className = "modal-overlay";
                elem.insertBefore(overlay, elem.firstChild);

                if (utility.hasClass(elem, 'modal-active')) {
                    bodyTag.style.overflow = "hidden";
                }
            }
        });
    }

    /**
     * Vertically center modal container
     */
    function centerModalContent() {
        utility.forEachElement('.modal-content', function (elem) {
            // Use setTimeout so images are fully loaded before getting the height of the container
            setTimeout(function () {
                var modalContentHeight = elem.clientHeight;

                // Modal content is 50% vertically positioned in scss/css, adding negative margin
                // half the height of modal content will vertically center the modal content
                elem.style.marginTop = -(modalContentHeight / 2) + "px";
            }, 500);
        });
    }

    /**
     * Option to load modal on load
     * Just a class of ".modal-trigger-onload" to modal trigger
     * You can also add a ".hidden" class to modal trigger so it won't display
     */
    function openModalOnLoad() {
        utility.forEachElement('.modal-trigger-onload', function (elem) {
            utility.triggerEvent(elem, "click");
        });
    }

    /**
     * Remove "modal-active" class
     * Change body overflow to "inherit"
     * Execute onClose function if set
     */
    function closeModalWindow(modalWindow, target) {
        utility.removeClass(modalWindow, "modal-active");
        utility.triggerEvent(modalWindow, 'modalclose', target);

        // Reset overflow scrolling on the <body> tag on close
        bodyTag.style.overflow = "inherit";

        if (options.onClose && typeof options.onClose === 'function') {
            options.onClose();
        }
    }

    function modalScrollBot(modalWindow, $modalScrollable) {
        setTimeout(function () {
            var scrollObj = null,
                mBody = modalWindow.querySelector('.modal-body'),
                containerHeight = mBody.querySelector('.modal--container').clientHeight;

            if (containerHeight > options.maxHeight) {
                mBody.style.height = options.maxHeight + 'px';


                if (!scrollObj) {
                    scrollObj = new scrollbot($modalScrollable);
                }
            } else {
                mBody.style.height = 'auto';
            }

            if (scrollObj) {
                scrollObj.refresh();
                scrollObj.setScroll(0, 100);
            }
        }, 1);
    }

    /**
     * Trigger modal window functions on dom ready
     */
    utility.ready(function () {
        modalOverlay();
        openModal();
        closeModal();
        openModalOnLoad();
    });

    // Required when content generated via ajax call
    this.centerModalContent = centerModalContent;
}
