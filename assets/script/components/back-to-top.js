import * as utility from "@core/assets/js/components/utility";

/**
 * Back to top scroll
 *
 * TODO
 * - Add proper doc blocks
 * - Make this OOP please
 * - Classes should not be hardcoded
 */
var scrollme = document.querySelector('.back-to-top');
export default function backToTop() {
    utility.addEventListener(window, 'scroll', function () {
        showIcon();
    });

    utility.addEventListener(scrollme, 'click', runScroll);
}

function showIcon() {
    var currentScrollTop = document.body.scrollTop + document.documentElement.scrollTop;
    if (currentScrollTop > 200) {
        utility.removeClass(scrollme, 'hide');
    } else {
        utility.addClass(scrollme, 'hide');
    }
}

function runScroll() {
    utility.scrollTo(document.body, 600);
}

backToTop();
