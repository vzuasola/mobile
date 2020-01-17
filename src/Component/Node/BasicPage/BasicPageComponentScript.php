<?php

namespace App\MobileEntry\Component\Node\BasicPage;

use App\Plugins\ComponentWidget\ComponentAttachmentInterface;
use App\MobileEntry\Services\Product\Products;

/**
 *
 */
class BasicPageComponentScript implements ComponentAttachmentInterface
{
    private $url;

    private $request;

    private $resolver;

    private $lang;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('uri'),
            $container->get('router_request'),
            $container->get('product_resolver'),
            $container->get('lang')
        );
    }

    /**
     * Public constructor
     */
    public function __construct(
        $url,
        $request,
        $resolver,
        $lang
    ) {
        $this->url = $url;
        $this->request = $request;
        $this->resolver = $resolver;
        $this->lang = $lang;
    }

    /**
     * @{inheritdoc}
     */
    public function getAttachments()
    {
        $data['url'] = $this->url->generateUri('maintenance', []);
        $data['isMatch'] = ltrim($this->request->getUri()->getPath(), '/') === 'maintenance';
        if ($this->resolver->getProduct() === 'mobile-soda-casino') {
            $alias = $this->getAliasInUrl();
            $data['url'] = $this->url->generateUri($alias . '/maintenance', []);
            $data['isMatch'] = ltrim($this->request->getUri()->getPath(), '/' . $alias . '/') === 'maintenance';
        }

        return $data;
    }

    private function getAliasInUrl()
    {
        $urlPath = str_replace(
            '/' . $this->lang . '/',
            '',
            $this->request->getUri()->getPath()
        );
        $exploded = explode('/', $urlPath);
        return (in_array($exploded[1], Products::PRODUCT_ALIAS['soda-casino'])) ? $exploded[1] : '';
    }
}
