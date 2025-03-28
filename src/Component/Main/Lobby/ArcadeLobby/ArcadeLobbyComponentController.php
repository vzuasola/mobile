<?php

namespace App\MobileEntry\Component\Main\Lobby\ArcadeLobby;

use App\Player\PlayerSession;
use App\MobileEntry\Services\PublishingOptions\PublishingOptions;
use App\MobileEntry\Component\Main\Lobby\GamesListVersionTrait;

class ArcadeLobbyComponentController
{
    use GamesListVersionTrait;

    const CURRENCY = '_currency';
    const TIMEOUT = 1800;
    const PRODUCT = 'mobile-arcade';
    const RECOMMENDED_GAMES = 'recommended-games';
    const ALL_GAMES = 'all-games';
    const RECENTLY_PLAYED_GAMES = 'recently-played';
    const FAVORITE_GAMES = 'favorites';
    const PROVIDER_MAP = [
        'pg_soft' => 'pgsoft'
    ];

     /**
     * @var App\Fetcher\Drupal\ViewsFetcher
     */
    private $viewsFetcher;

    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;

    private $product;

    private $rest;

    private $asset;

    private $url;

    private $cacher;

    private $currentLanguage;

    private $recentGames;

    private $favorite;

    private $playerDetails;

    private $providersCurrency = [];

    private $gamesListVersion;


    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('product_resolver'),
            $container->get('config_fetcher'),
            $container->get('views_fetcher'),
            $container->get('player_session'),
            $container->get('rest'),
            $container->get('asset'),
            $container->get('uri'),
            $container->get('redis_cache_adapter'),
            $container->get('lang'),
            $container->get('recents_fetcher'),
            $container->get('favorites_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct(
        $product,
        $configs,
        $viewsFetcher,
        PlayerSession $playerSession,
        $rest,
        $asset,
        $url,
        $cacher,
        $currentLanguage,
        $recentGames,
        $favorite
    ) {
        $this->product = $product;
        $this->configs = $configs->withProduct(self::PRODUCT);
        $this->viewsFetcher = $viewsFetcher->withProduct(self::PRODUCT);
        $this->playerSession = $playerSession;
        $this->rest = $rest;
        $this->asset = $asset;
        $this->url = $url;
        $this->cacher = $cacher;
        $this->currentLanguage = $currentLanguage;
        $this->recentGames = $recentGames;
        $this->favorite = $favorite;
        $this->gamesListVersion = $this->getGamesListVersion();
    }

    /**
     * Retrieves list of games and its categories
     */
    public function lobby($request, $response)
    {
        $query = $request->getQueryParams();
        $isPreview = $query['pvw'] ?? false;
        $previewKey = $isPreview ? "preview" : "no-preview";
        $this->playerDetails = $this->playerSession->getDetails();
        $playerCurrency = $this->playerDetails['currency'] ?? '';

        $page = null;
        if (isset($query['page'])) {
            $page = $query['page'];
        }

        $item = $this->cacher->getItem('views.arcade-lobby-data.'
            . $page
            . $this->currentLanguage
            . "-" . $previewKey
            . ($playerCurrency ? "-$playerCurrency" : ''));

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

        $data['categories'] = $this->getPublishedCategories($data['categories_list']);

        unset($data['categories_list']);
        return $this->rest->output($response, $data);
    }

    /**
     * set player's recently played games
     */
    public function recent($request, $response)
    {
        $gameCode = $request->getParsedBody();
        if (isset($gameCode['gameCode'])) {
            $result = $this->setRecentlyPlayedGames($gameCode['gameCode']);
            return $this->rest->output($response, $result);
        }
    }

     /**
     * set player's favorite games
     */
    public function favorite($request, $response)
    {
        $gameCode = $request->getParsedBody();
        if (isset($gameCode['gameCode'])) {
            $result = $this->toggleFavoriteGames($gameCode['gameCode']);
            return $this->rest->output($response, $result);
        }
    }

    /**
     * Retrieves list of player's favorite games
     */
    public function getFavorites($request, $response)
    {
        $data = [];
        try {
            if ($this->playerSession->isLogin()) {
                $favoritesGamesList = $this->favorite->getFavorites();
                $favoritesGamesList = $this->proccessSpecialGames($favoritesGamesList);
                usort($favoritesGamesList, [$this, 'sortGamesByTimestamp']);

                foreach ($favoritesGamesList as $games) {
                    $data[] = 'id:' . $games['id'];
                }
            }
        } catch (\Exception $e) {
            $data = [];
        }

        return $this->rest->output($response, $data);
    }

