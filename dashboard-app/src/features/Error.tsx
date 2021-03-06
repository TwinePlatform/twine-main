import React from 'react';
import styled from 'styled-components';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Grid, Row } from 'react-flexbox-grid';
import { SpacingEnum } from '../lib/ui/design_system';
import { H1 as _H1, H3 } from '../lib/ui/components/Headings';
import _Link from './navigation/Navbar/Link';
import { PrimaryButton } from '../lib/ui/components/Buttons';


/*
 * Types
 */
interface Props extends RouteComponentProps {
  match: RouteComponentProps['match'] & {
    params: {
      code: string
    }
  };
}

interface ErrorText {
  title: string;
  subtitle: string;
  error: string;
}

/*
 * Helpers
 */
const errorTextOptions: { [k: string]: ErrorText } = {
  404: {
    title: 'Sorry, we cannot find this page.',
    subtitle: 'The page you are looking for has been moved or is temporarily unavailable',
    error: '(404 error)',
  },
  500: {
    title: 'Sorry, something went wrong.',
    subtitle:
      'We are experiencing something unexpected with our server right now. Please try again later.',
    error: '(500 error)',
  },
  default: {
    title: 'Sorry, something went wrong.',
    subtitle: 'We are experiencing an unexpected error.',
    error: '(UNKNOWN error)',
  },
};

const getErrorText = (code: string): ErrorText => {
  switch (code){
    case '404':
      return errorTextOptions[404];

    case '500':
      return errorTextOptions[500];

    default:
      return errorTextOptions.default;
  }
};

/*
 * Styles
 */
const H1 = styled(_H1)`
  margin-bottom: ${SpacingEnum.small};
`;

const H3Padded = styled(H3)`
  margin-bottom: ${SpacingEnum.small};
`;

const Link = styled(_Link)`
  margin-top: ${SpacingEnum.small};
  margin-bottom: ${SpacingEnum.small};
`;

/*
 * Components
 */
const Error: React.FunctionComponent<Props> = (props) => {
  const { params: { code } } = props.match;
  const { title, subtitle, error } = getErrorText(code);

  return (
  <Grid>
      <H1>{title}</H1>
      <H3Padded>{subtitle}</H3Padded>
      <H3>{error}</H3>
    <Row center={'xs'}>
      <Link to="/"><PrimaryButton>Go to Dashboard</PrimaryButton></Link>
    </Row>
    <Row center={'xs'}>
      <a href="mailto:powertochangetwine@gmail.com">Or report a problem</a>
    </Row>
  </Grid>
  );
};

export default withRouter(Error);
