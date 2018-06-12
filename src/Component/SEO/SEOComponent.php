<?php

namespace App\MobileEntry\Component\SEO;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class SEOComponent implements ComponentWidgetInterface
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
        return '@component/SEO/template.html.twig';
    }

    /**
     *
     */
    public function getData()
    {
        $data = [];

        try {
            $seo = $this->views->getViewById('metatag_entity');
            $result = [];

            if ($seo) {
                foreach ($seo as $listing) {
                    $visibilty = $listing['field_per_page_visibility'][0]['value'] ?? 0;

                    if ($this->blockUtils->isVisibleOn($visibilty)) {
                        $result[] = $listing;
                    }
                }
            }

            $data['seo'] = $result;
        } catch (\Exception $e) {
            $data = [];
        }

        return $data;
    }
}
