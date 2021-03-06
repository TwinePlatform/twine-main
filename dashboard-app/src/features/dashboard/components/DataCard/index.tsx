import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { String, Arrays } from 'twine-util';
import { Paragraph, Bold } from '../../../../lib/ui/components/Typography';
import { ColoursEnum, Fonts } from '../../../../lib/ui/design_system';
import { TextTileProps, NumberTileProps, TileDataPoint } from './types';


/*
 * Styles
 */
const Grid = styled.div`
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 2fr 1.5fr 0.5fr 2fr;
  padding: 1rem;
`;

const TopTextContainer = styled.div`
  grid-column: span 2;
  text-align: left;
`;

const MiddleTopLeftContainer = styled.div`
  grid-area: 2 / 1 / 3 / 2;
  border-bottom: 0.5rem ${ColoursEnum.mustard} solid;
  align-self: end;
  text-align: left;
  line-height: 1.5rem;
`;

const MiddleTopRightContainer = styled.div`
  grid-area: 2 / 2 / 3 / 3;
  border-bottom: 0.5rem ${ColoursEnum.mustard} solid;
  align-self: end;
  text-align: right;
`;

const TextMiddleTopRightContainer = styled(MiddleTopRightContainer)`
  line-height: 1.2rem;
  padding-bottom: 0.3rem;
`;
const MiddleBottomRightContainer = styled.div`
  grid-area: 3 / 2 / 3 / 3;
  margin-top: 0.25rem;
  text-align: right;
`;

const BigText = styled(Paragraph)`
  font-size: ${Fonts.size.XL};
  font-weight: ${Fonts.weight.light};
`;

const BottomContainer = styled.div`
  grid-area: 4 / 1 / span 1 / span 2;
  text-align: left;
  align-self: end;
`;

/*
 * Helpers
 */
const alternateBold = (xs: string[], offset = 0) => (
  <Paragraph>
    {
      xs.map((x, i) =>
        (i + offset) % 2 === 0
          ? <Bold key={`bold_${x}`}>{x}</Bold>
          : x
      )
    }
  </Paragraph>
);

const truncateWords = (xs: string[], limit: number, truncationString: string) =>
  String.listify(Arrays.truncate(xs, limit, truncationString), { and: limit >= xs.length });

/*
 * Components
 */
const LeftContainer: FunctionComponent<TileDataPoint<string[]>> = (props) => {
  const { limit = Infinity, data, truncationString = '' } = props;
  return (
    <MiddleTopLeftContainer>
      <Paragraph>{props.label}</Paragraph>
      {alternateBold(truncateWords(data, limit, truncationString))}
    </MiddleTopLeftContainer>
  );
};

const NumberRightContainer: FunctionComponent<NumberTileProps['right']> = (props) => {
  return (
    <>
      <MiddleTopRightContainer>
        <BigText>{props.data}</BigText>
      </MiddleTopRightContainer>
      <MiddleBottomRightContainer>
        <Paragraph>{props.label}</Paragraph>
      </MiddleBottomRightContainer>
    </>
  );
};

const TextRightContainer: FunctionComponent<TextTileProps['right']> = (props) => {
  const { limit = Infinity, data, truncationString = '' } = props;
  const items = Arrays.truncate(data, limit, truncationString);
  return (
    <>
      <TextMiddleTopRightContainer>
        {items.map((x) => <Paragraph key={`right_${x}`}><Bold>{x}</Bold></Paragraph>)}
      </TextMiddleTopRightContainer>
      <MiddleBottomRightContainer>
        <Paragraph>{props.label}</Paragraph>
      </MiddleBottomRightContainer>
    </>
  );
};

const DataCard: FunctionComponent<NumberTileProps | TextTileProps> = (props) => {
  const { topText, left, bottomText, children } = props;
  return (
    <Grid>
      <TopTextContainer>
        {alternateBold(topText, 1)}
      </TopTextContainer>
      <LeftContainer {...left}/>
      {children}
      <BottomContainer>
        {bottomText && alternateBold(bottomText, 1)}
      </BottomContainer>
    </Grid>
  );
};

export const NumberDataCard: FunctionComponent<NumberTileProps> = (props) => {
  const { right } = props;
  return (
    <DataCard {...props} >
      <NumberRightContainer {...right}/>
    </DataCard>
  );
};

export const TextDataCard: FunctionComponent<TextTileProps> = (props) => {
  const { right } = props;
  return (
    <DataCard {...props} >
      <TextRightContainer {...right}/>
    </DataCard>
  );
};
