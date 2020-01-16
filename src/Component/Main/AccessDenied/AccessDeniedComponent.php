<?php

namespace App\MobileEntry\Component\Main\AccessDenied;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class AccessDeniedComponent implements ComponentWidgetInterface
{
    private $url;

    private $request;

    private $resolver;

    private $parser;

    private $asset;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('uri'),
            $container->get('router_request'),
            $container->get('product_resolver'),
            $container->get('token_parser'),
            $container->get('asset')
        );
    }

    /**
     * Public constructor
     */
    public function __construct(
        $url,
        $request,
        $resolver,
        $parser,
        $asset
    ) {
        $this->url = $url;
        $this->request = $request;
        $this->resolver = $resolver;
        $this->parser = $parser;
        $this->asset = $asset;
    }

    /**
     * Defines the template path
     *
     * @return string
     */
    public function getTemplate($options = [])
    {
        return '@component/Main/AccessDenied/template.html.twig';
    }

    /**
     * Defines the data to be passed to the twig template
     *
     * @return array
     */
    public function getData($options = [])
    {
        try {
            $data['node'] = $options['node'];
            $body = $this->parser->processTokens($options['node']['body'][0]['value']);
            $body = preg_replace_callback('/src="([^"]*)"/i', function ($imageSrc) {
                return "src=\"" . $this->asset->generateAssetUri(
                    $imageSrc[1],
                    ['product' => $this->resolver->getProduct()]
                ) . "\"";
            }, $body);

            $data['node']['body'][0]['value'] = $body;
        } catch (\Exception $e) {
            $data['node'] = [];
        }

        $data['is_match'] = ltrim($this->request->getUri()->getPath(), '/') === 'page-not-found';
        if ($this->resolver->getProduct() === 'mobile-soda-casino') {
            $data['is_match'] = ltrim($this->request->getUri()->getPath(), '/soda/') === 'page-not-found';
        }

        return $data;
    }
}
