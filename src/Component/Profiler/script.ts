import * as utility from "@core/assets/js/components/utility";

import {Console} from "@core/assets/js/components/utils/console";

import {ComponentManager, ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import {Router, RouterClass} from "@core/src/Plugins/ComponentWidget/asset/router";
import {Profiler} from "./scripts/profiler";

/**
 *
 */
export class ProfilerComponent implements ComponentInterface {
    private stack = [];

    private profiler: Profiler;
    private frame = window as any;

    private isLoaded: boolean = false;

    constructor() {
        this.profiler = new Profiler();
        this.frame.profiler = this.profiler;

        ComponentManager.subscribe("console.push", (event, src, data) => {
            this.stack.push(data);

            if (this.isLoaded) {
                this.doConsolePush(data);
            }
        });

        utility.listen(document, "components.broadcast", (event, src, data) => {
            Console.push("", data.event, "Publishers");
        });

        utility.listen(document, "components.subscribe", (event, src, data) => {
            Console.push("", data.event, "Subscribers");
        });
    }

    onLoad(element: HTMLElement) {
        this.isLoaded = true;
        this.profiler.setElement(element);

        for (const item of this.stack) {
            this.doConsolePush(item);
        }

        Router.on(RouterClass.beforeNavigate, (event, src, data) => {
            Console.push("Router Navigate", data.url, "Router");
            Console.push("", data.components, "Router");
        });

        ComponentManager.subscribe("components.load", (event, src, data) => {
            Console.push("Component Load", data.stack, "Components");
        });

        ComponentManager.subscribe("components.reload", (event, src, data) => {
            Console.push("Component Reload", data.stack, "Components");
        });

        ComponentManager.subscribe("session.prelogin", () => {
            ComponentManager.refreshComponents(["profiler"]);
        });

        ComponentManager.subscribe("session.logout", () => {
            ComponentManager.refreshComponents(["profiler"]);
        });

        Router.on(RouterClass.beforeNavigate, () => {
            ComponentManager.refreshComponents(["profiler"]);
        });

        // On clear button click, clear the stack of previous entries
        utility.listen(document, "click", (event, src) => {
            if (utility.hasClass(src, "profiler-clear")) {
                for (const item of this.stack) {
                    if (src.getAttribute("data-profiler-group") === "console" && !item.group) {
                        this.stack.splice(this.stack.indexOf(item), 1);
                    }

                    if (src.getAttribute("data-profiler-group") === item.group) {
                        this.stack.splice(this.stack.indexOf(item), 1);
                    }
                }
            }
        });
    }

    onReload(element: HTMLElement) {
        this.isLoaded = true;
        this.profiler.setElement(element);

        for (const item of this.stack) {
            this.doConsolePush(item);
        }
    }

    private doConsolePush(data) {
        if (data.group) {
            if (utility.isArray(data.value)) {
                this.profiler.pushGroup(data.group, `<strong>${data.key}</strong>`);
                this.profiler.pushGroup(data.group, `[ ${data.value.join(", ")} ]`);
            } else {
                if (data.key) {
                    this.profiler.pushGroup(data.group, `<strong>${data.key}</strong> - ${data.value}`);
                } else {
                    this.profiler.pushGroup(data.group, `${data.value}`);
                }
            }
        } else {
            if (data.key) {
                this.profiler.push(`<strong>${data.key}</strong> - ${data.value}`);
            } else {
                this.profiler.push(`${data.value}`);
            }
        }
    }
}
