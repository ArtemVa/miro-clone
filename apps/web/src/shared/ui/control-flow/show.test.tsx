import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Show } from './show';

describe('Show', () => {
  it('рендерит children, когда when = true', () => {
    render(<Show when>контент</Show>);
    expect(screen.getByText('контент')).toBeInTheDocument();
  });

  it('рендерит fallback, когда when = false', () => {
    render(
      <Show when={false} fallback="заглушка">
        контент
      </Show>,
    );
    expect(screen.queryByText('контент')).not.toBeInTheDocument();
    expect(screen.getByText('заглушка')).toBeInTheDocument();
  });

  it('передаёт data в children-функцию', () => {
    render(
      <Show when data={{ name: 'Аня' }}>
        {(user) => user.name}
      </Show>,
    );
    expect(screen.getByText('Аня')).toBeInTheDocument();
  });
});
