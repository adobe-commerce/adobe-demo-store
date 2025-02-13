import { FunctionComponent } from 'preact';
import { HTMLAttributes } from 'preact/compat';
import { SlotMethod, SlotProps } from '@dropins/tools/types/elsie/src/lib';
import { ProductModel } from '../../data/models';
import { ButtonProps } from '@dropins/tools/types/elsie/src/components';

type IconType = keyof typeof import('@dropins/tools/types/elsie/src/icons');
export type SlotValues = {
    sku: string;
};
type DefaultSlotContext = {
    values: SlotValues;
    valid: boolean;
};
export interface ProductListProps extends HTMLAttributes<HTMLDivElement> {
    items: ProductModel[];
    slots?: {
        Actions?: SlotProps<DefaultSlotContext & {
            appendButton: SlotMethod<Omit<ButtonProps, 'icon'> & {
                text?: string;
                icon?: IconType;
            }>;
        }>;
    };
}
export declare const ProductList: FunctionComponent<ProductListProps>;
export {};
//# sourceMappingURL=ProductList.d.ts.map