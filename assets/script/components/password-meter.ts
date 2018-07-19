import * as utility from "@core/assets/js/components/utility";
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

export default class PasswordMeter {
    private options: any;
    private password: HTMLFormElement;

    constructor(options) {
        this.options = this.mergeDefaults(options);
        this.password = document.querySelector(this.options.selector);
    }

    init() {
        this.generateMarkup();
        this.bindEvent();
    }

    private mergeDefaults(options) {
        const strengths = {
            weak: "Weak",
            average: "Average",
            strong: "Strong",
            label: "Password strength",
        };

        const defaults = {
            selector: "#RegistrationForm_password",
            strength: strengths,
            wrapperSelector: ".password_meter_wrapper",
            event: "blur",
            isValid : 0,
        };

        const userDefaults = options;
        for (const attrname in userDefaults) {
            if (userDefaults[name] === undefined) {
                defaults[attrname] = userDefaults[attrname];
            }
        }

        return defaults;
    }

    private bindEvent() {
        this.password.addEventListener(this.options.event, (event) => {
            this.options.isValid = 1;
            this.passwordMeterContruct();
        });

        if (this.options.event === "blur") {
            this.password.addEventListener("focus", (event) => {
                this.options.isValid = 0;
                this.passwordMeterContruct();
            });
        }
    }

    private passwordMeterContruct() {
        const strength = this.passwordStrengthTest();
        this.passwordMeterRender(strength);
    }

    private passwordStrengthTest() {
        const password = this.password.value;
        const averageRegex = /(?=.*[A-Z])(?=.*[a-z])|(?=.*[A-Z])(?=.*[0-9])|(?=.*[a-z])(?=.*[0-9])/g;
        const strongRegex = /(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])/g;
        const parent = utility.findParent(this.password, ".form-item");

        if (!(this.options.isValid) ||
            (utility.hasClass(parent, "has-error")) ||
            (this.password.value === "")) {
            return "hidden";
        }

        if (strongRegex.test(password)) {
            return "strong";
        }

        if (averageRegex.test(password)) {
            return "average";
        }

        return "weak";
    }

    private passwordMeterRender(strength) {
        const wrapper = document.querySelector(this.options.wrapperSelector);
        const passwordMeterWrapper = document.querySelector(".password-meter");
        const strengthBar = document.querySelector(".password-meter-bar");

        utility.removeClass(wrapper, "password-meter-hidden");
        utility.removeClass(wrapper, "password-meter-weak");
        utility.removeClass(wrapper, "password-meter-average");
        utility.removeClass(wrapper, "password-meter-strong");

        if (strength !== "hidden") {
            utility.removeClass(passwordMeterWrapper, "hidden");
            wrapper.style.display = "block";
            utility.addClass(wrapper, "password-meter-" + strength);
            strengthBar.innerHTML = this.options.strength[strength];
        }

        if (strength === "hidden") {
            utility.addClass(passwordMeterWrapper, "hidden");
            wrapper.style.display = "none";
            utility.addClass(wrapper, "password-meter-hidden");
            strengthBar.innerHTML = "";
        }
    }

    private generateMarkup() {
        const formItem = document.createElement("div");
        utility.addClass(formItem, "form-item");
        utility.addClass(formItem, "hidden");
        utility.addClass(formItem, "password-meter");

        const markupHtml = `<label class="form-label"></label><div class="form-field">
            <div class="password_meter_wrapper password-meter-hidden" style="display:none">
            <div class="password-meter-bar-bg"><div class="password-meter-bar"></div></div></div></div>`;

        formItem.innerHTML = markupHtml;

        const passwordFieldParent = utility.findParent(this.password, ".form-item");
        passwordFieldParent.parentNode.insertBefore(formItem, passwordFieldParent.nextSibling);
    }
}
