import * as utility from "@core/assets/js/components/utility";

export default class BacktoTop {
    private trigger;

    constructor(private element) {
        this.trigger = this.element.querySelector(".back-to-top");
    }

    bindEvent() {
        utility.addEventListener(window, "scroll", () => {
            const currentScrollTop = document.body.scrollTop + document.documentElement.scrollTop;

            if (currentScrollTop > 200) {
                utility.removeClass(this.trigger, "hide");
            } else {
                utility.addClass(this.trigger, "hide");
            }
        });

        utility.addEventListener(this.trigger, "click", () => {
            utility.scrollTo(document.body, 600);
        });
    }

     init() {
        this.bindEvent();
    }
}
