<?php

namespace App\MobileEntry\Form;

use App\Plugins\Form\FormInterface;
use App\Extensions\Form\ConfigurableForm\FormBase;

class ForgotUsernameForm extends FormBase implements FormInterface
{

    protected $product = 'account';

    /**
     * @{inheritdoc}
     */
    public function getFormId()
    {
        return 'forgot_username_form';
    }

    /**
     * @{inheritdoc}
     */
    public function alterFormDefinition($definition, $data, $options)
    {
        foreach ($definition as $key => $formField) {
            if (strpos($formField['type'], 'TextType') !== false ||
                strpos($formField['type'], 'PasswordType') !== false
            ) {
                $this->moveAttribute($definition, $key, 'placeholder', 'placeholder');
            }

            $this->moveAttribute($definition, $key, 'annotation', 'data-annotation');
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
