<?php

namespace App\MobileEntry\Component\PushNotification;

use App\Utils\IP;
use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class PushNotificationComponentScripts implements ComponentAttachmentInterface
{

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('player'),
            $container->get('configuration_manager')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $player, $configManager)
    {
        $this->playerSession = $playerSession;
        $this->playerLocale = $player;
        $this->configManager = $configManager;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        return [
            'authenticated' => $this->playerSession->isLogin(),
            'regLang' => $this->getPlayerLanguage()
        ];
    }

    private function getPlayerLanguage()
    {
        $values = $this->configManager->getConfiguration('player-language');
        $language = reset($values['player-language']);

        if ($this->playerSession->isLogin()) {
            $regLang = (string) $this->playerLocale->getLocale();

            if (!empty($values['player-language']) && $regLang) {
                $language = $values['player-language'][$regLang];
            }
        }

        return $language;
    }
}
