<?php

namespace App\MobileEntry\Component\Main\Lobby\LiveDealerLobby;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use App\MobileEntry\Services\PublishingOptions\PublishingOptions;
use App\MobileEntry\Component\Main\Lobby\GamesListVersionTrait;

class LiveDealerLobbyComponentController
{
    use GamesListVersionTrait;

    const TIMEOUT = 1800;
    const PRODUCT = 'mobile-live-dealer';

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
        $this->gamesListVersion = $this->getGamesListVersion();
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
        $this->pager = $params['page'] ?? null;
        $item = $this->cacher->getItem('views.live-dealer-lobby-data.'
            . $this->currentLanguage
            . "-". $previewKey
            . "-" . $playerCurrency
            . "-" . $this->pager);

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
            $gamesListV = $this->gamesListVersion ? 'games_list_v2' : 'games_list';
            $games = $this->views->getViewById(
                $gamesListV,
                [
                    'page' => (string) $this->pager
                ]
            );
            foreach ($games as $game) {
                $publishOn = $this->getFieldValue($game, 'publish_on');
                $unpublishOn = $this->getFieldValue($game, 'unpublishOn');
                $published = $this->getFieldValue($game, 'published');
                $status = $this->getFieldValue($game, 'status');
                if (!is_bool($status)) {
                    $status = $status === 'true';
                }

                if (PublishingOptions::checkDuration($publishOn, $unpublishOn) && $status) {
                    $preview_mode = $this->getFieldValue($game, 'field_preview_mode');
                    if (!$this->checkSupportedCurrency($game)) {
                        continue;
                    }
                    if (!$isPreview && ($preview_mode === 'true' || $preview_mode === true)) {
                        continue;
                    }
                    $gamesList[] = $this->gamesListVersion
                        ? $this->getGameDefinitionV2($game) : $this->getGameDefinitionV1($game);
                }
            }
        } catch (\Exception $e) {
            $gamesList = [];
        }
        return $gamesList;
    }

    /**
     * Get fields value by game version
     */
    private function getFieldValue($game, $key)
    {
        try {
            $value = $this->gamesListVersion ? $game[$key] : $game[$key][0]['value'];
        } catch (\Exception $e) {
            return '';
        }

        return $value;
    }

    /**
     * Get Subprovider currencies
     */
    private function subProviderCurrency($game)
    {
        try {
            $subprovider = isset($game['field_games_subprovider_export'])
                ? $game['field_games_subprovider_export'] : $game['field_games_subprovider'][0];
            $subProviderSupportedCurrency = isset($subprovider['supported_currencies'])
                ? $subprovider['supported_currencies'] : $subprovider['field_supported_currencies'][0]['value'];
            $subProviderCurrency = (isset($subProviderSupportedCurrency))
                ? preg_split("/\r\n|\n|\r/", $subProviderSupportedCurrency)
                : [];
        } catch (\Exception $e) {
            return [];
        }

        return $subProviderCurrency;
    }

    /**
     * Process games list array
     */
    private function getGameDefinitionV2($game)
    {
        try {
            $subprovider = $game['field_games_subprovider_export'] ?? null;
            $definition = [];
            if (isset($game['field_game_ribbon_export'])) {
                $ribbon = $game['field_game_ribbon_export'] ?? [];
                $definition['ribbon']['background'] = $ribbon['ribbon_background_color'] ?? null;
                $definition['ribbon']['color'] = $ribbon['ribbon_text_color'] ?? null;
                $definition['ribbon']['name'] = $ribbon['label'] ?? null;
            }

            $definition['provider_image'] = [
                'alt' => $game['field_provider_logo_export']['alt'],
                'url' =>
                    $this->asset->generateAssetUri(
                        $game['field_provider_logo_export']['url'],
                        ['product' => self::PRODUCT]
                    )
            ];

            $definition['image'] = [
                'alt' => $game['field_thumbnail_image_export']['alt'],
                'url' =>
                    $this->asset->generateAssetUri(
                        $game['field_thumbnail_image_export']['url'],
                        ['product' => self::PRODUCT]
                    )
            ];
            $useGameLobby = "true";
            if (isset($game['field_game_lobby'][0])) {
                $useGameLobby = $game['field_game_lobby'] ? "true" : "false";
            }
            $fieldLobbyTab = strtolower($game['field_lobby_tab']);
            $definition['title'] = $game['publish_on'] ?? "";
            $definition['title'] = $game['title'] ?? "";
            $definition['game_code'] = $game['field_game_code'] ?? "";
            $definition['table_id'] = $game['field_table_id'] ?? "";
            $definition['game_provider'] = $game['field_game_provider'] ?? "";
            $definition['game_subprovider'] = $subprovider['name'] ?? "";
            $definition['game_platform'] = $game['field_game_platform'] ?? "";
            $definition['lobby_tab'] = $fieldLobbyTab ?? "";
            $definition['target'] = $game['field_target'] ?? "popup";
            $definition['preview_mode'] = $game['field_preview_mode'] === 'true';
            $definition['use_game_loader'] = (isset($game['field_use_game_loader'])
                && $game['field_use_game_loader']) ? "true" : "false";
            $definition['use_game_lobby'] = $useGameLobby;
            $definition['sort_weight'] = $game['field_lobby_tab_export'][0]['draggable']['weight'] ?? 0;

            return $definition;
        } catch (\Exception $e) {
            return [];
        }
    }

    public function maintenance($request, $response)
    {
        try {
            $data = [];
            $providers = $this->views->withProduct(self::PRODUCT)->getViewById('game_providers');
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
        if (!$playerDetails) {
            return true; // Display the game, nothing to compare here
        }
        $playerCurrency = $playerDetails['currency'] ?? '';
        $provider = $this->getFieldValue($game, 'field_game_provider');
        $subProviderCurrency = $this->subProviderCurrency($game);

        switch ($provider) {
            case 'gpi':
                $config = $this->configs
                  ->withProduct(self::PRODUCT)
                  ->getConfig('webcomposer_config.games_gpi_provider');
                $currencies = explode("\r\n", ($config['gpi_live_dealer_currency'] ?? ''));
                break;
            case 'opus':
                $config = $this->configs
                    ->withProduct(self::PRODUCT)
                    ->getConfig('webcomposer_config.games_opus_provider');
                $currencies = explode("\r\n", ($config['currency'] ?? ''));
                break;
            case 'pas':
                $config = $this->configs
                  ->withProduct(self::PRODUCT)
                  ->getConfig('webcomposer_config.icore_playtech_provider');
                $currencies = explode("\r\n", ($config['dafabetgames_currency'] ?? ''));
                break;
            default:
                $providerConfig = $this->configs
                  ->withProduct(self::PRODUCT)
                  ->getConfig('webcomposer_config.icore_games_integration');
                $currencies = explode("\r\n", ($providerConfig[$provider . '_currency'] ?? ''));
                break;
        }
        // If the game has a subprovider currency restriction, verify if the user met the restriction
        if (count($subProviderCurrency)) {
            return in_array($playerCurrency, $subProviderCurrency);
        } else { // else verify if the player met the provider currency restriction of provider
            return in_array($playerCurrency, $currencies);
        }
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

    /**
     * Process games list array V1
     */
    private function getGameDefinitionV1($game)
    {
        try {
            $subprovider = $game['field_games_subprovider'][0] ?? [];
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
            $useGameLobby = "true";
            if (isset($game['field_game_lobby'][0])) {
                $useGameLobby = $game['field_game_lobby'][0]['value'] ? "true" : "false";
            }

            $definition['title'] = $game['title'][0]['value'] ?? "";
            $definition['game_code'] = $game['field_game_code'][0]['value'] ?? "";
            $definition['game_provider'] = $game['field_game_provider'][0]['value'] ?? "";
            $definition['table_id'] = $game['field_table_id'][0]['value'] ?? "";
            $definition['game_subprovider'] = $subprovider['name'][0]['value'] ?? "";
            $definition['game_platform'] = $game['field_game_platform'][0]['value'] ?? "";
            $definition['lobby_tab'] = $game['field_lobby_tab'][0]['field_alias'][0]['value'] ?? "";
            $definition['target'] = $game['field_target'][0]['value'] ?? "popup";
            $definition['preview_mode'] = $game['field_preview_mode'][0]['value'] ?? 0;
            $definition['use_game_loader'] = (isset($game['field_use_game_loader'][0]['value'])
                && $game['field_use_game_loader'][0]['value']) ? "true" : "false";
            $definition['use_game_lobby'] = $useGameLobby;
            $definition['sort_weight'] = $game['field_lobby_tab'][0]['field_draggable_views']['lobby_tab']['weight']
                ?? 0;

            return $definition;
        } catch (\Exception $e) {
            return [];
        }
    }
}
