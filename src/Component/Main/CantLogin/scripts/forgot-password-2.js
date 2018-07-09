import ForgotUsername from "Site/cant-login/forgot-username";
import xhr from "BaseVendor/reqwest";

/**
 * Forgot password
 *
 * @param String url api url to fetch
 * @param String/Node emailField Selector/form element to validate for email
 * @param String/Node passwordField Selector/form element to validate for password
 */
export default function ForgotPassword(url, emailField, passwordField) {

    // Inherit Forgot Username constructor
    ForgotUsername.call(this, url, emailField);

    this.passwordField = (typeof passwordField === "string") ? document.querySelector(passwordField) : passwordField;

    // Override checkField method from ForgotUsername class
    this.checkField = function () {
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
                "username": $this.passwordField.value,
                "email": $this.emailField.value
            }
        })
            .then(function (resp) {
                if (resp.message === "FORGOT_PASSWORD_SUCCESS") {
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
}

// Inherit ForgotPassword prototype from ForgotUsername prototype
inheritPrototype(ForgotPassword, ForgotUsername);

// Function to inherit prototype
function inheritPrototype(childObject, parentObject) {
    var copyOfParent = Object.create(parentObject.prototype);
    copyOfParent.constructor = childObject;
    childObject.prototype = copyOfParent;
}
