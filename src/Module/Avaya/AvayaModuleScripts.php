<?php

namespace App\MobileEntry\Module\Avaya;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

use Firebase\JWT\JWT;

/**
 *
 */
class AvayaModuleScripts implements ComponentAttachmentInterface
{
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
            $container->get('player_session'),
            $container->get('config_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $configFetcher)
    {
        $this->playerSession = $playerSession;
        $this->configFetcher = $configFetcher;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
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

        return $data;
    }
}
