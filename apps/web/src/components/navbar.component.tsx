import Link from 'next/link';
import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.nav`
    display: flex;
    justify-content: space-between;
`;

const Home = styled.a`
    ${props => props.theme.text.title.xl.regular}

    display: inline-block;
    text-decoration: none;
    justify-self: flex-start;
    color: black;
`;

const Item = styled.a`
    ${props => props.theme.text.title.xl.regular}

    display: inline-block;
    text-decoration: none;
    color: black;
    transition: all 0.2s ease-in-out;

    &:not(:first-of-type) {
        margin-left: 70px;
    }

    :hover {
        transform: scale(1.05);
    }
`;

const Navbar: React.FC = () => {
    const items = [
        {
            label: 'about me',
            href: '#about-me'
        },
        {
            label: 'experience',
            href: '#experience'
        },
        {
            label: 'blog',
            href: '/blog'
        },
        {
            label: 'contact',
            href: '#contact'
        }
    ];

    return (
        <Wrapper>
            <Link href={'/'} passHref={true}>
                <Home>picoral.me</Home>
            </Link>

            <div>
                {items.map(item => (
                    <Link href={item.href} passHref={true} key={item.label}>
                        <Item>{item.label}</Item>
                    </Link>
                ))}
            </div>
        </Wrapper>
    );
};

export default Navbar;
