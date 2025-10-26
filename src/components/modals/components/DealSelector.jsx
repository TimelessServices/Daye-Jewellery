import { useMemo } from 'react';

const roleLabels = {
    buy: 'Buy Item',
    get: 'Get Item'
};

export function DealSelector({
    deals = [],
    mode = 'single',
    onModeChange,
    selectedDealId,
    onDealChange,
    role = 'buy',
    onRoleChange,
    disabled = false
}) {
    const hasDeals = Array.isArray(deals) && deals.length > 0;

    const normalizedDeals = useMemo(() => {
        if (!hasDeals) return [];
        return deals.map((deal) => {
            const id = String(deal?.ID ?? deal?.DealID ?? deal?.CollectionID ?? '');
            const name = deal?.Name ?? deal?.collectionName ?? `Deal ${id}`;
            const buyQty = Number(deal?.BuyQty ?? deal?.BuyQuantity ?? deal?.buyQty ?? 0) || 0;
            const getQty = Number(deal?.GetQty ?? deal?.GetQuantity ?? deal?.getQty ?? 0) || 0;
            const discount = Number(deal?.Discount ?? deal?.DealDiscount ?? 0) || 0;
            return {
                id,
                label: name,
                buyQty,
                getQty,
                discount
            };
        });
    }, [hasDeals, deals]);

    if (!hasDeals) {
        return (
            <div className="w-full">
                <h4 className="text-md font-medium text-dark mb-2">Purchase options</h4>
                <p className="text-sm text-dark/60">This item can be purchased individually.</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <h4 className="text-md font-medium text-dark mb-3">Purchase options</h4>

            <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm text-dark">
                    <input
                        type="radio"
                        name="purchase-mode"
                        value="single"
                        checked={mode === 'single'}
                        onChange={() => onModeChange?.('single')}
                        disabled={disabled}
                    />
                    <span>Buy as single item</span>
                </label>

                <div className={`rounded border border-dark/10 p-3 ${mode === 'deal' ? 'bg-light/40' : 'bg-white'}`}>
                    <label className="flex items-center gap-2 text-sm text-dark mb-3">
                        <input
                            type="radio"
                            name="purchase-mode"
                            value="deal"
                            checked={mode === 'deal'}
                            onChange={() => onModeChange?.('deal')}
                            disabled={disabled}
                        />
                        <span>Add to existing deal</span>
                    </label>

                    {mode === 'deal' && (
                        <div className="space-y-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs uppercase tracking-wide text-dark/60">Select deal</label>
                                <select
                                    value={selectedDealId || normalizedDeals[0]?.id || ''}
                                    onChange={(event) => onDealChange?.(event.target.value)}
                                    className="p-2 border border-dark/20 rounded text-sm"
                                    disabled={disabled}
                                >
                                    {normalizedDeals.map((deal) => (
                                        <option key={deal.id} value={deal.id}>
                                            {deal.label} — Buy {deal.buyQty} / Get {deal.getQty}{deal.discount ? ` @ ${deal.discount}% off` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase tracking-wide text-dark/60">Apply as</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['buy', 'get'].map((value) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => onRoleChange?.(value)}
                                            className={`py-2 text-sm rounded border transition ${
                                                role === value
                                                    ? 'border-dark bg-dark text-white'
                                                    : 'border-dark/20 bg-white text-dark hover:border-dark/40'
                                            }`}
                                            disabled={disabled}
                                        >
                                            {roleLabels[value]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

