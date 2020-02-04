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
            $container->get('id_domain'),
            $container->get('preferences_fetcher')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($currentLanguage, $playerSession, $ip, $preference)
    {
        $this->currentLanguage = $currentLanguage;
        $this->playerSession = $playerSession;
        $this->ip = $ip;
        $this->preference = $preference;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        try {
            $inModal = false;
            if ($this->playerSession->isLogin()) {
                $inModal = $this->preference->getPreferences()['dafabet.language.popup.geoip'] ?? true;
            }
        } catch (\Exception $e) {
            $inModal = false;
        }

        return [
            'currentLanguage' => $this->currentLanguage,
            'authenticated' => $this->playerSession->isLogin(),
            'matrix' => $this->playerSession->getDetails()['isPlayerCreatedByAgent'] ?? false,
            'indiaIP' => strtolower($this->ip->getGeoIpCountry()) === 'in' ? true : false,
            'inShowModal' => $inModal,
        ];
    }
}
