import PriceListForm, { EditablePriceList } from '@/Components/PriceLists/PriceListForm';
import PageHeader from '@/Components/UI/PageHeader';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Edit({ priceList, maxFileMb }: { priceList: EditablePriceList; maxFileMb: number }) {
    return (
        <AdminLayout title="Edit price list">
            <Head title="Edit price list" />
            <div className="max-w-3xl">
                <PageHeader
                    back={{ href: route('admin.price-lists.index'), label: 'Price lists' }}
                    eyebrow="Edit price list"
                    title={priceList.title}
                    description="Update the details or replace the PDF."
                />
                <PriceListForm priceList={priceList} maxFileMb={maxFileMb} />
            </div>
        </AdminLayout>
    );
}
