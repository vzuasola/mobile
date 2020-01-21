<?php

namespace App\MobileEntry\Module\GameIntegration\Lottoland;

use App\MobileEntry\Module\GameIntegration\ProviderTrait;
use App\Utils\Host;

class LottolandModuleController
{
    use ProviderTrait;

    const KEY = 'lottoland';

    private $rest;

    private $lottland;

    private $config;

    private $player;

    private $lang;

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
            $container->get('lang')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($rest, $lottland, $config, $player, $lang)
    {
        $this->rest = $rest;
        $this->lottland = $lottland;
        $this->config = $config->withProduct('mobile-lottery');
        $this->player = $player;
        $this->lang = $lang;
    }

    /**
     * @{inheritdoc}
     */
    public function launch($request, $response)
    {
        $data['gameurl'] = false;
        $data['currency'] = false;

        if ($this->checkCurrency($request)) {
            $data = $this->getGameUrl($request);
        }

        return $this->rest->output($response, $data);
    }

    private function getGameUrl($request)
    {
        $data['currency'] = true;
        $requestData = $request->getParsedBody();

        try {
            $responseData = $this->lottland->getLobby('icore_lottoland', [
                'options' => [
                    'languageCode' => $requestData['langCode'],
                ]
            ]);

            if ($responseData) {
                $parsedUrl = parse_url($responseData);
                $hostname = Host::getDomain();
                $parsedUrl['host'] = 'm.' . $hostname . '/' . $this->lang .
                '/keno/launch/lottoland';

                $newUrl = http_build_url($parsedUrl);
                $data['gameurl'] = $newUrl;
            }
        } catch (\Exception $e) {
            $data['currency'] = true;
        }

        return $data;
    }
}
