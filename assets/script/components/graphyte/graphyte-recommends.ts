import {ComponentManager} from "@plugins/ComponentWidget/asset/component";
/**
 *
 */
export class GraphyteRecommends {
    private productMapping = {
        "mobile-arcade": "arcade",
        "mobile-games": "games",
    };
    private graphyteConfigs;
    private isLogin: boolean = false;
    private attachments;
    private pagePromises;
    private user: {
        playerId: string,
        currency: string,
        country: string,
    };

    constructor(attachments) {
        console.log("init: recommends");
        console.log(attachments);
        this.attachments = attachments;
        this.isLogin = this.attachments.authenticated;
        this.graphyteConfigs = this.attachments.configs.graphyte;
        this.user = this.attachments.user;
    }

    getRecommendsRequest() {
        const requestsObj = {};
        this.pagePromises = [];
        if (this.isLogin && this.graphyteConfigs.enabled &&
            this.graphyteConfigs.recommend.api && this.graphyteConfigs.recommend.categories) {
            const productMap = this.productMapping[ComponentManager.getAttribute("product")];
            const data = JSON.stringify({
                context: {
                    product: productMap,
                    category: productMap,
                    channel: "mobile",
                },
                userId: this.user.playerId,
                type: "recommendation",
            });
            for (const category of this.graphyteConfigs.recommend.categories) {
                const reqProperty = {
                    url: this.graphyteConfigs.recommend.api.replace("{placementKey}", category.placementKey),
                    status: 0,
                    method: "post",
                    crossOrigin: true,
                    processData: false,
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": this.graphyteConfigs.apiKey,
                        "x-brand-key": this.graphyteConfigs.brandKey,
                    },
                    data,
                    custom: category,
                };
                const key = category.categoryId;
                requestsObj[key] = {
                    type: key,
                    overrideXhrProp: reqProperty,
                };

                this.pagePromises.push(key);
            }
        }

        return requestsObj;
    }

    getPagePromises() {
        return this.pagePromises;
    }

    getRecommendedByCategory(recommendResponse, gamesList) {
        const recommendedGames = [];
        if (recommendResponse.recommendation.hasOwnProperty("result")) {
            recommendResponse.recommendation.result.forEach((resultItem, key) => {
                if (gamesList.hasOwnProperty("id:" + resultItem.game.game_code)) {
                    recommendedGames.push(gamesList["id:" + resultItem.game.game_code]);
                }
            });
        }
        console.log(recommendedGames);
        return recommendedGames;
    }
}
