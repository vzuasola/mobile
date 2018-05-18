import {ComponentManager} from "@plugins/ComponentWidget/asset/component";

import {AvayaModule} from "@app/src/Module/Avaya/script";
import {BalanceModule} from "@app/src/Module/Balance/script";
import {GameIntegrationModule} from "@app/src/Module/GameIntegration/script";

import {PASModule} from "@app/src/Module/GameIntegration/PAS/script";

import {ProductIntegrationModule} from "@app/src/Module/ProductIntegration/script";
import {SessionModule} from "@app/src/Module/Session/script";

ComponentManager.setModules({
    avaya: new AvayaModule(),
    balance: new BalanceModule(),
    game_integration: new GameIntegrationModule(),
    pas_integration: new PASModule(),
    product_integration: new ProductIntegrationModule(),
    session: new SessionModule(),
});
