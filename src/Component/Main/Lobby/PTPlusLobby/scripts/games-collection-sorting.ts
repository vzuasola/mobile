export class GamesCollectionSorting {
    /**
     * Sorts all games based on top games collection
     * Games that are not on the top games collection will be
     * sorted alphabetically.
     */
    sortGamesCollection(gamesList, gamesCollection) {
        const sortedCollection = [];
        const sortedAlpha = this.sortGameTitleAlphabetical(gamesList);

        for (const gameCode of gamesCollection) {
            const filtered = sortedAlpha.filter((row, index) => {
                if (row.game_code === gameCode) {
                    sortedAlpha.splice(index, 1);
                }
                return row.game_code === gameCode;
            });
            sortedCollection.push(filtered[0]);
        }

        return sortedCollection.concat(sortedAlpha);
    }

    sortGameTitleAlphabetical(gamesList) {
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
