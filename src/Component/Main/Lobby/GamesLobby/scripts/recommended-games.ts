import * as Handlebars from "handlebars/runtime";
import * as gamesSearchTemplate from "../handlebars/games-search-result.handlebars";
import * as gameTemplate from "../handlebars/games.handlebars";

export class RecommendedGames {
    private recommendedGames: any[];
    private config;

    constructor(gamesList, config) {
        this.recommendedGames = [];
        if (gamesList && gamesList.games["recommended-games"]) {
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
        if (this.recommendedGames.length) {
            return this.config.msg_recommended_available;
        }

        return this.config.msg_no_recommended;
    }
}
