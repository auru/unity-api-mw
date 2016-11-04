export function isAPIError(error) {
    return (error instanceof Error) && error.name === 'APIError';
}