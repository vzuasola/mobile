<?php

namespace App\MobileEntry\Module\GameIntegration\Voidbridge;

class VoidbridgeModuleController
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
        $languageCode = $request->getParam('languageCode');
        try {
            $responseData = $this->voidbridge->getGameUrlById('icore_vb', $args['gameid'], [
                'options' => [
                    'languageCode' => $languageCode
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
