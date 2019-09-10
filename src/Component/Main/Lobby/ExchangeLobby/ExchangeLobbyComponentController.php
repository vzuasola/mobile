<?php

namespace App\MobileEntry\Component\Main\Lobby\ExchangeLobby;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use App\MobileEntry\Services\Product\Products;

class ExchangeLobbyComponentController
{
    const PRODUCT = 'mobile-exchange';
    const TIMEOUT = 1800;
    private $productCategory;
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
            $container->get('lang'),
            $container->get('uri')
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
        $currentLanguage,
        $url
    ) {
        $this->playerSession = $playerSession;
        $this->views = $views->withProduct(self::PRODUCT)->setLanguage('in');
        $this->rest = $rest;
        $this->configs = $configs;
        $this->asset = $asset;
        $this->cacher = $cacher;
        $this->currentLanguage = $currentLanguage;
        $this->url = $url;
    }

    /**
     * Retrieves lobby tiles
     */
    public function lobby($request, $response)
    {
        $item = $this->cacher->getItem('views.exchange-lobby-data.' . $this->currentLanguage);

        if (!$item->isHit()) {
            $params = $request->getQueryParams();
            $keyword = 'exchange';
            if ($params['keyword'] && in_array($params['keyword'], Products::PRODUCT_ALIAS['exchange'])) {
                $keywords = explode('/', $params['keyword']);
                $this->productCategory = $keyword = $keywords[1] ?? '/';
            }

            $data = $this->getLobbyTiles($keyword);

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
     * Retrieves lobby tiles from drupal
     */
    private function getLobbyTiles($keyword)
    {
        try {
            $lobbyTiles = [];
            $tiles = $this->views->getViewById('lobby_tiles');

            foreach ($tiles as $tile) {
                $lobbyTiles[] = $this->getTileDefinition($tile, $keyword);
            }
        } catch (\Exception $e) {
            $lobbyTiles = [];
        }
        return $lobbyTiles;
    }

    /**
     * Process lobby tiles array
     */
    private function getTileDefinition($tile, $keyword)
    {
        try {
            $definition = [];
            if (isset($tile['field_lobby_tile_ribbon'][0])) {
                $ribbon = $tile['field_lobby_tile_ribbon'][0];
                $definition['ribbon']['name'] = $ribbon['field_ribbon_label'][0]['value'];
                $definition['ribbon']['background'] = $ribbon['field_ribbon_background_color'][0]['color'];
                $definition['ribbon']['color'] = $ribbon['field_ribbon_text_color'][0]['color'];
            }
            $size = $tile['field_lobby_thumbnail_size'][0]['value'];
            $definition['size'] = $size == 'small' ? 'small-image' : 'large-image';
            $imgUrl = $this->asset->generateAssetUri(
                $tile["field_lobby_thumbnail_$size"][0]['url'],
                ['product' => self::PRODUCT]
            );
            $definition['image'] = [
                'alt' => $tile["field_lobby_thumbnail_$size"][0]['alt'],
                'url' => $imgUrl
            ];
            $definition['size'] = $size == 'small' ? 'col-4' : 'col-8';
            // Landscape Mode
            $definition['img_landscape'] = $imgUrl;
            $landscapesize = $tile['field_lobby_landscape_size'][0]['value'];
            if ($size != $landscapesize) {
                $overrideSize = ($landscapesize == 'small') ? 'col-4 small-override' : 'col-8 large-override';
                $definition['img_landscape'] = $this->asset->generateAssetUri(
                    $tile["field_lobby_thumbnail_$landscapesize"][0]['url'],
                    ['product' => self::PRODUCT]
                );
            }
            $definition['overridesize'] = isset($overrideSize) ? $overrideSize : '';
            $definition['title'] = $tile['title'][0]['value'] ?? '';
            $definition['game_provider'] = $tile['field_game_provider'][0]['field_game_provider_key'][0]['value'] ?? '';
            $definition['target'] = $tile['field_target'][0]['value'] ?? '';
            $definition['use_game_loader'] = isset($tile['field_use_game_loader'][0]['value'])
                ? $tile['field_use_game_loader'][0]['value'] : "false";
            $definition['tile_url'] = $tileUrl = $tile['field_lobby_tile_url'][0]['value'] ?? '';
            if ($tileUrl != '') {
                $tileUrl = '/' . $keyword . '/' .$tileUrl;
                $definition['tile_url'] = $this->url->generateUri($tileUrl, ['skip_parsers' => true]);
            }
            $definition['game_maintenance_text'] = null;
            $definition['game_maintenance'] = false;

            if ($this->checkIfMaintenance($tile)) {
                $definition['game_maintenance'] = true;
                $definition['game_maintenance_text'] = $tile['field_maintenance_blurb'][0]['value'];
            }

            return $definition;
        } catch (\Exception $e) {
            return [];
        }
    }

    public function maintenance($request, $response)
    {
        if (!$request) {
            return false;
        }
        try {
            $list = [];
            $providers = [];
            $games = $this->views->getViewById('lobby_tiles');
            foreach ($games as $game) {
                $maintenance = $this->getGameMaintenance($game);
                $list["maintenance"][] = $maintenance["maintenance"];
                $providers += $maintenance["game_providers"];
            }
            json_encode($providers, JSON_FORCE_OBJECT);
            $list["game_providers"] = $providers;
        } catch (\Exception $e) {
            $list = [];
        }
        return $this->rest->output($response, $list);
    }

    private function getGameMaintenance($game)
    {
        try {
            $definition['game_maintenance_text'] = null;
            $definition['game_maintenance'] = false;
            $provider = $game['field_game_provider'];
            $definition['game_provider'] = $provider[0]['field_game_provider_key'][0]['value'] ?? '';
            if ($this->checkIfMaintenance($game)) {
                $definition['game_maintenance'] = true;
                $definition['game_maintenance_text'] = $game['field_maintenance_blurb'][0]['value'];
            }
            $list['maintenance'] = $definition;
            $list['game_providers'][$definition["game_provider"]] =  [
                'maintenance' => $definition['game_maintenance'],
                'game_code' => $definition["game_provider"],
            ];
            return $list;
        } catch (\Exception $e) {
            return [];
        }
    }

    private function checkIfMaintenance($game)
    {
        $dateStart = $game['field_maintenance_start_date'][0]['value'] ?? null;
        $dateEnd = $game['field_maintenance_end_date'][0]['value'] ?? null;
        if (!$dateStart && !$dateEnd) {
            return false;
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

        return $this->checkDateStartEnd($dateStart, $dateEnd, $currentDate);
    }

    private function checkDateStartEnd($dateStart, $dateEnd, $currentDate)
    {
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
            if ($endDate->getTimestamp() >= $currentDate) {
                return true;
            }
        }

        return false;
    }
}
