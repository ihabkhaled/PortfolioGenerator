import { describe, expect, it } from 'vitest';

import {
  toAdminManagedUser,
  toAdminManagedUserDetail,
  toAdminManagedUserPortfolio,
} from '../mappers/admin-user.mapper';

describe('toAdminManagedUser', () => {
  it('casts the raw status and carries the portfolio count through', () => {
    const createdAt = new Date('2024-01-15T00:00:00.000Z');

    expect(
      toAdminManagedUser({
        id: 'user-1',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        emailVerified: true,
        status: 'ACTIVE',
        createdAt,
        portfolioCount: 3,
      }),
    ).toEqual({
      id: 'user-1',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      emailVerified: true,
      status: 'ACTIVE',
      portfolioCount: 3,
      createdAt,
    });
  });
});

describe('toAdminManagedUserDetail', () => {
  it('maps every field the profile card needs', () => {
    const createdAt = new Date('2023-06-01T00:00:00.000Z');

    expect(
      toAdminManagedUserDetail({
        id: 'user-2',
        name: 'Grace Hopper',
        email: 'grace@example.com',
        emailVerified: false,
        status: 'SUSPENDED',
        createdAt,
      }),
    ).toEqual({
      id: 'user-2',
      name: 'Grace Hopper',
      email: 'grace@example.com',
      emailVerified: false,
      status: 'SUSPENDED',
      createdAt,
    });
  });
});

describe('toAdminManagedUserPortfolio', () => {
  it('derives isSuspended from a non-null suspendedAt', () => {
    const publishedAt = new Date('2024-03-01T00:00:00.000Z');
    const updatedAt = new Date('2024-03-02T00:00:00.000Z');
    const suspendedAt = new Date('2024-03-03T00:00:00.000Z');

    expect(
      toAdminManagedUserPortfolio({
        id: 'portfolio-1',
        slug: 'ada',
        status: 'PUBLISHED',
        publishedAt,
        suspendedAt,
        updatedAt,
      }),
    ).toEqual({
      id: 'portfolio-1',
      slug: 'ada',
      status: 'PUBLISHED',
      isSuspended: true,
      publishedAt,
      updatedAt,
    });
  });

  it('reports isSuspended as false when suspendedAt is null', () => {
    const updatedAt = new Date('2024-04-01T00:00:00.000Z');

    expect(
      toAdminManagedUserPortfolio({
        id: 'portfolio-2',
        slug: 'grace',
        status: 'DRAFT',
        publishedAt: null,
        suspendedAt: null,
        updatedAt,
      }),
    ).toEqual({
      id: 'portfolio-2',
      slug: 'grace',
      status: 'DRAFT',
      isSuspended: false,
      publishedAt: null,
      updatedAt,
    });
  });
});
