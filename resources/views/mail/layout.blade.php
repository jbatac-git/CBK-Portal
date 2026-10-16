{{--
    Shared frame for every CBK Academy email. Inline styles and tables only:
    Outlook and Gmail ignore <style> blocks and modern CSS layout.
--}}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <title>@yield('title', 'CBK Academy')</title>
</head>
<body style="margin:0;padding:0;background:#FAF8F5;font-family:'Segoe UI',Arial,Helvetica,sans-serif;color:#1C1714;-webkit-font-smoothing:antialiased;">
    {{-- Preview text shown next to the subject in the inbox list. --}}
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">@yield('preheader')</div>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#FAF8F5;">
        <tr>
            <td align="center" style="padding:32px 16px;">
                <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;max-width:560px;">
                    <tr>
                        <td style="padding:0 4px 20px 4px;">
                            <table cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                    <td style="width:32px;height:32px;background:#7A1421;border-radius:7px;text-align:center;vertical-align:middle;">
                                        <span style="display:inline-block;width:8px;height:8px;background:#DDB76A;border-radius:50%;"></span>
                                    </td>
                                    <td style="padding-left:10px;font-family:Georgia,'Times New Roman',serif;font-size:19px;color:#1C1714;">
                                        <strong>CBK</strong> <span style="color:#7A1421;">Academy</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="background:#FFFFFF;border:1px solid #E8E2DA;border-radius:10px;padding:32px 32px 28px 32px;font-size:15px;line-height:1.6;">
                            @yield('content')
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px 4px 0 4px;font-size:12px;line-height:1.6;color:#78716C;">
                            This is an automated message from CBK Academy, Co Ban Kiat Hardware, Inc. Please do not reply to this email.
                            <br>CBK will never ask for your password.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
