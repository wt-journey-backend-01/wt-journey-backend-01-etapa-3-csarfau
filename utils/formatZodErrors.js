export function formatZodErrors(err) {
  const errors = {};
  err.issues.forEach((e) => {
    if (e.code === 'unrecognized_keys') {
      errors['body'] = `Campo(s) não permitido(s) no body: ${e.keys.join(', ')}`;
    } else {
      errors[e.path[0]] = e.message;
    }
  });
  return errors;
}
