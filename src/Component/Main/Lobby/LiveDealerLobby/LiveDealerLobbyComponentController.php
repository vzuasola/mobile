<?php

namespace App\MobileEntry\Component\Main\Lobby\LiveDealerLobby;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use App\MobileEntry\Services\PublishingOptions\PublishingOptions;

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
        $playerDetails = $this->playerSession->getDetails();
        $playerCurrency = $playerDetails['currency'] ?? '';
        $item = $this->cacher->getItem('views.live-dealer-lobby-data.'
            . $this->currentLanguage
            . "-". $previewKey
            . "-" . $playerCurrency);

        if (!$item->isHit()) {
            $data = $this->getGamesList($isPreview);
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
    private function getGamesList($isPreview)
    {
        try {
            $gamesList = [];
            $games = $this->views->getViewById('games_list');
            foreach ($games as $game) {
                $publishOn = $game['publish_on'][0]['value'] ?? '';
                $unpublishOn = $game['unpublish_on'][0]['value'] ?? '';
                $status = (!$publishOn && !$unpublishOn) ? $game['status'][0]['value'] : true;
                if (PublishingOptions::checkDuration($publishOn, $unpublishOn) && $status) {
                    $preview_mode = $game['field_preview_mode'][0]['value'] ?? 0;
                    if (!$this->checkSupportedCurrency($game)) {
                        continue;
                    }
                    if (!$isPreview && $preview_mode) {
                        continue;
                    }
                    $gamesList[] = $this->getGameDefinition($game);
                }
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
            $definition['target'] = $game['field_target'][0]['value'] ?? "popup";
            $definition['preview_mode'] = $game['field_preview_mode'][0]['value'] ?? 0;
            $definition['use_game_loader'] = (isset($game['field_use_game_loader'][0]['value'])
                && $game['field_use_game_loader'][0]['value']) ? "true" : "false";
            $definition['sort_weight'] = $game['field_lobby_tab'][0]['field_draggable_views']['lobby_tab']['weight']
                ?? 0;

            return $definition;
        } catch (\Exception $e) {
            return [];
        }
    }

    public function maintenance($request, $response)
    {
        try {
            $data = [];
            $providers = $this->views->withProduct('mobile-live-dealer')->getViewById('game_providers');
            $data['game_providers'] = $this->processProviders($providers);
        } catch (\Exception $e) {
            $data = [];
        }
        return $this->rest->output($response, $data);
    }

    private function processProviders($providers)
    {
        try {
            $providersList = [];
            foreach ($providers as $provider) {
                $providerData = [];
                $providerData['game_code'] = $provider['field_game_provider_key'][0]['value'];
                $providerData['maintenance'] = $provider['field_game_provider_maintenance'][0]['value'] ?? false;

                if (!$providerData['maintenance']) {
                    $providerData['maintenance'] = $this->checkIfMaintenance(
                        $provider['field_game_provider_start_date'][0]['value'] ?? [],
                        $provider['field_game_provider_end_date'][0]['value'] ?? []
                    );
                }
                $providersList[$provider['field_game_provider_key'][0]['value']] = $providerData;
            }
        } catch (\Throwable $th) {
            $providersList = [];
        }
        return $providersList;
    }

    private function checkSupportedCurrency($game)
    {
        $playerDetails = $this->playerSession->getDetails();
        $playerCurrency = $playerDetails['currency'] ?? '';
        $provider = $game['field_game_provider'][0]['value'] ?? '';
        switch ($provider) {
            case 'gpi':
                $config =  $this->configs
                    ->withProduct(self::PRODUCT)
                    ->getConfig('webcomposer_config.games_gpi_provider');
                $currencies = explode("\r\n", ($config['gpi_live_dealer_currency'] ?? ''));
                break;
            case 'pas':
                $config =  $this->configs
                    ->withProduct(self::PRODUCT)
                    ->getConfig('webcomposer_config.icore_playtech_provider');
                $currencies = explode("\r\n", ($config['dafabetgames_currency'] ?? ''));
                break;
            default:
                $providerConfig =  $this->configs
                    ->withProduct(self::PRODUCT)
                    ->getConfig('webcomposer_config.icore_games_integration');
                $currencies = explode("\r\n", ($providerConfig[$provider . '_currency'] ?? ''));
                break;
        }

        if ($playerDetails &&
            !in_array($playerCurrency, $currencies)) {
            return false;
        }

        return true;
    }

    private function checkIfMaintenance($dateStart, $dateEnd)
    {
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
