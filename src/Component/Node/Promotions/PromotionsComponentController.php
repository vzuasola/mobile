<?php

namespace App\MobileEntry\Component\Node\Promotions;

/**
 *
 */
class PromotionsComponentController
{
    private $faqWebform;
    private $mobWebform;
    private $tokenParser;
    private $rest;

    /**
     *
     */
    public static function create($container)
    {
        return new static(
            $container->get('rest'),
            $container->get('faq_webform'),
            $container->get('mobile_epg_webform'),
            $container->get('token_parser')
        );
    }

    /**
     * Public constructor
     */
    public function __construct(
        $rest,
        $faqWebform,
        $mobWebform,
        $tokenParser
    ) {
        $this->rest = $rest;
        $this->faqWebform = $faqWebform;
        $this->mobWebform = $mobWebform;
        $this->tokenParser = $tokenParser;
    }

    /**
     * Optin form submit handler
     */
    public function submit($request, $response)
    {
        $data = [
            'success' => false
        ];
        try {
            $postData = $request->getParsedBody();
            $formId = $postData['formId'] ?? '';
            $formType = $postData['formType'] ?? 'optin-faq';
            $data['formId'] = $formId;
            $form = '';
            if ('optin-faq' === $formType) {
                $form = $this->faqWebform->getForm($formId, false);
            } elseif ('optin-mobile' === $formType) {
                $form = $this->mobWebform->getForm($formId, false);
            }

            $data['form'] = $this->tokenParser->processTokens($form);
            if (!empty($data['form'])) {
                $data['success'] = true;
            }
        } catch (\Exception $e) {
            // Do nothing
        }

        return $this->rest->output($response, $data);
    }
}
