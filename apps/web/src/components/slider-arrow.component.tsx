import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';

const Previous = styled(Image).attrs(_props => ({
    src: '/left-arrow.svg',
    width: 30,
    height: 30,
    alt: 'Previous arrow'
}))``;

const Next = styled(Previous).attrs(() => ({ alt: 'Next arrow' }))`
    transform: rotate(180deg);
`;

interface ArrowProps {
    'data-role': string;
    className: string;
    currentSlide: number;
    onClick: (e: React.MouseEvent<HTMLElement>) => void;
    slideCount: number;
    style: React.CSSProperties;
    type: 'prev' | 'next';
}

// We are setting the props as any and then casting them to ArrowProps
// instead of setting them directly to ArrowProps because of the way react-slick
// passes the props to this component. Checkout the custom arrows' section of
// react-slick docs for more
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SliderArrow: React.FC<any> = (props: ArrowProps) => (
    <div
        onClick={props.onClick}
        style={props.style}
        className={props.className}
    >
        {props.type === 'prev' ? <Previous /> : <Next />}
    </div>
);

export default SliderArrow;