    /**
     * Retrieves list of player's most recently played games
     */
    public function getRecentlyPlayed($request, $response)
    {
        $data = [];
        try {
            if ($this->playerSession->isLogin()) {
                $recentGamesList = $this->recentGames->getRecents();
                $recentGamesList = $this->proccessSpecialGames($recentGamesList);
                usort($recentGamesList, [$this, 'sortGamesByTimestamp']);

                foreach ($recentGamesList as $games) {
                    $data[] = 'id:' . $games['id'];
                }
            }
        } catch (\Exception $e) {
            $data = [];
        }

        return $this->rest->output($response, $data);
    }

     /**
     * Retrieves list of games collection which will be used for sorting games.
     */
    public function getGamesCollection($request, $response)
    {
        $data = [];
        try {
            $gamesCollections = $this->viewsFetcher->getViewById('games_collection');
        } catch (\Exception $e) {
            $gamesCollections = [];
        }

        foreach ($gamesCollections as $gamesCollection) {
            if (isset($gamesCollection['field_type'][0]['name'][0]['value'])) {
                $type = $gamesCollection['field_type'][0]['name'][0]['value'];
                $games = $gamesCollection['field_games'] ?? [];
                $data[$type] = $this->getGameCodes($games);
            }
        }

        return $this->rest->output($response, $data);
    }

    private function getGameCodes($gamesCollectionList)
    {
        $data = [];
        foreach ($gamesCollectionList as $games) {
            if ($games['field_game_code'][0]['value']) {
                $data[] = 'id:' . $games['field_game_code'][0]['value'];
            }
        }

        return $data;
    }

    private function getCurrencyConfig($gameConfig)
    {
        try {
            $currencies = array_filter($gameConfig, function ($config) {
                $length = strlen(self::CURRENCY);
                if ($length == 0) {
                    return true;
                }

                return (substr($config, -$length) === self::CURRENCY);
            }, ARRAY_FILTER_USE_KEY);

            $this->providersCurrency = array_merge($this->providersCurrency, $currencies);
        } catch (\Exception $e) {
            $this->providersCurrency = [];
        }
    }

    /**
     * Gets data from drupal
     */
    private function generatePageLobbyData($page, $isPreview)
    {
        $data = [];
        try {
            $icoreConfig = $this->configs->getConfig('webcomposer_config.icore_games_integration');
            $this->getCurrencyConfig($icoreConfig);

            $gpiConfig =  $this->configs->getConfig('webcomposer_config.games_gpi_provider');
            $this->getCurrencyConfig($gpiConfig);
        } catch (\Exception $e) {
            $this->providersCurrency = [];
        }

        try {
            $gamesProviders = $this->viewsFetcher->getViewById('games_providers');
        } catch (\Exception $e) {
            $gamesProviders = [];
        }

        try {
            $categories = $this->viewsFetcher->getViewById('games_category');
        } catch (\Exception $e) {
            $categories = [];
        }

        $gamesListV = $this->gamesListVersion ? 'games_list_v2' : 'games_list';
        try {
            $allGames = $this->viewsFetcher->getViewById(
                $gamesListV,
                [
                    'page' => (string) $page,
                ]
            );
        } catch (\Exception $e) {
            $allGames = [];
        }

        $data['categories_list'] = $categories;
        $data['providers_list'] = $gamesProviders;
        $data['games']['all-games'] = $this->processAllGames(
            $allGames,
            'all-games',
            $isPreview
        );

        return $data;
    }

    /**
     * Arrange and removed unused categories
     */
    private function getPublishedCategories($categories)
    {
        $categoryList = [];
        foreach ($categories as $category) {
            if ($category['field_games_logo']) {
                $categoryLogo = str_replace(
                    '/' . $this->currentLanguage . '/',
                    '/',
                    $category['field_games_logo']
                );
                $category['field_games_logo'] = $this->asset->generateAssetUri(
                    $categoryLogo,
                    ['product' => self::PRODUCT]
                );
            }
            $categoryList[] = $category;
        }

        return $categoryList;
    }

    /**
     * Arrange games per category
     */
    private function processAllGames($games, $categoryId, $isPreview)
    {
        $gamesList = [];
        foreach ($games as $game) {
            $publishOn = $game['publish_on'][0]['value'] ?? '';
            $unpublishOn = $game['unpublish_on'][0]['value'] ?? '';
            $status = $this->getStatus($publishOn, $unpublishOn, $game);

            if (PublishingOptions::checkDuration($publishOn, $unpublishOn) && $status) {
                $special = ($categoryId === $this::RECOMMENDED_GAMES);
                $processedGame = $this->gamesListVersion
                    ? $this->processGameV2($game, $special) : $this->processGameV1($game, $special);
                $previewMode = $this->gamesListVersion
                    ? ($game['field_preview_mode'][0]['value'] === 'true')
                    : ($game['field_preview_mode'][0]['value'] ?? 0);
                if ((!$isPreview && $previewMode) || !count($processedGame)) {
                    continue;
                }
                if (count($processedGame['categories'])) {
                    $gamesList['id:' . $game['field_game_code'][0]['value']] =  $processedGame;
                }
            }
        }
        return $gamesList;
    }

