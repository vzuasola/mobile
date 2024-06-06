<?php
namespace App\MobileEntry\Form;

use App\Extensions\Form\Webform\FormBase as WebformForm;

class FaqWebform
{

    private $formManager;
    private $forms;
    private $files;
    private $player;
    private $views;
    private $lang;
    /**
     * Logger $logger
     */
    private $logger;
     /**
     * Container resolver
     */
    public static function create($container)
    {
        return new static(
            $container->get('form_manager'),
            $container->get('form_fetcher')->withProduct('faqs'),
            $container->get('file_fetcher'),
            $container->get('player_session'),
            $container->get('view'),
            $container->get('lang'),
            $container->get('logger')
        );
    }

    public function __construct(
        $formManager,
        $forms,
        $files,
        $player,
        $views,
        $lang,
        $logger
    ) {
        $this->formManager = $formManager;
        $this->forms = $forms;
        $this->files = $files;
        $this->player = $player;
        $this->views = $views;
        $this->lang = $lang;
        $this->logger = $logger;
    }

    public function getForm($formId, $renderWrapper)
    {
        $options = ['formId' => $formId];
        try {
            $username = $this->player->getUsername();

            if ($username) {
                $options['username']['data'] = $username;
                $options['username']['disabled'] = true;

                $options['submission_alter'] = function (&$data) use ($username) {
                    $data['username'] = $username;
                };
            }

            $form = $this->formManager->getForm(WebformForm::class, $options, 'faqs');
            $settings = $this->forms->getDataById($formId);

            $data['form_settings'] = $settings;
            $data['form'] = $form->createView();
            $data['form_background'] = $this->getWebformBackground($settings);
            $data['formId'] = $formId;
            $data['formType'] = 'optin-faq';

            if ($renderWrapper) {
                return $this->views->fetch('@site/form/embed.html.twig', $data);
            } else {
                return $this->views->fetch('@site/form/optin.html.twig', $data);
            }
        } catch (\Exception $e) {
            $this->logger->error('webform_render_error', [
                'exception' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Gets webform background image
     */
    private function getWebformBackground($settings)
    {
        $lang = $this->lang;
        $backgroundSettings = $settings['third_party_settings']['webcomposer_webform']['webform_background'];

        // get the translated background first
        $background = $backgroundSettings["background_image_$lang"][0] ?? false;

        // if there is no background then get the default fallback background
        // image
        if (empty($background)) {
            $background = $backgroundSettings["background_image"][0] ?? false;
        }

        return $background;
    }
}
