export default function CustomerView({ customer, onEdit }) {
    return (
        <div className="bg-white p-4 gap-8 flex flex-col rounded-lg shadow">
            <div className="gap-4 flex flex-col justify-between items-center md:flex-row">
                <h2 className="text-xl font-semibold">Customer Details</h2>
                <div className="gap-4 flex items-center">
                    <span className="text-sm text-green bg-green/10 px-3 py-2 rounded">✓ Confirmed</span>
                    <button onClick={onEdit} className="text-sm bg-dark/10 px-3 py-2 rounded cursor-pointer animate
                        hover:scale-95 hover:bg-dark/35">Edit Details</button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-dark/70">First Name</label>
                    <div className="text-dark font-medium">{customer.firstName}</div>
                </div>
                
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-dark/70">Last Name</label>
                    <div className="text-dark font-medium">{customer.lastName}</div>
                </div>

                <div className="space-y-1">
                    <label className="block text-sm font-medium text-dark/70">Email Address</label>
                    <div className="text-dark font-medium">{customer.email}</div>
                </div>
                
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-dark/70">Phone Number</label>
                    <div className="text-dark font-medium">{customer.phone}</div>
                </div>
            </div>
        </div>
    );
}