    /**
     * Simplify game array V2
     */
    private function processGameV2($game, $special = false)
    {
        try {
            $processGame = [];
            $subProvider = $game['field_games_subprovider_export'][0]['value'] ?? null;
            $provider = $this->parseProvider($game['field_game_provider'][0]['value'] ?? "");
            $subProviderCurrency = (isset($subProvider['supported_currencies']))
                ? preg_split("/\r\n|\n|\r/", $subProvider['supported_currencies'])
                : [];
            $providerCurrency = (isset($this->providersCurrency[$provider . self::CURRENCY]))
                ? preg_split("/\r\n|\n|\r/", $this->providersCurrency[$provider . self::CURRENCY])
                : [];

            if ($this->playerDetails) {
                // If the game has a subprovider currency restriction, verify if the user met the restriction
                if (count($subProviderCurrency)) {
                    $this->verifyCurrency($subProviderCurrency);
                } // else verify if the player met the provider currency restriction
                else {
                    $this->verifyCurrency($providerCurrency);
                }
            }

            if (isset($game['field_game_ribbon_export'][0]['value'])) {
                $ribbon = $game['field_game_ribbon_export'][0]['value'] ?? [];
                $processGame['ribbon']['background'] = $ribbon['games_ribbon_color'] ?? null;
                $processGame['ribbon']['color'] = $ribbon['games_text_color'] ?? null;
                $processGame['ribbon']['name'] = $ribbon['games_ribbon_label'] ?? null;
            }

            if (isset($game['field_all_games_category_ribbon_export'][0]['value'])) {
                $allGamesribbon = $game['field_all_games_category_ribbon_export'][0]['value'] ?? [];
                $processGame['all_games_ribbon']['background'] =
                    $allGamesribbon['games_ribbon_color'] ?? null;
                $processGame['all_games_ribbon']['color'] =
                    $allGamesribbon['games_text_color'] ?? null;
                $processGame['all_games_ribbon']['name'] =
                    $allGamesribbon['games_ribbon_label'] ?? null;
            }

            $processGame['image'] = [
                'alt' => $game['field_games_thumbnail_image_export'][0]['value']['alt'] ?? '',
                'url' =>
                    $this->asset->generateAssetUri(
                        $game['field_games_thumbnail_image_export'][0]['value']['url'] ?? '',
                        ['product' => self::PRODUCT]
                    )
            ];

            $processGame['filters'] = $game['field_game_filter_export'][0]['value'] ?? [];
            $processGame['title'] = $game['title'][0]['value'] ?? "";
            $processGame['game_code'] = $game['field_game_code'][0]['value'] ?? "";
            $processGame['external_game_id'] = $game['field_external_game_id'][0]['value'] ?? "";
            $processGame['game_provider'] = $provider;
            $processGame['game_subprovider'] = $subProvider['name'] ?? "";
            $processGame['keywords'] = $game['field_keywords'][0]['value'] ?? "";
            $processGame['weight'] = 0;
            $processGame['target'] = $game['field_games_target'][0]['value'] ?? "popup";
            $processGame['preview_mode'] = $game['field_preview_mode'][0]['value'] === 'true' ? true : false;
            $processGame['use_game_loader'] = (isset($game['field_disable_game_loader'][0]['value'])
                && $game['field_disable_game_loader'][0]['value']) ? "false" : "true";
            $categories = $this->getGameCategories($game['field_games_list_category_export'][0]['value']);
            $processGame['categories'] = $categories;

            return $processGame;
        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Get games list of published and enabled categories
     */
    private function getGameCategories($gameCategories)
    {
        $categoryList = [];
        foreach ($gameCategories as $category) {
            if ($this->gamesListVersion) {
                $publishDate = $category['publish_date'] ?? '';
                $unpublishDate = $category['unpublish_date'] ?? '';
                $gamesDisable = $category['games_disable'];
                $gamesAlias = $category['games_alias'];
            } else {
                $publishDate = $category['field_publish_date'][0]['value'] ?? '';
                $unpublishDate = $category['field_unpublish_date'][0]['value'] ?? '';
                $gamesDisable = $category['field_games_disable'][0]['value'];
                $gamesAlias = $category['field_games_alias'][0]['value'];
            }
            $isPublished = PublishingOptions::checkDuration(
                $publishDate,
                $unpublishDate
            );
            if ($gamesDisable !== "1" && $isPublished) {
                $categoryList[$gamesAlias] = $gamesAlias;
            }
        }

        return $categoryList;
    }

    /**
     * Simplify game array for recently played / favorites
     */
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
     * Sort recently played games/favorites based on timestamp
     */
    public static function sortGamesByTimestamp($game1, $game2)
    {
        return ($game1['timestamp'] > $game2['timestamp']) ? -1 : 1;
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
                usort($recentlyPlayed, [$this, 'sortGamesByTimestamp']);
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
     * Checks the game if it supports the players currency
     */
    private function verifyCurrency($currencyList)
    {
        if (!in_array($this->playerDetails['currency'], $currencyList)) {
            throw new \Exception('Player does not meet the currency restriction');
        }
    }

    /**
     * Gets the provider mapping
     */
    private function parseProvider($provider)
    {
        return self::PROVIDER_MAP[$provider] ?? $provider;
    }

    /**
     * Get status
     */
    private function getStatus($publishOn, $unpublishOn, $game)
    {
        if ($this->gamesListVersion) {
            $published = $game['status'][0]['value'] === 'true';
        } else {
            $published = $game['status'][0]['value'];
        }

        return (!$publishOn && !$unpublishOn) ? $published : true;
    }

    /**
     * Simplify game array V1
     */
    private function processGameV1($game, $special = false)
    {
        try {
            $processGame = [];
            $subprovider = $game['field_games_subprovider'][0] ?? [];
            $provider = $this->parseProvider($game['field_game_provider'][0]['value'] ?? "");
            $subProviderCurrency = (isset($subprovider['field_supported_currencies'][0]['value']))
                ? preg_split("/\r\n|\n|\r/", $subprovider['field_supported_currencies'][0]['value'])
                : [];
            $providerCurrency = ($this->providersCurrency[$provider . "_currency"])
                ? preg_split("/\r\n|\n|\r/", $this->providersCurrency[$provider . "_currency"])
                : [];

            if ($this->playerDetails) {
                // If the game has a subprovider currency restriction, verify if the user met the restriction
                if (count($subProviderCurrency)) {
                    $this->verifyCurrency($subProviderCurrency);
                } // else verify if the player met the provider currency restriction
                else {
                    $this->verifyCurrency($providerCurrency);
                }
            }

            if (isset($game['field_game_ribbon'][0])) {
                $ribbon = $game['field_game_ribbon'][0];
                $processGame['ribbon']['background'] = $ribbon['field_games_ribbon_color'][0]['color'];
                $processGame['ribbon']['color'] = $ribbon['field_games_text_color'][0]['color'];
                $processGame['ribbon']['name'] = $ribbon['field_games_ribbon_label'][0]['value'];
            }

            if (isset($game['field_all_games_category_ribbon'][0])) {
                $allGamesribbon = $game['field_all_games_category_ribbon'][0];
                $processGame['all_games_ribbon']['background'] =
                    $allGamesribbon['field_games_ribbon_color'][0]['color'];
                $processGame['all_games_ribbon']['color'] =
                    $allGamesribbon['field_games_text_color'][0]['color'];
                $processGame['all_games_ribbon']['name'] =
                    $allGamesribbon['field_games_ribbon_label'][0]['value'];
            }

            $processGame['image'] = [
                'alt' => $game['field_games_thumbnail_image'][0]['alt'],
                'url' =>
                    $this->asset->generateAssetUri(
                        $game['field_games_thumbnail_image'][0]['url'],
                        ['product' => self::PRODUCT]
                    )
            ];

            if (isset($game['field_game_filter']) && count($game['field_game_filter']) > 0) {
                $processGame['filters'] = $this->getGameFilters($game['field_game_filter']);
            }

            $processGame['title'] = $game['title'][0]['value'] ?? "";
            $processGame['game_code'] = $game['field_game_code'][0]['value'] ?? "";
            $processGame['external_game_id'] = $game['field_external_game_id'][0]['value'] ?? "";
            $processGame['game_provider'] = $provider;
            $processGame['game_subprovider'] = $subprovider['name'][0]['value'] ?? "";
            $processGame['keywords'] = $game['field_keywords'][0]['value'] ?? "";
            $processGame['weight'] = 0;
            $processGame['target'] = $game['field_games_target'][0]['value'] ?? "popup";
            $processGame['preview_mode'] = $game['field_preview_mode'][0]['value'] ?? 0;
            $processGame['use_game_loader'] = (isset($game['field_disable_game_loader'][0]['value'])
                && $game['field_disable_game_loader'][0]['value']) ? "false" : "true";

            $processGame['categories'] = $this->getGameCategories($game['field_games_list_category']);

            return $processGame;
        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Get games filters
     */
    private function getGameFilters($gameFilters)
    {
        $filters = [];
        foreach ($gameFilters as $filter) {
            if (isset($filter['parent']) &&
                isset($filter['parent']['field_games_filter_value'])) {
                $filters[$filter['parent']['field_games_filter_value'][0]['value']][]
                    = $filter['field_games_filter_value'][0]['value'];
            }
        }

        return json_encode($filters);
    }
}
