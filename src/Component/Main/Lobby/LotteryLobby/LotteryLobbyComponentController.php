<?php

namespace App\MobileEntry\Component\Main\Lobby\LotteryLobby;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class LotteryLobbyComponentController
{
    const PRODUCT = 'mobile-lottery';
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
            $definition['size'] = $size == 'small' ? 'small-image' : 'large-image';
            $imgUrl = $this->asset->generateAssetUri(
                $game["field_game_thumbnail_$size"][0]['url'],
                ['product' => self::PRODUCT]
            );
            $definition['img_landscape'] = $imgUrl;
            $landscapesize = $game['field_game_landscape_size'][0]['value'];
            $overrideAlt = $size;
            if ($size != $landscapesize) {
                $overrideSize = ($landscapesize == 'small') ? 'small-override' : 'large-override';
                $overrideAlt = ($landscapesize == 'small') ? 'small' : 'large';
                $definition['img_landscape'] = $this->asset->generateAssetUri(
                    $game["field_game_thumbnail_$landscapesize"][0]['url'],
                    ['product' => self::PRODUCT]
                );
            }
            $definition['overridesize'] = isset($overrideSize) ? $overrideSize : '';
            $definition['title'] = $game['title'][0]['value'] ?? '';
            $definition['image'] = [
                'alt' => $game["field_game_thumbnail_$overrideAlt"][0]['alt'],
                'url' => $imgUrl
            ];
            $definition['game_provider'] = $game['field_game_provider'][0]['field_game_provider_key'][0]['value'] ?? '';
            $definition['target'] = $game['field_target'][0]['value'] ?? '';
            $definition['use_game_loader'] = isset($game['field_use_game_loader'][0]['value'])
                ? $game['field_use_game_loader'][0]['value'] : "false";
            $definition['game_maintenance_text'] = null;
            $definition['game_maintenance'] = false;

            if ($this->checkIfMaintenance($game)) {
                $definition['game_maintenance'] = true;
                $definition['game_maintenance_text'] = $game['field_maintenance_blurb'][0]['value'];
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
            $maintenance = [];
            $games = $this->views->getViewById('games_list');
            foreach ($games as $game) {
                $maintenance[] = $this->getGameMaintenance($game);
            }
        } catch (\Exception $e) {
            $maintenance = [];
        }

        return $this->rest->output($response, $maintenance);
    }

    private function getGameMaintenance($game)
    {
        try {
            $definition['game_maintenance_text'] = null;
            $definition['game_maintenance'] = false;

            if ($this->checkIfMaintenance($game)) {
                $definition['game_maintenance'] = true;
                $definition['game_maintenance_text'] = $game['field_maintenance_blurb'][0]['value'];
            }

            return $definition;
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
