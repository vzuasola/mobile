<?php

namespace App\MobileEntry\Module\GameIntegration\PGSoft;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;
use App\Fetcher\Drupal\ViewsFetcher;

class PGSoftModuleController
{
    use ProviderTrait;

    const KEY = 'pgsoft';
    const GEOIP_HEADER = 'x-custom-lb-geoip-country';
    const BET_TYPE = '1';

    private $rest;

    private $pgSoft;

    private $config;

    private $player;

    /**
     * @var ViewsFetcher $viewsFetcher
     */
    private $viewsFetcher;

    /**
     * @var PlayerGameFetcher $playerGameFetcher
     */
    private $playerGameFetcher;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('rest'),
            $container->get('game_provider_fetcher'),
            $container->get('config_fetcher'),
            $container->get('player'),
            $container->get('views_fetcher'),
            $container->get('player_game_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct(
        $rest,
        $pgSoft,
        $config,
        $player,
        $viewsFetcher,
        $playerGameFetcher
    ) {
        $this->rest = $rest;
        $this->pgSoft = $pgSoft;
        $this->config = $config->withProduct('mobile-games');
        $this->player = $player;
        $this->viewsFetcher = $viewsFetcher->withProduct('mobile-games');
        $this->playerGameFetcher = $playerGameFetcher;
    }

    /**
     * Get game URL via GetGeneralLobby
     */
    private function getGameUrl($request, $requestData)
    {
        $data['currency'] = true;
        $data['gameurl'] = false;
        try {
            $responseData = $this->pgSoft->getGameUrlById('icore_pgs', $requestData['gameCode'], [
                'options' => [
                    'languageCode' => $this->languageCode($request),
                    'htmlParam' => ($requestData['launcherType'] === 'html') ? 'true' : 'false',
                ]
            ]);
            if ($responseData['url']) {
                $data['gameurl'] = $this->overrideGameUrl($request, $responseData['url']);
            }
        } catch (\Exception $e) {
            $data['currency'] = true;
            $data['gameurl'] = false;
        }

        return $data;
    }

    /**
     * Override ProviderTrait to PGSoft Property BetType
     */
    public function getPlayerGameExtraParams($requestData)
    {
        $params[] = [
            'Key' => 'BetType',
            'Value' => self::BET_TYPE,
        ];

        $params[] = [
            'Key' => 'GetLaunchURLHTML',
            'Value' => ($requestData['launcherType'] === 'html') ? 'true' : 'false',
        ];

        return $params;
    }

    /**
     * Override ProviderTrait to apply PGSoft GameUrl override
     */
    protected function postProcessGameUrlData($request, $data)
    {
        if (isset($data['gameurl']) && $data['gameurl'] && $data['type'] === 'redirect') {
            $data['gameurl'] = $this->overrideGameUrl($request, $data["gameurl"]);
        }

        return $data;
    }

    /**
     * Override GameURL based on GEOIP
     */
    private function overrideGameUrl($request, $baseUrl)
    {
        try {
            // Get domain override config
            $config = $this->config->getConfig('webcomposer_config.icore_games_integration');
            $configGeoIp = $this->explodeList($config[self::KEY . '_geoip_domain_override'] ?? '');
            // Get GEOIP
            $geoip = $request->getHeaderLine(self::GEOIP_HEADER);

            if (isset($configGeoIp[$geoip]) && $overrideDomain = parse_url($configGeoIp[$geoip][1])) {
                $parsedUrl = parse_url($baseUrl);
                $parsedUrl['host'] = $overrideDomain['host'];

                if (isset($configGeoIp[$geoip][2])) {
                    parse_str($parsedUrl['query'], $query);
                    $query['server_url'] = $configGeoIp[$geoip][2];

                    $parsedUrl['query'] = urldecode(http_build_query($query));
                }

                $newUrl = http_build_url($parsedUrl);

                return (false === $newUrl) ? $baseUrl : $newUrl;
            }
        } catch (\Exception $e) {
            // Do nothing
        }

        // If eveything fails, return the original game URL
        return $baseUrl;
    }

    private function explodeList($config)
    {
        $nconfig = [];

        if (!empty($config)) {
            $rows = explode(PHP_EOL, $config);
            foreach ($rows as $rows) {
                $map = explode('|', trim($rows));
                $nconfig[$map[0]] = $map;
            }
        }

        return $nconfig;
    }
}
