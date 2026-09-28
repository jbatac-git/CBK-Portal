<!DOCTYPE html>
<html lang="en">
<body style="margin:0;background:#FBF6F0;font-family:Arial,Helvetica,sans-serif;color:#2B1A1C;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
        <td align="center" style="padding:24px;">
            <table width="560" cellpadding="0" cellspacing="0" role="presentation"
                   style="max-width:560px;background:#ffffff;border-radius:8px;overflow:hidden;">
                <tr>
                    <td style="background:#7A1421;border-bottom:4px solid #C9973F;padding:16px 24px;color:#ffffff;font-size:18px;">
                        CBK Portal
                    </td>
                </tr>
                <tr>
                    <td style="padding:24px;font-size:14px;line-height:1.6;">
                        <p>Hello {{ $user->first_name }},</p>
                        <p>An account has been created for you on the CBK Portal. Use the temporary credentials below to log in.</p>

                        <table cellpadding="8" cellspacing="0" role="presentation"
                               style="background:#FBF6F0;border:1px solid #EADFD6;border-radius:6px;margin:16px 0;">
                            <tr>
                                <td style="color:#7A6A6C;">Username</td>
                                <td><strong>{{ $user->username }}</strong></td>
                            </tr>
                            <tr>
                                <td style="color:#7A6A6C;">Temporary password</td>
                                <td><strong style="font-family:monospace;font-size:16px;">{{ $temporaryPassword }}</strong></td>
                            </tr>
                        </table>

                        <p>
                            <a href="{{ route('login') }}"
                               style="display:inline-block;background:#7A1421;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:6px;">
                                Log in to CBK Portal
                            </a>
                        </p>

                        <p>
                            This temporary access is valid for <strong>{{ $days }} days</strong>
                            (until {{ $user->temporary_access_expires_at->format('F j, Y') }}).
                            During this period you can only access the learning materials assigned by the company.
                        </p>
                        <p style="color:#7A6A6C;font-size:12px;">
                            Do not share your credentials with anyone. CBK will never ask for your password.
                        </p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>