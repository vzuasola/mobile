<?php

namespace App\MobileEntry\Form;

use App\Plugins\Form\FormInterface;
use App\Extensions\Form\ConfigurableForm\FormBase;

class ResetPasswordForm extends FormBase implements FormInterface
{

    protected $product = 'account';

    /**
     * @{inheritdoc}
     */
    public function getFormId()
    {
        return 'account_reset_password_form';
    }

    /**
     * @{inheritdoc}
     */
    public function alterFormDefinition($definition, $data, $options)
    {
        foreach ($definition as $key => $formField) {
            if (isset($definition[$key]['options']['placeholder']) &&
                (strpos($formField['type'], 'TextType') !== false ||
                strpos($formField['type'], 'PasswordType') !== false)
            ) {
                $definition[$key]['options']['attr']['placeholder'] = $definition[$key]['options']['placeholder'];
                unset($definition[$key]['options']['placeholder']);
            }

            if (isset($definition[$key]['options']['annotation'])) {
                $annotation = $definition[$key]['options']['annotation'];
                if ($annotation) {
                    $definition[$key]['options']['attr']['data-annotation'] = $annotation;
                }
                unset($definition[$key]['options']['annotation']);
            }
        }

        $definition['submit']['options']['attr']['class'] = "btn btn-small btn-yellow btn-changepass btn-lower-case";
        return $definition;
    }

    /**
     * @{inheritdoc}
     */
    public function submit($form, $options)
    {
    }
}
