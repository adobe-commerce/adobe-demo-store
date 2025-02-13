import { RecUnitModel } from '../../data/models/rec-unit-model';

export declare const getRecommendations: (pageType: string | 'Product', currentSku?: string | [
], cartSkus?: string[] | [
], category?: string | '', userPurchaseHistory?: [], userViewHistory?: [], config?: {
    typeId: string;
}) => Promise<RecUnitModel[]>;
//# sourceMappingURL=getRecommendations.d.ts.map