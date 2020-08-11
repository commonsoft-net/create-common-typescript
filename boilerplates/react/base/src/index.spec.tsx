import React from 'react';
import { Hi } from './index';
import { shallow } from 'enzyme';

describe('Hi', () => {
  it('should render', () => {
    const component = shallow(<Hi />);
    expect(Hi).toBeDefined();
    expect(component).toBeDefined();
    const span = component.find('span');
    expect(span.length).toBe(1);
    expect(span.text()).toBe('Hi there!');
  });
});
