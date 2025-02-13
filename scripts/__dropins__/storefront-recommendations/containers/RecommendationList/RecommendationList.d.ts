import { HTMLAttributes } from 'preact/compat';
import { Container, SlotProps, SlotMethod } from '@dropins/tools/types/elsie/src/lib';
import { RecUnitModel } from '../../data/models/rec-unit-model';
import { Values } from '../../components';
import { ButtonProps } from '@dropins/tools/types/elsie/src/components';

type IconType = keyof typeof import('@dropins/tools/types/elsie/src/icons');
type DefaultSlotContext = {
    values: Values;
    valid: boolean;
};
type ConfigType = {
    typeId: string;
};
export interface RecommendationListProps extends HTMLAttributes<HTMLDivElement> {
    pageType: string;
    currentSku: string;
    cartSKUs?: string[];
    category?: string;
    userPurchaseHistory?: [];
    userViewHistory?: [];
    slots?: {
        Actions?: SlotProps<DefaultSlotContext & {
            appendButton: SlotMethod<Omit<ButtonProps, 'icon'> & {
                text?: string;
                icon?: IconType;
            }>;
        }>;
    };
    config?: ConfigType;
}
export declare const RecommendationList: Container<RecommendationListProps, RecUnitModel[] | null>;
export {};
//# sourceMappingURL=RecommendationList.d.ts.map