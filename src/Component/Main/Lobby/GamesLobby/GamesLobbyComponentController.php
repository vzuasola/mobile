<?php

namespace App\MobileEntry\Component\Main\Lobby\GamesLobby;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class GamesLobbyComponentController
{
    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;

    /**
     * @var App\Fetcher\Integration\PreferencesFetcher
     */
    private $views;

    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    private $rest;

    private $asset;

    private $recentGames;

    private $favorite;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('views_fetcher'),
            $container->get('rest'),
            $container->get('config_fetcher'),
            $container->get('asset'),
            $container->get('recents_fetcher'),
            $container->get('favorites_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct(
        $playerSession,
        $views,
        $rest,
        $configs,
        $asset,
        $recentGames,
        $favorite
    ) {
        $this->playerSession = $playerSession;
        $this->views = $views->withProduct('mobile-games');
        $this->rest = $rest;
        $this->configs = $configs;
        $this->asset = $asset;
        $this->recentGames = $recentGames;
        $this->favorite = $favorite;
    }

    public function lobby($request, $response)
    {
        $data = [];

        try {
            try {
                $categories = $this->views->getViewById('games_category');
                $specialCategories = $this->getSpecialCategories($categories);
                $specialCategoryGames = $this->getSpecialGamesbyCategory($specialCategories);

                $data['games'] = $this->getGamesbyCategory($categories) + $specialCategoryGames;
                $data['categories'] = $this->getArrangedCategoriesByGame($categories, $data['games']);
                $data['games'] = $this->groupGamesByContainer($data['games'], 3);
                $data['favorite_list'] = $this->getFavoriteGamesList();
            } catch (\Exception $e) {
                ddd($e);
                $data['categories'] = [];
                $data['games'] = [];
            }
        } catch (\Exception $e) {
            $data = [];
        }

        return $this->rest->output($response, $data);
    }

    public function recent($request, $response)
    {
        $gameCode = $request->getParsedBody();
        if (isset($gameCode['gameCode'])) {
            $result = $this->setRecentlyPlayedGames($gameCode['gameCode']);
            return $this->rest->output($response, $result);
        }
    }

    public function favorite($request, $response)
    {
        $gameCode = $request->getParsedBody();
        if (isset($gameCode['gameCode'])) {
            $result = $this->toggleFavoriteGames($gameCode['gameCode']);
            return $this->rest->output($response, $result);
        }
    }

    private function groupGamesByContainer($games, $group = 1)
    {
        $gamesList = [];
        foreach ($games as $category => $game) {
            $gamesList[$category] = array_chunk($game, $group);
        }
        return $gamesList;
    }

    /**
     * Get games by category with sort
     */
    private function getGamesbyCategory($categories)
    {
        $gamesList = [];
        foreach ($categories as $category) {
            if (strtolower($category['field_isordinarycategory']) === "true") {
                $categoryId = $category['field_games_alias'];
                $games = $this->views->getViewById('games_list', [
                    'category' => $category['tid']
                ]);
                if ($games) {
                    $gamesList[$categoryId] = $this->arrangeGames($games);
                }
            }
        }

        return $gamesList;
    }

    /**
     * Get list of special categories
     */
    private function getSpecialCategories($categories)
    {
        $specialCategories = [];
        foreach ($categories as $category) {
            if (strtolower($category['field_isordinarycategory']) === "false") {
                $specialCategories[$category['field_games_alias']] = $category;
            }
        }

        return $specialCategories;
    }

    /**
     * Get list of all games
     */
    private function getAllGames()
    {
        try {
            $games = $this->views->getViewById('games_list');
            foreach ($games as $game) {
                $allGames[$game['field_game_code'][0]['value']] = $this->processGame($game, true);
            }
        } catch (\Exception $e) {
            $allGames = [];
        }

        return $allGames;
    }

    /**
     * Get games for special categories
     */
    private function getSpecialGamesbyCategory($specialCategories)
    {
        $allGames = $this->getAllGames();
        $gamesList = [];
        foreach ($specialCategories as $category) {
            switch ($category['field_games_alias']) {
                case 'all-games':
                    $gamesList[$category['field_games_alias']] = $allGames;
                    break;
                case 'recently-played':
                    $games = $this->getRecentlyPlayedGames($allGames);
                    if ($games) {
                        $gamesList[$category['field_games_alias']] = $games;
                    }
                    break;
                case 'favorites':
                    $games = $this->getFavoriteGames($allGames);
                    if ($games) {
                        $gamesList[$category['field_games_alias']] = $games;
                    }
                    break;
            }
        }

        return $gamesList;
    }

    /**
     * Arrange games per category
     */
    private function arrangeGames($games)
    {
        $gamesList = [];

        foreach ($games as $game) {
            $gamesList[] = $this->processGame($game);
        }

        return $gamesList;
    }

