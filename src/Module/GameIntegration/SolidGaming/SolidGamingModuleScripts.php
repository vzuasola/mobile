<?php

namespace App\MobileEntry\Module\GameIntegration\SolidGaming;

use App\Drupal\Config;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class SolidGamingModuleScripts implements ComponentAttachmentInterface
{
    private $playerSession;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession)
    {
        $this->playerSession = $playerSession;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        try {
            $data = [
                'authenticated' => $this->playerSession->isLogin()
            ];
        } catch (\Exception $e) {
            $data = [];
        }

        return $data;
    }
}
