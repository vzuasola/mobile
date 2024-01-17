<?php

namespace App\MobileEntry\Module\GameIntegration\UGL;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class UGLModuleScripts implements ComponentAttachmentInterface
{
    private $playerSession;

    private $lang;

    private $player;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('lang'),
            $container->get('player')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $lang, $player)
    {
        $this->playerSession = $playerSession;
        $this->lang = $lang;
        $this->player = $player;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        $currency = null;
        $playerId = null;

        try {
            if ($this->playerSession->isLogin()) {
                $currency = $this->player->getCurrency();
                $playerId = $this->player->getPlayerID();
            }
        } catch (\Exception $e) {
            // Do nothing
        }

        return [
            'authenticated' => $this->playerSession->isLogin(),
            'username' => $this->playerSession->getUsername(),
            'token' => $this->playerSession->getToken(),
            'playerId' => $playerId,
            'currency' => $currency,
            'lang' => $this->lang ?? 'en'
        ];
    }
}
