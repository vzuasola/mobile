export class GamesCollectionSorting {
    /**
     * Sorts all games based on top games collection
     * Games that are not on the top games collection will be
     * sorted alphabetically.
     */
    sortGamesCollection(gamesResponse, gamesCollectionType, category, sortAlphabetical = false, gamesListArr?) {
        const sortedCollection = {};
        const sortedAlpha = {};
        let sortedAlphaArr = [];
        if (gamesResponse.hasOwnProperty("gamesCollection")
            && gamesResponse.gamesCollection.hasOwnProperty(gamesCollectionType)) {
            for (const id of gamesResponse.gamesCollection[gamesCollectionType]) {
                if (gamesResponse.games["all-games"].hasOwnProperty(id)) {
                   sortedCollection[id] = gamesResponse.games["all-games"][id];
                }
            }
        }

        if (sortAlphabetical) {
            sortedAlphaArr = this.sortGameTitleAlphabetical(gamesListArr);
            for (const game of sortedAlphaArr) {
                if (!sortedCollection.hasOwnProperty("id:" + game.game_code)) {
                    sortedAlpha["id:" + game.game_code] = game;
                }
            }

            if (sortedAlpha) {
                Object.assign(sortedCollection, sortedAlpha);
            }
        }

        return sortedCollection;
    }

    private sortGameTitleAlphabetical(gamesList) {
        gamesList.sort((a, b) => {
            if (a.title.toLowerCase() < b.title.toLowerCase()) {
                return -1;
            }
            if (a.title.toLowerCase() > b.title.toLowerCase()) {
                return 1;
            }

            return 0;
        });

        return gamesList;
    }
}
