import * as utility from '@core/assets/js/components/utility';

/**
 * Password Mark/Unmask
 *
 * @param Node input password element
 */
export function PasswordMask(input) {
    if (input && utility.hasClass(input, "password-mask-enabled")) {
        var icon = utility.findSibling(input, '.password-mask-icon');

        // show icon
        utility.removeClass(icon, "hidden");

        utility.addEventListener(icon, "click", changeType.bind(null, input));
    }
}

/**
 * Change input type
 */
function changeType(input) {
    var icon = utility.findSibling(input, '.password-mask-icon');

    if (input.type === "password") {
        input.setAttribute("type", "text");
    } else {
        input.setAttribute("type", "password");
    }

    utility.toggleClass(icon, "unmask");
}
