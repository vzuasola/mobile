<?php

namespace App\MobileEntry\Component\CookieNotif;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class CookieNotifComponentController
{
    private $rest;

    private $idDomain;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('rest'),
            $container->get('id_domain')
        );
    }

    /**
     *
     */
    public function __construct($rest, $idDomain)
    {
        $this->rest = $rest;
        $this->idDomain = $idDomain;
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getGeoIp($request, $response)
    {
        $data = [];

        try {
            $data['geo_ip'] = $this->idDomain->getGeoIpCountry();
        } catch (\Exception $e) {
            $data['geo_ip'] = '';
        }
        $data['geo_ip'] = 'EN';
        return $this->rest->output($response, $data);
    }
}
