<?php

namespace App\MobileEntry\Component\Main\Lobby\ptpLUSLobby;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use App\MobileEntry\Services\PublishingOptions\PublishingOptions;
use App\Async\Async;
use App\Async\DefinitionCollection;

class PTPlusLobbyComponentController
{
    const TIMEOUT = 1800;
    const PRODUCT = "mobile-ptplus";
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
        $this->views = $views->withProduct(self::PRODUCT);
        $this->rest = $rest;
        $this->configs = $configs;
        $this->asset = $asset;
        $this->recentGames = $recentGames->withProduct(self::PRODUCT);
        $this->favorite = $favorite;
        $this->configAsync = $configAsync->withProduct(self::PRODUCT);
        $this->viewsAsync = $viewsAsync->withProduct(self::PRODUCT);
        $this->cacher = $cacher;
        $this->currentLanguage = $currentLanguage;
    }

    public function lobby($request, $response)
    {
        $query = $request->getQueryParams();
        $isPreview = $query['pvw'] ?? false;
        $previewKey = $isPreview ? "preview" : "no-preview";
        $page = null;

        if (isset($query['page'])) {
            $page = $query['page'];
        }

        $item = $this->cacher->getItem('views.'.self::PRODUCT.'-lobby-data.'
          . $page . $this->currentLanguage . "-" . $previewKey);

        if (!$item->isHit()) {
            $data = $this->generatePageLobbyData($page);

            if (isset($data['games']['all-games']) && !empty($data['games']['all-games'])) {
                $item->set([
                    'body' => $data,
                ]);

                $this->cacher->save($item, [
                    'expires' => self::TIMEOUT,
                ]);
            }
        } else {
            $body = $item->get();

            $data = $body['body'];
        }
        
        if (!$isPreview) {
            $data['games'] = $this->removeGamesPreviewMode($data['games']);
        }

        $data['categories'] = $this->getArrangedCategoriesByGame($data['categories_list']);
        $this->removeDisabledCategory($data);

        unset($data['categories_list']);
        unset($data['special_categories']);

        return $this->rest->output($response, $data);
    }

    private function removeDisabledCategory(&$data)
    {
        // Get all the active categories
        $categories = array_column($data['categories'], 'field_games_alias');
        array_walk(
            $data['games'],
            function (&$gamesCategory) use ($categories) {
                array_walk(
                    $gamesCategory,
                    function (&$game) use ($categories) {
                      // Compare the fetched categories & categories from games
                        $diff = array_diff(
                            array_keys($game['categories']),
                            $categories
                        );

                      // If no difference, then do nothing
                        if (!$diff) {
                            return;
                        }

                      // else, remove the disabled categories from the game data
                        array_walk(
                            $diff,
                            function ($disabledCategory) use (&$game) {
                                unset($game['categories'][$disabledCategory]);
                            }
                        );
                    }
                );
            }
        );
    }

    public function getFavorites($request, $response)
    {
        $data = [];
        try {
            $favoritesGamesList = $this->getSpecialCategoriesGameList([$this::FAVORITE_GAMES]);
            $favoritesGamesList = $this->proccessSpecialGames($favoritesGamesList[$this::FAVORITE_GAMES]);
            usort($favoritesGamesList, [$this, 'sortRecentGames']);

            foreach ($favoritesGamesList as $games) {
                $data[] = 'id:' . $games['id'];
            }
        } catch (\Exception $e) {
            $data = [];
        }

        return $this->rest->output($response, $data);
    }

    public function getRecentlyPlayed($request, $response)
    {
        $data = [];
        try {
            $recentGamesList = $this->getSpecialCategoriesGameList([$this::RECENTLY_PLAYED_GAMES]);
            $recentGamesList = $this->proccessSpecialGames($recentGamesList[$this::RECENTLY_PLAYED_GAMES]);
            usort($recentGamesList, [$this, 'sortRecentGames']);

            foreach ($recentGamesList as $games) {
                $data[] = 'id:' . $games['id'];
            }
        } catch (\Exception $e) {
            $data = [];
        }

        return $this->rest->output($response, $data);
    }

    public function collection($request, $response)
    {
        $data = [];
        try {
            $gamesCollections = $this->views->getViewById('games_collection');

            if ($gamesCollections) {
                foreach ($gamesCollections as $gamesCollection) {
                    $data[$gamesCollection['field_type']][] =
                        'id:' . $gamesCollection['field_game_code_1'];
                }
            }
        } catch (\Exception $e) {
            $data = [];
        }

        return $this->rest->output($response, $data);
    }

    private function generatePageLobbyData($page)
    {
        $data = [];
        $categories = $this->views->getViewById('games_category');
        $allGames = $this->views->getViewById(
            'games_list',
            [
            'page' => (string) $page,
            ]
        );
        // $specialCategories = [];
        // $specialCategories = $this->getSpecialCategories($categories);

        // $data['special_categories'] = $specialCategories;
        $data['categories_list'] = $categories;
        $data['games'] = $this->getGamesAndCategory(
            $allGames
        );
        
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
     * Arrange games per category
     */
    private function arrangeGames($games, $categoryId)
    {
        $gamesList = [];
        foreach ($games as $game) {
            $publishOn = $game['publish_on'][0]['value'] ?? '';
            $unpublishOn = $game['unpublish_on'][0]['value'] ?? '';
            $status = (!$publishOn && !$unpublishOn) ? $game['status'][0]['value'] : true;
            if (PublishingOptions::checkDuration($publishOn, $unpublishOn) && $status) {
                $special = ($categoryId === $this::RECOMMENDED_GAMES);
                $processGame = $this->processGame($game, $special);
                if (!empty($processGame)) {
                    $gamesList['id:' . $game['field_game_code'][0]['value']] = $processGame;
                }
            }
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

            $processGame['title'] = $game['title'][0]['value'] ?? "";
            $processGame['game_code'] = $game['field_game_code'][0]['value'] ?? "";

            $processGame['image'] = [
                'alt' => $game['field_thumbnail_image'][0]['alt'],
                'url' =>
                    $this->asset->generateAssetUri(
                        $game['field_thumbnail_image'][0]['url'],
                        ['product' => self::PRODUCT]
                    )
            ];
            
            $categoryList = [];
            foreach ($game['field_games_list_category'] as $category) {
                $categoryList[$category['field_games_alias'][0]['value']] =
                    $category['field_games_alias'][0]['value'];
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
    private function getArrangedCategoriesByGame($categories)
    {
        $categoryList = [];
        foreach ($categories as $category) {
            $isPublished = PublishingOptions::checkDuration(
                $category['field_publish_date'],
                $category['field_unpublish_date']
            );
            if ($isPublished) {
                $category['published'] = $isPublished;
                if ($category['field_games_category_logo']) {
                    $category['field_games_category_logo'] = $this->asset->generateAssetUri(
                        $category['field_games_category_logo']
                    );
                }
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
            if (is_array($favGames) && count($favGames) > 0) {
                foreach ($favGames as $gameCode) {
                    $gameList[$gameCode['id']] = 'active';
                }
            }
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
                $isRecent = in_array($gameCode, $recent);
                $recentCount = count($recent);

                // Move item to the top of stack if it exists already
                if ($isRecent) {
                    $this->recentGames->removeRecents([$gameCode]);
                }

                $this->recentGames->saveRecents([$gameCode]);

                // Remove last item when it reaches 22
                if ($recentCount >= 22 || (!$isRecent && $recentCount >= 21)) {
                    $removedGameCode = end($recent);
                    $this->recentGames->removeRecents([$removedGameCode]);
                }

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
