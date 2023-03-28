<?php

namespace App\MobileEntry\Module\Avaya;

use Firebase\JWT\JWT;

class AvayaModuleController
{
    private $rest;

    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;

    private $configFetcher;

    private $userFetcher;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('rest'),
            $container->get('player_session'),
            $container->get('config_fetcher'),
            $container->get('user_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($rest, $playerSession, $configFetcher, $userFetcher)
    {
        $this->rest = $rest;
        $this->playerSession = $playerSession;
        $this->configFetcher = $configFetcher;
        $this->userFetcher = $userFetcher;
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
            if ($isLogin) {
                $playerDetails = $this->userFetcher->getPlayerDetails();
                $data['vipLevel'] = $playerDetails['vipLevel'] ?? 0;
            }
        } catch (\Exception $e) {
            $data['vipLevel'] = 0;
        }

        try {
            $avaya = $this->configFetcher->getConfig('webcomposer_config.avaya_configuration');
            if ($isLogin) {
                $playerInfo = $this->playerSession->getDetails();

                $validityTime = $avaya['validity_time'] ?? 1200;
                $userInfo = [
                    'username' => $playerInfo['username'],
                    'email' => $playerInfo['email'],
                    'level' => 'Reg',
                    'exp' => strtotime("+" . $validityTime . " seconds")
                ];

                $data['validity_time'] = $userInfo['exp'];
                $jwt = JWT::encode(
                    $userInfo,
                    $avaya['jwt_key'] ?? '',
                    'HS256',
                    null,
                    null
                );
            }
            $data['baseUrl'] = $avaya['base_url'] ?? '';
            $data['jwt'] = $jwt ?? false;
        } catch (\Exception $e) {
            $data = [];
        }

        return $this->rest->output($response, $data);
    }

    public function avayaconfig($request, $response)
    {
        $data = [];
        try {
            $isLogin = $this->playerSession->isLogin();
        } catch (\Exception $e) {
            $isLogin = false;
        }

        try {
            $avaya = $this->configFetcher->getConfig('webcomposer_config.avaya_configuration');

            if ($isLogin) {
                $validityTime = $avaya['validity_time'] ?? 1200;
            }

            $data['baseUrl'] = $avaya['base_url'] ?? '';
            $data['urlPost'] = $avaya['url_post'] ?? '';
            $data['postTimeout'] = $avaya['url_post_timout'] ?? '';
            $data['jwtKey'] = false;
            $data['validity'] = $validityTime ?? $avaya['validity_time'];
        } catch (\Exception $e) {
            $data = [];
        }
        return $this->rest->output($response, $data);
    }
}
