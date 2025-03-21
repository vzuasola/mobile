import {ComponentManager} from "@core/src/Plugins/ComponentWidget/asset/component";

import {AccessDeniedComponent} from "@app/src/Component/Main/AccessDenied/script";
import {MaintenanceComponent} from "@app/src/Component/Main/Maintenance/script";
import {HeaderComponent} from "@app/src/Component/Header/script";
import {MenuComponent} from "@app/src/Component/Menu/script";
import {MetaComponent} from "@app/src/Component/Meta/script";
import {LoginComponent} from "@app/src/Component/Header/Login/script";
import {PromotionsComponent} from "@app/src/Component/Main/Promotions/script";
import {TabNavigationComponent} from "@app/src/Component/TabNavigation/script";
import {InfobarComponent} from "@app/src/Component/Main/Lobby/Home/Infobar/script";
import {DownloadComponent} from "@app/src/Component/Main/Lobby/Home/Download/script";
import {ContactUsComponent} from "@app/src/Component/Main/Lobby/Home/ContactUs/script";
import {AnnouncementComponent} from "@app/src/Component/Announcement/script";
import {PushNotificationComponent} from "@app/src/Component/PushNotification/script";
import {SEOComponent} from "@app/src/Component/SEO/script";
import {GamesLobbyComponent} from "@app/src/Component/Main/Lobby/GamesLobby/script";
import {LiveDealerLobbyComponent} from "@app/src/Component/Main/Lobby/LiveDealerLobby/script";
import {ArcadeLobbyComponent} from "@app/src/Component/Main/Lobby/ArcadeLobby/script";
import {CasinoLobbyComponent} from "@app/src/Component/Main/Lobby/CasinoLobby/script";
import {LotteryLobbyComponent} from "@app/src/Component/Main/Lobby/LotteryLobby/script";
import {SodaCasinoLobbyComponent} from "@app/src/Component/Main/Lobby/SodaCasinoLobby/script";
import {GameWindowComponent} from "@app/src/Component/Main/GameWindow/script";
import {LobbyComponent} from "@app/src/Component/Main/Lobby/script";
import {MarketingComponent} from "@app/src/Component/Marketing/script";
import {LobbySliderComponent} from "@app/src/Component/Main/Lobby/Slider/script";
import {ProductsComponent} from "@app/src/Component/Main/Lobby/Home/Products/script";
import {NodeComponent} from "@app/src/Component/Node/script";
import {LanguageComponent} from "@app/src/Component/Language/script";
// import {INLanguageComponent} from "@app/src/Component/Language/INLanguage/script";
import {ProfilerComponent} from "@app/src/Component/Profiler/script";
import {CantLoginComponent} from "@app/src/Component/Main/CantLogin/script";
import {PromotionsNodeComponent} from "@app/src/Component/Node/Promotions/script";
import {BasicPageComponent} from "@app/src/Component/Node/BasicPage/script";
import {BlankPageComponent} from "@app/src/Component/Node/BlankPage/script";
import {InnerPageComponent} from "@app/src/Component/Node/InnerPage/script";
import {CantLoginForgotPasswordComponent} from "@app/src/Component/Main/CantLogin/ForgotPassword/script";
import {CantLoginForgotUsernameComponent} from "@app/src/Component/Main/CantLogin/ForgotUsername/script";
import {CantLoginResetPasswordComponent} from "@app/src/Component/Main/CantLogin/ResetPassword/script";
import {MyAccountComponent} from "@app/src/Component/Main/MyAccount/script";
import {ContactUsFormComponent} from "@app/src/Component/Main/ContactUsForm/script";
import {MyAccountProfileComponent} from "@app/src/Component/Main/MyAccount/Profile/script";
import {MyAccountProfileVerifyPasswordComponent} from "@app/src/Component/Main/MyAccount/Profile/VerifyPassword/script";
import {MyAccountChangePasswordComponent} from "@app/src/Component/Main/MyAccount/ChangePassword/script";
import {BonusesComponent} from "@app/src/Component/Main/MyAccount/Bonuses/script";
import {DocumentsComponent} from "@app/src/Component/Main/MyAccount/Documents/script";
import {FooterComponent} from "@app/src/Component/Footer/script";
import {GameLoaderComponent} from "@app/src/Component/GameLoader/script";
import {UnsupportedCurrencyComponent} from "@app/src/Component/Main/UnsupportedCurrency/script";
import {VirtualsLobbyComponent} from "@app/src/Component/Main/Lobby/VirtualsLobby/script";
import {PTPlusLobbyComponent} from "@app/src/Component/Main/Lobby/PTPlusLobby/script";
import {HeaderGameIFrameComponent} from "@app/src/Component/HeaderGameIFrame/script";
import {GameIFrameComponent} from "@app/src/Component/GameIFrame/script";

ComponentManager.setComponents({
    access_denied: new AccessDeniedComponent(),
    maintenance: new MaintenanceComponent(),
    header: new HeaderComponent(),
    menu: new MenuComponent(),
    meta: new MetaComponent(),
    header_login: new LoginComponent(),
    promotions: new PromotionsComponent(),
    tab_navigation: new TabNavigationComponent(),
    home_infobar: new InfobarComponent(),
    home_download: new DownloadComponent(),
    home_contactus: new ContactUsComponent(),
    announcement: new AnnouncementComponent(),
    push_notification: new PushNotificationComponent(),
    seo: new SEOComponent(),
    game_window: new GameWindowComponent(),
    lobby: new LobbyComponent(),
    lobby_slider: new LobbySliderComponent(),
    home_products: new ProductsComponent(),
    games_lobby: new GamesLobbyComponent(),
    live_dealer_lobby: new LiveDealerLobbyComponent(),
    arcade_lobby: new ArcadeLobbyComponent(),
    casino_lobby: new CasinoLobbyComponent(),
    virtuals_lobby: new VirtualsLobbyComponent(),
    lottery_lobby: new LotteryLobbyComponent(),
    soda_casino_lobby: new SodaCasinoLobbyComponent(),
    node: new NodeComponent(),
    language: new LanguageComponent(),
    // in_language: new INLanguageComponent(),
    marketing: new MarketingComponent(),
    profiler: new ProfilerComponent(),
    cant_login: new CantLoginComponent(),
    node_promotions: new PromotionsNodeComponent(),
    node_basic_page: new BasicPageComponent(),
    node_blank_page: new BlankPageComponent(),
    node_inner_page: new InnerPageComponent(),
    cant_login_forgot_password: new CantLoginForgotPasswordComponent(),
    cant_login_forgot_username: new CantLoginForgotUsernameComponent(),
    cant_login_reset_password: new CantLoginResetPasswordComponent(),
    my_account: new MyAccountComponent(),
    contact_us: new ContactUsFormComponent(),
    profile: new MyAccountProfileComponent(),
    profile_verify_password: new MyAccountProfileVerifyPasswordComponent(),
    change_password: new MyAccountChangePasswordComponent(),
    bonuses: new BonusesComponent(),
    documents: new DocumentsComponent(),
    footer: new FooterComponent(),
    game_loader: new GameLoaderComponent(),
    ucp: new UnsupportedCurrencyComponent(),
    ptplus_lobby: new PTPlusLobbyComponent(),
    game_iframe: new GameIFrameComponent(),
    header_game_iframe: new HeaderGameIFrameComponent(),
});
