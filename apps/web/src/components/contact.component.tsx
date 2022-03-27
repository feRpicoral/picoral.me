import ContentWrapper from '@components/content-wrapper.component';
import ContactBlob from '@icons/blobs/contact.svg';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import styled from 'styled-components';

import SectionTitle from './section-title.component';

const RelativeWrapper = styled.div`
    position: relative;
    margin-top: 170px;
`;

const Blob = styled(ContactBlob)`
    position: absolute;
    z-index: -1;
    right: 0;
    top: -50px;
`;

const StyledSectionTitle = styled(SectionTitle)`
    text-align: right;
    width: 100%;
`;

const Items = styled.div`
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin-top: 150px;
`;

const Item = styled.a`
    display: flex;
    text-decoration: none;
    flex-direction: column;
    text-align: center;
    align-items: center;
    justify-content: space-evenly;
    color: black;

    :hover span:last-of-type {
        text-decoration: underline;
    }
`;

const Title = styled.span`
    ${props => props.theme.text.title.xl.light}
    display: inline-block;
    margin: 16px 0 10px 0;
`;

const Label = styled.span`
    ${props => props.theme.text.body.lg.xlight}
    display: inline-block;
`;

const Contact: React.FC = () => {
    const items = [
        {
            title: 'GitHub',
            icon: '/logos/github.svg',
            href: 'https://github.com/feRpicoral',
            label: '@feRpicoral'
        },
        {
            title: 'Email',
            icon: '/logos/outlook.svg',
            href: 'mailto:fernando.picoral@colorado.edu',
            label: 'fernando.picoral@colorado.edu'
        },
        {
            title: 'Linkedin',
            icon: '/logos/linkedin.svg',
            href: 'https://www.linkedin.com/in/picoral/',
            label: '@picoral'
        }
    ];

    return (
        <RelativeWrapper>
            <ContentWrapper id={'contact'}>
                <StyledSectionTitle>Contact</StyledSectionTitle>
                <Items>
                    {items.map(item => (
                        <Link href={item.href} key={item.title} passHref={true}>
                            <Item target={'_blank'}>
                                <Image
                                    src={item.icon}
                                    width={68}
                                    height={60}
                                    alt={''}
                                />
                                <Title>{item.title}</Title>
                                <Label>{item.label}</Label>
                            </Item>
                        </Link>
                    ))}
                </Items>
            </ContentWrapper>
            <Blob />
        </RelativeWrapper>
    );
};

export default Contact;
