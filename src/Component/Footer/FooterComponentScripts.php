<?php

namespace App\MobileEntry\Component\Footer;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;

/**
 *
 */
class FooterComponentScripts implements ComponentAttachmentInterface
{
    private $idDomain;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('id_domain')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($idDomain)
    {
        $this->idDomain = $idDomain;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        try {
            $data['geo_ip'] = $this->idDomain->getGeoIpCountry();
        } catch (\Exception $e) {
            $data['geo_ip'] = '';
        }

        return $data;
    }
}
