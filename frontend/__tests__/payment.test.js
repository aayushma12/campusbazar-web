import React from 'react';
import { render, screen } from '@testing-library/react';
import EsewaCheckoutForm from '@/components/payment/EsewaCheckoutForm';

const paymentData = {
  amount: '1000',
  tax_amount: '0',
  total_amount: '1000',
  transaction_uuid: 'txn-1',
  product_code: 'EPAYTEST',
  product_service_charge: '0',
  product_delivery_charge: '0',
  success_url: 'http://localhost/success',
  failure_url: 'http://localhost/failure',
  signed_field_names:
    'amount,tax_amount,total_amount,transaction_uuid,product_code,product_service_charge,product_delivery_charge,success_url,failure_url,signed_field_names',
  signature: 'sig-xyz',
};

describe('esewa payment form', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('renders hidden payment form and required fields', () => {
    render(<EsewaCheckoutForm paymentData={paymentData} />);

    expect(screen.getAllByDisplayValue('1000').length).toBeGreaterThan(0);
    expect(screen.getByDisplayValue('txn-1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('sig-xyz')).toBeInTheDocument();
  });

  test('auto-submits form after delay', () => {
    const submitSpy = jest.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {});

    render(<EsewaCheckoutForm paymentData={paymentData} />);
    jest.advanceTimersByTime(350);

    expect(submitSpy).toHaveBeenCalledTimes(1);
  });

  test('calls timeout callback after 8 seconds', () => {
    const onTimeout = jest.fn();
    render(<EsewaCheckoutForm paymentData={paymentData} onTimeout={onTimeout} />);

    jest.advanceTimersByTime(8000);

    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  test('cleans timers on unmount', () => {
    const onTimeout = jest.fn();
    const { unmount } = render(<EsewaCheckoutForm paymentData={paymentData} onTimeout={onTimeout} />);

    unmount();
    jest.advanceTimersByTime(9000);

    expect(onTimeout).not.toHaveBeenCalled();
  });

  test.failing('intentional failing demo: expects no submit after timer', () => {
    const submitSpy = jest.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {});

    render(<EsewaCheckoutForm paymentData={paymentData} />);
    jest.advanceTimersByTime(350);

    expect(submitSpy).not.toHaveBeenCalled();
  });
});
