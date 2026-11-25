import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ItemModal from '../ItemModal.jsx';

describe('ItemModal', () => {
  const sampleItem = {
    id: 'rep-1',
    title: 'Blue Wallet',
    description: 'Contains student ID card.',
    category: 'Documents',
    location: 'Student Cafeteria',
    status: 'Lost',
    reportType: 'Lost',
    collegeid: 'CS2024',
    contact: '9876543210',
    createdAt: '2026-11-10T10:00:00Z'
  };

  it('shows contact gate for unauthenticated guests', () => {
    const onRequireAuth = vi.fn();
    render(
      <ItemModal
        item={sampleItem}
        currentUser={null}
        onClose={vi.fn()}
        onRequireAuth={onRequireAuth}
      />
    );

    expect(screen.getByText(/sign in required to contact owner/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /sign in to reveal & connect/i }));
    expect(onRequireAuth).toHaveBeenCalled();
  });

  it('reveals contact details when authenticated', () => {
    render(
      <ItemModal
        item={sampleItem}
        currentUser={{ uid: 'u1' }}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('9876543210')).toBeInTheDocument();
  });

  it('closes when Escape key is pressed and renders smart matches', () => {
    const onClose = vi.fn();
    const onSelectMatch = vi.fn();
    const foundMatch = {
      id: 'rep-2',
      title: 'Found Blue Wallet',
      description: 'Found in Cafeteria',
      category: 'Documents',
      location: 'Student Cafeteria',
      status: 'Found',
      reportType: 'Found'
    };

    render(
      <ItemModal
        item={sampleItem}
        allReports={[sampleItem, foundMatch]}
        currentUser={{ uid: 'u1' }}
        onClose={onClose}
        onSelectMatch={onSelectMatch}
      />
    );

    expect(screen.getByText(/smart potential found matches/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Found Blue Wallet'));
    expect(onSelectMatch).toHaveBeenCalledWith(foundMatch);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
