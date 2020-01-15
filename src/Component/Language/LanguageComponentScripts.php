<?php

namespace App\MobileEntry\Component\Language;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class LanguageComponentScripts implements ComponentAttachmentInterface
{
    private $currentLanguage;

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
            $container->get('lang'),
            $container->get('player_session')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($currentLanguage, $playerSession)
    {
        $this->currentLanguage = $currentLanguage;
        $this->playerSession = $playerSession;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        return [
            'currentLanguage' => $this->currentLanguage,
            'authenticated' => $this->playerSession->isLogin(),
            'matrix' => $this->playerSession->getDetails()['isPlayerCreatedByAgent'] ?? false,
        ];
    }
}
