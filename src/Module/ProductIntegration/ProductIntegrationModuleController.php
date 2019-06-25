<?php

namespace App\MobileEntry\Module\ProductIntegration;

use App\Plugins\ComponentWidget\ComponentModuleInterface;

class ProductIntegrationModuleController
{
    private $parser;

    private $rest;
    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('token_parser'),
            $container->get('rest')
        );
    }

    /**
     * Public constructor
     */
    public function __construct(
        $parser,
        $rest
    ) {
        $this->parser = $parser;
        $this->rest = $rest;
    }

    public function process($request, $response)
    {
        $data = [];

        try {
            $requestData = $request->getParsedBody();
            $url = $requestData['url'] . "?{credentials.params}&re=" . $requestData['url'];
            $data['url'] = $this->parser->processTokens(
                $url
            );
        } catch (\Exception $e) {
            $data = [];
        }

        return $this->rest->output($response, $data);
    }
}
