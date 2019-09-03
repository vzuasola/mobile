<?php

namespace App\MobileEntry\Component\Main\Lobby\ArcadeLobby;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use App\Async\Async;
use App\Async\DefinitionCollection;

class ArcadeLobbyComponentController
{
    const TIMEOUT = 1800;
    const PRODUCT = 'mobile-arcade';
    const RECOMMENDED_GAMES = 'recommended-games';
    const ALL_GAMES = 'all-games';
    const RECENTLY_PLAYED_GAMES = 'recently-played';
    const FAVORITE_GAMES = 'favorites';
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
            $container->get('lang')
        );
    }

    /**
     * Public constructor
     */
    public function __construct(
        $product,
        $configs,
        $viewsFetcher,
        $playerSession,
        $rest,
        $asset,
        $url,
        $cacher,
        $currentLanguage
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
    }

    /**
     * Retrieves list of games and its categories
     */
    public function lobby($request, $response)
    {
        $query = $request->getQueryParams();
        $page = null;
        if (isset($query['page'])) {
            $page = $query['page'];
        }

        $item = $this->cacher->getItem('views.arcade-lobby-data.' . $page . $this->currentLanguage);
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

        $data['categories'] = $this->getPublishedCategories($data['categories_list']);

        unset($data['categories_list']);
        return $this->rest->output($response, $data);
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
     * Gets data from drupal
     */
    private function generatePageLobbyData($page)
    {
        $data = [];
        try {
            $categories = $this->viewsFetcher->getViewById('games_category');
        } catch (\Exception $e) {
            $categories = [];
        }
        try {
            $allGames = $this->viewsFetcher->getViewById(
                'games_list',
                [
                'page' => (string) $page,
                ]
            );
        } catch (\Exception $e) {
            $allGames = [];
        }

        $data['categories_list'] = $categories;
        $data['games']['all-games'] = $this->processAllGames(
            $allGames,
            'all-games'
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
            $isPublished = $this->checkIfPublished(
                $category['field_publish_date'],
                $category['field_unpublish_date']
            );
            if ($isPublished) {
                $category['published'] = $isPublished;
                if ($category['field_games_logo']) {
                    $categoryLogo = str_replace(
                        '/' . $this->currentLanguage . '/',
                        '/',
                        $category['field_games_logo']
                    );
                    $category['field_games_logo'] = $this->asset->generateAssetUri(
                        $category['field_games_logo'],
                        ['product' => self::PRODUCT]
                    );
                }
                $categoryList[] = $category;
            }
        }
        return $categoryList;
    }

    /**
     * Check if a category is published or not
     */
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

    /**
     * Arrange games per category
     */
    private function processAllGames($games, $categoryId)
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
                $filters = [];
                foreach ($game['field_game_filter'] as $filter) {
                    if (isset($filter['parent']) &&
                        isset($filter['parent']['field_games_filter_value'])) {
                        $filters[$filter['parent']['field_games_filter_value'][0]['value']][]
                            = $filter['field_games_filter_value'][0]['value'];
                    }
                }

                $processGame['filters'] = json_encode($filters);
            }


            $processGame['title'] = $game['title'][0]['value'] ?? "";
            $processGame['game_code'] = $game['field_game_code'][0]['value'] ?? "";
            $processGame['game_provider'] = $game['field_game_provider'][0]['value'] ?? "";
            $processGame['game_subprovider'] = $game['field_games_subprovider'][0]['name'][0]['value'] ?? "";
            $processGame['keywords'] = $game['field_keywords'][0]['value'] ?? "";
            $processGame['weight'] = 0;
            $processGame['target'] = $game['field_games_target'][0]['value'] ?? "popup";
            $processGame['preview_mode'] = $game['field_preview_mode'][0]['value'] ?? 0;
            $processGame['use_game_loader'] = (isset($game['field_disable_game_loader'][0]['value'])
                && $game['field_disable_game_loader'][0]['value']) ? "false" : "true";

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
}
