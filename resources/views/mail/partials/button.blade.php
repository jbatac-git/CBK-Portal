{{-- Bulletproof button: a padded table cell works in Outlook, where styled <a> padding is ignored. --}}
<table cellpadding="0" cellspacing="0" role="presentation" style="margin:24px 0;">
    <tr>
        <td style="background:#7A1421;border-radius:6px;">
            <a href="{{ $url }}" style="display:inline-block;padding:12px 22px;font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:6px;">
                {{ $label }}
            </a>
        </td>
    </tr>
</table>
