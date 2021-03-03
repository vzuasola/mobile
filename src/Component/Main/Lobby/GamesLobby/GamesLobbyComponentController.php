<?php

namespace App\MobileEntry\Component\Main\Lobby\GamesLobby;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use App\Async\Async;
use App\Async\DefinitionCollection;
use App\MobileEntry\Services\PublishingOptions\PublishingOptions;

class GamesLobbyComponentController
{
    const TIMEOUT = 1800;

    const RECOMMENDED_GAMES = 'recommended-games';
    const ALL_GAMES = 'all-games';
    const RECENTLY_PLAYED_GAMES = 'recently-played';
    const FAVORITE_GAMES = 'favorites';
    const PROVIDER_MAP = [
        'pg_soft' => 'pgsoft'
    ];

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
        $query = $request->getQueryParams();
        $page = null;
        if (isset($query['page'])) {
            $page = $query['page'];
        }
        $playerDetails = $this->playerSession->getDetails();
        $playerCurrency = $playerDetails['currency'] ?? '';
        $item = $this->cacher->getItem('views.games-lobby-data.'
            . $page
            . $this->currentLanguage
            . "-" . $playerCurrency);

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

        if (!isset($query['pvw'])) {
            $data['games'] = $this->removeGamesPreviewMode($data['games']);
        }

        $data['categories'] = $this->getArrangedCategoriesByGame($data['categories_list']);

        unset($data['categories_list']);
        unset($data['special_categories']);

