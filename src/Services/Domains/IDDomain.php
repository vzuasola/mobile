<?php

namespace App\MobileEntry\Services\Domains;

use App\Utils\Host;

/**
 *
 */
class IDDomain
{
    const LANG = 'ID';
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
        return false;
    }
}
