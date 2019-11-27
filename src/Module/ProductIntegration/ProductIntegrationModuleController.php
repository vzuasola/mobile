<?php

namespace App\MobileEntry\Module\ProductIntegration;

use App\Plugins\ComponentWidget\ComponentModuleInterface;

class ProductIntegrationModuleController
{
    private $parser;

    private $rest;

    private $playerSession;
    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('token_parser'),
            $container->get('rest'),
            $container->get('player_session')
        );
    }

    /**
     * Public constructor
     */
    public function __construct(
        $parser,
        $rest,
        $playerSession
    ) {
        $this->parser = $parser;
        $this->rest = $rest;
        $this->playerSession = $playerSession;
    }

    public function process($request, $response)
    {
        $data = [];

        if ($this->playerSession->getDetails()['isPlayerCreatedByAgent']) {
            return $this->rest->output($response, $data);
        }

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