        return $this->rest->output($response, $data);
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
                    $data[$gamesCollection['field_type']][] = 'id:' . $gamesCollection['field_game_code'];
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
            'games_list_v2',
            [
            'page' => (string) $page,
            ]
        );

        $specialCategories = [];
        $specialCategories = $this->getSpecialCategories($categories);

        $data['special_categories'] = $specialCategories;
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
                    if ($game['preview_mode'] == "True") {
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
            $publishOn = $game['publish_on'] ?? '';
            $unpublishOn = $game['unpublish_on'] ?? '';
            $status = (!$publishOn && !$unpublishOn) && ($game['status'] == "True");
            if (PublishingOptions::checkDuration($publishOn, $unpublishOn) && $status) {
                $special = ($categoryId === $this::RECOMMENDED_GAMES);
                $processGame = $this->processGame($game, $special);
                if (!empty($processGame)) {
                    $gameCode = $game['field_game_code'] ?? '';
                    $gamesList['id:' . $gameCode] = $processGame;
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
            if (!$this->checkSupportedCurrency($game)) {
                throw new \Exception('Player does not meet the currency restriction');
            }
            $processGame = [];
            $size = $game['field_games_list_thumbnail_size'];
            $processGame['size'] = ($special) ? 'size-small' : $size;

            if ($game['field_games_ribbon_label']) {
                $processGame['ribbon']['background'] = $game['field_games_ribbon_color'];
                $processGame['ribbon']['color'] = $game['field_games_text_color'];
                $processGame['ribbon']['name'] = $game['field_games_ribbon_label'];
            }

            if (isset($game['field_all_games_ribbon_label'])) {
                $processGame['all_games_ribbon']['background'] =
                    $game['field_all_games_ribbon_color'];
                $processGame['all_games_ribbon']['color'] =
                    $game['field_all_games_text_color'];
                $processGame['all_games_ribbon']['name'] =
                    $game['field_all_games_ribbon_label'];
            }

            $processGame['image'] = [
                'alt' => $game['field_games_list_thumb_img_small_1'],
                'url' =>
                    $this->asset->generateAssetUri(
                        $game['field_games_list_thumb_img_small'],
                        ['product' => 'mobile-games']
                    )
            ];

            if ($processGame['size'] == "size-large" && !$special) {
                $processGame['image'] = [
                    'alt' => $game['field_games_list_thumb_img_big_alt'],
                    'url' =>
                        $this->asset->generateAssetUri(
                            $game['field_games_list_thumb_img_big'],
                            ['product' => 'mobile-games']
                        )
                ];
            }

            $processGame['filters'] = $game['field_game_filter'];
            $processGame['title'] = $game['title'] ?? "";
            $processGame['game_code'] = $game['field_game_code'] ?? "";
            $processGame['game_provider'] = $this->parseProvider($game['field_game_provider'] ?? "");
            $processGame['game_subprovider'] = $game['field_games_subprovider'] ?? "";
            $processGame['game_platform'] = $game['field_game_platform'] ?? "";
            $processGame['keywords'] = $game['field_keywords'] ?? "";
            $processGame['weight'] = 0;
            $processGame['target'] = $game['field_games_target'] ?? "popup";
            $processGame['preview_mode'] = $game['field_preview_mode'] ?? 0;
            $processGame['use_game_loader'] = (isset($game['field_disable_game_loader'])
                && $game['field_disable_game_loader']) ? "false" : "true";

            $categoryList = [];

            foreach ($game['field_games_list_category'] as $category) {
                $categoryList[$category['games_alias']] = $category['games_alias'];
            }

            $processGame['categories'] = $categoryList;

            return $processGame;
        } catch (\Exception $e) {
            return [];
        }
    }

    private function checkSupportedCurrency($game)
    {
        $playerDetails = $this->playerSession->getDetails();
        $playerCurrency = $playerDetails['currency'] ?? '';
        $provider = $this->parseProvider($game['field_game_provider'] ?? "");

        if ($playerDetails) {
            $subProviderCurrency = (!empty($game['field_supported_currencies']))
                ? preg_split("/\r\n|\n|\r/", $game['field_supported_currencies'])
                : [];

            if (count($subProviderCurrency)) {
                return !in_array($playerCurrency, $subProviderCurrency) ? false : true;
            } else {
                switch ($provider) {
                    case 'pas':
                        $config =  $this->configs
                            ->withProduct('mobile-games')
                            ->getConfig('webcomposer_config.icore_playtech_provider');
                        $currencies = explode("\r\n", ($config['dafabetgames_currency'] ?? ''));
                        break;
                    default:
                        $providerConfig =  $this->configs
                            ->withProduct('mobile-games')
                            ->getConfig('webcomposer_config.icore_games_integration');
                        $currencies = explode("\r\n", ($providerConfig[$provider . '_currency'] ?? ''));
                        break;
                }

                if (!in_array($playerCurrency, $currencies)) {
                    return false;
                }
            }
        }

        return true;
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
                $this->setBannerWidget($category);
                $categoryList[] = $category;
            }
        }
        return $categoryList;
    }

    private function setBannerWidget(&$category)
    {
        try {
            $bannerWidget = $category['field_pre_login_banner_widget'] ?? false;
            $langMap = [
                "en" => ["l" => "en", "c" => "MYR"],
                "sc" => ["l" => "zh-cn", "c" => "CNY"],
                "th" => ["l" => "th", "c" => "THB"],
                "kr" => ["l" => "ko", "c" => "KRW"],
                "vn" => ["l" => "vi", "c" => "VND"],
                "id" => ["l" => "id", "c" => "IDR"],
                "in" => ["l" => "en", "c" => "INR"],
                "te" => ["l" => "en", "c" => "INR"],
                "hi" => ["l" => "en", "c" => "INR"],
                "es" => ["l" => "es", "c" => "USD"],
                "pt" => ["l" => "en", "c" => "BRL"],
                "bu" => ["l" => "en", "c" => "MMK"],
            ];
            $currencyMap = [
                "RMB" => "CNY"
            ];
            $bannerLanguage = $langMap[$this->currentLanguage]["l"] ?? "en";
            $bannerCurrency = $langMap[$this->currentLanguage]["c"] ?? "MYR";
            $category['banner_link'] = $category['field_pre_login_link'] ?? '';
            $category['banner_target'] = $category['field_pre_login_link_target'] ?? '';
            $category['banner_height'] = $category['field_pre_banner_height'] ?? '';
            $category['banner_width'] = $category['field_pre_banner_width'] ?? '';

            if ($playerDetails = $this->playerSession->getDetails()) {
                $bannerWidget = $category['field_post_login_banner_widget'] ?? false;
                $playerCurrency = $playerDetails['currency'] ?? "MYR";
                $bannerCurrency = $currencyMap[strtoupper($playerCurrency)] ?? $playerCurrency;
                $category['banner_link'] = $category['field_post_login_link'] ?? '';
                $category['banner_target'] = $category['field_post_login_link_target'] ?? '';
                $category['banner_height'] = $category['field_post_banner_height'] ?? '';
                $category['banner_width'] = $category['field_post_banner_width'] ?? '';
            }

            if (!$bannerWidget) {
                return;
            }

            $category['banner_widget'] = str_replace(
                ['{bannerCurrency}', '{bannerLanguage}'],
                [$bannerCurrency, $bannerLanguage],
                $bannerWidget
            );
        } catch (\Throwable $exception) {
            return;
        }
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

    /**
     * Gets the provider mapping
     */
    private function parseProvider($provider)
    {
        return self::PROVIDER_MAP[$provider] ?? $provider;
    }
}
