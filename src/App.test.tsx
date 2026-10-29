import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock("./components/ReleasesList", () => () => <main>Techno Vinyls</main>);

test('renders the Techno Vinyls app', () => {
  render(<App />);
  expect(screen.getByRole("main")).toHaveTextContent("Techno Vinyls");
});
