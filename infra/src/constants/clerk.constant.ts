export const CLERK_API = Object.freeze({
  BASE_URL: 'https://api.clerk.com/v1',
  USERS_PATH: '/users',
  PROFILE_IMAGE_SUFFIX: '/profile_image',
  IMAGE_FIELD_NAME: 'file',
  IMAGE_FILE_NAME: 'avatar.jpg',
  // Clerk caps the page size of GET /users at 500.
  MAX_PAGE_SIZE: 500,
  UNKNOWN_ERROR_CODE: 'unknown',
})
