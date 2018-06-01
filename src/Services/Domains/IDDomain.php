<?php

namespace App\MobileEntry\Services\Domains;

use App\Utils\Host;

/**
 *
 */
class IDDomain
{
    const LANG = 'ID';

    const DOMAINS = [
        'd8bola.com',
        'm.d8bola.com',
        'd8bola.net',
        'm.d8bola.net',
        'd8id.com',
        'm.d8id.com',
        'd8id.net',
        'm.d8id.net',
        'd8gol.com',
        'm.d8gol.com',
        'golemas.com',
        'm.golemas.com',
        'bolaindo8.com',
        'm.bolaindo8.com',
        'pialadunia888.com',
        'm.pialadunia888.com',
        'stg-m.elysium-pkr.com',
        'stg-m.elysium-csn.com',
    ];

    /**
     * Current language
     *
     * @var string
     */
    private $lang;

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
    public function __construct($lang)
    {
        $this->lang = $lang;
    }

    /**
     * Check if domain used is ID
     *
     * @return bool
     */
    public function isLangSelectorHidden()
    {
        $hostname = Host::getHostname();

        return in_array($hostname, self::DOMAINS) && strtolower($this->lang) == strtolower(self::LANG);
    }
}
