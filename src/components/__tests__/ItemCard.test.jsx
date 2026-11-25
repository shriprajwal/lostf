import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ItemCard from '../ItemCard.jsx';

describe('ItemCard', () => {
  const sampleItem = {
    id: 'rep-1',
    title: 'Silver MacBook Air',
    description: 'Left in Room 304 after CS lecture.',
    category: 'Electronics',
    location: 'Academic Block B',
    status: 'Lost',
    reportType: 'Lost',
    collegeid: 'CS2024',
    contact: '9876543210',
    createdAt: '2026-11-10T10:00:00Z'
  };

  it('renders item title, location, category, and Lost status', () => {
    render(<ItemCard item={sampleItem} onSelect={vi.fn()} />);

    expect(screen.getByText('Silver MacBook Air')).toBeInTheDocument();
    expect(screen.getByText('Academic Block B')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Lost')).toBeInTheDocument();
  });

  it('calls onSelect when Details button is clicked', () => {
    const onSelect = vi.fn();
    render(<ItemCard item={sampleItem} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: /details/i }));
    expect(onSelect).toHaveBeenCalledWith(sampleItem);
  });

  it('shows owner edit, delete, and resolve controls when userCollegeId matches', () => {
    render(
      <ItemCard
        item={sampleItem}
        currentUser={{ uid: 'u1' }}
        userCollegeId="cs2024"
        onSelect={vi.fn()}
        onUserEdit={vi.fn()}
        onUserDelete={vi.fn()}
        onToggleResolve={vi.fn()}
      />
    );

    expect(screen.getByTitle('Edit my report')).toBeInTheDocument();
    expect(screen.getByTitle('Delete my report')).toBeInTheDocument();
    expect(screen.getByTitle('Mark as resolved')).toBeInTheDocument();
  });

  it('hides owner controls for non-owners', () => {
    render(
      <ItemCard
        item={sampleItem}
        currentUser={{ uid: 'u2' }}
        userCollegeId="OTHER99"
        onSelect={vi.fn()}
        onUserEdit={vi.fn()}
        onUserDelete={vi.fn()}
        onToggleResolve={vi.fn()}
      />
    );

    expect(screen.queryByTitle('Edit my report')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Delete my report')).not.toBeInTheDocument();
  });
});
