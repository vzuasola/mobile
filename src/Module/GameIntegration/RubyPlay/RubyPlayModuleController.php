<?php

namespace App\MobileEntry\Module\GameIntegration\RubyPlay;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;

use App\Drupal\Config;
use App\Fetcher\Drupal\ViewsFetcher;

class RubyPlayModuleController
{
    use ProviderTrait;

    const KEY = 'ruby_play';

    /**
     * Header name of geoip
     */
    const GEOIP_HEADER = 'x-custom-lb-geoip-country';

    private $rest;

    private $rubyPlay;

    private $config;

    private $player;

    /**
     * @var ViewsFetcher $viewsFetcher
     */
    private $viewsFetcher;

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
        $rubyPlay,
        $config,
        $player,
        $viewsFetcher,
        $playerGameFetcher
    ) {
        $this->rest = $rest;
        $this->rubyPlay = $rubyPlay;
        $this->config = $config->withProduct('mobile-games');
        $this->player = $player;
        $this->viewsFetcher = $viewsFetcher->withProduct('mobile-games');
        $this->playerGameFetcher = $playerGameFetcher;
    }

    /**
     * Get GameURL via GetGeneralLobby
     */
    public function getGameUrl($request, $requestData)
    {
        $data['gameurl'] = false;
        $data['currency'] = true;
        $params = explode('|', $requestData['gameCode']);

        try {
            $responseData = $this->rubyPlay->getGameUrlById('icore_rp', $params[0], [
                'options' => [
                    'languageCode' => $this->languageCode($request),
                    'providerProduct' => $params[1] ?? null,
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
     * Override ProviderTrait to apply PGSoft GameUrl override
     */
    protected function postProcessGameUrlData($request, $data)
    {
        if (isset($data['gameurl']) && $data['gameurl']) {
            $data['gameurl'] = $this->overrideGameUrl($request, $data["gameurl"]);
        }

        return $data;
    }

    /**
     * Overrides gameUrl depending on configured gameURL per GEOIP
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
