<?php

namespace App\MobileEntry\Component\Node\BasicPage;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class BasicPageComponent implements ComponentWidgetInterface
{
    /**
     * @var App\Player\PlayerSession
     */
    private $playerSession;

    private $parser;

    private $asset;

    private $resolver;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('player_session'),
            $container->get('token_parser'),
            $container->get('product_resolver'),
            $container->get('asset')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($playerSession, $parser, $resolver, $asset)
    {
        $this->playerSession = $playerSession;
        $this->parser = $parser;
        $this->resolver = $resolver;
        $this->asset = $asset;
    }
    /**
     * {@inheritdoc}
     */
    public function getTemplate($options = [])
    {
        return '@component/Node/BasicPage/template.html.twig';
    }

    /**
     * {@inheritdoc}
     */
    public function getData($options = [])
    {
        try {
            $data['node'] = $options['node'];
            $body = $this->parser->processTokens($options['node']['body'][0]['value']);
            $body = preg_replace_callback('/src="([^"]*)"/i', function ($imageSrc) {
                $product = 'mobile-entrypage';
                if ($this->resolver->getProduct() === 'mobile-soda-casino') {
                    $product = $this->resolver->getProduct();
                }
                return "src=\"" . $this->asset->generateAssetUri(
                    $imageSrc[1],
                    ['product' => $product]
                ) . "\"";
            }, $body);
            $data['node']['body'][0]['value'] = $body;
        } catch (\Exception $e) {
            $data['node'] = [];
        }
        $data['is_login'] = $this->playerSession->isLogin();

        return $data;
    }
}
