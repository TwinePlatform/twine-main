import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { BirthYear } from '../../../shared/constants';
import LabelledInput from '../../../shared/components/form/LabelledInput';
import LabelledSelect from '../../../shared/components/form/LabelledSelect';
import { Form, FormSection, PrimaryButton } from '../../../shared/components/form/base';


const SubmitButton = styled(PrimaryButton)`
  height: 4em;
  width: 100%;
`;


const CreateAnonUserForm = props => (
  <Form className="SignupForm" onChange={props.handleChange} onSubmit={props.onSubmit}>
    <FormSection>
      <LabelledInput
        id="visitor-signup-fullname"
        label="Anonymous Account Name"
        name={'name'}
        type="text"
        autofocus="true"
        error={props.errors.name}
        required
      />
      <LabelledSelect
        id="visitor-signup-gender"
        label="Gender"
        name="gender"
        options={props.genders}
        error={props.errors.gender}
        required
      />
      <LabelledSelect
        id="visitor-signup-birthyear"
        label="Year of Birth"
        name="year"
        options={BirthYear.defaultOptionsList()}
        error={props.errors.year}
        required
      />
      <SubmitButton type="submit">CREATE</SubmitButton>
    </FormSection>
  </Form>
);


CreateAnonUserForm.propTypes = {
  name: PropTypes.string.isRequired,
  errors: PropTypes.object.isRequired, // eslint-disable-line
  genders: PropTypes.arrayOf(PropTypes.object).isRequired,
  handleChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};


export default CreateAnonUserForm;
