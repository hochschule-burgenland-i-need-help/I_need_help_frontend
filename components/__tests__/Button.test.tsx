import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import Button from '../Button';

describe('Button Component', () => {
    it('renders with label', () => {
        const { getByText } = render(<Button label="Test Button" />);
        expect(getByText('Test Button')).toBeTruthy();
    });

    it('calls onPress when pressed and not disabled', () => {
        const onPressMock = jest.fn();
        const { getByText } = render(<Button label="Press me" onPress={onPressMock} />);
        fireEvent.press(getByText('Press me'));
        expect(onPressMock).toHaveBeenCalled();
    });

    it('does not call onPress when disabled', () => {
        const onPressMock = jest.fn();
        const { getByText } = render(<Button label="Can't click" onPress={onPressMock} disabled={true} />);
        fireEvent.press(getByText("Can't click"));
        expect(onPressMock).not.toHaveBeenCalled();
    });

    it('applies primary theme styles by default', () => {
        const { getByText } = render(<Button label="Primary" />);
        const label = getByText('Primary');
        expect(label.props.style).toEqual(expect.arrayContaining([expect.objectContaining({ color: '#fff' })]));
    });

    it('applies secondary theme styles', () => {
        const { getByText } = render(<Button label="Secondary" theme="secondary" />);
        const label = getByText('Secondary');
        expect(label.props.style).toEqual(expect.arrayContaining([expect.objectContaining({ color: '#444' })]));
    });

    it('applies third theme styles', () => {
        const { getByText } = render(<Button label="Third" theme="third" />);
        const label = getByText('Third');
        expect(label.props.style).toEqual(expect.arrayContaining([expect.objectContaining({ color: '#fff' })]));
    });

    it('applies fourth theme styles', () => {
        const { getByText } = render(<Button label="Fourth" theme="fourth" />);
        const label = getByText('Fourth');
        expect(label.props.style).toEqual(expect.arrayContaining([expect.objectContaining({ color: '#444' })]));
    });

    it('applies sos theme styles', () => {
        const { getByText } = render(<Button label="SOS" theme="sos" />);
        const label = getByText('SOS');
        expect(label.props.style).toEqual(expect.arrayContaining([expect.objectContaining({ color: '#fff' })]));
    });

    it('applies disabled style when disabled', () => {
        const { getByText } = render(<Button label="Disabled" disabled={true} />);
        const label = getByText('Disabled');
        expect(label.props.style).toEqual(expect.arrayContaining([expect.objectContaining({ color: '#888' })]));
    });
});
