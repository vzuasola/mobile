<?php

namespace App\MobileEntry\Module\GameIntegration\Skywind;

class SkywindModuleController
{
    private $rest;

    /**
     * @var App\Fetcher\Integration\PaymentAccountFetcher
     */
    private $voidbridge;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('rest'),
            $container->get('game_provider_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($rest, $voidbridge)
    {
        $this->rest = $rest;
        $this->voidbridge = $voidbridge;
    }

    /**
     * @{inheritdoc}
     */
    public function launch($request, $response)
    {
        $data['gameurl'] = false;
        $requestData = $request->getParsedBody();
        try {
            $responseData = $this->voidbridge->getGameUrlById('icore_sw', $requestData['gameCode'], [
                'options' => [
                    'languageCode' => $requestData['langCode'],
                    'playMode' => true
                ]
            ]);
            if ($responseData['url']) {
                $data['gameurl'] = $responseData['url'];
            }
        } catch (\Exception $e) {
            $data = [];
        }

        return $this->rest->output($response, $data);
    }
}
