import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    width: 250px;
    height: 277px;
`;

const Title = styled.span`
    ${props => props.theme.text.title.xl.regular}

    display: inline-block;
    margin: 20px 0;
`;

const Description = styled.p`
    ${props => props.theme.text.body.xs.light}
    margin: 0;
`;

export interface CardProps {
    /**
     * Path of the image for the logo relative to the public folder
     */
    logoPath: string;

    /**
     * Size of the logo. If not provided, the `layout` property will be set to `fill`
     */
    logoSize?: {
        width: number | string;
        height: number | string;
    };

    title: string;
    description: string;
}

const Card: React.FC<CardProps> = ({
    logoPath,
    title,
    description,
    logoSize
}) => (
    <Wrapper>
        <Image
            src={logoPath}
            alt={''}
            {...(logoSize
                ? { width: logoSize.width, height: logoSize.height }
                : { layout: 'fill' })}
        />
        <Title>{title}</Title>
        <Description>{description}</Description>
    </Wrapper>
);

export default Card;
