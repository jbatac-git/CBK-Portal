@extends('mail.layout')

@section('title', 'Email is working')
@section('preheader', 'CBK Academy can send email from this server.')

@section('content')
    <h1 style="margin:0 0 16px 0;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:normal;color:#1C1714;">
        Email is working
    </h1>
    <p style="margin:0 0 12px 0;">CBK Academy sent this test message through <strong>{{ $host }}</strong> at {{ $sentAt }}.</p>
    <p style="margin:0;color:#78716C;font-size:14px;">New employee credentials and password reset emails will be delivered the same way.</p>
@endsection
