<?php

namespace App\MobileEntry\Services\IDDomainService;

use App\Utils\Host;

/**
 *
 */
class IDDomainService
{
    private $currentLanguage;

    private $idDomains = [
        'd8bola.com', 'm.d8bola.com',
        'd8bola.net', 'm.d8bola.net',
        'd8id.com', 'm.d8id.com',
        'd8id.net', 'm.d8id.net',
        'd8gol.com', 'm.d8gol.com',
        'golemas.com', 'm.golemas.com',
        'bolaindo8.com', 'm.bolaindo8.com',
        'pialadunia888.com', 'm.pialadunia888.com',
        'stg-m.elysium-pkr.com', 'stg-m.elysium-csn.com',
    ];

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('lang')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($currentLanguage)
    {
        $this->currentLanguage = $currentLanguage;
    }

    /**
     * Check if domain used is ID
     * @return bool
     */
    public function checkIdDomain()
    {
        return in_array(Host::getHostname(), $this->idDomains) && $this->currentLanguage == 'id';
    }
}
