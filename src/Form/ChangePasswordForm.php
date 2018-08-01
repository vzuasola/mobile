<?php
namespace App\MobileEntry\Form;

use App\Plugins\Form\FormInterface;
use Symfony\Component\Form\Forms;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\FormBuilderInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;
use App\Utils\Url;

/**
 * Class for Creating ChangePasswordForm
 */
class ChangePasswordForm implements FormInterface
{
    /**
     *
     */
    private $container;

    /**
     * Change password class
     */
    private $changePassword;

    /**
     * Session class
     */
    private $session;

    /**
     * Change password config.
     */
    private $changePassConfig = [];

    /**
     * User detail config.
     */
    private $userDetail = [];


    /**
     *
     */
    public function setContainer($container)
    {
        $this->container = $container;
        $this->request = $container->get('router_request');
        $this->changePassword = $container->get('change_password');
        $this->session = $container->get('session');
    }

    /**
     *
     */
    public function getForm(FormBuilderInterface $form, $options)
    {
        //Change Password Form
        $formFields = [
            'current_password_field' => [
                'type' => PasswordType::class,
                'options' => [
                    'attr' => [
                        'value' => '',
                        'class' => 'field-current-password-field input-block-level',
                    ],
                    'required' => false,
                ]
            ],
            'new_password_field' => [
                'type' => PasswordType::class,
                'options' => [
                    'attr' => [
                        'value' => '',
                        'class' => 'field-new-password-field input-block-level',
                    ],
                    'required' => false,
                ]
            ],
            'confirm_password_field' => [
                'type' => PasswordType::class,
                'options' => [
                    'attr' => [
                        'value' => '',
                        'class' => 'field-confirm-password-field input-block-level',
                    ],
                    'required' => false,
                ]
            ],
            'change_password_submit_field' => [
                'type' => SubmitType::class,
                'options' => [
                    'attr' => [
                        'value' => '',
                        'class' => 'btn btn-small btn-yellow btn-changepass btn-lower-case',
                    ],
                ]
            ],
        ];

        foreach ($formFields as $key => $field) {
            $form->add($key, $field['type'], $field['options']);
        }

        $action = Url::generateFromRequest($this->request, 'change-password/submit');
        $form->setAction($action)
            ->setMethod('POST');

        return $form;
    }

    /**
     * Submit callback handler
     *
     * @param object $form The form definition object
     * @param array $options Array of additional options
     */
    public function submit($form, $options, ResponseInterface $response = null)
    {
        $livePassword = $form->get('current_password_field')->getData();
        $newPassword = $form->get('new_password_field')->getData();
        $confirmPassword = $form->get('confirm_password_field')->getData();
        $contentLang = $response->getHeader('Content-Language');
        $lang = reset($contentLang);

        // Get config adapter for validation error messages.
        if (empty($this->changePassConfig)) {
            $this->changePassConfig = $this->container->get('config_fetcher')
                ->getConfigById('my_account_change_password');
            $this->userDetail = $this->container->get('user_fetcher')->getPlayerDetails();
        }

        $hasError = false;

        // Get validation check.
        $success = $this->validationErrorCheck([
            $this->changePassConfig['new_password_field']['options']['label'] => $newPassword,
            $this->changePassConfig['current_password_field']['options']['label'] => $livePassword,
            $this->changePassConfig['confirm_password_field']['options']['label'] => $confirmPassword
        ], 6, 10);

        if ($success !== true) {
            $hasError = true;
            $this->session->setFlash('changepassword.validation', $success);
        }

        // If error is empty go for iCore validation check.
        if ($hasError === false) {
            try {
                $this->changePassword->changePlayerPassword($livePassword, $newPassword);
                // No need for condition here, if the process does not get any exceptions the request is a success
                $this->session->setFlash('changepassword.success', 'CHANGE_PASSWORD_SUCCESS');
            } catch (\Exception $e) {
                $error = $e->getResponse()->getBody()->getContents();
                $error = json_decode($error, true);
                if ($error && $error['responseCode'] == 'INT001') {
                    $this->session->setFlash('changepassword.error', 'INTERNAL_ERROR');
                }

                if ($error && $error['responseCode'] == 'INT013') {
                    $this->session->setFlash('changepassword.error', 'CHANGE_PASSWORD_FAILED');
                }
            }
        }

        // Return flash messages for server side validation.
        return $response->withStatus(302)->withHeader('Location', '/' . $lang . '/change-password');
    }


    /**
     * Server side validation check.
     *
     * @param $str
     * @param int $min
     * @param int $max
     * @return bool | array
     */
    private function validationErrorCheck($str)
    {
        // Server side validation messages from drupal
        if (empty($this->changePassConfig)) {
            $this->changePassConfig = $this->container->get('config_fetcher')
                                        ->getConfigById('my_account_change_password');
        }

        $error = $this->validateDefaultFields($str);

        $newPasswordField = $this->changePassConfig['new_password_field']['options']['label'];
        $confirmPasswordField = $this->changePassConfig['confirm_password_field']['options']['label'];
        if (isset($newPasswordField) && isset($confirmPasswordField)) {
            // Mismatch validation for new and confirm password.
            if ($str[$newPasswordField] != $str[$confirmPasswordField]) {
                $error['Password Mismatch'] = $this->changePassConfig['validation_error']['mismatch'];
            }

            // Password should not same as username.
            if (strtolower($str[$newPasswordField]) == strtolower($this->userDetail['username'])) {
                $error[$newPasswordField] = $this->changePassConfig['validation_error']['not_username'];
            }

            // Password should not same as word password.
            if (strtolower($str[$newPasswordField]) == strtolower('password')) {
                $error[$newPasswordField] = $this->changePassConfig['validation_error']['not_password'];
            }
        }

        // Get error messages field key pair for mapping.
        if (empty($error)) {
            return true;
        } else {
            return $error;
        }
    }

    private function validateDefaultFields($str, $min = 6, $max = 10)
    {
        $error = [];
        // Looping validation for each field.
        foreach ($str as $field => $value) {
            if (empty($value)) {
                $error[$field] = $this->changePassConfig['validation_error']['required_error'];
            } else {
                if (strlen($value) < $min) {
                    $error[$field] = $this->changePassConfig['validation_error']['minlength_error'];
                }
                if (strlen($value) > $max) {
                    $error[$field] = $this->changePassConfig['validation_error']['maxlength_error'];
                }
            }

            // Fatal error check.
            if (preg_match('/[^a-z_\-0-9]/i', $value)) {
                $error[$field] = $this->changePassConfig['validation_error']['format_error'];
            }
        }

        return $error;
    }
}
