@extends('mail.layout')

@section('title', 'Reset your password')
@section('preheader', 'Use this link to choose a new CBK Academy password.')

@section('content')
    <h1 style="margin:0 0 16px 0;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:normal;color:#1C1714;">
        Reset your password
    </h1>
    <p style="margin:0 0 4px 0;">Hello {{ $user->first_name }},</p>
    <p style="margin:0;">We received a request to reset the password for your CBK Academy account
        (<span style="font-family:Consolas,'Courier New',monospace;">{{ $user->username }}</span>).</p>

    @include('mail.partials.button', ['url' => $url, 'label' => 'Choose a new password'])

    <p style="margin:0 0 12px 0;color:#78716C;font-size:14px;">
        This link expires in {{ $expires }} minutes. Resetting your password signs you out on all your devices.
    </p>
    <p style="margin:0 0 12px 0;color:#78716C;font-size:14px;">
        If you did not ask for this, you can ignore this email. Your password will not change.
    </p>
    <p style="margin:0;color:#A8A29E;font-size:12px;word-break:break-all;">
        Button not working? Copy this link into your browser:<br>{{ $url }}
    </p>
@endsection
