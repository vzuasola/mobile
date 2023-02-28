<?php

namespace App\MobileEntry\Module\WebRtc;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class WebRtcModuleScripts implements ComponentAttachmentInterface
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
            $webRtc = $this->configFetcher->getConfig('webcomposer_config.avaya_configuration');

            if ($isLogin) {
                $validityTime = $webRtc['validity_time'] ?? 1200;
            }

            $data['baseUrl'] =  $webRtc['base_url'] ?? '';
            $data['urlPost'] = $webRtc['url_post'] ?? '';
            $data['webrtcUrl'] = $webRtc['web_rtc_url'] ?? '';
            $data['postTimeout'] = $webRtc['url_post_timout'] ?? '';
            $data['jwtKey'] = false;
            $data['validity'] = $validityTime ?? $webRtc['validity_time'];
        } catch (\Exception $e) {
            $data = [];
        }

        return $data;
    }
}
