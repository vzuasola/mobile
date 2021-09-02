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
        return $data;
    }
}
