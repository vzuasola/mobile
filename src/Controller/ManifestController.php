<?php

namespace App\MobileEntry\Controller;

use App\BaseController;

class ManifestController extends BaseController
{
    /**
     *
     */
    public function view($request, $response)
    {
        try {
            $manifestJson = file_get_contents(__DIR__ . '/../../manifest.json');
            $manifestJson = $this->get('token_parser')->processTokens($manifestJson);

            $manifest = json_decode($manifestJson, true);
        } catch (\Exception $e) {
            $manifest = [];
        }

        return $this->rest->output($response, $manifest);
    }
}
