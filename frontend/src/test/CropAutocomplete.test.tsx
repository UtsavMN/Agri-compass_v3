import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CropAutocomplete } from '@/components/farm/CropAutocomplete';

describe('CropAutocomplete Component', () => {
  it('renders input with placeholder and initial value', () => {
    const handleChange = vi.fn();
    render(<CropAutocomplete value="Ragi (Finger Millet)" onChange={handleChange} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('Ragi (Finger Millet)');
  });

  it('displays popular crops when focused with empty input', () => {
    const handleChange = vi.fn();
    render(<CropAutocomplete value="" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);

    expect(screen.getByText('Popular Crops to Cultivate')).toBeInTheDocument();
    expect(screen.getByText('Rice (Paddy)')).toBeInTheDocument();
    expect(screen.getByText('Ragi (Finger Millet)')).toBeInTheDocument();
  });

  it('searches case-insensitively for lowercase "ragi"', () => {
    const handleChange = vi.fn();
    render(<CropAutocomplete value="" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'ragi' } });

    expect(screen.getByText('Matching Crops (Case-Insensitive)')).toBeInTheDocument();
    expect(screen.getByText('Ragi (Finger Millet)')).toBeInTheDocument();
  });

  it('searches case-insensitively for uppercase "RAGI"', () => {
    const handleChange = vi.fn();
    render(<CropAutocomplete value="" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'RAGI' } });

    expect(screen.getByText('Matching Crops (Case-Insensitive)')).toBeInTheDocument();
    expect(screen.getByText('Ragi (Finger Millet)')).toBeInTheDocument();
  });

  it('searches case-insensitively for partial prefix "ra" and never displays UNKNOWN', () => {
    const handleChange = vi.fn();
    render(<CropAutocomplete value="" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'ra' } });

    expect(screen.getByText('Ragi (Finger Millet)')).toBeInTheDocument();

    // Verify "UNKNOWN" is never rendered in subtitles
    const unknownElements = screen.queryAllByText(/UNKNOWN/i);
    expect(unknownElements.length).toBe(0);
  });

  it('calls onChange with clean crop name when a crop is clicked', () => {
    const handleChange = vi.fn();
    render(<CropAutocomplete value="" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'maize' } });

    const cropOption = screen.getByText('Maize (Corn)');
    fireEvent.click(cropOption);

    expect(handleChange).toHaveBeenCalledWith('Maize (Corn)');
    expect((input as HTMLInputElement).value).toBe('Maize (Corn)');
  });

  it('allows clearing the input via the clear button', () => {
    const handleChange = vi.fn();
    render(<CropAutocomplete value="Cotton" onChange={handleChange} />);

    const clearButton = screen.getByTitle('Clear crop');
    fireEvent.click(clearButton);

    expect(handleChange).toHaveBeenCalledWith('');
  });

  it('supports custom crop names and allows selecting them', () => {
    const handleChange = vi.fn();
    render(<CropAutocomplete value="" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Dragon Fruit' } });

    expect(handleChange).toHaveBeenCalledWith('Dragon Fruit');
    const customOption = screen.getByText(/Use custom crop:/);
    fireEvent.click(customOption);

    expect(handleChange).toHaveBeenCalledWith('Dragon Fruit');
  });
});
