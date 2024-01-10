<?php

namespace App\MobileEntry\Module\GameIntegration\UGL;

use App\Drupal\Config;
use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class UGLModuleScripts implements ComponentAttachmentInterface
{
    private $playerSession;

    private $config;

    private $lang;

    private $player;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('config_fetcher'),
            $container->get('lang'),
            $container->get('player')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $config, $lang, $player)
    {
        $this->playerSession = $playerSession;
        $this->config = $config;
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
            $ptConfig = $this->config->getConfig('webcomposer_config.games_playtech_provider');

            if ($this->playerSession->isLogin()) {
                $currency = $this->player->getCurrency();
                $playerId = $this->player->getPlayerID();
            }
        } catch (\Exception $e) {
            $ptConfig = [];
        }

        return [
            'authenticated' => $this->playerSession->isLogin(),
            'username' => $this->playerSession->getUsername(),
            'token' => $this->playerSession->getToken(),
            'playerId' => $playerId,
            'currency' => $currency,
            'lang' => $this->lang ?? 'en',
            'langguageMap' => Config::parse($ptConfig['languages']),
        ];
    }
}
