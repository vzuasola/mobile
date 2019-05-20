import EqualHeight from "@app/assets/script/components/equal-height";
import { ProviderDrawer } from "./provider-drawer";
import * as quickLaunchTemplate from "../handlebars/quick-launcher-tabs.handlebars";

export class QuickLauncher {
    private configs: any[];
    private isLogin: boolean;

    constructor(configs, isLogin) {
        this.configs = configs;
        this.isLogin = isLogin;
    }

    /**
     * Activate quick launcher tabs
     */
    activate(launcherTabs, activeTab) {
        const quickTabsEl = document.querySelector("#providers-quick-launcher");
        const template = quickLaunchTemplate({
            providersTab: launcherTabs,
            configs: this.configs,
            activeTab,
            isLogin: this.isLogin,
        });

        if (quickTabsEl) {
            quickTabsEl.innerHTML = template;
        }
        this.moveProviders();
        this.activateProviderDrawer();
        this.equalizeProviderHeight();
    }

    private moveProviders() {
        const container = document.querySelector("#categories-container");
        const providersEl = document.querySelector("#providers-quick-launcher");

        container.appendChild(providersEl);
    }

    /**
     * Enable Provider Drawer slide behavior
     */
    private activateProviderDrawer() {
        const providersEl: any = document.querySelector("#providers-quick-launcher");
        const providerdrawer = new ProviderDrawer(providersEl);
        providerdrawer.activate();
    }

    private equalizeProviderHeight() {
        setTimeout(() => {
            const equalProvider = new EqualHeight("#providers-quick-launcher .provider-menu .game-providers-list a");
            equalProvider.init();
        }, 1000);

    }
}
