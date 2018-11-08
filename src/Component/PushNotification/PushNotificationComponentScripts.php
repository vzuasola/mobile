<?php

namespace App\MobileEntry\Component\PushNotification;

use App\Utils\IP;
use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class PushNotificationComponentScripts implements ComponentAttachmentInterface
{
    const REGLANG = [
        'en-US' => 'en',
        'en-GB' => 'eu',
        'zh-TW' => 'sc',
        'zh-CN' => 'ch',
        'th' => 'th',
        'vi' => 'vn',
        'id' => 'id',
        'ja' => 'jp',
        'ko-KR' => 'kr',
        'hi' => 'in',
        'ru' => 'en',
        'el' => 'gr',
        'pl' => 'pl',
        'af' => 'en'
    ];

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
        $regLang = self::REGLANG;
        $language = $regLang['en-US'];

        if ($this->playerSession->isLogin()) {
            $locale = (string) $this->playerLocale->getLocale();

            if (!empty($regLang) && $locale) {
                $language = $regLang[$locale];
            }
        }

        return $language;
    }
}
