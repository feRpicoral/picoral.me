import React from 'react';
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

const SectionTitle: React.FC = ({ children }) => (
    <StyledTitle>{children}</StyledTitle>
);

export default SectionTitle;
