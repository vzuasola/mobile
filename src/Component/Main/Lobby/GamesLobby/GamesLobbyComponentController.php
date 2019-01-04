<?php

namespace App\MobileEntry\Component\Main\Lobby\GamesLobby;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use App\Async\Async;
use App\Async\DefinitionCollection;

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
        $this->configAsync = $configAsync->withProduct('mobile-games');
        $this->viewsAsync = $viewsAsync->withProduct('mobile-games');
        $this->cacher = $cacher;
        $this->currentLanguage = $currentLanguage;
    }

    public function lobby($request, $response)
    {
        $previewMode = $request->getQueryParams();
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
        $specialCategories = [
                $this::RECENTLY_PLAYED_GAMES,
                $this::FAVORITE_GAMES
        ];
        $specialGamesList = $this->getSpecialCategoriesGameList($specialCategories);

        $gamesData = $data['games'] + $specialGamesList;

        $specialCategoryGames = $this->getSpecialGamesbyCategory(
            $specialCategories,
            $gamesData
        );
        $data['games'] += $specialCategoryGames;

        if (!isset($previewMode['pvw'])) {
            $data['games'] = $this->removeGamesPreviewMode($data['games']);
        }

        $enableRecommended = false;
        $data['categories'] = $this->getArrangedCategoriesByGame($data['categories_list'], $enableRecommended);
        $data['enableRecommended'] = $enableRecommended;

        if (isset($specialGamesList['favorites'])) {
            $data['favorite_list'] = $this->getFavoriteGamesList($specialGamesList['favorites']);
        }
        unset($data['categories_list']);
        unset($data['special_categories']);

        return $this->rest->output($response, $data);
    }

    private function generateLobbyData()
    {
        $data = [];

        $categories = $this->views->getViewById('games_category');
        $pager = $this->views->getViewById('games_list', ['pager' => 1]);

        $definitions = $this->getDefinitions($pager);

        $asyncData = Async::resolve($definitions);
        $asyncData = $this->buildAllGames($asyncData);

        $specialCategories = [];
        $specialCategories = $this->getSpecialCategories($categories);

        $data['special_categories'] = $specialCategories;
        $data['categories_list'] = $categories;
        $data['games'] = $this->getGamesAndCategory(
            $asyncData['all-games']
        );

        $data['configs'] = $asyncData['configs'];

        return $data;
    }

    private function buildAllGames($data)
    {
        if (!$data['all-games']) {
            foreach ($data['paged-games'] as $key => $value) {
                if (is_numeric($key)) {
                    $data['all-games'] = array_merge($data['all-games'], $value);
                }
            }
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

    private function removeGamesPreviewMode($gamesCollection)
    {
        try {
            foreach ($gamesCollection as $categoryName => $category) {
                foreach ($category as $index => $game) {
                    if ($game['preview_mode']) {
                        unset($gamesCollection[$categoryName][$index]);
                    }
                }
            }
        } catch (\Exception $e) {
            // placeholder
        }

        return $gamesCollection;
    }

    private function getSpecialCategoriesGameList($categories)
    {
        $definitions = [];
        try {
            if ($this->playerSession->isLogin()) {
                foreach ($categories as $category) {
                    switch ($category) {
                        case $this::RECENTLY_PLAYED_GAMES:
                            $definitions[$category] = $this->recentGames->getRecents();
                            break;
                        case $this::FAVORITE_GAMES:
                            $definitions[$category] = $this->favorite->getFavorites();
                            break;
                    }
                }
            }
        } catch (\Exception $e) {
            $definitions = [];
        }
        return $definitions;
    }

    private function getDefinitions($pager)
    {
        $definitions = [];

        try {
            $definitions['configs'] = $this->configAsync->getConfig('gts.gts_configuration');
            $definitions['all-games'] = $this->viewsAsync->getViewById('games_list');
            if ($pager['total_pages'] > 1) {
                $definitions['all-games'] = [];

                $items = [];

                for ($ctr = 0; $ctr < $pager['total_pages']; $ctr++) {
                    $items[$ctr] = $this->viewsAsync->getViewById(
                        'games_list',
                        [
                            'page' => (string) $ctr,
                        ]
                    );
                }

                $definitions['paged-games'] = new DefinitionCollection(
                    $items,
                    [],
                    function ($result) {
                        return $result;
                    }
                );
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
    private function getGamesAndCategory($allGames)
    {
        $gamesList = [];

        $gamesList['all-games'] = $this->arrangeGames($allGames, 'all-games');

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
                $allGames[$game['game_code']] = $game;
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
            switch ($category) {
                case $this::RECENTLY_PLAYED_GAMES:
                    if (isset($data['recently-played'])) {
                        $games = $this->getRecentlyPlayedGames($allGames, $data['recently-played']);

                        if ($games) {
                            $gamesList[$category] = $games;
                        }
                    }

                    break;
                case $this::FAVORITE_GAMES:
                    if (isset($data['favorites'])) {
                        $games = $this->getFavoriteGames($allGames, $data['favorites']);

                        if ($games) {
                            $gamesList[$category] = $games;
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

            $gamesList['id:' . $game['field_game_code'][0]['value']] = $this->processGame($game, $special);
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
                $filters = [];
                foreach ($game['field_game_filter'] as $filter) {
                    if (isset($filter['parent'][0])) {
                        $filters[$filter['parent'][0]['field_games_filter_value'][0]['value']][]
                            = $filter['field_games_filter_value'][0]['value'];
                    }
                }

                $processGame['filters'] = json_encode($filters);
            }


            $processGame['title'] = $game['title'][0]['value'] ?? "";
            $processGame['game_code'] = $game['field_game_code'][0]['value'] ?? "";
            $processGame['game_provider'] = $game['field_game_provider'][0]['value'] ?? "";
            $processGame['keywords'] = $game['field_keywords'][0]['value'] ?? "";
            $processGame['weight'] = 0;
            $processGame['target'] = $game['field_games_target'][0]['value'] ?? "popup";
            $processGame['preview_mode'] = $game['field_preview_mode'][0]['value'] ?? 0;

            $categoryList = [];

            foreach ($game['field_games_list_category'] as $category) {
                $categoryList[$category['field_games_alias'][0]['value']] =
                    $category['field_draggable_views']['category']['weight'];
            }

            $processGame['categories'] = $categoryList;

            $categoryList = [];

            foreach ($game['field_games_list_category'] as $category) {
                $categoryList[$category['field_games_alias'][0]['value']] =
                    $category['field_draggable_views']['category']['weight'];
            }

            $processGame['categories'] = $categoryList;

            return $processGame;
        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Arrange and removed unused categories
     */
    private function getArrangedCategoriesByGame($categories, &$enableRecommended)
    {
        $categoryList = [];
        foreach ($categories as $category) {
            // remove recommended games from category as it will not have its own tab.
            if ($category['field_games_alias'] === $this::RECOMMENDED_GAMES) {
                $enableRecommended = true;
                continue;
            }

            $isPublished = $this->checkIfPublished(
                $category['field_publish_date'],
                $category['field_unpublish_date']
            );
            if ($isPublished) {
                $category['published'] = $isPublished;
                if ($category['field_games_category_logo']) {
                    $categoryLogo = str_replace(
                        '/' . $this->currentLanguage . '/',
                        '/',
                        $category['field_games_category_logo']
                    );
                    $category['field_games_category_logo'] = $this->asset->generateAssetUri(
                        $categoryLogo,
                        ['product' => 'mobile-games']
                    );
                }
                $categoryList[] = $category;
            }
        }
        return $categoryList;
    }

    private function checkIfPublished($dateStart, $dateEnd)
    {
        if (!$dateStart && !$dateEnd) {
            return true;
        }

        $currentDate = new \DateTime(date("Y-m-d H:i:s"), new \DateTimeZone(date_default_timezone_get()));
        $currentDate = $currentDate->getTimestamp();
        if ($dateStart && $dateEnd) {
            $startDate = new \DateTime($dateStart, new \DateTimeZone('UTC'));
            $startDate = $startDate->setTimezone(new \DateTimeZone(date_default_timezone_get()));

            $endDate = new \DateTime($dateEnd, new \DateTimeZone('UTC'));
            $endDate = $endDate->setTimezone(new \DateTimeZone(date_default_timezone_get()));
            if ($startDate->getTimestamp() <= $currentDate && $endDate->getTimestamp() >= $currentDate) {
                return true;
            }
        }

        if ($dateStart && !$dateEnd) {
            $startDate = new \DateTime($dateStart, new \DateTimeZone('UTC'));
            $startDate = $startDate->setTimezone(new \DateTimeZone(date_default_timezone_get()));
            if ($startDate->getTimestamp() <= $currentDate) {
                return true;
            }
        }

        if ($dateEnd && !$dateStart) {
            $endDate = new \DateTime($dateEnd, new \DateTimeZone('UTC'));
            $endDate = $endDate->setTimezone(new \DateTimeZone(date_default_timezone_get()));
            if ($endDate->getTimestamp() >=$currentDate) {
                return true;
            }
        }

        return false;
    }

    private function getFavoriteGamesList($favGames)
    {
        $gameList = [];
        if ($this->playerSession->isLogin()) {
            $favGames = $this->proccessSpecialGames($favGames);
            if (is_array($favGames) && count($favGames) > 0) {
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
                if (is_array($favGames) && count($favGames) > 0) {
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
            if (is_array($games) && count($games) >= 1) {
                foreach ($games as $key => $timestamp) {
                    $gameList[$key]['id'] = $key;
                    $gameList[$key]['timestamp'] = $timestamp;
                }

                return $gameList;
            }
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
                if (is_array($recentlyPlayed) && count($recentlyPlayed) > 0) {
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
