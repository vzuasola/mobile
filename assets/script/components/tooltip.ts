import * as utility from "@core/assets/js/components/utility";

/**
 * Tooltip
 *
 * @param Node/String trigger selector or node element
 * @param String content tooltip content
 */
class Tooltip {
    private trigger: any;
    private triggerClass: string;
    private container: HTMLElement;
    private content: string;
    private active: boolean;

    constructor(trigger: any, content?: string) {
        this.trigger = (typeof trigger === "string") ? document.querySelector(trigger) : trigger;
        this.content = this.trigger.hasAttribute("data-tooltip-content")
                ? this.trigger.getAttribute("data-tooltip-content")
                : (content ? content : "");

        this.init();
    }

    init() {
        if (this.trigger && this.content) {
            this.active = false;
            this.triggerClass = "tooltip-trigger";
            utility.addClass(this.trigger, this.triggerClass);

            this.generateMarkup();
            this.bindEvent();
        }
    }

    showTooltip() {
        utility.removeClass(this.container, "hidden");
        utility.addClass(this.trigger, "active");
        this.active = true;
    }

    hideTooltip() {
        if (this.active) {
            utility.addClass(this.container, "hidden");
            utility.removeClass(this.trigger, "active");
            this.active = false;
        }
    }

    private bindEvent() {
        const eventType = utility.eventType();

        utility.listen(window, eventType, (event, src) => {
            const trigger = utility.hasClass(src, this.triggerClass, true);
            const container = utility.hasClass(src, "tooltip-container", true);

            if (this.active && container) {
                // Don't close on clicking tooltip content
                return;
            } else if (!this.active && trigger) {
                // show when clicking trigger and currently not active
                this.showTooltip();
            } else {
                // Close tooltip when clicking outside
                this.hideTooltip();
            }
        });
    }

    private generateMarkup() {
        this.container = utility.createElem("div", "tooltip-container", this.trigger);
        utility.addClass(this.container, "hidden");
        this.container.innerHTML = this.content;
    }
}

export default Tooltip;
