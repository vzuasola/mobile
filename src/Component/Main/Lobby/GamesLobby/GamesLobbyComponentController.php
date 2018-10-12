<?php

namespace App\MobileEntry\Component\Main\Lobby\GamesLobby;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use App\Async\Async;

class GamesLobbyComponentController
{
    const TIMEOUT = 1800;

    const RECOMMENDED_GAMES = 'recommended-games';
    const ALL_GAMES = 'all-games';
    const RECENTLY_PLAYED_GAMES = 'recently-played';
    const FAVORITE_GAMES = 'favorites';

    private $playerSession;
    private $views;
    private $configs;
    private $rest;
    private $asset;
    private $recentGames;
    private $favorite;
    private $configAsync;
    private $viewsAsync;
    private $cacher;
    private $currentLanguage;

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
            $container->get('favorites_fetcher'),
            $container->get('config_fetcher_async'),
            $container->get('views_fetcher_async'),
            $container->get('redis_cache_adapter'),
            $container->get('lang')
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
        $favorite,
        $configAsync,
        $viewsAsync,
        $cacher,
        $currentLanguage
    ) {
        $this->playerSession = $playerSession;
        $this->views = $views->withProduct('mobile-games');
        $this->rest = $rest;
        $this->configs = $configs;
        $this->asset = $asset;
        $this->recentGames = $recentGames;
        $this->favorite = $favorite;
        $this->configAsync = $configAsync;
        $this->viewsAsync = $viewsAsync->withProduct('mobile-games');
        $this->cacher = $cacher;
        $this->currentLanguage = $currentLanguage;
    }

    public function lobby($request, $response)
    {
        $item = $this->cacher->getItem('views.games-lobby-data.' . $this->currentLanguage);

        if (!$item->isHit()) {
            $data = $this->generateLobbyData();

            $item->set([
                'body' => $data,
            ]);

            $this->cacher->save($item, [
                'expires' => self::TIMEOUT,
            ]);
        } else {
            $body = $item->get();

            $data = $body['body'];
        }

        // Put post process here to get favorites and recents tab

        return $this->rest->output($response, $data);
    }

    private function generateLobbyData()
    {
        $data = [];

        $categories = $this->views->getViewById('games_category');
        $definitions = $this->getDefinitionsByCategory($categories);
        $asyncData = Async::resolve($definitions);

        $specialCategories = [];
        $specialCategories = $this->getSpecialCategories($categories);

        // DANIEL fix me
        // $specialGamesList = $this->getSpecialCategoriesGameList($specialCategories);
        // $asyncData += $specialGamesList;

        $specialCategoryGames = $this->getSpecialGamesbyCategory(
            $specialCategories,
            $asyncData
        );

        $data['games'] = $this->getGamesbyCategory(
            $categories,
            $asyncData
        ) + $specialCategoryGames;

        $data['categories'] = $this->getArrangedCategoriesByGame($categories, $data['games']);
        $data['games'] = $this->groupGamesByContainer($data['games'], 3);

        if (isset($asyncData['favorites'])) {
            $data['favorite_list'] = $this->getFavoriteGamesList($asyncData['favorites']);
        }

        return $data;
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

    private function getSpecialCategoriesGameList($categories)
    {
        $definitions = [];
        try {
            foreach ($categories as $category) {
                $categoryId = $category['field_games_alias'];
                switch ($category['field_games_alias']) {
                    case $this::RECENTLY_PLAYED_GAMES:
                        $definitions[$categoryId] = $this->recentGames->getRecents();
                        break;
                    case $this::FAVORITE_GAMES:
                        $definitions[$categoryId] = $this->favorite->getFavorites();
                        break;
                }
            }
        } catch (\Exception $e) {
            $definitions = [];
        }

        return $definitions;
    }

    private function getDefinitionsByCategory($categories)
    {
        $definitions = [];
        try {
            foreach ($categories as $category) {
                $categoryId = $category['field_games_alias'];
                switch ($category['field_games_alias']) {
                    case $this::ALL_GAMES:
                        $definitions[$categoryId] = $this->viewsAsync->getViewById('games_list');
                        break;
                }

                if (strtolower($category['field_isordinarycategory']) === "true") {
                    $definitions[$categoryId] = $this->viewsAsync->getViewById('games_list', [
                        'category' => $category['tid']
                    ]);
                    continue;
                }
            }
        } catch (\Exception $e) {
            $definitions = [];
        }

        return $definitions;
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
    private function getGamesbyCategory($categories, $data)
    {
        $gamesList = [];
        foreach ($categories as $category) {
            if (strtolower($category['field_isordinarycategory']) === "true" &&
                $data[$category['field_games_alias']]
            ) {
                $categoryId = $category['field_games_alias'];
                $games = $data[$category['field_games_alias']];
                if ($games) {
                    $gamesList[$categoryId] = $this->arrangeGames($games, $categoryId);
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
    private function getAllGames($games)
    {
        try {
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
    private function getSpecialGamesbyCategory($specialCategories, $data)
    {
        $allGames = $this->getAllGames($data['all-games']);
        $gamesList = [];

        foreach ($specialCategories as $category) {
            switch ($category['field_games_alias']) {
                case $this::ALL_GAMES:
                    $gamesList[$category['field_games_alias']] = $allGames;
                    break;
                case $this::RECENTLY_PLAYED_GAMES:
                    if (isset($data['recently-played'])) {
                        $games = $this->getRecentlyPlayedGames($allGames, $data['recently-played']);

                        if ($games) {
                            $gamesList[$category['field_games_alias']] = $games;
                        }
                    }

                    break;
                case $this::FAVORITE_GAMES:
                    if (isset($data['favorites'])) {
                        $games = $this->getFavoriteGames($allGames, $data['favorites']);

                        if ($games) {
                            $gamesList[$category['field_games_alias']] = $games;
                        }
                    }

                    break;
            }
        }

        return $gamesList;
    }

    /**
     * Arrange games per category
     */
    private function arrangeGames($games, $categoryId)
    {
        $gamesList = [];

        foreach ($games as $game) {
            $special = ($categoryId === $this::RECOMMENDED_GAMES);
            $gamesList[] = $this->processGame($game, $special);
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
                $processGame['ribbon']['name'] = $ribbon['field_games_ribbon_label'][0]['value'];
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

            if (count($game['field_game_filter']) > 0) {
                $filterString = '';
                foreach ($game['field_game_filter'] as $filter) {
                    $filterString .= $filter['field_games_filter_value'][0]['value'] . ',';
                }

                $processGame['filters'] = rtrim($filterString, ',');
            }

            $processGame['title'] = $game['title'][0]['value'] ?? "";
            $processGame['game_code'] = $game['field_game_code'][0]['value'] ?? "";
            $processGame['game_provider'] = $game['field_game_provider'][0]['value'] ?? "";
            $processGame['keywords'] = $game['field_keywords'][0]['value'] ?? "";
            $processGame['weight'] = 0;
            $processGame['target'] = $game['field_games_target'][0]['value'] ?? "popup";

            return $processGame;
        } catch (\Exception $e) {
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
            // remove recommended games from category as it will not have its own tab.
            if ($category['field_games_alias'] === $this::RECOMMENDED_GAMES) {
                continue;
            }

            if (isset($gamesList[$category['field_games_alias']])) {
                $categoryList[] = $category;
            }
        }

        return $categoryList;
    }

    private function getFavoriteGamesList($favGames)
    {
        $gameList = [];
        if ($this->playerSession->isLogin()) {
            $favGames = $this->proccessSpecialGames($favGames);
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
    private function getFavoriteGames($games, $favGames)
    {
        try {
            $gameList = [];
            if ($this->playerSession->isLogin()) {
                $favGames = $this->proccessSpecialGames($favGames);
                if ($favGames) {
                    usort($favGames, [$this, 'sortRecentGames']);
                }
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

    private function proccessSpecialGames($games)
    {
        try {
            $gameList = [];

            foreach ($games as $key => $timestamp) {
                $gameList[$key]['id'] = $key;
                $gameList[$key]['timestamp'] = $timestamp;
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
                $favoriteGames = $this->proccessSpecialGames($favoriteGames);
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
    private function getRecentlyPlayedGames($games, $recentlyPlayed)
    {
        try {
            $gameList = [];
            if ($this->playerSession->isLogin()) {
                $recentlyPlayed = $this->proccessSpecialGames($recentlyPlayed);
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
                $recentlyPlayed = $this->proccessSpecialGames($recentlyPlayed);
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
