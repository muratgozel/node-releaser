import commit from "./commit.js";
import push from "./push.js";

export default async function release(opts, command) {
  const result = await commit(opts, command)
  if (result === false) return false;

  await push(opts, command)
}