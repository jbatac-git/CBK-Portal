<?php

namespace App\Http\Controllers;

use App\Http\Requests\Profile\UpdateContactRequest;
use App\Http\Requests\Profile\UpdatePasswordRequest;
use App\Http\Requests\Profile\UpdatePhotoRequest;
use App\Services\Media\ImageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __construct(private ImageService $images) {}

    public function edit(Request $request): Response
    {
        $user = $request->user();

        // Same content either way; only the surrounding layout differs,
        // so we pick the matching page component here instead of
        // duplicating this data-shaping logic in two controllers.
        $page = $user->can('admin.access') ? 'Admin/Profile/Edit' : 'Portal/Profile/Edit';

        return Inertia::render($page, [
            'profile' => [
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'employee_id' => $user->employee_id,
                'contact_number' => $user->contact_number,
                'photo_url' => $user->profilePhotoUrl(),
            ],
        ]);
    }

    public function updateContact(UpdateContactRequest $request): RedirectResponse
    {
        $request->user()->update(['contact_number' => $request->validated('contact_number')]);

        return back()->with('success', 'Contact information updated.');
    }

    public function updatePhoto(UpdatePhotoRequest $request): RedirectResponse
    {
        $user = $request->user();
        $old = $user->profile_photo_path;

        $path = $this->images->storeResized(
            $request->file('photo'),
            'avatars',
            config('portal.avatar.width'),
            config('portal.avatar.height'),
        );

        $user->update(['profile_photo_path' => $path]);
        $this->images->delete($old);

        return back()->with('success', 'Profile picture updated.');
    }

    public function updatePassword(UpdatePasswordRequest $request): RedirectResponse
    {
        $request->user()->update(['password' => $request->validated('password')]); // hashed by the cast

        return back()->with('success', 'Password updated.');
    }
}