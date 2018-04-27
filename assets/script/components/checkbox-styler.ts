import * as utility from '@core/assets/js/components/utility';

/**
 * Checkbox Styler
 *
 * Used to style checkbox form element
 *
 * @param Node el checkbox form element
 * @param String className class of the checkbox use for styling
 */
export class CheckboxStyler {

    constructor(private el, private className: string = 'checkbox-styler') {}

    init() {
        this.generateMarkup();
        this.bindEvent();
        this.checker();
    }

    private generateMarkup() {
        let wrapper = document.createElement('span'),
            hand = document.createElement('span');

        utility.addClass(wrapper, this.className);

        wrapper.appendChild(hand);
        this.el.parentNode.insertBefore(wrapper, this.el);

        wrapper.appendChild(this.el);
    }

    private bindEvent() {
        utility.addEventListener(this.el, 'click', (e)=>  {
            this.checker();
        });
    }

    checker() {
        if (this.el.checked) {
            utility.addClass(this.el.parentNode, 'checked');
            utility.removeClass(this.el.parentNode, 'unchecked');
        } else {
            utility.addClass(this.el.parentNode, 'unchecked');
            utility.removeClass(this.el.parentNode, 'checked');
        }
    }
}
