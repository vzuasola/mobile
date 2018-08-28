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
            $container->get('asset')
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
        $asset
    ) {
        $this->playerSession = $playerSession;
        $this->views = $views->withProduct('mobile-games');
        $this->rest = $rest;
        $this->configs = $configs;
        $this->asset = $asset;
    }

    public function lobby($request, $response)
    {
        $data = [];

        try {
            try {
                $categories = $this->views->getViewById('games_category');
                $data['games'] = $this->getGamesbyCategory($categories);
                $data['categories'] = $this->getArrangedCategoriesByGame($categories, $data['games']);
            } catch (\Exception $e) {
                $data['categories'] = [];
                $data['games'] = [];
            }

        } catch (\Exception $e) {
            $data = [];
        }

        return $this->rest->output($response, $data);
    }

    /**
     * Get games by category with sort
     */
    private function getGamesbyCategory($categories)
    {
        $gamesList = [];
        foreach ($categories as $category) {
            $games = $this->views->getViewById('games_list', [
                'category' => $category['tid']
            ]);

            if ($games) {
                $gamesList[$category['field_games_alias']] = $this->arrangeGames($games);
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
    private function processGame($game)
    {
        try {
            $processGame = [];
            $processGame['size'] = $game['field_games_list_thumbnail_size'][0]['value'];

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

            if ($processGame['size'] == "size-large") {
                $processGame['image'] = [
                    'alt' => $game['field_games_list_thumb_img_big'][0]['alt'],
                    'url' =>
                        $this->asset->generateAssetUri(
                            $game['field_games_list_thumb_img_big'][0]['url'],
                            ['product' => 'mobile-games']
                        )
                ];
            }

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
            if (isset($gamesList[$category['field_games_alias']])) {
                $categoryList[] = $category;
            }
        }

        return $categoryList;
    }

}
