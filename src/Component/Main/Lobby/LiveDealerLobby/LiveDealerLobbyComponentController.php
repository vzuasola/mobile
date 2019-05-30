<?php

namespace App\MobileEntry\Component\Main\Lobby\LiveDealerLobby;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class LiveDealerLobbyComponentController
{
    const PRODUCT = 'mobile-live-dealer';
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
        $params = $request->getQueryParams();
        $isPreview = $params['pvw'] ?? false;
        $previewKey = $isPreview ? "preview" : "no-preview";
        $item = $this->cacher->getItem('views.live-dealer-lobby-data.' . $this->currentLanguage ."-". $previewKey);

        if (!$item->isHit()) {
            $data = $this->getGamesList($isPreview);

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

        return $this->rest->output($response, $data);
    }

    /**
     * Retrieves list of games from drupal
     */
    private function getGamesList($isPreview)
    {
        try {
            $gamesList = [];
            $games = $this->views->getViewById('games_list');
            foreach ($games as $game) {
                $preview_mode = $game['field_preview_mode'][0]['value'] ?? 0;
                if (!$isPreview && $preview_mode) {
                    continue;
                }
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
                $definition['ribbon']['background'] = $ribbon['field_ribbon_background_color'][0]['color'];
                $definition['ribbon']['color'] = $ribbon['field_ribbon_text_color'][0]['color'];
                $definition['ribbon']['name'] = $ribbon['field_label'][0]['value'];
            }

            $definition['provider_image'] = [
                'alt' => $game['field_provider_logo'][0]['alt'],
                'url' =>
                    $this->asset->generateAssetUri(
                        $game['field_provider_logo'][0]['url'],
                        ['product' => self::PRODUCT]
                    )
            ];

            $definition['image'] = [
                'alt' => $game['field_thumbnail_image'][0]['alt'],
                'url' =>
                    $this->asset->generateAssetUri(
                        $game['field_thumbnail_image'][0]['url'],
                        ['product' => self::PRODUCT]
                    )
            ];

            $definition['title'] = $game['title'][0]['value'] ?? "";
            $definition['game_code'] = $game['field_game_code'][0]['value'] ?? "";
            $definition['game_provider'] = $game['field_game_provider'][0]['value'] ?? "";
            $definition['game_platform'] = $game['field_game_platform'][0]['value'] ?? "";
            $definition['lobby_tab'] = $game['field_lobby_tab'][0]['field_alias'][0]['value'] ?? "";
            $definition['target'] = $game['field_games_target'][0]['value'] ?? "popup";
            $definition['preview_mode'] = $game['field_preview_mode'][0]['value'] ?? 0;
            $definition['use_game_loader'] = (isset($game['field_use_game_loader'][0]['value'])
                && $game['field_use_game_loader'][0]['value']) ? "true" : "false";
            $definition['sort_weight'] = $game['field_lobby_tab'][0]['field_draggable_views']['lobby_tab']['weight']
                ?? 0;
            $definition['under_maintenance'] = $game['field_maintenance_blurb'][0]['value'] ?? "";
            $definition['publish_end'] = $game['field_maintenance_end_date'][0]['value'] ?? "";

            return $definition;
        } catch (\Exception $e) {
            return [];
        }
    }
}
