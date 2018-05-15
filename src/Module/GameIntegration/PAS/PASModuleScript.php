<?php

namespace App\MobileEntry\Module\GameIntegration\PAS;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class PASModuleScripts implements ComponentAttachmentInterface
{
    private $playerSession;

    private $loginConfig;

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
    public function __construct($playerSession, $loginConfig)
    {
        $this->playerSession = $playerSession;
        $this->loginConfig = $loginConfig;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        return [];
    }
}
