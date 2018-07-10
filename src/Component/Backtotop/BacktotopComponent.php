<?php

namespace App\MobileEntry\Component\Backtotop;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class BacktotopComponent implements ComponentWidgetInterface
{
    /** 
     * @var App\Fetcher\Drupal\ConfigFetcher 
     */ 
    private $configs; 

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
            $container->get('config_fetcher'),
            $container->get('block_utils')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($configs, $blockUtils)
    {
        $this->configs = $configs;
        $this->blockUtils = $blockUtils;
    }


    /**
     *
     */
    public function getTemplate()
    {
        return '@component/Backtotop/template.html.twig';
    }

    /**
     *
     */
    public function getData()
    {
        $data = [];

        try { 
            $footerConfigs = $this->configs->getConfig('webcomposer_config.footer_configuration');
        } catch (\Exception $e) { 
            $footerConfigs = []; 
        }

        $visibility = $footerConfigs['back_to_top_title'] ?? 0; 
        $data['back_to_top'] = !$this->blockUtils->isVisibleOn($visibility); 

        return $data;
    }
}
