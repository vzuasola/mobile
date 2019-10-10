export class RecommendedGames {
    private recommendedGames: any[];
    private config;
    private enableRecommended: boolean;

    constructor(gamesList, config, enableRecommended) {
        this.recommendedGames = [];
        this.enableRecommended = enableRecommended;
        if (gamesList && gamesList.games["recommended-games"] && this.enableRecommended) {
            this.recommendedGames = [];
            for (const games of gamesList.games["recommended-games"]) {
                for (const game of games) {
                    this.recommendedGames.push(game);
                }
            }
        }

        this.config = config;
    }

    /**
     * Function that populates the recommended games in
     *  games search preview or lobby
     */
    getGames() {
        return this.recommendedGames;
    }

    /**
     * Function that returns blurb for recommended games.
     */
    getBlurb() {
        if (this.recommendedGames.length && this.enableRecommended) {
            return this.config.msg_recommended_available;
        }

        return this.config.msg_no_recommended;
    }
}
