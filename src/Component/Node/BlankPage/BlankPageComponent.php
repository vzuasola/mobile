<?php

namespace App\MobileEntry\Component\Node\BlankPage;

use App\Plugins\ComponentWidget\ComponentWidgetInterface;

class BlankPageComponent implements ComponentWidgetInterface
{
    private $parser;

    private $asset;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('token_parser'),
            $container->get('asset')
        );
    }

    /**
     * Public constructor
     */
    public function __construct($parser, $asset)
    {
        $this->parser = $parser;
        $this->asset = $asset;
    }
    /**
     * {@inheritdoc}
     */
    public function getTemplate($options = [])
    {
        return '@component/Node/BlankPage/template.html.twig';
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
                return "src=\"" . $this->asset->generateAssetUri(
                    $imageSrc[1],
                    ['product' => 'mobile-entrypage']
                ) . "\"";
            }, $body);

            $data['node']['body'][0]['value'] = $body;
        } catch (\Exception $e) {
            $data['node'] = [];
        }

        return $data;
    }
}
