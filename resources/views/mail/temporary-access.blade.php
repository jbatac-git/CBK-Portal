@extends('mail.layout')

@section('title', 'Your CBK Academy account')
@section('preheader', 'Your username and temporary password for CBK Academy.')

@section('content')
    <h1 style="margin:0 0 16px 0;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:normal;color:#1C1714;">
        Welcome to CBK Academy, {{ $user->first_name }}
    </h1>
    <p style="margin:0 0 16px 0;">An account has been created for you. Sign in with the details below.</p>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#FAF8F5;border:1px solid #E8E2DA;border-radius:8px;">
        <tr>
            <td style="padding:14px 18px;border-bottom:1px solid #E8E2DA;">
                <span style="display:block;font-size:12px;color:#78716C;">Username</span>
                <span style="font-family:Consolas,'Courier New',monospace;font-size:17px;font-weight:600;color:#1C1714;">{{ $user->username }}</span>
            </td>
        </tr>
        <tr>
            <td style="padding:14px 18px;">
                <span style="display:block;font-size:12px;color:#78716C;">Temporary password</span>
                <span style="font-family:Consolas,'Courier New',monospace;font-size:17px;font-weight:600;color:#1C1714;letter-spacing:0.5px;">{{ $temporaryPassword }}</span>
            </td>
        </tr>
    </table>

    @include('mail.partials.button', ['url' => route('login'), 'label' => 'Sign in to CBK Academy'])

    <p style="margin:0 0 12px 0;">
        You will be asked to choose your own password the first time you sign in.
    </p>
    <p style="margin:0;color:#78716C;font-size:14px;">
        This temporary access is valid for <strong style="color:#1C1714;">{{ $days }} days</strong>
        (until {{ $user->temporary_access_expires_at->format('F j, Y') }}). Until your account is approved,
        only the starter learning materials are available.
    </p>
@endsection
