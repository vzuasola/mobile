<?php

namespace App\MobileEntry\Component\GameIFrame;
use App\Plugins\ComponentWidget\ComponentAttachmentInterface;
/**
 *
 */
class GameIFrameComponentScripts implements ComponentAttachmentInterface
{
    /**
     * @var App\Player\PlayerSession
     */
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
            'isLogin' => $this->playerSession->isLogin(),
        ];
    }
}
