import { FunctionComponent, VNode } from 'preact';
import { HTMLAttributes } from 'preact/compat';
import { ProductModel } from '../../data/models';

export type Values = {
    sku: string;
};
export interface ProductItemProps extends HTMLAttributes<HTMLDivElement> {
    product: ProductModel;
    actions?: VNode;
}
export declare const ProductItem: FunctionComponent<ProductItemProps>;
//# sourceMappingURL=ProductItem.d.ts.map