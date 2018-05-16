<?php

namespace App\MobileEntry\Component\CasinoOption;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class CasinoOptionComponentScripts implements ComponentAttachmentInterface
{
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
        return [
            'authenticated' => $this->playerSession->isLogin(),
        ];
    }
}
