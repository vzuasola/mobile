<?php

namespace App\MobileEntry\Module\GameIntegration\RubyPlay;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;

use App\Drupal\Config;

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
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('rest'),
            $container->get('game_provider_fetcher'),
            $container->get('config_fetcher'),
            $container->get('player')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($rest, $rubyPlay, $config, $player)
    {
        $this->rest = $rest;
        $this->rubyPlay = $rubyPlay;
        $this->config = $config->withProduct('mobile-games');
        $this->player = $player;
    }

    /**
     * @{inheritdoc}
     */
    public function launch($request, $response)
    {
        $data['gameurl'] = false;
        $data['currency'] = false;
        if ($this->checkCurrency($request)) {
            $data['currency'] = true;
            $requestData = $request->getParsedBody();
            $params = explode('|', $requestData['gameCode']);

            try {
                $responseData = $this->rubyPlay->getGameUrlById('icore_rp', $params[0], [
                    'options' => [
                        'languageCode' => $requestData['langCode'],
                        'providerProduct' => $params[1] ?? null,
                    ]
                ]);
                if ($responseData['url']) {
                    $url = $this->overrideGameUrl($request, $responseData['url']);
                    $data['gameurl'] = $url ?? $responseData['url'];
                }
            } catch (\Exception $e) {
                $data = [];
            }
        }

        return $this->rest->output($response, $data);
    }

    /**
     *
     */
    private function overrideGameUrl($request, $baseUrl)
    {
        try {
            // Get domain override config
            $config = $this->config->getConfig('webcomposer_config.icore_games_integration');
            $configGeoIp = Config::parse($config[self::KEY . '_geoip_domain_override'] ?? '');
            // Get GEOIP
            $geoip = $request->getHeaderLine(self::GEOIP_HEADER);

            if (isset($configGeoIp[$geoip]) && $overrideDomain = parse_url($configGeoIp[$geoip])) {
                $parsedUrl = parse_url($baseUrl);
                $parsedUrl['host'] = $overrideDomain['host'];
                $newUrl = http_build_url($parsedUrl);

                return (false === $newUrl) ? $baseUrl : $newUrl;
            }
        } catch (\Exception $e) {
            // Do nothing
        }

        // If eveything fails, return the original game URL
        return $baseUrl;
    }
}
