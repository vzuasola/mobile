<?php

namespace App\MobileEntry\Component\Main\Lobby\PTPlusLobby;

use App\Drupal\Config;
use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use App\MobileEntry\Services\PublishingOptions\PublishingOptions;
use App\Async\Async;
use App\Async\DefinitionCollection;
use GuzzleHttp\Client;

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
    private $player;
    private $lang;

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
            $container->get('lang'),
            $container->get('player'),
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
        $currentLanguage,
        $player,
        $lang
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
        $this->player = $player;
        $this->lang = $lang;
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
            $data = $this->generatePageLobbyData($page, $isPreview);

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

    private function generatePageLobbyData($page, $isPreview)
    {
        $data = [];
        $categories = $this->views->getViewById('games_category');
        $allGames = $this->views->getViewById(
            'games_list',
            [
                'page' => (string) $page,
            ]
        );
        $data['categories_list'] = $categories;
        $data['games']['all-games'] = $this->arrangeGames(
            $allGames,
            'all-games',
            $isPreview
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

    public function banners($request, $response)
    {
        // sending requests for leaderboard and dailymission
        $bannerDailymissionApi = $this->tournamentAPI('dailymission');
        $bannerLeaderboardApiProcessing = $this->tournamentAPI('leaderboard', 1);
        $bannerLeaderboardApiPrepare = $this->tournamentAPI('leaderboard', 2);
        // end requests

        try {
            $data = [];
            $banners = $this->views->getViewById('tournament_banners');

            foreach ($banners as $banner) {
                // check if tournament duration is not yet expired
                if (PublishingOptions::checkDuration(
                    $banner['field_tournament_start_date'][0]['value'],
                    $banner['field_tournament_end_date'][0]['value']
                )) {
                    $banner['banner_id'] = $banner['field_banner_id'][0]['value'] ?? '';
                    $typeBoard = $banner['field_type_board'][0]['value'] ?? '';
                    $statusBoard = $banner['field_status_board'][0]['value'] ?? '';

                    // filtering request for leaderboard and dailymission
                    $banner['lightbox_games'] = $this->filterGamesByTypeStatus(
                        $banner['banner_id'],$bannerDailymissionApi);
                    if ($typeBoard === 'leaderboard') {
                        if ($statusBoard === '1') {
                            $banner['lightbox_games'] = $this->filterGamesByTypeStatus(
                                $banner['banner_id'],$bannerLeaderboardApiProcessing);
                        } elseif ($statusBoard === '2') {
                            $banner['lightbox_games'] = $this->filterGamesByTypeStatus(
                                $banner['banner_id'],$bannerLeaderboardApiPrepare);
                        }
                    }
                    // end filter

                    $banner['image'] = [
                        'alt' => $banner['field_banner_image'][0]['value']['alt'],
                        'url' =>
                            $this->asset->generateAssetUri(
                                $banner['field_banner_image'][0]['value']['url'],
                                ['product' => self::PRODUCT]
                            )
                    ];

                    $lightbox_status = $banner['field_lightbox_status'][0]['value'] ?? '0';
                    $banner['lightbox_status'] = filter_var($lightbox_status, FILTER_VALIDATE_BOOLEAN);

                    if ($banner['lightbox_status']) {
                        $banner['lightbox'] = json_encode([
                            'lightbox_games_title' => $banner['field_lightbox_games_title'][0]['value'],
                            'lightbox_intro' => $banner['field_lightbox_intro'][0]['value'],
                            'lightbox_join_button' => $banner['field_lightbox_join_button'][0]['value'],
                            'lightbox_mechanics' => $banner['field_lightbox_mechanics'][0]['value'],
                            'lightbox_mechanics_title' => $banner['field_lightbox_mechanics_title'][0]['value'],
                            'lightbox_rewards' => $banner['field_lightbox_rewards'][0]['value'],
                            'lightbox_rewards_title' => $banner['field_lightbox_rewards_title'][0]['value'],
                        ]);
                    }

                    $data[] = $banner;
                }
            }
        } catch (\Exception $e) {
            $data = [];
        }

        return $this->rest->output($response, $data);
    }

    /**
     * Filter Games By Type And Status
     */
    public function filterGamesByTypeStatus($id, $apiList)
    {
        foreach ($apiList->data as $value) {
            if ( $value->id == trim($id) ) {
                return json_encode($value->games);
            }
        }
    }

    /**
     * Send request To Tournament Side
     */
    public function tournamentAPI($type, $status = null)
    {
        try {
            $status = $status ?? 2;
            $generalConfiguration = $this->tournamentConfiguration($type);
            $entityName = 'W2W' . $generalConfiguration['currency'];
            $lng = $generalConfiguration['language'];
            $client = new Client();
            $res = $client->request(
                'POST',
                $generalConfiguration['url'],
                [
                    'form_params' => [
                        'entity_name' => $entityName,
                        'entity_key' => $generalConfiguration['key_mapping'][$entityName],
                        'isMobile' => false,
                        'language' => $lng,
                        'currency' => $generalConfiguration['currency'],
                        'status' => $status
                    ],
                ]
            );

            return json_decode($res->getBody()->getContents());

        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Get Tournament Configuration
     */
    public function tournamentConfiguration($type)
    {
        $data = [];
        $settings =  $this->configs->withProduct('mobile-ptplus')
            ->getConfig('webcomposer_config.tournament_settings');

        $urlMapping = [
            'leaderboard' => $settings['leaderboards_api'],
            'dailymission' => $settings['daily_mission_api'],
        ];

        $data['key_mapping'] = Config::parseMultidimensional($settings['key_mapping']);
        $data['url'] = $urlMapping[$type];
        $data['default_key_name'] = Config::parseMultidimensional($settings['default_key_name_mapping']);
        $data['currency'] = $data['default_key_name'][strtolower($this->lang)];
        $langs = Config::parseMultidimensional($settings['api_language_mapping']);
        $data['language'] = $langs[$this->lang];
        $data['lang_mapping'] = $langs;
        $data['test'] = $langs;
        if ($this->playerSession->isLogin()) {
            $playerConfig = $this->player;

            $data['playerId']  = $playerConfig->getPlayerId();
            $data['currency']  = $playerConfig->getCurrency();
            $data['productId'] = $playerConfig->getProductId();
            $data['regLang']   = (string)$playerConfig->getLocale();
        }

        if ($data['currency'] === 'RMB') {
            $data['currency'] = 'CNY';
        }

        return $data;
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
    private function arrangeGames($games, $categoryId, $isPreview)
    {
        $gamesList = [];
        foreach ($games as $game) {
            $publishOn = $game['publish_on'][0]['value'] ?? '';
            $unpublishOn = $game['unpublish_on'][0]['value'] ?? '';
            $status = (!$publishOn && !$unpublishOn) ? $game['status'][0]['value'] : true;
            if (PublishingOptions::checkDuration($publishOn, $unpublishOn) && $status) {
                $special = ($categoryId === $this::RECOMMENDED_GAMES);
                $processedGame = $this->processGame($game, $special);
                $preview_mode = $game['field_preview_mode'][0]['value'] ?? 0;
                if (!$isPreview && $preview_mode) {
                    continue;
                }
                if (!empty($processedGame)) {
                    $gamesList['id:' . $game['field_game_code'][0]['value']] = $processedGame;
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
            $processGame['keywords'] = $game['field_keywords'][0]['value'] ?? "";
            $processGame['game_provider'] = $game['field_game_provider'][0]['value'] ?? "ptplus";
            $processGame['use_game_loader'] = !empty($game['field_disable_game_loader'][0]['value']) ? false : true;
            $processGame['target'] = $game['field_games_target'][0]['value'] ?? "popup";

            if (isset($game['field_game_ribbon'][0])) {
                $ribbon = $game['field_game_ribbon'][0];
                $processGame['ribbon']['background'] = $ribbon['field_ribbon_background_color'][0]['color'];
                $processGame['ribbon']['color'] = $ribbon['field_ribbon_text_color'][0]['color'];
                $processGame['ribbon']['name'] = $ribbon['name'][0]['value'];
            }

            $processGame['image'] = [
                'alt' => $game['field_thumbnail_image'][0]['alt'],
                'url' =>
                    $this->asset->generateAssetUri(
                        $game['field_thumbnail_image'][0]['url'],
                        ['product' => self::PRODUCT]
                    )
            ];
            $processGame['image_big'] = [
                'alt' => $game['field_game_thumbnail_big'][0]['alt'],
                'url' =>
                    $this->asset->generateAssetUri(
                        $game['field_game_thumbnail_big'][0]['url'],
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
                        $category['field_games_category_logo'][0]['url'],
                        ['product' => self::PRODUCT]
                    );
                }
                $category['field_games_alias'] = $category['field_games_alias'][0]['value'] ?? "";
                $category['name'] = $category['name'][0]['value'];
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

    /**
     * Retrieves list of games collection which will be used for sorting games.
     */
    public function collection($request, $response)
    {
        $data = [];
        $query = $request->getQueryParams();
        $isPreview = $query['pvw'] ?? false;
        try {
            $gamesCollections = $this->views->getViewById('mobile-collection');
            if ($gamesCollections) {
                foreach ($gamesCollections as $gamesCollection) {
                    $type = $gamesCollection['field_type'][0]['name'][0]['value'] ?? 'top';
                    $gameCategory = $gamesCollection['field_games_category'][0]['field_games_alias'][0]['value'] ?? '';
                    $games = $gamesCollection['field_games'] ?? [];
                    if ($gameCategory && $games) {
                        $data[$type][$gameCategory] = $this->getGameCodes($games, $isPreview);
                    }
                }
            }
        } catch (\Exception $e) {
            $data = [];
        }

        return $this->rest->output($response, $data);
    }

    private function getGameCodes($gamesCollectionList, $isPreview)
    {
        $data = [];
        foreach ($gamesCollectionList as $games) {
            if (empty($games['field_game_code'][0]['value'])) {
                continue;
            }
            $preview_mode = $games['field_preview_mode'][0]['value'] ?? 0;
            if (!$isPreview && $preview_mode) {
                continue;
            }
            $data[] = $games['field_game_code'][0]['value'];
        }

        return $data;
    }
}
