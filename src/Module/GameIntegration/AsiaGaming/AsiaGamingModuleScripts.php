<?php

namespace App\MobileEntry\Module\GameIntegration\AsiaGaming;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class AsiaGamingModuleScripts implements ComponentAttachmentInterface
{
    private $playerSession;

    const KEY = 'asia_gaming';

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
     * AsiaGamingModuleScripts public constructor.
     * @param $playerSession
     */
    public function __construct(
        $playerSession
    ) {
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
