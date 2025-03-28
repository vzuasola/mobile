<?php

namespace App\MobileEntry\Component\Main\Lobby\CasinoLobby;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use App\Async\Async;
use App\MobileEntry\Component\Main\Lobby\CasinoLobby\GameTrait;
use App\MobileEntry\Component\Main\Lobby\GamesListVersionTrait;

class CasinoLobbyComponentController
{
    use GamesListVersionTrait;
    use GameTrait;

    const TIMEOUT = 1800;
    const PRODUCT = 'mobile-casino';
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
    private $pager = "";
    private $gamesListVersion;

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
        $this->views = $views;
        $this->rest = $rest;
        $this->configs = $configs;
        $this->asset = $asset;
        $this->recentGames = $recentGames;
        $this->favorite = $favorite;
        $this->configAsync = $configAsync;
        $this->viewsAsync = $viewsAsync;
        $this->cacher = $cacher;
        $this->currentLanguage = $currentLanguage;
    }

    public function lobby($request, $response)
    {
        $query = $request->getQueryParams();
        $params = $request->getQueryParams();
        $product = $params['lobbyProduct'] ?? 'mobile-casino';
        $this->gamesListVersion = $this->getGamesListVersion($product);
        $this->pager = $query['page'] ?? null;
        $data = $this->getLobbyData($product);

        if (!isset($params['pvw'])) {
            $data['games'] = $this->removeGamesPreviewMode($data['games']);
        }

        $enableRecommended = false;
        $data['categories'] = $this->getArrangedCategoriesByGame($data['categories_list'], $enableRecommended);
        $data['enableRecommended'] = $enableRecommended;

        unset($data['categories_list']);
        unset($data['special_categories']);

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

    public function getFavorites($request, $response)
    {
        $data = [];
        try {
            $favoritesGamesList = $this->getSpecialCategoriesGameList([$this::FAVORITE_GAMES]);
            if (count($favoritesGamesList)) {
                $favoritesGamesList = $this->proccessSpecialGames($favoritesGamesList[$this::FAVORITE_GAMES]);
                usort($favoritesGamesList, [$this, 'sortRecentGames']);

                foreach ($favoritesGamesList as $games) {
                    $data[] = 'id:' . $games['id'];
                }
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
            if (count($recentGamesList)) {
                $recentGamesList = $this->proccessSpecialGames($recentGamesList[$this::RECENTLY_PLAYED_GAMES]);
                usort($recentGamesList, [$this, 'sortRecentGames']);

                foreach ($recentGamesList as $games) {
                    $data[] = 'id:' . $games['id'];
                }
            }
        } catch (\Exception $e) {
            $data = [];
        }

        return $this->rest->output($response, $data);
    }

    private function getLobbyData($product)
    {
        $cacheKey = "views.$product-lobby-data.$this->pager";
        $item = $this->cacher->getItem($cacheKey . $this->currentLanguage);

        if (!$item->isHit()) {
            $data = $this->generateLobbyData($product);
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

        return $data;
    }

    private function generateLobbyData($product)
    {
        $data = [];
        $categories = $this->views->withProduct($product)->getViewById('games_category');
        $definitions = $this->getDefinitions($product);

        $asyncData = Async::resolve($definitions);
        $specialCategories = [];
        $specialCategories = $this->getSpecialCategories($categories);

        $data['special_categories'] = $specialCategories;
        $data['categories_list'] = $categories;
        $data['games'] = $this->getGamesAndCategory(
            $asyncData['all-games'],
            $product
        );

        return $data;
    }

    private function removeGamesPreviewMode($gamesCollection)
    {
        try {
            foreach ($gamesCollection as $categoryName => $category) {
                foreach ($category as $index => $game) {
                    $previewMode = $this->gamesListVersion
                        ? ($game['preview_mode'] == "True") : ($game['preview_mode']);
                    if ($previewMode) {
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

    private function getDefinitions($product)
    {
        $definitions = [];

        try {
            $definitions['configs'] = $this->configAsync->getConfig('casino.casino_configuration');
            $gamesListV = $this->gamesListVersion ? 'games_list_v2' : 'games_list';
            $definitions['all-games'] = $this->viewsAsync->withProduct($product)->getViewById(
                $gamesListV,
                [
                    'page' => (string) $this->pager,
                ]
            );
        } catch (\Exception $e) {
            $definitions = [];
        }

        return $definitions;
    }

    /**
     * Get games by category with sort
     */
    private function getGamesAndCategory($allGames, $product)
    {
        $gamesList = [];

        $gamesList['all-games'] = $this->arrangeGames($product, $allGames, 'all-games');

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
}
