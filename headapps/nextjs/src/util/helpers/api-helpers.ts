export const fetchApiHandler = async (endpoint: string, body: { [key: string]: string }) => {
  const response = await fetch(`${process.env.NEXTAUTH_URL}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'API request failed');
  }
  return response.json();
};
