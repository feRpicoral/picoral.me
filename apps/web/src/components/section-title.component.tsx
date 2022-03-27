import React, { forwardRef } from 'react';
import styled from 'styled-components';

const StyledTitle = styled.span`
    font-family: 'Fugaz One', cursive;
    font-style: normal;
    font-weight: 400;
    font-size: 68px;
    line-height: 100px;
    color: #a73ed9;
    text-transform: uppercase;
    display: inline-block;
    text-shadow: -6px 0 0 #413ed9;
`;

type SectionTitleProps = Omit<
    React.ClassAttributes<HTMLSpanElement> &
        React.HTMLAttributes<HTMLSpanElement>,
    'ref'
> & {
    ref?:
        | ((instance: HTMLSpanElement | null) => void)
        | React.RefObject<HTMLSpanElement>
        | null
        | undefined;
};

const SectionTitle: React.FC<SectionTitleProps> = forwardRef((props, ref) => (
    <StyledTitle {...props} ref={ref}>
        {props.children}
    </StyledTitle>
));

SectionTitle.displayName = 'SectionTitle';

export default SectionTitle;
