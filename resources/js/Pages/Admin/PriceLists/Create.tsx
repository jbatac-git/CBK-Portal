import PriceListForm from '@/Components/PriceLists/PriceListForm';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Create() {
    return (
        <AdminLayout title="Upload Price List">
            <Head title="Upload Price List" />
            <div className="max-w-xl"><PriceListForm /></div>
        </AdminLayout>
    );
}