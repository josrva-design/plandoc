export async function onRequest(context) {
  const auth = context.request.headers.get('Authorization');
  const expectedPassword = context.env.TEST_PASS;

  if (!expectedPassword) {
    return context.next();
  }

  if (!auth || !auth.startsWith('Basic ')) {
    return new Response('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="PlanDoc Testeo"',
      },
    });
  }

  const credentials = atob(auth.slice(6));
  const [username, password] = credentials.split(':');

  if (password !== expectedPassword) {
    return new Response('Invalid credentials', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="PlanDoc Testeo"',
      },
    });
  }

  return context.next();
}
