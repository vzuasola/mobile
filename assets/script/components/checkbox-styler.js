/**
 * Checkbox Styler
 *
 * Used to style checkbox form element
 *
 * @param Node el checkbox form element
 * @param String className class of the checkbox use for styling
 */
import * as utility from '@core/assets/js/components/utility';

export function CheckboxStyler(el, className) {
    this.el = el;
    this.className = className || "checkbox-styler";

    this.generateMarkup();
    this.checker(this.el);
    this.bindEvent();
}

// Generate markup wrapper
CheckboxStyler.prototype.generateMarkup = function () {
    var wrapper = document.createElement('span'),
        hand = document.createElement('span');

    utility.addClass(wrapper, this.className);

    wrapper.appendChild(hand);
    this.el.parentNode.insertBefore(wrapper, this.el);

    wrapper.appendChild(this.el);
};

CheckboxStyler.prototype.bindEvent = function () {
    var $this = this;

    utility.addEventListener($this.el, 'click', function (e) {
        $this.checker($this.el);
    });
};

CheckboxStyler.prototype.checker = function (el) {
    if (el.checked) {
        utility.addClass(el.parentNode, 'checked');
        utility.removeClass(el.parentNode, 'unchecked');
    } else {
        utility.addClass(el.parentNode, 'unchecked');
        utility.removeClass(el.parentNode, 'checked');
    }
};
