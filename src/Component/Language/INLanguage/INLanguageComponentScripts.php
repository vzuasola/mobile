<?php

namespace App\MobileEntry\Component\Language\INLanguage;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class INLanguageComponentScripts implements ComponentAttachmentInterface
{
    private $currentLanguage;

    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;

    private $ip;

    private $preference;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('lang'),
            $container->get('player_session'),
            $container->get('preferences_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($currentLanguage, $playerSession, $preference)
    {
        $this->currentLanguage = $currentLanguage;
        $this->playerSession = $playerSession;
        $this->preference = $preference;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        return [
            'currentLanguage' => $this->currentLanguage,
            'authenticated' => $this->playerSession->isLogin(),
        ];
    }
}
