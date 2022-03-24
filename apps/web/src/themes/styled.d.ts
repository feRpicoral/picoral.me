import { CSSObject } from 'styled-components';

declare module 'styled-components' {
    export type FontSizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    export type TitleFontWeights = 'light' | 'regular' | 'bold';
    export type BodyFontWeights = 'xlight' | 'light' | 'regular' | 'bold';

    export interface FontDefinition {
        'font-family': string;
        'font-style': string;
        'font-weight': string;
        'font-size': string;
        'line-height': string;
    }

    export interface DefaultTheme {
        text: {
            title: Record<FontSizes, Record<TitleFontWeights, CSSObject>>;
            body: Record<FontSizes, Record<BodyFontWeights, CSSObject>>;
        };
    }
}
