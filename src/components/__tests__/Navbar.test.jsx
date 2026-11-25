import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '../Navbar.jsx';

describe('Navbar', () => {
  it('renders brand name and Sign In button for guests', () => {
    const setCurrentTab = vi.fn();
    render(
      <Navbar
        currentTab="home"
        setCurrentTab={setCurrentTab}
        user={null}
        profile={null}
        isSuperAdmin={false}
        onLogout={vi.fn()}
      />
    );

    expect(screen.getByText('Lostfusion')).toBeInTheDocument();
    const signInBtns = screen.getAllByRole('button', { name: /sign in/i });
    fireEvent.click(signInBtns[0]);
    expect(setCurrentTab).toHaveBeenCalledWith('auth');
  });

  it('shows Admin Console button for super admin', () => {
    render(
      <Navbar
        currentTab="home"
        setCurrentTab={vi.fn()}
        user={null}
        profile={null}
        isSuperAdmin={true}
        onLogout={vi.fn()}
      />
    );

    expect(screen.getByText('SUPER ADMIN')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /admin console/i })).toBeInTheDocument();
  });
});
