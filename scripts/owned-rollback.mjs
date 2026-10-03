export async function assertOwned(read, owned) {
  const current = await read();
  if (current.length !== owned.length || current.some((value, index) => value !== owned[index])) {
    const error = new Error('Source changed outside this repair; preserving concurrent edits');
    error.code = 'STALE_SOURCE';
    throw error;
  }
}

export async function rollbackOwned(read, write, owned, original) {
  if (!owned) return;
  await assertOwned(read, owned);
  await write(original);
}
