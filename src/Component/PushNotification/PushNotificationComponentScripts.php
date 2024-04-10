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
        'en-us' => 'en',
        'en-gb' => 'eu',
        'zh-tw' => 'sc',
        'zh-cn' => 'ch',
        'th' => 'th',
        'vi' => 'vn',
        'id' => 'id',
        'ja' => 'jp',
        'ko-kr' => 'kr',
        'en-in' => 'in',
        'te' => 'te',
        'hi' => 'hi',
        'ru' => 'en',
        'el' => 'gr',
        'pl' => 'pl',
        'af' => 'en',
        'bn' => 'bn',
        'pk' => 'pk',
        'es' => 'es',
        'pt-br' => 'pt'
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
        $language = $regLang['en-us'];

        if ($this->playerSession->isLogin()) {
            $locale = (string) $this->playerLocale->getLocale();

            if (!empty($regLang) && $locale) {
                $language = $regLang[strtolower($locale)];
            }
        }

        return $language;
    }
}
