<?php

namespace App\MobileEntry\Form;

use App\Plugins\Form\FormInterface;
use App\Extensions\Form\ConfigurableForm\FormBase;
use Psr\Http\Message\ResponseInterface;
use App\Utils\IP;

class ContactUsForm extends FormBase implements FormInterface
{
    /**
     *
     */
    private $mail;

    /**
     *
     */
    private $player;

    /**
     *
     */
    private $playerSession;

    /**
     *
     */
    private $session;

    /**
     *
     */
    private $langcode;

    /**
     *
     */
    private $request;

    /**
     *
     */
    private $url;

    /**
     * Container dependency injection
     */
    public function setContainer($container)
    {
        parent::setContainer($container);

        $this->mail = $container->get('mail_fetcher');
        $this->playerSession = $container->get('player_session');
        $this->session = $container->get('session');
        $this->player = $container->get('user_fetcher');
        $this->langcode = $container->get('lang');
        $this->request = $container->get('router_request');
        $this->url = $container->get('uri');
        $this->config = $container->get('config_fetcher_async');
    }

    public function getFormId()
    {
        return 'contact_us_form';
    }

    /**
     * @{inheritdoc}
     */
    public function alterFormDefinition($definition, $data, $options)
    {
        $isLogin = $this->playerSession->isLogin();
        if ($isLogin) {
            // Get player details to populate player fields
            $playerDetails = $this->player->getPlayerDetails();

            $definition['first_name']['options']['attr']['value'] = $playerDetails['firstName'];
            $definition['first_name']['options']['attr']['readonly'] = 'readonly';
            $definition['last_name']['options']['attr']['value'] = $playerDetails['lastName'];
            $definition['last_name']['options']['attr']['readonly'] = 'readonly';
            $definition['username']['options']['attr']['value'] = $playerDetails['username'];
            $definition['username']['options']['attr']['readonly'] = 'readonly';
        }

        if ($prevProduct = $this->request->getQueryParam('product')) {
            $definition['product']['options']['data'] = $prevProduct;
        }

        if ($this->request->getQueryParam('inapp')) {
            $definition['app_type']['options']['attr']['value'] = 'inapp';
        }

        if (isset($definition['product']['options']['choices'])) {
            $productChoices = $definition['product']['options']['choices'];
            unset($definition['product']['options']['choices']);
            $choices = $this->pipeToChoices($productChoices);
            $definition['product']['options']['choices'] = $choices;
        }

        if (isset($definition['subject']['options']['choices'])) {
            $subjectChoices = $this->parseSubject($definition['subject']['options']['choices']);
            unset($definition['subject']['options']['choices']);
            $definition['subject']['options']['choices'] = $subjectChoices;
        }

        $definition['submit']['options']['attr']['class'] = "btn btn-yellow";

        return $this->alterFormAttributes($definition);
    }

    /**
     * @{inheritdoc}
     */
    public function submit($form, $options, ResponseInterface $response = null)
    {
        $formData = $form->getData();
        $data = [];
        $params = [];
        try {
            $configData = $this->config
                ->getConfig('contact_us_config.contact_us_configuration')
                ->resolve();
        } catch (\Exception $e) {
            $configData['from_email'] = 'no-reply@dafabet.com';
        }


        if (isset($formData['middle_name']) && !empty($formData['middle_name'])) {
            $params = array_merge($params, ['submitted' => 'ok']);
            $destination = $this->url->generateUri('contact-us', ['query' => $params]);
            return $response->withStatus(302)->withHeader('Location', $destination);
        }

        if (isset($formData['subject'])) {
            // prepare Form Data
            $explode = array_pad(explode('|', $formData['subject']), 3, null);
            list($product, $to, $subject) = $explode;

            $data = [
                'langcode' => $this->langcode,
                'module' => 'contact_us_config',
                'key' => 'contact_us',
                'to' => $to,
                'from' => $configData['from_email']
            ];
            $data['params'] = [
                'firstname' => $formData['first_name'],
                'lastname' => $formData['last_name'],
                'username' => $formData['username'],
                'email' => $formData['email'],
                'product' => $product,
                'subject' => $subject,
                'body' => $formData['message'],
                'date' => time(),
                'ip' => IP::getIpAddress()
            ];
        }

        try {
            // send Mail to API and Drupal
            $mailRequest = $this->mail->sendMail($data);
            $requestBody = json_decode($mailRequest->getBody()->getContents(), true);
        } catch (\Exception $e) {
            // set exception api error
            $error = json_decode($e->getResponse()->getBody()->getContents(), true);
            if (isset($error['responseCode'])) {
                $this->session->setFlash('contact_us.message', $error['responseMessage']);
            }
        }

        if ($formData['app_type'] == 'inapp') {
            $params['inapp'] = 1;
        }

        if (isset($requestBody['responseCode'])) {
            // redirect to success page
            if (isset($requestBody['body']['success'])) {
                $params = array_merge($params, ['submitted' => 'ok']);
                $destination = $this->url->generateUri('contact-us', ['query' => $params]);
                return $response->withStatus(302)->withHeader('Location', $destination);
            }
            // set flood/email error message
            if (isset($requestBody['body']['error'])) {
                $this->session->setFlash('contact_us.message', $requestBody['body']['error']);
            }
        }
        // redirect to the form
        $destination = $this->url->generateUri('contact-us', ['query' => $params]);
        return $response->withStatus(302)->withHeader('Location', $destination);
    }

    private function alterFormAttributes($definition)
    {
        foreach ($definition as $key => $field) {
            if (isset($definition[$key]['options']['placeholder']) &&
                (strpos($field['type'], 'TextType') !== false ||
                strpos($field['type'], 'TextAreaType') !== false)
            ) {
                $definition[$key]['options']['attr']['placeholder'] = $definition[$key]['options']['placeholder'];
                unset($definition[$key]['options']['placeholder']);
            }

            if (isset($definition[$key]['options']['annotation'])) {
                $definition[$key]['options']['attr']['annotation'] = $definition[$key]['options']['annotation'];
                unset($definition[$key]['options']['annotation']);
            }
        }
        return $definition;
    }

    private function parseSubject($choices)
    {
        $result = [];

        $subjects = explode(PHP_EOL, $choices);
        $subjects = array_map('trim', $subjects);

        foreach ($subjects as $subject) {
            $explode = array_pad(explode('|', $subject), 3, null);
            list($product,, $value) = $explode;

            $result[$product][$value] = $subject;
        }
        return $result;
    }
}