    /**
     * Simplify game array
     */
    private function processGame($game, $special = false)
    {
        try {
            $processGame = [];
            $size = $game['field_games_list_thumbnail_size'][0]['value'];
            $processGame['size'] = ($special) ? 'size-small' : $size;

            if (isset($game['field_game_ribbon'][0])) {
                $ribbon = $game['field_game_ribbon'][0];
                $processGame['ribbon']['background'] = $ribbon['field_games_ribbon_color'][0]['color'];
                $processGame['ribbon']['color'] = $ribbon['field_games_text_color'][0]['color'];
                $processGame['ribbon']['name'] = $ribbon['name'][0]['value'];
            }

            $processGame['image'] = [
                'alt' => $game['field_games_list_thumb_img_small'][0]['alt'],
                'url' =>
                    $this->asset->generateAssetUri(
                        $game['field_games_list_thumb_img_small'][0]['url'],
                        ['product' => 'mobile-games']
                    )
            ];

            if ($processGame['size'] == "size-large" && !$special) {
                $processGame['image'] = [
                    'alt' => $game['field_games_list_thumb_img_big'][0]['alt'],
                    'url' =>
                        $this->asset->generateAssetUri(
                            $game['field_games_list_thumb_img_big'][0]['url'],
                            ['product' => 'mobile-games']
                        )
                ];
            }

            $processGame['title'] = $game['title'][0]['value'] ?? "";
            $processGame['game_code'] = $game['field_game_code'][0]['value'] ?? "";
            $processGame['game_provider'] = $game['field_game_provider'][0]['value'] ?? "";
            $processGame['keywords'] = $game['field_keywords'][0]['value'] ?? "";

            return $processGame;
        } catch (\Exception $e) {
            ~ddd($e);
            return [];
        }
    }

    /**
     * Arrange and removed unused categories
     */
    private function getArrangedCategoriesByGame($categories, $gamesList)
    {
        $categoryList = [];
        foreach ($categories as $category) {
            if (isset($gamesList[$category['field_games_alias']])) {
                $categoryList[] = $category;
            }
        }

        return $categoryList;
    }

    private function getFavoriteGamesRequest()
    {
        $favGames = $this->favorite->getFavorites();
        if ($favGames) {
            usort($favGames, [$this, 'sortRecentGames']);
        }
        return $favGames;
    }

    private function getFavoriteGamesList()
    {
        $gameList = [];
        if ($this->playerSession->isLogin()) {
            $favGames = $this->getFavoriteGamesRequest();
            if (is_array($favGames)) {
                foreach ($favGames as $gameCode) {
                    $gameList[$gameCode['id']] = 'active';
                }
            }
        }
        return $gameList;
    }

    /**
     * Get favorite games
     */
    private function getFavoriteGames($games)
    {
        try {
            $gameList = [];
            if ($this->playerSession->isLogin()) {
                $favGames = $this->getFavoriteGamesRequest();
                if (is_array($favGames)) {
                    foreach ($favGames as $gameCode) {
                        if (array_key_exists($gameCode['id'], $games)) {
                            $gameList[] = $games[$gameCode['id']];
                        }
                    }
                }
            }
            return $gameList;
        } catch (\Exception $e) {
            return [];
        }

        return $gameList;
    }

    /**
     * Set favorite games
     */
    private function toggleFavoriteGames($gameCode)
    {
        $response = ['success' => false];
        try {
            if ($this->playerSession->isLogin()) {
                $favoriteGames = $this->favorite->getFavorites();
                $favoriteGames = (is_array($favoriteGames)) ? $favoriteGames : [];
                $favorites = [];
                foreach ($favoriteGames as $games) {
                    $favorites[] = $games['id'];
                }

                if (count($favorites) >= 0 &&
                    in_array($gameCode, $favorites)
                ) {
                    $this->favorite->removeFavorites([$gameCode]);
                    $response['success'] = true;
                    return $response;
                }

                $this->favorite->saveFavorites([$gameCode]);

                $response['success'] = true;
            }
        } catch (\Exception $e) {
            $response['success'] = false;
        }

        return $response;
    }


    /**
     * Get recently played games
     */
    private function getRecentlyPlayedGames($games)
    {
        try {
            $gameList = [];
            if ($this->playerSession->isLogin()) {
                $recentlyPlayed = $this->recentGames->getRecents();
                usort($recentlyPlayed, [$this, 'sortRecentGames']);
                if (is_array($recentlyPlayed)) {
                    foreach ($recentlyPlayed as $gameCode) {
                        if (array_key_exists($gameCode['id'], $games)) {
                            $gameList[] = $games[$gameCode['id']];
                        }
                    }
                }
            }
            return $gameList;
        } catch (\Exception $e) {
            return [];
        }

        return $gameList;
    }

    /**
     * Set recently played games
     */
    private function setRecentlyPlayedGames($gameCode)
    {
        $response = ['success' => false];
        try {
            if ($this->playerSession->isLogin()) {
                $recentlyPlayed = $this->recentGames->getRecents();
                $recentlyPlayed = (is_array($recentlyPlayed)) ? $recentlyPlayed : [];
                usort($recentlyPlayed, [$this, 'sortRecentGames']);
                $recent = [];
                foreach ($recentlyPlayed as $games) {
                    $recent[] = $games['id'];
                }

                // Remove last item when it reaches 21
                if (count($recent) >= 21) {
                    $removedGameCode = end($recent);
                    $this->recentGames->removeRecents([$removedGameCode]);
                }

                // Move item to the top of stack if it exists already
                if ((count($recent) >= 0 && count($recent) < 22)
                    && in_array($gameCode, $recent)) {
                    $this->recentGames->removeRecents([$gameCode]);
                }

                $this->recentGames->saveRecents([$gameCode]);

                $response['success'] = true;
            }
        } catch (\Exception $e) {
            $response['success'] = false;
        }

        return $response;
    }

    /**
     * Sort recently played games based on timestamp
     */
    public static function sortRecentGames($game1, $game2)
    {
        return ($game1['timestamp'] > $game2['timestamp']) ? -1 : 1;
    }
}
