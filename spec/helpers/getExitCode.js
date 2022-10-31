import {spawn} from 'node:child_process';

(function(env) {
  async function getExitCode(name, args) {
    return new Promise(function (resolve, reject) {
      let stderr = ''
      const cmd = spawn(name, args)
      cmd.stderr.on('data', data => stderr += data)
      cmd.on('close', code => code === 0 ?
        resolve({code, stderr}) :
        reject(new Error(`Exited with code: ${code} and the stderr was ${stderr}`)))
    })
  }

  env.getExitCode = getExitCode

})(jasmine.getEnv());