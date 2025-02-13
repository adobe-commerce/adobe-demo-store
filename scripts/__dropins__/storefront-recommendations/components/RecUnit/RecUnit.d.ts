import { FunctionComponent } from 'preact';
import { HTMLAttributes } from 'preact/compat';
import { SlotMethod, SlotProps } from '@dropins/tools/types/elsie/src/lib';
import { RecUnitModel } from '../../data/models/rec-unit-model';
import { Values } from '..';
import { ButtonProps } from '@dropins/tools/types/elsie/src/components';

type IconType = keyof typeof import('@dropins/tools/types/elsie/src/icons');
type DefaultSlotContext = {
    values: Values;
    valid: boolean;
};
export interface RecUnitProps extends HTMLAttributes<HTMLDivElement> {
    unit: RecUnitModel;
    slots?: {
        Actions?: SlotProps<DefaultSlotContext & {
            appendButton: SlotMethod<Omit<ButtonProps, 'icon'> & {
                text?: string;
                icon?: IconType;
            }>;
        }>;
    };
}
export declare const RecUnit: FunctionComponent<RecUnitProps>;
export {};
//# sourceMappingURL=RecUnit.d.ts.map