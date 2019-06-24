<?php

namespace App\MobileEntry\Component\Main\Lobby\LotteryLobby;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class LotteryLobbyComponentController
{
    const PRODUCT = 'mobile-keno';
    const TIMEOUT = 1800;
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
        $cacher,
        $currentLanguage
    ) {
        $this->playerSession = $playerSession;
        $this->views = $views->withProduct(self::PRODUCT);
        $this->rest = $rest;
        $this->configs = $configs;
        $this->asset = $asset;
        $this->cacher = $cacher;
        $this->currentLanguage = $currentLanguage;
    }

    /**
     * Retrieves list of games
     */
    public function lobby($request, $response)
    {
        $item = $this->cacher->getItem('views.lottery-lobby-data.' . $this->currentLanguage);

        if (!$item->isHit()) {
            $data = $this->getGamesList();

            if (!empty($data)) {
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

        return $this->rest->output($response, $data);
    }

    /**
     * Retrieves list of games from drupal
     */
    private function getGamesList()
    {
        try {
            $gamesList = [];
            $games = $this->views->getViewById('games_list');
            foreach ($games as $game) {
                $gamesList[] = $this->getGameDefinition($game);
            }
        } catch (\Exception $e) {
            $gamesList = [];
        }
        return $gamesList;
    }

    /**
     * Process games list array
     */
    private function getGameDefinition($game)
    {
        try {
            $definition = [];
            if (isset($game['field_game_ribbon'][0])) {
                $ribbon = $game['field_game_ribbon'][0];
                $definition['ribbon']['name'] = $ribbon['field_ribbon_label'][0]['value'];
                $definition['ribbon']['background'] = $ribbon['field_ribbon_background_color'][0]['color'];
                $definition['ribbon']['color'] = $ribbon['field_ribbon_text_color'][0]['color'];
            }
            $size = $game['field_game_thumbnail_size'][0]['value'];
            $definition['size'] = $size == 'small' ? 'w-50' : 'w-100';
            $definition['image'] = [
                'alt' => $game["field_game_thumbnail_$size"][0]['alt'],
                'url' =>
                    $this->asset->generateAssetUri(
                        $game["field_game_thumbnail_$size"][0]['url'],
                        ['product' => self::PRODUCT]
                    )
            ];
            return $definition;
        } catch (\Exception $e) {
            return [];
        }
    }
}
