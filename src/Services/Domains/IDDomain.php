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

    const BYPASS_ID_DOMAIN = [
        'd8id.net',
        'm.d8id.net',
        'itct-www.elysium-dfbt.com',
        'istg-www.elysium-dfbt.com',
    ];

    /**
     * Current language
     *
     * @var string
     */
    private $lang;

    private $request;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('lang'),
            $container->get('request')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($lang, $request)
    {
        $this->lang = $lang;
        $this->request = $request;
    }

    /**
     * Check if domain used is ID
     *
     * @return bool
     */
    public function getGeoIpCountry()
    {
        return $this->request->getHeader('X-Custom-LB-GeoIP-Country')[0] ?? '';
    }

    /**
     * Check if domain used is ID
     *
     * @return bool
     */
    public function isLangSelectorHidden()
    {
        $hostname = Host::getHostname();

        $countryCode = $this->getGeoIpCountry();

        if (in_array($hostname, self::BYPASS_ID_DOMAIN)) {
            return false;
        }

        return (in_array($hostname, self::DOMAINS) && strtolower($this->lang) == strtolower(self::LANG))
            || strtolower($countryCode) == strtolower(self::LANG);
    }
}
