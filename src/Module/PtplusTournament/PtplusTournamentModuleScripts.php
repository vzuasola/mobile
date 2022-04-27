<?php

namespace App\MobileEntry\Module\PtplusTournament;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class PtplusTournamentModuleScripts implements ComponentAttachmentInterface
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
        return [
            'authenticated' => $this->playerSession->isLogin(),
            'playerId' =>  $this->playerSession->getDetails()['playerId'] ?? '',
        ];
    }
}
