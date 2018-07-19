import * as utility from "Base/utility";

/**
 * Password Meter - A visual assessment of password strengths and weaknesses
 *
 * Available Options:
 *      selector: Field element selector
 *      strengths: Array of labels
 *      wrapperSelector: Password meter wrapper selector
 *      textWrapperSelector: Password meter strenght label wrapper selector
 *      event: Event method
 *
 * Usage:
 *      new PasswordMeter({
 *           selector: '#FieldSelector'
 *      });
 *
 */

export default function PasswordMeter(options) {
    "use strict";

    var $this = this;

    var strengths = {
        weak: 'Weak',
        average: 'Average',
        strong: 'Strong',
        label: 'Password strength'
    };

    // Default options
    var defaults = {
        selector: "#RegistrationForm_password",
        strength: strengths,
        wrapperSelector: '.password_meter_wrapper',
        event: 'blur',
        isValid : 0
    };

    // extend options
    $this.options = options || {};
    for (var name in defaults) {
        if ($this.options[name] === undefined) {
            $this.options[name] = defaults[name];
        }
    }

    if (document.querySelector(this.options.selector)) {
        this.init();
    }
}

PasswordMeter.prototype.init = function () {
    var $this = this;

    $this.generateMarkup();

    utility.addEventListener(document.querySelector($this.options.selector), $this.options.event, function (event) {
        $this.options.isValid = 1;
        $this.passwordMeterContruct();
    });

    if ($this.options.event === 'blur') {
        utility.addEventListener(document.querySelector($this.options.selector), 'focus', function (event) {
            $this.options.isValid = 0;
            $this.passwordMeterContruct();
        });
    }
};

PasswordMeter.prototype.passwordMeterContruct = function () {
    var strength = this.passwordStrengthTest();
    this.passwordMeterRender(strength);
};

PasswordMeter.prototype.passwordStrengthTest = function () {
    var $this = this,
        passwordField = document.querySelector($this.options.selector),
        password = passwordField.value,
        averageRegex = /(?=.*[A-Z])(?=.*[a-z])|(?=.*[A-Z])(?=.*[0-9])|(?=.*[a-z])(?=.*[0-9])/g,
        strongRegex = /(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])/g,
        parent = utility.findParent(passwordField, '.form-item');

    if (!($this.options.isValid) ||
        (utility.hasClass(parent, 'has-error')) ||
        (passwordField.value === '')) {
        return 'hidden';
    }

    if (strongRegex.test(password)) {
        return 'strong';
    }

    if (averageRegex.test(password)) {
        return 'average';
    }

    return 'weak';
};

PasswordMeter.prototype.passwordMeterRender = function (strength) {
    var wrapper = document.querySelector(this.options.wrapperSelector),
        passwordMeterWrapper = document.querySelector('.password-meter'),
        strengthBar = document.querySelector(".password-meter-bar");

    utility.removeClass(wrapper, "password-meter-hidden");
    utility.removeClass(wrapper, "password-meter-weak");
    utility.removeClass(wrapper, "password-meter-average");
    utility.removeClass(wrapper, "password-meter-strong");

    if (strength !== "hidden") {
        utility.removeClass(passwordMeterWrapper, 'hidden');
        wrapper.style.display = 'block';
        utility.addClass(wrapper, "password-meter-" + strength);
        strengthBar.innerHTML = this.options.strength[strength];
    }

    if (strength === "hidden") {
        utility.addClass(passwordMeterWrapper, 'hidden');
        wrapper.style.display = 'none';
        utility.addClass(wrapper, "password-meter-hidden");
        strengthBar.innerHTML = "";
    }
};

PasswordMeter.prototype.generateMarkup = function () {
    var formItem = document.createElement('div');
    utility.addClass(formItem, 'form-item');
    utility.addClass(formItem, 'hidden');
    utility.addClass(formItem, 'password-meter');

    var markupHtml = '<label class="form-label"></label><div class="form-field"><div class="password_meter_wrapper password-meter-hidden" style="display:none">';
    markupHtml += '<div class="password-meter-bar-bg"><div class="password-meter-bar"></div></div></div></div>';

    formItem.innerHTML = markupHtml;
    var passwordField = document.querySelector(this.options.selector);

    var passwordFieldParent = utility.findParent(passwordField, '.form-item');
    passwordFieldParent.parentNode.insertBefore(formItem, passwordFieldParent.nextSibling);
};
