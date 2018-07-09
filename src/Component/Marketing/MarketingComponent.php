<?php

namespace App\MobileEntry\Component\Marketing;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class MarketingComponent implements ComponentWidgetInterface
{
    private $views;

    /**
     * Block utility helper
     *
     * @var object
     */
    private $blockUtils;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('views_fetcher'),
            $container->get('block_utils')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($views, $blockUtils)
    {
        $this->views = $views;
        $this->blockUtils = $blockUtils;
    }


    /**
     *
     */
    public function getTemplate()
    {
        return '@component/Marketing/template.html.twig';
    }

    /**
     *
     */
    public function getData()
    {
        $data = [];

        try {
            $marketing = $this->views->getViewById('marketing_scripts');
            $result = [];
            if ($marketing) {
                foreach ($marketing as $listing) {
                    $visibilty = $listing['field_per_page_configuratiion'][0]['value'] ?? 0;

                    if ($this->blockUtils->isVisibleOn($visibilty)) {
                        $result[] = $listing;
                    }
                }
            }

            $data['marketing'] = $result;
        } catch (\Exception $e) {
            $data = [];
        }

        return $data;
    }
}
