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
    private passwordContainer: HTMLFormElement;

    constructor(options) {
        this.options = this.mergeDefaults(options);
        this.password = document.querySelector(this.options.selector);
        this.passwordContainer = utility.findParent(this.password, ".form-item");
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

        utility.listen(this.password, "focus", (event, src) => {
            this.options.isValid = 1;
            this.formAnnotationRender();
        });

        utility.listen(this.password, "keydown", (event, src) => {
            this.options.isValid = 1;
            this.formAnnotationRender();
        });

        utility.listen(this.password, "blur", (event, src) => {
            this.hideFormAnnotationMeter();
        });
    }

    private passwordMeterContruct() {
        const strength = this.passwordStrengthTest();
        this.passwordMeterRender(strength);
    }

    private passwordStrengthTest() {
        const password = this.password.value;
        const averageRegex = /(?=.*[A-Z])(?=.*[a-z])|(?=.*[A-Z])(?=.*[0-9])|(?=.*[a-z])(?=.*[0-9])/g;
        const strongRegex = /(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])/g;

        if (!(this.options.isValid) ||
            (utility.hasClass(this.passwordContainer, "has-error")) ||
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

        this.addInputClass(strength);

    }

    private addInputClass(strength) {
        utility.removeClass(this.passwordContainer, "form-item-hidden");
        utility.removeClass(this.passwordContainer, "form-item-weak");
        utility.removeClass(this.passwordContainer, "form-item-average");
        utility.removeClass(this.passwordContainer, "form-item-strong");

        if (strength !== "hidden") {
            utility.addClass(this.passwordContainer, "form-item-" + strength);
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

        this.passwordContainer.parentNode.insertBefore(formItem, this.passwordContainer.nextSibling);
    }

    private formAnnotationRender() {
        const strength = this.passwordStrengthTest();

        if (strength === "hidden" || strength === "weak" || strength === "average") {
            this.showFormAnnotationMeter(strength);
        }

        if (strength === "strong") {
            this.hideFormAnnotationMeter();
        }
    }

    private showFormAnnotationMeter(strength) {
        const annotationElem = this.createAnnotation.call(this, strength);
        const formField = utility.findParent(this.password, ".form-field");

        this.hideFormAnnotationMeter();

        formField.insertBefore(annotationElem, this.password.nextSibling);
    }

    private hideFormAnnotationMeter() {
        const annotationElem = this.passwordContainer.querySelector(".form-annotation-meter");

        if (annotationElem) {
            annotationElem.remove();
        }
    }

    private createAnnotation(strength) {
        const span = document.createElement("span");
        let annotationData;

        utility.addClass(span, "form-annotation-meter");

        switch (strength) {
            case "hidden":
                annotationData = this.password.getAttribute("data-annotation");
                break;
            case "weak":
                annotationData = this.password.getAttribute("data-annotation-weak");
                break;
            case "average":
                annotationData = this.password.getAttribute("data-annotation-average");
                break;
        }

        span.innerHTML = annotationData;

        return span;
    }
}
