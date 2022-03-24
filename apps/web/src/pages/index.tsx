import { NextPage } from 'next';
import TopLeftBlobRaw from 'src/icons/blobs/top-left.svg';
import styled from 'styled-components';

const TopLeftBlob = styled(TopLeftBlobRaw)`
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
`;

const HelloWorld = styled.h1`
    ${props => props.theme.text.title.lg.bold}
    text-transform: uppercase;
`;

const ContentWrapper = styled.div`
    margin: 95px 110px;
`;

const Home: NextPage = () => {
    const x = 1;

    return (
        <ContentWrapper>
            <HelloWorld>Hello World!</HelloWorld>
            <TopLeftBlob />
        </ContentWrapper>
    );
};

export default Home;
