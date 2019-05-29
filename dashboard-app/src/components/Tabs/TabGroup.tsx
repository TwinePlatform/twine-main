import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { TabList } from './TabList';
import { Tab } from './Tab';


/**
 * Types
 */
type TabProps = {
  titles: string[]
  initialActiveTab?: number
};

/**
 * Styles
 */
const TabContainer = styled.div``;

export const TabGroup: React.FunctionComponent<TabProps> = (props) => {
  const [activeTab, setActiveTab] = useState(0);

  const onClickTab = useCallback(setActiveTab, []);

  const children = React.Children.map(props.children, (child, idx) => (
    <Tab isActive={idx === activeTab} idx={idx}>
      {child}
    </Tab>
  ));

  return (
    <TabContainer>
      <TabList
        items={props.titles}
        activeTab={activeTab}
        onClickTab={onClickTab}
      />
      {children}
    </TabContainer>
  );
};
