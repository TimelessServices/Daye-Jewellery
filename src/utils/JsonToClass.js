import { Jewellery } from "@/class/Jewellery";

export function JSON_ToJewellery(data) {
    return data.map(item => new Jewellery(item));
}