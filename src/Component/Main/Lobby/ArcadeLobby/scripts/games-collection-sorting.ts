export class GamesCollectionSorting {
    /**
     * Sorts all games based on top games collection
     * Games that are not on the top games collection will be
     * sorted alphabetically.
     */
    sortGamesCollection(gamesResponse, gamesCollectionType, sortAlphabetical = false, gamesListArr?) {
        const sortedCollection = [];
        const sortedCollectionId = [];
        let sortedAlphaArr = [];
        if (gamesResponse.hasOwnProperty("gamesCollection")
            && gamesResponse.gamesCollection.hasOwnProperty(gamesCollectionType)) {
            for (const id of gamesResponse.gamesCollection[gamesCollectionType]) {
                if (gamesResponse.games["all-games"].hasOwnProperty(id)) {
                   sortedCollection.push(gamesResponse.games["all-games"][id]);
                   sortedCollectionId.push(id);
                }
            }
        }

        if (sortAlphabetical) {
            sortedAlphaArr = this.sortGameTitleAlphabetical(gamesListArr);
            for (const game of sortedAlphaArr) {
                if (sortedCollectionId.indexOf("id:" + game.game_code) === -1) {
                    sortedCollection.push(game);
                }
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
