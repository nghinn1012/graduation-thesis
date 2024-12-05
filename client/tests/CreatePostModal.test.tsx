// import { render } from '@testing-library/react';
// import '@testing-library/jest-dom';

// import '@testing-library/jest-dom/extend-expect';
// import CreatePostModal from '../src/components/posts/CreatePostModal';
// import React from 'react';
// import renderer from 'react-test-renderer';
// import { describe, expect, it, jest } from '@jest/globals';
// import '@testing-library/jest-dom';

// jest.mock('../../hooks/useI18nContext', () => ({
//   useI18nContext: () => ({
//     of: (key: string) => key
//   })
// }));

// jest.mock('../../hooks/useToastContext', () => ({
//   useToastContext: () => ({
//     success: jest.fn(),
//     error: jest.fn()
//   })
// }));

// jest.mock('browser-image-compression', () => ({
//   __esModule: true,
//   default: jest.fn().mockImplementation(() => Promise.resolve(new Blob()))
// }));

// const defaultProps = {
//   isOpen: true,
//   onClose: jest.fn(),
//   onSubmit: jest.fn(),
//   isSubmitting: false,
//   isEditing: false,
//   post: null
// };

// describe('CreatePostModal', () => {
//   it('should render nothing when isOpen is false', () => {
//     const { container } = render(
//       <CreatePostModal {...defaultProps} isOpen={false} />
//     );
//     expect(container.firstChild).toBeNull();
//   });

//   it('should render modal when isOpen is true', () => {
//     const { getByRole } = render(
//       <CreatePostModal {...defaultProps} />
//     );
//     expect(getByRole('tablist')).toBeInTheDocument();
//   });

//   it('should render with edit mode props', () => {
//     const mockPost = {
//       id: '1',
//       title: 'Test Recipe',
//       about: 'Test description',
//       images: ['test.jpg'],
//       hashtags: ['test'],
//       timeToTake: 30,
//       servings: 4,
//       ingredients: [{ name: 'test', quantity: '1' }],
//       instructions: [{ description: 'test' }],
//       difficulty: 'easy',
//       course: ['main'],
//       dietary: ['vegetarian'],
//       hasProduct: false
//     };

//     const { getByDisplayValue } = render(
//       <CreatePostModal
//         {...defaultProps}
//         isEditing={true}
//         post={mockPost}
//       />
//     );
//     expect(getByDisplayValue('Test Recipe')).toBeInTheDocument();
//   });
// });
