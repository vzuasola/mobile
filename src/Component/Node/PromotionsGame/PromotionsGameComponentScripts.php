<?php

namespace App\MobileEntry\Component\Node\PromotionsGame;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class PromotionsGameComponentScripts implements ComponentAttachmentInterface
{
    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $config;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('config_fetcher'),
            $container->get('player_session')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($config, $playerSession)
    {
        $this->config = $config;
        $this->playerSession = $playerSession;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        $data = [];

        try {
            $promoConfigs = $this->config->getConfig('mobile_promotions.promotions_configuration');
        } catch (\Exception $e) {
            $promoConfigs = [];
        }

        $data['countdown'] = $promoConfigs['countdown_format'] ?? "[days] days, [hours] remaining";
        $data['authenticated'] = $this->playerSession->isLogin();
        return $data;
    }
}
