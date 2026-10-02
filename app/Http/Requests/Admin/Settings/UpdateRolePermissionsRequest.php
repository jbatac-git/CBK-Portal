<?php

namespace App\Http\Requests\Admin\Settings;

use App\Enums\RoleName;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateRolePermissionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('roles.manage');
    }

    public function rules(): array
    {
        return [
            // Any of the four roles is syntactically valid input. WHICH
            // roles may actually be edited on this screen is a business
            // rule enforced by RolePermissionMatrixService::update()
            // (via DomainException), not a validation concern — this is
            // the same shape-vs-business-rule split we use everywhere else.
            'role' => ['required', new Enum(RoleName::class)],
            'permissions' => ['array'],
            'permissions.*' => ['string'],
        ];
    }
}