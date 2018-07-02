import * as utility from "@core/assets/js/components/utility";

export default class BacktoTop {

    constructor() {
        this.bindEvent();
    }

    private bindEvent() {
        const scrollme = document.querySelector(".back-to-top");
        utility.addEventListener(window, "scroll", () => {
            const currentScrollTop = document.body.scrollTop + document.documentElement.scrollTop;

            if (currentScrollTop > 200) {
                utility.removeClass(scrollme, "hide");
            } else {
                utility.addClass(scrollme, "hide");
            }
        });

        utility.addEventListener(scrollme, "click", () => {
            utility.scrollTo(document.body, 600);
        });
    }
}
