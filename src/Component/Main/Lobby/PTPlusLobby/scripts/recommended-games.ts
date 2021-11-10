import * as Handlebars from "handlebars/runtime";
import * as gamesSearchTemplate from "../handlebars/games-search-result.handlebars";
import * as gameTemplate from "../handlebars/games.handlebars";

export class RecommendedGames {
    private recommendedGames: any[];
    private config;
    private response: any;

    constructor(gamesList, config) {
        this.response = gamesList;
        this.recommendedGames = [];
        if (gamesList && gamesList.games.recommended) {
            this.recommendedGames = [];
            for (const games of gamesList.games.recommended) {
                if (games !== undefined) {
                    this.recommendedGames.push(games);
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
