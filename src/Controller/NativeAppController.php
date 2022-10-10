<?php

namespace App\MobileEntry\Controller;

use App\BaseController;

class NativeAppController extends BaseController
{
    /**
     *
     */
    public function getRestrictedCountries($request, $response)
    {
        $data = [];
        try {
            $config = $this->get('config_fetcher')
                ->withProduct('mobile-entrypage')
                ->getConfig('mobile_nativeapp.nativeapp_configuration');
            // prepare data for restriction
            $row = explode(PHP_EOL, $config['nativeapp_restricted']);
            foreach ($row as $rows) {
                $country = explode('|', trim($rows));

                list($code, $desc) = $country;
                $data[] = [
                    'code' => $code,
                    'country' => $desc
                ];
            }
        } catch (\Exception $e) {
            $data = [
                "status" => "failed",
                "countries" => $data
            ];
        }
        return $this->get('rest')->output($response, [
            "status" => "success",
            "countries" => $data
        ]);
    }
}

