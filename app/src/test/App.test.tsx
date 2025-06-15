import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App', () => {
  it('アプリタイトルが表示される', () => {
    render(<App />);
    expect(
      screen.getByText('GitHub Organization 課金可視化')
    ).toBeInTheDocument();
  });

  it('ダッシュボードが表示される', () => {
    render(<App />);
    expect(
      screen.getByText('課金データ可視化ダッシュボード')
    ).toBeInTheDocument();
  });
});
