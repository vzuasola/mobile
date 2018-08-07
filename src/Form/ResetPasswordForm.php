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
            if (strpos($formField['type'], 'TextType') !== false ||
                strpos($formField['type'], 'PasswordType') !== false
            ) {
                $this->moveAttribute($definition, $key, 'placeholder', 'placeholder');
            }

            $this->moveAttribute($definition, $key, 'annotation', 'data-annotation');
            $this->moveAttribute($definition, $key, 'annotation_weak', 'data-annotation-weak');
            $this->moveAttribute($definition, $key, 'annotation_average', 'data-annotation-average');
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
