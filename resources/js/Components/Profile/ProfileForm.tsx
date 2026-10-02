import AvatarUploader from '@/Components/Shared/AvatarUploader';
import Button from '@/Components/UI/Button';
import Input from '@/Components/UI/Input';
import { router, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface ProfileData {
    name: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    employee_id: string;
    contact_number: string | null;
    photo_url: string | null;
}

const card = 'rounded-xl border border-stone-200 bg-white p-5';

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

    return (
        <div className="space-y-6">
            <section className={`${card} space-y-4`}>
                <h2 className="text-base font-medium text-maroon">Profile picture</h2>
               <AvatarUploader
    currentUrl={profile.photo_url}
    name={profile.name}
    firstName={profile.first_name}
    lastName={profile.last_name}
/>
            </section>

            <section className={`${card} space-y-1 text-sm`}>
                <h2 className="mb-3 text-base font-medium text-maroon">Account information</h2>
                <p><span className="text-stone-500">Name:</span> {profile.name}</p>
                <p><span className="text-stone-500">Username:</span> {profile.username}</p>
                <p><span className="text-stone-500">Employee ID:</span> {profile.employee_id}</p>
                <p><span className="text-stone-500">Email:</span> {profile.email}</p>
                <p className="pt-1 text-xs text-stone-400">
                    To change your name, employee ID, or email, please contact HR or your administrator.
                </p>
            </section>

            <form onSubmit={submitContact} className={`${card} space-y-4`}>
                <h2 className="text-base font-medium text-maroon">Contact information</h2>
                <Input
                    label="Contact number"
                    name="contact_number"
                    value={contactForm.data.contact_number}
                    onChange={(e) => contactForm.setData('contact_number', e.target.value)}
                    error={contactForm.errors.contact_number}
                />
                <div className="flex justify-end">
                    <Button type="submit" disabled={contactForm.processing}>Save</Button>
                </div>
            </form>

            <form onSubmit={submitPassword} className={`${card} space-y-4`}>
                <h2 className="text-base font-medium text-maroon">Change password</h2>
                <Input
                    label="Current password"
                    name="current_password"
                    type="password"
                    value={passwordForm.data.current_password}
                    onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                    error={passwordForm.errors.current_password}
                />
                <Input
                    label="New password"
                    name="password"
                    type="password"
                    value={passwordForm.data.password}
                    onChange={(e) => passwordForm.setData('password', e.target.value)}
                    error={passwordForm.errors.password}
                />
                <Input
                    label="Confirm new password"
                    name="password_confirmation"
                    type="password"
                    value={passwordForm.data.password_confirmation}
                    onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                    error={passwordForm.errors.password_confirmation}
                />
                <div className="flex justify-end">
                    <Button type="submit" disabled={passwordForm.processing}>Update password</Button>
                </div>
            </form>
        </div>
    );
}