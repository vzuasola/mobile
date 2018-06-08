import * as utility from "@core/assets/js/components/utility";

import {ComponentManager, ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import {Router, RouterClass} from "@core/src/Plugins/ComponentWidget/asset/router";

/**
 *
 */
export class ProfilerComponent implements ComponentInterface {
    constructor() {
        ComponentManager.subscribe("console.push", (event, src, data) => {
            if (data.group) {
                doPushProfilerGroup(data.group, `<strong>${data.key}</strong> - ${data.value}`);
            } else {
                doPushProfilerConsole(`<strong>${data.key}</strong> - ${data.value}`);
            }
        });
    }

    onLoad(element: HTMLElement) {
        ComponentManager.subscribe("session.prelogin", () => {
            ComponentManager.refreshComponents(["profiler"]);
        });

        ComponentManager.subscribe("session.logout", () => {
            ComponentManager.refreshComponents(["profiler"]);
        });

        Router.on(RouterClass.beforeNavigate, () => {
            ComponentManager.refreshComponents(["profiler"]);
        });
    }

    onReload(element: HTMLElement) {
        // placeholder for onReload
    }
}
