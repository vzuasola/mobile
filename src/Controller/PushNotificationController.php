<?php

namespace App\MobileEntry\Controller;

use App\BaseController;

class PushNotificationController extends BaseController
{
    /**
     *
     */
    public function view($request, $response)
    {
        $data['title'] = 'Push Notification';

        return $this->widgets->render($response, '@site/page.html.twig', $data);
    }
}
