import PriceListForm from '@/Components/PriceLists/PriceListForm';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Edit({ priceList }: { priceList: any }) {
    return (
        <AdminLayout title="Edit Price List">
            <Head title="Edit Price List" />
            <div className="max-w-xl"><PriceListForm priceList={priceList} /></div>
        </AdminLayout>
    );
}