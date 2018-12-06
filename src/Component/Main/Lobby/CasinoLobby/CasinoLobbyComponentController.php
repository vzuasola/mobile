<?php

namespace App\MobileEntry\Component\Main\Lobby\CasinoLobby;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use App\Async\Async;
use App\MobileEntry\Component\Main\Lobby\CasinoLobby\GameTrait;

class CasinoLobbyComponentController
{
    use GameTrait;

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
        $this->views = $views->withProduct('mobile-casino');
        $this->rest = $rest;
        $this->configs = $configs;
        $this->asset = $asset;
        $this->recentGames = $recentGames;
        $this->favorite = $favorite;
        $this->configAsync = $configAsync;
        $this->viewsAsync = $viewsAsync->withProduct('mobile-casino');
        $this->cacher = $cacher;
        $this->currentLanguage = $currentLanguage;
    }

    public function lobby($request, $response)
    {
        $previewMode = $request->getQueryParams();

        $item = $this->cacher->getItem('views.casino-lobby-data.' . $this->currentLanguage);

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
        $specialGamesList = $this->getSpecialCategoriesGameList($data['special_categories']);

        $gamesData = $data['games'] + $specialGamesList;

        $specialCategoryGames = $this->getSpecialGamesbyCategory(
            $data['special_categories'],
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
        $definitions = $this->getDefinitions();

        $asyncData = Async::resolve($definitions);
        $specialCategories = [];
        $specialCategories = $this->getSpecialCategories($categories);

        $data['special_categories'] = $specialCategories;
        $data['categories_list'] = $categories;
        $data['games'] = $this->getGamesAndCategory(
            $asyncData['all-games']
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
            foreach ($categories as $category) {
                $categoryId = $category['field_games_alias'];
                switch ($category['field_games_alias']) {
                    case $this::RECENTLY_PLAYED_GAMES:
                        $definitions[$categoryId] = $this->recentGames->getRecents();
                        break;
                    case $this::FAVORITE_GAMES:
                        $definitions[$categoryId] = $this->favorite->getFavorites();
                        break;
                    default:
                        break;
                }
            }
        } catch (\Exception $e) {
            $definitions = [];
        }

        return $definitions;
    }

    private function getDefinitions()
    {
        $definitions = [];

        try {
            $definitions['configs'] = $this->configAsync->getConfig('casino.casino_configuration');
            $definitions['all-games'] = $this->viewsAsync->getViewById('games_list');
        } catch (\Exception $e) {
            $definitions = [];
        }

        return $definitions;
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
            switch ($category['field_games_alias']) {
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

}
