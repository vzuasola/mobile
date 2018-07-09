import * as utility from "Base/utility";
import xhr from "BaseVendor/reqwest";
import Loader from "Base/loader";
import CantLoginBase from "Site/cant-login/cant-login-base";

/**
 * Forgot username
 *
 * @param String url api url to fetch
 * @param String/Node emailField Selector/form element to validate for email
 */
export default function ForgotUsername(url, emailField) {
    this.url = url;
    this.emailField = (typeof emailField === "string") ? document.querySelector(emailField) : emailField;
}

// Inherit ForgotUsername prototype from CantLoginBase prototype
inheritPrototype(ForgotUsername, CantLoginBase);

ForgotUsername.prototype.init = function () {
    if (this.emailField) {
        this.emailContainer = utility.hasClass(this.emailField, "form-item", true);
        this.form = utility.findParent(this.emailField, "form");
        this.loader = new Loader(utility.hasClass(this.emailField, "form-item", true), false, 0);
        this.bindEvent();
    }
};

ForgotUsername.prototype.bindEvent = function () {
    var $this = this;

    // Listen form on submit
    utility.listen($this.form, "submit", function (event, src) {
        event.preventDefault();

        setTimeout(function () {
            if ($this.passwordField
                && !utility.hasClass($this.passwordField, "has-error", true)
                && !utility.hasClass($this.emailContainer, "has-error") ||
            !$this.passwordField
                && !utility.hasClass($this.emailContainer, "has-error")
            ) {
                $this.checkField();
            }
        }, 100);
    });

    // close button element on success/confirmation message
    var closeBtn = utility.findParent(this.form, "div").querySelector(".confirmation-message").querySelector(".btn");

    utility.listen(closeBtn, "click", function (event) {
        event.preventDefault();
        window.close();
    });
};

ForgotUsername.prototype.checkField = function () {
    var $this = this;

    // Remove/hide error message & Show loader
    $this.hideMessage($this.emailContainer);
    $this.loader.show();

    // Disable fields
    this.disableFields($this.form);

    xhr({
        url: $this.url,
        type: "json",
        method: "post",
        data: {
            "email": $this.emailField.value
        }
    })
        .then(function (resp) {
            if (resp.message === "FORGOT_USERNAME_SUCCESS") {
                $this.showConfirmationMessage($this.form);
            } else {
                $this.showMessage($this.emailContainer, $this.messageMapping(resp.message));
            }
        })
        .fail(function (err, msg) {
            $this.showMessage($this.emailContainer, "Error retrieving data...");
        })
        .always(function (resp) {
            $this.loader.hide();
            $this.enableFields($this.form);
        });
};

// Function to inherit prototype
function inheritPrototype(childObject, parentObject) {
    var copyOfParent = Object.create(parentObject.prototype);
    copyOfParent.constructor = childObject;
    childObject.prototype = copyOfParent;
}
