import {ComponentManager} from '@plugins/ComponentWidget/asset/component';

import {HeaderComponent} from '@app/src/Component/Header/script';
import {FooterComponent} from '@app/src/Component/Footer/script';
import {SliderComponent} from '@app/src/Component/Main/Home/Slider/script';
import {ProductsComponent} from '@app/src/Component/Main/Home/Products/script';
import {MenuComponent} from '@app/src/Component/Header/Menu/script';
import {AnnouncementBarComponent} from '@app/src/Component/Announcement/AnnouncementBar/script';
import {PushNotificationComponent} from '@app/src/Component/PushNotification/script';
import {AnnouncementLightboxComponent} from '@app/src/Component/Announcement/AnnouncementLightbox/script';

ComponentManager.setComponents({
    'header': new HeaderComponent(),
    'footer': new FooterComponent(),
    'home_slider': new SliderComponent(),
    'home_products': new ProductsComponent(),
    'header_menu': new MenuComponent(),
    'announcement_bar': new AnnouncementBarComponent(),
    'push_notification': new PushNotificationComponent(),
    'announcement_lightbox': new AnnouncementLightboxComponent(),
});

ComponentManager.init();
