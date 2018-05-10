import * as utility from "@core/assets/js/components/utility";

/**
 * Insert balance for mobile/tablet
 */
export default function mobileBalance(balance) {
    var mobileHolder = document.querySelector(".account-balance");

    if (mobileHolder) {
        var link = mobileHolder.querySelector("a"),
            loader = mobileHolder.querySelector("div");

        mobileHolder.querySelector(".account-balance-amount").innerHTML = balance;

        utility.removeClass(link, "hidden");
        utility.addClass(loader, "hidden");
    }
}
