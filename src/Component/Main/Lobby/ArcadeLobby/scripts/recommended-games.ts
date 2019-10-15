export class RecommendedGames {
    private recommendedGames: any[];
    private config;

    constructor(gamesList, config) {
        this.recommendedGames = [];
        if (gamesList && gamesList.hasOwnProperty("recommended-games")) {
            this.recommendedGames = [];
            for (const games of gamesList["recommended-games"]) {
                this.recommendedGames.push(games);
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
        if (this.recommendedGames.length) {
            return this.config.msg_recommended_available;
        }

        return this.config.msg_no_recommended;
    }
}
