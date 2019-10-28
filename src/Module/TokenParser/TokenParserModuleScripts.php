<?php

namespace App\MobileEntry\Module\TokenParser;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class TokenParserModuleScripts implements ComponentAttachmentInterface
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
        $data = [];

        try {
            $data['authenticated'] = $this->playerSession->isLogin();
        } catch (\Exception $e) {
            $data['authenticated'] = false;
        }

        try {
            $data['token'] = md5($this->playerSession->getToken());
        } catch (\Exception $e) {
            $data['token'] = false;
        }

        return $data;
    }
}
