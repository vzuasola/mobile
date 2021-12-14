<?php

namespace App\MobileEntry\Module\WebRtc;

use Firebase\JWT\JWT;

class WebRtcModuleController
{
    private $rest;

    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;

    private $configFetcher;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('rest'),
            $container->get('player_session'),
            $container->get('config_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($rest, $playerSession, $configFetcher)
    {
        $this->rest = $rest;
        $this->playerSession = $playerSession;
        $this->configFetcher = $configFetcher;
    }

    /**
     * @{inheritdoc}
     */
    public function jwt($request, $response)
    {
        $data = [];
        try {
            $isLogin = $this->playerSession->isLogin();
        } catch (\Exception $e) {
            $isLogin = false;
        }

        try {
            $webRtc = $this->configFetcher->getConfig('webcomposer_config.avaya_configuration');
            if ($isLogin) {
                $playerInfo = $this->playerSession->getDetails();

                $validityTime = $webRtc['validity_time'] ?? 1200;
                $userInfo = [
                    'username' => $playerInfo['username'],
                    'email' => $playerInfo['email'],
                    'level' => 'Reg',
                    'exp' => strtotime("+" . $validityTime . " seconds")
                ];

                $data['validity_time'] = $userInfo['exp'];
                $jwt = JWT::encode(
                    $userInfo,
                    $webRtc['jwt_key'] ?? '',
                    'HS256',
                    null,
                    null
                );
            }
            $data['baseUrl'] = $webRtc['base_url'] ?? '';
            $data['jwt'] = $jwt ?? false;
        } catch (\Exception $e) {
            $data = [];
        }

        return $this->rest->output($response, $data);
    }
}
