import check from "./check.js";

export default async function docker(opts, command) {
  await check(opts, command)
}