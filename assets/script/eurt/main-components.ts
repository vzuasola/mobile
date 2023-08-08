import {ComponentManager} from "@core/src/Plugins/ComponentWidget/asset/component";

import {HeaderComponent} from "@app/src/Component/Header/script";
import {MenuComponent} from "@app/src/Component/Menu/script";
import {MetaComponent} from "@app/src/Component/Meta/script";
import {LoginComponent} from "@app/src/Component/Header/Login/script";
import {PromotionsComponent} from "@app/src/Component/Main/Promotions/script";
import {TabNavigationComponent} from "@app/src/Component/TabNavigation/script";
import {InfobarComponent} from "@app/src/Component/Main/Lobby/Home/Infobar/script";
import {DownloadComponent} from "@app/src/Component/Main/Lobby/Home/Download/script";
import {AnnouncementComponent} from "@app/src/Component/Announcement/script";
import {PushNotificationComponent} from "@app/src/Component/PushNotification/script";
import {SEOComponent} from "@app/src/Component/SEO/script";
import {GameWindowComponent} from "@app/src/Component/Main/GameWindow/script";
import {LobbyComponent} from "@app/src/Component/Main/Lobby/script";
import {MarketingComponent} from "@app/src/Component/Marketing/script";
import {LobbySliderComponent} from "@app/src/Component/Main/Lobby/Slider/script";
import {ProductsComponent} from "@app/src/Component/Main/Lobby/Home/Products/script";
import {NodeComponent} from "@app/src/Component/Node/script";
import {LanguageComponent} from "@app/src/Component/Language/script";
import {ProfilerComponent} from "@app/src/Component/Profiler/script";
import {PromotionsNodeComponent} from "@app/src/Component/Node/Promotions/script";
import {BlankPageComponent} from "@app/src/Component/Node/BlankPage/script";
import {InnerPageComponent} from "@app/src/Component/Node/InnerPage/script";
import {BonusesComponent} from "@app/src/Component/Main/MyAccount/Bonuses/script";
import {FooterComponent} from "@app/src/Component/Footer/script";
import {GameLoaderComponent} from "@app/src/Component/GameLoader/script";
import {UnsupportedCurrencyComponent} from "@app/src/Component/Main/UnsupportedCurrency/script";

ComponentManager.setComponents({
    header: new HeaderComponent(),
    menu: new MenuComponent(),
    meta: new MetaComponent(),
    header_login: new LoginComponent(),
    promotions: new PromotionsComponent(),
    tab_navigation: new TabNavigationComponent(),
    home_infobar: new InfobarComponent(),
    home_download: new DownloadComponent(),
    announcement: new AnnouncementComponent(),
    push_notification: new PushNotificationComponent(),
    seo: new SEOComponent(),
    game_window: new GameWindowComponent(),
    lobby: new LobbyComponent(),
    lobby_slider: new LobbySliderComponent(),
    home_products: new ProductsComponent(),
    node: new NodeComponent(),
    language: new LanguageComponent(),
    marketing: new MarketingComponent(),
    profiler: new ProfilerComponent(),
    node_promotions: new PromotionsNodeComponent(),
    node_blank_page: new BlankPageComponent(),
    node_inner_page: new InnerPageComponent(),
    bonuses: new BonusesComponent(),
    footer: new FooterComponent(),
    game_loader: new GameLoaderComponent(),
    ucp: new UnsupportedCurrencyComponent(),
});
