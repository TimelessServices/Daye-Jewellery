// Utility Handlers
const parseSetInfo = (data) => {
    const allSets = [];

    if (data) {
        data.split(",").map(set => {
            const [ ID, Name, Price ] = set.split(":");
            allSets.push({ ID, Name, Price: parseFloat(Price) });
        })
    }

    return allSets;
}

const parseDealInfo = (data) => {
    const allDeals = [];

    if (data) {
        data.split(",").map(deal => {
            const [ ID, info ] = deal.split(":");
            const [ quantities, discount ] = info.split("@");
            const [ buyQty, getQty ] = quantities.split("x");

            allDeals.push({
                ID,
                BuyQty: parseInt(buyQty),
                GetQty: parseInt(getQty),
                Discount: parseFloat(discount.replace("%", ""))
            });
        })
    }

    return allDeals;
}

// Jewellery Class
export class Jewellery {
    constructor(raw) {
        // Basic Fields
        this.id = raw.JewelleryID;
        this.type = raw.Type;
        this.desc = raw.Desc;
        this.price = Number(raw.Price);
        this.imgPrimary = raw.ImgPrimary;
        this.imgSecondary = raw.ImgSecondary;
        this.inStock = Number(raw.InStock) || 0;
        this.amountSold = Number(raw.AmountSold) || 0;
        this.dateAdded = raw.DateAdded;

        // Sizes
        this.sizes = raw.Sizes ? 
            raw.Sizes.split("|").filter(Boolean) : [];

        // Boolean Flags
        this.onSale = Boolean(raw.OnSale);
        this.inSet = Boolean(raw.InSet);
        this.hasDeal = Boolean(raw.HasDeal);

        // Collection Info
        this.salePrice = raw.OnSale && raw.BestSalePrice !== null ?
            Number(raw.BestSalePrice) : null;

        this.sets = raw.OnSale && raw.SetOptions ? parseSetInfo(raw.SetOptions) : [];
        this.deals = raw.HasDeal && raw.DealOptions ? parseDealInfo(raw.DealOptions) : [];
    }

    // Getters
    get getID() { return this.id; }
    get getType() { return this.type; }
    get getDesc() { return this.desc; }

    get getImgPrimary() { return this.imgPrimary; }
    get getImgSecondary() { return this.imgSecondary ? this.imgSecondary : null; }

    get availableSizes() { return this.sizes; }
    get isInStock() { return this.inStock > 0; }
    get isRunningLow() { return this.inStock < 50; }
    
    get isOnSale() { return this.onSale; }
    get getBasePrice() { return this.price; }
    get getSalePrice() { return this.salePrice ? this.salePrice : null; }

    get getSets() { return this.sets; }
    get isInSet() { return this.inSet; }
    get setTotal() { return this.sets.length; }

    get getDeals() { return this.deals; }
    get doesHaveDeal() { return this.hasDeal; }
    get dealTotal() { return this.deals.length; }

    // Other Functionality
    getDealString() {
        if (this.deals <= 0) { return; }
        const deal = this.deals[0];

        return `Buy ${deal.BuyQty}, Get ${deal.GetQty} 
            ${deal.Discount === 100 ? 'FREE' : `${deal.Discount}% OFF`}`
    }

    getImgDefault() {
        switch(this.type) {
            case 'N': return "/NECKLACE_PLACEHOLDER.png";
            case 'B': return '/BRACELET_PLACEHOLDER.png';
            case 'R': return '/RING_PLACEHOLDER.png';
            case 'E': return '/EARRING_PLACEHOLDER.png';
            default: return '/ITEM_PLACEHOLDER.png';
        }
    }
}