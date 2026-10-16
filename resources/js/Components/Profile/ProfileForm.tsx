import SettingsSection, { SettingsSections } from '@/Components/Settings/SettingsSection';
import AvatarUploader from '@/Components/Shared/AvatarUploader';
import Button from '@/Components/UI/Button';
import Card, { CardBody, CardFooter } from '@/Components/UI/Card';
import Input from '@/Components/UI/Input';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export interface ProfileData {
    name: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    employee_id: string;
    contact_number: string | null;
    photo_url: string | null;
}

export default function ProfileForm({ profile }: { profile: ProfileData }) {
    const contactForm = useForm({ contact_number: profile.contact_number ?? '' });
    const passwordForm = useForm({ current_password: '', password: '', password_confirmation: '' });

    const submitContact: FormEventHandler = (e) => {
        e.preventDefault();
        contactForm.put(route('profile.contact.update'), { preserveScroll: true });
    };

    const submitPassword: FormEventHandler = (e) => {
        e.preventDefault();
        passwordForm.put(route('profile.password.update'), {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    };

    const accountRows: { label: string; value: string; mono?: boolean }[] = [
        { label: 'Name', value: profile.name },
        { label: 'Username', value: profile.username, mono: true },
        { label: 'Employee ID', value: profile.employee_id, mono: true },
        { label: 'Email', value: profile.email },
    ];

    return (
        <SettingsSections>
            <SettingsSection title="Profile picture" description="Shown next to your name across CBK Academy.">
                <Card>
                    <CardBody>
                        <AvatarUploader
                            currentUrl={profile.photo_url}
                            name={profile.name}
                            firstName={profile.first_name}
                            lastName={profile.last_name}
                        />
                    </CardBody>
                </Card>
            </SettingsSection>

            <SettingsSection
                title="Account information"
                description="To change your name, employee ID or email, contact HR or your administrator."
            >
                <Card>
                    <dl className="divide-y divide-line">
                        {accountRows.map((row) => (
                            <div key={row.label} className="grid gap-1 px-5 py-3.5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4">
                                <dt className="text-[13px] text-stone-500">{row.label}</dt>
                                <dd className={`break-words text-sm text-ink ${row.mono ? 'font-mono text-[13px]' : ''}`}>
                                    {row.value || <span className="text-stone-400">Not set</span>}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </Card>
            </SettingsSection>

            <SettingsSection title="Contact information" description="A number HR and your team can reach you on.">
                <form onSubmit={submitContact}>
                    <Card>
                        <CardBody>
                            <Input
                                label="Contact number"
                                name="contact_number"
                                type="tel"
                                autoComplete="tel"
                                value={contactForm.data.contact_number}
                                onChange={(e) => contactForm.setData('contact_number', e.target.value)}
                                error={contactForm.errors.contact_number}
                                optional
                            />
                        </CardBody>
                        <CardFooter>
                            <Button type="submit" loading={contactForm.processing}>
                                Save
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </SettingsSection>

            <SettingsSection
                title="Change password"
                description="Changing your password signs you out on your other devices."
            >
                <form onSubmit={submitPassword}>
                    <Card>
                        <CardBody className="space-y-5">
                            <Input
                                label="Current password"
                                name="current_password"
                                type="password"
                                autoComplete="current-password"
                                value={passwordForm.data.current_password}
                                onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                error={passwordForm.errors.current_password}
                            />
                            <div className="grid gap-5 sm:grid-cols-2">
                                <Input
                                    label="New password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    value={passwordForm.data.password}
                                    onChange={(e) => passwordForm.setData('password', e.target.value)}
                                    error={passwordForm.errors.password}
                                    hint="At least 8 characters."
                                />
                                <Input
                                    label="Confirm new password"
                                    name="password_confirmation"
                                    type="password"
                                    autoComplete="new-password"
                                    value={passwordForm.data.password_confirmation}
                                    onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                    error={passwordForm.errors.password_confirmation}
                                />
                            </div>
                        </CardBody>
                        <CardFooter>
                            <Button type="submit" loading={passwordForm.processing}>
                                Update password
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </SettingsSection>
        </SettingsSections>
    );
}
