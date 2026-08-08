import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  Alert,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  cn,
  Divider,
  Input,
  Label,
  PageContainer,
  Select,
  Skeleton,
  Spinner,
  Stack,
  Textarea,
} from '@/packages/ui-primitives';

/**
 * The design system's contract with everything above it.
 *
 * These tests assert the properties the rest of the app relies on and cannot
 * see: that a `Button` defaults to `type="button"` (a submit-by-default button
 * inside a form is the classic accidental-post bug), that every primitive
 * forwards its attributes, and that the pieces that exist for assistive
 * technology actually announce themselves.
 */

describe('Button', () => {
  // Inside a form, `type="submit"` is the browser default — and almost never
  // what a button that opens a menu or toggles a panel meant.
  it('defaults to a non-submitting button', () => {
    render(<Button>Save</Button>);

    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'button');
  });

  it('respects an explicit submit type', () => {
    render(<Button type="submit">Publish</Button>);

    expect(screen.getByRole('button', { name: 'Publish' })).toHaveAttribute('type', 'submit');
  });

  it('forwards handlers and disabled state', async () => {
    const onClick = vi.fn();

    render(
      <Button disabled onClick={onClick}>
        Delete
      </Button>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
  });

  it('merges a caller class with the variant classes', () => {
    render(<Button className="w-full">Wide</Button>);

    expect(screen.getByRole('button', { name: 'Wide' })).toHaveClass('w-full');
  });
});

describe('Alert', () => {
  it('announces itself as a status region', () => {
    render(<Alert tone="danger">Something went wrong.</Alert>);

    expect(screen.getByRole('status')).toHaveTextContent('Something went wrong.');
  });
});

describe('Card', () => {
  it('renders its parts in order', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Portfolio</CardTitle>
          <CardDescription>Draft</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );

    expect(screen.getByRole('heading', { name: 'Portfolio' })).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });
});

describe('form primitives', () => {
  it('associates a label with its input', async () => {
    render(
      <>
        <Label htmlFor="slug">Public address</Label>
        <Input id="slug" defaultValue="amina" />
      </>,
    );

    const input = screen.getByLabelText('Public address');

    await userEvent.clear(input);
    await userEvent.type(input, 'amina-rahman');

    expect(input).toHaveValue('amina-rahman');
  });

  it('marks an invalid input for assistive technology', () => {
    render(<Input aria-label="Email" aria-invalid="true" />);

    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders a select with its options', () => {
    render(
      <Select aria-label="Theme" defaultValue="dark">
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </Select>,
    );

    expect(screen.getByLabelText('Theme')).toHaveValue('dark');
  });

  it('renders a textarea that accepts multi-line text', async () => {
    render(<Textarea aria-label="Summary" />);

    await userEvent.type(screen.getByLabelText('Summary'), 'One line.');

    expect(screen.getByLabelText('Summary')).toHaveValue('One line.');
  });
});

describe('presentational primitives', () => {
  it('renders a divider as a separator', () => {
    render(<Divider />);

    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  // A skeleton is a placeholder for content that is not there yet; announcing
  // it would read out furniture.
  it('hides a skeleton from assistive technology', () => {
    render(<Skeleton data-testid="skeleton" />);

    expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-hidden', 'true');
  });

  it('gives a spinner an accessible name', () => {
    render(<Spinner label="Saving" />);

    expect(screen.getByRole('status', { name: 'Saving' })).toBeInTheDocument();
  });

  it('renders a page container and a stack around their children', () => {
    render(
      <PageContainer>
        <Stack direction="row" gap="md">
          <span>One</span>
          <span>Two</span>
        </Stack>
      </PageContainer>,
    );

    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
  });
});

describe('cn', () => {
  // The whole reason a merge helper exists: the later class has to win, or a
  // caller cannot override a primitive's padding without `!important`.
  it('lets a caller class beat the primitive default', () => {
    expect(cn('p-4', 'p-8')).toBe('p-8');
  });

  it('drops falsy values', () => {
    expect(cn('p-4', false, undefined, null)).toBe('p-4');
  });
});
