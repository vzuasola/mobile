import {ComponentManager} from "@core/src/Plugins/ComponentWidget/asset/component";

import {AccessDeniedComponent} from "@app/src/Component/Main/AccessDenied/script";
import {HeaderComponent} from "@app/src/Component/Header/script";
import {BacktotopComponent} from "@app/src/Component/Backtotop/script";
import {MenuComponent} from "@app/src/Component/Menu/script";
import {MetaComponent} from "@app/src/Component/Meta/script";
import {LoginComponent} from "@app/src/Component/Header/Login/script";
import {PromotionsComponent} from "@app/src/Component/Main/Promotions/script";
import {TabNavigationComponent} from "@app/src/Component/TabNavigation/script";
import {DownloadComponent} from "@app/src/Component/Main/Lobby/Home/Download/script";
import {AnnouncementComponent} from "@app/src/Component/Announcement/script";
import {PushNotificationComponent} from "@app/src/Component/PushNotification/script";
import {SEOComponent} from "@app/src/Component/SEO/script";
import {GamesLobbyComponent} from "@app/src/Component/Main/Lobby/GamesLobby/script";
import {LiveDealerLobbyComponent} from "@app/src/Component/Main/Lobby/LiveDealerLobby/script";
import {CasinoLobbyComponent} from "@app/src/Component/Main/Lobby/CasinoLobby/script";
import {LotteryLobbyComponent} from "@app/src/Component/Main/Lobby/LotteryLobby/script";
import {LobbyComponent} from "@app/src/Component/Main/Lobby/script";
import {MarketingComponent} from "@app/src/Component/Marketing/script";
import {LobbySliderComponent} from "@app/src/Component/Main/Lobby/Slider/script";
import {ProductsComponent} from "@app/src/Component/Main/Lobby/Home/Products/script";
import {NodeComponent} from "@app/src/Component/Node/script";
import {CasinoOptionComponent} from "@app/src/Component/CasinoOption/script";
import {LanguageComponent} from "@app/src/Component/Language/script";
import {ProfilerComponent} from "@app/src/Component/Profiler/script";
import {CantLoginComponent} from "@app/src/Component/Main/CantLogin/script";
import {PromotionsNodeComponent} from "@app/src/Component/Node/Promotions/script";
import {LotteryPageComponent} from "@app/src/Component/Node/LotteryPage/script";
import {CantLoginForgotPasswordComponent} from "@app/src/Component/Main/CantLogin/ForgotPassword/script";
import {CantLoginForgotUsernameComponent} from "@app/src/Component/Main/CantLogin/ForgotUsername/script";
import {CantLoginResetPasswordComponent} from "@app/src/Component/Main/CantLogin/ResetPassword/script";
import {MyAccountComponent} from "@app/src/Component/Main/MyAccount/script";
import {MyAccountProfileComponent} from "@app/src/Component/Main/MyAccount/Profile/script";
import {MyAccountProfileVerifyPasswordComponent} from "@app/src/Component/Main/MyAccount/Profile/VerifyPassword/script";
import {MyAccountChangePasswordComponent} from "@app/src/Component/Main/MyAccount/ChangePassword/script";
import {FooterComponent} from "@app/src/Component/Footer/script";
import {CookieNotifComponent} from "@app/src/Component/CookieNotif/script";
import {GameLoaderComponent} from "@app/src/Component/GameLoader/script";

ComponentManager.setComponents({
    access_denied: new AccessDeniedComponent(),
    header: new HeaderComponent(),
    backtotop: new BacktotopComponent(),
    menu: new MenuComponent(),
    meta: new MetaComponent(),
    header_login: new LoginComponent(),
    promotions: new PromotionsComponent(),
    tab_navigation: new TabNavigationComponent(),
    home_download: new DownloadComponent(),
    announcement: new AnnouncementComponent(),
    push_notification: new PushNotificationComponent(),
    seo: new SEOComponent(),
    lobby: new LobbyComponent(),
    lobby_slider: new LobbySliderComponent(),
    home_products: new ProductsComponent(),
    games_lobby: new GamesLobbyComponent(),
    live_dealer_lobby: new LiveDealerLobbyComponent(),
    casino_lobby: new CasinoLobbyComponent(),
    lottery_lobby: new LotteryLobbyComponent(),
    node: new NodeComponent(),
    casino_option: new CasinoOptionComponent(),
    language: new LanguageComponent(),
    marketing: new MarketingComponent(),
    profiler: new ProfilerComponent(),
    cant_login: new CantLoginComponent(),
    node_promotions: new PromotionsNodeComponent(),
    node_lottery_page: new LotteryPageComponent(),
    cant_login_forgot_password: new CantLoginForgotPasswordComponent(),
    cant_login_forgot_username: new CantLoginForgotUsernameComponent(),
    cant_login_reset_password: new CantLoginResetPasswordComponent(),
    my_account: new MyAccountComponent(),
    profile: new MyAccountProfileComponent(),
    profile_verify_password: new MyAccountProfileVerifyPasswordComponent(),
    change_password: new MyAccountChangePasswordComponent(),
    footer: new FooterComponent(),
    cookie_notification: new CookieNotifComponent(),
    game_loader: new GameLoaderComponent(),
});
