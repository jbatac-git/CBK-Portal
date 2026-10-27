import PriceListForm from '@/Components/PriceLists/PriceListForm';
import PageHeader from '@/Components/UI/PageHeader';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Create({ maxFileMb }: { maxFileMb: number }) {
    return (
        <AdminLayout title="Add price list">
            <Head title="Add price list" />
            <div className="max-w-3xl">
                <PageHeader
                    back={{ href: route('admin.price-lists.index'), label: 'Price lists' }}
                    title="Add price list"
                    description="Share a PDF or Excel price list with Disers."
                />
                <PriceListForm maxFileMb={maxFileMb} />
            </div>
        </AdminLayout>
    );
}
