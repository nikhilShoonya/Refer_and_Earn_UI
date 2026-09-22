import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet } from 'react-native';

import {
  CalendarSheet,
  DayRange,
  MONTHS_RENDERED,
} from '../features/referAndEarn/sheets/CalendarSheet';

function renderCalendar(onSelect = jest.fn(), onClose = jest.fn()) {
  return {
    onSelect,
    onClose,
    mount: () =>
      render(<CalendarSheet visible onClose={onClose} onSelect={onSelect} initial={null} />),
  };
}

const dismiss = () => fireEvent.press(screen.getByLabelText('Close calendar'));

/** Date-range picker behind the "Filter by Date" drawer. */
describe('CalendarSheet', () => {
  // The grid opens on the current month, so pin the clock — otherwise these
  // assertions would only hold during September 2026.
  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
    jest.setSystemTime(new Date(2026, 8, 15));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders a full six-week grid for every month in the scroller', async () => {
    const { mount } = renderCalendar();
    await mount();

    // 6 rows x 7 days per month, so surrounding months pad each view.
    const days = screen.getAllByRole('button').filter((b) => {
      const label = b.props.accessibilityLabel ?? '';
      return /^\w{3} \w{3} \d{2} \d{4}$/.test(label);
    });
    expect(days).toHaveLength(42 * MONTHS_RENDERED);
  });

  it('scrolls through months instead of paging with arrows', async () => {
    const { mount } = renderCalendar();
    await mount();

    // Figma draws no month arrows — a scrollbar down the card edge instead.
    expect(screen.queryByLabelText('Previous month')).toBeNull();
    expect(screen.queryByLabelText('Next month')).toBeNull();

    // The window is centred on the current month (mocked to September 2026).
    expect(screen.getByText('September')).toBeTruthy();
    expect(screen.getByText('March')).toBeTruthy();
    expect(screen.getByText('October')).toBeTruthy();
    expect(screen.queryByText('February')).toBeNull();
    expect(screen.queryByText('November')).toBeNull();
  });

  it('stays open after the second pick so the range can be seen', async () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();
    const { mount } = renderCalendar(onSelect, onClose);
    await mount();

    await fireEvent.press(screen.getByLabelText('Tue Sep 08 2026'));
    await fireEvent.press(screen.getByLabelText('Fri Sep 18 2026'));

    // Closing the picker on the second tap hid the range the user just made.
    expect(onClose).not.toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByText('September')).toBeTruthy();
  });

  it('paints start, middle and end once both ends are picked', async () => {
    const { mount } = renderCalendar();
    await mount();

    await fireEvent.press(screen.getByLabelText('Tue Sep 08 2026'));
    await fireEvent.press(screen.getByLabelText('Fri Sep 18 2026'));

    const bg = (label: string) =>
      StyleSheet.flatten(screen.getByLabelText(label).props.style).backgroundColor;
    const border = (label: string) =>
      StyleSheet.flatten(screen.getByLabelText(label).props.style).borderColor;

    expect(bg('Tue Sep 08 2026')).toBe('#EFA145'); // start, filled
    expect(bg('Thu Sep 10 2026')).toBe('#FEE1BA'); // between
    expect(border('Fri Sep 18 2026')).toBe('#EFA145'); // end, outlined
    expect(bg('Sat Sep 19 2026')).toBeUndefined(); // outside the range
  });

  it('reports the range when dismissed by tapping outside', async () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();
    const { mount } = renderCalendar(onSelect, onClose);
    await mount();

    await fireEvent.press(screen.getByLabelText('Tue Sep 08 2026'));
    await fireEvent.press(screen.getByLabelText('Fri Sep 18 2026'));
    await dismiss();

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledTimes(1);

    const range: DayRange = onSelect.mock.calls[0][0];
    expect(range.from.getDate()).toBe(8);
    expect(range.to?.getDate()).toBe(18);
  });

  it('restarts the range when the second pick is earlier than the first', async () => {
    const onSelect = jest.fn();
    const { mount } = renderCalendar(onSelect);
    await mount();

    await fireEvent.press(screen.getByLabelText('Fri Sep 18 2026'));
    await fireEvent.press(screen.getByLabelText('Tue Sep 08 2026'));
    await fireEvent.press(screen.getByLabelText('Sat Sep 19 2026'));
    await dismiss();

    // The earlier date became a new start rather than an invalid backwards range.
    const range: DayRange = onSelect.mock.calls[0][0];
    expect(range.from.getDate()).toBe(8);
    expect(range.to?.getDate()).toBe(19);
  });

  it('a third pick starts a fresh range', async () => {
    const onSelect = jest.fn();
    const { mount } = renderCalendar(onSelect);
    await mount();

    await fireEvent.press(screen.getByLabelText('Tue Sep 08 2026'));
    await fireEvent.press(screen.getByLabelText('Fri Sep 18 2026'));
    await fireEvent.press(screen.getByLabelText('Wed Sep 23 2026'));
    await dismiss();

    const range: DayRange = onSelect.mock.calls[0][0];
    expect(range.from.getDate()).toBe(23);
    expect(range.to).toBeNull();
  });

});
