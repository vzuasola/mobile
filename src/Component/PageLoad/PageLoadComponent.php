<?php

namespace App\MobileEntry\Component\PageLoad;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;
use Slim\Http\Request;

class PageLoadComponent implements ComponentWidgetInterface
{
    /** @var Request */
    private $request;

    /**
     * @var App\Fetcher\Drupal\ConfigFetcher
     */
    private $configs;

    public static function create($container)
    {
        return new static(
            $container->get('router_request'),
            $container->get('config_fetcher')
        );
    }

    public function __construct($request, $configs)
    {
        $this->request = $request;
        $this->configs = $configs;
    }

    public function getTemplate()
    {
        return '@component/PageLoad/template.html.twig';
    }

    public function getData()
    {
        $data = [];

        try {
            $pageloadConfig = $this->configs->getConfig('webcomposer_config.pageload_configuration');
            $preconnectList = $pageloadConfig['preconnect_list'];
            $preloadList = $pageloadConfig['preload_list'];
        } catch (\Exception $e) {
            $preconnectList = [];
            $preloadList = [];
        }

        if (!empty($preconnectList)) {
            $preconnectUrls = explode("\r\n", $preconnectList);
        } else {
            $preconnectUrls = [];
        }

        if (!empty($preloadList)) {
            $preloadItems = explode("\r\n", $preloadList);
        } else {
            $preloadItems = [];
        }

        $preloadTags = [];
        foreach ($preloadItems as $preloadItemLine) {
            try {
                $tagInfo = [];
                $preloadInfo = explode("|", $preloadItemLine);
                $assetType = $preloadInfo[0];

                $url = $preloadInfo[1];
                $this->checkForRelativeUrl($url);

                $tagInfo['url'] = $url;
                $tagInfo['assetType'] = $assetType;
                $tagInfo['priority'] = $preloadInfo[2];

                if ($assetType == 'font') {
                    $tagInfo['fontType'] = $preloadInfo[3];
                }

                $preloadTags[] = $tagInfo;
            } catch (\Exception $ex) {
                // Skip this tag
            }
        }

        $data['preconnect_urls'] = $preconnectUrls;
        $data['preload_tags'] = $preloadTags;

        return $data;
    }

    private function checkForRelativeUrl(&$url)
    {
        if (substr($url, 0, 1) === "/") {
            $scheme = $this->request->getUri()->getScheme();
            $host = $this->request->getUri()->getHost();

            $url = $scheme . '://' . $host . $url;
        }
    }
}
